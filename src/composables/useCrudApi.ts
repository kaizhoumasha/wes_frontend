/**
 * CRUD API 组合式函数
 *
 * 简化在 Vue 组件中使用 CRUD API
 *
 * 支持两种更新模式：
 * 1. autoRefresh（默认）：操作后重新从服务器获取数据，确保数据一致性
 * 2. optimisticUpdate：立即更新本地状态，失败时自动回滚
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { userApi } from '@/api/modules/user'
 * import { useCrudApi } from '@/composables/useCrudApi'
 *
 * const {
 *   data,
 *   loading,
 *   error,
 *   pagination,
 *   fetchList,
 *   fetchById,
 *   create,
 *   update,
 *   delete: deleteItem,
 * } = useCrudApi(userApi)
 *
 * // 初始化加载数据
 * onMounted(() => {
 *   fetchList({ offset: 0, limit: 10 })
 * })
 * </script>
 *
 * <template>
 *   <div v-if="loading">加载中...</div>
 *   <div v-else-if="error">{{ error }}</div>
 *   <ul v-else>
 *     <li v-for="item in data?.items" :key="item.id">
 *       {{ item.name }}
 *     </li>
 *   </ul>
 *   <button @click="fetchList({ offset: pagination.page * pagination.pageSize, limit: pagination.pageSize })">下一页</button>
 * </template>
 * ```
 */

import { reactive, ref, shallowRef } from 'vue'
import type { Ref, ShallowRef } from 'vue'
import type { CrudApi, QueryOptions, PaginationData } from '@/api/base/crud-api'

// ==================== 类型定义 ====================

/**
 * useCrudApi 配置选项
 */
export interface UseCrudApiOptions {
  /** 是否在 CRUD 操作后自动刷新列表（默认 true） */
  autoRefresh?: boolean
  /** 是否使用乐观更新（默认 false）
   *
   * 注意：乐观更新会增加复杂度，如果不需要立即反馈，建议使用 autoRefresh
   */
  optimisticUpdate?: boolean
}

/**
 * CRUD API 状态（使用 ShallowRef 避免深度响应式问题）
 */
export interface CrudApiState<T> {
  /** 数据列表 */
  data: ShallowRef<PaginationData<T> | null>
  /** 当前单项数据 */
  currentItem: ShallowRef<T | null>
  /** 加载状态 */
  loading: Ref<boolean>
  /** 错误信息 */
  error: Ref<Error | null>
  /** 分页信息 */
  pagination: {
    page: number
    pageSize: number
    total: number
    pages: number
  }
}

/**
 * 实体必须有 id 属性
 */
export type EntityWithId = { id: number | string }

/**
 * CRUD API 操作
 */
export interface CrudApiActions<T, CreateInput, UpdateInput> {
  /** 查询列表 */
  fetchList: (options?: QueryOptions) => Promise<void>
  /** 获取单个 */
  fetchById: (id: number) => Promise<T | null>
  /** 创建 */
  create: (data: CreateInput) => Promise<T | null>
  /** 更新 */
  update: (id: number, data: UpdateInput) => Promise<T | null>
  /** 删除 */
  delete: (id: number, permanent?: boolean) => Promise<boolean>
  /** 刷新列表 */
  refresh: () => Promise<void>
  /** 重置状态 */
  reset: () => void
}

// ==================== 组合式函数 ====================

/**
 * CRUD API 组合式函数
 *
 * @param api CRUD API 实例
 * @param defaultOptions 默认查询选项或配置对象
 * @returns 状态和操作
 *
 * @template T 实体类型（必须包含 id）
 * @template CreateInput 创建输入类型
 * @template UpdateInput 更新输入类型
 */
export function useCrudApi<
  T extends EntityWithId,
  CreateInput = Partial<T>,
  UpdateInput = Partial<T>
