import { computed, reactive, ref, type ComputedRef } from 'vue'
import { ElMessage } from 'element-plus'
import type { CrudPageConfig, CrudPageEntity } from '@/components/common/crud-page/types'

interface TreeControllerState<TItem extends CrudPageEntity> {
  tree?: {
    isTreeMode: { value: boolean }
    treeData?: { value: TItem[] }
    fetchTree?: ((forceFullTree: boolean) => Promise<void>) | (() => Promise<void>)
    move?: (id: number, targetId: number, position: 'before' | 'after' | 'inner') => Promise<boolean>
    batchSort?: (items: { id: number; parent_id: number | null; sort_order: number }[]) => Promise<boolean>
  }
  dialogs: {
    openCreate: (options?: { initialValues?: Record<string, unknown> }) => void
    close: () => void
  }
}

export function useCrudPageTreeActions<
  TItem extends CrudPageEntity,
  TCreate extends object,
  TUpdate extends object
>(options: {
  config: CrudPageConfig<TItem, TCreate, TUpdate>
  state: TreeControllerState<TItem>
}) {
  const { config, state } = options

  const moveDialog = reactive({
    open: false,
    movingId: null as number | null,
    loading: false
  })

  const sortDialog = reactive({
    open: false,
    loading: false
  })

  const createChildInfo = ref<{ parentId: number; parentName: string } | null>(null)

  async function handleCreate(): Promise<void> {
    if (state.tree?.fetchTree) {
      await (state.tree.fetchTree as (forceFullTree: boolean) => Promise<void>)(true)
    }
    state.dialogs.openCreate()
  }

  function handleMove(row: TItem): void {
    moveDialog.open = true
    moveDialog.movingId = row.id
  }

  function handleCreateChild(row: TItem): void {
    if (!state.tree?.isTreeMode.value) return
    const displayField = config.resource.treeMode?.displayField ?? 'name'
    const parentName = String((row as Record<string, unknown>)[displayField] ?? row.id)
    createChildInfo.value = { parentId: row.id, parentName }
    state.dialogs.openCreate({ initialValues: { parent_id: row.id } })
  }

  function handleFormDialogClose(open: boolean): void {
    if (!open) {
      createChildInfo.value = null
      if (state.tree?.fetchTree) {
        ;(state.tree.fetchTree as (forceFullTree: boolean) => Promise<void>)(false)
      }
    }
    state.dialogs.close()
  }

  async function handleMoveConfirm(
    targetId: number,
    position: 'before' | 'after' | 'inner'
  ): Promise<void> {
    if (!moveDialog.movingId || !state.tree?.move) return

    moveDialog.loading = true
    try {
      const success = await state.tree.move(moveDialog.movingId, targetId, position)
      if (success) {
        ElMessage.success('移动成功')
        moveDialog.open = false
        moveDialog.movingId = null
      } else {
        ElMessage.error('移动失败')
      }
    } catch {
      ElMessage.error('移动失败')
    } finally {
      moveDialog.loading = false
    }
  }

  function handleMoveCancel(): void {
    moveDialog.open = false
    moveDialog.movingId = null
  }

  async function handleSort(): Promise<void> {
    if (state.tree?.fetchTree) {
      await (state.tree.fetchTree as (forceFullTree: boolean) => Promise<void>)(true)
    }
    sortDialog.open = true
  }

  async function handleSortConfirm(items: { id: number; parent_id: number | null; sort_order: number }[]): Promise<void> {
    if (!state.tree?.batchSort || items.length === 0) {
      sortDialog.open = false
      ;(state.tree?.fetchTree as ((forceFullTree: boolean) => Promise<void>) | undefined)?.(false)
      return
    }

    sortDialog.loading = true
    try {
      const success = await state.tree.batchSort(items)
      if (success) {
        ElMessage.success('排序已保存')
        sortDialog.open = false
        await (state.tree?.fetchTree as ((forceFullTree: boolean) => Promise<void>) | undefined)?.(false)
      } else {
        ElMessage.error('保存排序失败')
      }
    } catch {
      ElMessage.error('保存排序失败')
    } finally {
      sortDialog.loading = false
    }
  }

  function handleSortCancel(): void {
    sortDialog.open = false
    ;(state.tree?.fetchTree as ((forceFullTree: boolean) => Promise<void>) | undefined)?.(false)
  }

  const readonlyDisplayFields: ComputedRef<Record<string, string> | undefined> = computed(() => {
    if (!createChildInfo.value) return undefined
    return { parent_id: createChildInfo.value.parentName }
  })

  const treeSelectConfig = computed(() => {
    if (!state.tree?.isTreeMode?.value || !state.tree.treeData?.value) return undefined
    const childrenKey = config.resource.treeMode?.childrenKey ?? 'children'
    const displayField = config.resource.treeMode?.displayField ?? 'name'
    return {
      data: state.tree.treeData.value,
      props: {
        value: 'id',
        label: displayField,
        children: childrenKey
      },
      placeholder: '选择父级'
    }
  })

  return {
    moveDialog,
    sortDialog,
    createChildInfo,
    readonlyDisplayFields,
    treeSelectConfig,
    handleCreate,
    handleMove,
    handleCreateChild,
    handleFormDialogClose,
    handleMoveConfirm,
    handleMoveCancel,
    handleSort,
    handleSortConfirm,
    handleSortCancel
  }
}
