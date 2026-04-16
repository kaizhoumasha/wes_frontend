import { computed, ref, shallowRef, type ComputedRef, type Ref, type ShallowRef } from 'vue'

export interface CrudTreeNode {
  id: number
  parent_id?: number | null
  children?: CrudTreeNode[]
  has_children?: boolean
  is_leaf?: boolean
  [key: string]: unknown
}

export interface CrudTreeApi<T extends CrudTreeNode> {
  tree: (params?: { tree_depth?: number; root_id?: number } | undefined) => Promise<T[]>
  children: (nodeId: number | { node_id: number }) => Promise<T[]>
  siblings?: (params: { node_id: number }, query?: unknown) => Promise<T[]>
  ancestors?: (params: { node_id: number }, query?: unknown) => Promise<T[]>
  move?: (body: unknown) => Promise<unknown>
  batchSort?: (body: unknown) => Promise<unknown>
}

export interface CrudTreeModeOptions {
  enabled?: boolean
  childrenKey?: string
  hasChildrenKey?: string
  lazyLoad?: boolean
  initialExpandLevel?: number
}

export interface CrudTreeState<T> {
  isTreeMode: ComputedRef<boolean>
  treeData: ShallowRef<T[]>
  flatData: ShallowRef<T[]>
  loadingChildren: Ref<Record<number, boolean>>
  expandedKeys: Ref<Set<number>>
  treeConfig: {
    childrenKey: string
    hasChildrenKey: string
    initialExpandLevel: number
    lazyLoad: boolean
  }
  fetchTree: (forceFullTree?: boolean) => Promise<void>
  loadChildren: (node: T, treeNode: unknown, resolve: (data: T[]) => void) => void
  loadChildrenManual: (parentId: number) => Promise<T[]>
  refreshTree: () => Promise<void>
  move: (id: number, targetId: number, position: 'before' | 'after' | 'inner') => Promise<boolean>
  batchSort: (items: { id: number; parent_id: number | null; sort_order: number }[]) => Promise<boolean>
  expandNode: (id: number) => void
  collapseNode: (id: number) => void
  toggleExpand: (id: number) => void
  expandAll: () => void
  collapseAll: () => void
  isLeaf: (node: T) => boolean
  findNode: (id: number) => T | undefined
  markParentHasChildren: (parentId: number) => void
}

export function useCrudTree<T extends { id: number }>(options: {
  enabled?: boolean
  adapter: CrudTreeApi<T> | null
  treeMode?: CrudTreeModeOptions
  setLoading: (loading: boolean) => void
  setError: (error: Error | null) => void
}): CrudTreeState<T> {
  const { enabled, adapter, treeMode, setLoading, setError } = options

  const isTreeMode = computed(() => !!enabled)
  const treeData = shallowRef<T[]>([]) as ShallowRef<T[]>
  const flatData = shallowRef<T[]>([]) as ShallowRef<T[]>
  const loadingChildren = ref<Record<number, boolean>>({})
  const expandedKeys = ref(new Set<number>()) as Ref<Set<number>>

  const treeConfig = {
    childrenKey: treeMode?.childrenKey ?? 'children',
    hasChildrenKey: treeMode?.hasChildrenKey ?? 'has_children',
    initialExpandLevel: treeMode?.initialExpandLevel ?? 1,
    lazyLoad: treeMode?.lazyLoad ?? false
  }

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

  function updateChildrenInTree(tree: T[], parentId: number, children: T[], key: string, hasChildrenKey: string): void {
    for (const node of tree) {
      if (node.id === parentId) {
        (node as Record<string, unknown>)[key] = children
        ;(node as Record<string, unknown>)[hasChildrenKey] = children.length > 0
        return
      }
      const nodeChildren = (node as Record<string, unknown>)[key] as T[] | undefined
      if (nodeChildren?.length) {
        updateChildrenInTree(nodeChildren, parentId, children, key, hasChildrenKey)
      }
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

  async function fetchTree(forceFullTree = false): Promise<void> {
    if (!adapter?.tree) return

    setLoading(true)
    setError(null)

    try {
      const treeDepth = forceFullTree ? -1 : (treeConfig.lazyLoad ? 0 : -1)
      const result = await adapter.tree({ tree_depth: treeDepth })
      treeData.value = result
      flatData.value = flattenTree(result, treeConfig.childrenKey)

      if (!treeConfig.lazyLoad && treeConfig.initialExpandLevel > 0) {
        expandToLevel(result, treeConfig.initialExpandLevel)
      }
    } catch (error) {
      setError(error as Error)
      console.error('Failed to fetch tree:', error)
    } finally {
      setLoading(false)
    }
  }

  function loadChildren(node: T, _treeNode: unknown, resolve: (data: T[]) => void): void {
    if (!adapter?.children) {
      resolve([])
      return
    }

    const nodeId = node.id as number
    const existingChildren = (node as Record<string, unknown>)[treeConfig.childrenKey] as T[] | undefined
    if (existingChildren?.length) {
      resolve(existingChildren)
      return
    }

    loadingChildren.value[nodeId] = true

    adapter
      .children({ node_id: nodeId })
      .then((children) => {
        updateChildrenInTree(treeData.value, nodeId, children, treeConfig.childrenKey, treeConfig.hasChildrenKey)
        flatData.value = flattenTree(treeData.value, treeConfig.childrenKey)
        resolve(children)
      })
      .catch(() => resolve([]))
      .finally(() => {
        loadingChildren.value[nodeId] = false
      })
  }

  async function loadChildrenManual(parentId: number): Promise<T[]> {
    if (!adapter?.children) return []

    loadingChildren.value[parentId] = true
    try {
      const children = await adapter.children({ node_id: parentId })
      updateChildrenInTree(treeData.value, parentId, children, treeConfig.childrenKey, treeConfig.hasChildrenKey)
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

  async function move(id: number, targetId: number, position: 'before' | 'after' | 'inner'): Promise<boolean> {
    if (!adapter?.move) return false

    setLoading(true)
    try {
      await adapter.move({ id, target_id: targetId, position })
      await fetchTree()
      return true
    } catch {
      return false
    } finally {
      setLoading(false)
    }
  }

  async function batchSort(items: { id: number; parent_id: number | null; sort_order: number }[]): Promise<boolean> {
    if (!adapter?.batchSort) {
      return await batchSortFallback(items)
    }

    setLoading(true)
    try {
      await adapter.batchSort({ items })
      return true
    } catch {
      return false
    } finally {
      setLoading(false)
    }
  }

  async function batchSortFallback(items: { id: number; parent_id: number | null; sort_order: number }[]): Promise<boolean> {
    if (!adapter?.move) return false

    setLoading(true)
    try {
      for (const item of items) {
        if (item.parent_id !== null) {
          await adapter.move({ id: item.id, target_id: item.parent_id, position: 'inner' })
        }
      }
      return true
    } catch {
      return false
    } finally {
      setLoading(false)
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

  function markParentHasChildren(parentId: number): void {
    const parentNode = findNodeInTree(treeData.value, parentId, treeConfig.childrenKey)
    if (parentNode) {
      ;(parentNode as Record<string, unknown>)[treeConfig.hasChildrenKey] = true
    }
  }

  return {
    isTreeMode,
    treeData,
    flatData,
    loadingChildren,
    expandedKeys,
    treeConfig,
    fetchTree,
    loadChildren,
    loadChildrenManual,
    refreshTree,
    move,
    batchSort,
    expandNode,
    collapseNode,
    toggleExpand,
    expandAll,
    collapseAll,
    isLeaf,
    findNode,
    markParentHasChildren
  }
}
