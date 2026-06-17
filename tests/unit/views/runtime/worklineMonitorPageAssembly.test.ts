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
const clearEstopSend = vi.fn()
const resolveRuntimeReconciliationSend = vi.fn()
const runtimeEnterMaintenanceSend = vi.fn()
const runtimeExitMaintenanceSend = vi.fn()

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
  compactEnumLabel: (value?: string | null) => value ?? '—',
  formatRuntimeDateTime: (value?: string | null) => value ?? '—',
  formatRuntimeDurationMs: (value?: number | null) => (value == null ? '—' : `${value} ms`),
  formatRuntimeElapsed: () => '1m',
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
    clearEstop: (worklineId: number, payload: Record<string, unknown>) => ({
      send: () => clearEstopSend(worklineId, payload)
    }),
    resolveRuntimeReconciliation: (sessionId: number, payload: Record<string, unknown>) => ({
      send: () => resolveRuntimeReconciliationSend(sessionId, payload)
    })
  }
}))

vi.mock('element-plus', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('element-plus')
  return {
    ...actual,
    ElMessage: { success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() },
    ElMessageBox: {
      confirm: vi.fn(async () => undefined),
      alert: vi.fn(async () => undefined),
      prompt: vi.fn(async () => ({ value: '' }))
    }
  }
})

vi.mock('@/api/modules/devices', () => ({
  devicesApiMethods: {
    runtimeEnterMaintenance: (params: { id: number }, payload: Record<string, unknown>) => ({
      send: () => runtimeEnterMaintenanceSend(params, payload)
    }),
    runtimeExitMaintenance: (params: { id: number }, payload: Record<string, unknown>) => ({
      send: () => runtimeExitMaintenanceSend(params, payload)
    })
  }
}))

const worklineSummary = {
  id: 301,
  line_code: 'WL-301',
  line_name: 'Workline 301',
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

function createDeviceRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 401,
    device_code: 'DV-401',
    device_name: 'Device 401',
    device_role: 'scanner',
    role_index: 1,
    workline_id: 301,
    workline_name: 'Workline 301',
    workline_code: 'WL-301',
    device_status: 'ONLINE',
    maintenance_mode: false,
    current_command_id: null,
    pending_command_count: 0,
    last_heartbeat_at: '2026-04-21T00:00:00Z',
    recent_callback_at: '2026-04-21T00:00:00Z',
    error_code: null,
    open_command_count: 0,
    blocked_outbox_count: 0,
    open_issue_count: 0,
    active_runtime_hold_ids: [],
    current_command: null,
    ...overrides
  }
}

