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
 * 支持软删除资源的统一扩展接口。
 */
export interface SoftDeleteCrudApi<
  TItem,
  TCreate,
  TUpdate,
  TDetailQuery = never,
  TQuery = QueryOptions,
  TCreateResult = TItem,
  TUpdateResult = TItem,
  TDeleteQuery = never,
  TDeleteResult = unknown,
  TTrashQuery = { offset?: number; limit?: number },
  TRestoreResult = TItem,
  TBatchRestoreResult = BatchOperationResult,
  TBatchPermanentDeleteResult = BatchOperationResult,
  TBatchDeleteResult = BatchOperationResult,
> extends CrudApi<
  TItem,
  TCreate,
  TUpdate,
  TDetailQuery,
  TQuery,
  TCreateResult,
  TUpdateResult,
  TDeleteQuery,
  TDeleteResult
> {
  getTrash(options?: TTrashQuery, config?: ContractRequestConfig): Promise<PaginationData<TItem>>
  restore(id: number, config?: ContractRequestConfig): Promise<TRestoreResult>
  permanentDelete(id: number, config?: ContractRequestConfig): Promise<TDeleteResult>
  /** 批量删除，如后端有 /bulk 端点则使用，否则降级为逐个删除 */
  batchDelete(ids: number[], config?: ContractRequestConfig): Promise<TBatchDeleteResult>
  batchRestore(ids: number[], config?: ContractRequestConfig): Promise<TBatchRestoreResult>
  batchPermanentDelete(
    ids: number[],
    config?: ContractRequestConfig
  ): Promise<TBatchPermanentDeleteResult>
}

/**
 * 由集合路径推导出的批量删除路径，例如 `/api/v1/users` -> `/api/v1/users/bulk`。
 */
export type CrudBulkDeletePath<TCollectionPath extends ContractPath> =
  Extract<`${TCollectionPath}/bulk`, ContractPathWithMethod<'delete'>>

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

/**
 * 由集合路径推导出的恢复路径，例如 `/api/v1/users` -> `/api/v1/users/{id}/restore`。
 */
export type CrudRestorePath<TCollectionPath extends ContractPath> =
  Extract<`${CrudItemPath<TCollectionPath>}/restore`, ContractPath>

/**
 * 由集合路径推导出的回收站列表路径，例如 `/api/v1/users` -> `/api/v1/users/trash`。
 */
export type CrudTrashPath<TCollectionPath extends ContractPath> =
  Extract<`${TCollectionPath}/trash`, ContractPath>

/**
 * 由集合路径推导出的批量恢复路径，例如 `/api/v1/users` -> `/api/v1/users/trash/restore`。
 */
export type CrudTrashRestorePath<TCollectionPath extends ContractPath> =
  Extract<`${CrudTrashPath<TCollectionPath>}/restore`, ContractPath>

/**
 * 由集合路径推导出的批量永久删除路径，例如 `/api/v1/users` -> `/api/v1/users/trash/permanent`。
 */
export type CrudTrashPermanentDeletePath<TCollectionPath extends ContractPath> =
  Extract<`${CrudTrashPath<TCollectionPath>}/permanent`, ContractPath>

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

type SoftDeleteManagedRestorePath<TCollectionPath extends CrudResourceCollectionPath> = Extract<
  CrudRestorePath<TCollectionPath>,
  ContractPathWithMethod<'post'>
>

type SoftDeleteManagedTrashPath<TCollectionPath extends CrudResourceCollectionPath> = Extract<
  CrudTrashPath<TCollectionPath>,
  ContractPathWithMethod<'get'>
>

type SoftDeleteManagedTrashRestorePath<TCollectionPath extends CrudResourceCollectionPath> = Extract<
  CrudTrashRestorePath<TCollectionPath>,
  ContractPathWithMethod<'post'>
>

type SoftDeleteManagedTrashPermanentDeletePath<TCollectionPath extends CrudResourceCollectionPath> = Extract<
  CrudTrashPermanentDeletePath<TCollectionPath>,
  ContractPathWithMethod<'delete'>
>

export type SoftDeleteCrudResourceCollectionPath = {
  [TPath in CrudResourceCollectionPath]:
    [SoftDeleteManagedRestorePath<TPath>] extends [never]
      ? never
      : [SoftDeleteManagedTrashPath<TPath>] extends [never]
        ? never
        : [SoftDeleteManagedTrashRestorePath<TPath>] extends [never]
          ? never
          : [SoftDeleteManagedTrashPermanentDeletePath<TPath>] extends [never]
            ? never
            : TPath
}[CrudResourceCollectionPath]

interface ContractCrudEndpoints<
  TCollectionPath extends ContractPathWithMethod<'post'>,
  TItemPath extends ContractPathWithMethod<'get'> & ContractPathWithMethod<'put'> & ContractPathWithMethod<'delete'>,
  TQueryPath extends ContractPathWithMethod<'post'>,
> {
  collection: TCollectionPath
  item: TItemPath
  query: TQueryPath
}

