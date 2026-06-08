import { nextTick, reactive } from 'vue'
import { shallowMount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

type RouteState = {
  path: string
  fullPath: string
  query: Record<string, unknown>
}

const routeState = reactive<RouteState>({
  path: '/runtime/monitor',
  fullPath: '/runtime/monitor',
  query: {}
})

const routerMock = {
  push: vi.fn(),
  replace: vi.fn(async ({ query }: { query: Record<string, unknown> }) => {
    routeState.query = { ...query }
    return undefined
  })
}

const mountedWrappers: Array<{ unmount: () => void }> = []

const worklinesSend = vi.fn()
const worklineDetailSend = vi.fn()
const deviceDetailSend = vi.fn()
const worklinePluginManifestSend = vi.fn()
const sseStoreMock = reactive({
  connectionLabel: 'SSE Connected',
  connectionTone: 'success',
  lastEvent: null as null | {
    domain?: string
    entity?: string
    action?: string
    keys?: Record<string, unknown>
    payload?: Record<string, unknown>
  },
  lastRawEvent: null,
  lastRefreshedAt: null,
  live: true,
  state: 'connected',
  markRefreshedAt: vi.fn(),
  toggleLive: vi.fn()
})

vi.mock('vue-router', () => ({
  useRoute: () => routeState,
  useRouter: () => routerMock
}))

vi.mock('@/composables/useRuntimePageChrome', () => ({
  useRuntimePageChrome: () => sseStoreMock
}))

vi.mock('@/stores/runtime-sse', () => ({
  useRuntimeSSEStore: () => sseStoreMock
}))

vi.mock('@/composables/usePermission', () => ({
  usePermission: () => ({
    hasPermission: () => true
  })
}))

vi.mock('@/utils/runtime-display', () => ({
  aggregateSessionsByDevice: () => new Map(),
  compactEnumLabel: (value?: string | null) => value ?? '—',
  formatRuntimeDateTime: (value?: string | null) => value ?? '—',
  formatRuntimeDurationMs: (value?: number | null) => (value == null ? '—' : `${value} ms`),
  formatRuntimeElapsed: () => '1m',
  getDeviceRiskScore: () => 0,
  getWorklineRiskLabel: () => 'stable',
  getWorklineRiskScore: () => 0,
  getWorklineRiskTone: () => 'success',
  pickDominantValue: <T>(items: T[]) => items[0] ?? null,
  readPositiveInt: (value: unknown) => {
    const rawValue = Array.isArray(value) ? value[0] : value
    const numericValue = Number(rawValue || 0)
    return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : null
  },
  resolveRuntimeProgressLabel: () => 'RUNNING',
  resolveRuntimeTone: () => 'info',
  sortByScoreDesc: <T>(items: T[]) => [...items]
}))

vi.mock('@/api/modules/runtime', () => ({
  runtimeApiMethods: {
    worklines: () => ({ send: worklinesSend }),
    worklineDetail: (worklineId: number) => ({
      send: () => worklineDetailSend(worklineId)
    }),
    worklinePluginManifest: () => ({
      send: worklinePluginManifestSend
    }),
    deviceDetail: (deviceId: number, worklineId: number) => ({
      send: () => deviceDetailSend(deviceId, worklineId)
    })
  }
}))

const worklineSummary = {
  id: 101,
  line_code: 'WL-101',
  line_name: 'Workline 101',
  line_type: 'main',
  zone_name: 'A',
  plugin_key: 'plugin-a',
  contract_version: 'v1',
  is_active: true,
  device_count: 2,
  active_session_count: 1,
  waiting_session_count: 0,
  failed_session_count: 0,
  error_device_count: 0,
  offline_device_count: 0,
  maintenance_device_count: 0,
  last_activity_at: '2026-04-21T00:00:00Z'
}

const deviceRows = [
  {
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
    last_heartbeat_at: '2026-04-21T00:00:00Z',
    recent_callback_at: '2026-04-21T00:00:00Z',
    error_code: null
  },
  {
    id: 202,
    device_code: 'DV-202',
    device_name: 'Device 202',
    device_role: 'printer',
    role_index: 2,
    workline_id: 101,
    workline_name: 'Workline 101',
    workline_code: 'WL-101',
    device_status: 'ONLINE',
    maintenance_mode: false,
    current_command_id: null,
    pending_command_count: 0,
    last_heartbeat_at: '2026-04-21T00:00:00Z',
    recent_callback_at: '2026-04-21T00:00:00Z',
    error_code: null
  }
]

function createWorklineDetail(id: number) {
  return {
    summary: { ...worklineSummary, id, line_code: `WL-${id}`, line_name: `Workline ${id}` },
    devices: deviceRows.filter(d => d.workline_id === id),
    active_sessions: [],
    recent_failed_traces: []
  }
}

function createDeviceDetail(deviceId: number, worklineId: number) {
  const summary = deviceRows.find(item => item.id === deviceId) ?? deviceRows[0]
  return {
    summary: { ...summary, workline_id: worklineId },
    recent_commands: [],
    recent_callbacks: [],
    active_sessions: []
  }
}

async function flushViewUpdates() {
  await Promise.resolve()
  await nextTick()
  await Promise.resolve()
  await nextTick()
}

function createMountOptions() {
  return {
    global: {
      directives: {
        loading: {}
      },
      stubs: {
        transition: false,
        'el-button': true,
        'el-card': true,
        'el-dialog': true,
        'el-input': true,
        'el-switch': true,
        StandardDrawer: {
          props: ['modelValue'],
          template: '<section v-if="modelValue"><slot name="header" /><slot /></section>'
        }
      }
    }
  }
}

describe('runtime route sync', () => {
  afterEach(() => {
    for (const wrapper of mountedWrappers.splice(0)) {
      wrapper.unmount()
    }
  })

  beforeEach(() => {
    setActivePinia(createPinia())

    routeState.path = '/runtime/monitor'
    routeState.fullPath = '/runtime/monitor'
    routeState.query = {}

    routerMock.push.mockReset()
    routerMock.replace.mockClear()
    sseStoreMock.lastEvent = null
    sseStoreMock.lastRefreshedAt = null
    sseStoreMock.live = true
    sseStoreMock.markRefreshedAt.mockClear()
    sseStoreMock.toggleLive.mockClear()

    worklinesSend.mockReset()
    worklineDetailSend.mockReset()
    deviceDetailSend.mockReset()
    worklinePluginManifestSend.mockReset()

    worklinesSend.mockResolvedValue([worklineSummary])
    worklineDetailSend.mockImplementation(async (worklineId: number) => createWorklineDetail(worklineId))
    deviceDetailSend.mockImplementation(async (deviceId: number, worklineId: number) => createDeviceDetail(deviceId, worklineId))
    worklinePluginManifestSend.mockResolvedValue({
      plugin_key: 'plugin-a',
      contract_version: 'v1',
      required_device_roles: [{ role: 'scanner', min_count: 1 }],
      event_source_roles: {},
      command_target_roles: {},
      supported_events: [],
      supported_commands: []
    })
  })

  it('loads workline detail once when it first syncs route selection from the list result', async () => {
    const component = await import('@/views/runtime/worklines/WorklineMonitorPage.vue')

    const wrapper = shallowMount(component.default, createMountOptions())
    mountedWrappers.push(wrapper)

    await flushViewUpdates()
    await flushViewUpdates()

    expect(routerMock.replace).toHaveBeenCalledTimes(1)
    expect(routeState.query.worklineId).toBe('101')
    expect(worklineDetailSend).toHaveBeenCalledTimes(1)
    expect(worklineDetailSend).toHaveBeenLastCalledWith(101)
  })

  it('loads device detail panel when deviceId query param is present', async () => {
    routeState.path = '/runtime/monitor'
    routeState.fullPath = '/runtime/monitor?worklineId=101&deviceId=201'
    routeState.query = {
      worklineId: '101',
      deviceId: '201'
    }

    const component = await import('@/views/runtime/worklines/WorklineMonitorPage.vue')

    const wrapper = shallowMount(component.default, createMountOptions())
    mountedWrappers.push(wrapper)

    await flushViewUpdates()
    await flushViewUpdates()

    expect(worklineDetailSend).toHaveBeenCalledTimes(1)
    expect(worklineDetailSend).toHaveBeenLastCalledWith(101)
    const liveOverview = wrapper.findComponent({ name: 'WorklineLiveOverview' })
    expect(liveOverview.exists()).toBe(true)
    expect(liveOverview.props('selectedDeviceId')).toBe(201)

    await liveOverview.vm.$emit('select-device', 201)
    expect(routerMock.push).toHaveBeenLastCalledWith({
      name: 'RuntimeDevices',
      query: { deviceId: '201' }
    })
  })

  it('refreshes the current workline detail when a relevant SSE detail event arrives', async () => {
    routeState.path = '/runtime/monitor'
    routeState.fullPath = '/runtime/monitor?worklineId=101'
    routeState.query = {
      worklineId: '101'
    }

    const component = await import('@/views/runtime/worklines/WorklineMonitorPage.vue')

    const wrapper = shallowMount(component.default, createMountOptions())
    mountedWrappers.push(wrapper)

    await flushViewUpdates()
    await flushViewUpdates()

    expect(worklineDetailSend).toHaveBeenCalledTimes(1)

    sseStoreMock.lastEvent = {
      domain: 'runtime',
      entity: 'device',
      action: 'updated',
      keys: { workline_id: 101, device_id: 201 }
    }
    await flushViewUpdates()
    await flushViewUpdates()

    expect(worklineDetailSend).toHaveBeenCalledTimes(2)
    expect(worklineDetailSend).toHaveBeenLastCalledWith(101)
  })
})
