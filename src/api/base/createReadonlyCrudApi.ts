import type { ContractRequestConfig } from '@/api/contract/types'
import type { CrudApi, FilterGroup, PaginationData, QueryOptionsInput } from './crud-api'

interface ReadonlyListResponse<TItem> {
  items?: TItem[]
  total: number
  limit: number
  offset: number
}

export interface ReadonlyCrudApiSource<
  TItem,
  TDetailQuery = never,
  TQueryInput extends QueryOptionsInput = QueryOptionsInput
> {
  getById: (
    params: { id: number },
    query?: TDetailQuery,
    config?: ContractRequestConfig
  ) => Promise<TItem>
  query: (body: TQueryInput, config?: ContractRequestConfig) => Promise<ReadonlyListResponse<TItem>>
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

function normalizeQueryInput<TQuery extends QueryOptionsInput>(options?: TQuery): TQuery {
  const defaults = {
    offset: 0,
    limit: 10,
    max_depth: 1,
    include_deleted: false
  }

  if (!options || typeof options !== 'object') {
    return { ...defaults } as TQuery
  }

  return {
    ...options,
    offset: options.offset ?? defaults.offset,
    limit: options.limit ?? defaults.limit,
    max_depth: options.max_depth ?? defaults.max_depth,
    include_deleted: options.include_deleted ?? defaults.include_deleted,
    filters: normalizeFilterGroup(options.filters)
  } as TQuery
}

function toPaginationData<TItem>(response: ReadonlyListResponse<TItem>): PaginationData<TItem> {
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

function assertListResponse<TItem>(response: unknown): asserts response is ReadonlyListResponse<TItem> {
  if (
    typeof response !== 'object'
    || response === null
    || !('total' in response)
    || !('limit' in response)
    || !('offset' in response)
  ) {
    throw new Error('Invalid readonly CRUD query response shape')
  }
}

function unsupported(action: 'create' | 'update' | 'delete'): never {
  throw new Error(`Readonly CRUD API does not support ${action}`)
}

export function createReadonlyCrudApi<
  TItem,
  TDetailQuery = never,
  TQueryInput extends QueryOptionsInput = QueryOptionsInput
>(
  source: ReadonlyCrudApiSource<TItem, TDetailQuery, TQueryInput>
): CrudApi<TItem, Record<string, never>, Record<string, never>, TDetailQuery, TQueryInput> {
  return {
    async getById(id, options) {
      return await source.getById({ id }, options?.query, options?.config)
    },

    async query(options, config) {
      const response = await source.query(normalizeQueryInput(options), config)
      assertListResponse<TItem>(response)
      return toPaginationData(response)
    },

    async create() {
      unsupported('create')
    },

    async update() {
      unsupported('update')
    },

    async delete() {
      unsupported('delete')
    }
  }
}