interface ContractSoftDeleteEndpoints<
  TCollectionPath extends ContractPathWithMethod<'post'>,
  TItemPath extends ContractPathWithMethod<'get'> & ContractPathWithMethod<'put'> & ContractPathWithMethod<'delete'>,
  TQueryPath extends ContractPathWithMethod<'post'>,
  TRestorePath extends ContractPathWithMethod<'post'>,
  TTrashPath extends ContractPathWithMethod<'get'>,
  TTrashRestorePath extends ContractPathWithMethod<'post'>,
  TTrashPermanentDeletePath extends ContractPathWithMethod<'delete'>,
  TBulkDeletePath extends ContractPathWithMethod<'delete'> = never,
> extends ContractCrudEndpoints<TCollectionPath, TItemPath, TQueryPath> {
  restore: TRestorePath
  trash: TTrashPath
  trashRestore: TTrashRestorePath
  trashPermanentDelete: TTrashPermanentDeletePath
  bulkDelete?: TBulkDeletePath
}

type CrudResourceApi<TCollectionPath extends CrudResourceCollectionPath> = CrudApi<
  CrudItem<TCollectionPath>,
  CrudCreateInput<TCollectionPath>,
  CrudUpdateInput<TCollectionPath>,
  ContractQueryParams<CrudManagedItemPath<TCollectionPath>, 'get'>,
  ContractRequestBody<CrudManagedQueryPath<TCollectionPath>, 'post'>,
  ContractResponseData<TCollectionPath, 'post'>,
  ContractResponseData<CrudManagedItemPath<TCollectionPath>, 'put'>,
  ContractQueryParams<CrudManagedItemPath<TCollectionPath>, 'delete'>,
  ContractResponseData<CrudManagedItemPath<TCollectionPath>, 'delete'>
>

type SoftDeleteCrudResourceApi<TCollectionPath extends SoftDeleteCrudResourceCollectionPath> =
  SoftDeleteCrudApi<
    CrudItem<TCollectionPath>,
    CrudCreateInput<TCollectionPath>,
    CrudUpdateInput<TCollectionPath>,
    ContractQueryParams<CrudManagedItemPath<TCollectionPath>, 'get'>,
    ContractRequestBody<CrudManagedQueryPath<TCollectionPath>, 'post'>,
    ContractResponseData<TCollectionPath, 'post'>,
    ContractResponseData<CrudManagedItemPath<TCollectionPath>, 'put'>,
    ContractQueryParams<CrudManagedItemPath<TCollectionPath>, 'delete'>,
    ContractResponseData<CrudManagedItemPath<TCollectionPath>, 'delete'>,
    ContractQueryParams<SoftDeleteManagedTrashPath<TCollectionPath>, 'get'>,
    ContractResponseData<SoftDeleteManagedRestorePath<TCollectionPath>, 'post'>,
    ContractResponseData<SoftDeleteManagedTrashRestorePath<TCollectionPath>, 'post'>,
    ContractResponseData<SoftDeleteManagedTrashPermanentDeletePath<TCollectionPath>, 'delete'>
  >

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

