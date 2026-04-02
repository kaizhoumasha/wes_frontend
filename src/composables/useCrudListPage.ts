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

// ==================== 树形类型定义 ====================

/**
 * 树节点基础接口
 */
export interface TreeNode {
  id: number
  parent_id?: number | null
  children?: TreeNode[]
  has_children?: boolean
  is_leaf?: boolean
  [key: string]: unknown
}

/**
 * 树形 API 接口（可选扩展）
 */
export interface TreeApi<T extends TreeNode> {
  tree: (query?: unknown) => Promise<T[]>
  children: (params: { node_id: number }) => Promise<T[]>
  siblings?: (params: { node_id: number }, query?: unknown) => Promise<T[]>
  ancestors?: (params: { node_id: number }, query?: unknown) => Promise<T[]>
  move?: (body: unknown) => Promise<unknown>
}

/**
 * 树形配置选项
 */
export interface TreeModeOptions {
  /** 是否启用树形模式 */
  enabled?: boolean
  /** 子节点字段名，默认 'children' */
  childrenKey?: string
  /** 是否有子节点字段名，默认 'has_children' */
  hasChildrenKey?: string
  /** 是否懒加载子节点 */
  lazyLoad?: boolean
  /** 初始展开层级 */
  initialExpandLevel?: number
}

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

  /** 树形模式配置（启用后 data 变为树形结构） */
  treeMode?: TreeModeOptions
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

  // 树形模式（treeMode 启用时可用）
  tree?: {
    /** 是否启用树形模式 */
    isTreeMode: ComputedRef<boolean>
    /** 是否处于搜索模式（使用 query 接口返回平铺数据） */
    isSearchMode: Ref<boolean>
    /** 树形数据 */
    treeData: ShallowRef<T[]>
    /** 扁平数据（用于搜索结果） */
    flatData: ShallowRef<T[]>
    /** 懒加载状态（按节点ID） */
    loadingChildren: Ref<Record<number, boolean>>
    /** 展开的节点 */
    expandedKeys: Ref<Set<number>>
    /** 加载完整树 */
    fetchTree: () => Promise<void>
    /** 懒加载子节点（供 el-tree 使用） */
    loadChildren: (node: T, treeNode: unknown, resolve: (data: T[]) => void) => void
    /** 手动加载子节点 */
    loadChildrenManual: (parentId: number) => Promise<T[]>
    /** 刷新树 */
    refreshTree: () => Promise<void>
    /** 移动节点 */
    move: (id: number, targetId: number, position: 'before' | 'after' | 'inner') => Promise<boolean>
    /** 展开节点 */
    expandNode: (id: number) => void
    /** 折叠节点 */
    collapseNode: (id: number) => void
    /** 切换展开状态 */
    toggleExpand: (id: number) => void
    /** 展开所有 */
    expandAll: () => void
    /** 折叠所有 */
    collapseAll: () => void
    /** 判断是否为叶子节点 */
    isLeaf: (node: T) => boolean
    /** 查找节点 */
    findNode: (id: number) => T | undefined
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
    defaultSort = [],
    treeMode
  } = options

  // ==================== 树形模式判断 ====================
  const isTreeMode = computed(() => !!treeMode?.enabled)
  const treeApi = isTreeMode.value ? (api as unknown as TreeApi<T>) : null

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

  /** 树形模式下的搜索模式（使用 query 接口返回平铺数据） */
  const isSearchMode = ref(false)

  // ==================== 树形模式状态 ====================
  const treeData = shallowRef<T[]>([]) as ShallowRef<T[]>
  const flatData = shallowRef<T[]>([]) as ShallowRef<T[]>
  const loadingChildren = ref<Record<number, boolean>>({})
  const expandedKeys = ref(new Set<number>()) as Ref<Set<number>>

  // 树形配置默认值
  const treeConfig = {
    childrenKey: treeMode?.childrenKey ?? 'children',
    hasChildrenKey: treeMode?.hasChildrenKey ?? 'has_children',
    initialExpandLevel: treeMode?.initialExpandLevel ?? 1,
  }

  // ==================== 树形辅助函数 ====================
  function flattenTree(tree: T[], key: string, result: T[] = []): T[] {
    for (const node of tree) {
      result.push(node)
      const children = (node as Record<string, unknown>)[key] as T[] | undefined
      if (children && children.length > 0) {
        flattenTree(children, key, result)
      }
    }
    return result
  }

  function findNodeInTree(tree: T[], id: number, key: string): T | undefined {
    for (const node of tree) {
      if (node.id === id) return node
      const children = (node as Record<string, unknown>)[key] as T[] | undefined
      if (children?.length) {
        const found = findNodeInTree(children, id, key)
        if (found) return found
      }
    }
    return undefined
  }

  function updateChildrenInTree(tree: T[], parentId: number, children: T[], key: string): void {
    for (const node of tree) {
      if (node.id === parentId) {
        (node as Record<string, unknown>)[key] = children
        return
      }
      const nodeChildren = (node as Record<string, unknown>)[key] as T[] | undefined
      if (nodeChildren?.length) {
        updateChildrenInTree(nodeChildren, parentId, children, key)
      }
    }
  }

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
   * 树形模式逻辑：
   * - 有搜索条件：使用 query 接口（平铺列表）
   * - 无搜索条件：使用 tree 接口（树形结构）
   */
  async function handleSearch(page?: number): Promise<void> {
    // 树形模式
    if (isTreeMode.value) {
      const filters = searchInstance.compileToFilterGroup()
      const hasFilters = !!(filters?.conditions && filters.conditions.length > 0)

      if (hasFilters) {
        // 有搜索条件：使用 query 接口（平铺模式）
        isSearchMode.value = true
        await crudApi.fetchList(buildQueryOptions(page))
        syncCurrentPagination()
      } else {
        // 无搜索条件：使用 tree 接口（树形模式）
        isSearchMode.value = false
        await fetchTree()
      }
      return
    }

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

  // ==================== 树形方法 ====================

  async function fetchTree(): Promise<void> {
    if (!treeApi || !treeApi.tree) return

    crudApi.loading.value = true
    crudApi.error.value = null

    try {
      const result = await treeApi.tree()
      treeData.value = result
      flatData.value = flattenTree(result, treeConfig.childrenKey)

      // 自动展开根节点
      if (treeConfig.initialExpandLevel > 0) {
        expandToLevel(result, treeConfig.initialExpandLevel)
      }
    } catch (error) {
      crudApi.error.value = error as Error
      console.error('Failed to fetch tree:', error)
    } finally {
      crudApi.loading.value = false
    }
  }

  function expandToLevel(nodes: T[], level: number, currentLevel = 1): void {
    if (currentLevel > level) return
    for (const node of nodes) {
      if (currentLevel < level) {
        expandedKeys.value.add(node.id)
      }
      const children = (node as Record<string, unknown>)[treeConfig.childrenKey] as T[] | undefined
      if (children?.length) {
        expandToLevel(children, level, currentLevel + 1)
      }
    }
  }

  function loadChildren(node: T, _treeNode: unknown, resolve: (data: T[]) => void): void {
    if (!treeApi?.children) {
      resolve([])
      return
    }

    const nodeId = node.id
    const existingChildren = (node as Record<string, unknown>)[treeConfig.childrenKey] as T[] | undefined
    if (existingChildren?.length) {
      resolve(existingChildren)
      return
    }

    loadingChildren.value[nodeId] = true

    treeApi
      .children({ node_id: nodeId })
      .then((children) => {
        updateChildrenInTree(treeData.value, nodeId, children, treeConfig.childrenKey)
        flatData.value = flattenTree(treeData.value, treeConfig.childrenKey)
        resolve(children)
      })
      .catch(() => resolve([]))
      .finally(() => {
        loadingChildren.value[nodeId] = false
      })
  }

  async function loadChildrenManual(parentId: number): Promise<T[]> {
    if (!treeApi?.children) return []

    loadingChildren.value[parentId] = true
    try {
      const children = await treeApi.children({ node_id: parentId })
      updateChildrenInTree(treeData.value, parentId, children, treeConfig.childrenKey)
      flatData.value = flattenTree(treeData.value, treeConfig.childrenKey)
      return children
    } catch {
      return []
    } finally {
      loadingChildren.value[parentId] = false
    }
  }

  async function refreshTree(): Promise<void> {
    await fetchTree()
  }

  async function moveNode(
    id: number,
    targetId: number,
    position: 'before' | 'after' | 'inner'
  ): Promise<boolean> {
    if (!treeApi?.move) return false

    crudApi.loading.value = true
    try {
      await treeApi.move({ id, target_id: targetId, position })
      await fetchTree()
      return true
    } catch {
      return false
    } finally {
      crudApi.loading.value = false
    }
  }

  function expandNode(id: number): void {
    expandedKeys.value.add(id)
  }

  function collapseNode(id: number): void {
    expandedKeys.value.delete(id)
  }

  function toggleExpand(id: number): void {
    if (expandedKeys.value.has(id)) {
      expandedKeys.value.delete(id)
    } else {
      expandedKeys.value.add(id)
    }
  }

  function expandAll(): void {
    const allIds = flatData.value.map((node) => node.id)
    expandedKeys.value = new Set(allIds)
  }

  function collapseAll(): void {
    expandedKeys.value.clear()
  }

  function isLeaf(node: T): boolean {
    return (node as Record<string, unknown>).is_leaf !== undefined
      ? Boolean((node as Record<string, unknown>).is_leaf)
      : !(node as Record<string, unknown>)[treeConfig.hasChildrenKey]
  }

  function findNode(id: number): T | undefined {
    return findNodeInTree(treeData.value, id, treeConfig.childrenKey)
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
    },

    // 树形模式
    ...(isTreeMode.value && {
      tree: {
        isTreeMode,
        isSearchMode,
        treeData,
        flatData,
        loadingChildren,
        expandedKeys,
        fetchTree,
        loadChildren,
        loadChildrenManual,
        refreshTree,
        move: moveNode,
        expandNode,
        collapseNode,
        toggleExpand,
        expandAll,
        collapseAll,
        isLeaf,
        findNode,
      }
    })
  }
}
