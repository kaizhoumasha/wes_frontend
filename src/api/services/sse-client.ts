/**
 * SSE (Server-Sent Events) 客户端服务
 *
 * 连接后端 SSE 端点 /api/v1/sys/events/stream
 * 处理实时事件推送，包括系统通知和业务状态更新
 */

import { env } from '@/config/env'
import { getAccessToken } from './token-refresh'

// ==================== 类型定义 ====================

/**
 * SSE 事件类型
 */
export type SSEEventType =
  | 'system_notification' // 系统通知
  | 'device_status' // 设备状态变化
  | 'workline_status' // 作业线状态变化
  | 'task_update' // 任务更新
  | 'message' // 通用消息事件

/**
 * SSE 事件数据接口
 */
export interface SSEEvent {
  /** 事件类型 */
  type: SSEEventType
  /** 事件数据（JSON 字符串解析后的对象） */
  data: unknown
  /** 事件 ID（用于断线重连） */
  id?: string
  /** 原始 MessageEvent */
  original: MessageEvent
}

/**
 * SSE 事件监听器
 */
export type SSEEventListener = (event: SSEEvent) => void

/**
 * SSE 连接状态
 */
export type SSEConnectionState =
  | 'disconnected' // 未连接
  | 'connecting' // 连接中
  | 'connected' // 已连接
  | 'error' // 错误
  | 'closed' // 已关闭

// ==================== 状态管理 ====================

/** EventSource 实例 */
let eventSource: EventSource | null = null

/** 当前连接状态 */
let connectionState: SSEConnectionState = 'disconnected'

/** 事件监听器映射 */
const listeners: Map<SSEEventType, Set<SSEEventListener>> = new Map()

/** 错误监听器 */
const errorListeners: Set<(error: Event) => void> = new Set()

/** 状态变化监听器 */
const stateListeners: Set<(state: SSEConnectionState) => void> = new Set()

/** 重连定时器 */
let reconnectTimer: ReturnType<typeof setTimeout> | null = null

/** 重连次数 */
let reconnectAttempts = 0

/** 最大重连次数 */
const MAX_RECONNECT_ATTEMPTS = 10

/** 重连延迟（毫秒） */
const RECONNECT_DELAY = 3000

// ==================== 内部方法 ====================

/**
 * 更新连接状态
 */
function setConnectionState(state: SSEConnectionState): void {
  if (connectionState !== state) {
    connectionState = state
    stateListeners.forEach(listener => listener(state))
  }
}

/**
 * 解析 SSE 事件数据
 */
function parseEventData(messageEvent: MessageEvent): SSEEvent {
  // 尝试解析 data 字段为 JSON
  let data: unknown
  try {
    data = messageEvent.data ? JSON.parse(messageEvent.data) : null
  } catch {
    // 如果不是 JSON，直接使用原始字符串
    data = messageEvent.data
  }

  // 从 event 字段获取事件类型（SSE 标准使用 event 字段）
  const eventType = (messageEvent as MessageEvent & { event?: string }).event || 'message'

  return {
    type: eventType as SSEEventType,
    data,
    id: messageEvent.lastEventId || undefined,
    original: messageEvent
  }
}

/**
 * 触发事件监听器
 */
function emitEvent(event: SSEEvent): void {
  const eventListeners = listeners.get(event.type)
  if (eventListeners) {
    eventListeners.forEach(listener => {
      try {
        listener(event)
      } catch (error) {
        console.error(`[SSE] 事件监听器错误 (${event.type}):`, error)
      }
    })
  }

  // 同时触发 message 事件（通用监听器）
  const messageListeners = listeners.get('message')
  if (messageListeners && event.type !== 'message') {
    messageListeners.forEach(listener => {
      try {
        listener(event)
      } catch (error) {
        console.error('[SSE] message 事件监听器错误:', error)
      }
    })
  }
}

/**
 * 处理连接打开
 */
function handleOpen(): void {
  setConnectionState('connected')
  reconnectAttempts = 0
  console.log('[SSE] 连接已建立')
}

/**
 * 处理接收消息
 */
function handleMessage(messageEvent: MessageEvent): void {
  const event = parseEventData(messageEvent)
  emitEvent(event)
}

/**
 * 处理连接错误
 */
function handleError(errorEvent: Event): void {
  console.error('[SSE] 连接错误:', errorEvent)
  setConnectionState('error')

  // 通知所有错误监听器
  errorListeners.forEach(listener => {
    try {
      listener(errorEvent)
    } catch (err) {
      console.error('[SSE] 错误监听器异常:', err)
    }
  })

  // EventSource 会在错误后自动尝试重连（浏览器原生行为）
  // 我们只需要在达到最大重连次数后停止
}

// ==================== 公共 API ====================

/**
 * 连接 SSE 端点
 */
export function connect(): void {
  // 如果已连接，先断开
  if (eventSource) {
    disconnect()
  }

  setConnectionState('connecting')

  // 构建 SSE URL
  const url = new URL(env.sseUrl)

  // 如果有 Token，添加为查询参数（因为 EventSource 不支持自定义请求头）
  const token = getAccessToken()
  if (token) {
    url.searchParams.set('token', token)
  }

  // 创建 EventSource 实例
  eventSource = new EventSource(url.toString())

  // 注册事件处理
  eventSource.onopen = handleOpen
  eventSource.onmessage = handleMessage
  eventSource.onerror = handleError

  console.log('[SSE] 正在连接...', url.toString())
}