function createProjection(
  worklineId: number,
  options: {
    pendingReconciliation?: Record<string, unknown> | null
    device?: Record<string, unknown>
    activeSessionItems?: Array<Record<string, unknown>>
    rackEvidence?: Array<Record<string, unknown>>
  } = {}
) {
  const device = createDeviceRow(options.device ?? {})
  return {
    summary: { ...worklineSummary, id: worklineId, line_code: `WL-${worklineId}`, line_name: `Workline ${worklineId}` },
    boundary: {
      workline_readiness: 'READY',
      station_lease: 'IDLE',
      single_layer_rack_snapshot: 'ACTIVE',
      rack_operation_wait: 'NONE',
      resource_evidence_kind: 'WES_ACTIVE_SNAPSHOT'
    },
    device_nodes: [device],
    active_sessions: {
      items: options.activeSessionItems ?? [],
      total_count: options.activeSessionItems?.length ?? 0,
      truncated: false
    },
    recent_failed_traces: { items: [], total_count: 0, truncated: false },
    recent_completed_traces: { items: [], total_count: 0, truncated: false },
    resource_evidence: {
      items: options.rackEvidence ?? [],
      total_count: options.rackEvidence?.length ?? 0,
      truncated: false
    },
    action_candidates: {
      pending_reconciliation: options.pendingReconciliation ?? null
    },
    generated_at: '2026-06-10T12:00:00Z'
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
      directives: { loading: {} },
      stubs: {
        transition: false,
        'el-button': true,
        'el-card': { template: '<section><slot name="header" /><slot /></section>' },
        'el-dialog': true,
        'el-input': true,
        'el-switch': true,
        RuntimeEmptyState: true,
        RuntimeLastUpdated: true,
        RuntimeStatusBadge: true,
        WorklineLiveOverview: true,
        WorklineReconciliationForm: true,
        WorklineRuntimeHoldSummaryPanel: true,
        MonitorAlertCard: {
          name: 'MonitorAlertCard',
          props: ['tone', 'title', 'message', 'source'],
          template:
            '<div data-test="monitor-alert-card" :data-tone="tone"><span data-test="monitor-alert-card-title">{{ title }}</span><span data-test="monitor-alert-card-message">{{ message }}</span><span data-test="monitor-alert-card-source">{{ source }}</span></div>'
        },
        MonitorCommandChain: {
          name: 'MonitorCommandChain',
          props: ['command'],
          template: '<div data-test="monitor-command-chain" :data-has-command="!!command" />'
        },
        MonitorDeviceActionGroup: {
          name: 'MonitorDeviceActionGroup',
          props: ['mode', 'canClearEstop', 'canAttemptClear', 'canResolve', 'canManageMaintenance', 'maintenanceActive', 'busy', 'blockedReason'],
          template:
            '<div data-test="monitor-device-action-group" :data-mode="mode" :data-maintenance-active="maintenanceActive" :data-can-manage-maintenance="canManageMaintenance" :data-can-clear-estop="canClearEstop" :data-can-attempt-clear="canAttemptClear" :data-busy="busy"><button v-if="canClearEstop && canAttemptClear && !busy" data-test="action-clear-estop" @click="$emit(\'clear-estop\')" /><button data-test="action-resolve-reconciliation" @click="$emit(\'resolve-reconciliation\')" /><button v-if="canManageMaintenance" data-test="action-enter-maintenance" @click="$emit(\'enter-maintenance\')" /><button v-if="canManageMaintenance" data-test="action-exit-maintenance" @click="$emit(\'exit-maintenance\')" /></div>'
        },
        MonitorToteTwinCard: {
          name: 'MonitorToteTwinCard',
          props: ['view'],
          template: '<div data-test="monitor-tote-twin-card" :data-lpn="view?.lpn ?? null" />'
        },
        MonitorRackOccupancyMatrix: {
          name: 'MonitorRackOccupancyMatrix',
          props: ['view', 'selectedSlotKey'],
          template:
            '<div data-test="monitor-rack-occupancy-matrix" :data-rack-code="view?.rackCode ?? null" :data-slot-count="view?.slotGroups?.reduce((acc, g) => acc + g.cells.length, 0) ?? 0" :data-cell-codes="view?.slotGroups?.flatMap(g => g.cells.map(c => c.code)).join(\',\') ?? \'\'" :data-selected-slot-key="selectedSlotKey === null || selectedSlotKey === undefined ? \'null\' : selectedSlotKey"><button data-test="rack-slot-cell-1" @click="$emit(\'select\', \'cell-1\')" /><button data-test="rack-slot-cell-2" @click="$emit(\'select\', \'cell-2\')" /></div>'
        }
      }
    }
  }
}

async function mountWithQuery(
  worklineId: number,
  deviceId?: number,
  options: { worklines?: Array<Record<string, unknown>> } = {}
) {
  routeState.path = '/runtime/monitor'
  routeState.fullPath = deviceId
    ? `/runtime/monitor?worklineId=${worklineId}&deviceId=${deviceId}`
    : `/runtime/monitor?worklineId=${worklineId}`
  routeState.query = {
    worklineId: String(worklineId),
    ...(deviceId ? { deviceId: String(deviceId) } : {})
  }
  worklinesSend.mockResolvedValue(options.worklines ?? [worklineSummary])
  const component = await import('@/views/runtime/worklines/WorklineMonitorPage.vue')
  const wrapper = shallowMount(component.default, createMountOptions())
  mountedWrappers.push(wrapper)
  await flushViewUpdates()
  await flushViewUpdates()
  return wrapper
}

