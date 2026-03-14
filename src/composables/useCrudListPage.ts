import { ref, computed, type Ref, type ComputedRef } from 'vue'
import { useCrudApi } from './useCrudApi'
import { useSmartSearch } from './useSmartSearch'
import { usePermission } from './usePermission'
import type { CrudApi, QueryOptions, SortField } from '@/api/base/crud-api'
import type { TableSortOrder } from '@/components/ui/table/table.types'
import type { SearchFieldDef, QuickSearchPreset, SearchFavorite } from '@/types/search'

/**
 * useCrudListPage Composable
 *
 * 整合 CRUD 逻辑、搜索逻辑、批量操作逻辑，作为页面的核心"无头"逻辑引擎。
 *
 * 特性：
 * - 整合 CRUD API（创建、读取、更新、删除）
 * - 整合智能搜索（快速预设、高级搜索、收藏夹）
 * - 批量选择和批量操作
 * - 权限控制
 * - 乐观更新支持
 * - 返回值按职责分组（state, search, dialogs, selection, apiActions, permissions）
 *
 * @example
 * ```typescript
 * const { state, search, dialogs, selection, apiActions, permissions } = useCrudListPage<
 *   User,
 *   CreateUserInput,
 *   UpdateUserInput
 * >({
 *   api: userApi,
 *   searchFields: userSearchFields,
 *   quickPresets: userQuickPresets,
 *   favorites: userSearchFavorites,
 *   permissions: USER_PERMISSION,
 *   pageSize: 20,
 *   optimisticUpdate: true
 * })
 * ```
 */

// ============================================================================
// 类型定义
// ============================================================================

export interface UseCrudListPageOptions<T, C, U> {
  /** API 接口 */
  api: CrudApi<T, C, U>

  /** 搜索字段定义 */
  searchFields: SearchFieldDef[]

  /** 快速搜索预设 */
  quickPresets?: QuickSearchPreset[]

  /** 收藏夹列表 */
  favorites?: SearchFavorite[]

  /** 权限常量 */
  permissions?: {
    create: string
    update: string
    delete: string
  }

  /** 初始分页大小 */
  pageSize?: number

  /** 是否启用乐观更新 */
  optimisticUpdate?: boolean

  /** 是否启用自动刷新（与 optimisticUpdate 互斥） */
  autoRefresh?: boolean

  /** 默认排序 */
  defaultSort?: SortField[]
}

export interface PaginationState {
  page: number
  pageSize: number
  total: number
}

export interface UseCrudListPageReturn<T, C, U> {
  // 核心状态
  state: {
    data: Ref<T[] | null>
    loading: Ref<boolean>
    error: Ref<Error | null>
    pagination: PaginationState
    selectedItems: Ref<T[]>
    selectedCount: Ref<number>
    hasSelection: Ref<boolean>
    batchDeleteLoading: Ref<boolean>
    sortState: Ref<SortField[] | null>
    getCachedData: (id: number) => T | undefined
  }

  // 搜索相关
  search: {
    instance: ReturnType<typeof useSmartSearch>
    handleSearch: (page?: number) => Promise<void>
    handleRefresh: () => Promise<void>
    handleSortChange: (sort: {
      field: string
      sortKey?: string
      order: TableSortOrder
    }) => Promise<void>
  }

  // 弹窗相关
  dialogs: {
    formOpen: Ref<boolean>
    editingId: Ref<number | null>
    key: Ref<number>
    openCreate: () => void
    openEdit: (id: number) => void
    close: () => void
  }

  // 批量选择相关
  selection: {
    handleSelectionChange: (selected: T[]) => void
    clearSelectionState: () => void
    handleBatchDelete: () => Promise<void>
  }

  // API 操作
  apiActions: {
    handleCreate: (formData: C) => Promise<T | null>
    handleEdit: (id: number, formData: U) => Promise<T | null>
    handleDelete: (id: number) => Promise<boolean>
  }

  // 权限
  permissions: {
    create: ComputedRef<boolean>
    update: ComputedRef<boolean>
    delete: ComputedRef<boolean>
  }
}

// ============================================================================
// Composable 实现
// ============================================================================

export function useCrudListPage<
  T extends { id: number },
  C = Partial<T>,
  U = Partial<T>
