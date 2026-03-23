/**
 * 合同驱动的 CRUD API 基础封装
 *
 * 以生成的 OpenAPI 契约作为编译期单一来源，
 * 对外只暴露页面层真正需要的 CRUD 能力。
 */

import { contractClient } from '@/api/contract/client'
import type {
  ContractPath,
  ContractPathWithMethod,
  ContractPathParams,
  ContractQueryParams,
  ContractRequestBody,
  ContractRequestConfig,
  ContractResponseData,
} from '@/api/contract/types'
import { z } from 'zod'
import {
  BatchOperationResultSchema,
  FilterConditionSchema,
  FilterGroupSchema,
  FilterOperatorSchema,
  QueryOptionsSchema,
  SortFieldSchema,
} from '@/types/zod-extensions'

/**
 * 单个筛选条件支持的操作符。
 */
export type FilterOperator = z.infer<typeof FilterOperatorSchema>

/**
 * 单个筛选条件的输入结构。
 */
export type FilterCondition = z.input<typeof FilterConditionSchema>

/**
 * 筛选组的连接方式。
 */
export type FilterCouple = NonNullable<z.input<typeof FilterGroupSchema>['couple']>

/**
 * 筛选组输入结构，可嵌套组合多个条件。
 */
export type FilterGroup = z.input<typeof FilterGroupSchema>

/**
 * 排序字段输入结构。
 */
export type SortField = z.input<typeof SortFieldSchema>

/**
 * 列表查询参数输入结构。
 */
export type QueryOptions = z.input<typeof QueryOptionsSchema>

/**
 * 批量操作结果类型。
 */
export type BatchOperationResult = z.infer<typeof BatchOperationResultSchema>

/**
 * 页面层统一使用的分页结构。
 */
export interface PaginationData<TItem> {
  items: TItem[]
  total: number
  page: number
  size: number
  pages: number
}

interface ContractListResponse<TItem> {
  items?: TItem[]
  limit: number
  offset: number
  total: number
}

/**
 * 通用 CRUD 接口抽象。
 *
 * 约束：
 * - 单项详情走 `/{id}`
 * - 列表查询走 `/query`
 * - 创建走资源集合 `POST`
 * - 更新走 `/{id}` 的 `PUT`
 * - 删除走 `/{id}` 的 `DELETE`
 */
export interface CrudApi<
  TItem,
  TCreate,
  TUpdate,
  TDetailQuery = never,
  TQuery = QueryOptions,
  TCreateResult = TItem,
  TUpdateResult = TItem,
  TDeleteQuery = never,
  TDeleteResult = unknown,
> {
  getById(id: number, options?: {
    query?: TDetailQuery
    config?: ContractRequestConfig
  }): Promise<TItem>
  query(options?: TQuery, config?: ContractRequestConfig): Promise<PaginationData<TItem>>
  create(data: TCreate, config?: ContractRequestConfig): Promise<TCreateResult>
  update(id: number, data: TUpdate, config?: ContractRequestConfig): Promise<TUpdateResult>
  delete(id: number, options?: {
    query?: TDeleteQuery
    config?: ContractRequestConfig
  }): Promise<TDeleteResult>
}

/**
 * 由集合路径推导出的单项路径，例如 `/api/v1/users` -> `/api/v1/users/{id}`。
 */
export type CrudItemPath<TCollectionPath extends ContractPath> =
  Extract<`${TCollectionPath}/{id}`, ContractPath>

/**
 * 由集合路径推导出的查询路径，例如 `/api/v1/users` -> `/api/v1/users/query`。
 */
export type CrudQueryPath<TCollectionPath extends ContractPath> =
  Extract<`${TCollectionPath}/query`, ContractPath>

/**
 * 根据资源集合路径推导出的详情响应数据类型。
 */
export type CrudItem<TCollectionPath extends ContractPath> =
  ContractResponseData<CrudItemPath<TCollectionPath>, 'get'>

/**
 * 根据资源集合路径推导出的创建入参类型。
 */
export type CrudCreateInput<TCollectionPath extends ContractPath> =
  ContractRequestBody<TCollectionPath, 'post'>

/**
 * 根据资源集合路径推导出的更新入参类型。
 */
export type CrudUpdateInput<TCollectionPath extends ContractPath> =
  ContractRequestBody<CrudItemPath<TCollectionPath>, 'put'>

type CrudCompatibleItemPath = {
  [TPath in ContractPathWithMethod<'get'> & ContractPathWithMethod<'put'> & ContractPathWithMethod<'delete'>]:
    ContractResponseData<TPath, 'put'> extends ContractResponseData<TPath, 'get'>
      ? TPath
      : never
}[ContractPathWithMethod<'get'> & ContractPathWithMethod<'put'> & ContractPathWithMethod<'delete'>]

type CrudCompatibleQueryPath<TItemPath extends CrudCompatibleItemPath> = {
  [TPath in ContractPathWithMethod<'post'>]:
    ContractResponseData<TPath, 'post'> extends ContractListResponse<ContractResponseData<TItemPath, 'get'>>
      ? TPath
      : never
}[ContractPathWithMethod<'post'>]

type CrudManagedItemPath<TCollectionPath extends ContractPath> = Extract<
  CrudItemPath<TCollectionPath>,
  CrudCompatibleItemPath
>

type CrudManagedQueryPath<TCollectionPath extends ContractPath> = Extract<
  CrudQueryPath<TCollectionPath>,
  CrudCompatibleQueryPath<CrudManagedItemPath<TCollectionPath>>
