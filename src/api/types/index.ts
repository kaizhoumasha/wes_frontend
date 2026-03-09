/**
 * API类型统一导出
 */

// ==================== 通用类型 ====================
export * from './response'
export * from './request'

// ==================== 业务模型 ====================
export * from './models/auth'

// ==================== 重新导出常用类型 ====================

// 响应相关
export type {
  ApiResponse,
  ApiErrorResponse,
  PaginatedResponse,
  BatchResponse
} from './response'

// 请求相关
export type {
  RequestConfig,
  FullRequestConfig,
  HttpMethod,
  RequestHeaders,
  RequestParams,
  RequestBody,
  RequestState,
  RequestStatus,
  ApiError,
  ApiErrorType,
  FileUploadOptions
} from './request'

// 认证模型
export type {
  LoginCredentials,
  TokenResponse,
  LoginResponse,
  RefreshTokenRequest,
  UserInfo,
  Role,
  LogoutRequest,
  LogoutResponse,
  ChangePasswordRequest,
  ResetPasswordRequest
} from './models/auth'
