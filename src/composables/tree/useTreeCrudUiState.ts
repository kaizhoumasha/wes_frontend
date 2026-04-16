import type { Ref, ShallowRef } from 'vue'
import type { TreeNode } from '@/composables/useTreeCrud'

interface UseTreeCrudUiStateOptions<T extends TreeNode> {
  treeData: ShallowRef<T[]>
  flatData: ShallowRef<T[]>
  loading: Ref<boolean>
  loadingChildren: Ref<Record<number, boolean>>
  error: Ref<Error | null>
  expandedKeys: Ref<Set<number>>
  selectedKeys: Ref<Set<number>>
}

export function useTreeCrudUiState<T extends TreeNode>({
  treeData,
  flatData,
  loading,
  loadingChildren,
  error,
  expandedKeys,
  selectedKeys,
}: UseTreeCrudUiStateOptions<T>) {
  function expandNode(id: number): void {
    expandedKeys.value.add(id)
  }

  function collapseNode(id: number): void {
    expandedKeys.value.delete(id)
  }

  function toggleExpand(id: number): void {
    if (expandedKeys.value.has(id)) {
      expandedKeys.value.delete(id)
      return
    }

    expandedKeys.value.add(id)
  }

  function expandAll(): void {
    const allIds = flatData.value.map(node => node.id)
    expandedKeys.value = new Set(allIds)
  }

  function collapseAll(): void {
    expandedKeys.value.clear()
  }

  function selectNode(id: number): void {
    selectedKeys.value.add(id)
  }

  function clearSelection(): void {
    selectedKeys.value.clear()
  }

  function reset(): void {
    treeData.value = []
    flatData.value = []
    loading.value = false
    loadingChildren.value = {}
    error.value = null
    expandedKeys.value.clear()
    selectedKeys.value.clear()
  }

  return {
    expandNode,
    collapseNode,
    toggleExpand,
    expandAll,
    collapseAll,
    selectNode,
    clearSelection,
    reset,
  }
}
