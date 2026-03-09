/**
 * 统一HTTP客户端
 * 集成Token刷新、错误通知、响应拦截等核心功能
 */

import { createAlova } from 'alova'
import VueHook from 'alova/vue'
import adapterFetch from 'alova/fetch'
import { env } from '@/config/env'
import { getApiPath } from '@/config/api'
import {
  getAccessToken,
  setAccessToken,
  refreshAccessToken
} from './services/token-refresh'
import { show, initializeErrorNotification } from './services/error-notification'
import { classifyErrorByCode } from './utils/error-classifier'
import { isSuccessCode, ClientErrorCode } from './constants/response-codes'
import type { ApiResponse } from './types'
import { handleAuthError } from './services/auth-error-handler'

/* eslint-disable @typescript-eslint/no-explicit-any */

// ==================== 初始化错误通知服务 ====================

initializeErrorNotification({
  enableDialog: true,
  enableNotification: true,
  enableMessage: true,
  enableLogging: true
})

// ==================== API响应错误 ====================

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
/** Token刷新重试次数（防止死循环） */
let refreshRetryCount = 0
/** 最大刷新重试次数 */
const MAX_REFRESH_RETRY = 1

function waitForRefresh(): Promise<string> {
  return new Promise((resolve) => {
    refreshQueue.push(resolve)
  })
}

function processRefreshQueue(token: string): void {
  refreshQueue.forEach((resolve) => resolve(token))
  refreshQueue = []
}

function rejectRefreshQueue(): void {
  refreshQueue = []
}

function resetRefreshRetryCount(): void {
  refreshRetryCount = 0
}

async function handle401Error(): Promise<string> {
  // 检查刷新重试次数，防止死循环
  if (refreshRetryCount >= MAX_REFRESH_RETRY) {
    console.error('[API] Token刷新重试次数超限，停止刷新')
    throw new Error('Token刷新失败：重试次数超限')
  }

  // 如果正在刷新，等待刷新完成
  if (isRefreshing) {
    return waitForRefresh()
  }

  isRefreshing = true
  refreshRetryCount++

  try {
    const newToken = await refreshAccessToken(apiClient)
    processRefreshQueue(newToken)
    // 刷新成功，重置计数器
    resetRefreshRetryCount()
    return newToken
  } catch {
    rejectRefreshQueue()
    throw new Error('Token刷新失败')
  } finally {
    isRefreshing = false
  }
}

// ==================== 响应拦截器 ====================

async function handleResponse(response: Response, method: any): Promise<unknown> {
  try {
    const json: ApiResponse<unknown> = await response.json()
    const { code, message, data } = json

    if (isSuccessCode(code)) {
      return data
    }

    // 认证相关错误统一处理（2010/2011/2012/2014）
    const AUTH_ERROR_CODES = [
      ClientErrorCode.UNAUTHORIZED,
      ClientErrorCode.INVALID_CREDENTIALS,
      ClientErrorCode.INVALID_TOKEN,
      ClientErrorCode.TOKEN_MISSING
    ]
    if (AUTH_ERROR_CODES.includes(code as ClientErrorCode)) {
      const authError = new ApiResponseError(code, message, json.timestamp)
      await handleAuthError(authError, { showMessage: true })
      throw authError
    }

    // Token 过期（2013）：触发 Token 刷新
    if (code === ClientErrorCode.TOKEN_EXPIRED) {
      try {
        const newToken = await handle401Error()
        setAccessToken(newToken)
        method.config.headers.Authorization = `Bearer ${newToken}`
        return await method.send()
      } catch {
        // Token 刷新失败，按认证错误处理
        const authError = new ApiResponseError(code, message, json.timestamp)
        await handleAuthError(authError, { showMessage: true })
        throw authError
      }
    }

    // 其他错误：分类并显示通知
    const classification = classifyErrorByCode(code, message)
    await show(classification)
    throw new ApiResponseError(code, message, json.timestamp)
  } catch (error) {
    if (error instanceof ApiResponseError) {
      throw error
    }
    if (error instanceof SyntaxError) {
      console.error('[API] 响应JSON解析失败:', await response.text())
      throw new Error('服务器响应格式错误')
    }
    throw error
  }
}

// ==================== 错误拦截器 ====================

async function handleError(error: unknown): Promise<void> {
  if (error instanceof TypeError) {
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

  if (error instanceof DOMException && error.name === 'AbortError') {
    return
  }

  console.error('[API] 未知错误:', error)

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
  timeout: 30000,

  beforeRequest(method) {
    method.config.credentials = 'include'

    // 检查是否为刷新Token请求
    const isRefreshRequest = method.meta?.isRefreshRequest === true

    // 仅在非刷新Token请求中添加Authorization头
    if (!isRefreshRequest) {
      const token = getAccessToken()
      if (token) {
        method.config.headers.Authorization = `Bearer ${token}`
      }
    }

    if (!method.config.headers['Content-Type']) {
      method.config.headers['Content-Type'] = 'application/json'
    }
  },

  responded: {
    onSuccess: async (response, method) => {
      return handleResponse(response, method)
    },

    onError: async (error, method) => {
      const errorAny = error as any
      if (errorAny.response && errorAny.response instanceof Response) {
        try {
          await handleResponse(errorAny.response, method)
          return undefined
        } catch {
          throw error
        }
      }

      await handleError(error)
      throw error
    }
  }
})

export const get = <T = unknown>(url: string, params?: Record<string, unknown>) => {
  return apiClient.Get<T>(url, params)
}

export const post = <T = unknown>(url: string, data?: Record<string, unknown>) => {
  return apiClient.Post<T>(url, data)
}

export const put = <T = unknown>(url: string, data?: Record<string, unknown>) => {
  return apiClient.Put<T>(url, data)
}

export const patch = <T = unknown>(url: string, data?: Record<string, unknown>) => {
  return apiClient.Patch<T>(url, data)
}

export const del = <T = unknown>(url: string) => {
  return apiClient.Delete<T>(url)
}

export { getApiPath }
export type * from './types'
