/**
 * CRUD API 基础封装
 *
 * 基于后端 BaseAPI 架构，提供标准 CRUD 操作的泛型封装
 *
 * 后端标准端点：
 * - POST   /{prefix}           - 创建
 * - PUT    /{prefix}/{id}      - 更新
 * - DELETE /{prefix}/{id}      - 删除
 * - GET    /{prefix}/{id}      - 获取单个
 * - POST   /{prefix}/query     - 列表查询
 *
 * 软删除端点（如果模型支持）：
 * - POST   /{prefix}/{id}/restore        - 恢复
 * - GET    /{prefix}/trash               - 回收站
 * - POST   /{prefix}/trash/restore       - 批量恢复
 * - DELETE /{prefix}/trash/permanent     - 批量永久删除
 *
 * 批量操作：
 * - DELETE /{prefix}/bulk        - 批量删除
 */

import { apiClient } from '../client'
import type {
  ApiResponse,
  PaginationData,
  PaginationParams,
} from '../types'

// ==================== 类型定义 ====================

type FilterOperator =
  | 'eq'
  | 'ne'
  | 'gt'
  | 'ge'
  | 'lt'
  | 'le'
  | 'in'
  | 'nin'
  | 'ilike'
  | 'between'
  | 'is_null'
  | 'not_null'

interface FilterCondition {
  field: string
  op: FilterOperator
  value?: unknown
}

interface FilterGroup {
  couple: 'and' | 'or' | 'not'
  conditions: Array<FilterCondition | FilterGroup>
}

const FILTER_OPERATORS = new Set<FilterOperator>([
  'eq',
  'ne',
  'gt',
  'ge',
  'lt',
  'le',
  'in',
  'nin',
  'ilike',
  'between',
  'is_null',
  'not_null',
])

function isFilterGroup(value: unknown): value is FilterGroup {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false
  }

  const candidate = value as { couple?: unknown; conditions?: unknown }
  return (
    (candidate.couple === 'and' || candidate.couple === 'or' || candidate.couple === 'not') &&
    Array.isArray(candidate.conditions)
  )
}

function toFilterCondition(field: string, rawValue: unknown): FilterCondition | null {
  if (rawValue === undefined) {
    return null
  }

  if (rawValue && typeof rawValue === 'object' && !Array.isArray(rawValue)) {
    const opCandidate = (rawValue as { op?: unknown }).op
    if (typeof opCandidate === 'string' && FILTER_OPERATORS.has(opCandidate as FilterOperator)) {
      const op = opCandidate as FilterOperator
      if (op === 'is_null' || op === 'not_null') {
        return { field, op }
      }
      return { field, op, value: (rawValue as { value?: unknown }).value }
    }
  }

  if (rawValue === null) {
    return { field, op: 'is_null' }
  }
  if (Array.isArray(rawValue)) {
    return { field, op: 'in', value: rawValue }
  }
  return { field, op: 'eq', value: rawValue }
}

function normalizeFilters(filters: Record<string, unknown> | undefined): FilterGroup | undefined {
  if (!filters) {
    return undefined
  }

  // 运行时兼容：如果调用方已传入标准 FilterGroup，直接透传
  if (isFilterGroup(filters)) {
    return filters
  }

  const conditions = Object.entries(filters)
    .map(([field, value]) => toFilterCondition(field, value))
    .filter((condition): condition is FilterCondition => condition !== null)

  if (conditions.length === 0) {
    return undefined
  }

  return {
    couple: 'and',
    conditions,
  }
}

/**
 * 查询选项（对应后端 QueryOptions）
 */
export interface QueryOptions extends PaginationParams {
  /** 过滤条件（简写对象，内部自动转换为后端 FilterGroup） */
  filters?: Record<string, unknown>
  /** 排序 */
  sort?: Array<{ field: string; order: 'asc' | 'desc' }>
  /** 关系加载深度 */
  max_depth?: number
  /** 是否包含已删除的记录 */
  include_deleted?: boolean
}

