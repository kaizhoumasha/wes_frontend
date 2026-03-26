/**
 * 后端统一响应包裹结构。
 */

export interface ApiResponse<T = unknown> {
  code: string
  message: string
  data: T
  timestamp: string
}