/**
 * 断开 SSE 连接
 */
export function disconnect(): void {
  if (eventSource) {
    eventSource.close()
    eventSource = null
  }

  // 清除重连定时器
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }

  reconnectAttempts = 0
  setConnectionState('disconnected')
  console.log('[SSE] 连接已断开')
}

/**
 * 添加事件监听器
 * @param eventType 事件类型
 * @param listener 监听器函数
 * @returns 清理函数（调用可移除监听器）
 */
export function addEventListener(eventType: SSEEventType, listener: SSEEventListener): () => void {
  if (!listeners.has(eventType)) {
    listeners.set(eventType, new Set())
  }

  listeners.get(eventType)!.add(listener)

  // 返回清理函数
  return () => {
    removeEventListener(eventType, listener)
  }
}

/**
 * 移除事件监听器
 * @param eventType 事件类型
 * @param listener 监听器函数
 */
export function removeEventListener(eventType: SSEEventType, listener: SSEEventListener): void {
  const eventListeners = listeners.get(eventType)
  if (eventListeners) {
    eventListeners.delete(listener)

    // 如果该类型没有监听器了，删除 Set
    if (eventListeners.size === 0) {
      listeners.delete(eventType)
    }
  }
}

/**
 * 添加错误监听器
 * @param listener 错误监听器函数
 * @returns 清理函数
 */
export function addErrorListener(listener: (error: Event) => void): () => void {
  errorListeners.add(listener)
  return () => {
    errorListeners.delete(listener)
  }
}

/**
 * 移除错误监听器
 * @param listener 错误监听器函数
 */
export function removeErrorListener(listener: (error: Event) => void): void {
  errorListeners.delete(listener)
}

/**
 * 添加状态变化监听器
 * @param listener 状态监听器函数
 * @returns 清理函数
 */
export function addStateListener(listener: (state: SSEConnectionState) => void): () => void {
  listener(connectionState) // 立即触发一次，返回当前状态
  stateListeners.add(listener)
  return () => {
    stateListeners.delete(listener)
  }
}

/**
 * 移除状态变化监听器
 * @param listener 状态监听器函数
 */
export function removeStateListener(listener: (state: SSEConnectionState) => void): void {
  stateListeners.delete(listener)
}

/**
 * 获取当前连接状态
 * @returns 连接状态
 */
export function getConnectionState(): SSEConnectionState {
  return connectionState
}

/**
 * 检查是否已连接
 * @returns 是否已连接
 */
export function isConnected(): boolean {
  return connectionState === 'connected'
}

/**
 * 获取 SSE 端点 URL
 * @returns SSE URL
 */
export function getSSEUrl(): string {
  return env.sseUrl
}

// ==================== 导出工具函数 ====================

/**
 * 创建自动重连的 SSE 连接
 * @param autoReconnect 是否自动重连（默认 true）
 * @returns 清理函数
 */
export function createAutoReconnectingSSE(autoReconnect = true): () => void {
  connect()

  if (!autoReconnect) {
    return disconnect
  }

  // 监听连接状态，在断开时重连
  const cleanupStateListener = addStateListener(state => {
    if (state === 'disconnected' || state === 'error') {
      // 如果达到最大重连次数，不再重连
      if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        console.error('[SSE] 达到最大重连次数，停止重连')
        return
      }

      // 延迟重连
      reconnectTimer = setTimeout(() => {
        reconnectAttempts++
        console.log(`[SSE] 尝试重连 (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`)
        connect()
      }, RECONNECT_DELAY)
    }
  })

  // 返回清理函数
  return () => {
    cleanupStateListener()
    disconnect()
  }
}

/**
 * SSE 组合式函数（Vue 3）
 * 提供响应式的 SSE 连接状态和事件订阅
 *
 * @example
 * ```ts
 * import { useSSE } from '@/api/services/sse-client'
 *
 * const { state, isConnected, on, connect, disconnect } = useSSE()
 *
 * // 订阅设备状态变化
 * on('device_status', (event) => {
 *   console.log('设备状态变化:', event.data)
 * })
 *
 * // 连接
 * connect()
 * ```
 */
export function useSSE() {
  // 这个函数需要在 Vue 组件中使用时导入 Vue 的响应式 API
  // 为了保持服务层纯净，这里只返回响应式状态包装器
  // 实际使用时可以配合 VueUse 的 useEventSource 或自行封装

  return {
    /** 连接 */
    connect,
    /** 断开 */
    disconnect,
    /** 订阅事件 */
    on: addEventListener,
    /** 取消订阅 */
    off: removeEventListener,
    /** 订阅错误 */
    onError: addErrorListener,
    /** 订阅状态变化 */
    onStateChange: addStateListener,
    /** 获取连接状态 */
    getState: getConnectionState,
    /** 是否已连接 */
    isConnected,
    /** 获取 SSE URL */
    getUrl: getSSEUrl
  }
}
