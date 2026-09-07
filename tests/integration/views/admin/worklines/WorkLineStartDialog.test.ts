/* eslint-disable vue/one-component-per-file */
import { defineComponent, h, nextTick, type PropType } from 'vue'
import { mount, type VueWrapper } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiResponseError } from '@/api/client'
import type { WorkLinesItem as Workline } from '@/api/modules/workLines'
import type { WorklinesStartResult } from '@/api/modules/workline'
import { worklineApiMethods } from '@/api/modules/workline'
import { CRUD_PAGE_REFRESH_KEY } from '@/components/common/crud-page/types'
import StandardDialog from '@/components/ui/StandardDialog/StandardDialog.vue'
import WorkLineStartDialog from '@/views/admin/worklines/components/WorkLineStartDialog.vue'

const mocks = vi.hoisted(() => ({
  send: vi.fn(),
  worklinesStart: vi.fn(),
  read: vi.fn(),
  getById: vi.fn(),
  refreshList: vi.fn()
}))

vi.mock('@/api/modules/workline', async importOriginal => {
  const actual = await importOriginal<typeof import('@/api/modules/workline')>()
  return {
    ...actual,
    worklineApiMethods: {
      ...actual.worklineApiMethods,
      worklinesStart: mocks.worklinesStart
    }
  }
})

vi.mock('@/api/modules/workLines', () => ({ workLinesApiMethods: { getById: mocks.getById } }))

const ButtonStub = defineComponent({
  name: 'ElButton',
  inheritAttrs: false,
  props: {
    disabled: Boolean,
    loading: Boolean,
    type: { type: String, default: undefined },
    nativeType: { type: String as PropType<'button' | 'submit' | 'reset'>, default: 'button' }
  },
  emits: ['click'],
  setup(props, { attrs, emit, slots }) {
    return () =>
      h(
        'button',
        {
          ...attrs,
          type: props.nativeType,
          disabled: props.disabled || props.loading,
          onClick: () => emit('click')
        },
        slots.default?.()
      )
  }
})

const TooltipStub = defineComponent({
  name: 'ElTooltip',
  setup:
    (_, { slots }) =>
    () =>
      slots.default?.()
})

const workline = {
  id: 7,
  line_code: 'LINE-007',
  line_name: '七号线',
  line_type: 'AUTO',
  run_mode: 'AUTO',
  is_active: false,
  version: 1
} satisfies Workline

const otherWorkline = {
  ...workline,
  id: 8,
  line_code: 'LINE-008',
  line_name: '八号线'
} satisfies Workline

const successResponse = {
  workline_id: 7,
  version: 2,
  plugin_key: 'fake',
  plugin_version: '1.0.0',
  flow_mode: 'AUTO',
  is_active: true
} satisfies WorklinesStartResult

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })
  return { promise, resolve, reject }
}

function mountDialog(row: Workline = workline, modelValue = true) {
  return mount(WorkLineStartDialog, {
    props: { workline: row, modelValue },
    global: {
      provide: { [CRUD_PAGE_REFRESH_KEY as symbol]: mocks.refreshList },
      stubs: {
        Teleport: true,
        AppIcon: true,
        ElButton: ButtonStub,
        ElTooltip: TooltipStub
      }
    }
  })
}

function standardDialog(wrapper: VueWrapper) {
  return wrapper.findComponent(StandardDialog)
}

async function confirm(wrapper: VueWrapper) {
  standardDialog(wrapper).vm.$emit('confirm')
  await nextTick()
}

