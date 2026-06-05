import { describe, expect, it } from 'vitest'
import { buildRuntimeSceneModel } from '@/components/runtime/monitor/runtime-scene-model'
import type {
  RuntimeScenePluginManifestSummary,
  RuntimeTraceListItem,
  RuntimeWorklineDetailResponse,
  RuntimeWorklineDeviceItem,
  RuntimeWorklineSummary
} from '@/types/runtime'

function createSummary(overrides: Partial<RuntimeWorklineSummary> = {}): RuntimeWorklineSummary {
  return {
    id: 45,
    line_code: 'WL-45',
    line_name: '粗分线',
    line_type: 'SORTING',
    plugin_key: 'rough_sorter',
    contract_version: 'v1',
    is_active: true,
    device_count: 3,
    active_session_count: 1,
    waiting_session_count: 0,
    failed_session_count: 0,
    error_device_count: 0,
    offline_device_count: 0,
    maintenance_device_count: 0,
    run_mode: 'AUTO',
    runtime_status: 'READY',
    ...overrides
  }
}

function createDevice(overrides: Partial<RuntimeWorklineDeviceItem> = {}): RuntimeWorklineDeviceItem {
  return {
    id: 101,
    device_code: 'DV-101',
    device_name: '设备 101',
    device_role: 'scanner',
    role_index: 1,
    upstream_device_id: null,
    device_status: 'ONLINE',
    maintenance_mode: false,
    current_command_id: null,
    open_command_count: 0,
    pending_command_count: 0,
    blocked_outbox_count: 0,
    open_issue_count: 0,
    active_runtime_hold_ids: [],
    error_code: null,
    ...overrides
  }
}

function createSession(overrides: Partial<RuntimeTraceListItem> = {}): RuntimeTraceListItem {
  return {
    session_id: 9001,
    session_code: 'S-9001',
    workline_id: 45,
    status: 'WAITING',
    current_device_id: 102,
    is_timed_out: false,
    ...overrides
  } as RuntimeTraceListItem
}

function createDetail(
  overrides: Partial<RuntimeWorklineDetailResponse> = {}
): RuntimeWorklineDetailResponse {
  return {
    summary: createSummary(),
    devices: [
      createDevice({ id: 101, device_role: 'scanner', role_index: 1 }),
      createDevice({
        id: 102,
        device_code: 'DV-102',
        device_name: '机械臂',
        device_role: 'arm',
        role_index: 2,
        upstream_device_id: 101,
        current_command_id: 700,
        open_command_count: 2,
        blocked_outbox_count: 1,
        active_runtime_hold_ids: [3001]
      }),
      createDevice({
        id: 103,
        device_code: 'DV-103',
        device_name: '无角色设备',
        device_role: '',
        role_index: 3
      })
    ],
    active_sessions: [createSession()],
    recent_failed_traces: [],
    recent_completed_traces: [],
    ...overrides
  }
}

const manifest: RuntimeScenePluginManifestSummary = {
  plugin_key: 'rough_sorter',
  contract_version: 'v1',
  required_device_roles: [
    { role: 'scanner', min_count: 1 },
    { role: 'arm', min_count: 1 },
    { role: 'rack', min_count: 1 }
  ],
  event_source_roles: { SCAN_DONE: ['scanner'] },
  command_target_roles: { MOVE_ARM: ['arm'] },
  supported_events: ['SCAN_DONE'],
  supported_commands: ['MOVE_ARM']
}

