import { computed, reactive, ref, type ComputedRef, type Ref, type ShallowRef } from 'vue'
import { useCrudRequestAdapter } from './useCrudRequestAdapter'
import { useSmartSearch } from './useSmartSearch'
import { usePermission } from './usePermission'
import { useCrudDialogs } from './crud/useCrudDialogs'
import { useCrudSelection } from './crud/useCrudSelection'
import { useCrudSorting } from './crud/useCrudSorting'
import { useCrudTrash } from './crud/useCrudTrash'
import { useCrudTree, type CrudTreeApi } from './crud/useCrudTree'
import { buildCrudQueryOptions, createCrudListSearchHandlers } from './crud/useCrudListSearch'
import { useCrudListRequestActions } from './crud/useCrudListRequestActions'
import {
  type CrudRequestAdapter,
  type QueryOptions,
  type SortField,
} from '@/api/base/crud-request-adapter'
import type { CrudPageViewMode } from '@/components/common/crud-page/types'
import type { TableSortOrder } from '@/components/ui/table/table.types'
import type { SearchFieldDef, QuickSearchPreset, SearchFavorite } from '@/types/search'

type CrudDeleteOptions<TAdapter extends CrudRequestAdapter<unknown, unknown, unknown>> = Parameters<TAdapter['delete']>[1]
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
 * - 整合 CRUD 请求适配器（创建、读取、更新、删除）
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
 *   adapter: userRequestAdapter,
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
  TAdapter extends CrudRequestAdapter<T, C, U> = CrudRequestAdapter<T, C, U>
