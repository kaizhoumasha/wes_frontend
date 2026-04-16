import { reactive, ref, shallowRef, type Ref, type ShallowRef } from 'vue'
import type { QueryOptions, PaginationData } from '@/api/base/crud-request-adapter'
import { useTreeCrudData } from '@/composables/tree/useTreeCrudData'
import { useTreeCrudUiState } from '@/composables/tree/useTreeCrudUiState'
import { useTreeCrudMutations } from '@/composables/tree/useTreeCrudMutations'

// ==================== 类型定义 ====================

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
 * 树形请求适配器接口（扩展 SoftDeleteCrudRequestAdapter）
 */
export interface TreeRequestAdapter<T extends TreeNode> {
  // 通用 CRUD
  query: (options?: QueryOptions) => Promise<PaginationData<T>>
  create: (data: unknown) => Promise<T>
  update: (id: number, data: unknown) => Promise<T>
  delete: (id: number, options?: unknown) => Promise<unknown>
  getById: (id: number, options?: unknown) => Promise<T>

  // 软删除
  getTrash?: (options?: unknown) => Promise<PaginationData<T>>
  restore?: (id: number) => Promise<T>
  permanentDelete?: (id: number) => Promise<unknown>
  batchDelete?: (ids: number[]) => Promise<{ success: number; failed: number; total: number }>
  batchRestore?: (ids: number[]) => Promise<unknown>
  batchPermanentDelete?: (ids: number[]) => Promise<unknown>

  // 树形请求能力
  tree: (query?: unknown) => Promise<T[]>
  children: (params: { node_id: number }) => Promise<T[]>
  siblings?: (params: { node_id: number }, query?: unknown) => Promise<T[]>
  ancestors?: (params: { node_id: number }, query?: unknown) => Promise<T[]>
  move?: (body: unknown) => Promise<unknown>
}

/**
 * useTreeCrud 配置选项
 */
export interface UseTreeCrudOptions {
  /** 子节点字段名，默认 'children' */
  childrenKey?: string
  /** 是否有子节点字段名，默认 'has_children' */
  hasChildrenKey?: string
  /** 是否懒加载子节点 */
  lazyLoad?: boolean
  /** 初始加载层级（lazyLoad 为 false 时有效） */
  initialExpandLevel?: number
}

/**
 * 树形 CRUD 状态
 */
export interface TreeCrudState<T extends TreeNode> {
  /** 树形数据 */
  treeData: ShallowRef<T[]>
  /** 扁平数据（用于搜索结果） */
  flatData: ShallowRef<T[]>
  /** 加载状态 */
  loading: Ref<boolean>
  /** 懒加载中（按节点ID） */
  loadingChildren: Ref<Record<number, boolean>>
  /** 错误信息 */
  error: Ref<Error | null>
  /** 分页信息 */
  pagination: {
    page: number
    pageSize: number
    total: number
    pages: number
  }
  /** 展开的节点 */
  expandedKeys: Ref<Set<number>>
  /** 选中的节点 */
  selectedKeys: Ref<Set<number>>
}

/**
 * 树形 CRUD 操作
 */
export interface TreeCrudActions<T extends TreeNode> {
  /** 加载完整树 */
  fetchTree: () => Promise<void>
  /** 懒加载子节点（供 el-tree 使用） */
  loadChildren: (node: T, treeNode: unknown, resolve: (data: T[]) => void) => void
  /** 加载子节点（手动调用） */
  loadChildrenManual: (parentId: number) => Promise<T[]>
  /** 刷新树 */
  refreshTree: () => Promise<void>

  /** 分页查询（扁平列表） */
  query: (options?: QueryOptions) => Promise<PaginationData<T>>

  /** 创建节点 */
  create: (data: unknown) => Promise<T | null>
  /** 更新节点 */
  update: (id: number, data: unknown) => Promise<T | null>
  /** 删除节点 */
  delete: (id: number, options?: unknown) => Promise<boolean>
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

  /** 选择节点 */
  selectNode: (id: number) => void
  /** 取消选择 */
  clearSelection: () => void

  /** 判断是否为叶子节点 */
  isLeaf: (node: T) => boolean
  /** 获取节点路径 */
  getNodePath: (id: number) => T[]
  /** 查找节点 */
  findNode: (id: number) => T | undefined
  /** 获取子节点 */
  getChildren: (parentId: number) => T[]

  /** 重置状态 */
  reset: () => void
}

/**
 * useTreeCrud 返回类型
 */
export type UseTreeCrudReturn<T extends TreeNode> = TreeCrudState<T> & TreeCrudActions<T>

// ==================== Composable ====================


/**
 * 树形请求适配器 Composable
 *
 * @param requestAdapter 树形请求适配器
 * @param options 配置选项
 * @returns 状态和操作
 */
export function useTreeCrud<T extends TreeNode>(
  requestAdapter: TreeRequestAdapter<T>,
  options: UseTreeCrudOptions = {}
): UseTreeCrudReturn<T> {
  // ==================== 配置 ====================
  const {
    childrenKey = 'children',
    hasChildrenKey = 'has_children',
    initialExpandLevel = 1,
  } = options

  // ==================== 状态 ====================
  const treeData = shallowRef<T[]>([]) as ShallowRef<T[]>
  const flatData = shallowRef<T[]>([]) as ShallowRef<T[]>
  const loading = ref(false)
  const loadingChildren = ref<Record<number, boolean>>({})
  const error = ref<Error | null>(null)

  const pagination = reactive({
    page: 1,
    pageSize: 20,
    total: 0,
    pages: 0,
  })

  const expandedKeys = ref(new Set<number>()) as Ref<Set<number>>
  const selectedKeys = ref(new Set<number>()) as Ref<Set<number>>

  const uiState = useTreeCrudUiState({
    treeData,
    flatData,
    loading,
    loadingChildren,
    error,
    expandedKeys,
    selectedKeys,
  })

  const dataActions = useTreeCrudData({
    requestAdapter,
    treeData,
    flatData,
    loading,
    loadingChildren,
    error,
    pagination,
    expandedKeys,
    childrenKey,
    hasChildrenKey,
    initialExpandLevel,
  })

  const {
    fetchTree,
    loadChildren,
    loadChildrenManual,
    refreshTree,
    query,
    isLeaf,
    getNodePath,
    findNode,
    getChildren,
  } = dataActions

  const {
    expandNode,
    collapseNode,
    toggleExpand,
    expandAll,
    collapseAll,
    selectNode,
    clearSelection,
    reset,
  } = uiState


  const mutations = useTreeCrudMutations({
    requestAdapter,
    treeData,
    flatData,
    loading,
    error,
    childrenKey,
    fetchTree,
  })

  const {
    create,
    update,
    deleteNode,
    move,
  } = mutations

  // ==================== 返回 ====================
  return {
    // 状态
    treeData,
    flatData,
    loading,
    loadingChildren,
    error,
    pagination,
    expandedKeys,
    selectedKeys,

    // 操作
    fetchTree,
    loadChildren,
    loadChildrenManual,
    refreshTree,
    query,
    create,
    update,
    delete: deleteNode,
    move,
    expandNode,
    collapseNode,
    toggleExpand,
    expandAll,
    collapseAll,
    selectNode,
    clearSelection,
    isLeaf,
    getNodePath,
    findNode,
    getChildren,
    reset,
  }
}

// ==================== 导出 ====================