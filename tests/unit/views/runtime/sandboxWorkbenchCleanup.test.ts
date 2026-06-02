import { flushPromises, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { SandboxCompletedSession, SandboxPendingOutbox } from '@/types/runtime'

const mocks = vi.hoisted(() => {
  const sandboxPendingSend = vi.fn()
  const sandboxCompletedSend = vi.fn()
  const sandboxCleanupSend = vi.fn()
  const sandboxSimulateEstopSend = vi.fn()
  const clearEstopSend = vi.fn()
  const summary = {
    id: 45,
    line_name: '右侧SMT粗分线',
    line_code: 'SMT-RIGHT',
    runtime_status: 'READY' as string,
    active_safety_incident_id: null as number | null,
    run_mode: 'SIMULATION',
    start_admission_status: null as string | null,
    start_admission_message: null as string | null,
    start_admission_failed_device_code: null as string | null,
    last_start_request_id: null as string | null,
    last_start_trace_id: null as string | null
  }
  const store = {
    detail: {
      summary,
      devices: [
        {
          id: 301,
          device_code: 'ARM03',
          device_name: 'ARM03',
          device_role: 'ROBOT',
          device_status: 'IDLE',
          active_runtime_hold_ids: []
        }
      ],
      active_sessions: []
    },
    findSummary: vi.fn(() => summary),
    loadWorklines: vi.fn().mockResolvedValue(undefined),
    loadDetail: vi.fn().mockResolvedValue(undefined),
    clearDetail: vi.fn()
  }

  return {
    router: { push: vi.fn() },
    route: { params: { worklineId: '45' } },
    hasPermission: vi.fn(() => true),
    confirm: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    sseStore: undefined as unknown as { lastEvent: unknown },
    sandboxPendingSend,
    sandboxCompletedSend,
    sandboxCleanupSend,
    sandboxSimulateEstopSend,
    clearEstopSend,
    store,
    runtimeApiMethods: {
      sandboxPending: vi.fn(() => ({ send: sandboxPendingSend })),
      sandboxCompleted: vi.fn(() => ({ send: sandboxCompletedSend })),
      sandboxCleanup: vi.fn(() => ({ send: sandboxCleanupSend })),
      clearEstop: vi.fn(() => ({ send: clearEstopSend })),
      sandboxSimulateEstop: vi.fn(() => ({ send: sandboxSimulateEstopSend })),
      worklineStartRequested: vi.fn(() => ({ send: vi.fn() })),
      sandboxAck: vi.fn(() => ({ send: vi.fn() })),
      replayInbox: vi.fn(() => ({ send: vi.fn() }))
    }
  }
})

const mountedWrappers: Array<{ unmount: () => void }> = []

vi.mock('vue-router', () => ({
  useRoute: () => mocks.route,
  useRouter: () => mocks.router
}))

vi.mock('@/api/modules/runtime', () => ({
  runtimeApiMethods: mocks.runtimeApiMethods
}))

vi.mock('@/stores/workline-runtime', () => ({
  useWorklineRuntimeStore: () => mocks.store
}))

vi.mock('@/stores/runtime-sse', async () => {
  const vue = await vi.importActual<typeof import('vue')>('vue')
  mocks.sseStore = vue.reactive({ lastEvent: null })
  return {
    useRuntimeSSEStore: () => mocks.sseStore
  }
})

vi.mock('@/composables/usePermission', () => ({
  usePermission: () => ({ hasPermission: mocks.hasPermission })
}))

vi.mock('element-plus', async importOriginal => {
  const actual = await importOriginal<typeof import('element-plus')>()
  return {
    ...actual,
    ElMessageBox: {
      confirm: mocks.confirm
    },
    ElMessage: {
      success: mocks.success,
      error: mocks.error,
      warning: mocks.warning,
      info: mocks.info
    }
  }
})

async function mountPage() {
  const { default: SandboxWorkbenchPage } =
    await import('@/views/runtime/sandbox/SandboxWorkbenchPage.vue')
  const wrapper = mount(SandboxWorkbenchPage, {
    global: {
      directives: {
        loading: {}
      },
      stubs: {
        SandboxCycleStatus: true,
        SandboxActionList: {
          name: 'SandboxActionList',
          props: [
            'items',
            'completedItems',
            'disabled',
            'disabledReason',
            'replayDisabled',
            'replayDisabledReason'
          ],
          emits: ['replay'],
          template:
            '<div class="sandbox-action-list-stub" :data-replay-disabled="replayDisabled ? `true` : `false`">{{ replayDisabledReason }}<span v-for="item in items" :key="item.id">{{ item.dispatch_key }}</span><span v-for="entry in completedItems" :key="entry.session.id">completed-{{ entry.session.id }}</span></div>'
        },
        SandboxEventComposer: {
          props: ['disabled', 'disabledReason'],
          template:
            '<div class="sandbox-event-composer-stub" :data-disabled="disabled ? `true` : `false`">{{ disabledReason }}</div>'
        },
        SandboxResultComposer: true,
        WorklineRouteMap: true,
        StandardDrawer: {
          props: ['modelValue'],
          template: '<aside v-if="modelValue"><slot /></aside>'
        },
        Teleport: true,
        ElAlert: true,
        ElDivider: true,
        ElButton: {
          props: ['disabled', 'loading'],
          emits: ['click'],
          template:
            '<button v-bind="$attrs" :disabled="disabled" :data-loading="loading ? true : undefined" @click="$emit(`click`)"><slot /></button>'
        }
      }
    }
  })
  mountedWrappers.push(wrapper)
  await flushPromises()
  return wrapper
}

function createOutbox(overrides: Partial<SandboxPendingOutbox> = {}): SandboxPendingOutbox {
  return {
    id: 1,
    session_id: 10,
    workline_id: 45,
    dispatch_key: 'device-command:CMD-1',
    dispatch_type: 'COMMAND',
    target_type: 'DEVICE',
    target_code: 'ARM03',
    status: 'ACKED',
    payload_json: {},
    ...overrides
  }
}

function createCompletedSession(sessionId: number): SandboxCompletedSession {
  return {
    session: {
      id: sessionId,
      session_code: `S-${sessionId}`,
      status: 'COMPLETED',
      barcode: null,
      created_at: null,
      started_at: null,
      ended_at: null
    },
    outbox_items: []
  }
}

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>(next => {
    resolve = next
  })
  return { promise, resolve }
}

