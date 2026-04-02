/**
 * 树形 CRUD Composable
 *
 * 扩展通用 CRUD 支持树形结构数据管理
 *
 * 支持：
 * - 完整树加载（tree()）
 * - 懒加载子节点（children()）
 * - 分页查询（query()）
 * - 树形操作（展开、折叠、移动）
 *
 * @example
 * ```ts
 * const {
 *   treeData,
 *   loading,
 *   fetchTree,
 *   loadChildren,
 *   moveNode,
 *   query,      // 保留分页查询
 *   create,
 *   update,
 *   delete: deleteNode,
 *   isLeaf,
 * } = useTreeCrud(menusApi, {
 *   lazyLoad: true,
 *   childrenKey: 'children',
 *   hasChildrenKey: 'has_children'
 * })
 * ```
 */

import { ref, shallowRef, type Ref, type ShallowRef } from 'vue'
import { ElMessage } from 'element-plus'
import type { QueryOptions, PaginationData } from '@/api/base/crud-api'

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
 * 树形 API 接口（扩展 SoftDeleteCrudApi）
 */
export interface TreeApi<T extends TreeNode> {
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

  // 树形 API
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

// ==================== 辅助函数 ====================

/**
 * 扁平化树形数据
 */
function flattenTree<T extends TreeNode>(
  tree: T[],
  childrenKey: string,
  result: T[] = []
): T[] {
  for (const node of tree) {
    result.push(node)
    const children = node[childrenKey] as T[] | undefined
    if (children && children.length > 0) {
      flattenTree(children, childrenKey, result)
    }
  }
  return result
}

/**
 * 查找节点（递归）
 */
function findNodeInTree<T extends TreeNode>(
  tree: T[],
  id: number,
  childrenKey: string
): T | undefined {
  for (const node of tree) {
    if (node.id === id) {
      return node
    }
    const children = node[childrenKey] as T[] | undefined
    if (children && children.length > 0) {
      const found = findNodeInTree(children, id, childrenKey)
      if (found) {
        return found
      }
    }
  }
  return undefined
}

/**
 * 获取节点路径（从根到目标节点）
 */
function getNodePathInTree<T extends TreeNode>(
  tree: T[],
  id: number,
  childrenKey: string,
  path: T[] = []
): T[] | null {
  for (const node of tree) {
    if (node.id === id) {
      return [...path, node]
    }
    const children = node[childrenKey] as T[] | undefined
    if (children && children.length > 0) {
      const found = getNodePathInTree(children, id, childrenKey, [...path, node])
      if (found) {
        return found
      }
    }
  }
  return null
}

/**
 * 从树中获取直接子节点
 */
function getDirectChildren<T extends TreeNode>(
  tree: T[],
  parentId: number,
  childrenKey: string
): T[] {
  for (const node of tree) {
    if (node.id === parentId) {
      return (node[childrenKey] as T[]) || []
    }
    const children = node[childrenKey] as T[] | undefined
    if (children && children.length > 0) {
      const found = getDirectChildren(children, parentId, childrenKey)
      if (found.length > 0) {
        return found
      }
    }
  }
  return []
}

/**
 * 从树中移除节点
 */
function removeNodeFromTree<T extends TreeNode>(
  tree: T[],
  id: number,
  childrenKey: string
): boolean {
  for (let i = 0; i < tree.length; i++) {
    if (tree[i].id === id) {
      tree.splice(i, 1)
      return true
    }
    const children = tree[i][childrenKey] as T[] | undefined
    if (children && children.length > 0) {
      if (removeNodeFromTree(children, id, childrenKey)) {
        return true
      }
    }
  }
  return false
}

/**
 * 在树中更新节点
 */
function updateNodeInTree<T extends TreeNode>(
  tree: T[],
  id: number,
  updated: T,
  childrenKey: string
): boolean {
  for (let i = 0; i < tree.length; i++) {
    if (tree[i].id === id) {
      tree[i] = { ...tree[i], ...updated }
      return true
    }
    const children = tree[i][childrenKey] as T[] | undefined
    if (children && children.length > 0) {
      if (updateNodeInTree(children, id, updated, childrenKey)) {
        return true
      }
    }
  }
  return false
}

// ==================== Composable ====================

/**
 * 树形 CRUD Composable
 *
 * @param api 树形 API 实例
 * @param options 配置选项
 * @returns 状态和操作
 */
export function useTreeCrud<T extends TreeNode>(
  api: TreeApi<T>,
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

  // ==================== 计算属性 ====================

  // ==================== 树形数据操作 ====================

  /**
   * 加载完整树
   */
  async function fetchTree(): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const result = await api.tree()
      treeData.value = result
      flatData.value = flattenTree(result, childrenKey)

      // 自动展开根节点
      if (initialExpandLevel > 0) {
        expandToLevel(result, initialExpandLevel)
      }
    } catch (e) {
      error.value = e as Error
      console.error('Failed to fetch tree:', e)
    } finally {
      loading.value = false
    }
  }

  /**
   * 展开到指定层级
   */
  function expandToLevel(nodes: T[], level: number, currentLevel = 1): void {
    if (currentLevel > level) return

    for (const node of nodes) {
      if (currentLevel < level) {
        expandedKeys.value.add(node.id)
      }
      const children = node[childrenKey] as T[] | undefined
      if (children && children.length > 0) {
        expandToLevel(children, level, currentLevel + 1)
      }
    }
  }

  /**
   * 懒加载子节点（供 el-tree 使用）
   */
  function loadChildren(node: T, _treeNode: unknown, resolve: (data: T[]) => void): void {
    const nodeId = node.id

    // 检查是否已有子节点
    const existingChildren = node[childrenKey] as T[] | undefined
    if (existingChildren && existingChildren.length > 0) {
      resolve(existingChildren)
      return
    }

    // 标记加载状态
    loadingChildren.value[nodeId] = true

    api.children({ node_id: nodeId })
      .then((children) => {
        // 更新本地树数据中的子节点
        updateChildrenInTree(treeData.value, nodeId, children)
        resolve(children)
      })
      .catch((e) => {
        console.error('Failed to load children:', e)
        resolve([])
      })
      .finally(() => {
        loadingChildren.value[nodeId] = false
      })
  }

  /**
   * 更新树中的子节点
   */
  function updateChildrenInTree(
    tree: T[],
    parentId: number,
    children: T[]
  ): void {
    for (const node of tree) {
      if (node.id === parentId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (node as any)[childrenKey] = children
        return
      }
      const nodeChildren = node[childrenKey] as T[] | undefined
      if (nodeChildren && nodeChildren.length > 0) {
        updateChildrenInTree(nodeChildren, parentId, children)
      }
    }
  }

  /**
   * 手动加载子节点
   */
  async function loadChildrenManual(parentId: number): Promise<T[]> {
    loadingChildren.value[parentId] = true

    try {
      const children = await api.children({ node_id: parentId })
      updateChildrenInTree(treeData.value, parentId, children)
      flatData.value = flattenTree(treeData.value, childrenKey)
      return children
    } catch (e) {
      console.error('Failed to load children manually:', e)
      return []
    } finally {
      loadingChildren.value[parentId] = false
    }
  }

  /**
   * 刷新树
   */
  async function refreshTree(): Promise<void> {
    await fetchTree()
  }

  // ==================== 分页查询 ====================

  /**
   * 分页查询（扁平列表）
   */
  async function query(options?: QueryOptions): Promise<PaginationData<T>> {
    loading.value = true
    error.value = null

    try {
      const result = await api.query(options)
      pagination.page = result.page
      pagination.pageSize = result.size
      pagination.total = result.total
      pagination.pages = result.pages
      flatData.value = result.items
      return result
    } catch (e) {
      error.value = e as Error
      console.error('Failed to query:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  // ==================== CRUD 操作 ====================

  /**
   * 创建节点
   */
  async function create(data: unknown): Promise<T | null> {
    loading.value = true
    error.value = null

    try {
      const result = await api.create(data)
      ElMessage.success('创建成功')

      // 刷新树以获取最新结构
      await fetchTree()

      return result
    } catch (e) {
      error.value = e as Error
      ElMessage.error('创建失败')
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新节点
   */
  async function update(id: number, data: unknown): Promise<T | null> {
    loading.value = true
    error.value = null

    try {
      const result = await api.update(id, data)
      ElMessage.success('更新成功')

      // 更新本地树数据
      updateNodeInTree(treeData.value, id, result, childrenKey)
      flatData.value = flattenTree(treeData.value, childrenKey)

      return result
    } catch (e) {
      error.value = e as Error
      ElMessage.error('更新失败')
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * 删除节点
   */
  async function deleteNode(id: number, options?: unknown): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      await api.delete(id, options)
      ElMessage.success('删除成功')

      // 从树中移除节点
      removeNodeFromTree(treeData.value, id, childrenKey)
      flatData.value = flattenTree(treeData.value, childrenKey)

      return true
    } catch (e) {
      error.value = e as Error
      ElMessage.error('删除失败')
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 移动节点
   */
  async function move(
    id: number,
    targetId: number,
    position: 'before' | 'after' | 'inner'
  ): Promise<boolean> {
    if (!api.move) {
      console.warn('Move API not available')
      return false
    }

    loading.value = true
    error.value = null

    try {
      await api.move({ id, target_id: targetId, position })
      ElMessage.success('移动成功')

      // 刷新树
      await fetchTree()

      return true
    } catch (e) {
      error.value = e as Error
      ElMessage.error('移动失败')
      return false
    } finally {
      loading.value = false
    }
  }

  // ==================== 展开/折叠操作 ====================

  /**
   * 展开节点
   */
  function expandNode(id: number): void {
    expandedKeys.value.add(id)
  }

  /**
   * 折叠节点
   */
  function collapseNode(id: number): void {
    expandedKeys.value.delete(id)
  }

  /**
   * 切换展开状态
   */
  function toggleExpand(id: number): void {
    if (expandedKeys.value.has(id)) {
      expandedKeys.value.delete(id)
    } else {
      expandedKeys.value.add(id)
    }
  }

  /**
   * 展开所有
   */
  function expandAll(): void {
    const allIds = flatData.value.map((node) => node.id)
    expandedKeys.value = new Set(allIds)
  }

  /**
   * 折叠所有
   */
  function collapseAll(): void {
    expandedKeys.value.clear()
  }

  // ==================== 选择操作 ====================

  /**
   * 选择节点
   */
  function selectNode(id: number): void {
    selectedKeys.value.add(id)
  }

  /**
   * 清除选择
   */
  function clearSelection(): void {
    selectedKeys.value.clear()
  }

  // ==================== 辅助方法 ====================

  /**
   * 判断是否为叶子节点
   */
  function isLeaf(node: T): boolean {
    return node.is_leaf ?? !(node[hasChildrenKey] as boolean)
  }

  /**
   * 获取节点路径
   */
  function getNodePath(id: number): T[] {
    return getNodePathInTree(treeData.value, id, childrenKey) || []
  }

  /**
   * 查找节点
   */
  function findNode(id: number): T | undefined {
    return findNodeInTree(treeData.value, id, childrenKey)
  }

  /**
   * 获取直接子节点
   */
  function getChildren(parentId: number): T[] {
    return getDirectChildren(treeData.value, parentId, childrenKey)
  }

  /**
   * 重置状态
   */
  function reset(): void {
    treeData.value = []
    flatData.value = []
    loading.value = false
    loadingChildren.value = {}
    error.value = null
    expandedKeys.value.clear()
    selectedKeys.value.clear()
  }

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