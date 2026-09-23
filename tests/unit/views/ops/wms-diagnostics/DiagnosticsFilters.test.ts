import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import DiagnosticsFilters from '@/views/ops/wms-diagnostics/DiagnosticsFilters.vue'
import { useTimezoneStore } from '@/stores/timezone'

describe('DiagnosticsFilters', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('converts configured-timezone wall time to UTC query milliseconds', async () => {
    useTimezoneStore().setUserTimezone('America/Chicago')
    const wrapper = mount(DiagnosticsFilters, {
      props: { recent: true, loading: false }
    })
    const inputs = wrapper.findAll('input[type="datetime-local"]')
    await inputs[0]!.setValue('2024-07-01T12:00')
    await inputs[1]!.setValue('2024-07-01T13:00')
    await wrapper.get('form').trigger('submit')

    expect(wrapper.emitted('apply')?.[0]?.[0]).toMatchObject({
      from_ms: Date.parse('2024-07-01T17:00:00.000Z'),
      to_ms: Date.parse('2024-07-01T18:00:00.000Z')
    })
  })
})
