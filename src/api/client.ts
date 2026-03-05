/**
 * 统一HTTP客户端
 * 集成Token刷新、错误通知、响应拦截等核心功能
 */

import { createAlova } from 'alova'
import VueHook from 'alova/vue'
import adapterFetch from 'alova/fetch'
import { env } from '@/config/env'
import {
  getAccessToken,
  setAccessToken,
  refreshAccessToken
} from './services/token-refresh'
import { show, initializeErrorNotification } from './services/error-notification'
import { classifyErrorByCode } from './utils/error-classifier'
import { isSuccessCode } from './constants/response-codes'
import type { ApiResponse } from './types'

/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 统一HTTP客户端
 * 集成Token刷新、错误通知、响应拦截等核心功能
 */

// ==================== 初始化错误通知服务 ====================

initializeErrorNotification({
  enableDialog: true,
  enableNotification: true,
  enableMessage: true,
  enableLogging: true
})

// ==================== API响应错误 ====================

/**
 * API响应错误类
 */
export class ApiResponseError extends Error {
  code: string
  message: string
  timestamp: string

  constructor(code: string, message: string, timestamp: string) {
    super(message)
    this.name = 'ApiResponseError'
    this.code = code
    this.message = message
    this.timestamp = timestamp
  }
}

// ==================== Token刷新状态 ====================

/** 是否正在刷新Token */
let isRefreshing = false
/** 等待中的请求队列 */
let refreshQueue: Array<(token: string) => void> = []

/**
 * 添加请求到刷新队列
 * @returns Promise，Token刷新后resolve
 */
function waitForRefresh(): Promise<string> {
  return new Promise((resolve) => {
    refreshQueue.push(resolve)
  })
}

/**
 * 处理队列中的请求
 * @param token 新Token
 */
function processRefreshQueue(token: string): void {
  refreshQueue.forEach((resolve) => resolve(token))
  refreshQueue = []
}

/**
 * 拒绝队列中的请求
 */
function rejectRefreshQueue(): void {
  refreshQueue = []
}

/**
 * 处理401错误（Token过期）
 * @returns 新Token
 */
async function handle401Error(): Promise<string> {
  // 如果正在刷新，等待刷新完成
  if (isRefreshing) {
    return waitForRefresh()
  }

  isRefreshing = true

  try {
    const newToken = await refreshAccessToken(apiClient)
    processRefreshQueue(newToken)
    return newToken
  } catch {
    rejectRefreshQueue()
    throw new Error('Token刷新失败')
  } finally {
    isRefreshing = false
  }
}

// ==================== 响应拦截器 ====================

/**
 * 处理API响应
 * @param response Fetch响应对象
 * @param method 请求方法
 * @returns 响应数据
 */
async function handleResponse(response: Response, method: any): Promise<unknown> {
  try {
    const json: ApiResponse<unknown> = await response.json()
    const { code, message, data } = json

    // 检查响应码（字符串类型，如 "1000"）
    if (isSuccessCode(code)) {
      return data
    }

    // 401错误需要特殊处理（Token刷新）
    if (code === '2010' || code === '2012' || code === '2013') {
      try {
        const newToken = await handle401Error()
        setAccessToken(newToken)

        // 重试原始请求
        method.config.headers.Authorization = `Bearer ${newToken}`
        return await method.send()
      } catch {
        // Token刷新失败，已在handle401Error中处理跳转登录
        throw new ApiResponseError(code, message, json.timestamp)
      }
    }

    // 其他错误，分类并显示通知
    const classification = classifyErrorByCode(code, message)
    await show(classification)

    throw new ApiResponseError(code, message, json.timestamp)
  } catch (error) {
    // 如果是ApiResponseError，直接抛出
    if (error instanceof ApiResponseError) {
      throw error
    }

    // JSON解析失败
    if (error instanceof SyntaxError) {
      console.error('[API] 响应JSON解析失败:', await response.text())
      throw new Error('服务器响应格式错误')
    }

    // 其他错误
    throw error
  }
}

// ==================== 错误拦截器 ====================

/**
 * 处理请求错误
 * @param error 错误对象
 */
async function handleError(error: unknown): Promise<void> {
  // 处理网络错误、超时等
  if (error instanceof TypeError) {
    // 检查是否是网络错误（包括 CORS、fetch failed 等）
    const errorMsg = error.message.toLowerCase()
    const isNetworkError =
      errorMsg.includes('fetch') ||
      errorMsg.includes('network') ||
      errorMsg.includes('failed to fetch')

    if (isNetworkError) {
      await show({
        type: 'network' as any,
        severity: 'high' as any,
        userMessage: '网络连接失败，请检查网络设置',
        logMessage: `[网络错误] ${error.message}`,
        notificationType: 'message' as any,
        retryable: true,
        requiresAuth: false,
        metadata: {
          code: '0',
          range: '5xxx' as any,
          severity: 'high' as any,
          defaultMessage: '网络连接失败',
          logLevel: 'error' as any,
          retryable: true,
          notificationType: 'message' as any
        }
      })
      return
    }
  }

  // 处理AbortError（请求被取消）
  if (error instanceof DOMException && error.name === 'AbortError') {
    // 静默处理，不显示通知
    return
  }

  // 其他未知错误
  console.error('[API] 未知错误:', error)

  // 显示未知错误通知
  await show({
    type: 'unknown' as any,
    severity: 'medium' as any,
    userMessage: '请求失败，请稍后重试',
    logMessage: `[未知错误] ${error instanceof Error ? error.message : String(error)}`,
    notificationType: 'message' as any,
    retryable: false,
    requiresAuth: false,
    metadata: {
      code: '0',
      range: '5xxx' as any,
      severity: 'medium' as any,
      defaultMessage: '请求失败',
      logLevel: 'error' as any,
      retryable: false,
      notificationType: 'message' as any
    }
  })
}

// ==================== 创建Alova实例 ====================

export const apiClient = createAlova({
  baseURL: env.apiBaseUrl,
  statesHook: VueHook,
  requestAdapter: adapterFetch(),
  timeout: 30000, // 30秒超时

  beforeRequest(method) {
    // 添加Authorization头
    const token = getAccessToken()
    if (token) {
      method.config.headers.Authorization = `Bearer ${token}`
    }

    // 添加其他默认请求头
    if (!method.config.headers['Content-Type']) {
      method.config.headers['Content-Type'] = 'application/json'
    }
  },

  responded: {
    onSuccess: async (response, method) => {
      return handleResponse(response, method)
    },

    onError: async (error) => {
      await handleError(error)
      throw error
    }
  }
})

// ==================== 导出便捷方法 ====================

/**
 * GET请求
 */
export const get = <T = unknown>(url: string, params?: Record<string, unknown>) => {
  return apiClient.Get<T>(url, params)
}

/**
 * POST请求
 */
export const post = <T = unknown>(url: string, data?: Record<string, unknown>) => {
  return apiClient.Post<T>(url, data)
}

/**
 * PUT请求
 */
export const put = <T = unknown>(url: string, data?: Record<string, unknown>) => {
  return apiClient.Put<T>(url, data)
}

/**
 * PATCH请求
 */
export const patch = <T = unknown>(url: string, data?: Record<string, unknown>) => {
  return apiClient.Patch<T>(url, data)
}

/**
 * DELETE请求
 */
export const del = <T = unknown>(url: string) => {
  return apiClient.Delete<T>(url)
}

// ==================== 导出类型 ====================
export type * from './types'
