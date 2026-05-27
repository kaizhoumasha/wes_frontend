import { ElMessageBox } from 'element-plus'
import type { CrudPageConfig, CrudPageEntity, CrudPageViewMode } from '@/components/common/crud-page/types'

export function resolveEntityId(id: number | string): number {
  const numericId = typeof id === 'number' ? id : Number(id)

  if (!Number.isFinite(numericId)) {
    throw new Error(`Invalid entity id: ${String(id)}`)
  }

  return numericId
}

export function resolveSubmitPayload<TPayload extends object>(
  formData: Record<string, unknown>,
  transform?: (formData: Record<string, unknown>) => TPayload
): TPayload {
  return transform ? transform(formData) : (formData as unknown as TPayload)
}

export function useCrudPageActions<
  TItem extends CrudPageEntity,
  TCreate extends object,
  TUpdate extends object
>(options: {
  config: CrudPageConfig<TItem, TCreate, TUpdate>
  state: {
    selection: {
      handleBatchDelete: () => Promise<void>
      handleBatchRestore: () => Promise<void>
      handleBatchPermanentDelete: () => Promise<void>
      clearSelectionState: () => void
      handleSelectionChange: (selected: TItem[]) => void
    }
    dialogs: {
      close: () => void
      editingId: { value: number | null }
    }
    view: {
      setViewMode: (mode: CrudPageViewMode) => void
    }
    search: {
      handleSearch: (page?: number) => Promise<void>
    }
    state: {
      viewMode: { value: CrudPageViewMode }
      pagination: { page: number }
    }
    apiActions: {
      handleEdit: (id: number, formData: TUpdate) => Promise<TItem | null>
      handleCreate: (formData: TCreate) => Promise<TItem | null>
    }
  }
  clearTableSelection: () => void
}) {
  const { config, state, clearTableSelection } = options

  async function loadFormData(id: number | string): Promise<Record<string, unknown>> {
    const numericId = resolveEntityId(id)
    return await config.resource.requestAdapter.getById(numericId) as unknown as Record<string, unknown>
  }

  async function handleBatchDelete(): Promise<void> {
    await state.selection.handleBatchDelete()
    clearTableSelection()
  }

  async function handleBatchRestore(): Promise<void> {
    await state.selection.handleBatchRestore()
    clearTableSelection()
  }

  async function handleBatchPermanentDelete(): Promise<void> {
    try {
      await ElMessageBox.confirm(
        '确认彻底删除选中的记录吗？此操作不可恢复。',
        '批量彻底删除',
        {
          confirmButtonText: '确认彻底删除',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )

      await state.selection.handleBatchPermanentDelete()
      clearTableSelection()
    } catch (error) {
      if (error === 'cancel' || error === 'close') {
        return
      }

      throw error
    }
  }

  function handleCancelSelection(): void {
    state.selection.clearSelectionState()
    clearTableSelection()
  }

  function handleSelectionChange(selected: unknown[]): void {
    state.selection.handleSelectionChange(selected as TItem[])
  }

  async function handleViewModeChange(mode: string): Promise<void> {
    const nextMode = mode as CrudPageViewMode

    if (state.state.viewMode.value === nextMode) {
      return
    }

    state.dialogs.close()
    handleCancelSelection()
    state.view.setViewMode(nextMode)
    await state.search.handleSearch(1)
  }

  async function handleSubmit(formData: Record<string, unknown>) {
    if (!config.form) {
      return
    }

    if (state.dialogs.editingId.value) {
      await state.apiActions.handleEdit(
        state.dialogs.editingId.value,
        resolveSubmitPayload(formData, config.form.submit?.update)
      )
      return
    }

    const result = await state.apiActions.handleCreate(
      resolveSubmitPayload(formData, config.form.submit?.create)
    )
    if (result && config.resource.onCreateResult) {
      await config.resource.onCreateResult(result as unknown as Record<string, unknown>)
    }
  }

  return {
    loadFormData,
    handleBatchDelete,
    handleBatchRestore,
    handleBatchPermanentDelete,
    handleCancelSelection,
    handleSelectionChange,
    handleViewModeChange,
    handleSubmit
  }
}
