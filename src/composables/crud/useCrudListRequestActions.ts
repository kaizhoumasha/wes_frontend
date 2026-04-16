import type { ComputedRef } from 'vue'
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
}) {
  async function handleCreate(formData: C): Promise<T | null> {
    const result = await options.crudAdapter.create(formData)
    if (result) {
      options.dialogs.close()
      options.syncCurrentPagination()
      const data = formData as Record<string, unknown>
      if (options.treeAdapter && 'parent_id' in data && data.parent_id) {
        const parentId = data.parent_id as number
        options.tree.expandNode(parentId)
        if (options.tree.treeConfig.lazyLoad) {
          await options.tree.loadChildrenManual(parentId)
        } else {
          options.tree.markParentHasChildren(parentId)
        }
      }
    }
    return result
  }

  async function handleEdit(id: number, formData: U): Promise<T | null> {
    const result = await options.crudAdapter.update(id, formData)
    if (result) {
      options.dialogs.close()
      options.syncCurrentPagination()
    }
    return result
  }

  async function handleDelete(id: number, deleteOptions?: Parameters<TRequestAdapter['delete']>[1]): Promise<boolean> {
    const result = await options.crudAdapter.delete(id, deleteOptions)
    options.syncCurrentPagination()
    return result
  }

  async function handleRestore(id: number): Promise<T | null> {
    return await options.trash.handleRestore(id)
  }

  async function handlePermanentDelete(id: number): Promise<boolean> {
    return await options.trash.handlePermanentDelete(id)
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