>

export type CrudResourceCollectionPath = {
  [TPath in ContractPathWithMethod<'post'>]:
    [CrudManagedItemPath<TPath>] extends [never]
      ? never
      : [CrudManagedQueryPath<TPath>] extends [never]
        ? never
        : ContractResponseData<TPath, 'post'> extends CrudItem<TPath>
          ? TPath
          : never
}[ContractPathWithMethod<'post'>]

interface ContractCrudEndpoints<
  TCollectionPath extends ContractPathWithMethod<'post'>,
  TItemPath extends ContractPathWithMethod<'get'> & ContractPathWithMethod<'put'> & ContractPathWithMethod<'delete'>,
  TQueryPath extends ContractPathWithMethod<'post'>,
> {
  collection: TCollectionPath
  item: TItemPath
  query: TQueryPath
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

function toPaginationData<TItem>(response: ContractListResponse<TItem>): PaginationData<TItem> {
  const size = response.limit
  const page = size > 0 ? Math.floor(response.offset / size) + 1 : 1

  return {
    items: response.items ?? [],
    total: response.total,
    page,
    size,
    pages: size > 0 ? Math.ceil(response.total / size) : 0
  }
}

function normalizeQueryRequest<TQuery>(options: TQuery | undefined): TQuery | undefined {
  if (
    !options ||
    typeof options !== 'object' ||
    !('filters' in options)
  ) {
    return options
  }

  const queryOptions = options as TQuery & { filters?: FilterGroup | null }

  return {
    ...queryOptions,
    filters: normalizeFilterGroup(queryOptions.filters)
  } as TQuery
}

function createIdParams<TPath extends ContractPath, TMethod extends 'get' | 'put' | 'delete'>(
  id: number
): ContractPathParams<TPath, TMethod> {
  return { id } as unknown as ContractPathParams<TPath, TMethod>
}

function assertContractListResponse<TItem>(result: unknown): asserts result is ContractListResponse<TItem> {
  if (
    typeof result !== 'object' ||
    result === null ||
    !('limit' in result) ||
    !('offset' in result) ||
    !('total' in result)
  ) {
    throw new Error('Invalid CRUD query response shape')
  }
}

/**
 * 在现有筛选条件末尾追加一个 `and` 条件。
 *
 * 用途：
 * - 页面传入已有筛选树时，继续叠加业务限制
 * - 保证最终结构始终是合法的筛选组
 */
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
 * 基于显式端点定义创建 CRUD API。
 *
 * 适合：
 * - 标准资源 CRUD
 * - 需要明确声明 collection/item/query 路径的场景
 * - 不希望依赖路径拼接约定的场景
 */
export function createCrudApi<
  TCollectionPath extends ContractPathWithMethod<'post'>,
  TItemPath extends ContractPathWithMethod<'get'> & ContractPathWithMethod<'put'> & ContractPathWithMethod<'delete'>,
  TQueryPath extends ContractPathWithMethod<'post'>,
>(
  endpoints: ContractCrudEndpoints<TCollectionPath, TItemPath, TQueryPath>
): CrudApi<
  ContractResponseData<TItemPath, 'get'>,
  ContractRequestBody<TCollectionPath, 'post'>,
  ContractRequestBody<TItemPath, 'put'>,
  ContractQueryParams<TItemPath, 'get'>,
  ContractRequestBody<TQueryPath, 'post'>,
  ContractResponseData<TCollectionPath, 'post'>,
  ContractResponseData<TItemPath, 'put'>,
  ContractQueryParams<TItemPath, 'delete'>,
  ContractResponseData<TItemPath, 'delete'>
> {
  type Item = ContractResponseData<TItemPath, 'get'>

  return {
    async getById(id, options) {
      return await contractClient.get(endpoints.item, {
        params: createIdParams<TItemPath, 'get'>(id),
        query: options?.query,
        config: options?.config
      })
    },

    async query(options, config) {
      const response = await contractClient.post(endpoints.query, {
        body: normalizeQueryRequest(options),
        config
      })
      assertContractListResponse<Item>(response)

      return toPaginationData(response)
    },

    async create(data, config) {
      const response = await contractClient.post(endpoints.collection, {
        body: data,
        config
      })

      return response
    },

    async update(id, data, config) {
      const response = await contractClient.put(endpoints.item, {
        params: createIdParams<TItemPath, 'put'>(id),
        body: data,
        config
      })

      return response
    },

    async delete(id, options) {
      return await contractClient.delete(endpoints.item, {
        params: createIdParams<TItemPath, 'delete'>(id),
        query: options?.query,
        config: options?.config
      })
    }
  }
}

/**
 * 基于资源集合路径创建标准 CRUD API。
 *
 * 约束：
 * - `collection` 必须是真实存在于 OpenAPI 契约中的标准 CRUD 资源根路径
 * - 其下必须同时存在 `/{id}` 与 `/query` 两类标准端点
 *
 * 适合：
 * - 后端遵循统一 BaseAPI/CRUD 约定的资源
 * - 若资源不满足该约定，请直接使用 `createCrudApi`
 */
export function createCrudResourceApi<TCollectionPath extends CrudResourceCollectionPath>(
  collection: TCollectionPath
) {
  const item = `${collection}/{id}` as CrudManagedItemPath<TCollectionPath>
  const query = `${collection}/query` as CrudManagedQueryPath<TCollectionPath>

  return createCrudApi({
    collection,
    item,
    query
  })
}