/**
 * 批量操作结果
 */
export interface BatchOperationResult {
  /** 成功数量 */
  success: number
  /** 失败数量 */
  failed: number
  /** 总数量 */
  total: number
  /** 详细错误信息 */
  errors?: Array<{ id?: number; message: string }>
}

/**
 * CRUD API 配置
 */
export interface CrudApiConfig<T, CreateInput, UpdateInput> {
  /** API 路径前缀 */
  prefix: string
  /** 创建输入类型（可选，如果不支持创建） */
  createSchema?: new (data: unknown) => CreateInput
  /** 更新输入类型（可选，如果不支持更新） */
  updateSchema?: new (data: unknown) => UpdateInput
  /** 响应数据类型 */
  responseSchema?: new (data: unknown) => T
}

// ==================== CRUD API 类 ====================

/**
 * CRUD API 基类
 *
 * @template T 实体类型
 * @template CreateInput 创建输入类型
 * @template UpdateInput 更新输入类型
 *
 * @example
 * ```ts
 * interface User {
 *   id: number
 *   name: string
 *   email: string
 * }
 *
 * interface CreateUserInput {
 *   name: string
 *   email: string
 *   password: string
 * }
 *
 * interface UpdateUserInput {
 *   name?: string
 *   email?: string
 * }
 *
 * const userApi = new CrudApi<User, CreateUserInput, UpdateUserInput>({
 *   prefix: '/api/v1/users',
 *   createSchema: CreateUserInput,
 *   updateSchema: UpdateUserInput,
 * })
 *
 * // 使用
 * const users = await userApi.query({ page: 1, pageSize: 10 })
 * const user = await userApi.getById(1)
 * const newUser = await userApi.create({ name: 'John', email: 'john@example.com', password: '123456' })
 * await userApi.update(1, { name: 'Jane' })
 * await userApi.delete(1)
 * ```
 */
export class CrudApi<T, CreateInput = Partial<T>, UpdateInput = Partial<T>> {
  constructor(protected config: CrudApiConfig<T, CreateInput, UpdateInput>) {}

  // ==================== 标准 CRUD 操作 ====================

  /**
   * 获取单个实体
   * @param id 实体ID
   * @param maxDepth 关系加载深度（默认2）
   * @returns 实体数据
   */
  async getById(id: number, maxDepth = 2): Promise<T> {
    const response = await apiClient.Get<ApiResponse<T>>(
      `${this.config.prefix}/${id}`,
      { max_depth: maxDepth } as Record<string, unknown>
    )
    return response as unknown as T
  }

  /**
   * 查询实体列表
   * @param options 查询选项
   * @returns 分页数据
   */
  async query(options: QueryOptions = {}): Promise<PaginationData<T>> {
    const {
      page = 1,
      pageSize = 10,
      filters = {},
      sort,
      max_depth = 2,
      include_deleted = false,
    } = options
    const normalizedFilters = normalizeFilters(filters)

    const response = await apiClient.Post<ApiResponse<PaginationData<T>>>(
      `${this.config.prefix}/query`,
      {
        limit: pageSize,
        offset: (page - 1) * pageSize,
        filters: normalizedFilters,
        sort,
        max_depth,
        include_deleted,
      } as Record<string, unknown>
    )

    const data = response as unknown as PaginationData<T>
    // 转换为标准分页格式
    return {
      items: data.items,
      total: data.total,
      page,
      size: pageSize,
      pages: Math.ceil(data.total / pageSize),
    }
  }

  /**
   * 创建实体
   * @param data 创建数据
   * @returns 创建的实体
   */
  async create(data: CreateInput): Promise<T> {
    const response = await apiClient.Post<ApiResponse<T>>(
      this.config.prefix,
      data as Record<string, unknown>
    )
    return response as unknown as T
  }

