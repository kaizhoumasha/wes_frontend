import type { Ref, ShallowRef } from 'vue'
import type { PaginationData, QueryOptions } from '@/api/base/crud-request-adapter'
import type { TreeNode, TreeRequestAdapter } from '@/composables/useTreeCrud'
import {
  findNodeInTree,
  flattenTree,
  getDirectChildren,
  getNodePathInTree,
  updateChildrenInTree,
} from '@/composables/tree/tree-helpers'

interface UseTreeCrudDataOptions<T extends TreeNode> {
  requestAdapter: TreeRequestAdapter<T>
  treeData: ShallowRef<T[]>
  flatData: ShallowRef<T[]>
  loading: Ref<boolean>
  loadingChildren: Ref<Record<number, boolean>>
  error: Ref<Error | null>
  pagination: {
    page: number
    pageSize: number
    total: number
    pages: number
  }
  expandedKeys: Ref<Set<number>>
  childrenKey: string
  hasChildrenKey: string
  initialExpandLevel: number
}

export function useTreeCrudData<T extends TreeNode>({
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
}: UseTreeCrudDataOptions<T>) {
  function expandToLevel(nodes: T[], level: number, currentLevel = 1): void {
    if (currentLevel > level) {
      return
    }

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

  async function fetchTree(): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const result = await requestAdapter.tree()
      treeData.value = result
      flatData.value = flattenTree(result, childrenKey)

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

  function loadChildren(node: T, _treeNode: unknown, resolve: (data: T[]) => void): void {
    const nodeId = node.id
    const existingChildren = node[childrenKey] as T[] | undefined
    if (existingChildren && existingChildren.length > 0) {
      resolve(existingChildren)
      return
    }

    loadingChildren.value[nodeId] = true

    requestAdapter.children({ node_id: nodeId })
      .then((children) => {
        updateChildrenInTree(treeData.value, nodeId, children, childrenKey)
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

  async function loadChildrenManual(parentId: number): Promise<T[]> {
    loadingChildren.value[parentId] = true

    try {
      const children = await requestAdapter.children({ node_id: parentId })
      updateChildrenInTree(treeData.value, parentId, children, childrenKey)
      flatData.value = flattenTree(treeData.value, childrenKey)
      return children
    } catch (e) {
      console.error('Failed to load children manually:', e)
      return []
    } finally {
      loadingChildren.value[parentId] = false
    }
  }

  async function refreshTree(): Promise<void> {
    await fetchTree()
  }

  async function query(options?: QueryOptions): Promise<PaginationData<T>> {
    loading.value = true
    error.value = null

    try {
      const result = await requestAdapter.query(options)
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

  function isLeaf(node: T): boolean {
    return node.is_leaf ?? !(node[hasChildrenKey] as boolean)
  }

  function getNodePath(id: number): T[] {
    return getNodePathInTree(treeData.value, id, childrenKey) || []
  }

  function findNode(id: number): T | undefined {
    return findNodeInTree(treeData.value, id, childrenKey)
  }

  function getChildren(parentId: number): T[] {
    return getDirectChildren(treeData.value, parentId, childrenKey)
  }

  return {
    fetchTree,
    loadChildren,
    loadChildrenManual,
    refreshTree,
    query,
    isLeaf,
    getNodePath,
    findNode,
    getChildren,
  }
}
