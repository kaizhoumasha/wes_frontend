/**
 * API 基础模块导出
 *
 * 提供 CRUD API 的泛型封装和相关类型
 */

// ==================== CRUD API ====================
export * from './crud-api'

// ==================== 重新导出常用类型 ====================
export type {
  ApiResponse,
  ApiErrorResponse,
  PaginatedResponse,
  BatchResponse,
  PaginationData,
  PaginationParams,
} from '../types'

export type {
  RequestConfig,
  FullRequestConfig,
  HttpMethod,
  RequestHeaders,
  RequestParams,
  RequestBody,
  RequestState,
  ApiError,
  ApiErrorType,
} from '../types'