  /**
   * 更新实体
   * @param id 实体ID
   * @param data 更新数据（仅包含需要更新的字段）
   * @returns 更新后的实体
   */
  async update(id: number, data: UpdateInput): Promise<T> {
    const response = await apiClient.Put<ApiResponse<T>>(
      `${this.config.prefix}/${id}`,
      data as Record<string, unknown>
    )
    return response as unknown as T
  }

  /**
   * 删除实体
   * @param id 实体ID
   * @param permanent 是否永久删除（默认false，使用软删除）
   * @returns 删除结果
   */
  async delete(id: number, permanent = false): Promise<{ message: string }> {
    const response = await apiClient.Delete<ApiResponse<{ message: string }>>(
      `${this.config.prefix}/${id}`,
      { permanent } as Record<string, unknown>
    )
    return response as unknown as { message: string }
  }

  // ==================== 批量操作 ====================

  /**
   * 批量删除
   * @param ids 实体ID列表
   * @returns 批量操作结果
   */
  async bulkDelete(ids: number[]): Promise<BatchOperationResult> {
    const response = await apiClient.Delete<ApiResponse<BatchOperationResult>>(
      `${this.config.prefix}/bulk`,
      ids
    )
    return response as unknown as BatchOperationResult
  }

  // ==================== 软删除操作（如果模型支持）====================

  /**
   * 恢复已删除的实体
   * @param id 实体ID
   * @returns 恢复后的实体
   */
  async restore(id: number): Promise<T> {
    const response = await apiClient.Post<ApiResponse<T>>(
      `${this.config.prefix}/${id}/restore`,
      {}
    )
    return response as unknown as T
  }

  /**
   * 获取回收站（已删除的实体）
   * @param page 页码（默认1）
   * @param pageSize 每页数量（默认10）
   * @returns 分页数据
   */
  async getTrash(page = 1, pageSize = 10): Promise<PaginationData<T>> {
    const response = await apiClient.Get<ApiResponse<PaginationData<T>>>(
      `${this.config.prefix}/trash`,
      {
        offset: (page - 1) * pageSize,
        limit: pageSize,
      } as Record<string, unknown>
    )

    const data = response as unknown as PaginationData<T>
    return {
      items: data.items,
      total: data.total,
      page,
      size: pageSize,
      pages: Math.ceil(data.total / pageSize),
    }
  }

  /**
   * 批量恢复
   * @param ids 实体ID列表
   * @returns 批量操作结果
   */
  async bulkRestore(ids: number[]): Promise<BatchOperationResult> {
    const response = await apiClient.Post<ApiResponse<BatchOperationResult>>(
      `${this.config.prefix}/trash/restore`,
      ids
    )
    return response as unknown as BatchOperationResult
  }

  /**
   * 批量永久删除
   * @param ids 实体ID列表
   * @returns 批量操作结果
   */
  async bulkPermanentDelete(ids: number[]): Promise<BatchOperationResult> {
    const response = await apiClient.Delete<ApiResponse<BatchOperationResult>>(
      `${this.config.prefix}/trash/permanent`,
      ids
    )
    return response as unknown as BatchOperationResult
  }
}

// ==================== 工厂函数 ====================

/**
 * 创建 CRUD API 实例的工厂函数
 *
 * @param config API 配置
 * @returns CRUD API 实例
 *
 * @example
 * ```ts
 * export const userApi = createCrudApi<User, CreateUserInput, UpdateUserInput>({
 *   prefix: '/api/v1/users',
 * })
 * ```
 */
export function createCrudApi<T, CreateInput = Partial<T>, UpdateInput = Partial<T>>(
  config: CrudApiConfig<T, CreateInput, UpdateInput>
): CrudApi<T, CreateInput, UpdateInput> {
  return new CrudApi<T, CreateInput, UpdateInput>(config)
}

// ==================== 导出类型 ====================
export type * from '../types'
