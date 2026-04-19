import type { Ref } from 'vue'
import type { QueryOptions } from '@/api/base/crud-request-adapter'
import type { CrudSortChange, CrudSortingState } from '@/composables/crud/useCrudSorting'
import type { CrudPaginationState, CrudTrashState } from '@/composables/crud/useCrudTrash'

export interface CrudSearchDriver {
  fetchList: (options?: QueryOptions) => Promise<void>
  pagination: {
    page: number
    pageSize: number
    total: number
  }
}

export function syncCrudPagination(
  currentPagination: CrudPaginationState,
  options: {
    isTrashMode: boolean
    trashPagination: CrudPaginationState
    crudPagination: CrudSearchDriver['pagination']
  }
): void {
  if (options.isTrashMode) {
    currentPagination.page = options.trashPagination.page
    currentPagination.pageSize = options.trashPagination.pageSize
    currentPagination.total = options.trashPagination.total
    return
  }

  currentPagination.page = options.crudPagination.page
  currentPagination.pageSize = options.crudPagination.pageSize
  currentPagination.total = options.crudPagination.total
}

export function buildCrudQueryOptions(options: {
  compileFilters: () => QueryOptions['filters']
  sortState: Ref<QueryOptions['sort']>
  page?: number
  pageSize: number
}): QueryOptions {
  const queryOptions: QueryOptions = {
    filters: options.compileFilters(),
    sort: options.sortState.value
  }

  if (options.page !== undefined) {
    queryOptions.offset = (options.page - 1) * options.pageSize
    queryOptions.limit = options.pageSize
  }

  return queryOptions
}

export function createCrudListSearchHandlers(options: {
  isTreeMode: boolean
  isTrashMode: () => boolean
  isSearchMode: Ref<boolean>
  compileFilters: () => QueryOptions['filters']
  buildQueryOptions: (page?: number) => QueryOptions
  fetchTree: () => Promise<void>
  fetchTrash: (page?: number) => Promise<unknown>
  crud: CrudSearchDriver
  trash: CrudTrashState<unknown>
  currentPagination: CrudPaginationState
  sorting: CrudSortingState
}) {
  const syncCurrentPagination = () => {
    syncCrudPagination(options.currentPagination, {
      isTrashMode: options.isTrashMode(),
      trashPagination: options.trash.trashPagination,
      crudPagination: options.crud.pagination
    })
  }

  const resetTreePagination = () => {
    options.currentPagination.page = 1
    options.currentPagination.total = 0
  }

  async function handleSearch(page?: number): Promise<void> {
    if (options.isTrashMode()) {
      options.isSearchMode.value = false
      await options.fetchTrash(page)
      syncCurrentPagination()
      return
    }

    if (options.isTreeMode) {
      const filters = options.compileFilters()
      const hasFilters = !!(filters?.conditions && filters.conditions.length > 0)

      if (hasFilters) {
        options.isSearchMode.value = true
        await options.crud.fetchList(options.buildQueryOptions(page))
        syncCurrentPagination()
      } else {
        options.isSearchMode.value = false
        await options.fetchTree()
        resetTreePagination()
      }
      return
    }

    await options.crud.fetchList(options.buildQueryOptions(page))
    syncCurrentPagination()
  }

  async function handleRefresh(): Promise<void> {
    await handleSearch(options.currentPagination.page)
  }

  async function handlePageSizeChange(size: number): Promise<void> {
    if (!Number.isFinite(size) || size <= 0) {
      return
    }

    const nextSize = Math.floor(size)

    if (options.isTrashMode()) {
      options.trash.trashPagination.pageSize = nextSize
      options.trash.trashPagination.page = 1
      syncCurrentPagination()
      await handleSearch(1)
      return
    }

    options.crud.pagination.pageSize = nextSize
    options.crud.pagination.page = 1
    syncCurrentPagination()
    await handleSearch(1)
  }

  async function handleSortChange(sort: CrudSortChange): Promise<void> {
    await options.sorting.handleSortChange(sort, {
      isTrashMode: options.isTrashMode(),
      onSorted: async () => handleSearch(1)
    })
  }

  return {
    syncCurrentPagination,
    handleSearch,
    handleRefresh,
    handlePageSizeChange,
    handleSortChange
  }
}
