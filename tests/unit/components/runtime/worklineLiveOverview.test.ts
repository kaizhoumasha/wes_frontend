import { flushPromises, shallowMount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import WorklineLiveOverview from '@/components/runtime/monitor/WorklineLiveOverview.vue'
import type {
  RuntimeScenePluginManifestSummary,
  RuntimeWorklineDetailResponse,
  RuntimeWorklineDeviceItem,
  RuntimeWorklineSummary
} from '@/types/runtime'

const mocks = vi.hoisted(() => ({
  worklinePluginManifest: vi.fn()
}))

vi.mock('@/api/modules/runtime', () => ({
  runtimeApiMethods: {
    worklinePluginManifest: mocks.worklinePluginManifest
  }
}))

function createSummary(overrides: Partial<RuntimeWorklineSummary> = {}): RuntimeWorklineSummary {
  return {
    id: 45,
    line_code: 'WL-45',
    line_name: '粗分线',
    line_type: 'SORTING',
    plugin_key: 'rough_sorter',
    contract_version: 'v1',
    is_active: true,
    device_count: 1,
    active_session_count: 0,
    waiting_session_count: 0,
    failed_session_count: 0,
    error_device_count: 0,
    offline_device_count: 0,
    maintenance_device_count: 0,
    run_mode: 'AUTO',
    ...overrides
  }
}

function createDevice(overrides: Partial<RuntimeWorklineDeviceItem> = {}): RuntimeWorklineDeviceItem {
  return {
    id: 101,
    device_code: 'DV-101',
    device_name: '扫描设备',
    device_role: 'scanner',
    role_index: 1,
    device_status: 'ONLINE',
    maintenance_mode: false,
    pending_command_count: 0,
    ...overrides
  }
}

function createDetail(): RuntimeWorklineDetailResponse {
  return {
    summary: createSummary(),
    devices: [createDevice()],
    active_sessions: [],
    recent_failed_traces: [],
    recent_completed_traces: []
  }
}

const manifest: RuntimeScenePluginManifestSummary = {
  plugin_key: 'rough_sorter',
  contract_version: 'v1',
  required_device_roles: [
    { role: 'scanner', min_count: 1 },
    { role: 'arm', min_count: 1 }
  ],
  event_source_roles: { SCAN_DONE: ['scanner'] },
  command_target_roles: { MOVE_ARM: ['arm'] },
  supported_events: ['SCAN_DONE'],
  supported_commands: ['MOVE_ARM']
}

describe('WorklineLiveOverview', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.worklinePluginManifest.mockReturnValue({ send: vi.fn().mockResolvedValue(manifest) })
  })

  it('loads plugin manifest and passes a scene model to RuntimeSceneMap', async () => {
    const detail = createDetail()
    const wrapper = shallowMount(WorklineLiveOverview, {
      props: {
        worklineSummary: detail.summary,
        worklineDetail: detail,
        devices: detail.devices,
        activeSessions: detail.active_sessions,
        recentFailedTraces: detail.recent_failed_traces,
        recentCompletedTraces: detail.recent_completed_traces,
        selectedDeviceId: 101
      },
      global: {
        stubs: {
          DecisionStrip: true,
          SessionBoard: true,
          'el-card': {
            template: '<section><slot name="header" /><slot /></section>'
          }
        }
      }
    })

    await flushPromises()

    expect(mocks.worklinePluginManifest).toHaveBeenCalledWith('rough_sorter')
    const sceneMap = wrapper.findComponent({ name: 'RuntimeSceneMap' })
    expect(sceneMap.exists()).toBe(true)
    const model = sceneMap.props('model')
    expect(model.lanes.map((lane: { label: string }) => lane.label)).toContain('arm')
    expect(model.gaps).toEqual([
      {
        id: 'gap:arm',
        role: 'arm',
        label: 'arm',
        requiredCount: 1,
        actualCount: 0
      }
    ])
  })
})
