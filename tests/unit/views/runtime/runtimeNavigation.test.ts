import { flushPromises, shallowMount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type {
  RuntimeDeviceSummary,
  RuntimeOverviewResponse,
  RuntimeTraceListItem,
  RuntimeWorklineSummary
} from '@/types/runtime'

const mocks = vi.hoisted(() => {
  const overviewSend = vi.fn()
  const queryTracesSend = vi.fn()
  const worklinesSend = vi.fn()
  const devicesSend = vi.fn()

  return {
    route: {
      query: {} as Record<string, unknown>
    },
    router: {
      push: vi.fn(),
      replace: vi.fn()
    },
    overviewSend,
    queryTracesSend,
    worklinesSend,
    devicesSend,
    sseStore: {
      live: true,
      state: 'connected',
      connectionLabel: 'SSE Connected',
      connectionTone: 'success',
      lastEvent: null,
      lastRefreshedAt: null,
      isStale: false,
      markRefreshedAt: vi.fn(),
      toggleLive: vi.fn()
    }
  }
})

vi.mock('vue-router', () => ({
  useRoute: () => mocks.route,
  useRouter: () => mocks.router
}))

vi.mock('@/stores/runtime-sse', () => ({
  useRuntimeSSEStore: () => mocks.sseStore
}))

vi.mock('@/api/modules/runtime', () => ({
  runtimeApiMethods: {
    overview: () => ({ send: mocks.overviewSend }),
    queryTraces: () => ({ send: mocks.queryTracesSend }),
    worklines: () => ({ send: mocks.worklinesSend }),
    devices: () => ({ send: mocks.devicesSend })
  }
}))

function createWorkline(overrides: Partial<RuntimeWorklineSummary> = {}): RuntimeWorklineSummary {
  return {
    id: 101,
    line_code: 'WL-101',
    line_name: 'Workline 101',
    line_type: 'main',
    zone_name: 'A',
    plugin_key: 'plugin-a',
    contract_version: 'v1',
    is_active: true,
    device_count: 1,
    active_session_count: 1,
    waiting_session_count: 0,
    failed_session_count: 0,
    error_device_count: 0,
    offline_device_count: 0,
    maintenance_device_count: 0,
    run_mode: 'SIMULATION',
    last_activity_at: '2026-05-22T00:00:00Z',
    ...overrides
  }
}

function createDevice(overrides: Partial<RuntimeDeviceSummary> = {}): RuntimeDeviceSummary {
  return {
    id: 201,
    device_code: 'DV-201',
    device_name: 'Device 201',
    device_role: 'scanner',
    role_index: 1,
    workline_id: 101,
    workline_name: 'Workline 101',
    workline_code: 'WL-101',
    device_status: 'ONLINE',
    maintenance_mode: false,
    current_command_id: null,
    pending_command_count: 0,
    last_heartbeat_at: '2026-05-22T00:00:00Z',
    recent_callback_at: '2026-05-22T00:00:00Z',
    error_code: null,
    ...overrides
  }
}

function createTrace(overrides: Partial<RuntimeTraceListItem> = {}): RuntimeTraceListItem {
  return {
    session_id: 301,
    session_code: 'S-301',
    trace_id: 'trace-301',
    request_id: 'req-301',
    workline_id: 101,
    workline_name: 'Workline 101',
    workline_code: 'WL-101',
    device_id: 201,
    device_name: 'Device 201',
    device_code: 'DV-201',
    command_code: 'SCAN',
    status: 'FAILED',
    plugin_state: 'SCAN',
    current_wait_type: null,
    failure_domain: 'DEVICE',
    failure_code: 'DEVICE_TIMEOUT',
    started_at: '2026-05-22T00:00:00Z',
    last_ingress_at: '2026-05-22T00:01:00Z',
    deadline_at: null,
    is_timed_out: false,
    ...overrides
  }
}

function createOverview(overrides: Partial<RuntimeOverviewResponse> = {}): RuntimeOverviewResponse {
  return {
    stats: [
      { key: 'running_sessions', label: '运行中', value: 1, status: 'primary' },
      { key: 'inbox_backlog', label: 'Inbox', value: 0, status: 'success' },
      { key: 'outbox_backlog', label: 'Outbox', value: 0, status: 'success' }
    ],
    recent_active_traces: [],
    recent_failed_traces: [],
    hot_worklines: [],
    abnormal_devices: [],
    device_health: {
      total: 1,
      abnormal: 0,
      maintenance: 0,
      loaded: 1,
      healthy: 1
    },
    ...overrides
  }
}

async function flushViewUpdates() {
  await flushPromises()
  await Promise.resolve()
}

function createMountOptions() {
  return {
    global: {
      directives: {
        loading: {}
      },
      stubs: {
        StandardDrawer: {
          props: ['modelValue'],
          template: '<section v-if="modelValue"><slot name="header" /><slot /></section>'
        },
        RuntimeDeviceInspector: {
          name: 'RuntimeDeviceInspector',
          props: ['deviceId', 'worklineId', 'showHeader'],
          emits: ['close', 'selectSession'],
          template: '<article />'
        },
        RuntimeEmptyState: true,
        RuntimeStatusBadge: true,
        RuntimeLastUpdated: true,
        RuntimeFrozenNotice: true,
        RuntimeHealthBreakdown: true,
        RuntimePriorityQueue: true,
        RuntimeSignalStrip: true,
        RuntimeSystemVerdict: true,
        RuntimeTraceList: {
          name: 'RuntimeTraceList',
          emits: ['select', 'showMore'],
          template: '<section />'
        },
        'el-button': true,
        'el-collapse': true,
        'el-collapse-item': true,
        'el-input': true,
        'el-option': true,
        'el-select': true,
        'el-switch': true
      }
    }
  }
}

describe('runtime navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.route.query = {}
    mocks.overviewSend.mockResolvedValue(createOverview())
    mocks.queryTracesSend.mockResolvedValue({ items: [] })
    mocks.worklinesSend.mockResolvedValue([createWorkline()])
    mocks.devicesSend.mockResolvedValue([createDevice()])
  })

  it('routes overview trace rows to the trace explorer', async () => {
    const { default: RuntimeOverviewPage } =
      await import('@/views/runtime/overview/RuntimeOverviewPage.vue')
    const wrapper = shallowMount(RuntimeOverviewPage, createMountOptions())
    await flushViewUpdates()

    await wrapper.findComponent({ name: 'RuntimeTraceList' }).vm.$emit('select', createTrace())

    expect(mocks.router.push).toHaveBeenLastCalledWith({
      name: 'RuntimeTraces',
      query: {
        traceId: 'trace-301',
        sessionId: undefined,
        worklineId: '101',
        deviceId: '201'
      }
    })
  })

  it('routes overview trace show-more actions to the trace explorer', async () => {
    const { default: RuntimeOverviewPage } =
      await import('@/views/runtime/overview/RuntimeOverviewPage.vue')
    const wrapper = shallowMount(RuntimeOverviewPage, createMountOptions())
    await flushViewUpdates()

    await wrapper.findComponent({ name: 'RuntimeTraceList' }).vm.$emit('showMore')

    expect(mocks.router.push).toHaveBeenLastCalledWith({ name: 'RuntimeTraces' })
  })

  it('replaces query-driven sandbox redirects so Back does not reopen the redirect URL', async () => {
    mocks.route.query = { worklineId: '101' }
    const { default: RuntimeSandboxPage } =
      await import('@/views/runtime/sandbox/RuntimeSandboxPage.vue')

    shallowMount(RuntimeSandboxPage, createMountOptions())
    await flushViewUpdates()

    expect(mocks.router.replace).toHaveBeenCalledWith({
      name: 'RuntimeSandboxWorkbench',
      params: { worklineId: 101 }
    })
    expect(mocks.router.push).not.toHaveBeenCalled()
  })

  it('keeps manual sandbox card selection as push navigation', async () => {
    const { default: RuntimeSandboxPage } =
      await import('@/views/runtime/sandbox/RuntimeSandboxPage.vue')
    const wrapper = shallowMount(RuntimeSandboxPage, createMountOptions())
    await flushViewUpdates()

    await wrapper.find('.sandbox-entry__card').trigger('click')

    expect(mocks.router.push).toHaveBeenCalledWith({
      name: 'RuntimeSandboxWorkbench',
      params: { worklineId: 101 }
    })
    expect(mocks.router.replace).not.toHaveBeenCalled()
  })

  it('opens the device drawer from a deviceId deep link', async () => {
    mocks.route.query = { deviceId: '201' }
    const { default: DeviceRuntimePage } =
      await import('@/views/runtime/devices/DeviceRuntimePage.vue')
    const wrapper = shallowMount(DeviceRuntimePage, createMountOptions())
    await flushViewUpdates()

    const inspector = wrapper.findComponent({ name: 'RuntimeDeviceInspector' })

    expect(inspector.exists()).toBe(true)
    expect(inspector.props()).toMatchObject({
      deviceId: 201,
      worklineId: 101,
      showHeader: false
    })
  })

  it('routes device drawer session selections to the trace explorer', async () => {
    const { default: DeviceRuntimePage } =
      await import('@/views/runtime/devices/DeviceRuntimePage.vue')
    const wrapper = shallowMount(DeviceRuntimePage, createMountOptions())
    await flushViewUpdates()

    await wrapper.find('.device-card').trigger('click')
    await wrapper
      .findComponent({ name: 'RuntimeDeviceInspector' })
      .vm.$emit('selectSession', createTrace())

    expect(mocks.router.push).toHaveBeenLastCalledWith({
      name: 'RuntimeTraces',
      query: {
        sessionId: '301',
        traceId: 'trace-301',
        worklineId: '101',
        deviceId: '201'
      }
    })
  })
})