describe('WorkLineStartDialog', () => {
  it('refreshes the list after successful activation', async () => {
    mocks.send.mockResolvedValue(successResponse)
    const wrapper = mountDialog()
    await confirm(wrapper)
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(mocks.refreshList).toHaveBeenCalledOnce()
    wrapper.unmount()
  })
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.worklinesStart.mockImplementation(() => ({ send: mocks.send }))
    mocks.getById.mockImplementation(() => ({ send: mocks.read }))
    mocks.read.mockResolvedValue({ ...workline, version: 2, is_active: true })
  })
  it('shows confirmation and only the current WorkLine result after success', async () => {
    mocks.send.mockResolvedValue(successResponse)
    const wrapper = mountDialog()
    expect(wrapper.text()).toContain('确认启动此 WorkLine？')
    await confirm(wrapper)
    await vi.waitFor(() => expect(wrapper.text()).toContain('已启动'))
    expect(wrapper.text()).toContain('fake / 1.0.0')
    expect(wrapper.text()).not.toContain('Epoch')
    expect(standardDialog(wrapper).props('showFooter')).toBe(false)
  })
  it('blocks duplicate submit, closing and replacement while submitting', async () => {
    const request = deferred<WorklinesStartResult>()
    mocks.send.mockReturnValue(request.promise)
    const wrapper = mountDialog()
    await confirm(wrapper)
    await confirm(wrapper)
    standardDialog(wrapper).vm.$emit('update:modelValue', false)
    await wrapper.setProps({ workline: otherWorkline })
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.text()).toContain('七号线')
    expect(mocks.send).toHaveBeenCalledOnce()
    request.resolve(successResponse)
    await vi.waitFor(() => expect(wrapper.text()).toContain('已启动'))
  })
  it('preserves successful activation when the list refresh fails without another START', async () => {
    mocks.send.mockResolvedValue(successResponse)
    mocks.refreshList.mockRejectedValueOnce(new Error('list unavailable'))
    const wrapper = mountDialog()
    await confirm(wrapper)
    await vi.waitFor(() =>
      expect(wrapper.text()).toContain('工作线已启动，列表刷新失败，请手动刷新。')
    )
    expect(wrapper.text()).toContain('fake / 1.0.0')
    expect(standardDialog(wrapper).props('showFooter')).toBe(false)
    await confirm(wrapper)
    expect(mocks.send).toHaveBeenCalledOnce()
    wrapper.unmount()
  })
  it('blocks closing, replacement and resubmission while rereading the current state', async () => {
    const current = deferred<Workline>()
    mocks.send.mockRejectedValue(new TypeError('Failed to fetch'))
    mocks.read.mockReturnValueOnce(current.promise)
    const wrapper = mountDialog()
    await confirm(wrapper)
    await vi.waitFor(() => expect(wrapper.text()).toContain('正在读取当前工作线状态'))
    expect(standardDialog(wrapper).props('closable')).toBe(false)
    standardDialog(wrapper).vm.$emit('update:modelValue', false)
    await wrapper.setProps({ workline: otherWorkline })
    await confirm(wrapper)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.text()).toContain('七号线')
    expect(mocks.send).toHaveBeenCalledOnce()
    current.resolve({ ...workline, version: 2, is_active: true })
    await vi.waitFor(() => expect(wrapper.text()).toContain('当前工作线：已启动'))
    expect(wrapper.text()).toMatch(/版本\s+2/)
    expect(standardDialog(wrapper).props('closable')).toBe(true)
    expect(standardDialog(wrapper).props('showFooter')).toBe(false)
    expect(mocks.send).toHaveBeenCalledOnce()
    wrapper.unmount()
  })
  it.each([
    ['lost response', new TypeError('Failed to fetch'), '启动结果未知'],
    [
      'version conflict',
      new ApiResponseError('3012', 'conflict', 'now', { reason: 'VERSION_CONFLICT' }),
      '工作线状态已变化'
    ]
  ])('rereads after %s without offering another START', async (_label, error, message) => {
    mocks.send.mockRejectedValue(error)
    const wrapper = mountDialog()
    await confirm(wrapper)
    await vi.waitFor(() => expect(wrapper.text()).toContain(message))
    await vi.waitFor(() => expect(wrapper.text()).toContain('当前工作线：已启动'))
    expect(standardDialog(wrapper).props('showFooter')).toBe(false)
    await confirm(wrapper)
    expect(worklineApiMethods.worklinesStart).toHaveBeenCalledExactlyOnceWith(
      { workline_id: 7 },
      { version: 1 }
    )
    expect(wrapper.text()).toContain('刷新状态')
  })
})
