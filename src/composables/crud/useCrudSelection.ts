import { computed, ref, type ComputedRef, type Ref } from 'vue'
import { ElMessage } from 'element-plus'
import { hasSoftDeleteCrudRequestAdapter, type CrudRequestAdapter } from '@/api/base/crud-request-adapter'

export interface CrudSelectionState<T> {
  selectedItems: Ref<T[]>
  selectedCount: ComputedRef<number>
  hasSelection: ComputedRef<boolean>
  batchDeleteLoading: Ref<boolean>
  batchRestoreLoading: Ref<boolean>
  batchPermanentDeleteLoading: Ref<boolean>
  handleSelectionChange: (selected: T[]) => void
  clearSelectionState: () => void
  handleBatchDelete: () => Promise<void>
  handleBatchRestore: () => Promise<void>
  handleBatchPermanentDelete: () => Promise<void>
}

export function useCrudSelection<
  T extends { id: number },
  TAdapter extends CrudRequestAdapter<T, unknown, unknown> = CrudRequestAdapter<T, unknown, unknown>
>(
  adapter: TAdapter,
  options: { onAfterBatchAction: () => Promise<void> }
): CrudSelectionState<T> {
  const selectedItems = ref<T[]>([]) as Ref<T[]>
  const batchDeleteLoading = ref(false)
  const batchRestoreLoading = ref(false)
  const batchPermanentDeleteLoading = ref(false)

  const selectedCount = computed(() => selectedItems.value.length)
  const hasSelection = computed(() => selectedItems.value.length > 0)

  function handleSelectionChange(selected: T[]): void {
    selectedItems.value = selected
  }

  function clearSelectionState(): void {
    selectedItems.value = []
  }

  async function handleBatchDelete(): Promise<void> {
    if (selectedItems.value.length === 0) {
      return
    }

    if (!('batchDelete' in adapter) || typeof adapter.batchDelete !== 'function') {
      return
    }

    batchDeleteLoading.value = true

    try {
      const result = await adapter.batchDelete(selectedItems.value.map((item: T) => item.id))
      clearSelectionState()
      await options.onAfterBatchAction()

      if (result.failed > 0) {
        ElMessage.warning(`成功删除 ${result.success} 个，失败 ${result.failed} 个`)
      } else if (result.success > 0) {
        ElMessage.success(`成功删除 ${result.success} 个`)
      }
    } finally {
      batchDeleteLoading.value = false
    }
  }

  async function handleBatchRestore(): Promise<void> {
    if (selectedItems.value.length === 0 || !hasSoftDeleteCrudRequestAdapter(adapter)) {
      return
    }

    batchRestoreLoading.value = true

    try {
      await adapter.batchRestore(selectedItems.value.map(item => item.id))
      clearSelectionState()
      await options.onAfterBatchAction()
    } finally {
      batchRestoreLoading.value = false
    }
  }

  async function handleBatchPermanentDelete(): Promise<void> {
    if (selectedItems.value.length === 0 || !hasSoftDeleteCrudRequestAdapter(adapter)) {
      return
    }

    batchPermanentDeleteLoading.value = true

    try {
      await adapter.batchPermanentDelete(selectedItems.value.map(item => item.id))
      clearSelectionState()
      await options.onAfterBatchAction()
    } finally {
      batchPermanentDeleteLoading.value = false
    }
  }

  return {
    selectedItems,
    selectedCount,
    hasSelection,
    batchDeleteLoading,
    batchRestoreLoading,
    batchPermanentDeleteLoading,
    handleSelectionChange,
    clearSelectionState,
    handleBatchDelete,
    handleBatchRestore,
    handleBatchPermanentDelete
  }
}
