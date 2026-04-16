import type { TreePropsConfig } from '@/components/ui/table/table.types'

export interface CrudTreeRenderState<T> {
  isTreeMode: boolean
  isTrashMode: boolean
  isSearchMode: boolean
  data: T[] | null | undefined
  treeData: T[] | null | undefined
}

export interface CrudTreeModeConfigInput<T> {
  isTreeMode: boolean
  isTrashMode: boolean
  treeState?: {
    loadChildren: (row: T, treeNode: unknown, resolve: (data: T[]) => void) => void
    expandedKeys: Set<number>
  }
  config?: {
    childrenKey?: string
    hasChildrenKey?: string
    lazyLoad?: boolean
  }
}

export interface CrudResolvedTreeModeConfig<T> {
  treeProps: TreePropsConfig
  rowKey: string
  lazy: boolean
  load: (row: T, treeNode: unknown, resolve: (data: T[]) => void) => void
  defaultExpandRowKeys: Array<string | number>
}

export function resolveCrudTableData<T>(state: CrudTreeRenderState<T>): T[] {
  if (state.isTreeMode && !state.isTrashMode) {
    if (state.isSearchMode) {
      return state.data ?? []
    }

    if (state.treeData) {
      return state.treeData
    }
  }

  return state.data ?? []
}

export function resolveCrudTreeModeConfig<T>(
  input: CrudTreeModeConfigInput<T>
): CrudResolvedTreeModeConfig<T> | undefined {
  if (!input.isTreeMode || input.isTrashMode || !input.treeState || !input.config) {
    return undefined
  }

  return {
    treeProps: {
      children: input.config.childrenKey ?? 'children',
      hasChildren: input.config.hasChildrenKey ?? 'has_children'
    },
    rowKey: 'id',
    lazy: input.config.lazyLoad ?? true,
    load: input.treeState.loadChildren,
    defaultExpandRowKeys: Array.from(input.treeState.expandedKeys) as (string | number)[]
  }
}
