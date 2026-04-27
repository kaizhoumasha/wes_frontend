/**
 * SSE (Server-Sent Events) 客户端服务
 *
 * 连接后端 SSE 端点 /api/v1/sys/events/stream
 * 处理实时事件推送，包括系统通知和业务状态更新
 */

import { env } from '@/config/env'
import { getLastSSEEventId, resetSSESessionState, setLastSSEEventId } from './sse-session'
import { getAccessToken } from './token-refresh'

// ==================== 类型定义 ====================

/**
 * SSE 事件类型
 */
export type SSEEventType =
  | 'system_notification' // 系统通知
  | 'business_status' // 业务状态变化
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

/** fetch 流连接控制器 */
let abortController: AbortController | null = null

/** 是否为手动断开 */
let manualDisconnect = false

/** 当前连接状态 */
let connectionState: SSEConnectionState = 'disconnected'

const CUSTOM_EVENTS: SSEEventType[] = ['system_notification', 'business_status']

const LISTENER_EVENT_TYPES: SSEEventType[] = [...CUSTOM_EVENTS, 'message']

/** 事件监听器映射 */
const listeners: Map<SSEEventType, Set<SSEEventListener>> = new Map(
  LISTENER_EVENT_TYPES.map(eventType => [eventType, new Set<SSEEventListener>()] as const)
)

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
const SSE_API_PREFIX = '/api/v1'
const DEFAULT_SSE_PATH = `${SSE_API_PREFIX}/sys/events/stream`
const DEFAULT_SSE_URL = `http://localhost:8001${DEFAULT_SSE_PATH}`
const LEGACY_SSE_PATH = `${SSE_API_PREFIX}/events/stream`

function clearReconnectTimer(): void {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
}

function normalizeSSEUrl(url: string): string {
  if (!url) {
    return DEFAULT_SSE_PATH
  }

  if (url === LEGACY_SSE_PATH) {
    return DEFAULT_SSE_PATH
  }

  if (url.endsWith(LEGACY_SSE_PATH)) {
    return `${url.slice(0, -LEGACY_SSE_PATH.length)}${DEFAULT_SSE_PATH}`
  }

  return url
}

function resolveSSEUrl(): string {
  const raw = normalizeSSEUrl(env.sseUrl ?? DEFAULT_SSE_URL)

  if (/^https?:\/\//.test(raw)) {
    return raw
  }

  const base = typeof window !== 'undefined' && window.location?.origin
    ? window.location.origin
    : 'http://localhost:8001'

  return new URL(raw || DEFAULT_SSE_PATH, base).toString()
}

function sanitizeSSELogUrl(url: string): string {
  const parsedUrl = new URL(url)
  parsedUrl.search = ''
  return parsedUrl.toString()
}

function createSSEHeaders(token: string): HeadersInit {
  const lastEventId = getLastSSEEventId()
  return {
    Accept: 'text/event-stream',
    Authorization: `Bearer ${token}`,
    'Cache-Control': 'no-cache',
    ...(lastEventId ? { 'Last-Event-ID': lastEventId } : {})
  }
}

function createSSEErrorEvent(): Event {
  return new Event('error')
}

function isCustomSSEEventType(value: string): value is Exclude<SSEEventType, 'message'> {
  return CUSTOM_EVENTS.includes(value as Exclude<SSEEventType, 'message'>)
}

function parseSSEBlock(block: string): { type: SSEEventType; data: string; id?: string } | null {
  if (!block) {
    return null
  }

  let eventType: SSEEventType = 'message'
  const dataLines: string[] = []
  let eventId: string | undefined

  for (const line of block.split('\n')) {
    if (!line || line.startsWith(':')) {
      continue
    }

    const separatorIndex = line.indexOf(':')
    const field = separatorIndex === -1 ? line : line.slice(0, separatorIndex)
    const rawValue = separatorIndex === -1 ? '' : line.slice(separatorIndex + 1).trimStart()

    if (field === 'event') {
      eventType = isCustomSSEEventType(rawValue) ? rawValue : 'message'
      continue
    }

    if (field === 'data') {
      dataLines.push(rawValue)
      continue
    }

    if (field === 'id' && rawValue) {
      eventId = rawValue
    }
  }

  if (!dataLines.length) {
    return null
  }

  return {
    type: eventType,
    data: dataLines.join('\n'),
    id: eventId
  }
}

function emitParsedSSEBlock(block: string): void {
  const parsedEvent = parseSSEBlock(block)
  if (!parsedEvent) {
    return
  }

  const messageEvent = new MessageEvent(parsedEvent.type, {
    data: parsedEvent.data,
    lastEventId: parsedEvent.id ?? ''
  })

  handleMessage(messageEvent)
}