function createIdParams<TPath extends ContractPath, TMethod extends 'get' | 'post' | 'put' | 'delete'>(
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

function normalizeBatchIds(ids: number[]): number[] {
  return Array.from(
    new Set(
      ids
        .map(id => Number(id))
        .filter(id => Number.isInteger(id) && id > 0)
    )
  )
}

/**
 * 运行时判断某个 API 是否具备软删除扩展能力。
 */
export function hasSoftDeleteCrudApi<
  TItem,
  TCreate,
  TUpdate,
>(
  api: CrudApi<TItem, TCreate, TUpdate>
): api is SoftDeleteCrudApi<TItem, TCreate, TUpdate> {
  return (
    'getTrash' in api &&
    'restore' in api &&
    'permanentDelete' in api &&
    'batchRestore' in api &&
    'batchPermanentDelete' in api
  )
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
 * 基于显式端点定义创建支持回收站能力的 CRUD API。
 */
export function createSoftDeleteCrudApi<
  TCollectionPath extends ContractPathWithMethod<'post'>,
  TItemPath extends ContractPathWithMethod<'get'> & ContractPathWithMethod<'put'> & ContractPathWithMethod<'delete'>,
  TQueryPath extends ContractPathWithMethod<'post'>,
  TRestorePath extends ContractPathWithMethod<'post'>,
  TTrashPath extends ContractPathWithMethod<'get'>,
  TTrashRestorePath extends ContractPathWithMethod<'post'>,
  TTrashPermanentDeletePath extends ContractPathWithMethod<'delete'>,
  TBulkDeletePath extends ContractPathWithMethod<'delete'> = never,
>(
  endpoints: ContractSoftDeleteEndpoints<
    TCollectionPath,
    TItemPath,
    TQueryPath,
    TRestorePath,
    TTrashPath,
    TTrashRestorePath,
    TTrashPermanentDeletePath,
    TBulkDeletePath
  >
): SoftDeleteCrudApi<
  ContractResponseData<TItemPath, 'get'>,
  ContractRequestBody<TCollectionPath, 'post'>,
  ContractRequestBody<TItemPath, 'put'>,
  ContractQueryParams<TItemPath, 'get'>,
  ContractRequestBody<TQueryPath, 'post'>,
  ContractResponseData<TCollectionPath, 'post'>,
  ContractResponseData<TItemPath, 'put'>,
  ContractQueryParams<TItemPath, 'delete'>,
  ContractResponseData<TItemPath, 'delete'>,
  ContractQueryParams<TTrashPath, 'get'>,
  ContractResponseData<TRestorePath, 'post'>,
  ContractResponseData<TTrashRestorePath, 'post'>,
  ContractResponseData<TTrashPermanentDeletePath, 'delete'>
> {
  type Item = ContractResponseData<TItemPath, 'get'>
  const baseApi = createCrudApi(endpoints)

  return {
    ...baseApi,

    async getTrash(options, config) {
      const response = await contractClient.get(endpoints.trash, {
        query: options,
        config
      })
      assertContractListResponse<Item>(response)

      return toPaginationData(response)
    },

    async restore(id, config) {
      return await contractClient.post(endpoints.restore, {
        params: createIdParams<TRestorePath, 'post'>(id),
        config
      })
    },

    async permanentDelete(id, config) {
      return await contractClient.delete(endpoints.item, {
        params: createIdParams<TItemPath, 'delete'>(id),
        query: { permanent: true } as ContractQueryParams<TItemPath, 'delete'>,
        config
      })
    },

    async batchRestore(ids, config) {
      const normalizedIds = normalizeBatchIds(ids)

      return await contractClient.post(endpoints.trashRestore, {
        body: JSON.stringify(normalizedIds) as unknown as ContractRequestBody<TTrashRestorePath, 'post'>,
        config: {
          ...config,
          headers: {
            'Content-Type': 'application/json',
            ...config?.headers
          }
        }
      })
    },

    async batchPermanentDelete(ids, config) {
      const normalizedIds = normalizeBatchIds(ids)

      return await contractClient.delete(endpoints.trashPermanentDelete, {
        body: JSON.stringify(normalizedIds) as unknown as ContractRequestBody<TTrashPermanentDeletePath, 'delete'>,
        config: {
          ...config,
          headers: {
            'Content-Type': 'application/json',
            ...config?.headers
          }
        }
      })
    },

    async batchDelete(ids, config): Promise<BatchOperationResult> {
      const normalizedIds = normalizeBatchIds(ids)

      // 如果没有 bulkDelete 端点，使用 baseApi.delete 逐个删除并聚合结果
      if (!endpoints.bulkDelete) {
        const results = await Promise.allSettled(
          normalizedIds.map(id => baseApi.delete(id))
        )
        const success = results.filter(r => r.status === 'fulfilled').length
        const failed = results.length - success
        return { success, failed, total: normalizedIds.length }
      }

      const result = await contractClient.delete(endpoints.bulkDelete, {
        body: JSON.stringify(normalizedIds) as unknown as ContractRequestBody<TBulkDeletePath, 'delete'>,
        config: {
          ...config,
          headers: {
            'Content-Type': 'application/json',
            ...config?.headers
          }
        }
      })

      // 确保返回类型一致
      return result as BatchOperationResult
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
) : CrudResourceApi<TCollectionPath> {
  const item = `${collection}/{id}` as CrudManagedItemPath<TCollectionPath>
  const query = `${collection}/query` as CrudManagedQueryPath<TCollectionPath>

  return createCrudApi({
    collection,
    item,
    query
  })
}

/**
 * 基于资源集合路径创建支持软删除的 CRUD API。
 *
 * 约束：
 * - `collection` 必须同时具备 `/trash`、`/{id}/restore`、`/trash/restore`、
 *   `/trash/permanent` 四类标准软删除端点
 */
export function createSoftDeleteCrudResourceApi<
  TCollectionPath extends SoftDeleteCrudResourceCollectionPath
>(
  collection: TCollectionPath
): SoftDeleteCrudResourceApi<TCollectionPath> {
  const item = `${collection}/{id}` as CrudManagedItemPath<TCollectionPath>
  const query = `${collection}/query` as CrudManagedQueryPath<TCollectionPath>
  const restore = `${item}/restore` as SoftDeleteManagedRestorePath<TCollectionPath>
  const trash = `${collection}/trash` as SoftDeleteManagedTrashPath<TCollectionPath>
  const trashRestore = `${trash}/restore` as SoftDeleteManagedTrashRestorePath<TCollectionPath>
  const trashPermanentDelete =
    `${trash}/permanent` as SoftDeleteManagedTrashPermanentDeletePath<TCollectionPath>

  return createSoftDeleteCrudApi({
    collection,
    item,
    query,
    restore,
    trash,
    trashRestore,
    trashPermanentDelete
  })
}
