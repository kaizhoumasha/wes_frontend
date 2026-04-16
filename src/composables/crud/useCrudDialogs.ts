import { ref, type Ref } from 'vue'

export interface CrudDialogState {
  formOpen: Ref<boolean>
  editingId: Ref<number | null>
  key: Ref<number>
  createInitialValues: Ref<Record<string, unknown> | null>
  openCreate: (options?: { initialValues?: Record<string, unknown> }) => void
  openEdit: (id: number) => void
  close: () => void
}

export function useCrudDialogs(): CrudDialogState {
  const formOpen = ref(false)
  const editingId = ref<number | null>(null)
  const key = ref(0)
  const createInitialValues = ref<Record<string, unknown> | null>(null)

  function refreshDialog(): void {
    key.value++
  }

  function openCreate(options?: { initialValues?: Record<string, unknown> }): void {
    editingId.value = null
    createInitialValues.value = options?.initialValues ?? null
    formOpen.value = true
    refreshDialog()
  }

  function openEdit(id: number): void {
    editingId.value = id
    formOpen.value = true
    refreshDialog()
  }

  function close(): void {
    formOpen.value = false
    editingId.value = null
    createInitialValues.value = null
  }

  return {
    formOpen,
    editingId,
    key,
    createInitialValues,
    openCreate,
    openEdit,
    close
  }
}