describe('WorklineMonitorPage assembly (T10)', () => {
  afterEach(() => {
    for (const wrapper of mountedWrappers.splice(0)) {
      wrapper.unmount()
    }
    worklinesSend.mockReset()
    worklineProjectionSend.mockReset()
    clearEstopSend.mockReset()
    resolveRuntimeReconciliationSend.mockReset()
    runtimeEnterMaintenanceSend.mockReset()
    runtimeExitMaintenanceSend.mockReset()
    sseStoreMock.lastEvent = null
  })

  beforeEach(() => {
    setActivePinia(createPinia())
    routeState.path = '/runtime/monitor'
    routeState.fullPath = '/runtime/monitor'
    routeState.query = {}
  })

  it('renders AlertCard (danger) + CommandChain + ActionGroup (mode=estop) for an estopped workline', async () => {
    worklineProjectionSend.mockResolvedValue(
      createProjection(301, {
        device: {
          current_command: {
            id: 501,
            command_code: 'CMD-ESTOP-1',
            status: 'ACKED',
            sent_at: '2026-06-10T12:00:00Z',
            ack_received_at: '2026-06-10T12:00:01Z',
            ack_code: 0,
            ack_message: 'ack'
          }
        }
      })
    )
    // re-render after stub: also set the summary runtime_status=ESTOPPED so
    // the safety verdict produces estop mode for the action group.
    worklineProjectionSend.mockImplementation(async (id: number) => ({
      ...createProjection(id, {
        device: {
          current_command: {
            id: 501,
            command_code: 'CMD-ESTOP-1',
            status: 'ACKED',
            sent_at: '2026-06-10T12:00:00Z',
            ack_received_at: '2026-06-10T12:00:01Z',
            ack_code: 0,
            ack_message: 'ack'
          }
        }
      }),
      summary: {
        ...worklineSummary,
        id,
        runtime_status: 'ESTOPPED',
        stopped_reason: '现场急停按钮被按下',
        active_safety_incident_id: 1
      }
    }))

    const wrapper = await mountWithQuery(301, 401)

    const alertCard = wrapper.find('[data-test="monitor-alert-card"]')
    expect(alertCard.exists()).toBe(true)
    expect(alertCard.attributes('data-tone')).toBe('danger')
    expect(wrapper.find('[data-test="monitor-alert-card-title"]').text()).toBe('WORKLINE_ESTOPPED')

    const commandChain = wrapper.find('[data-test="monitor-command-chain"]')
    expect(commandChain.exists()).toBe(true)
    expect(commandChain.attributes('data-has-command')).toBe('true')

    const actionGroup = wrapper.find('[data-test="monitor-device-action-group"]')
    expect(actionGroup.exists()).toBe(true)
    expect(actionGroup.attributes('data-mode')).toBe('estop')
  })

  it('renders AlertCard (warning) + ActionGroup (mode=reconciliation) when a candidate is pending', async () => {
    const pendingReconciliation = {
      session_id: 909,
      session_code: 'SESS-909',
      reason: 'RACK_MISMATCH',
      occurred_at: '2026-06-10T12:00:00Z'
    }
    worklineProjectionSend.mockResolvedValue(
      createProjection(301, { pendingReconciliation })
    )

    const wrapper = await mountWithQuery(301, 401)

    const alertCard = wrapper.find('[data-test="monitor-alert-card"]')
    expect(alertCard.exists()).toBe(true)
    expect(alertCard.attributes('data-tone')).toBe('warning')
    expect(wrapper.find('[data-test="monitor-alert-card-title"]').text()).toBe('RACK_MISMATCH')

    const actionGroup = wrapper.find('[data-test="monitor-device-action-group"]')
    expect(actionGroup.exists()).toBe(true)
    expect(actionGroup.attributes('data-mode')).toBe('reconciliation')
  })

  it('routes ActionGroup clear-estop to runtimeApiMethods.clearEstop', async () => {
    worklineProjectionSend.mockResolvedValue(
      createProjection(301, {
        device: {
          current_command: {
            id: 501,
            command_code: 'CMD-ESTOP-1',
            status: 'ACKED',
            sent_at: '2026-06-10T12:00:00Z',
            ack_received_at: '2026-06-10T12:00:01Z',
            ack_code: 0,
            ack_message: 'ack'
          }
        }
      })
    )
    worklineProjectionSend.mockImplementation(async (id: number) => ({
      ...createProjection(id),
      summary: { ...worklineSummary, id, runtime_status: 'ESTOPPED', active_safety_incident_id: 1 }
    }))

    const wrapper = await mountWithQuery(301, 401)

    await wrapper.find('[data-test="action-clear-estop"]').trigger('click')
    await flushViewUpdates()

    expect(clearEstopSend).toHaveBeenCalledWith(
      301,
      expect.objectContaining({
        reason: expect.any(String),
        checks: expect.objectContaining({
          estop_button_reset: true,
          area_safe: true,
          devices_reset: true,
          operator_confirmed: true
        })
      })
    )
  })

  it('keeps workline estop recovery visible without a selected device', async () => {
    worklineProjectionSend.mockImplementation(async (id: number) => ({
      ...createProjection(id),
      summary: {
        ...worklineSummary,
        id,
        runtime_status: 'ESTOPPED',
        stopped_reason: '现场急停按钮被按下',
        active_safety_incident_id: 1
      }
    }))

    const wrapper = await mountWithQuery(301)

    expect(wrapper.find('[data-test="monitor-selected-device-panel"]').exists()).toBe(false)
    const actionGroup = wrapper.find('[data-test="monitor-device-action-group"]')
    expect(actionGroup.exists()).toBe(true)
    expect(actionGroup.attributes('data-mode')).toBe('estop')
    expect(actionGroup.attributes('data-can-manage-maintenance')).toBe('false')
    expect(actionGroup.attributes('data-can-clear-estop')).toBe('true')
    expect(actionGroup.attributes('data-can-attempt-clear')).toBe('true')
    expect(actionGroup.attributes('data-busy')).toBe('false')
    expect(wrapper.find('[data-test="action-enter-maintenance"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="action-exit-maintenance"]').exists()).toBe(false)

    await wrapper.find('[data-test="action-clear-estop"]').trigger('click')
    await flushViewUpdates()

    expect(clearEstopSend).toHaveBeenCalledWith(
      301,
      expect.objectContaining({
        reason: expect.any(String)
      })
    )
    expect(runtimeEnterMaintenanceSend).not.toHaveBeenCalled()
    expect(runtimeExitMaintenanceSend).not.toHaveBeenCalled()
  })

  it('routes ActionGroup enter-maintenance to devicesApiMethods.runtimeEnterMaintenance with selectedDeviceId', async () => {
    worklineProjectionSend.mockResolvedValue(createProjection(301))

    const wrapper = await mountWithQuery(301, 401)

    await wrapper.find('[data-test="action-enter-maintenance"]').trigger('click')
    await flushViewUpdates()

    expect(runtimeEnterMaintenanceSend).toHaveBeenCalledWith(
      { id: 401 },
      expect.objectContaining({ reason: expect.any(String) })
    )
  })

  it('routes ActionGroup exit-maintenance to devicesApiMethods.runtimeExitMaintenance with selectedDeviceId', async () => {
    worklineProjectionSend.mockResolvedValue(
      createProjection(301, { device: { maintenance_mode: true } })
    )

    const wrapper = await mountWithQuery(301, 401)

    await wrapper.find('[data-test="action-exit-maintenance"]').trigger('click')
    await flushViewUpdates()

    expect(runtimeExitMaintenanceSend).toHaveBeenCalledWith(
      { id: 401 },
      expect.objectContaining({ reason: expect.any(String) })
    )
  })

  it('drops the per-device tote-twin card from the business panel (panelMode is rack-position-driven now)', async () => {
    const activeSessionItems = [
      {
        session_id: 909,
        session_code: 'SESS-909',
        workline_id: 301,
        device_id: 401,
        device_code: 'DV-401',
        status: 'ACTIVE',
        current_wait_type: 'WAITING_WMS',
        is_timed_out: false,
        failure_code: null,
        latest_timeline_message: '最新事件',
        latest_timeline_action: 'INSPECT',
        started_at: '2026-06-10T12:00:00Z'
      }
    ]
    worklineProjectionSend.mockResolvedValue(
      createProjection(301, { activeSessionItems })
    )

    const wrapper = await mountWithQuery(301, 401)
    // No more business tab to click; panel-mode auto-resolves to 'control' for a selected device.
    expect(wrapper.find('[data-test="monitor-side-tab-business"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="monitor-side-tab-control"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="monitor-selected-device-panel"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="monitor-tote-twin-card"]').exists()).toBe(false)
  })

  it('renders MonitorRackOccupancyMatrix in the business panel after selecting a rack position', async () => {
    const rackEvidence = [
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
      },
      {
        resource_kind: 'CELL',
        resource_code: 'CELL-A1',
        display_label: 'Cell CELL-A1',
        evidence_kind: 'WES_ACTIVE_SNAPSHOT',
        station_code: 'TARGET_ARM',
        position_code: 'SINGLE_LAYER_A',
        rack_code: 'RACK-101',
        slot_code: 'A',
        bin_code: 'BIN-101',
        cell_code: 'CELL-A1'
      }
    ]
    worklineProjectionSend.mockResolvedValue(createProjection(301, { rackEvidence }))

    const wrapper = await mountWithQuery(301, 401)
    const overview = wrapper.findComponent({ name: 'WorklineLiveOverview' })
    overview.vm.$emit('selectRackPosition', 'RACK-101')
    await flushViewUpdates()

    const businessPanel = wrapper.find('[data-test="monitor-rack-position-panel"]')
    expect(businessPanel.exists()).toBe(true)

    const matrix = wrapper.find('[data-test="monitor-rack-occupancy-matrix"]')
    expect(matrix.exists()).toBe(true)
    expect(Number(matrix.attributes('data-slot-count'))).toBe(1)
  })

  it('filters rack occupancy to the selected rack position', async () => {
    const rackEvidence = [
      {
        resource_kind: 'BIN',
        resource_code: 'BIN-101',
        display_label: 'Bin BIN-101',
        evidence_kind: 'WES_ACTIVE_SNAPSHOT',
        rack_code: 'RACK-101',
        bin_code: 'BIN-101',
        cell_code: 'CELL-101-A'
      },
      {
        resource_kind: 'CELL',
        resource_code: 'CELL-101-A',
        display_label: 'Cell CELL-101-A',
        evidence_kind: 'WES_ACTIVE_SNAPSHOT',
        rack_code: 'RACK-101',
        slot_code: 'A',
        bin_code: 'BIN-101',
        cell_code: 'CELL-101-A'
      },
      {
        resource_kind: 'BIN',
        resource_code: 'BIN-202',
        display_label: 'Bin BIN-202',
        evidence_kind: 'WES_ACTIVE_SNAPSHOT',
        rack_code: 'RACK-202',
        bin_code: 'BIN-202',
        cell_code: 'CELL-202-A'
      },
      {
        resource_kind: 'CELL',
        resource_code: 'CELL-202-A',
        display_label: 'Cell CELL-202-A',
        evidence_kind: 'WES_ACTIVE_SNAPSHOT',
        rack_code: 'RACK-202',
        slot_code: 'A',
        bin_code: 'BIN-202',
        cell_code: 'CELL-202-A'
      }
    ]
    worklineProjectionSend.mockResolvedValue(createProjection(301, { rackEvidence }))

    const wrapper = await mountWithQuery(301, 401)
    const overview = wrapper.findComponent({ name: 'WorklineLiveOverview' })
    overview.vm.$emit('selectRackPosition', 'RACK-101')
    await flushViewUpdates()

    const matrix = wrapper.find('[data-test="monitor-rack-occupancy-matrix"]')
    expect(matrix.exists()).toBe(true)
    expect(matrix.attributes('data-rack-code')).toBe('RACK-101')
    expect(matrix.attributes('data-cell-codes')).toBe('CELL-101-A')
    expect(matrix.attributes('data-cell-codes')).not.toContain('CELL-202-A')
  })

  it('shows the existing empty rack hint when the selected rack has no cell evidence', async () => {
    const rackEvidence = [
      {
        resource_kind: 'CELL',
        resource_code: 'CELL-202-A',
        display_label: 'Cell CELL-202-A',
        evidence_kind: 'WES_ACTIVE_SNAPSHOT',
        rack_code: 'RACK-202',
        slot_code: 'A',
        bin_code: 'BIN-202',
        cell_code: 'CELL-202-A'
      }
    ]
    worklineProjectionSend.mockResolvedValue(createProjection(301, { rackEvidence }))

    const wrapper = await mountWithQuery(301, 401)
    const overview = wrapper.findComponent({ name: 'WorklineLiveOverview' })
    overview.vm.$emit('selectRackPosition', 'RACK-101')
    await flushViewUpdates()

    expect(wrapper.find('[data-test="monitor-rack-occupancy-matrix"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="monitor-business-projection"]').text()).toContain(
      '选中货位暂无库存投影数据。'
    )
  })

  it('shows a truncation hint instead of an empty hint when selected rack evidence may be beyond the loaded slice', async () => {
    const rackEvidence = [
      {
        resource_kind: 'CELL',
        resource_code: 'CELL-202-A',
        display_label: 'Cell CELL-202-A',
        evidence_kind: 'WES_ACTIVE_SNAPSHOT',
        rack_code: 'RACK-202',
        slot_code: 'A',
        bin_code: 'BIN-202',
        cell_code: 'CELL-202-A'
      }
    ]
    const projection = createProjection(301, { rackEvidence })
    projection.resource_evidence.truncated = true
    worklineProjectionSend.mockResolvedValue(projection)

    const wrapper = await mountWithQuery(301, 401)
    const overview = wrapper.findComponent({ name: 'WorklineLiveOverview' })
    overview.vm.$emit('selectRackPosition', 'RACK-101')
    await flushViewUpdates()

    const businessProjectionText = wrapper.find('[data-test="monitor-business-projection"]').text()
    expect(wrapper.find('[data-test="monitor-rack-occupancy-matrix"]').exists()).toBe(false)
    expect(businessProjectionText).toContain('库存投影数据已截断，无法确认该货位库存状态。')
    expect(businessProjectionText).not.toContain('选中货位暂无库存投影数据。')
  })

  it('shows a truncation hint when the loaded selected rack evidence has BIN only and no CELL evidence', async () => {
    const rackEvidence = [
      {
        resource_kind: 'BIN',
        resource_code: 'BIN-101',
        display_label: 'Bin BIN-101',
        evidence_kind: 'WES_ACTIVE_SNAPSHOT',
        rack_code: 'RACK-101',
        bin_code: 'BIN-101',
        cell_code: 'CELL-101-A'
      }
    ]
    const projection = createProjection(301, { rackEvidence })
    projection.resource_evidence.truncated = true
    worklineProjectionSend.mockResolvedValue(projection)

    const wrapper = await mountWithQuery(301, 401)
    const overview = wrapper.findComponent({ name: 'WorklineLiveOverview' })
    overview.vm.$emit('selectRackPosition', 'RACK-101')
    await flushViewUpdates()

    const businessProjectionText = wrapper.find('[data-test="monitor-business-projection"]').text()
    expect(wrapper.find('[data-test="monitor-rack-occupancy-matrix"]').exists()).toBe(false)
    expect(businessProjectionText).toContain('库存投影数据已截断，无法确认该货位库存状态。')
    expect(businessProjectionText).not.toContain('选中货位暂无库存投影数据。')
  })

  it('highlights the selected rack cell and toggles it off on second click (rack-position panelMode)', async () => {
    const rackEvidence = [
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
      },
      {
        resource_kind: 'CELL',
        resource_code: 'CELL-A1',
        display_label: 'Cell CELL-A1',
        evidence_kind: 'WES_ACTIVE_SNAPSHOT',
        station_code: 'TARGET_ARM',
        position_code: 'SINGLE_LAYER_A',
        rack_code: 'RACK-101',
        slot_code: 'A',
        bin_code: 'BIN-101',
        cell_code: 'CELL-A1'
      }
    ]
    worklineProjectionSend.mockResolvedValue(createProjection(301, { rackEvidence }))

    const wrapper = await mountWithQuery(301, 401)
    const overview = wrapper.findComponent({ name: 'WorklineLiveOverview' })
    overview.vm.$emit('selectRackPosition', 'RACK-101')
    await flushViewUpdates()

    const matrix = wrapper.find('[data-test="monitor-rack-occupancy-matrix"]')
    expect(matrix.exists()).toBe(true)
    expect(matrix.attributes('data-selected-slot-key')).toBe('null')

    await wrapper.find('[data-test="rack-slot-cell-1"]').trigger('click')
    await flushViewUpdates()
    const matrixAfterFirst = wrapper.find('[data-test="monitor-rack-occupancy-matrix"]')
    expect(matrixAfterFirst.attributes('data-selected-slot-key')).toBe('cell-1')

    // Second click on the same cell should clear the highlight
    await wrapper.find('[data-test="rack-slot-cell-1"]').trigger('click')
    await flushViewUpdates()
    const matrixAfterSecond = wrapper.find('[data-test="monitor-rack-occupancy-matrix"]')
    expect(matrixAfterSecond.attributes('data-selected-slot-key')).toBe('null')
  })

  it('panelMode = control when only a device is selected (no rack position active)', async () => {
    worklineProjectionSend.mockResolvedValue(createProjection(301))
    const wrapper = await mountWithQuery(301, 401)
    expect(wrapper.find('[data-test="monitor-selected-device-panel"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="monitor-rack-position-panel"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="monitor-panel-idle"]').exists()).toBe(false)
  })

  it('panelMode = business when a rack position is selected, hiding the device panel', async () => {
    worklineProjectionSend.mockResolvedValue(createProjection(301))
    const wrapper = await mountWithQuery(301, 401)
    const overview = wrapper.findComponent({ name: 'WorklineLiveOverview' })
    overview.vm.$emit('selectRackPosition', 'RACK-A1')
    await flushViewUpdates()
    expect(wrapper.find('[data-test="monitor-rack-position-panel"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="monitor-selected-device-panel"]').exists()).toBe(false)
  })

  it('toggling the same rack position twice returns to control panelMode for the device', async () => {
    worklineProjectionSend.mockResolvedValue(createProjection(301))
    const wrapper = await mountWithQuery(301, 401)
    const overview = wrapper.findComponent({ name: 'WorklineLiveOverview' })
    overview.vm.$emit('selectRackPosition', 'RACK-A1')
    await flushViewUpdates()
    expect(wrapper.find('[data-test="monitor-rack-position-panel"]').exists()).toBe(true)

    // Click the same rack-position again → toggle off → back to control mode
    overview.vm.$emit('selectRackPosition', 'RACK-A1')
    await flushViewUpdates()
    expect(wrapper.find('[data-test="monitor-rack-position-panel"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="monitor-selected-device-panel"]').exists()).toBe(true)
  })

  it('clears rack selection and selected cell when switching worklines', async () => {
    const worklines = [
      worklineSummary,
      {
        ...worklineSummary,
        id: 302,
        line_code: 'WL-302',
        line_name: 'Workline 302'
      }
    ]
    const rackEvidence = [
      {
        resource_kind: 'CELL',
        resource_code: 'CELL-101-A',
        display_label: 'Cell CELL-101-A',
        evidence_kind: 'WES_ACTIVE_SNAPSHOT',
        rack_code: 'RACK-101',
        slot_code: 'A',
        bin_code: 'BIN-101',
        cell_code: 'CELL-101-A'
      }
    ]
    worklineProjectionSend.mockResolvedValue(createProjection(301, { rackEvidence }))

    const wrapper = await mountWithQuery(301, 401, { worklines })
    const overview = wrapper.findComponent({ name: 'WorklineLiveOverview' })
    overview.vm.$emit('selectRackPosition', 'RACK-101')
    await flushViewUpdates()
    await wrapper.find('[data-test="rack-slot-cell-1"]').trigger('click')
    await flushViewUpdates()

    expect(wrapper.find('[data-test="monitor-rack-position-panel"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="monitor-rack-occupancy-matrix"]').attributes('data-selected-slot-key')).toBe(
      'cell-1'
    )

    const worklineCards = wrapper.findAll('[data-test="monitor-workline-card"]')
    await worklineCards[1].trigger('click')
    await flushViewUpdates()

    expect(wrapper.find('[data-test="monitor-rack-position-panel"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="monitor-selected-device-panel"]').exists()).toBe(true)
    expect(routerMock.push).toHaveBeenCalledWith({
      query: expect.objectContaining({ worklineId: '302' })
    })
  })

  it('clears rack selection when workline changes through route updates', async () => {
    const rackEvidence = [
      {
        resource_kind: 'CELL',
        resource_code: 'CELL-101-A',
        display_label: 'Cell CELL-101-A',
        evidence_kind: 'WES_ACTIVE_SNAPSHOT',
        rack_code: 'RACK-101',
        slot_code: 'A',
        bin_code: 'BIN-101',
        cell_code: 'CELL-101-A'
      }
    ]
    worklineProjectionSend.mockResolvedValue(createProjection(301, { rackEvidence }))

    const wrapper = await mountWithQuery(301, 401)
    const overview = wrapper.findComponent({ name: 'WorklineLiveOverview' })
    overview.vm.$emit('selectRackPosition', 'RACK-101')
    await flushViewUpdates()
    await wrapper.find('[data-test="rack-slot-cell-1"]').trigger('click')
    await flushViewUpdates()

    expect(wrapper.find('[data-test="monitor-rack-position-panel"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="monitor-rack-occupancy-matrix"]').attributes('data-selected-slot-key')).toBe(
      'cell-1'
    )

    routeState.fullPath = '/runtime/monitor?worklineId=302&deviceId=401'
    routeState.query = { ...routeState.query, worklineId: '302' }
    await flushViewUpdates()

    expect(wrapper.find('[data-test="monitor-rack-position-panel"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="monitor-rack-occupancy-matrix"]').exists()).toBe(false)
  })
})