> {
  /** CRUD 请求适配器 */
  adapter: TAdapter

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
    handlePageSizeChange: (size: number) => Promise<void>
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
    createInitialValues: Ref<Record<string, unknown> | null>
    openCreate: (options?: { initialValues?: Record<string, unknown> }) => void
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
    /** 批量排序 */
    batchSort: (items: { id: number; parent_id: number | null; sort_order: number }[]) => Promise<boolean>
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
  TAdapter extends CrudRequestAdapter<T, C, U> = CrudRequestAdapter<T, C, U>
>(
  options: UseCrudListPageOptions<T, C, U, TAdapter>
): UseCrudListPageReturn<T, C, U, CrudDeleteOptions<TAdapter>> {
  const {
    adapter,
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
  const treeAdapter = isTreeMode.value ? (adapter as unknown as CrudTreeApi<T>) : null

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

  // ==================== CRUD 请求适配器 ====================
  // 乐观更新和自动刷新不能同时启用
  // 如果用户启用了 optimisticUpdate，强制禁用 autoRefresh
  // 如果用户未指定 autoRefresh，默认为 true（除非启用 optimisticUpdate）
  const autoRefresh = resolveAutoRefreshSetting(userAutoRefresh)

  const crudAdapterState = useCrudRequestAdapter<T, C, U, TAdapter>(adapter, {
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

  // ==================== 页面状态 ====================
  const viewMode = ref<CrudPageViewMode>('active')
  const dialogs = useCrudDialogs()
  const sorting = useCrudSorting(defaultSort)

  /** 树形模式下的搜索模式（使用 query 接口返回平铺数据） */
  const isSearchMode = ref(false)

  const trash = useCrudTrash<T, TAdapter>(adapter, viewMode, pageSize, {
    onAfterMutation: async () => {
      await handleRefresh()
    }
  })

  const selection = useCrudSelection<T, TAdapter>(adapter, {
    onAfterBatchAction: async () => {
      await handleRefresh()
    }
  })

  const tree = useCrudTree<T>({
    enabled: isTreeMode.value,
    adapter: treeAdapter as CrudTreeApi<T> | null,
    treeMode,
    setLoading: loading => {
      crudAdapterState.loading.value = loading
    },
    setError: error => {
      crudAdapterState.error.value = error
    }
  })

  const currentPagination = reactive<PaginationState>({
    page: 1,
    pageSize,
    total: 0
  })

  // ==================== 计算属性 ====================

  /** 当前列表项 */
  const items = computed<T[]>(() => {
    if (viewMode.value === 'trash') {
      return trash.trashData.value?.items ?? []
    }

    return crudAdapterState.data.value?.items ?? []
  })

  const supportsTrash = trash.supportsTrash
  const isTrashMode = trash.isTrashMode
  const currentLoading = computed(() => (isTrashMode.value ? trash.trashLoading.value : crudAdapterState.loading.value))
  const currentError = computed(() => (isTrashMode.value ? trash.trashError.value : crudAdapterState.error.value))

  /** 选中的数量 */
  const selectedCount = selection.selectedCount

  /** 是否有选中项 */
  const hasSelection = selection.hasSelection

  const buildQueryOptions = (page?: number): QueryOptions => buildCrudQueryOptions({
    compileFilters: () => searchInstance.compileToFilterGroup(),
    sortState: sorting.sortState,
    page,
    pageSize: crudAdapterState.pagination.pageSize
  })

  const searchHandlers = createCrudListSearchHandlers({
    isTreeMode: isTreeMode.value,
    isTrashMode: () => isTrashMode.value,
    isSearchMode,
    compileFilters: () => searchInstance.compileToFilterGroup(),
    buildQueryOptions,
    fetchTree: tree.fetchTree,
    fetchTrash: trash.fetchTrash,
    crud: {
      fetchList: crudAdapterState.fetchList,
      pagination: crudAdapterState.pagination
    },
    trash,
    currentPagination,
    sorting
  })


  const handleSearch = searchHandlers.handleSearch
  const handleRefresh = searchHandlers.handleRefresh

  const requestActions = useCrudListRequestActions<T, C, U, TAdapter>({
    crudAdapter: {
      create: crudAdapterState.create,
      update: crudAdapterState.update,
      delete: crudAdapterState.delete
    },
    dialogs,
    treeAdapter,
    tree,
    items,
    trash,
    syncCurrentPagination: searchHandlers.syncCurrentPagination
  })

  function setViewMode(mode: CrudPageViewMode): void {
    if (mode === 'trash' && !supportsTrash.value) {
      return
    }

    viewMode.value = mode
    searchHandlers.syncCurrentPagination()
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
      selectedItems: selection.selectedItems,
      selectedCount,
      hasSelection,
      batchDeleteLoading: selection.batchDeleteLoading,
      batchRestoreLoading: selection.batchRestoreLoading,
      batchPermanentDeleteLoading: selection.batchPermanentDeleteLoading,
      sortState: sorting.sortState,
      getCachedData: requestActions.getCachedData
    },

    // 搜索相关
    search: {
      instance: searchInstance,
      handleSearch: searchHandlers.handleSearch,
      handleRefresh: searchHandlers.handleRefresh,
      handlePageSizeChange: searchHandlers.handlePageSizeChange,
      handleSortChange: searchHandlers.handleSortChange
    },

    // 弹窗相关
    dialogs: {
      formOpen: dialogs.formOpen,
      editingId: dialogs.editingId,
      key: dialogs.key,
      createInitialValues: dialogs.createInitialValues,
      openCreate: dialogs.openCreate,
      openEdit: dialogs.openEdit,
      close: dialogs.close
    },

    // 批量选择相关
    selection: {
      handleSelectionChange: selection.handleSelectionChange,
      clearSelectionState: selection.clearSelectionState,
      handleBatchDelete: selection.handleBatchDelete,
      handleBatchRestore: selection.handleBatchRestore,
      handleBatchPermanentDelete: selection.handleBatchPermanentDelete
    },

    // API 操作
    apiActions: {
      handleCreate: requestActions.handleCreate,
      handleEdit: requestActions.handleEdit,
      handleDelete: requestActions.handleDelete,
      handleRestore: requestActions.handleRestore,
      handlePermanentDelete: requestActions.handlePermanentDelete
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
        treeData: tree.treeData,
        flatData: tree.flatData,
        loadingChildren: tree.loadingChildren,
        expandedKeys: tree.expandedKeys,
        fetchTree: tree.fetchTree,
        loadChildren: tree.loadChildren,
        loadChildrenManual: tree.loadChildrenManual,
        refreshTree: tree.refreshTree,
        move: tree.move,
        batchSort: tree.batchSort,
        expandNode: tree.expandNode,
        collapseNode: tree.collapseNode,
        toggleExpand: tree.toggleExpand,
        expandAll: tree.expandAll,
        collapseAll: tree.collapseAll,
        isLeaf: tree.isLeaf,
        findNode: tree.findNode,
      }
    })
  }
}
