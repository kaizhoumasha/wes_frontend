import { flushPromises, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { SandboxCompletedSession, SandboxPendingOutbox } from '@/types/runtime'

const mocks = vi.hoisted(() => {
  const sandboxPendingSend = vi.fn()
  const sandboxCompletedSend = vi.fn()
  const sandboxCleanupSend = vi.fn()
  const clearEstopSend = vi.fn()
  const summary = {
    id: 45,
    line_name: '右侧SMT粗分线',
    line_code: 'SMT-RIGHT',
    runtime_status: 'READY' as string,
    active_safety_incident_id: null as number | null
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
    lastEvent: undefined as unknown as { value: unknown },
    sandboxPendingSend,
    sandboxCompletedSend,
    sandboxCleanupSend,
    clearEstopSend,
    store,
    runtimeApiMethods: {
      sandboxPending: vi.fn(() => ({ send: sandboxPendingSend })),
      sandboxCompleted: vi.fn(() => ({ send: sandboxCompletedSend })),
      sandboxCleanup: vi.fn(() => ({ send: sandboxCleanupSend })),
      clearEstop: vi.fn(() => ({ send: clearEstopSend })),
      sandboxSimulateEstop: vi.fn(() => ({ send: vi.fn() })),
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

vi.mock('@/composables/useRuntimeSSE', async () => {
  const vue = await vi.importActual<typeof import('vue')>('vue')
  mocks.lastEvent = vue.ref(null)
  return {
    useRuntimeSSE: () => ({ lastEvent: mocks.lastEvent })
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
          props: ['items', 'completedItems'],
          template:
            '<div><span v-for="item in items" :key="item.id">{{ item.dispatch_key }}</span><span v-for="entry in completedItems" :key="entry.session.id">completed-{{ entry.session.id }}</span></div>'
        },
        SandboxEventComposer: true,
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
    if (mocks.lastEvent) mocks.lastEvent.value = null
    mocks.store.detail.summary.runtime_status = 'READY'
    mocks.store.detail.summary.active_safety_incident_id = null
    mocks.hasPermission.mockReturnValue(true)
    mocks.confirm.mockResolvedValue('confirm')
    mocks.sandboxPendingSend.mockResolvedValue([])
    mocks.sandboxCompletedSend.mockResolvedValue([])
    mocks.clearEstopSend.mockResolvedValue({})
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
    expect(mocks.success).toHaveBeenCalledWith('已恢复接收新流程')
    expect(mocks.store.loadWorklines).toHaveBeenCalledTimes(2)
    expect(mocks.runtimeApiMethods.sandboxPending).toHaveBeenCalledTimes(2)
    expect(mocks.runtimeApiMethods.sandboxCompleted).toHaveBeenCalledTimes(2)
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

    mocks.lastEvent.value = {
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
})