async function consumeSSEStream(signal: AbortSignal): Promise<void> {
  const token = getAccessToken()
  if (!token) {
    throw new Error('SSE 连接失败：缺少访问令牌')
  }

  const url = resolveSSEUrl()
  const response = await fetch(url, {
    method: 'GET',
    headers: createSSEHeaders(token),
    credentials: 'include',
    cache: 'no-cache',
    signal
  })

  if (response.status === 401 || response.status === 403) {
    throw new Error(`SSE 连接失败：认证被拒绝 (${response.status})`)
  }

  if (!response.ok) {
    throw new Error(`SSE 连接失败：HTTP ${response.status}`)
  }

  if (!response.body) {
    throw new Error('SSE 连接失败：响应体不可用')
  }

  handleOpen()

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        break
      }

      buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, '\n')

      let separatorIndex = buffer.indexOf('\n\n')
      while (separatorIndex !== -1) {
        const block = buffer.slice(0, separatorIndex).trim()
        buffer = buffer.slice(separatorIndex + 2)
        emitParsedSSEBlock(block)
        separatorIndex = buffer.indexOf('\n\n')
      }
    }

    const tail = decoder.decode()
    if (tail) {
      buffer += tail.replace(/\r\n/g, '\n')
    }

    emitParsedSSEBlock(buffer.trim())
  } finally {
    reader.releaseLock()
  }
}

function shouldReconnectAfterError(error: unknown): boolean {
  if (manualDisconnect) {
    return false
  }

  if (error instanceof DOMException && error.name === 'AbortError') {
    return false
  }

  if (!(error instanceof Error)) {
    return true
  }

  return !error.message.includes('认证被拒绝') && !error.message.includes('缺少访问令牌')
}

function notifyConnectionError(error: unknown): void {
  console.error('[SSE] 连接错误:', error)
  setConnectionState('error')

  const errorEvent = createSSEErrorEvent()
  errorListeners.forEach(listener => {
    try {
      listener(errorEvent)
    } catch (err) {
      console.error('[SSE] 错误监听器异常:', err)
    }
  })
}

function scheduleReconnect(): void {
  clearReconnectTimer()

  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.error('[SSE] 达到最大重连次数，停止重连')
    return
  }

  reconnectTimer = setTimeout(() => {
    reconnectAttempts++
    console.log(`[SSE] 尝试重连 (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`)
    connect()
  }, RECONNECT_DELAY)
}

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

  // 自定义事件通过 MessageEvent.type 传递事件名（默认为 message）
  const eventType = messageEvent.type || 'message'

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
  if (event.id) {
    setLastSSEEventId(event.id)
  }
  emitEvent(event)
}

/**
 * 处理连接错误
 */
export function connect(): void {
  manualDisconnect = false
  clearReconnectTimer()

  if (abortController) {
    abortController.abort()
  }

  setConnectionState('connecting')

  const controller = new AbortController()
  abortController = controller

  void consumeSSEStream(controller.signal)
    .then(() => {
      if (controller.signal.aborted || abortController !== controller) {
        return
      }

      abortController = null

      if (!manualDisconnect) {
        setConnectionState('connecting')
        console.log('[SSE] 连接已关闭，准备重连')
        scheduleReconnect()
      }
    })
    .catch(error => {
      if (controller.signal.aborted || abortController !== controller) {
        return
      }

      abortController = null

      if (error instanceof DOMException && error.name === 'AbortError') {
        return
      }

      notifyConnectionError(error)

      if (shouldReconnectAfterError(error)) {
        scheduleReconnect()
      }
    })

  console.log('[SSE] 正在连接...', sanitizeSSELogUrl(resolveSSEUrl()))
}

/**
 * 断开 SSE 连接
 */
export function disconnect(): void {
  manualDisconnect = true

  if (abortController) {
    abortController.abort()
    abortController = null
  }

  clearReconnectTimer()
  reconnectAttempts = 0
  setConnectionState('disconnected')
  console.log('[SSE] 连接已断开')
}

/**
 * 重置 SSE 会话状态
 * 仅在登出、身份切换等认证边界调用，避免 Last-Event-ID 跨会话泄漏
 */
export function resetSSESession(): void {
  disconnect()
  resetSSESessionState()
  console.log('[SSE] 会话状态已重置')
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
  return resolveSSEUrl()
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

  const cleanupStateListener = addStateListener(state => {
    if (state === 'disconnected' && autoReconnect && !manualDisconnect) {
      scheduleReconnect()
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
 * // 订阅业务状态变化
 * on('business_status', (event) => {
 *   console.log('业务状态变化:', event.data)
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
