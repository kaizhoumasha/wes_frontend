/**
 * 统一HTTP客户端
 * 集成Token刷新、错误通知、响应拦截等核心功能
 */

import { createAlova } from 'alova'
import VueHook from 'alova/vue'
import adapterFetch from 'alova/fetch'
import { env } from '@/config/env'
import { getAccessToken, setAccessToken, refreshAccessToken } from './services/token-refresh'
import { show } from './services/error-notification'
import { classifyErrorByCode } from './utils/error-classifier'
import { isSuccessCode, ClientErrorCode } from './constants/response-codes'
import type { ApiResponse } from './types/response'
import { handleAuthError } from './services/auth-error-handler'
import { API_CACHE_DURATION } from '@/constants/cache'

/* eslint-disable @typescript-eslint/no-explicit-any */

const DEFAULT_API_BASE_URL = 'http://localhost:8001'

export function resolveApiBaseUrl(): string {
  if (env.apiBaseUrl) {
    return env.apiBaseUrl
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }

  return DEFAULT_API_BASE_URL
}

// ==================== API响应错误 ====================

export class ApiResponseError extends Error {
  code: string
  message: string
  timestamp: string
  data?: unknown

  constructor(code: string, message: string, timestamp: string, data?: unknown) {
    super(message)
    this.name = 'ApiResponseError'
    this.code = code
    this.message = message
    this.timestamp = timestamp
    this.data = data
  }
}

// ==================== 响应拦截器 ====================

async function handleResponse(response: Response, method: any): Promise<unknown> {
  const responseBody = await response.text()

  try {
    const json = JSON.parse(responseBody) as ApiResponse<unknown>
    const { code, message, data } = json

    if (isSuccessCode(code)) {
      return data
    }

    const isRefreshRequest = method.meta?.isRefreshRequest === true
    const authRefreshAttempted = method.meta?.authRefreshAttempted === true
    const currentAccessToken = getAccessToken()
    const currentAuthorization = currentAccessToken ? `Bearer ${currentAccessToken}` : null
    const requestAuthorization = method.config.headers.Authorization
    const hasNewerAccessToken =
      currentAuthorization !== null && requestAuthorization !== currentAuthorization
    const isRefreshableAccessTokenError =
      !isRefreshRequest &&
      !authRefreshAttempted &&
      (code === ClientErrorCode.INVALID_TOKEN || code === ClientErrorCode.TOKEN_EXPIRED)

    // Access token 可能在 JWT 与 Redis 的过期边界返回 2012 或 2013。
    // 两者都先用 HttpOnly refresh cookie 续期；刷新请求自身失败时不得递归。
    if (isRefreshableAccessTokenError) {
      method.meta = { ...method.meta, authRefreshAttempted: true }

      // 该响应若使用的是旧 token，说明另一请求已完成续期；直接用当前 token 有界重发。
      if (hasNewerAccessToken) {
        method.config.headers.Authorization = currentAuthorization
        return await method.send()
      }

      let newToken: string
      try {
        // refreshAccessToken 统一管理并发队列；每个原请求只允许进入一次。
        newToken = await refreshAccessToken(apiClient)
      } catch {
        const authError = new ApiResponseError(code, message, json.timestamp, data)
        await handleAuthError(authError, { showMessage: true })
        throw authError
      }

      setAccessToken(newToken)
      method.config.headers.Authorization = `Bearer ${newToken}`
      return await method.send()
    }

    // 其余认证错误统一处理（2010/2011/2012/2013/2014）
    const AUTH_ERROR_CODES = [
      ClientErrorCode.UNAUTHORIZED,
      ClientErrorCode.INVALID_CREDENTIALS,
      ClientErrorCode.INVALID_TOKEN,
      ClientErrorCode.TOKEN_EXPIRED,
      ClientErrorCode.TOKEN_MISSING
    ]
    if (AUTH_ERROR_CODES.includes(code as ClientErrorCode)) {
      const authError = new ApiResponseError(code, message, json.timestamp, data)
      await handleAuthError(authError, { showMessage: true })
      throw authError
    }

    // 其他错误：分类并显示通知
    const classification = classifyErrorByCode(code, message)
    await show(classification)
    throw new ApiResponseError(code, message, json.timestamp, data)
  } catch (error) {
    if (error instanceof ApiResponseError) {
      throw error
    }
    if (error instanceof SyntaxError) {
      console.error('[API] 响应JSON解析失败:', responseBody)
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
  baseURL: resolveApiBaseUrl(),
  statesHook: VueHook,
  requestAdapter: adapterFetch(),
  timeout: 30000,
  // 默认关闭 API 级缓存。
  //
  // 原因：
  // - 后台管理场景下，大多数 GET 都是强一致数据（列表、详情、回收站）
  // - 若按 HTTP 方法统一缓存，会把 `/trash`、`/{id}` 这类可变资源一并缓存
  // - 缓存应该改为“显式接入”，只给真正可容忍过期的只读接口单独开启
  cacheFor: {
    GET: API_CACHE_DURATION.NONE
  },

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