>(options: UseCrudListPageOptions<T, C, U>): UseCrudListPageReturn<T, C, U> {
  const {
    api,
    searchFields,
    quickPresets = [],
    favorites = [],
    permissions,
    pageSize = 20,
    optimisticUpdate = false,
    autoRefresh: userAutoRefresh,
    defaultSort = []
  } = options

  // ==================== 权限 ====================
  const { hasPermission } = usePermission()
  const createPermission = computed(() => permissions?.create ? hasPermission(permissions.create) : true)
  const updatePermission = computed(() => permissions?.update ? hasPermission(permissions.update) : true)
  const deletePermission = computed(() => permissions?.delete ? hasPermission(permissions.delete) : true)

  // ==================== CRUD API ====================
  // 乐观更新和自动刷新不能同时启用
  // 如果用户启用了 optimisticUpdate，强制禁用 autoRefresh
  // 如果用户未指定 autoRefresh，默认为 true（除非启用 optimisticUpdate）
  const autoRefresh = optimisticUpdate ? false : (userAutoRefresh ?? true)

  const crudApi = useCrudApi<T, C, U>(api, {
    limit: pageSize,
    optimisticUpdate,
    autoRefresh
  })

  // ==================== 智能搜索 ====================
  const searchInstance = useSmartSearch({
    fields: searchFields,
    favorites,
    quickPresets,
    onConditionsChange: () => {
      // 条件变化时自动触发搜索（重置到第 1 页）
      handleSearch(1)
    }
  })

  // ==================== 批量选择状态 ====================
  const selectedItems = ref<T[]>([]) as Ref<T[]>
  const batchDeleteLoading = ref(false)
  const sortState = ref<SortField[] | null>(defaultSort.length > 0 ? [...defaultSort] : null)

  // ==================== 弹窗状态 ====================
  const formOpen = ref(false)
  const editingId = ref<number | null>(null)
  const dialogKey = ref(0)

  // 强制重新渲染弹窗
  function refreshDialog() {
    dialogKey.value++
  }

  // ==================== 计算属性 ====================

  /** 从 data 中提取 items（兼容 PaginatedResponse 和数组） */
  const items = computed(() => {
    if (!crudApi.data.value) return []
    // 如果是 PaginatedResponse
    if ('items' in crudApi.data.value) {
      return (crudApi.data.value as { items: T[] }).items
    }
    // 如果是数组
    return crudApi.data.value as T[]
  })

  /** 选中的数量 */
  const selectedCount = computed(() => selectedItems.value.length)

  /** 是否有选中项 */
  const hasSelection = computed(() => selectedItems.value.length > 0)

  // ==================== 搜索操作 ====================

  /**
   * 执行搜索
   */
  async function handleSearch(page?: number): Promise<void> {
    const filterGroup = searchInstance.compileToFilterGroup()

    const queryOptions: QueryOptions = {
      filters: filterGroup,
      sort: sortState.value
    }

    if (page !== undefined) {
      queryOptions.offset = (page - 1) * crudApi.pagination.pageSize
      queryOptions.limit = crudApi.pagination.pageSize
    }

    await crudApi.fetchList(queryOptions)
  }

  /**
   * 刷新列表（保持当前页）
   */
  async function handleRefresh(): Promise<void> {
    await handleSearch(crudApi.pagination.page)
  }

  async function handleSortChange(sort: {
    field: string
    sortKey?: string
    order: TableSortOrder
  }): Promise<void> {
    if (!sort.order) {
      sortState.value = defaultSort.length > 0 ? [...defaultSort] : null
    } else {
      const effectiveSortField = sort.sortKey || sort.field
      sortState.value = [
        {
          field: effectiveSortField,
          order: sort.order === 'descending' ? 'desc' : 'asc'
        }
      ]
    }

    await handleSearch(1)
  }

  // ==================== 批量选择操作 ====================

  /**
   * 处理选择变化
   */
  function handleSelectionChange(selected: T[]) {
    selectedItems.value = selected
  }

  /**
   * 清空选中状态（纯状态清除，不操作视图）
   */
  function clearSelectionState() {
    selectedItems.value = []
  }

  /**
   * 批量删除
   */
  async function handleBatchDelete(): Promise<void> {
    if (selectedItems.value.length === 0) {
      return
    }

    batchDeleteLoading.value = true

    try {
      // 并发删除所有选中项
      await Promise.all(
        selectedItems.value.map((item: T) => api.delete(item.id))
      )

      // 清空选中状态
      clearSelectionState()

      // 刷新列表
      await handleRefresh()
    } finally {
      batchDeleteLoading.value = false
    }
  }

  // ==================== 弹窗操作 ====================

  /**
   * 打开创建弹窗
   */
  function openCreate() {
    editingId.value = null
    formOpen.value = true
    refreshDialog()
  }

  /**
   * 打开编辑弹窗
   */
  function openEdit(id: number) {
    editingId.value = id
    formOpen.value = true
    refreshDialog()
  }

  /**
   * 关闭弹窗
   */
  function close() {
    formOpen.value = false
    editingId.value = null
  }

  // ==================== API 操作 ====================

  /**
   * 处理创建
   */
  async function handleCreate(formData: C): Promise<T | null> {
    const result = await crudApi.create(formData)
    if (result) {
      close()
    }
    return result
  }

  /**
   * 处理编辑
   */
  async function handleEdit(id: number, formData: U): Promise<T | null> {
    const result = await crudApi.update(id, formData)
    if (result) {
      close()
    }
    return result
  }

  /**
   * 处理删除
   */
  async function handleDelete(id: number): Promise<boolean> {
    const success = await crudApi.delete(id)
    if (success) {
      await handleRefresh()
    }
    return success
  }

  /**
   * 获取缓存的数据（用于弹窗预填充）
   */
  function getCachedData(id: number): T | undefined {
    return items.value.find((item: T) => item.id === id)
  }

  // ==================== 返回分组结果 ====================

  return {
    // 核心状态
    state: {
      data: items,
      loading: crudApi.loading,
      error: crudApi.error,
      pagination: crudApi.pagination,
      selectedItems,
      selectedCount,
      hasSelection,
      batchDeleteLoading,
      sortState,
      getCachedData
    },

    // 搜索相关
    search: {
      instance: searchInstance,
      handleSearch,
      handleRefresh,
      handleSortChange
    },

    // 弹窗相关
    dialogs: {
      formOpen,
      editingId,
      key: dialogKey,
      openCreate,
      openEdit,
      close
    },

    // 批量选择相关
    selection: {
      handleSelectionChange,
      clearSelectionState,
      handleBatchDelete
    },

    // API 操作
    apiActions: {
      handleCreate,
      handleEdit,
      handleDelete
    },

    // 权限
    permissions: {
      create: createPermission,
      update: updatePermission,
      delete: deletePermission
    }
  }
}
