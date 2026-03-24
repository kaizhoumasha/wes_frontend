import { computed, reactive, ref, shallowRef, type ComputedRef, type Ref, type ShallowRef } from 'vue'
import { ElMessage } from 'element-plus'
import { useCrudApi } from './useCrudApi'
import { useSmartSearch } from './useSmartSearch'
import { usePermission } from './usePermission'
import {
  hasSoftDeleteCrudApi,
  type CrudApi,
  type PaginationData,
  type QueryOptions,
  type SortField,
} from '@/api/base/crud-api'
import type { CrudPageViewMode } from '@/components/common/crud-page/types'
import type { TableSortOrder } from '@/components/ui/table/table.types'
import type { SearchFieldDef, QuickSearchPreset, SearchFavorite } from '@/types/search'

type CrudDeleteOptions<TApi extends CrudApi<unknown, unknown, unknown>> = Parameters<TApi['delete']>[1]
type ReadonlyRef<T> = Readonly<Ref<T>>

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

export interface UseCrudListPageOptions<
  T,
  C,
  U,
  TApi extends CrudApi<T, C, U> = CrudApi<T, C, U>
> {
  /** API 接口 */
  api: TApi

  /** 搜索字段定义 */
  searchFields: SearchFieldDef[]

  /** 快速搜索预设 */
  quickPresets?: QuickSearchPreset[]

  /** 收藏夹列表 */
  favorites?: SearchFavorite[]

  /** 权限常量 */
  permissions?: {
    create?: string
    update?: string
    delete?: string
    restore?: string
    trash?: string
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

export interface UseCrudListPageReturn<
  T,
  C,
  U,
  TDeleteOptions = undefined
> {
  // 核心状态
  state: {
    data: ComputedRef<T[]>
    loading: ReadonlyRef<boolean>
    error: ReadonlyRef<Error | null>
    pagination: PaginationState
    viewMode: Ref<CrudPageViewMode>
    isTrashMode: ComputedRef<boolean>
    supportsTrash: ComputedRef<boolean>
    selectedItems: Ref<T[]>
    selectedCount: ComputedRef<number>
    hasSelection: ComputedRef<boolean>
    batchDeleteLoading: Ref<boolean>
    batchRestoreLoading: Ref<boolean>
    batchPermanentDeleteLoading: Ref<boolean>
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
    handleBatchRestore: () => Promise<void>
    handleBatchPermanentDelete: () => Promise<void>
  }

  // API 操作
  apiActions: {
    handleCreate: (formData: C) => Promise<T | null>
    handleEdit: (id: number, formData: U) => Promise<T | null>
    handleDelete: (id: number, options?: TDeleteOptions) => Promise<boolean>
    handleRestore: (id: number) => Promise<T | null>
    handlePermanentDelete: (id: number) => Promise<boolean>
  }

  // 权限
  permissions: {
    create: ComputedRef<boolean>
    update: ComputedRef<boolean>
    delete: ComputedRef<boolean>
    restore: ComputedRef<boolean>
    trash: ComputedRef<boolean>
  }

  // 视图切换
  view: {
    setViewMode: (mode: CrudPageViewMode) => void
  }
}

// ============================================================================
// Composable 实现
// ============================================================================

export function useCrudListPage<
  T extends { id: number },
  C = Partial<T>,
  U = Partial<T>,
  TApi extends CrudApi<T, C, U> = CrudApi<T, C, U>
>(
  options: UseCrudListPageOptions<T, C, U, TApi>
): UseCrudListPageReturn<T, C, U, CrudDeleteOptions<TApi>> {
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

  function createPermissionRef(permission?: string): ComputedRef<boolean> {
    return computed(() => (permission ? hasPermission(permission) : true))
  }

  function resolveAutoRefreshSetting(autoRefresh?: boolean): boolean {
    if (optimisticUpdate) {
      return false
    }

    return autoRefresh ?? true
  }

  const createPermission = createPermissionRef(permissions?.create)
  const updatePermission = createPermissionRef(permissions?.update)
  const deletePermission = createPermissionRef(permissions?.delete)
  const restorePermission = createPermissionRef(permissions?.restore)
  const trashPermission = createPermissionRef(permissions?.trash)

  // ==================== CRUD API ====================
  // 乐观更新和自动刷新不能同时启用
  // 如果用户启用了 optimisticUpdate，强制禁用 autoRefresh
  // 如果用户未指定 autoRefresh，默认为 true（除非启用 optimisticUpdate）
  const autoRefresh = resolveAutoRefreshSetting(userAutoRefresh)

  const crudApi = useCrudApi<T, C, U, TApi>(api, {
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
  const viewMode = ref<CrudPageViewMode>('active')
  const trashData: ShallowRef<PaginationData<T> | null> = shallowRef(null)
  const trashLoading = ref(false)
  const trashError = ref<Error | null>(null)
  const batchDeleteLoading = ref(false)
  const batchRestoreLoading = ref(false)
  const batchPermanentDeleteLoading = ref(false)
  const sortState = ref<SortField[] | null>(defaultSort.length > 0 ? [...defaultSort] : null)
  const currentPagination = reactive<PaginationState>({
    page: 1,
    pageSize,
    total: 0
  })
  const trashPagination = reactive<PaginationState>({
    page: 1,
    pageSize,
    total: 0
  })

  // ==================== 弹窗状态 ====================
  const formOpen = ref(false)
  const editingId = ref<number | null>(null)
  const dialogKey = ref(0)

  // 强制重新渲染弹窗
  function refreshDialog() {
    dialogKey.value++
  }

  // ==================== 计算属性 ====================

  /** 当前列表项 */
  const items = computed(() => {
    if (viewMode.value === 'trash') {
      return trashData.value?.items ?? []
    }

    return crudApi.data.value?.items ?? []
  })

  const supportsTrash = computed(() => hasSoftDeleteCrudApi(api))
  const isTrashMode = computed(() => viewMode.value === 'trash')
  const currentLoading = computed(() => (isTrashMode.value ? trashLoading.value : crudApi.loading.value))
  const currentError = computed(() => (isTrashMode.value ? trashError.value : crudApi.error.value))

  /** 选中的数量 */
  const selectedCount = computed(() => selectedItems.value.length)

  /** 是否有选中项 */
  const hasSelection = computed(() => selectedItems.value.length > 0)

  function syncPaginationState(target: PaginationState, source: PaginationData<T>): void {
    target.page = source.page
    target.pageSize = source.size
    target.total = source.total
  }

  function syncCurrentPagination(): void {
    if (isTrashMode.value) {
      currentPagination.page = trashPagination.page
      currentPagination.pageSize = trashPagination.pageSize
      currentPagination.total = trashPagination.total
      return
    }

    currentPagination.page = crudApi.pagination.page
    currentPagination.pageSize = crudApi.pagination.pageSize
    currentPagination.total = crudApi.pagination.total
  }

  function buildQueryOptions(page?: number): QueryOptions {
    const queryOptions: QueryOptions = {
      filters: searchInstance.compileToFilterGroup(),
      sort: sortState.value
    }

    if (page !== undefined) {
      queryOptions.offset = (page - 1) * crudApi.pagination.pageSize
      queryOptions.limit = crudApi.pagination.pageSize
    }

    return queryOptions
  }

  function buildTrashQuery(page?: number): { offset: number; limit: number } {
    const resolvedPage = page ?? trashPagination.page

    return {
      offset: (resolvedPage - 1) * trashPagination.pageSize,
      limit: trashPagination.pageSize
    }
  }

  function resolveSortFields(sort: {
    field: string
    sortKey?: string
    order: TableSortOrder
  }): SortField[] | null {
    if (!sort.order) {
      return defaultSort.length > 0 ? [...defaultSort] : null
    }

    return [
      {
        field: sort.sortKey || sort.field,
        order: sort.order === 'descending' ? 'desc' : 'asc'
      }
    ]
  }

  // ==================== 搜索操作 ====================

  /**
   * 执行搜索
   */
  async function handleSearch(page?: number): Promise<void> {
    if (isTrashMode.value) {
      if (!hasSoftDeleteCrudApi(api)) {
        return
      }

      trashLoading.value = true
      trashError.value = null

      try {
        const result = await api.getTrash(buildTrashQuery(page))
        trashData.value = result
        syncPaginationState(trashPagination, result)
        syncCurrentPagination()
      } catch (error) {
        trashError.value = error as Error
        console.error('Failed to fetch trash list:', error)
      } finally {
        trashLoading.value = false
      }

      return
    }

    await crudApi.fetchList(buildQueryOptions(page))
    syncCurrentPagination()
  }

  /**
   * 刷新列表（保持当前页）
   */
  async function handleRefresh(): Promise<void> {
    await handleSearch(currentPagination.page)
  }

  async function handleSortChange(sort: {
    field: string
    sortKey?: string
    order: TableSortOrder
  }): Promise<void> {
    if (isTrashMode.value) {
      return
    }

    sortState.value = resolveSortFields(sort)

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

    // 只有 SoftDeleteCrudApi 才有 batchDelete 方法
    if (!('batchDelete' in api) || typeof api.batchDelete !== 'function') {
      return
    }

    batchDeleteLoading.value = true

    try {
      const result = await api.batchDelete(selectedItems.value.map((item: T) => item.id))
      clearSelectionState()
      await handleRefresh()

      // 显示操作结果反馈
      if (result.failed > 0) {
        ElMessage.warning(`成功删除 ${result.success} 个，失败 ${result.failed} 个`)
      } else if (result.success > 0) {
        ElMessage.success(`成功删除 ${result.success} 个`)
      }
    } finally {
      batchDeleteLoading.value = false
    }
  }

  async function handleBatchRestore(): Promise<void> {
    if (selectedItems.value.length === 0 || !hasSoftDeleteCrudApi(api)) {
      return
    }

    batchRestoreLoading.value = true

    try {
      await api.batchRestore(selectedItems.value.map(item => item.id))
      clearSelectionState()
      await handleRefresh()
    } finally {
      batchRestoreLoading.value = false
    }
  }

  async function handleBatchPermanentDelete(): Promise<void> {
    if (selectedItems.value.length === 0 || !hasSoftDeleteCrudApi(api)) {
      return
    }

    batchPermanentDeleteLoading.value = true

    try {
      await api.batchPermanentDelete(selectedItems.value.map(item => item.id))
      clearSelectionState()
      await handleRefresh()
    } finally {
      batchPermanentDeleteLoading.value = false
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
      syncCurrentPagination()
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
      syncCurrentPagination()
    }
    return result
  }

  /**
   * 处理删除
   */
  async function handleDelete(id: number, options?: CrudDeleteOptions<TApi>): Promise<boolean> {
    const result = await crudApi.delete(id, options)
    syncCurrentPagination()
    return result
  }

  async function handleRestore(id: number): Promise<T | null> {
    if (!hasSoftDeleteCrudApi(api)) {
      return null
    }

    const result = await api.restore(id)
    await handleRefresh()
    return result as T
  }

  async function handlePermanentDelete(id: number): Promise<boolean> {
    if (!hasSoftDeleteCrudApi(api)) {
      return false
    }

    await api.permanentDelete(id)
    await handleRefresh()
    return true
  }

  /**
   * 获取缓存的数据（用于弹窗预填充）
   */
  function getCachedData(id: number): T | undefined {
    return items.value.find((item: T) => item.id === id)
  }

  function setViewMode(mode: CrudPageViewMode): void {
    if (mode === 'trash' && !supportsTrash.value) {
      return
    }

    viewMode.value = mode
    syncCurrentPagination()
  }

  // ==================== 返回分组结果 ====================

  return {
    // 核心状态
    state: {
      data: items,
      loading: currentLoading,
      error: currentError,
      pagination: currentPagination,
      viewMode,
      isTrashMode,
      supportsTrash,
      selectedItems,
      selectedCount,
      hasSelection,
      batchDeleteLoading,
      batchRestoreLoading,
      batchPermanentDeleteLoading,
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
      handleBatchDelete,
      handleBatchRestore,
      handleBatchPermanentDelete
    },

    // API 操作
    apiActions: {
      handleCreate,
      handleEdit,
      handleDelete,
      handleRestore,
      handlePermanentDelete
    },

    // 权限
    permissions: {
      create: createPermission,
      update: updatePermission,
      delete: deletePermission,
      restore: restorePermission,
      trash: trashPermission
    },

    // 视图切换
    view: {
      setViewMode
    }
  }
}
