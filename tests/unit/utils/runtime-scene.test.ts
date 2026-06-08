import { describe, expect, it } from 'vitest'
import { buildRuntimeSceneModel, getRuntimeSceneEvidenceKey } from '@/utils/runtime-scene'
import type {
  RuntimeRackOperationWait,
  RuntimeSingleLayerRackSnapshot,
  RuntimeStationLease,
  RuntimeWorklineDetailResponse,
  WorkLinePluginManifestSummary
} from '@/types/runtime'

function createDetail(
  overrides: Partial<RuntimeWorklineDetailResponse> = {}
): RuntimeWorklineDetailResponse {
  return {
    summary: {
      id: 45,
      line_code: 'WL-45',
      line_name: '粗分线',
      line_type: 'SORTING',
      is_active: true,
      device_count: 2,
      active_session_count: 1,
      waiting_session_count: 1,
      failed_session_count: 0,
      error_device_count: 0,
      offline_device_count: 0,
      maintenance_device_count: 0,
      run_mode: 'SIMULATION',
      runtime_status: 'READY',
      plugin_key: 'rough_sorter',
      ...overrides.summary
    },
    workline_readiness: overrides.workline_readiness ?? 'READY',
    station_lease: overrides.station_lease ?? 'ACTIVE_DISPATCH_LEASE',
    single_layer_rack_snapshot: overrides.single_layer_rack_snapshot ?? 'ACTIVE',
    rack_operation_wait: overrides.rack_operation_wait ?? 'WAITING_WMS',
    resource_evidence_kind: overrides.resource_evidence_kind ?? 'WMS_CALLBACK_EVIDENCE',
    resource_evidence_total_count: overrides.resource_evidence_total_count ?? 3,
    resource_evidence_truncated: overrides.resource_evidence_truncated ?? true,
    resource_evidence_items: overrides.resource_evidence_items ?? [
      {
        resource_kind: 'RACK',
        resource_code: 'RACK-001',
        display_label: 'RACK RACK-001',
        evidence_kind: 'WES_ACTIVE_SNAPSHOT',
        position_code: 'SINGLE_LAYER_A',
        rack_code: 'RACK-001'
      },
      {
        resource_kind: 'BIN',
        resource_code: 'BIN-001',
        display_label: 'BIN BIN-001',
        evidence_kind: 'WMS_CALLBACK_EVIDENCE',
        position_code: 'SINGLE_LAYER_A',
        rack_code: 'RACK-001',
        bin_code: 'BIN-001',
        source_session_id: 20,
        source_trace_id: 'trace-20'
      }
    ],
    devices: overrides.devices ?? [
      {
        id: 101,
        device_code: 'ARM01',
        device_name: '机械臂 1',
        device_role: 'ARM',
        role_index: 1,
        device_status: 'IDLE',
        maintenance_mode: false,
        pending_command_count: 0
      },
      {
        id: 102,
        device_code: 'PLC01',
        device_name: 'PLC',
        device_role: 'PLC',
        role_index: 1,
        device_status: 'RUNNING',
        maintenance_mode: false,
        pending_command_count: 1
      }
    ],
    active_sessions: overrides.active_sessions ?? [],
    recent_failed_traces: overrides.recent_failed_traces ?? [],
    recent_completed_traces: overrides.recent_completed_traces ?? []
  }
}

const manifest: WorkLinePluginManifestSummary = {
  plugin_key: 'rough_sorter',
  contract_version: 'v1',
  single_layer_boundaries: [
    {
      station_role: 'TARGET',
      station_code: 'TARGET_ARM',
      position_code: 'SINGLE_LAYER_A',
      rack_kind: 'SINGLE_LAYER',
      snapshot_kind: 'ACTIVE_BIN_RACK',
      lease_scope: 'POSITION',
      business_demand_type: 'SORTING_TARGET',
      wms_operation_type: 'RACK_MOVE'
    }
  ],
  required_device_roles: [],
  supported_events: [],
  supported_commands: []
}

