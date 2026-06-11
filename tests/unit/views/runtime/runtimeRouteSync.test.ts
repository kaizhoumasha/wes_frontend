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
const worklineProjectionSend = vi.fn()
const deviceDetailSend = vi.fn()
const worklinePluginManifestSend = vi.fn()
const resolveRuntimeReconciliationSend = vi.fn()
const darkModeMock = vi.hoisted(() => ({
  isDark: { value: false, __v_isRef: true },
  toggle: vi.fn()
}))
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

vi.mock('@/composables/useDarkMode', () => ({
  useDarkMode: () => darkModeMock
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
    worklineProjection: (worklineId: number) => ({
      send: () => worklineProjectionSend(worklineId)
    }),
    worklinePluginManifest: () => ({
      send: worklinePluginManifestSend
    }),
    deviceDetail: (deviceId: number, worklineId: number) => ({
      send: () => deviceDetailSend(deviceId, worklineId)
    }),
    resolveRuntimeReconciliation: (sessionId: number, payload: Record<string, unknown>) => ({
      send: () => resolveRuntimeReconciliationSend(sessionId, payload)
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

function createWorklineProjection(
  id: number,
  pendingReconciliation: Record<string, unknown> | null = null
) {
  return {
    summary: { ...worklineSummary, id, line_code: `WL-${id}`, line_name: `Workline ${id}` },
    boundary: {
      workline_readiness: 'READY',
      station_lease: 'IDLE',
      single_layer_rack_snapshot: 'ACTIVE',
      rack_operation_wait: 'NONE',
      resource_evidence_kind: 'WES_ACTIVE_SNAPSHOT'
    },
    device_nodes: deviceRows
      .filter(d => d.workline_id === id)
      .map(d => ({
        id: d.id,
        device_code: d.device_code,
        device_name: d.device_name,
        device_role: d.device_role,
        role_index: d.role_index,
        device_status: d.device_status,
        maintenance_mode: d.maintenance_mode,
        pending_command_count: d.pending_command_count,
        open_command_count: 0,
        blocked_outbox_count: 0,
        open_issue_count: d.error_code ? 1 : 0,
        active_runtime_hold_ids: []
      })),
    active_sessions: {
      items: [],
      total_count: 0,
      truncated: false
    },
    recent_failed_traces: {
      items: [],
      total_count: 0,
      truncated: false
    },
    recent_completed_traces: {
      items: [],
      total_count: 0,
      truncated: false
    },
    resource_evidence: {
      items: [
        {
          resource_kind: 'RACK',
          resource_code: 'RACK-101',
          display_label: 'Rack RACK-101',
          evidence_kind: 'WES_ACTIVE_SNAPSHOT',
          station_code: 'TARGET_ARM',
          position_code: 'SINGLE_LAYER_A',
          rack_code: 'RACK-101'
        },
        {
          resource_kind: 'BIN',
          resource_code: 'BIN-101',
          display_label: 'Bin BIN-101',
          evidence_kind: 'WMS_CALLBACK_EVIDENCE',
          station_code: 'TARGET_ARM',
          position_code: 'SINGLE_LAYER_A',
          rack_code: 'RACK-101',
          bin_code: 'BIN-101',
          cell_code: 'CELL-A1'
        }
      ],
      total_count: 2,
      truncated: false
    },
    action_candidates: {
      pending_reconciliation: pendingReconciliation
    },
    generated_at: '2026-06-10T12:00:00Z'
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
        'el-card': { template: '<section><slot name="header" /><slot /></section>' },
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
    darkModeMock.isDark.value = false
    darkModeMock.toggle.mockClear()

    worklinesSend.mockReset()
    worklineProjectionSend.mockReset()
    deviceDetailSend.mockReset()
    worklinePluginManifestSend.mockReset()
    resolveRuntimeReconciliationSend.mockReset()

    worklinesSend.mockResolvedValue([worklineSummary])
    worklineProjectionSend.mockImplementation(async (worklineId: number) =>
      createWorklineProjection(worklineId)
    )
    deviceDetailSend.mockImplementation(async (deviceId: number, worklineId: number) =>
      createDeviceDetail(deviceId, worklineId)
    )
    resolveRuntimeReconciliationSend.mockResolvedValue({})
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

  it('loads workline projection once when it first syncs route selection from the list result', async () => {
    const component = await import('@/views/runtime/worklines/WorklineMonitorPage.vue')

    const wrapper = shallowMount(component.default, createMountOptions())
    mountedWrappers.push(wrapper)

    await flushViewUpdates()
    await flushViewUpdates()

    expect(routerMock.replace).toHaveBeenCalledTimes(1)
    expect(routeState.query.worklineId).toBe('101')
    expect(worklineProjectionSend).toHaveBeenCalledTimes(1)
    expect(worklineProjectionSend).toHaveBeenLastCalledWith(101)
  })

  it('keeps the monitor route isolated from the shared topology component', async () => {
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

    expect(wrapper.findComponent({ name: 'WorklineLiveOverview' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'RuntimeSceneDeviceFlow' }).exists()).toBe(false)
  })

  it('keeps action panels separated from the live overview on the monitor page', async () => {
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

    const liveColumn = wrapper.find('.monitor-layout__live')
    const actionCabin = wrapper.find('.monitor-layout__actions')

    expect(liveColumn.exists()).toBe(true)
    expect(actionCabin.exists()).toBe(true)
    expect(liveColumn.findComponent({ name: 'WorklineLiveOverview' }).exists()).toBe(true)
    expect(actionCabin.findComponent({ name: 'WorklineLiveOverview' }).exists()).toBe(false)
    expect(actionCabin.find('[data-test="monitor-no-reconciliation"]').exists()).toBe(true)
    expect(actionCabin.find('[data-test="monitor-refresh-projection"]').exists()).toBe(true)
  })

  it('renders an immersive monitor top bar with theme and live controls', async () => {
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

    expect(wrapper.get('[data-test="monitor-shell-topbar"]').exists()).toBe(true)
    expect(wrapper.get('[data-test="monitor-back-overview"]').exists()).toBe(true)
    expect(wrapper.get('[data-test="monitor-theme-toggle"]').attributes('aria-pressed')).toBe(
      'false'
    )
    expect(wrapper.get('[data-test="monitor-live-toggle"]').exists()).toBe(true)
    expect(wrapper.get('[data-test="monitor-refresh-projection"]').exists()).toBe(true)

    await wrapper.get('[data-test="monitor-theme-toggle"]').trigger('click')

    expect(darkModeMock.toggle).toHaveBeenCalledTimes(1)
  })

  it('exposes monitor landmarks and mobile pane controls for line, scene, and actions', async () => {
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

    expect(wrapper.get('main[aria-label="工作线监控"]').exists()).toBe(true)
    expect(wrapper.get('aside[aria-label="工作线目录"]').exists()).toBe(true)
    expect(wrapper.get('section[aria-label="运行场景"]').exists()).toBe(true)
    expect(wrapper.get('aside[aria-label="工作线行动舱"]').exists()).toBe(true)

    expect(wrapper.get('[data-test="monitor-mobile-pane-line"]').attributes('aria-pressed')).toBe(
      'false'
    )
    expect(wrapper.get('[data-test="monitor-mobile-pane-scene"]').attributes('aria-pressed')).toBe(
      'true'
    )
    expect(
      wrapper.get('[data-test="monitor-mobile-pane-actions"]').attributes('aria-pressed')
    ).toBe('false')
    expect(wrapper.get('.monitor-layout__live').classes()).toContain('is-mobile-pane-active')

    await wrapper.get('[data-test="monitor-mobile-pane-actions"]').trigger('click')

    expect(
      wrapper.get('[data-test="monitor-mobile-pane-actions"]').attributes('aria-pressed')
    ).toBe('true')
    expect(wrapper.get('.monitor-layout__actions').classes()).toContain('is-mobile-pane-active')
    expect(wrapper.get('.monitor-layout__live').classes()).not.toContain('is-mobile-pane-active')
  })

  it('renders workline cards with design-aligned separate stats instead of a compressed hint line', async () => {
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

    const card = wrapper.get('[data-test="monitor-workline-card"]')
    expect(card.text()).toContain('Workline 101')
    expect(card.findAll('[data-test="monitor-workline-card-stat"]')).toHaveLength(4)
    expect(card.find('[data-test="monitor-workline-card-hint"]').exists()).toBe(false)
  })

  it('forwards only live SSE events into the center log console without loading history', async () => {
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

    const emptyOverview = wrapper.findComponent({ name: 'WorklineLiveOverview' })
    expect(emptyOverview.props('eventLogEntries')).toEqual([])

    sseStoreMock.lastEvent = {
      domain: 'workline_runtime',
      entity: 'device',
      action: 'estop_pressed',
      keys: {
        workline_id: 101,
        device_code: 'ST-02'
      },
      payload: {
        error_code: 'ERR_CONVEYOR_JAM_102'
      }
    }

    await flushViewUpdates()
    await flushViewUpdates()

    const liveOverview = wrapper.findComponent({ name: 'WorklineLiveOverview' })
    expect(liveOverview.props('eventLogEntries')).toEqual([
      expect.objectContaining({
        level: 'err',
        tag: 'ERROR',
        text: expect.stringContaining('ST-02')
      })
    ])
  })

  it('force reloads the current projection from the stable action cabin refresh', async () => {
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

    expect(worklineProjectionSend).toHaveBeenCalledTimes(1)

    await wrapper.find('[data-test="monitor-refresh-projection"]').trigger('click')
    await flushViewUpdates()
    await flushViewUpdates()

    expect(worklineProjectionSend).toHaveBeenCalledTimes(2)
    expect(worklineProjectionSend).toHaveBeenLastCalledWith(101)
  })

  it('loads the selected device panel and keeps device selection on the monitor route', async () => {
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

    expect(worklineProjectionSend).toHaveBeenCalledTimes(1)
    expect(worklineProjectionSend).toHaveBeenLastCalledWith(101)
    const liveOverview = wrapper.findComponent({ name: 'WorklineLiveOverview' })
    expect(liveOverview.exists()).toBe(true)
    expect(liveOverview.props('selectedDeviceId')).toBe(201)
    expect(wrapper.get('[data-test="monitor-selected-device-panel"]').text()).toContain(
      'Device 201'
    )

    await liveOverview.vm.$emit('select-device', 201)
    expect(routerMock.push).toHaveBeenLastCalledWith({
      query: {
        worklineId: '101',
        deviceId: '201'
      }
    })
  })

  it('moves raw device role and rack projection details into the right-side business association tab', async () => {
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

    expect(wrapper.get('[data-test="monitor-side-tab-control"]').text()).toContain('诊断与控制')
    expect(wrapper.get('[data-test="monitor-side-tab-business"]').text()).toContain('业务关联投影')

    await wrapper.get('[data-test="monitor-side-tab-business"]').trigger('click')

    const businessPanel = wrapper.get('[data-test="monitor-business-projection"]')
    expect(businessPanel.text()).toContain('scanner')
    expect(businessPanel.text()).toContain('单层货架')
    expect(businessPanel.text()).toContain('RACK-101')
    expect(businessPanel.text()).toContain('BIN-101')
    expect(businessPanel.text()).toContain('执行快照')
    expect(wrapper.find('[data-test="monitor-device-control-panel"]').exists()).toBe(false)
  })

  it('refreshes the current workline projection when a relevant SSE projection event arrives', async () => {
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

    expect(worklineProjectionSend).toHaveBeenCalledTimes(1)

    sseStoreMock.lastEvent = {
      domain: 'workline_runtime',
      entity: 'device',
      action: 'updated',
      keys: { workline_id: 101, device_id: 201 }
    }
    await flushViewUpdates()
    await flushViewUpdates()

    expect(worklineProjectionSend).toHaveBeenCalledTimes(2)
    expect(worklineProjectionSend).toHaveBeenLastCalledWith(101)
  })

  it('drives reconciliation resolve from the monitor projection candidate', async () => {
    routeState.path = '/runtime/monitor'
    routeState.fullPath = '/runtime/monitor?worklineId=101'
    routeState.query = {
      worklineId: '101'
    }

    const pendingReconciliation = {
      session_id: 909,
      session_code: 'S-909',
      trace_id: 'TRACE-909',
      request_id: 'REQ-909',
      reason: 'CALLBACK_DEADLINE_EXPIRED',
      source_kind: 'WMS_CALLBACK',
      device_id: 201,
      command_id: 301,
      wait_token: 'WAIT-909',
      occurred_at: '2026-06-10T11:59:00Z',
      deadline_at: '2026-06-10T12:00:00Z',
      late_evidence_received: false
    }
    const projection = createWorklineProjection(101, pendingReconciliation)
    worklineProjectionSend.mockResolvedValue(projection)

    const component = await import('@/views/runtime/worklines/WorklineMonitorPage.vue')

    const wrapper = shallowMount(component.default, createMountOptions())
    mountedWrappers.push(wrapper)

    await flushViewUpdates()
    await flushViewUpdates()

    const reconciliationPanel = wrapper.findComponent({ name: 'WorklineReconciliationPanel' })
    expect(reconciliationPanel.exists()).toBe(true)
    expect(reconciliationPanel.props('candidate')).toEqual(pendingReconciliation)

    await reconciliationPanel.vm.$emit('resolve', {
      sessionId: 909,
      resolution: 'FAILED',
      checks: { device_inspected: true },
      operatorNote: '现场确认失败',
      resultPayload: null
    })
    await flushViewUpdates()
    await flushViewUpdates()

    expect(resolveRuntimeReconciliationSend).toHaveBeenCalledTimes(1)
    expect(resolveRuntimeReconciliationSend).toHaveBeenCalledWith(
      909,
      expect.objectContaining({
        resolution: 'FAILED',
        checks: { device_inspected: true },
        operator_note: '现场确认失败',
        result_payload: null,
        confirmed_at: expect.any(String)
      })
    )
    expect(worklineProjectionSend).toHaveBeenCalledTimes(2)
    expect(worklinesSend).toHaveBeenCalledTimes(2)
  })

  it('force reloads the current projection from the safety panel refresh action', async () => {
    routeState.path = '/runtime/monitor'
    routeState.fullPath = '/runtime/monitor?worklineId=101'
    routeState.query = {
      worklineId: '101'
    }
    worklinesSend.mockResolvedValue([{ ...worklineSummary, active_safety_incident_id: 88 }])
    worklineProjectionSend.mockImplementation(async (worklineId: number) => ({
      ...createWorklineProjection(worklineId),
      summary: {
        ...worklineSummary,
        id: worklineId,
        line_code: `WL-${worklineId}`,
        line_name: `Workline ${worklineId}`,
        active_safety_incident_id: 88
      }
    }))

    const component = await import('@/views/runtime/worklines/WorklineMonitorPage.vue')

    const wrapper = shallowMount(component.default, createMountOptions())
    mountedWrappers.push(wrapper)

    await flushViewUpdates()
    await flushViewUpdates()

    const safetyPanel = wrapper.findComponent({ name: 'WorklineSafetyIncidentPanel' })
    expect(safetyPanel.exists()).toBe(true)
    expect(worklineProjectionSend).toHaveBeenCalledTimes(1)

    await safetyPanel.vm.$emit('refresh')
    await flushViewUpdates()
    await flushViewUpdates()

    expect(worklineProjectionSend).toHaveBeenCalledTimes(2)
    expect(worklineProjectionSend).toHaveBeenLastCalledWith(101)
  })
})
