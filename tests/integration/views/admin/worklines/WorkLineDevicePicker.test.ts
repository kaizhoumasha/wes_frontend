import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { DevicesItem } from '@/api/modules/devices'
import WorkLineDevicePicker from '@/views/admin/worklines/components/WorkLineDevicePicker.vue'

const query = vi.hoisted(() => vi.fn())
vi.mock('@/views/admin/worklines/components/fetchWorkLineDevices', () => ({
  queryWorkLineDevices: query
}))
const device = (id: number, owner: number | null = null) =>
  ({ id, device_code: `D-${id}`, device_name: `设备 ${id}`, work_line_id: owner }) as DevicesItem
const result = (items: DevicesItem[], total = 1500) => ({ items, total, offset: 0, limit: 50 })
function open() {
  return mount(WorkLineDevicePicker, {
    props: { modelValue: true, worklineId: 11, selectedCodes: ['D-1'] },
    global: {
      directives: { loading: () => {} },
      stubs: {
        StandardDialog: { name: 'StandardDialog', template: '<div><slot /></div>', emits: ['confirm'] },
        ElInput: true,
        ElSelect: true,
        ElOption: true,
        ElCheckbox: true,
        ElTag: true,
        ElEmpty: true,
        ElAlert: true,
        ElPagination: true,
        ElButton: {
          template: '<button @click="$emit(\'click\')"><slot /></button>',
          emits: ['click']
        }
      }
    }
  })
}
describe('paged device association', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.useFakeTimers()
  })
  afterEach(() => vi.useRealTimers())
  it('requests a single available-device page even with thousands of results', async () => {
    query.mockResolvedValue(result([device(2)]))
    const wrapper = open()
    await flushPromises()
    expect(query).toHaveBeenCalledOnce()
    expect(query).toHaveBeenCalledWith({
      offset: 0,
      limit: 50,
      filters: { couple: 'and', conditions: [{ field: 'work_line_id', op: 'is_null' }] }
    })
    expect(wrapper.findAll('[data-device]')).toHaveLength(1)
    wrapper.unmount()
  })
  it('keeps selection across pages, selects only the current page and excludes occupied devices', async () => {
    query.mockResolvedValueOnce(result([device(1, 11), device(2), device(3, 22)]))
    const wrapper = open()
    await flushPromises()
    await wrapper
      .findAll('button')
      .find(button => button.text() === '选择当前页')!
      .trigger('click')
    query.mockResolvedValueOnce(result([device(51)]))
    wrapper.findComponent({ name: 'ElPagination' }).vm.$emit('current-change', 2)
    await flushPromises()
    expect(query.mock.calls[1]![0].offset).toBe(50)
    await wrapper
      .findAll('button')
      .find(button => button.text() === '选择当前页')!
      .trigger('click')
    wrapper.findComponent({ name: 'StandardDialog' }).vm.$emit('confirm')
    expect(wrapper.emitted('select')?.[0]?.[0]).toEqual([device(2), device(51)])
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
    wrapper.unmount()
  })
  it('searches names and codes on the server, ignores late responses, and resets pagination', async () => {
    let finish!: (value: ReturnType<typeof result>) => void
    query.mockReturnValueOnce(
      new Promise(resolve => {
        finish = resolve
      })
    )
    const wrapper = open()
    query.mockResolvedValueOnce(result([device(99)], 1))
    wrapper.findComponent({ name: 'ElInput' }).vm.$emit('update:modelValue', 'scanner')
    await vi.advanceTimersByTimeAsync(350)
    await flushPromises()
    expect(query.mock.calls[1]![0]).toMatchObject({
      offset: 0,
      filters: {
        conditions: [
          { field: 'work_line_id', op: 'is_null' },
          {
            couple: 'or',
            conditions: [
              { field: 'device_code', op: 'ilike', value: '%scanner%' },
              { field: 'device_name', op: 'ilike', value: '%scanner%' }
            ]
          }
        ]
      }
    })
    finish(result([device(2)]))
    await flushPromises()
    expect(wrapper.find('[data-device="D-99"]').exists()).toBe(true)
    expect(wrapper.find('[data-device="D-2"]').exists()).toBe(false)
    wrapper.unmount()
  })
  it('retains the pending selection after a page fails and supports retry', async () => {
    query.mockResolvedValueOnce(result([device(2)]))
    const wrapper = open()
    await flushPromises()
    await wrapper
      .findAll('button')
      .find(button => button.text() === '选择当前页')!
      .trigger('click')
    query.mockRejectedValueOnce(new Error('分页失败'))
    wrapper.findComponent({ name: 'ElPagination' }).vm.$emit('current-change', 2)
    await flushPromises()
    expect(wrapper.findComponent({ name: 'ElAlert' }).attributes('title')).toContain('分页失败')
    query.mockResolvedValueOnce(result([device(51)]))
    await wrapper
      .findAll('button')
      .find(button => button.text() === '重试')!
      .trigger('click')
    await flushPromises()
    wrapper.findComponent({ name: 'StandardDialog' }).vm.$emit('confirm')
    expect(wrapper.emitted('select')?.[0]?.[0]).toEqual([device(2)])
    wrapper.unmount()
  })
})
