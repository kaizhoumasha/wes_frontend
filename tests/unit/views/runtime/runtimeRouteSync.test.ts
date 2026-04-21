import { nextTick, reactive, ref } from 'vue'
import { shallowMount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

type RouteState = {
  path: string
  fullPath: string
  query: Record<string, unknown>
}

const routeState = reactive<RouteState>({
  path: '/runtime/worklines',
  fullPath: '/runtime/worklines',
  query: {}
})

const routerMock = {
  push: vi.fn(),
  replace: vi.fn(async ({ query }: { query: Record<string, unknown> }) => {
    routeState.query = { ...query }
    return undefined
  })
}

const worklinesSend = vi.fn()
const worklineDetailSend = vi.fn()
const devicesSend = vi.fn()
const deviceDetailSend = vi.fn()

vi.mock('vue-router', () => ({
  useRoute: () => routeState,
  useRouter: () => routerMock
}))

vi.mock('@/composables/useRuntimePageChrome', () => ({
  useRuntimePageChrome: () => ({
    connectionLabel: ref('SSE Connected'),
    connectionTone: ref('success'),
    lastEvent: ref(null),
    lastRefreshedAt: ref(null),
    live: ref(true),
    markRefreshedAt: vi.fn(),
    state: ref('connected'),
    toggleLive: vi.fn()
  })
}))

vi.mock('@/composables/usePermission', () => ({
  usePermission: () => ({
    hasPermission: () => true
  })
}))

vi.mock('@/utils/runtime-display', () => ({
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
  resolveRuntimeTone: () => 'info',
  sortByScoreDesc: <T>(items: T[]) => [...items]
}))

vi.mock('@/api/modules/runtime', () => ({
  runtimeApiMethods: {
    worklines: () => ({ send: worklinesSend }),
    worklineDetail: (worklineId: number) => ({
      send: () => worklineDetailSend(worklineId)
    }),
    devices: (worklineId: number) => ({
      send: () => devicesSend(worklineId)
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
  owner_team: 'runtime',
  support_contact: 'ops',
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
    devices: [],
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
        'el-switch': true
      }
    }
  }
}

describe('runtime route sync', () => {
  beforeEach(() => {
    routeState.path = '/runtime/worklines'
    routeState.fullPath = '/runtime/worklines'
    routeState.query = {}

    routerMock.push.mockReset()
    routerMock.replace.mockClear()

    worklinesSend.mockReset()
    worklineDetailSend.mockReset()
    devicesSend.mockReset()
    deviceDetailSend.mockReset()

    worklinesSend.mockResolvedValue([worklineSummary])
    worklineDetailSend.mockImplementation(async (worklineId: number) => createWorklineDetail(worklineId))
    devicesSend.mockImplementation(async () => deviceRows)
    deviceDetailSend.mockImplementation(async (deviceId: number, worklineId: number) => createDeviceDetail(deviceId, worklineId))
  })

  it('loads workline detail once when it first syncs route selection from the list result', async () => {
    const component = await import('@/views/runtime/worklines/WorklineRuntimePage.vue')

    shallowMount(component.default, createMountOptions())

    await flushViewUpdates()
    await flushViewUpdates()

    expect(routerMock.replace).toHaveBeenCalledTimes(1)
    expect(routeState.query.worklineId).toBe('101')
    expect(worklineDetailSend).toHaveBeenCalledTimes(1)
    expect(worklineDetailSend).toHaveBeenLastCalledWith(101)
  })

  it('loads device detail once per route device change instead of preloading before sync', async () => {
    routeState.path = '/runtime/devices'
    routeState.fullPath = '/runtime/devices?worklineId=101&deviceId=201'
    routeState.query = {
      worklineId: '101',
      deviceId: '201'
    }

    const component = await import('@/views/runtime/devices/DeviceRuntimePage.vue')

    shallowMount(component.default, createMountOptions())

    await flushViewUpdates()
    await flushViewUpdates()
    expect(deviceDetailSend).toHaveBeenCalledTimes(1)
    expect(deviceDetailSend).toHaveBeenLastCalledWith(201, 101)

    routeState.query = {
      ...routeState.query,
      deviceId: '202'
    }

    await flushViewUpdates()
    expect(deviceDetailSend).toHaveBeenCalledTimes(2)
    expect(deviceDetailSend).toHaveBeenLastCalledWith(202, 101)
  })
})