describe('buildRuntimeSceneModel', () => {
  it('builds manifest lanes, missing role gaps, upstream flows, and device badges', () => {
    const model = buildRuntimeSceneModel(createDetail(), {
      manifest,
      selectedDeviceId: 102,
      blockingDeviceId: 102
    })

    expect(model.verdict.manifestLoaded).toBe(true)
    expect(model.lanes.map(lane => lane.label)).toEqual(['scanner', 'arm', 'rack', '未归类设备'])
    expect(model.gaps).toEqual([
      {
        id: 'gap:rack',
        role: 'rack',
        label: 'rack',
        requiredCount: 1,
        actualCount: 0
      }
    ])
    expect(model.flows).toEqual([
      {
        id: 'flow:101:102',
        fromNodeId: 'device:101',
        toNodeId: 'device:102',
        source: 'upstream'
      },
      {
        id: 'flow:102:103',
        fromNodeId: 'device:102',
        toNodeId: 'device:103',
        source: 'fallback-order'
      }
    ])

    const arm = model.nodes.find(node => node.deviceId === 102)
    expect(arm?.isSelected).toBe(true)
    expect(arm?.state).toBe('hold')
    expect(arm?.badges.map(badge => badge.label)).toEqual([
      '执行中',
      '2 未完成命令',
      'Runtime Hold 1',
      '1 已停靠',
      '1 活跃 Session'
    ])
    expect(model.overlays.map(overlay => overlay.kind)).toEqual([
      'active-session',
      'blocking-device'
    ])
  })

  it('falls back to raw device roles and keeps uncategorized devices when manifest is missing', () => {
    const model = buildRuntimeSceneModel(createDetail(), {
      manifest: null,
      manifestError: new Error('manifest failed')
    })

    expect(model.verdict.manifestLoaded).toBe(false)
    expect(model.verdict.manifestWarning).toBe('插件语义未加载，按设备角色原样展示')
    expect(model.lanes.map(lane => lane.kind)).toEqual(['fallback', 'fallback', 'uncategorized'])
    expect(model.gaps).toEqual([])
    expect(model.nodes.map(node => node.laneId)).toContain('role:__uncategorized__')
  })

  it('uses fallback order flows when upstream_device_id is absent', () => {
    const model = buildRuntimeSceneModel(
      createDetail({
        devices: [
          createDevice({ id: 201, role_index: 2, upstream_device_id: null }),
          createDevice({ id: 200, role_index: 1, upstream_device_id: null })
        ],
        active_sessions: []
      }),
      { manifest: null }
    )

    expect(model.flows).toEqual([
      {
        id: 'flow:200:201',
        fromNodeId: 'device:200',
        toNodeId: 'device:201',
        source: 'fallback-order'
      }
    ])
  })

  it('uses role_index fallback flows when manifest is missing', () => {
    const model = buildRuntimeSceneModel(
      createDetail({
        devices: [
          createDevice({ id: 402, device_role: 'z-role', role_index: 2, upstream_device_id: null }),
          createDevice({ id: 401, device_role: 'a-role', role_index: 1, upstream_device_id: null })
        ],
        active_sessions: []
      }),
      { manifest: null }
    )

    expect(model.flows).toEqual([
      {
        id: 'flow:401:402',
        fromNodeId: 'device:401',
        toNodeId: 'device:402',
        source: 'fallback-order'
      }
    ])
  })

  it('orders fallback lanes by the first device role_index instead of role label', () => {
    const model = buildRuntimeSceneModel(
      createDetail({
        devices: [
          createDevice({ id: 601, device_role: 'z-role', role_index: 1, upstream_device_id: null }),
          createDevice({ id: 602, device_role: 'a-role', role_index: 2, upstream_device_id: null })
        ],
        active_sessions: []
      }),
      { manifest: null }
    )

    expect(model.lanes.map(lane => lane.role)).toEqual(['z-role', 'a-role'])
  })

  it('renders all SMT required role lanes and explicit gaps for missing roles', () => {
    const smtManifest: RuntimeScenePluginManifestSummary = {
      plugin_key: 'smt_sorting_inbound',
      contract_version: 'v1',
      required_device_roles: [
        { role: 'source_arm', min_count: 1 },
        { role: 'scan_platform', min_count: 1 },
        { role: 'target_arm', min_count: 1 },
        { role: 'ng_arm', min_count: 1 },
        { role: 'ng_station', min_count: 1 },
        { role: 'workstation', min_count: 1 }
      ]
    }
    const model = buildRuntimeSceneModel(
      createDetail({
        devices: [
          createDevice({ id: 701, device_role: 'source_arm', role_index: 1 }),
          createDevice({ id: 702, device_role: 'scan_platform', role_index: 2 }),
          createDevice({ id: 703, device_role: 'target_arm', role_index: 3 })
        ],
        active_sessions: []
      }),
      { manifest: smtManifest }
    )

    expect(model.lanes.map(lane => lane.role)).toEqual([
      'source_arm',
      'scan_platform',
      'target_arm',
      'ng_arm',
      'ng_station',
      'workstation'
    ])
    expect(model.gaps.map(gap => gap.role)).toEqual(['ng_arm', 'ng_station', 'workstation'])
  })

  it('uses manifest role order before role_index for fallback flows', () => {
    const model = buildRuntimeSceneModel(
      createDetail({
        devices: [
          createDevice({ id: 301, device_role: 'scanner', role_index: 1, upstream_device_id: null }),
          createDevice({ id: 302, device_role: 'arm', role_index: 99, upstream_device_id: null }),
          createDevice({ id: 303, device_role: 'rack', role_index: 2, upstream_device_id: null })
        ],
        active_sessions: []
      }),
      { manifest }
    )

    expect(model.flows).toEqual([
      {
        id: 'flow:301:302',
        fromNodeId: 'device:301',
        toNodeId: 'device:302',
        source: 'fallback-order'
      },
      {
        id: 'flow:302:303',
        fromNodeId: 'device:302',
        toNodeId: 'device:303',
        source: 'fallback-order'
      }
    ])
  })

  it('fills missing upstream edges with manifest-order fallback flows', () => {
    const model = buildRuntimeSceneModel(
      createDetail({
        devices: [
          createDevice({ id: 501, device_role: 'scanner', role_index: 1, upstream_device_id: null }),
          createDevice({ id: 502, device_role: 'arm', role_index: 2, upstream_device_id: 501 }),
          createDevice({ id: 503, device_role: 'rack', role_index: 3, upstream_device_id: null })
        ],
        active_sessions: []
      }),
      { manifest }
    )

    expect(model.flows).toEqual([
      {
        id: 'flow:501:502',
        fromNodeId: 'device:501',
        toNodeId: 'device:502',
        source: 'upstream'
      },
      {
        id: 'flow:502:503',
        fromNodeId: 'device:502',
        toNodeId: 'device:503',
        source: 'fallback-order'
      }
    ])
  })

  it('does not infer resource badges from raw runtime JSON evidence fields', () => {
    const model = buildRuntimeSceneModel(
      createDetail({
        active_sessions: [
          createSession({
            event_payload: {
              pkg_code: 'PKG-RAW-001',
              rack_code: 'RACK-RAW-001',
              bin_code: 'BIN-RAW-001'
            }
          })
        ]
      }),
      { manifest: null }
    )
    const serializedScene = JSON.stringify(model)

    expect(serializedScene).not.toContain('PKG-RAW-001')
    expect(serializedScene).not.toContain('RACK-RAW-001')
    expect(serializedScene).not.toContain('BIN-RAW-001')
    expect(model.nodes.flatMap(node => node.badges).map(badge => badge.kind)).toEqual([
      'current-command',
      'open-command',
      'runtime-hold',
      'parked-outbox',
      'active-session'
    ])
  })

  it('assigns active session badges to the current device only', () => {
    const model = buildRuntimeSceneModel(
      createDetail({
        devices: [
          createDevice({ id: 101, device_role: 'scanner', role_index: 1 }),
          createDevice({
            id: 102,
            device_code: 'DV-102',
            device_name: '机械臂',
            device_role: 'arm',
            role_index: 2
          })
        ],
        active_sessions: [createSession({ device_id: 101, current_device_id: 102 })]
      }),
      { manifest: null }
    )

    const scanner = model.nodes.find(node => node.deviceId === 101)
    const arm = model.nodes.find(node => node.deviceId === 102)

    expect(scanner?.badges.map(badge => badge.kind)).not.toContain('active-session')
    expect(scanner?.state).toBe('idle')
    expect(arm?.badges.map(badge => badge.kind)).toContain('active-session')
    expect(arm?.state).toBe('waiting')
    expect(model.overlays).toEqual([
      {
        id: 'active-session:102',
        kind: 'active-session',
        deviceId: 102,
        label: '活跃 Session',
        tone: 'info'
      }
    ])
  })
})