describe('SandboxWorkbenchPage cleanup', () => {
  afterEach(() => {
    for (const wrapper of mountedWrappers.splice(0)) wrapper.unmount()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    mocks.route.params.worklineId = '45'
    if (mocks.sseStore) mocks.sseStore.lastEvent = null
    mocks.store.detail.summary.runtime_status = 'READY'
    mocks.store.detail.summary.active_safety_incident_id = null
    mocks.store.detail.summary.start_admission_status = null
    mocks.store.detail.summary.start_admission_message = null
    mocks.store.detail.summary.start_admission_failed_device_code = null
    mocks.store.detail.summary.last_start_request_id = null
    mocks.store.detail.summary.last_start_trace_id = null
    mocks.store.findSummary.mockReturnValue(mocks.store.detail.summary)
    mocks.hasPermission.mockReturnValue(true)
    mocks.confirm.mockResolvedValue('confirm')
    mocks.sandboxPendingSend.mockResolvedValue([])
    mocks.sandboxCompletedSend.mockResolvedValue([])
    mocks.clearEstopSend.mockResolvedValue({})
    mocks.sandboxSimulateEstopSend.mockResolvedValue({})
    mocks.sandboxCleanupSend
      .mockResolvedValueOnce({
        workline_id: 45,
        dry_run: true,
        deleted: false,
        counts: { sessions: 1, inboxes: 1, outboxes: 1 },
        affected_session_ids: [93],
        message: '预计清理 3 条沙箱运行时数据'
      })
      .mockResolvedValueOnce({
        workline_id: 45,
        dry_run: false,
        deleted: true,
        counts: { sessions: 1, inboxes: 1, outboxes: 1 },
        affected_session_ids: [93],
        message: '已清理该 SIMULATION 工作线的沙箱运行时数据'
      })
  })

  it('dry-runs cleanup before confirming execution with the workline code', async () => {
    const wrapper = await mountPage()

    await wrapper.get('[data-test="sandbox-cleanup"]').trigger('click')
    await flushPromises()

    expect(mocks.runtimeApiMethods.sandboxCleanup).toHaveBeenNthCalledWith(1, 45, {
      dry_run: true
    })
    expect(mocks.confirm).toHaveBeenCalledWith(
      expect.stringContaining(
        '将清理当前工作线全部沙箱待处理、历史、Runtime Hold 与相关运行时记录，清理后旧历史不可恢复。'
      ),
      '清理沙箱数据',
      expect.objectContaining({ type: 'warning' })
    )
    expect(mocks.runtimeApiMethods.sandboxCleanup).toHaveBeenNthCalledWith(2, 45, {
      dry_run: false,
      confirmation: 'SMT-RIGHT'
    })
    expect(mocks.success).toHaveBeenCalledWith('已清理该 SIMULATION 工作线的沙箱运行时数据')
    expect(mocks.runtimeApiMethods.sandboxPending).toHaveBeenCalledTimes(2)
    expect(mocks.runtimeApiMethods.sandboxCompleted).toHaveBeenCalledTimes(2)
  })

  it('does not execute cleanup when operator cancels the confirmation', async () => {
    mocks.confirm.mockRejectedValue('cancel')
    const wrapper = await mountPage()

    await wrapper.get('[data-test="sandbox-cleanup"]').trigger('click')
    await flushPromises()

    expect(mocks.runtimeApiMethods.sandboxCleanup).toHaveBeenCalledTimes(1)
    expect(mocks.success).not.toHaveBeenCalled()
  })

  it('does not execute cleanup if the route changes after dry-run preview', async () => {
    let confirmCleanup!: () => void
    mocks.confirm.mockReturnValue(
      new Promise(resolve => {
        confirmCleanup = () => resolve('confirm')
      })
    )
    const wrapper = await mountPage()

    await wrapper.get('[data-test="sandbox-cleanup"]').trigger('click')
    await flushPromises()
    mocks.route.params.worklineId = '46'
    confirmCleanup()
    await flushPromises()

    expect(mocks.runtimeApiMethods.sandboxCleanup).toHaveBeenCalledTimes(1)
    expect(mocks.warning).toHaveBeenCalledWith('工作线已切换，已取消本次沙箱清理。')
  })

  it('hides cleanup action when user lacks sandbox cleanup permission', async () => {
    mocks.hasPermission.mockReturnValue(false)

    const wrapper = await mountPage()

    expect(wrapper.find('[data-test="sandbox-cleanup"]').exists()).toBe(false)
  })

  it('submits clear-estop checks before reloading sandbox state', async () => {
    mocks.store.detail.summary.runtime_status = 'ESTOPPED'
    mocks.store.detail.summary.active_safety_incident_id = 7
    const wrapper = await mountPage()

    await wrapper.get('[data-test="sandbox-clear-estop"]').trigger('click')
    await flushPromises()

    expect(mocks.confirm).toHaveBeenCalledWith(
      '确认现场/沙箱设备已复位、安全区域已清空？',
      '恢复 WorkLine 接收',
      expect.objectContaining({ confirmButtonText: '恢复接收', type: 'warning' })
    )
    expect(mocks.runtimeApiMethods.clearEstop).toHaveBeenCalledWith(45, {
      reason: '人工确认 WorkLine 软件急停解除',
      checks: {
        estop_button_reset: true,
        area_safe: true,
        devices_reset: true,
        operator_confirmed: true
      }
    })
    expect(mocks.success).toHaveBeenCalledWith('已解除冻结，等待现场硬件 START')
    expect(mocks.store.loadWorklines).toHaveBeenCalledTimes(2)
    expect(mocks.runtimeApiMethods.sandboxPending).toHaveBeenCalledTimes(2)
    expect(mocks.runtimeApiMethods.sandboxCompleted).toHaveBeenCalledTimes(2)
  })

  it('disables production events while STOPPED and keeps a visible START verdict before topology', async () => {
    mocks.store.detail.summary.runtime_status = 'STOPPED'
    mocks.store.detail.summary.start_admission_status = 'FAILED'
    mocks.store.detail.summary.start_admission_message = 'START 准入失败: 设备 RS-CONV-01 非空闲'
    mocks.store.detail.summary.start_admission_failed_device_code = 'RS-CONV-01'
    mocks.store.detail.summary.last_start_request_id = 'req-start-1'
    mocks.store.detail.summary.last_start_trace_id = 'trace-start-1'
    const wrapper = await mountPage()

    const verdict = wrapper.get('[data-test="sandbox-start-verdict"]')
    expect(verdict.text()).toContain('等待现场硬件 START')
    expect(verdict.text()).toContain('START 准入失败: 设备 RS-CONV-01 非空闲')
    expect(verdict.text()).toContain('RS-CONV-01')
    expect(verdict.text()).toContain('req-start-1')
    expect(verdict.text()).toContain('trace-start-1')
    expect(wrapper.get('.sandbox-event-composer-stub').attributes('data-disabled')).toBe('true')
    expect(wrapper.get('.sandbox-event-composer-stub').text()).toContain('工作线未 START')
    expect(wrapper.get('.sandbox-event-composer-stub').text()).toContain('等待现场硬件 START')
    expect(wrapper.find('[data-test="sandbox-start-verdict"]').element.compareDocumentPosition(
      wrapper.findComponent({ name: 'WorklineRouteMap' }).element
    ) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('uses detail summary for START diagnostics when directory summary is stale', async () => {
    const staleDirectorySummary = {
      ...mocks.store.detail.summary,
      runtime_status: 'STOPPED',
      start_admission_status: 'NOT_REQUESTED',
      start_admission_message: null,
      start_admission_failed_device_code: null,
      last_start_request_id: null,
      last_start_trace_id: null
    }
    mocks.store.findSummary.mockReturnValue(staleDirectorySummary)
    mocks.store.detail.summary = {
      ...mocks.store.detail.summary,
      runtime_status: 'STOPPED',
      start_admission_status: 'FAILED',
      start_admission_message: 'START 准入失败: 设备 RS-CONV-02 非 AUTO',
      start_admission_failed_device_code: 'RS-CONV-02',
      last_start_request_id: 'req-detail-start',
      last_start_trace_id: 'trace-detail-start'
    }

    const wrapper = await mountPage()

    const verdict = wrapper.get('[data-test="sandbox-start-verdict"]')
    expect(verdict.text()).toContain('START 准入失败: 设备 RS-CONV-02 非 AUTO')
    expect(verdict.text()).toContain('RS-CONV-02')
    expect(verdict.text()).toContain('req-detail-start')
    expect(verdict.text()).toContain('trace-detail-start')

    wrapper.unmount()
    mocks.store.detail.summary = {
      ...mocks.store.detail.summary,
      start_admission_status: 'CHECKING',
      start_admission_message: null,
      start_admission_failed_device_code: null,
      last_start_request_id: null,
      last_start_trace_id: null
    }
    const checkingWrapper = await mountPage()

    expect(checkingWrapper.get('[data-test="sandbox-start-verdict"]').text()).toContain(
      '正在检查设备 AUTO/IDLE'
    )
  })

  it('shows mock START only for STOPPED simulation worklines and exposes checking state', async () => {
    const startSend = vi.fn(() => new Promise(() => undefined))
    mocks.runtimeApiMethods.worklineStartRequested.mockReturnValue({ send: startSend })
    mocks.store.detail.summary.runtime_status = 'STOPPED'
    const wrapper = await mountPage()

    const startButton = wrapper.get('[data-test="sandbox-start-workline"]')
    expect(startButton.text()).toContain('模拟现场 START')
    await startButton.trigger('click')
    await nextTick()

    expect(mocks.runtimeApiMethods.worklineStartRequested).toHaveBeenCalledWith(
      45,
      expect.objectContaining({ deviceCode: 'ARM03' })
    )
    expect(startButton.attributes('data-loading')).toBe('true')
    expect(wrapper.get('[data-test="sandbox-start-verdict"]').text()).toContain('正在检查设备 AUTO/IDLE')
  })

  it('does not show START success when callback ingress returns rejected data', async () => {
    const startSend = vi.fn().mockResolvedValue({
      ack: false,
      reason_code: 'DEVICE_NOT_IDLE',
      diagnostic: {
        message: '设备 ARM03 不是 IDLE'
      }
    })
    mocks.runtimeApiMethods.worklineStartRequested.mockReturnValue({ send: startSend })
    mocks.store.detail.summary.runtime_status = 'STOPPED'
    const wrapper = await mountPage()

    await wrapper.get('[data-test="sandbox-start-workline"]').trigger('click')
    await flushPromises()

    expect(mocks.success).not.toHaveBeenCalledWith('START 已提交，正在刷新工作线状态')
    expect(mocks.error).toHaveBeenCalledWith('设备 ARM03 不是 IDLE')
    expect(mocks.store.loadDetail).toHaveBeenCalled()
    expect(mocks.runtimeApiMethods.sandboxPending).toHaveBeenCalledTimes(2)
    expect(mocks.runtimeApiMethods.sandboxCompleted).toHaveBeenCalledTimes(2)
  })

  it('blocks replay while STOPPED without disabling the whole action list', async () => {
    const stoppedSession = {
      session_id: 91,
      session_code: 'S-91',
      trace_id: 'trace-stopped-replay',
      workline_id: 45,
      status: 'MANUAL_HOLD',
      failure_code: 'PAYLOAD_INVALID',
      last_inbox_id: 809,
      is_timed_out: false
    }
    mocks.store.detail.summary.runtime_status = 'STOPPED'
    mocks.store.detail.active_sessions = [stoppedSession]
    const wrapper = await mountPage()
    const actionList = wrapper.getComponent({ name: 'SandboxActionList' })

    expect(actionList.props('disabled')).toBe(false)
    expect(actionList.props('replayDisabled')).toBe(true)
    expect(actionList.props('replayDisabledReason')).toBe('工作线未 START，等待现场硬件 START')
    expect(wrapper.get('.sandbox-action-list-stub').text()).toContain(
      '工作线未 START，等待现场硬件 START'
    )

    actionList.vm.$emit('replay', stoppedSession)
    await flushPromises()

    expect(mocks.runtimeApiMethods.replayInbox).not.toHaveBeenCalled()
    expect(mocks.warning).toHaveBeenCalledWith('工作线未 START，等待现场硬件 START')
  })

  it('does not clear estop if the route changes before confirmation resolves', async () => {
    let confirmClear!: () => void
    mocks.store.detail.summary.runtime_status = 'ESTOPPED'
    mocks.store.detail.summary.active_safety_incident_id = 7
    mocks.confirm.mockReturnValue(
      new Promise(resolve => {
        confirmClear = () => resolve('confirm')
      })
    )
    const wrapper = await mountPage()

    await wrapper.get('[data-test="sandbox-clear-estop"]').trigger('click')
    await flushPromises()
    mocks.route.params.worklineId = '46'
    confirmClear()
    await flushPromises()

    expect(mocks.runtimeApiMethods.clearEstop).not.toHaveBeenCalled()
    expect(mocks.warning).toHaveBeenCalledWith('工作线已切换，已取消本次恢复接收。')
  })

  it('refreshes summary and detail when safety SSE events arrive', async () => {
    await mountPage()
    vi.clearAllMocks()

    mocks.sseStore.lastEvent = {
      domain: 'workline_safety',
      entity: 'incident',
      action: 'estop.activated',
      keys: { workline_id: 45, incident_id: 7 }
    }
    await nextTick()
    await flushPromises()

    expect(mocks.store.loadWorklines).toHaveBeenCalledTimes(1)
    expect(mocks.store.loadDetail).toHaveBeenCalledWith(45)
    expect(mocks.runtimeApiMethods.sandboxPending).not.toHaveBeenCalled()
    expect(mocks.runtimeApiMethods.sandboxCompleted).not.toHaveBeenCalled()
  })

  it('ignores sandbox responses that resolve after the workline route changes', async () => {
    const pending = deferred<SandboxPendingOutbox[]>()
    const completed = deferred<SandboxCompletedSession[]>()
    mocks.sandboxPendingSend.mockReturnValueOnce(pending.promise)
    mocks.sandboxCompletedSend.mockReturnValueOnce(completed.promise)
    const wrapper = await mountPage()

    mocks.route.params.worklineId = '46'
    pending.resolve([createOutbox({ id: 99, dispatch_key: 'stale-command' })])
    completed.resolve([createCompletedSession(888)])
    await flushPromises()

    expect(wrapper.text()).not.toContain('stale-command')
    expect(wrapper.text()).not.toContain('completed-888')
  })

  it('simulates estop and reloads the sandbox page state', async () => {
    const wrapper = await mountPage()

    await wrapper
      .findAll('button')
      .find(button => button.text().includes('模拟急停'))!
      .trigger('click')
    await flushPromises()

    expect(mocks.runtimeApiMethods.sandboxSimulateEstop).toHaveBeenCalledWith(45, {
      reason: 'Sandbox 模拟软件急停冻结',
      source_device_id: null,
      payload: { trigger: 'sandbox_button' }
    })
    expect(mocks.success).toHaveBeenCalledWith('已模拟软件急停冻结')
    expect(mocks.store.loadWorklines).toHaveBeenCalledTimes(2)
    expect(mocks.runtimeApiMethods.sandboxPending).toHaveBeenCalledTimes(2)
    expect(mocks.runtimeApiMethods.sandboxCompleted).toHaveBeenCalledTimes(2)
  })

  it('keeps simulate-estop disabled while the sandbox is safety locked', async () => {
    mocks.store.detail.summary.runtime_status = 'ESTOPPED'
    mocks.store.detail.summary.active_safety_incident_id = 7

    const wrapper = await mountPage()

    const simulateButton = wrapper
      .findAll('button')
      .find(button => button.text().includes('模拟急停'))!
    expect(simulateButton.attributes('disabled')).toBeDefined()
  })
})
