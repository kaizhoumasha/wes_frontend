import { ref, watch, type Ref } from 'vue'
import { ElMessage } from 'element-plus'

interface EditSessionOptions<TFormValues extends Record<string, unknown>> {
  open: Ref<boolean>
  editId: Ref<number | string | null>
  cachedData: Ref<Record<string, unknown> | null | undefined>
  loadData: Ref<((id: number | string) => Promise<Record<string, unknown> | null | undefined>) | undefined>
  buildEmptyFormValues: () => TFormValues
  mapFormValuesFromData: (data: Record<string, unknown>) => TFormValues
  resetForm: (options: { values: TFormValues }) => void
  closeDialog: () => void
}

interface CrudFormEditSession {
  originalData: Ref<Record<string, unknown> | null>
  resetDialogState: () => void
  resolveEditData: (
    editId: number | string,
    options?: { useCache?: boolean }
  ) => Promise<Record<string, unknown>>
}

export function useCrudFormEditSession<TFormValues extends Record<string, unknown>>(
  options: EditSessionOptions<TFormValues>
): CrudFormEditSession {
  const originalData = ref<Record<string, unknown> | null>(null)

  function resetDialogState(): void {
    options.resetForm({
      values: options.buildEmptyFormValues()
    })
    originalData.value = null
  }

  async function resolveEditData(
    editId: number | string,
    resolveOptions: { useCache?: boolean } = {}
  ): Promise<Record<string, unknown>> {
    if (resolveOptions.useCache !== false && options.cachedData.value) {
      return options.cachedData.value
    }

    const loadData = options.loadData.value
    if (!loadData) {
      return {}
    }

    const loadedData = await loadData(editId)
    return loadedData ?? {}
  }

  watch(
    () => [options.open.value, options.editId.value] as const,
    async ([open, editId]) => {
      if (!open) {
        resetDialogState()
        return
      }

      if (editId !== null) {
        let data: Record<string, unknown>

        try {
          data = await resolveEditData(editId)
        } catch (error) {
          console.error('获取编辑数据失败:', error)
          ElMessage.error('获取数据失败，请重试')
          options.closeDialog()
          return
        }

        options.resetForm({
          values: options.mapFormValuesFromData(data)
        })
        originalData.value = { ...data }
        return
      }

      options.resetForm({
        values: options.buildEmptyFormValues()
      })
      originalData.value = null
    },
    { immediate: true }
  )

  return {
    originalData,
    resetDialogState,
    resolveEditData
  }
}
