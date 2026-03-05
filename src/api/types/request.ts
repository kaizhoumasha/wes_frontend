/**
 * 请求相关类型定义
 */

// ==================== 基础请求配置 ====================

/**
 * HTTP方法类型
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'

/**
 * 请求头类型
 */
export type RequestHeaders = Record<string, string>

/**
 * 请求参数类型（用于URL查询参数）
 */
export type RequestParams = Record<string, string | number | boolean | undefined | null>

/**
 * 请求体类型
 */
export type RequestBody = Record<string, unknown> | FormData | string | null

// ==================== 请求配置 ====================

/**
 * 基础请求配置
 */
export interface RequestConfig {
  /** 请求超时时间（毫秒） */
  timeout?: number
  /** 请求头 */
  headers?: RequestHeaders
  /** 是否携带凭证 */
  withCredentials?: boolean
  /** 响应类型 */
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer'
  /** 是否缓存请求 */
  cache?: RequestCache
  /** 请求模式 */
  mode?: RequestMode
  /** 重定向模式 */
  redirect?: RequestRedirect
  /** 请求优先级 */
  priority?: 'high' | 'low' | 'auto'
}

/**
 * 带重试的请求配置
 */
export interface RequestConfigWithRetry extends RequestConfig {
  /** 最大重试次数 */
  maxRetries?: number
  /** 重试延迟（毫秒） */
  retryDelay?: number
  /** 重试条件函数 */
  shouldRetry?: (error: unknown) => boolean
}

/**
 * 带取消的请求配置
 */
export interface RequestConfigWithCancel extends RequestConfig {
  /** 取消信号 */
  signal?: AbortSignal
}

/**
 * 完整请求配置
 */
export interface FullRequestConfig extends RequestConfigWithRetry, RequestConfigWithCancel {
  /** 请求URL */
  url?: string
  /** 请求方法 */
  method?: HttpMethod
  /** 请求参数（URL查询参数） */
  params?: RequestParams
  /** 请求体 */
  data?: RequestBody
  /** 是否显示加载状态 */
  showLoading?: boolean
  /** 是否显示错误通知 */
  showErrorNotification?: boolean
  /** 自定义错误处理器 */
  errorHandler?: (error: unknown) => void | Promise<void>
}

// ==================== 请求状态 ====================

/**
 * 请求状态枚举
 */
export enum RequestState {
  /** 空闲 */
  IDLE = 'idle',
  /** 加载中 */
  LOADING = 'loading',
  /** 成功 */
  SUCCESS = 'success',
  /** 失败 */
  ERROR = 'error'
}

/**
 * 请求状态信息
 */
export interface RequestStatus {
  /** 当前状态 */
  state: RequestState
  /** 是否正在加载 */
  isLoading: boolean
  /** 是否正在获取（首次加载或刷新） */
  isFetching: boolean
  /** 是否成功 */
  isSuccess: boolean
  /** 是否失败 */
  isError: boolean
  /** 是否为空闲状态 */
  isIdle: boolean
}

// ==================== 请求错误 ====================

/**
 * API错误类型
 */
export enum ApiErrorType {
  /** 网络错误 */
  NETWORK = 'network',
  /** 超时错误 */
  TIMEOUT = 'timeout',
  /** 认证错误 */
  AUTH = 'auth',
  /** 权限错误 */
  PERMISSION = 'permission',
  /** 资源错误 */
  RESOURCE = 'resource',
  /** 验证错误 */
  VALIDATION = 'validation',
  /** 业务错误 */
  BUSINESS = 'business',
  /** 服务器错误 */
  SERVER = 'server',
  /** 未知错误 */
  UNKNOWN = 'unknown'
}

/**
 * API错误接口
 */
export interface ApiError extends Error {
  /** 错误类型 */
  type: ApiErrorType
  /** HTTP状态码（如果有） */
  statusCode?: number
  /** 响应码（业务错误码，字符串类型） */
  code?: string
  /** 错误消息 */
  message: string
  /** 详细错误信息 */
  details?: unknown
  /** 请求配置（用于调试） */
  config?: FullRequestConfig
  /** 原始错误对象 */
  originalError?: unknown
}

/**
 * 创建API错误
 */
export function createApiError(
  type: ApiErrorType,
  message: string,
  options?: Partial<ApiError>
): ApiError {
  const error = new Error(message) as ApiError
  error.type = type
  error.name = 'ApiError'
  Object.assign(error, options)
  return error
}

// ==================== 文件上传 ====================

/**
 * 文件上传选项
 */
export interface FileUploadOptions {
  /** 文件 */
  file: File | Blob
  /** 字段名 */
  fieldName?: string
  /** 额外表单数据 */
  formData?: Record<string, string | Blob>
  /** 上传进度回调 */
  onProgress?: (progress: number) => void
}

/**
 * 文件上传响应
 */
export interface FileUploadResponse {
  /** 文件URL */
  url: string
  /** 文件名 */
  filename: string
  /** 文件大小 */
  size: number
  /** 文件MIME类型 */
  mimeType: string
  /** 文件哈希值 */
  hash?: string
}

// ==================== 请求队列 ====================

/**
 * 请求队列项
 */
export interface RequestQueueItem {
  /** 请求ID */
  requestId: string
  /** 请求配置 */
  config: FullRequestConfig
  /** 解析函数 */
  resolve: (value: unknown) => void
  /** 拒绝函数 */
  reject: (error: unknown) => void
}

// ==================== 请求缓存 ====================

/**
 * 缓存策略
 */
export enum CacheStrategy {
  /** 不缓存 */
  NONE = 'none',
  /** 仅内存缓存 */
  MEMORY = 'memory',
  /** 本地存储缓存 */
  LOCAL_STORAGE = 'local_storage',
  /** 会话存储缓存 */
  SESSION_STORAGE = 'session_storage'
}

/**
 * 缓存配置
 */
export interface CacheConfig {
  /** 缓存策略 */
  strategy: CacheStrategy
  /** 缓存时间（毫秒） */
  ttl?: number
  /** 缓存键前缀 */
  keyPrefix?: string
}

// ==================== 请求拦截器 ====================

/**
 * 请求拦截器函数
 */
export type RequestInterceptor = (config: FullRequestConfig) => FullRequestConfig | Promise<FullRequestConfig>

/**
 * 响应拦截器函数
 */
export type ResponseInterceptor<T = unknown> = (response: T) => T | Promise<T>

/**
 * 错误拦截器函数
 */
export type ErrorInterceptor = (error: unknown) => unknown | Promise<unknown>

// ==================== 请求上下文 ====================

/**
 * 请求上下文（包含请求相关的元信息）
 */
export interface RequestContext {
  /** 请求ID（唯一标识） */
  requestId: string
  /** 请求开始时间 */
  startTime: number
  /** 请求结束时间 */
  endTime?: number
  /** 请求耗时（毫秒） */
  duration?: number
  /** 是否为重试请求 */
  isRetry?: boolean
  /** 重试次数 */
  retryCount?: number
  /** 是否来自缓存 */
  fromCache?: boolean
}
