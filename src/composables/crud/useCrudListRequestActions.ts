import type { ComputedRef, Ref } from 'vue'
import type { CrudRequestAdapter } from '@/api/base/crud-request-adapter'
import type { CrudDialogState } from '@/composables/crud/useCrudDialogs'
import type { CrudTrashState } from '@/composables/crud/useCrudTrash'
import type { CrudTreeState } from '@/composables/crud/useCrudTree'

export function useCrudListRequestActions<
  T extends { id: number },
  C,
  U,
  TRequestAdapter extends CrudRequestAdapter<T, C, U> = CrudRequestAdapter<T, C, U>
>(options: {
  crudAdapter: {
    create: (formData: C) => Promise<T | null>
    update: (id: number, formData: U) => Promise<T | null>
    delete: (id: number, options?: Parameters<TRequestAdapter['delete']>[1]) => Promise<boolean>
  }
  dialogs: CrudDialogState
  treeAdapter: unknown | null
  tree: CrudTreeState<T>
  items: ComputedRef<T[]>
  trash: Pick<CrudTrashState<T>, 'handleRestore' | 'handlePermanentDelete'>
  syncCurrentPagination: () => void
  refreshCurrentView: () => Promise<void>
  directAdapter: {
    create: (formData: C) => Promise<T | null>
    update: (id: number, formData: U) => Promise<T | null>
    delete: (id: number, options?: Parameters<TRequestAdapter['delete']>[1]) => Promise<boolean>
  }
  isSearchMode?: Ref<boolean>
}) {
  const isTreeMode = !!options.treeAdapter

  function getMutationAdapter() {
    return isTreeMode ? options.directAdapter : options.crudAdapter
  }

  function isTreeDataMode(): boolean {
    return isTreeMode && !options.isSearchMode?.value
  }

  function readParentId(data: Record<string, unknown>): number | null {
    return typeof data.parent_id === 'number' ? data.parent_id : null
  }

  function resolveCreateParentId(formData: C, result: T): number | null {
    const dialogInitialValues = options.dialogs.createInitialValues.value
    const initialParentId = dialogInitialValues
      ? readParentId(dialogInitialValues as Record<string, unknown>)
      : null

    if (initialParentId !== null) {
      return initialParentId
    }

    const formParentId = readParentId(formData as Record<string, unknown>)
    if (formParentId !== null) {
      return formParentId
    }

    return readParentId(result as Record<string, unknown>)
  }

  async function refreshTreeAfterCreate(parentId: number | null): Promise<void> {
    if (!isTreeMode) {
      options.syncCurrentPagination()
      return
    }

    if (!isTreeDataMode()) {
      await options.refreshCurrentView()
      return
    }

    if (parentId) {
      if (options.tree.treeConfig.lazyLoad) {
        await options.tree.loadChildrenManual(parentId)
        options.tree.expandNode(parentId)
        return
      }

      options.tree.markParentHasChildren(parentId)
      options.tree.expandNode(parentId)
      await options.tree.fetchTree(false)
      return
    }

    await options.tree.fetchTree(false)
  }

  async function refreshTreeAfterDelete(id: number): Promise<void> {
    if (!isTreeMode) {
      options.syncCurrentPagination()
      return
    }

    if (!isTreeDataMode()) {
      await options.refreshCurrentView()
      return
    }

    const existingNode = options.tree.findNode(id) as Record<string, unknown> | undefined
    const parentId = typeof existingNode?.parent_id === 'number' ? existingNode.parent_id : null

    if (parentId && options.tree.treeConfig.lazyLoad) {
      const children = await options.tree.loadChildrenManual(parentId)

      if (children.length === 0) {
        options.tree.collapseNode(parentId)
      }
      return
    }

    await options.tree.fetchTree(false)
  }

  async function refreshAfterEdit(): Promise<void> {
    if (!isTreeMode) {
      options.syncCurrentPagination()
      return
    }

    if (isTreeDataMode()) {
      await options.tree.fetchTree(false)
      return
    }

    await options.refreshCurrentView()
  }

  async function handleCreate(formData: C): Promise<T | null> {
    const result = await getMutationAdapter().create(formData)
    if (result) {
      const parentId = resolveCreateParentId(formData, result)
      options.dialogs.close()
      await refreshTreeAfterCreate(parentId)
    }
    return result
  }

  async function handleEdit(id: number, formData: U): Promise<T | null> {
    const result = await getMutationAdapter().update(id, formData)
    if (result) {
      options.dialogs.close()
      await refreshAfterEdit()
    }
    return result
  }

  async function handleDelete(
    id: number,
    deleteOptions?: Parameters<TRequestAdapter['delete']>[1]
  ): Promise<boolean> {
    const result = await getMutationAdapter().delete(id, deleteOptions)
    if (result) {
      await refreshTreeAfterDelete(id)
    }
    return result
  }

  async function handleRestore(id: number): Promise<T | null> {
    const result = await options.trash.handleRestore(id)
    if (result && isTreeMode) {
      await options.tree.fetchTree(false)
    }
    return result
  }

  async function handlePermanentDelete(id: number): Promise<boolean> {
    const result = await options.trash.handlePermanentDelete(id)
    if (result && isTreeMode) {
      await options.tree.fetchTree(false)
    }
    return result
  }

  function getCachedData(id: number): T | undefined {
    return options.items.value.find(item => item.id === id)
  }

  return {
    handleCreate,
    handleEdit,
    handleDelete,
    handleRestore,
    handlePermanentDelete,
    getCachedData
  }
}
