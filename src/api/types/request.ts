/**
 * API 请求与错误相关的最小公共类型。
 */

import type { RequestBody as AlovaRequestBody } from 'alova'

export type RequestPrimitive = string | number | boolean | null

export type RequestValue =
  | RequestPrimitive
  | RequestValue[]
  | { [key: string]: RequestValue }
  | undefined

export type RequestParams = Record<string, RequestValue>

export type RequestBody = AlovaRequestBody

export interface FullRequestConfig {
  timeout?: number
  headers?: Record<string, string>
  withCredentials?: boolean
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer'
  cache?: RequestCache
  mode?: RequestMode
  redirect?: RequestRedirect
  priority?: 'high' | 'low' | 'auto'
  signal?: AbortSignal
  maxRetries?: number
  retryDelay?: number
  shouldRetry?: (error: unknown) => boolean
  url?: string
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'
  params?: RequestParams
  data?: RequestBody
  showLoading?: boolean
  showErrorNotification?: boolean
  errorHandler?: (error: unknown) => void | Promise<void>
}

export enum RequestState {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error'
}

export interface ApiError extends Error {
  type:
    | 'network'
    | 'timeout'
    | 'auth'
    | 'permission'
    | 'resource'
    | 'validation'
    | 'business'
    | 'server'
    | 'unknown'
  statusCode?: number
  code?: string
  message: string
  details?: unknown
  config?: FullRequestConfig
  originalError?: unknown
}
