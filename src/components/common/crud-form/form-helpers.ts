import type { FormFieldConfig, FormMode } from '@/composables/useTableColumns'

export type CrudFormValues = Record<string, unknown>

export function isFieldVisibleInMode(field: FormFieldConfig, mode: FormMode): boolean {
  if (!field.modes?.length) {
    return true
  }

  return field.modes.includes(mode)
}

export function createEmptyFormValues(options: {
  fieldConfig: FormFieldConfig[]
  createInitialValues?: Record<string, unknown> | null
  enableOptimisticLock: boolean
  versionField: string
  isTreeSelectField: (key: string) => boolean
}): CrudFormValues {
  const values: CrudFormValues = {}

  options.fieldConfig.forEach(field => {
    if (options.isTreeSelectField(field.key)) {
      if ('defaultValue' in field && field.defaultValue !== undefined) {
        values[field.key] = field.defaultValue
      } else {
        values[field.key] = null
      }
    } else if ('defaultValue' in field && field.defaultValue !== undefined) {
      values[field.key] = field.defaultValue
    } else if (field.type === 'checkbox') {
      values[field.key] = []
    } else {
      values[field.key] = ''
    }
  })

  if (options.createInitialValues) {
    Object.assign(values, options.createInitialValues)
  }

  if (options.enableOptimisticLock) {
    values[options.versionField] = undefined
  }

  return values
}

export function buildFormValuesFromData(options: {
  data: Record<string, unknown>
  fieldConfig: FormFieldConfig[]
  createInitialValues?: Record<string, unknown> | null
  enableOptimisticLock: boolean
  versionField: string
  isTreeSelectField: (key: string) => boolean
}): CrudFormValues {
  const formValues = createEmptyFormValues({
    fieldConfig: options.fieldConfig,
    createInitialValues: options.createInitialValues,
    enableOptimisticLock: options.enableOptimisticLock,
    versionField: options.versionField,
    isTreeSelectField: options.isTreeSelectField
  })

  options.fieldConfig.forEach(field => {
    if (!(field.key in options.data)) {
      formValues[field.key] = undefined
      return
    }

    const value = options.data[field.key]
    if (options.isTreeSelectField(field.key)) {
      formValues[field.key] = value ?? null
    } else {
      formValues[field.key] = value === null ? null : value ?? ''
    }
  })

  if (options.enableOptimisticLock && options.versionField in options.data) {
    formValues[options.versionField] = options.data[options.versionField]
  }

  return formValues
}

export function collectChangedFields(options: {
  values: CrudFormValues
  fieldConfig: FormFieldConfig[]
  originalData: Record<string, unknown> | null
}): Record<string, unknown> {
  const changedData: Record<string, unknown> = {}

  options.fieldConfig.forEach(field => {
    if (!isFieldVisibleInMode(field, 'edit')) {
      return
    }

    const currentValue = options.values[field.key]
    const originalValue = options.originalData?.[field.key]

    if (currentValue !== originalValue) {
      changedData[field.key] = currentValue
    }
  })

  return changedData
}

export function collectCreateFields(options: {
  values: CrudFormValues
  fieldConfig: FormFieldConfig[]
}): Record<string, unknown> {
  const createData: Record<string, unknown> = {}

  options.fieldConfig.forEach(field => {
    if (!isFieldVisibleInMode(field, 'create')) {
      return
    }

    createData[field.key] = options.values[field.key]
  })

  return createData
}
