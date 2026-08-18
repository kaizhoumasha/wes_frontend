import { ref } from 'vue'
import { describe, expect, it } from 'vitest'
import { useCrudFormBindings } from '@/components/common/crud-form/useCrudFormBindings'

describe('useCrudFormBindings', () => {
  it('preserves null values for nullable form fields', () => {
    const fieldValue = ref<unknown>(null)
    const bindings = useCrudFormBindings({
      fieldConfig: ref([{ key: 'upstream_device_id' }]),
      formValues: ref({ upstream_device_id: null }),
      defineField: () => [fieldValue, null],
      setFieldValue: () => undefined,
    })

    expect(bindings.getFieldValue('upstream_device_id')).toBeNull()
  })
})
