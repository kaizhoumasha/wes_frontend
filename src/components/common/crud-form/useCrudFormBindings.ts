import { watch, type Ref } from 'vue'

type FieldBindingValue = unknown

type FieldBindingAttrs = unknown

export interface CrudFieldBindings {
  getFieldValue: (key: string) => unknown
  getFieldHandler: (key: string) => (value: unknown) => void
  getFieldOtherAttrs: (key: string) => Record<string, unknown>
}

export function useCrudFormBindings(options: {
  fieldConfig: Ref<Array<{ key: string }>>
  formValues: Ref<Record<string, unknown>>
  defineField: (path: string) => [unknown, unknown]
  setFieldValue: (key: string, value: unknown) => void
}): CrudFieldBindings {
  const fieldBindingsMap = new Map<string, { value: FieldBindingValue; attrs: FieldBindingAttrs }>()

  watch(
    options.fieldConfig,
    () => {
      fieldBindingsMap.clear()
      options.fieldConfig.value.forEach(field => {
        try {
          const [value, attrs] = options.defineField(field.key)
          fieldBindingsMap.set(field.key, { value, attrs })
        } catch {
          const defaultValue = options.formValues.value[field.key] ?? ''
          fieldBindingsMap.set(field.key, { value: defaultValue, attrs: null })
        }
      })
    },
    { immediate: true }
  )

  function getFieldValue(key: string): unknown {
    const binding = fieldBindingsMap.get(key)
    if (!binding) return options.formValues.value[key] ?? ''

    const bindingValue = binding.value as { value?: unknown } | unknown
    if (typeof bindingValue === 'object' && bindingValue !== null && 'value' in bindingValue) {
      return bindingValue.value ?? ''
    }

    return bindingValue ?? ''
  }

  function getFieldHandler(key: string) {
    return (value: unknown) => {
      options.setFieldValue(key, value)
    }
  }

  function getFieldOtherAttrs(key: string): Record<string, unknown> {
    const binding = fieldBindingsMap.get(key)
    if (!binding || !binding.attrs) return {}

    const attrsSource = binding.attrs as (() => Record<string, unknown>) | { props?: Record<string, unknown> }
    const attrsObj = typeof attrsSource === 'function' ? attrsSource() : attrsSource.props
    if (!attrsObj) return {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { 'onUpdate:modelValue': _unused, ...rest } = attrsObj
    return rest
  }

  return {
    getFieldValue,
    getFieldHandler,
    getFieldOtherAttrs
  }
}
