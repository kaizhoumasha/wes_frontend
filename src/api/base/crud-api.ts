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
import type { ApiResponse, PaginationData } from '../types'
import { API_CACHE_DURATION, API_RELATION_DEPTH } from '@/constants/cache'

// ==================== 类型定义 ====================

export type FilterOperator =
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

export interface FilterCondition {
  field: string
  op: FilterOperator
  value?: unknown | null
}

export type FilterCouple = 'and' | 'or' | 'not'

export interface FilterGroup {
  couple?: FilterCouple
  conditions?: Array<FilterCondition | FilterGroup>
}

export interface SortField {
  field: string
  order?: 'asc' | 'desc'
}

export interface QueryOptions {
  filters?: FilterGroup | null
  sort?: SortField[] | null
  offset?: number
  limit?: number
  max_depth?: number
  include_deleted?: boolean
}

function normalizeFilterGroup(filters: FilterGroup | null | undefined): FilterGroup | undefined {
  if (!filters) {
    return undefined
  }

  return {
    couple: filters.couple ?? 'and',
    conditions: filters.conditions ?? []
  }
}

export function appendAndFilter(
  baseFilters: FilterGroup | null | undefined,
  nextFilter: FilterCondition | FilterGroup
): FilterGroup {
  const normalizedBaseFilters = normalizeFilterGroup(baseFilters)

  if (!normalizedBaseFilters) {
    return {
      couple: 'and',
      conditions: [nextFilter]
    }
  }

  if (normalizedBaseFilters.couple === 'and') {
    return {
      couple: 'and',
      conditions: [...(normalizedBaseFilters.conditions ?? []), nextFilter]
    }
  }

  return {
    couple: 'and',
    conditions: [normalizedBaseFilters, nextFilter]
  }
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
 * const users = await userApi.query({ offset: 0, limit: 10 })
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
   * @param options 选项配置（向后兼容：支持数字作为 maxDepth）
   * @param options.maxDepth 关系加载深度（默认2）
   * @param options.cacheFor 缓存时间（毫秒），0=禁用缓存
   * @returns 实体数据
   *
   * @example
   * // 向后兼容：直接传数字
   * await userApi.getById(1, 3)
   * // 新用法：传对象
   * await userApi.getById(1, { maxDepth: 3, cacheFor: 60000 })
   */
  async getById(
    id: number,
    options?: number | { maxDepth?: number; cacheFor?: number }
  ): Promise<T> {
    // 向后兼容：支持直接传数字作为 maxDepth
    let maxDepth: number = API_RELATION_DEPTH.DEFAULT
    let cacheFor: number = API_CACHE_DURATION.NONE

    if (typeof options === 'number') {
      // 旧用法：getById(id, maxDepth)
      maxDepth = options
    } else if (options && typeof options === 'object') {
      // 新用法：getById(id, { maxDepth, cacheFor })
      maxDepth = options.maxDepth ?? API_RELATION_DEPTH.DEFAULT
      cacheFor = options.cacheFor ?? API_CACHE_DURATION.NONE
    }

    const response = await apiClient.Get<ApiResponse<T>>(
      `${this.config.prefix}/${id}`,
      {
        params: { max_depth: maxDepth as number },
        cacheFor
      }
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
      limit = 10,
      offset = 0,
      filters,
      sort,
      max_depth = 1,
      include_deleted = false
    } = options
    const currentPage = Math.floor(offset / limit) + 1
    const normalizedFilters = normalizeFilterGroup(filters)

    const response = await apiClient.Post<ApiResponse<PaginationData<T>>>(
      `${this.config.prefix}/query`,
      {
        limit,
        offset,
        filters: normalizedFilters,
        sort,
        max_depth,
        include_deleted
      } as Record<string, unknown>
    )

    const data = response as unknown as PaginationData<T>
    // 转换为标准分页格式
    return {
      items: data.items,
      total: data.total,
      page: currentPage,
      size: limit,
      pages: Math.ceil(data.total / limit)
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
    const response = await apiClient.Post<ApiResponse<T>>(`${this.config.prefix}/${id}/restore`, {})
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
        limit: pageSize
      } as Record<string, unknown>
    )

    const data = response as unknown as PaginationData<T>
    return {
      items: data.items,
      total: data.total,
      page,
      size: pageSize,
      pages: Math.ceil(data.total / pageSize)
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