describe('buildRuntimeSceneModel', () => {
  it('normalizes detail and manifest into a camelCase scene model', () => {
    const model = buildRuntimeSceneModel({
      detail: createDetail(),
      manifest
    })

    expect(model.worklineId).toBe(45)
    expect(model.boundaries).toEqual([
      expect.objectContaining({
        stationRole: 'TARGET',
        stationCode: 'TARGET_ARM',
        positionCode: 'SINGLE_LAYER_A',
        rackKind: 'SINGLE_LAYER',
        stationLease: 'ACTIVE_DISPATCH_LEASE',
        stationLeaseLabel: 'Station lease：调度租约占用',
        rackSnapshot: 'ACTIVE',
        rackSnapshotLabel: '执行快照：当前执行货架',
        rackOperationWait: 'WAITING_WMS',
        rackOperationWaitLabel: 'Rack operation：等待 WMS 搬运到位',
        resourceEvidenceKind: 'WMS_CALLBACK_EVIDENCE',
        resourceEvidenceKindLabel: 'WMS 回调证据'
      })
    ])
    expect(model.resourceEvidence).toEqual([
      expect.objectContaining({
        resourceKind: 'RACK',
        resourceKindLabel: 'Rack',
        resourceCode: 'RACK-001',
        evidenceKind: 'WES_ACTIVE_SNAPSHOT',
        evidenceKindLabel: 'WES active snapshot evidence',
        positionCode: 'SINGLE_LAYER_A'
      }),
      expect.objectContaining({
        resourceKind: 'BIN',
        resourceKindLabel: 'Bin',
        resourceCode: 'BIN-001',
        evidenceKind: 'WMS_CALLBACK_EVIDENCE',
        evidenceKindLabel: 'WMS 回调证据',
        sourceSessionId: 20,
        sourceTraceId: 'trace-20'
      })
    ])
    expect(model.readinessLabel).toBe('待机 / 可接收生产事件')
    expect(model.runtimeStatusLabel).toBe('现场 START 后待机 / 可接收')
    expect(model.semanticFallback).toBe(false)
    expect(model.resourceEvidenceTotalCount).toBe(3)
    expect(model.resourceEvidenceTruncated).toBe(true)
    expect(model.deviceNodes.map(item => item.deviceCode)).toEqual(['ARM01', 'PLC01'])
    expect(model.deviceNodes[1]).toEqual(
      expect.objectContaining({
        openCommandCount: 1,
        blockedOutboxCount: 0,
        runtimeHoldCount: 0,
        maintenanceMode: false,
        errorCode: undefined
      })
    )
  })

  it.each<
    [
      RuntimeStationLease,
      RuntimeSingleLayerRackSnapshot,
      RuntimeRackOperationWait,
      string,
      string,
      string
    ]
  >([
    [
      'IDLE',
      'MISSING',
      'WMS_CALLBACK_RECEIVED',
      'Station lease：空闲',
      '执行快照：未找到当前执行货架',
      'Rack operation：WMS 回调证据已收到'
    ],
    [
      'ACTIVE_RACK_BOUND',
      'INVALID',
      'TIMEOUT',
      'Station lease：执行货架占用',
      '执行快照：无效',
      'Rack operation：等待 WMS 超时'
    ],
    [
      'ACTIVE_SESSION_BOUND',
      'NON_SINGLE_LAYER_EVIDENCE',
      'FAILED',
      'Station lease：会话占用',
      '执行快照：非单层 evidence',
      'Rack operation：WMS 搬运结果失败'
    ]
  ])(
    'maps lease %s, snapshot %s and rack wait %s to operator labels',
    (stationLease, rackSnapshot, rackOperationWait, leaseLabel, snapshotLabel, waitLabel) => {
      const model = buildRuntimeSceneModel({
        detail: createDetail({
          station_lease: stationLease,
          single_layer_rack_snapshot: rackSnapshot,
          rack_operation_wait: rackOperationWait
        }),
        manifest
      })

      expect(model.boundaries[0]).toEqual(
        expect.objectContaining({
          stationLeaseLabel: leaseLabel,
          rackSnapshotLabel: snapshotLabel,
          rackOperationWaitLabel: waitLabel
        })
      )
    }
  )

  it('keeps NG placement on TARGET_ARM instead of creating a separate NG role', () => {
    const ngManifest: WorkLinePluginManifestSummary = {
      ...manifest,
      single_layer_boundaries: [
        {
          ...manifest.single_layer_boundaries![0],
          station_role: 'TARGET_ARM',
          station_code: 'TARGET_ARM',
          business_demand_type: 'NG_PLACE'
        }
      ]
    }
    const model = buildRuntimeSceneModel({
      detail: createDetail(),
      manifest: ngManifest
    })

    expect(model.boundaries[0]?.stationRole).toBe('TARGET_ARM')
    expect(model.boundaries.map(item => item.stationRole)).not.toContain(['NG', 'ARM'].join('_'))
  })

  it('maps legacy NG_ARM role data to TARGET_ARM before display', () => {
    const legacyManifest: WorkLinePluginManifestSummary = {
      ...manifest,
      single_layer_boundaries: [
        {
          ...manifest.single_layer_boundaries![0],
          station_role: 'NG_ARM',
          station_code: 'NG_ARM',
          business_demand_type: 'NG_PLACE'
        }
      ]
    }
    const model = buildRuntimeSceneModel({
      detail: createDetail({
        devices: [
          {
            id: 103,
            device_code: 'ARM03',
            device_name: '机械臂 3',
            device_role: 'NG_ARM',
            role_index: 1,
            device_status: 'IDLE',
            maintenance_mode: false,
            pending_command_count: 0
          }
        ]
      }),
      manifest: legacyManifest
    })

    expect(model.boundaries[0]?.stationRole).toBe('TARGET_ARM')
    expect(model.boundaries[0]?.stationCode).toBe('TARGET_ARM')
    expect(model.deviceNodes[0]?.deviceRole).toBe('TARGET_ARM')
    expect(JSON.stringify(model)).not.toContain('NG_ARM')
  })

  it('builds composite boundary keys when stations share a position code', () => {
    const duplicatePositionManifest: WorkLinePluginManifestSummary = {
      ...manifest,
      single_layer_boundaries: [
        {
          ...manifest.single_layer_boundaries![0],
          station_role: 'SOURCE_ARM',
          station_code: 'SOURCE_ARM',
          position_code: 'SINGLE_LAYER_A'
        },
        {
          ...manifest.single_layer_boundaries![0],
          station_role: 'SOURCE_ARM',
          station_code: 'SOURCE_ARM',
          position_code: 'SINGLE_LAYER_A',
          lease_scope: 'WORKSTATION',
          business_demand_type: 'SORTING_NG',
          wms_operation_type: 'RACK_RETURN'
        }
      ]
    }

    const model = buildRuntimeSceneModel({
      detail: createDetail(),
      manifest: duplicatePositionManifest
    })

    expect(new Set(model.boundaries.map(item => item.key)).size).toBe(2)
    expect(model.boundaries.map(item => item.key)).toEqual([
      'SOURCE_ARM:SOURCE_ARM:SINGLE_LAYER_A:SINGLE_LAYER:ACTIVE_BIN_RACK:POSITION:SORTING_TARGET:RACK_MOVE',
      'SOURCE_ARM:SOURCE_ARM:SINGLE_LAYER_A:SINGLE_LAYER:ACTIVE_BIN_RACK:WORKSTATION:SORTING_NG:RACK_RETURN'
    ])
  })

  it('falls back to generic evidence when contract fields or manifest are missing', () => {
    const detail = createDetail() as RuntimeWorklineDetailResponse & Record<string, unknown>
    delete detail.station_lease
    delete detail.rack_operation_wait
    delete detail.resource_evidence_kind

    const model = buildRuntimeSceneModel({
      detail,
      manifest: null
    })

    expect(model.semanticFallback).toBe(true)
    expect(model.semanticFallbackMessage).toContain('运行态边界字段未加载')
    expect(model.boundaries[0]?.stationLeaseLabel).toBe('Station lease：语义未加载')
    expect(model.boundaries[0]?.rackOperationWaitLabel).toBe('Rack operation：语义未加载')
    expect(model.boundaries[0]?.resourceEvidenceKindLabel).toBe('通用 evidence')
  })

  it.each(['resource_evidence_items', 'resource_evidence_total_count', 'resource_evidence_truncated'])(
    'uses generated defaults when optional evidence field %s is missing',
    field => {
      const detail = createDetail() as RuntimeWorklineDetailResponse & Record<string, unknown>
      delete detail[field]

      const model = buildRuntimeSceneModel({
        detail,
        manifest
      })

      expect(model.semanticFallback).toBe(false)
      expect(model.boundaries[0]?.stationLeaseLabel).toBe('Station lease：调度租约占用')
      expect(model.boundaries[0]?.resourceEvidenceKindLabel).toBe('WMS 回调证据')
    }
  )

  it('reports semantic fallback when a required semantic contract field is missing', () => {
    const detail = createDetail() as RuntimeWorklineDetailResponse & Record<string, unknown>
    delete detail.resource_evidence_kind

    const model = buildRuntimeSceneModel({
      detail,
      manifest
    })

    expect(model.semanticFallback).toBe(true)
    expect(model.semanticFallbackMessage).toContain('运行态边界字段未加载')
  })

  it('reports semantic fallback when evidence contract field shapes are invalid', () => {
    const detail = createDetail() as RuntimeWorklineDetailResponse & Record<string, unknown>
    detail.resource_evidence_items = {}
    detail.resource_evidence_total_count = Number.NaN
    detail.resource_evidence_truncated = 'false'

    const model = buildRuntimeSceneModel({
      detail,
      manifest
    })

    expect(model.semanticFallback).toBe(true)
    expect(model.semanticFallbackMessage).toContain('运行态边界字段未加载')
    expect(model.resourceEvidence).toEqual([])
    expect(model.resourceEvidenceTotalCount).toBe(0)
    expect(model.resourceEvidenceTruncated).toBe(false)
    expect(model.boundaries[0]).toEqual(
      expect.objectContaining({
        stationLeaseLabel: 'Station lease：语义未加载',
        rackSnapshotLabel: '执行快照：语义未加载',
        rackOperationWaitLabel: 'Rack operation：语义未加载',
        resourceEvidenceKindLabel: '通用 evidence'
      })
    )
  })

  it('reports manifest load failure as semantic fallback', () => {
    const model = buildRuntimeSceneModel({
      detail: createDetail(),
      manifest: null,
      manifestLoadFailed: true
    })

    expect(model.semanticFallback).toBe(true)
    expect(model.semanticFallbackMessage).toContain('manifest 加载失败')
    expect(model.boundaries[0]).toEqual(
      expect.objectContaining({
        stationLeaseLabel: 'Station lease：语义未加载',
        rackSnapshotLabel: '执行快照：语义未加载',
        rackOperationWaitLabel: 'Rack operation：语义未加载',
        resourceEvidenceKindLabel: '通用 evidence'
      })
    )
  })

  it('does not render precise boundary labels when manifest boundaries are unavailable', () => {
    const model = buildRuntimeSceneModel({
      detail: createDetail(),
      manifest: null
    })

    expect(model.semanticFallback).toBe(true)
    expect(model.semanticFallbackMessage).toContain('manifest 未加载')
    expect(model.boundaries[0]).toEqual(
      expect.objectContaining({
        stationLeaseLabel: 'Station lease：语义未加载',
        rackSnapshotLabel: '执行快照：语义未加载',
        rackOperationWaitLabel: 'Rack operation：语义未加载',
        resourceEvidenceKindLabel: '通用 evidence'
      })
    )
  })

  it('builds distinct resource evidence keys for the same resource from different traces', () => {
    const first = getRuntimeSceneEvidenceKey({
      resourceKind: 'BIN',
      resourceKindLabel: 'Bin',
      resourceCode: 'BIN-001',
      displayLabel: 'BIN BIN-001',
      evidenceKind: 'WMS_CALLBACK_EVIDENCE',
      evidenceKindLabel: 'WMS 回调证据',
      positionCode: 'SINGLE_LAYER_A',
      sourceSessionId: 20,
      sourceTraceId: 'trace-20'
    })
    const second = getRuntimeSceneEvidenceKey({
      resourceKind: 'BIN',
      resourceKindLabel: 'Bin',
      resourceCode: 'BIN-001',
      displayLabel: 'BIN BIN-001',
      evidenceKind: 'WMS_CALLBACK_EVIDENCE',
      evidenceKindLabel: 'WMS 回调证据',
      positionCode: 'SINGLE_LAYER_A',
      sourceSessionId: 21,
      sourceTraceId: 'trace-21'
    })

    expect(first).not.toBe(second)
  })
})
