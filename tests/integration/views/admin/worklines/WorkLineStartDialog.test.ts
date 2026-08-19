/* eslint-disable vue/one-component-per-file */
import { defineComponent, h, nextTick, type PropType } from 'vue'
import { mount, type VueWrapper } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiResponseError } from '@/api/client'
import type { WorkLinesItem as Workline } from '@/api/modules/workLines'
import type { WorklinesStartResult } from '@/api/modules/workline'
import { worklineApiMethods } from '@/api/modules/workline'
import StandardDialog from '@/components/ui/StandardDialog/StandardDialog.vue'
import WorkLineStartDialog from '@/views/admin/worklines/components/WorkLineStartDialog.vue'
import { readPendingStartRequest } from '@/views/admin/worklines/config/startRequest'

const mocks = vi.hoisted(() => ({
  send: vi.fn(),
  worklinesStart: vi.fn()
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
  is_active: true,
  version: 1
} satisfies Workline

const otherWorkline = {
  ...workline,
  id: 8,
  line_code: 'LINE-008',
  line_name: '八号线'
} satisfies Workline

const successResponse = {
  line_run_epoch_id: 71,
  epoch_code: 'request-7',
  workline_id: 7,
  plugin_key: 'rough_sorter',
  plugin_version: '1.0.0',
  flow_mode: 'AUTO',
  epoch_status: 'CLOSED',
  epoch_started_at: '2026-08-20T01:00:00Z',
  epoch_closed_at: '2026-08-20T02:00:00Z',
  current_workline_runtime_status: 'RUNNING',
  created: false
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
  beforeEach(() => {
    sessionStorage.clear()
    vi.restoreAllMocks()
    vi.clearAllMocks()
    mocks.worklinesStart.mockImplementation(() => ({ send: mocks.send }))
  })

  it('opens the selected WorkLine in an idle confirmation view', () => {
    const wrapper = mountDialog()

    expect(wrapper.text()).toContain('七号线')
    expect(wrapper.text()).toContain('确认启动此 WorkLine 并创建新的运行代际？')
    expect(standardDialog(wrapper).props('showFooter')).toBe(true)
  })

  it('blocks duplicate submit, every close path and WorkLine replacement while pending', async () => {
    const request = deferred<WorklinesStartResult>()
    mocks.send.mockReturnValueOnce(request.promise)
    const wrapper = mountDialog()

    await confirm(wrapper)
    await confirm(wrapper)

    expect(mocks.send).toHaveBeenCalledOnce()
    expect(standardDialog(wrapper).props()).toMatchObject({
      closable: false,
      hideCancel: true,
      confirmLoading: true,
      confirmDisabled: true
    })
    expect(wrapper.find('[aria-label="关闭对话框"]').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('取消')

    await wrapper.find('.standard-dialog').trigger('keydown', { key: 'Escape' })
    standardDialog(wrapper).vm.$emit('update:modelValue', false)
    await wrapper.setProps({ workline: otherWorkline })

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.text()).toContain('七号线')
    expect(wrapper.text()).not.toContain('八号线')

    request.reject(new TypeError('Failed to fetch'))
    await vi.waitFor(() => expect(wrapper.text()).toContain('重试将复用同一 request_id'))
  })

  it('restores delivery-unknown after remount and retries the same request_id', async () => {
    mocks.send.mockRejectedValueOnce(new TypeError('Failed to fetch'))
    const first = mountDialog()

    await confirm(first)
    await vi.waitFor(() => expect(first.text()).toContain('重试将复用同一 request_id'))
    const pendingRequestId = readPendingStartRequest(workline.id)
    expect(pendingRequestId).not.toBeNull()
    first.unmount()

    mocks.send.mockResolvedValueOnce(successResponse)
    const remounted = mountDialog()
    expect(remounted.text()).toContain('上次 START 结果未知')
    await confirm(remounted)

    await vi.waitFor(() => expect(mocks.send).toHaveBeenCalledTimes(2))
    expect(worklineApiMethods.worklinesStart).toHaveBeenNthCalledWith(
      2,
      { workline_id: 7 },
      { request_id: pendingRequestId }
    )
  })

  it('shows an actionable local preparation error and retries without sending a second intent', async () => {
    const getRandomValues = vi
      .spyOn(globalThis.crypto, 'getRandomValues')
      .mockImplementationOnce(() => {
        throw new Error('random source unavailable')
      })
    mocks.send.mockResolvedValueOnce(successResponse)
    const wrapper = mountDialog()

    await confirm(wrapper)

    expect(wrapper.text()).toContain('本地无法生成或保存 START 请求标识')
    expect(wrapper.text()).toContain('未发送任何请求')
    expect(standardDialog(wrapper).props('showFooter')).toBe(true)
    expect(worklineApiMethods.worklinesStart).not.toHaveBeenCalled()
    expect(readPendingStartRequest(workline.id)).toBeNull()

    getRandomValues.mockRestore()
    await confirm(wrapper)
    await vi.waitFor(() => expect(worklineApiMethods.worklinesStart).toHaveBeenCalledOnce())
  })

  it.each([
    ['WORKLINE_NOT_FOUND', '工作线不存在或已删除'],
    ['INVALID_STATE', '当前工作线状态不允许创建新的运行代际'],
    ['CONFIGURATION_INVALID', '工作线、设备 Endpoint 或粗分机配置不完整或不符合合同'],
    ['IDEMPOTENCY_CONFLICT', '该 request_id 已属于另一条工作线'],
    ['SERVICE_UNAVAILABLE', 'START 服务暂不可用，本次请求未被接纳']
  ] as const)(
    'renders stable rejection %s, clears storage and stays terminal',
    async (reason, message) => {
      mocks.send.mockRejectedValueOnce(
        new ApiResponseError('4000', 'definite rejection', 'now', { reason })
      )
      const wrapper = mountDialog()

      await confirm(wrapper)
      await vi.waitFor(() => expect(wrapper.text()).toContain(message))

      expect(readPendingStartRequest(workline.id)).toBeNull()
      expect(standardDialog(wrapper).props('showFooter')).toBe(false)
      await confirm(wrapper)
      expect(mocks.send).toHaveBeenCalledOnce()
    }
  )

  it('keeps a stable rejection bound to the original WorkLine until close and reopen', async () => {
    mocks.send.mockRejectedValueOnce(
      new ApiResponseError('4000', 'invalid', 'now', { reason: 'INVALID_STATE' })
    )
    const wrapper = mountDialog()

    await confirm(wrapper)
    await vi.waitFor(() => expect(wrapper.text()).toContain('当前工作线状态不允许创建新的运行代际'))

    await wrapper.setProps({ workline: otherWorkline })

    expect(wrapper.text()).toContain('当前工作线状态不允许创建新的运行代际')
    expect(wrapper.text()).toContain('七号线')
    expect(wrapper.text()).not.toContain('八号线')
    expect(standardDialog(wrapper).props('showFooter')).toBe(false)
    await confirm(wrapper)
    expect(mocks.send).toHaveBeenCalledOnce()

    await wrapper.setProps({ modelValue: false })
    await wrapper.setProps({ modelValue: true })
    expect(wrapper.text()).toContain('八号线')
    expect(wrapper.text()).toContain('确认启动此 WorkLine 并创建新的运行代际？')
    expect(standardDialog(wrapper).props('showFooter')).toBe(true)

    mocks.send.mockResolvedValueOnce({
      ...successResponse,
      workline_id: 8,
      line_run_epoch_id: 81,
      epoch_code: 'request-8',
      created: true
    })
    await confirm(wrapper)
    await vi.waitFor(() => expect(mocks.send).toHaveBeenCalledTimes(2))
    expect(worklineApiMethods.worklinesStart).toHaveBeenNthCalledWith(
      2,
      { workline_id: 8 },
      {
        request_id: expect.stringMatching(
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
        )
      }
    )
  })

  it('keeps a success bound to the original WorkLine until close and reopen', async () => {
    mocks.send.mockResolvedValue(successResponse)
    const wrapper = mountDialog()

    await confirm(wrapper)
    await vi.waitFor(() => expect(wrapper.text()).toContain('幂等重放'))

    expect(wrapper.text()).toContain('历史 Epoch 状态')
    expect(wrapper.text()).toContain('CLOSED')
    expect(wrapper.text()).toContain('当前 WorkLine 投影')
    expect(wrapper.text()).toContain('RUNNING')
    expect(wrapper.text()).toContain('request-7')
    expect(wrapper.text()).toContain('71')
    expect(wrapper.text()).toContain('2026-08-20T01:00:00Z')
    expect(wrapper.text()).toContain('2026-08-20T02:00:00Z')
    expect(standardDialog(wrapper).props('showFooter')).toBe(false)

    await wrapper.setProps({ workline: otherWorkline })

    expect(wrapper.text()).toContain('幂等重放')
    expect(wrapper.text()).toContain('七号线')
    expect(wrapper.text()).not.toContain('八号线')
    expect(standardDialog(wrapper).props('showFooter')).toBe(false)
    await confirm(wrapper)
    expect(mocks.send).toHaveBeenCalledOnce()

    await wrapper.setProps({ modelValue: false })
    await wrapper.setProps({ modelValue: true })
    expect(wrapper.text()).toContain('八号线')
    expect(wrapper.text()).toContain('确认启动此 WorkLine 并创建新的运行代际？')
    expect(standardDialog(wrapper).props('showFooter')).toBe(true)

    mocks.send.mockResolvedValueOnce({
      ...successResponse,
      workline_id: 8,
      line_run_epoch_id: 81,
      epoch_code: 'request-8',
      created: true
    })
    await confirm(wrapper)
    await vi.waitFor(() => expect(mocks.send).toHaveBeenCalledTimes(2))

    const firstRequestId = mocks.worklinesStart.mock.calls[0]?.[1]?.request_id
    const secondRequestId = mocks.worklinesStart.mock.calls[1]?.[1]?.request_id
    expect(secondRequestId).not.toBe(firstRequestId)
    expect(worklineApiMethods.worklinesStart).toHaveBeenNthCalledWith(
      2,
      { workline_id: 8 },
      { request_id: secondRequestId }
    )
  })
})
