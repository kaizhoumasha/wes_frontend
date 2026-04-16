import { ref, type Ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormFieldConfig } from '@/composables/useTableColumns'
import { collectChangedFields, collectCreateFields, isFieldVisibleInMode } from './form-helpers'

interface CrudFormSubmitOptions<TFormValues extends Record<string, unknown>> {
  isEditMode: Ref<boolean>
  editId: Ref<number | string | null>
  enableOptimisticLock: Ref<boolean>
  versionField: Ref<string>
  fieldConfig: Ref<FormFieldConfig[]>
  originalData: Ref<Record<string, unknown> | null>
  handleSubmit: (cb: (values: TFormValues) => Promise<void> | void) => () => void
  getFieldValue: (key: string) => unknown
  setFieldValue: (key: string, value: unknown) => void
  resetForm: (options: { values: TFormValues }) => void
  mapFormValuesFromData: (data: Record<string, unknown>) => TFormValues
  resolveEditData: (
    editId: number | string,
    options?: { useCache?: boolean }
  ) => Promise<Record<string, unknown>>
  emitSubmit: (data: Record<string, unknown>) => void
}

export function useCrudFormSubmit<TFormValues extends Record<string, unknown>>(
  options: CrudFormSubmitOptions<TFormValues>
) {
  const submitting = ref(false)
  const conflictDialogVisible = ref(false)
  const pendingFormData = ref<Record<string, unknown> | null>(null)

  function resetSubmitState(): void {
    conflictDialogVisible.value = false
    pendingFormData.value = null
    submitting.value = false
  }

  function setSubmitting(value: boolean): void {
    submitting.value = value
  }

  function buildPendingChangedData(): Record<string, unknown> | null {
    const currentVersion = options.getFieldValue(options.versionField.value)
    if (currentVersion === undefined || currentVersion === '') {
      ElMessage.error('版本号缺失，请重新打开编辑弹窗')
      return null
    }

    const changedData: Record<string, unknown> = {
      [options.versionField.value]: currentVersion
    }

    options.fieldConfig.value.forEach(field => {
      if (!isFieldVisibleInMode(field, 'edit')) {
        return
      }

      const currentValue = options.getFieldValue(field.key)
      const originalValue = options.originalData.value?.[field.key]

      if (currentValue !== originalValue) {
        changedData[field.key] = currentValue
      }
    })

    return changedData
  }

  function handleVersionConflict(error: unknown): void {
    const isConflictError =
      error instanceof Error &&
      (error.message.includes('version') ||
        error.message.includes('409') ||
        error.message.includes('冲突'))

    if (isConflictError && options.isEditMode.value && options.enableOptimisticLock.value) {
      const changedData = buildPendingChangedData()
      if (!changedData) {
        return
      }

      pendingFormData.value = changedData
      conflictDialogVisible.value = true
      return
    }

    const message = error instanceof Error ? error.message : '操作失败'
    ElMessage.error(message)
  }

  async function handleConflictRefresh(): Promise<void> {
    const editId = options.editId.value
    if (!editId) {
      return
    }

    try {
      const latestData = await options.resolveEditData(editId, { useCache: false })
      const pendingData = pendingFormData.value

      options.resetForm({
        values: options.mapFormValuesFromData(latestData)
      })
      options.originalData.value = { ...latestData }

      if (pendingData) {
        Object.entries(pendingData).forEach(([key, value]) => {
          if (key === options.versionField.value) {
            return
          }

          options.setFieldValue(key, value)
        })
      }

      conflictDialogVisible.value = false
      pendingFormData.value = null
      ElMessage.success('数据已刷新，您可以继续编辑')
    } catch (error) {
      console.error('刷新数据失败:', error)
      ElMessage.error('刷新数据失败，请关闭弹窗后重试')
      conflictDialogVisible.value = false
      pendingFormData.value = null
    }
  }

  const onSubmit = options.handleSubmit(async values => {
    setSubmitting(true)
    try {
      if (options.isEditMode.value) {
        const updateData = collectChangedFields({
          values,
          fieldConfig: options.fieldConfig.value,
          originalData: options.originalData.value
        })

        if (options.enableOptimisticLock.value) {
          const versionValue = values[options.versionField.value]
          if (versionValue === undefined || versionValue === '') {
            ElMessage.error('版本号缺失，请重新打开编辑弹窗')
            return
          }
          updateData[options.versionField.value] = versionValue
        }

        options.emitSubmit(updateData)
      } else {
        options.emitSubmit(
          collectCreateFields({
            values,
            fieldConfig: options.fieldConfig.value
          })
        )
      }
    } catch (error) {
      handleVersionConflict(error)
    } finally {
      setSubmitting(false)
    }
  })

  return {
    submitting,
    conflictDialogVisible,
    pendingFormData,
    resetSubmitState,
    onSubmit,
    handleConflictRefresh,
    handleVersionConflict
  }
}
