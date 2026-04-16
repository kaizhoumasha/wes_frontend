/**
 * CRUD 请求适配器组合式函数
 *
 * 简化在 Vue 组件中使用 CRUD 请求适配器。
 *
 * 支持两种更新模式：
 * 1. autoRefresh（默认）：操作后重新从服务器获取数据，确保数据一致性
 * 2. optimisticUpdate：立即更新本地状态，失败时自动回滚
 */

import { reactive, ref, shallowRef } from 'vue'
import type { Ref, ShallowRef } from 'vue'
import type { CrudRequestAdapter, QueryOptions, PaginationData } from '@/api/base/crud-request-adapter'

export interface UseCrudRequestAdapterOptions {
  autoRefresh?: boolean
  optimisticUpdate?: boolean
}

export interface CrudRequestAdapterState<T> {
  data: ShallowRef<PaginationData<T> | null>
  currentItem: ShallowRef<T | null>
  loading: Ref<boolean>
  error: Ref<Error | null>
  pagination: {
    page: number
    pageSize: number
    total: number
    pages: number
  }
}

export type EntityWithId = { id: number | string }

type CrudDeleteOptions<TAdapter extends CrudRequestAdapter<unknown, unknown, unknown>> = Parameters<TAdapter['delete']>[1]

export interface CrudRequestAdapterActions<
  T,
  CreateInput,
  UpdateInput,
  TDeleteOptions = undefined
> {
  fetchList: (options?: QueryOptions) => Promise<void>
  fetchById: (id: number) => Promise<T | null>
  create: (data: CreateInput) => Promise<T | null>
  update: (id: number, data: UpdateInput) => Promise<T | null>
  delete: (id: number, options?: TDeleteOptions) => Promise<boolean>
  refresh: () => Promise<void>
  reset: () => void
}

export function useCrudRequestAdapter<
  T extends EntityWithId,
  CreateInput = Partial<T>,
  UpdateInput = Partial<T>,
  TAdapter extends CrudRequestAdapter<T, CreateInput, UpdateInput> = CrudRequestAdapter<T, CreateInput, UpdateInput>
>(
  adapter: TAdapter,
  defaultOptions: QueryOptions & UseCrudRequestAdapterOptions = {}
): CrudRequestAdapterState<T> & CrudRequestAdapterActions<T, CreateInput, UpdateInput, CrudDeleteOptions<TAdapter>> {
  const { autoRefresh = true, optimisticUpdate = false, ...queryDefaultOptions } = defaultOptions

  if (optimisticUpdate && autoRefresh) {
    console.warn('[useCrudRequestAdapter] optimisticUpdate 和 autoRefresh 不能同时启用，将禁用 autoRefresh')
  }

  const data: ShallowRef<PaginationData<T> | null> = shallowRef(null)
  const currentItem = shallowRef<T | null>(null) as ShallowRef<T | null>
  const loading: Ref<boolean> = ref(false)
  const error: Ref<Error | null> = ref(null)

  const initialLimit = queryDefaultOptions.limit ?? 10
  const initialOffset = queryDefaultOptions.offset ?? 0

  const pagination = reactive({
    page: Math.floor(initialOffset / initialLimit) + 1,
    pageSize: initialLimit,
    total: 0,
    pages: 0,
  })

  function saveSnapshot(): PaginationData<T> | null {
    if (!data.value) return null
    try {
      return structuredClone(data.value)
    } catch {
      return JSON.parse(JSON.stringify(data.value))
    }
  }

  function rollbackToSnapshot(snapshot: PaginationData<T>, currentTotal: number) {
    data.value = snapshot
    pagination.total = currentTotal
  }

  async function fetchList(options: QueryOptions = {}): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const mergedOptions: QueryOptions = {
        offset: (pagination.page - 1) * pagination.pageSize,
        limit: pagination.pageSize,
        ...queryDefaultOptions,
        ...options,
      }

      const result = await adapter.query(mergedOptions)

      data.value = result
      pagination.page = result.page
      pagination.pageSize = result.size
      pagination.total = result.total
      pagination.pages = result.pages
    } catch (e) {
      error.value = e as Error
      console.error('Failed to fetch list:', e)
    } finally {
      loading.value = false
    }
  }

  async function fetchById(id: number): Promise<T | null> {
    loading.value = true
    error.value = null

    try {
      const result = await adapter.getById(id)
      currentItem.value = result
      return result
    } catch (e) {
      error.value = e as Error
      console.error('Failed to fetch by id:', e)
      return null
    } finally {
      loading.value = false
    }
  }

  async function create(createData: CreateInput): Promise<T | null> {
    loading.value = true
    error.value = null

    try {
      const result = await adapter.create(createData)
      if (autoRefresh || optimisticUpdate) {
        await fetchList()
      }
      return result
    } catch (e) {
      error.value = e as Error
      console.error('Failed to create:', e)
      return null
    } finally {
      loading.value = false
    }
  }

  async function update(id: number, updateData: UpdateInput): Promise<T | null> {
    loading.value = true
    error.value = null
    const snapshot = optimisticUpdate ? saveSnapshot() : null

    try {
      const result = await adapter.update(id, updateData)
      if (optimisticUpdate && data.value) {
        const index = data.value.items.findIndex(item => item.id === id)
        if (index >= 0) {
          data.value = {
            ...data.value,
            items: [
              ...data.value.items.slice(0, index),
              result,
              ...data.value.items.slice(index + 1)
            ]
          }
        }
      } else if (autoRefresh) {
        await fetchList()
      }
      return result
    } catch (e) {
      error.value = e as Error
      console.error('Failed to update:', e)
      if (optimisticUpdate && snapshot) {
        rollbackToSnapshot(snapshot, pagination.total)
        console.info('[useCrudRequestAdapter] 乐观更新已回滚: update')
      }
      return null
    } finally {
      loading.value = false
    }
  }

  async function deleteItem(id: number, options?: CrudDeleteOptions<TAdapter>): Promise<boolean> {
    loading.value = true
    error.value = null
    const snapshot = optimisticUpdate ? saveSnapshot() : null
    const previousTotal = pagination.total

    try {
      await adapter.delete(id, options)
      if (optimisticUpdate && data.value) {
        const newTotal = data.value.total - 1
        data.value = {
          ...data.value,
          items: data.value.items.filter(item => item.id !== id),
          total: newTotal
        }
        pagination.total = newTotal
      } else if (autoRefresh) {
        await fetchList()
      }
      return true
    } catch (e) {
      error.value = e as Error
      console.error('Failed to delete:', e)
      if (optimisticUpdate && snapshot) {
        rollbackToSnapshot(snapshot, previousTotal)
        console.info('[useCrudRequestAdapter] 乐观更新已回滚: delete')
      }
      return false
    } finally {
      loading.value = false
    }
  }

  async function refresh(): Promise<void> {
    await fetchList({
      offset: (pagination.page - 1) * pagination.pageSize,
      limit: pagination.pageSize,
    })
  }

  function reset(): void {
    data.value = null
    currentItem.value = null
    loading.value = false
    error.value = null
    pagination.page = Math.floor(initialOffset / initialLimit) + 1
    pagination.pageSize = initialLimit
    pagination.total = 0
    pagination.pages = 0
  }

  return {
    data,
    currentItem,
    loading,
    error,
    pagination,
    fetchList,
    fetchById,
    create,
    update,
    delete: deleteItem,
    refresh,
    reset,
  }
}

export type { CrudRequestAdapter, QueryOptions, PaginationData } from '@/api/base/crud-request-adapter'
