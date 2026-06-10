import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { SandboxPendingOutbox } from '@/types/runtime'

const mocks = vi.hoisted(() => {
  const pendingSend = vi.fn()
  const completedSend = vi.fn()
  const summary = {
    id: 20,
    line_code: 'WL-20',
    line_name: 'Workline 20',
    runtime_status: 'READY',
    active_safety_incident_id: null
  }
  const store = {
    detail: {
      summary,
      devices: [
        {
          id: 101,
          device_code: 'ARM01',
          device_name: '机械臂',
          device_role: 'ROBOT',
          role_index: 1,
          device_status: 'IDLE',
          maintenance_mode: false,
          active_runtime_hold_ids: []
        }
      ],
      active_sessions: []
    },
    findSummary: vi.fn(() => summary),
    loadWorklines: vi.fn().mockResolvedValue(undefined),
    loadProjection: vi.fn().mockResolvedValue(undefined),
    clearProjection: vi.fn()
  }

  return {
    route: { params: { worklineId: '20' } },
    router: { push: vi.fn() },
    hasPermission: vi.fn(() => true),
    pendingSend,
    completedSend,
    store,
    runtimeApiMethods: {
      sandboxPending: vi.fn(() => ({ send: pendingSend })),
      sandboxCompleted: vi.fn(() => ({ send: completedSend })),
      sandboxCleanup: vi.fn(() => ({ send: vi.fn() })),
      sandboxSimulateEstop: vi.fn(() => ({ send: vi.fn() })),
      sandboxAck: vi.fn(() => ({ send: vi.fn() })),
      replayInbox: vi.fn(() => ({ send: vi.fn() })),
      clearEstop: vi.fn(() => ({ send: vi.fn() }))
    }
  }
})

vi.mock('vue-router', () => ({
  useRoute: () => mocks.route,
  useRouter: () => mocks.router
}))

vi.mock('@/api/modules/runtime', () => ({
  runtimeApiMethods: mocks.runtimeApiMethods
}))

vi.mock('@/stores/runtime-sse', () => ({
  useRuntimeSSEStore: () => ({ lastEvent: null })
}))

vi.mock('@/composables/usePermission', () => ({
  usePermission: () => ({ hasPermission: mocks.hasPermission })
}))

vi.mock('@/stores/workline-runtime', () => ({
  useWorklineRuntimeStore: () => mocks.store
}))

function createOutbox(overrides: Partial<SandboxPendingOutbox> = {}): SandboxPendingOutbox {
  return {
    id: 1,
    session_id: 10,
    workline_id: 20,
    dispatch_key: 'device-command:CMD-1',
    dispatch_type: 'COMMAND',
    target_type: 'DEVICE',
    target_code: 'ARM01',
    status: 'ACKED',
    payload_json: {},
    ...overrides
  }
}

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
        RuntimeSceneDeviceFlow: true,
        SandboxEventComposer: true,
        ElAlert: true,
        ElDivider: true,
        ElButton: {
          props: ['disabled', 'loading'],
          template:
            '<button :disabled="disabled" :data-loading="loading ? true : undefined" @click="$emit(`click`)"><slot /></button>'
        },
        StandardDrawer: {
          props: ['modelValue'],
          template: '<aside v-if="modelValue"><slot name="header" /><slot /></aside>'
        },
        SandboxActionList: {
          props: ['items', 'submittedResultOutboxIds', 'submittedResultOutboxKeys'],
          emits: ['result'],
          template:
            '<div><button v-for="item in items" :key="item.id" class="result-action" :disabled="submittedResultOutboxIds?.has(item.id) || submittedResultOutboxKeys?.has(item.dispatch_key)" @click="$emit(`result`, item)">模拟 Result {{ item.id }}</button></div>'
        },
        SandboxResultComposer: {
          props: ['outbox', 'disabled'],
          emits: ['submitted'],
          template:
            '<button class="submit-result" :disabled="disabled" @click="$emit(`submitted`, outbox)">提交 Result</button>'
        },
        Teleport: true
      }
    }
  })
  await flushPromises()
  return wrapper
}

describe('sandbox result flow', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    mocks.route.params.worklineId = '20'
    mocks.pendingSend
      .mockResolvedValueOnce([createOutbox()])
      .mockResolvedValueOnce([createOutbox()])
      .mockResolvedValue([
        createOutbox({ id: 2, session_id: 11, dispatch_key: 'device-command:CMD-2' })
      ])
    mocks.completedSend.mockResolvedValue([])
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('locks the submitted result immediately and refreshes later pending operations', async () => {
    const wrapper = await mountPage()

    expect(wrapper.text()).toContain('模拟 Result 1')

    await wrapper.get('.result-action').trigger('click')
    await flushPromises()
    await wrapper.get('.submit-result').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('模拟 Result 1')
    expect(wrapper.get('.result-action').attributes('disabled')).toBeDefined()

    await vi.advanceTimersByTimeAsync(800)
    await flushPromises()

    expect(mocks.runtimeApiMethods.sandboxPending).toHaveBeenCalledWith(50, 20)
    expect(mocks.store.loadProjection).toHaveBeenCalledWith(20)
    expect(wrapper.text()).toContain('模拟 Result 2')
  })
})
