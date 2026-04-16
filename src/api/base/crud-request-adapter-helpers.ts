import type {
  ContractPath,
  ContractPathParams
} from '@/api/contract/types'
type FilterCondition = unknown
type FilterGroup = {
  couple?: string
  conditions?: Array<FilterCondition | FilterGroup>
}
type PaginationData<TItem> = {
  items: TItem[]
  total: number
  page: number
  size: number
  pages: number
}
type QueryOptionsInput = {
  filters?: FilterGroup | null
  sort?: unknown[] | null
  offset?: number
  limit?: number
  max_depth?: number
  include_deleted?: boolean
}

interface ContractListResponse<TItem> {
  items?: TItem[]
  limit: number
  offset: number
  total: number
}

export function normalizeFilterGroup(filters: FilterGroup | null | undefined): FilterGroup | undefined {
  if (!filters) {
    return undefined
  }

  return {
    couple: filters.couple ?? 'and',
    conditions: filters.conditions ?? []
  }
}

export function toPaginationData<TItem>(response: ContractListResponse<TItem>): PaginationData<TItem> {
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

export function normalizeQueryRequest<TQuery>(options: TQuery | undefined): TQuery | undefined {
  const defaults: Required<Pick<QueryOptionsInput, 'offset' | 'limit' | 'max_depth' | 'include_deleted'>> = {
    offset: 0,
    limit: 10,
    max_depth: 1,
    include_deleted: false
  }

  if (!options || typeof options !== 'object') {
    return { ...defaults } as TQuery
  }

  const queryOptions = options as TQuery & QueryOptionsInput
  const withDefaults = {
    offset: queryOptions.offset ?? defaults.offset,
    limit: queryOptions.limit ?? defaults.limit,
    max_depth: queryOptions.max_depth ?? defaults.max_depth,
    include_deleted: queryOptions.include_deleted ?? defaults.include_deleted,
    ...queryOptions
  }

  if ('filters' in queryOptions) {
    return {
      ...withDefaults,
      filters: normalizeFilterGroup(queryOptions.filters)
    } as TQuery
  }

  return withDefaults as TQuery
}

export function createIdParams<
  TPath extends ContractPath,
  TMethod extends 'get' | 'post' | 'put' | 'delete'
>(id: number): ContractPathParams<TPath, TMethod> {
  return { id } as unknown as ContractPathParams<TPath, TMethod>
}

export function assertContractListResponse<TItem>(
  result: unknown
): asserts result is ContractListResponse<TItem> {
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

export function normalizeBatchIds(ids: number[]): number[] {
  const normalized = Array.from(new Set(ids.map(id => Number(id)).filter(id => Number.isInteger(id) && id > 0)))

  if (normalized.length === 0) {
    console.warn('[normalizeBatchIds] 无有效 ID，操作将被跳过')
  }

  return normalized
}

export function withJsonContentType(config?: { headers?: Record<string, string> }) {
  return {
    ...config,
    headers: {
      'Content-Type': 'application/json',
      ...config?.headers
    }
  }
}
