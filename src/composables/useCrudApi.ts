/**
 * CRUD API 组合式函数
 *
 * 简化在 Vue 组件中使用 CRUD API
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
 *   fetchList({ page: 1, pageSize: 10 })
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
 *   <button @click="fetchList({ page: pagination.page + 1 })">下一页</button>
 * </template>
 * ```
 */

import { ref, reactive, shallowRef } from 'vue'
import type { CrudApi, QueryOptions, PaginationData } from '@/api/base/crud-api'

// ==================== 类型定义 ====================

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
 * @param defaultOptions 默认查询选项
 * @returns 状态和操作
 *
 * @template T 实体类型
 * @template CreateInput 创建输入类型
 * @template UpdateInput 更新输入类型
 */
export function useCrudApi<T, CreateInput = Partial<T>, UpdateInput = Partial<T>>(
  api: CrudApi<T, CreateInput, UpdateInput>,
  defaultOptions: QueryOptions = {}
): CrudApiState<T> & CrudApiActions<T, CreateInput, UpdateInput> {
  // ==================== 状态 ====================

  const data = shallowRef<PaginationData<T> | null>(null)
  const currentItem = shallowRef<T | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const pagination = reactive({
    page: defaultOptions.page || 1,
    pageSize: defaultOptions.pageSize || 10,
    total: 0,
    pages: 0,
  })

  // ==================== 操作 ====================

  /**
   * 查询列表
   */
  async function fetchList(options: QueryOptions = {}): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const mergedOptions: QueryOptions = {
        page: pagination.page,
        pageSize: pagination.pageSize,
        ...defaultOptions,
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
  async function create(data: CreateInput): Promise<T | null> {
    loading.value = true
    error.value = null

    try {
      const result = await api.create(data)
      // 创建成功后刷新列表
      await fetchList()
      return result
    } catch (e) {
      error.value = e as Error
      console.error('Failed to create:', e)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新
   */
  async function update(id: number, data: UpdateInput): Promise<T | null> {
    loading.value = true
    error.value = null

    try {
      const result = await api.update(id, data)
      // 更新成功后刷新列表
      await fetchList()
      return result
    } catch (e) {
      error.value = e as Error
      console.error('Failed to update:', e)
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

    try {
      await api.delete(id, permanent)
      // 删除成功后刷新列表
      await fetchList()
      return true
    } catch (e) {
      error.value = e as Error
      console.error('Failed to delete:', e)
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
      page: pagination.page,
      pageSize: pagination.pageSize,
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
    pagination.page = defaultOptions.page || 1
    pagination.pageSize = defaultOptions.pageSize || 10
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