>(
  api: CrudApi<T, CreateInput, UpdateInput>,
  defaultOptions: QueryOptions & UseCrudApiOptions = {}
): CrudApiState<T> & CrudApiActions<T, CreateInput, UpdateInput> {
  // ==================== 配置 ====================

  const { autoRefresh = true, optimisticUpdate = false, ...queryDefaultOptions } = defaultOptions

  // 乐观更新和自动刷新不能同时启用
  if (optimisticUpdate && autoRefresh) {
    console.warn('[useCrudApi] optimisticUpdate 和 autoRefresh 不能同时启用，将禁用 autoRefresh')
  }

  // ==================== 状态 ====================

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

  // ==================== 乐观更新回滚辅助函数 ====================

  /**
   * 保存当前数据快照（用于回滚）
   */
  function saveSnapshot(): PaginationData<T> | null {
    if (!data.value) return null
    return {
      items: [...data.value.items],
      total: data.value.total,
      page: data.value.page,
      size: data.value.size,
      pages: data.value.pages,
    }
  }

  /**
   * 回滚到指定快照
   */
  function rollbackToSnapshot(snapshot: PaginationData<T>, currentTotal: number) {
    data.value = snapshot
    pagination.total = currentTotal
  }

  // ==================== 操作 ====================

  /**
   * 查询列表
   */
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

      const result = await api.query(mergedOptions)

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

  /**
   * 获取单个
   */
  async function fetchById(id: number): Promise<T | null> {
    loading.value = true
    error.value = null

    try {
      const result = await api.getById(id)
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

  /**
   * 创建
   */
  async function create(createData: CreateInput): Promise<T | null> {
    loading.value = true
    error.value = null

    // 乐观更新：保存快照
    const snapshot = optimisticUpdate ? saveSnapshot() : null
    const previousTotal = pagination.total

    try {
      const result = await api.create(createData)

      // 乐观更新：直接添加到本地列表
      if (optimisticUpdate && data.value) {
        const newTotal = data.value.total + 1
        // 创建新的数据对象引用以触发响应式更新
        data.value = {
          ...data.value,
          items: [result, ...data.value.items],
          total: newTotal
        }
        // 同步更新分页信息中的 total
        pagination.total = newTotal
      } else if (autoRefresh) {
        // 传统方式：重新获取列表
        await fetchList()
      }

      return result
    } catch (e) {
      error.value = e as Error
      console.error('Failed to create:', e)

      // 乐观更新失败：回滚
      if (optimisticUpdate && snapshot) {
        rollbackToSnapshot(snapshot, previousTotal)
        console.info('[useCrudApi] 乐观更新已回滚: create')
      }

      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新
   */
  async function update(id: number, updateData: UpdateInput): Promise<T | null> {
    loading.value = true
    error.value = null

    // 乐观更新：保存快照
    const snapshot = optimisticUpdate ? saveSnapshot() : null

    try {
      const result = await api.update(id, updateData)

      // 乐观更新：在本地列表中找到并更新
      if (optimisticUpdate && data.value) {
        const index = data.value.items.findIndex(item => item.id === id)
        if (index >= 0) {
          // 创建新的数据对象引用以触发响应式更新
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
        // 传统方式：重新获取列表
        await fetchList()
      }

      return result
    } catch (e) {
      error.value = e as Error
      console.error('Failed to update:', e)

      // 乐观更新失败：回滚
      if (optimisticUpdate && snapshot) {
        rollbackToSnapshot(snapshot, pagination.total)
        console.info('[useCrudApi] 乐观更新已回滚: update')
      }

      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * 删除
   */
  async function deleteItem(id: number, permanent = false): Promise<boolean> {
    loading.value = true
    error.value = null

    // 乐观更新：保存快照
    const snapshot = optimisticUpdate ? saveSnapshot() : null
    const previousTotal = pagination.total

    try {
      await api.delete(id, permanent)

      // 乐观更新：从本地列表中移除
      if (optimisticUpdate && data.value) {
        const newTotal = data.value.total - 1
        // 创建新的数据对象引用以触发响应式更新
        data.value = {
          ...data.value,
          items: data.value.items.filter(item => item.id !== id),
          total: newTotal
        }
        // 同步更新分页信息中的 total
        pagination.total = newTotal
      } else if (autoRefresh) {
        // 传统方式：重新获取列表
        await fetchList()
      }

      return true
    } catch (e) {
      error.value = e as Error
      console.error('Failed to delete:', e)

      // 乐观更新失败：回滚
      if (optimisticUpdate && snapshot) {
        rollbackToSnapshot(snapshot, previousTotal)
        console.info('[useCrudApi] 乐观更新已回滚: delete')
      }

      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 刷新列表（使用当前分页）
   */
  async function refresh(): Promise<void> {
    await fetchList({
      offset: (pagination.page - 1) * pagination.pageSize,
      limit: pagination.pageSize,
    })
  }

  /**
   * 重置状态
   */
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
    // 状态
    data,
    currentItem,
    loading,
    error,
    pagination,
    // 操作
    fetchList,
    fetchById,
    create,
    update,
    delete: deleteItem,
    refresh,
    reset,
  }
}

// ==================== 类型导出 ====================

export type { CrudApi as CrudApiType, QueryOptions, PaginationData } from '@/api/base/crud-api'
