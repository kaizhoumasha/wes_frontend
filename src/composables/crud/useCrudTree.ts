import {
  computed,
  ref,
  shallowRef,
  triggerRef,
  type ComputedRef,
  type Ref,
  type ShallowRef
} from 'vue'

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
  batchSort: (
    items: { id: number; parent_id: number | null; sort_order: number }[]
  ) => Promise<boolean>
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

  function notifyTreeDataChanged(): void {
    triggerRef(treeData)
  }

  function notifyExpandedKeysChanged(): void {
    triggerRef(expandedKeys)
  }

  function notifyLoadingChildrenChanged(): void {
    triggerRef(loadingChildren)
  }

  function setTreeData(nextTree: T[]): void {
    treeData.value = nextTree
    notifyTreeDataChanged()
  }

  function mutateTreeData(mutator: (tree: T[]) => T[]): void {
    setTreeData(mutator(treeData.value))
  }

  function mutateExpandedKeys(mutator: (keys: Set<number>) => void): void {
    mutator(expandedKeys.value)
    notifyExpandedKeysChanged()
  }

  function setLoadingChildrenState(nodeId: number, loading: boolean): void {
    loadingChildren.value[nodeId] = loading
    notifyLoadingChildrenChanged()
  }

  function getNodeChildren(node: T, key: string): T[] | undefined {
    return (node as Record<string, unknown>)[key] as T[] | undefined
  }

  function syncFlatData(): void {
    flatData.value = flattenTree(treeData.value, treeConfig.childrenKey)
  }

  function flattenTree(tree: T[], key: string, result: T[] = []): T[] {
    for (const node of tree) {
      result.push(node)
      const children = getNodeChildren(node, key)
      if (children && children.length > 0) {
        flattenTree(children, key, result)
      }
    }
    return result
  }

  function findNodeInTree(tree: T[], id: number, key: string): T | undefined {
    for (const node of tree) {
      if (node.id === id) return node
      const children = getNodeChildren(node, key)
      if (children?.length) {
        const found = findNodeInTree(children, id, key)
        if (found) return found
      }
    }
    return undefined
  }

  function updateChildrenInTree(
    tree: T[],
    parentId: number,
    children: T[],
    key: string,
    hasChildrenKey: string
  ): T[] {
    let changed = false

    const nextTree = tree.map(node => {
      if (node.id === parentId) {
        changed = true
        return {
          ...node,
          [key]: children,
          [hasChildrenKey]: children.length > 0
        } as T
      }

      const nodeChildren = getNodeChildren(node, key)
      if (!nodeChildren?.length) {
        return node
      }

      const nextChildren = updateChildrenInTree(
        nodeChildren,
        parentId,
        children,
        key,
        hasChildrenKey
      )
      if (nextChildren === nodeChildren) {
        return node
      }

      changed = true
      return {
        ...node,
        [key]: nextChildren
      } as T
    })

    return changed ? nextTree : tree
  }

  function markNodeHasChildren(tree: T[], parentId: number): T[] {
    let changed = false

    const nextTree = tree.map(node => {
      if (node.id === parentId) {
        changed = true
        return {
          ...node,
          [treeConfig.hasChildrenKey]: true
        } as T
      }

      const nodeChildren = getNodeChildren(node, treeConfig.childrenKey)
      if (!nodeChildren?.length) {
        return node
      }

      const nextChildren = markNodeHasChildren(nodeChildren, parentId)
      if (nextChildren === nodeChildren) {
        return node
      }

      changed = true
      return {
        ...node,
        [treeConfig.childrenKey]: nextChildren
      } as T
    })

    return changed ? nextTree : tree
  }

  function expandToLevel(nodes: T[], keys: Set<number>, level: number, currentLevel = 1): void {
    if (currentLevel > level) return
    for (const node of nodes) {
      if (currentLevel < level) {
        keys.add(node.id)
      }
      const children = getNodeChildren(node, treeConfig.childrenKey)
      if (children?.length) {
        expandToLevel(children, keys, level, currentLevel + 1)
      }
    }
  }

  async function fetchTree(forceFullTree = false): Promise<void> {
    if (!adapter?.tree) return

    setLoading(true)
    setError(null)

    try {
      const treeDepth = forceFullTree ? -1 : treeConfig.lazyLoad ? 0 : -1
      const result = await adapter.tree({ tree_depth: treeDepth })
      setTreeData(result)
      syncFlatData()

      if (!treeConfig.lazyLoad && treeConfig.initialExpandLevel > 0) {
        mutateExpandedKeys(keys => {
          keys.clear()
          expandToLevel(result, keys, treeConfig.initialExpandLevel)
        })
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

    // Always force reload from API to ensure we get fresh data
    // This prevents stale cache issues after delete/create operations
    setLoadingChildrenState(nodeId, true)

    adapter
      .children({ node_id: nodeId })
      .then(children => {
        mutateTreeData(tree =>
          updateChildrenInTree(
            tree,
            nodeId,
            children,
            treeConfig.childrenKey,
            treeConfig.hasChildrenKey
          )
        )
        syncFlatData()
        resolve(children)
      })
      .catch(() => resolve([]))
      .finally(() => {
        setLoadingChildrenState(nodeId, false)
      })
  }

  async function loadChildrenManual(parentId: number): Promise<T[]> {
    if (!adapter?.children) return []

    setLoadingChildrenState(parentId, true)
    try {
      const children = await adapter.children({ node_id: parentId })
      mutateTreeData(tree =>
        updateChildrenInTree(
          tree,
          parentId,
          children,
          treeConfig.childrenKey,
          treeConfig.hasChildrenKey
        )
      )
      syncFlatData()
      return children
    } catch {
      return []
    } finally {
      setLoadingChildrenState(parentId, false)
    }
  }

  async function refreshTree(): Promise<void> {
    await fetchTree()
  }

  async function move(
    id: number,
    targetId: number,
    position: 'before' | 'after' | 'inner'
  ): Promise<boolean> {
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

  async function batchSort(
    items: { id: number; parent_id: number | null; sort_order: number }[]
  ): Promise<boolean> {
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

  async function batchSortFallback(
    items: { id: number; parent_id: number | null; sort_order: number }[]
  ): Promise<boolean> {
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
    mutateExpandedKeys(keys => {
      keys.add(id)
    })
  }

  function collapseNode(id: number): void {
    mutateExpandedKeys(keys => {
      keys.delete(id)
    })
  }

  function toggleExpand(id: number): void {
    mutateExpandedKeys(keys => {
      if (keys.has(id)) {
        keys.delete(id)
      } else {
        keys.add(id)
      }
    })
  }

  function expandAll(): void {
    const allIds = flatData.value.map(node => node.id)
    expandedKeys.value = new Set(allIds)
  }

  function collapseAll(): void {
    mutateExpandedKeys(keys => {
      keys.clear()
    })
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
    if (findNodeInTree(treeData.value, parentId, treeConfig.childrenKey)) {
      mutateTreeData(tree => markNodeHasChildren(tree, parentId))
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
