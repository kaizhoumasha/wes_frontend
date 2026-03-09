/**
 * 通用API响应类型定义
 * 与后端统一响应格式对齐
 *
 * 后端响应格式:
 * {
 *   "code": "1000",           // 响应码（字符串类型）
 *   "message": "操作成功",     // 响应消息
 *   "data": {...},            // 响应数据
 *   "timestamp": "2024-01-01T00:00:00Z"  // ISO 8601格式时间戳
 * }
 */

// ==================== 基础响应类型 ====================

/**
 * 基础API响应结构
 * @template T 数据类型
 */
export interface ApiResponse<T = unknown> {
  /** 响应码（字符串类型，如 "1000"） */
  code: string
  /** 响应消息 */
  message: string
  /** 响应数据 */
  data: T
  /** 响应时间戳（ISO 8601格式，如 "2024-01-01T00:00:00Z"） */
  timestamp: string
}

/**
 * API错误响应结构
 */
export interface ApiErrorResponse {
  /** 错误码（字符串类型） */
  code: string
  /** 错误消息 */
  message: string
  /** 错误数据（可能包含详细错误信息） */
  data?: unknown
  /** 响应时间戳（ISO 8601格式） */
  timestamp: string
}

// ==================== 分页响应类型 ====================

/**
 * 分页数据模型（与后端 PaginationData 对应）
 * @template T 列表项类型
 */
export interface PaginationData<T = unknown> {
  /** 数据列表 */
  items: T[]
  /** 总记录数 */
  total: number
  /** 当前页码（从1开始） */
  page: number
  /** 每页大小 */
  size: number
  /** 总页数 */
  pages: number
}

/**
 * 分页响应结构（与后端 PaginationResponseModel 对应）
 * @template T 列表项类型
 *
 * 后端响应格式:
 * {
 *   "code": "1000",
 *   "message": "操作成功",
 *   "data": {
 *     "items": [...],
 *     "total": 100,
 *     "page": 1,
 *     "size": 10,
 *     "pages": 10
 *   },
 *   "timestamp": "2024-01-01T00:00:00Z"
 * }
 */
export type PaginatedResponse<T = unknown> = ApiResponse<PaginationData<T>>

// ==================== 批量操作响应类型 ====================

/**
 * 批量操作结果（与后端 BatchOperationResult 对应）
 */
export interface BatchOperationResult {
  /** 成功数量 */
  success: number
  /** 失败数量 */
  failed: number
  /** 总数量 */
  total: number
  /** 详细结果列表（可选） */
  results?: unknown[]
  /** 错误信息列表（可选） */
  errors?: Array<{ index?: number; message: string }>
}

/**
 * 批量操作响应（与后端 BatchOperationResponseModel 对应）
 */
export type BatchResponse = ApiResponse<BatchOperationResult>

// ==================== 成功响应创建辅助函数 ====================

/**
 * 创建成功响应
 * @param data 响应数据
 * @param code 响应码（默认"1000"）
 * @param message 响应消息
 * @returns API响应对象
 */
export function createSuccessResponse<T>(
  data: T,
  code: string = '1000',
  message = '操作成功'
): ApiResponse<T> {
  return {
    code,
    message,
    data,
    timestamp: new Date().toISOString()
  }
}

/**
 * 创建分页响应
 * @param items 列表数据
 * @param total 总记录数
 * @param page 当前页码
 * @param size 每页大小
 * @param code 响应码
 * @param message 响应消息
 * @returns 分页响应对象
 */
export function createPaginatedResponse<T>(
  items: T[],
  total: number,
  page = 1,
  size = 10,
  code = '1000',
  message = '操作成功'
): PaginatedResponse<T> {
  const pages = size > 0 ? Math.ceil(total / size) : 0

  return {
    code,
    message,
    data: {
      items,
      total,
      page,
      size,
      pages
    },
    timestamp: new Date().toISOString()
  }
}

/**
 * 创建批量操作响应
 * @param result 批量操作结果
 * @param code 响应码
 * @param message 响应消息
 * @returns 批量响应对象
 */
export function createBatchResponse(
  result: BatchOperationResult,
  code = '1000',
  message = '操作完成'
): BatchResponse {
  return {
    code,
    message,
    data: result,
    timestamp: new Date().toISOString()
  }
}
