import { computed, reactive, ref, shallowRef, type ComputedRef, type Ref, type ShallowRef } from 'vue'
import { hasSoftDeleteCrudRequestAdapter, type CrudRequestAdapter, type PaginationData } from '@/api/base/crud-request-adapter'
import type { CrudPageViewMode } from '@/components/common/crud-page/types'

export interface CrudPaginationState {
  page: number
  pageSize: number
  total: number
}

export interface CrudTrashState<T> {
  trashData: ShallowRef<PaginationData<T> | null>
  trashLoading: Ref<boolean>
  trashError: Ref<Error | null>
  trashPagination: CrudPaginationState
  supportsTrash: ComputedRef<boolean>
  isTrashMode: ComputedRef<boolean>
  buildTrashQuery: (page?: number) => { offset: number; limit: number }
  fetchTrash: (page?: number) => Promise<PaginationData<T> | null>
  handleRestore: (id: number) => Promise<T | null>
  handlePermanentDelete: (id: number) => Promise<boolean>
}

export function useCrudTrash<
  T,
  TAdapter extends CrudRequestAdapter<T, unknown, unknown> = CrudRequestAdapter<T, unknown, unknown>
>(
  adapter: TAdapter,
  viewMode: Ref<CrudPageViewMode>,
  pageSize: number,
  options: { onAfterMutation: () => Promise<void> }
): CrudTrashState<T> {
  const trashData: ShallowRef<PaginationData<T> | null> = shallowRef(null)
  const trashLoading = ref(false)
  const trashError = ref<Error | null>(null)
  const trashPagination = reactive<CrudPaginationState>({
    page: 1,
    pageSize,
    total: 0
  })

  const supportsTrash = computed(() => hasSoftDeleteCrudRequestAdapter(adapter))
  const isTrashMode = computed(() => viewMode.value === 'trash')

  function syncPaginationState(source: PaginationData<T>): void {
    trashPagination.page = source.page
    trashPagination.pageSize = source.size
    trashPagination.total = source.total
  }

  function buildTrashQuery(page?: number): { offset: number; limit: number } {
    const resolvedPage = page ?? trashPagination.page

    return {
      offset: (resolvedPage - 1) * trashPagination.pageSize,
      limit: trashPagination.pageSize
    }
  }

  async function fetchTrash(page?: number): Promise<PaginationData<T> | null> {
    if (!hasSoftDeleteCrudRequestAdapter(adapter)) {
      return null
    }

    trashLoading.value = true
    trashError.value = null

    try {
      const result = await adapter.getTrash(buildTrashQuery(page))
      trashData.value = result
      syncPaginationState(result)
      return result
    } catch (error) {
      trashError.value = error as Error
      console.error('Failed to fetch trash list:', error)
      return null
    } finally {
      trashLoading.value = false
    }
  }

  async function handleRestore(id: number): Promise<T | null> {
    if (!hasSoftDeleteCrudRequestAdapter(adapter)) {
      return null
    }

    const result = await adapter.restore(id)
    await options.onAfterMutation()
    return result as T
  }

  async function handlePermanentDelete(id: number): Promise<boolean> {
    if (!hasSoftDeleteCrudRequestAdapter(adapter)) {
      return false
    }

    await adapter.permanentDelete(id)
    await options.onAfterMutation()
    return true
  }

  return {
    trashData,
    trashLoading,
    trashError,
    trashPagination,
    supportsTrash,
    isTrashMode,
    buildTrashQuery,
    fetchTrash,
    handleRestore,
    handlePermanentDelete
  }
}
