/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'vitest'
import {
  HIDDEN_TOPOLOGY_ROLES,
  buildRuntimeSceneModel,
  getRuntimeSceneEvidenceKey
} from '@/utils/runtime-scene'
import type {
  RuntimeRackOperationWait,
  RuntimeSingleLayerRackSnapshot,
  RuntimeStationLease,
  RuntimeWorklineMonitorProjectionResponse,
  WorkLinePluginManifestSummary
} from '@/types/runtime'

function createDetail(
  overrides: Record<string, any> = {}
): RuntimeWorklineMonitorProjectionResponse {
  const summary = {
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
  }
  const boundary = {
    workline_readiness: overrides.workline_readiness ?? 'READY',
    station_lease: overrides.station_lease ?? 'ACTIVE_DISPATCH_LEASE',
    single_layer_rack_snapshot: overrides.single_layer_rack_snapshot ?? 'ACTIVE',
    rack_operation_wait: overrides.rack_operation_wait ?? 'WAITING_WMS'
  }
  const resource_evidence = {
    kind: overrides.resource_evidence_kind ?? 'WMS_CALLBACK_EVIDENCE',
    total_count: overrides.resource_evidence_total_count ?? 3,
    truncated: overrides.resource_evidence_truncated ?? true,
    items: overrides.resource_evidence_items ?? [
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
    ]
  }
  const device_nodes = overrides.devices ?? [
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
  ]
  const active_sessions = overrides.active_sessions ?? { items: [], total_count: 0, truncated: false }
  const recent_failed_traces = overrides.recent_failed_traces ?? { items: [], total_count: 0, truncated: false }
  const recent_completed_traces = overrides.recent_completed_traces ?? { items: [], total_count: 0, truncated: false }
  const action_candidates = overrides.action_candidates ?? { pending_reconciliation: null }
  const generated_at = overrides.generated_at ?? new Date().toISOString()

  return {
    summary,
    boundary,
    device_nodes,
    resource_evidence,
    active_sessions: Array.isArray(active_sessions) ? { items: active_sessions, total_count: active_sessions.length, truncated: false } : active_sessions,
    recent_failed_traces: Array.isArray(recent_failed_traces) ? { items: recent_failed_traces, total_count: recent_failed_traces.length, truncated: false } : recent_failed_traces,
    recent_completed_traces: Array.isArray(recent_completed_traces) ? { items: recent_completed_traces, total_count: recent_completed_traces.length, truncated: false } : recent_completed_traces,
    action_candidates,
    generated_at
  } as unknown as RuntimeWorklineMonitorProjectionResponse
}

interface BoundaryFixture {
  station_role: string
  station_code: string
  position_code: string
  rack_kind: string
  snapshot_kind: string
  lease_scope: string
  business_demand_type: string
  wms_operation_type: string
}

const baseBoundary: BoundaryFixture = {
  station_role: 'TARGET',
  station_code: 'TARGET_ARM',
  position_code: 'SINGLE_LAYER_A',
  rack_kind: 'SINGLE_LAYER',
  snapshot_kind: 'ACTIVE_BIN_RACK',
  lease_scope: 'POSITION',
  business_demand_type: 'SORTING_TARGET',
  wms_operation_type: 'RACK_MOVE'
}

function manifestWithBoundaries(boundaries: BoundaryFixture[]): WorkLinePluginManifestSummary {
  const rackPositionsByCode = new Map<string, BoundaryFixture>()
  for (const boundary of boundaries) {
    if (!rackPositionsByCode.has(boundary.position_code)) {
      rackPositionsByCode.set(boundary.position_code, boundary)
    }
  }

  return {
    plugin_key: 'rough_sorter',
    contract_version: 'v1',
    devices: [],
    events: [],
    commands: [
      {
        command: 'PICK_AND_PUT',
        target_device_role: 'TARGET_ARM',
        payload_schema_ref: 'schemas/commands/pick-and-put.json',
        rack_position_args: [],
        result_bindings: []
      }
    ],
    topology: {
      flow_edges: Array.from(rackPositionsByCode.values()).map(boundary => ({
        type: 'material_flow',
        from_node: { kind: 'DEVICE_ROLE', ref: boundary.station_role },
        to_node: { kind: 'RACK_POSITION', ref: boundary.position_code }
      }))
    },
    rack_positions: Array.from(rackPositionsByCode.values()).map(boundary => ({
      code: boundary.position_code,
      role: boundary.station_role,
      station_code: boundary.station_code,
      carrier_capability: {
        allowed_rack_kinds: [boundary.rack_kind],
        allowed_slot_kinds: [],
        min_capacity: 0,
        max_capacity: 1
      }
    })),
    resource_boundaries: boundaries.map(boundary => ({
      rack_position_code: boundary.position_code,
      rack_kind: boundary.rack_kind,
      snapshot_kind: boundary.snapshot_kind,
      lease_scope: boundary.lease_scope,
      business_demand_type: boundary.business_demand_type,
      wms_operation_type: boundary.wms_operation_type
    }))
  }
}

const manifest = manifestWithBoundaries([baseBoundary])

describe('buildRuntimeSceneModel', () => {
  it('normalizes projection and manifest into a camelCase scene model', () => {
    const model = buildRuntimeSceneModel({
      projection: createDetail(),
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
    expect(manifest.commands).toEqual([
      expect.objectContaining({
        command: 'PICK_AND_PUT',
        rack_position_args: []
      })
    ])
    expect(manifest.topology?.flow_edges).toEqual([
      expect.objectContaining({
        type: 'material_flow',
        from_node: { kind: 'DEVICE_ROLE', ref: 'TARGET' },
        to_node: { kind: 'RACK_POSITION', ref: 'SINGLE_LAYER_A' }
      })
    ])
    expect(model.positionGroups[0]).toEqual(
      expect.objectContaining({
        stationCode: 'TARGET_ARM',
        positionCode: 'SINGLE_LAYER_A'
      })
    )
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

  it('falls back to rack position code when a resource boundary has no matching manifest rack position', () => {
    const orphanManifest: WorkLinePluginManifestSummary = {
      ...manifest,
      rack_positions: [],
      resource_boundaries: [
        {
          rack_position_code: 'ORPHAN_LAYER',
          rack_kind: 'SINGLE_LAYER',
          snapshot_kind: 'ACTIVE_BIN_RACK',
          lease_scope: 'POSITION',
          business_demand_type: 'SORTING_TARGET',
          wms_operation_type: 'RACK_MOVE'
        }
      ]
    }

    const model = buildRuntimeSceneModel({
      projection: createDetail(),
      manifest: orphanManifest
    })

    expect(model.boundaries[0]).toEqual(
      expect.objectContaining({
        stationRole: 'ORPHAN_LAYER',
        stationCode: 'ORPHAN_LAYER',
        positionCode: 'ORPHAN_LAYER',
        rackKind: 'SINGLE_LAYER'
      })
    )
  })

  it('groups structured evidence by position, stack anchor, and child resources', () => {
    const model = buildRuntimeSceneModel({
      projection: createDetail({
        resource_evidence_total_count: 7,
        resource_evidence_truncated: true,
        resource_evidence_items: [
          {
            resource_kind: 'RACK',
            resource_code: 'RACK-001',
            display_label: 'Rack RACK-001',
            evidence_kind: 'WES_ACTIVE_SNAPSHOT',
            station_code: 'TARGET_ARM',
            position_code: 'SINGLE_LAYER_A',
            rack_code: 'RACK-001'
          },
          {
            resource_kind: 'BIN',
            resource_code: 'BIN-001',
            display_label: 'Bin BIN-001',
            evidence_kind: 'WMS_CALLBACK_EVIDENCE',
            station_code: 'TARGET_ARM',
            position_code: 'SINGLE_LAYER_A',
            rack_code: 'RACK-001',
            bin_code: 'BIN-001'
          },
          {
            resource_kind: 'SLOT',
            resource_code: 'SLOT-A1',
            display_label: 'Slot SLOT-A1',
            evidence_kind: 'TRACE_RESOURCE_EVIDENCE',
            station_code: 'TARGET_ARM',
            position_code: 'SINGLE_LAYER_A',
            rack_code: 'RACK-001',
            bin_code: 'BIN-001',
            slot_code: 'SLOT-A1'
          },
          {
            resource_kind: 'CELL',
            resource_code: 'CELL-A1',
            display_label: 'Cell CELL-A1',
            evidence_kind: 'TRACE_RESOURCE_EVIDENCE',
            station_code: 'TARGET_ARM',
            position_code: 'SINGLE_LAYER_A',
            rack_code: 'RACK-001',
            bin_code: 'BIN-001'
          },
          {
            resource_kind: 'PKG',
            resource_code: 'PKG-001',
            display_label: 'PKG PKG-001',
            evidence_kind: 'WMS_CALLBACK_EVIDENCE',
            station_code: 'TARGET_ARM',
            position_code: 'SINGLE_LAYER_A',
            rack_code: 'RACK-001',
            bin_code: 'BIN-001',
            pkg_code: 'PKG-001'
          },
          {
            resource_kind: 'PART_SN',
            resource_code: 'PART-001',
            display_label: 'Part SN PART-001',
            evidence_kind: 'TRACE_RESOURCE_EVIDENCE',
            station_code: 'TARGET_ARM',
            position_code: 'SINGLE_LAYER_A',
            rack_code: 'RACK-001',
            bin_code: 'BIN-001',
            part_sn: 'PART-001'
          },
          {
            resource_kind: 'PKG',
            resource_code: 'PKG-UNLOCATED',
            display_label: 'PKG PKG-UNLOCATED',
            evidence_kind: 'GENERIC_EVIDENCE',
            source_trace_id: 'trace-unlocated'
          }
        ]
      }),
      manifest
    })

    expect(model.resourceEvidence).toHaveLength(7)
    expect(model.resourceEvidenceTotalCount).toBe(7)
    expect(model.resourceEvidenceTruncated).toBe(true)
    expect(model.unlocatedAuditItems.map(item => item.resourceCode)).toEqual(['PKG-UNLOCATED'])
    expect(model.positionGroups).toHaveLength(1)
    expect(model.positionGroups[0]).toEqual(
      expect.objectContaining({
        stationCode: 'TARGET_ARM',
        positionCode: 'SINGLE_LAYER_A',
        attentionState: 'waiting'
      })
    )
    expect(model.positionGroups[0]?.auditItems.map(item => item.resourceCode)).toEqual([
      'RACK-001',
      'BIN-001',
      'SLOT-A1',
      'CELL-A1',
      'PKG-001',
      'PART-001'
    ])

    const stack = model.positionGroups[0]?.resourceStacks[0]
    expect(stack?.key).toBe('rack:RACK-001')
    expect(stack?.anchor).toEqual({
      kind: 'RACK',
      code: 'RACK-001',
      displayLabel: 'Rack RACK-001'
    })
    expect(stack?.children.map(child => `${child.kind}:${child.code}`)).toEqual([
      'BIN:BIN-001',
      'SLOT:SLOT-A1',
      'CELL:CELL-A1',
      'PKG:PKG-001',
      'PART_SN:PART-001'
    ])
    expect(stack?.evidenceKinds).toEqual([
      'WES_ACTIVE_SNAPSHOT',
      'WMS_CALLBACK_EVIDENCE',
      'TRACE_RESOURCE_EVIDENCE'
    ])
  })

  it('projects single-layer rack evidence into slot, bin, cell, and material hierarchy', () => {
    const model = buildRuntimeSceneModel({
      projection: createDetail({
        resource_evidence_items: [
          {
            resource_kind: 'RACK',
            resource_code: 'RACK-001',
            display_label: 'Rack RACK-001',
            evidence_kind: 'WES_ACTIVE_SNAPSHOT',
            station_code: 'TARGET_ARM',
            position_code: 'SINGLE_LAYER_A',
            rack_code: 'RACK-001'
          },
          {
            resource_kind: 'SLOT',
            resource_code: 'A',
            display_label: 'Slot A',
            evidence_kind: 'WES_ACTIVE_SNAPSHOT',
            station_code: 'TARGET_ARM',
            position_code: 'SINGLE_LAYER_A',
            rack_code: 'RACK-001',
            slot_code: 'A'
          },
          {
            resource_kind: 'SLOT',
            resource_code: 'B',
            display_label: 'Slot B',
            evidence_kind: 'WES_ACTIVE_SNAPSHOT',
            station_code: 'TARGET_ARM',
            position_code: 'SINGLE_LAYER_A',
            rack_code: 'RACK-001',
            slot_code: 'B'
          },
          {
            resource_kind: 'BIN',
            resource_code: 'BIN-001',
            display_label: 'Bin BIN-001',
            evidence_kind: 'WMS_CALLBACK_EVIDENCE',
            station_code: 'TARGET_ARM',
            position_code: 'SINGLE_LAYER_A',
            rack_code: 'RACK-001',
            slot_code: 'A',
            bin_code: 'BIN-001'
          },
          {
            resource_kind: 'CELL',
            resource_code: 'CELL-A1',
            display_label: 'Cell CELL-A1',
            evidence_kind: 'TRACE_RESOURCE_EVIDENCE',
            station_code: 'TARGET_ARM',
            position_code: 'SINGLE_LAYER_A',
            rack_code: 'RACK-001',
            slot_code: 'A',
            bin_code: 'BIN-001'
          },
          {
            resource_kind: 'PKG',
            resource_code: 'PKG-001',
            display_label: 'PKG PKG-001',
            evidence_kind: 'TRACE_RESOURCE_EVIDENCE',
            station_code: 'TARGET_ARM',
            position_code: 'SINGLE_LAYER_A',
            rack_code: 'RACK-001',
            slot_code: 'A',
            bin_code: 'BIN-001',
            cell_code: 'CELL-A1',
            pkg_code: 'PKG-001'
          },
          {
            resource_kind: 'BIN',
            resource_code: 'BIN-FLOATING',
            display_label: 'Bin BIN-FLOATING',
            evidence_kind: 'WMS_CALLBACK_EVIDENCE',
            station_code: 'TARGET_ARM',
            position_code: 'SINGLE_LAYER_A',
            rack_code: 'RACK-001',
            bin_code: 'BIN-FLOATING'
          }
        ]
      }),
      manifest
    })

    const layout = model.positionGroups[0]?.rackLayouts[0]

    expect(layout).toEqual(
      expect.objectContaining({
        rackCode: 'RACK-001',
        displayLabel: 'Rack RACK-001',
        evidenceCount: 7
      })
    )
    expect(layout?.slots.map(slot => `${slot.code}:${slot.state}`)).toEqual([
      'A:material',
      'B:empty'
    ])
    expect(layout?.slots[0]?.bin).toEqual(
      expect.objectContaining({
        code: 'BIN-001',
        evidenceCount: 3
      })
    )
    expect(layout?.slots[0]?.bin?.cells[0]).toEqual(
      expect.objectContaining({
        code: 'CELL-A1',
        materials: [expect.objectContaining({ kind: 'PKG', code: 'PKG-001' })]
      })
    )
    expect(layout?.unlocatedBins.map(bin => bin.code)).toEqual(['BIN-FLOATING'])
  })

  it('preserves material batch summary and bottom-to-top reel order for rack cells', () => {
    const resourceEvidenceItems = [
      {
        resource_kind: 'RACK',
        resource_code: 'RACK-001',
        display_label: 'Rack RACK-001',
        evidence_kind: 'WES_ACTIVE_SNAPSHOT',
        station_code: 'TARGET_ARM',
        position_code: 'SINGLE_LAYER_A',
        rack_code: 'RACK-001'
      },
      {
        resource_kind: 'SLOT',
        resource_code: 'A',
        display_label: 'Slot A',
        evidence_kind: 'WES_ACTIVE_SNAPSHOT',
        station_code: 'TARGET_ARM',
        position_code: 'SINGLE_LAYER_A',
        rack_code: 'RACK-001',
        slot_code: 'A'
      },
      {
        resource_kind: 'BIN',
        resource_code: 'BIN-001',
        display_label: 'Bin BIN-001',
        evidence_kind: 'WMS_CALLBACK_EVIDENCE',
        station_code: 'TARGET_ARM',
        position_code: 'SINGLE_LAYER_A',
        rack_code: 'RACK-001',
        slot_code: 'A',
        bin_code: 'BIN-001'
      },
      {
        resource_kind: 'CELL',
        resource_code: 'CELL-1',
        display_label: 'Cell CELL-1',
        evidence_kind: 'TRACE_RESOURCE_EVIDENCE',
        station_code: 'TARGET_ARM',
        position_code: 'SINGLE_LAYER_A',
        rack_code: 'RACK-001',
        slot_code: 'A',
        bin_code: 'BIN-001',
        material_code: '620100L00-011-G',
        date_code: '2401',
        lot_code: 'LOT-A',
        reel_count: 2
      },
      {
        resource_kind: 'PKG',
        resource_code: 'PKG-BOTTOM',
        display_label: 'PKG PKG-BOTTOM',
        evidence_kind: 'TRACE_RESOURCE_EVIDENCE',
        station_code: 'TARGET_ARM',
        position_code: 'SINGLE_LAYER_A',
        rack_code: 'RACK-001',
        slot_code: 'A',
        bin_code: 'BIN-001',
        cell_code: 'CELL-1',
        pkg_code: 'PKG-BOTTOM',
        material_code: '620100L00-011-G',
        date_code: '2401',
        lot_code: 'LOT-A',
        reel_code: 'REEL-BOTTOM',
        position_index: 1
      },
      {
        resource_kind: 'PKG',
        resource_code: 'PKG-TOP',
        display_label: 'PKG PKG-TOP',
        evidence_kind: 'TRACE_RESOURCE_EVIDENCE',
        station_code: 'TARGET_ARM',
        position_code: 'SINGLE_LAYER_A',
        rack_code: 'RACK-001',
        slot_code: 'A',
        bin_code: 'BIN-001',
        cell_code: 'CELL-1',
        pkg_code: 'PKG-TOP',
        material_code: '620100L00-011-G',
        date_code: '2401',
        lot_code: 'LOT-A',
        reel_code: 'REEL-TOP',
        position_index: 2
      }
    ] as RuntimeResourceEvidenceItem[]

    const model = buildRuntimeSceneModel({
      projection: createDetail({
        resource_evidence_items: resourceEvidenceItems
      }),
      manifest
    })

    const cell = model.positionGroups[0]?.rackLayouts[0]?.slots[0]?.bin?.cells[0]

    expect(cell).toEqual(
      expect.objectContaining({
        materialSummary: expect.objectContaining({
          materialCode: '620100L00-011-G',
          dateCode: '2401',
          lotCode: 'LOT-A',
          reelCount: 2,
          batchStatus: 'single'
        }),
        materialReels: [
          expect.objectContaining({
            reelCode: 'REEL-BOTTOM',
            materialCode: '620100L00-011-G',
            positionIndex: 1
          }),
          expect.objectContaining({
            reelCode: 'REEL-TOP',
            materialCode: '620100L00-011-G',
            positionIndex: 2
          })
        ]
      })
    )
  })

  it('moves a previously unlocated bin into its slot when later evidence supplies slot code', () => {
    const model = buildRuntimeSceneModel({
      projection: createDetail({
        resource_evidence_items: [
          {
            resource_kind: 'RACK',
            resource_code: 'RACK-001',
            display_label: 'Rack RACK-001',
            evidence_kind: 'WES_ACTIVE_SNAPSHOT',
            station_code: 'TARGET_ARM',
            position_code: 'SINGLE_LAYER_A',
            rack_code: 'RACK-001'
          },
          {
            resource_kind: 'BIN',
            resource_code: 'BIN-001',
            display_label: 'Bin BIN-001',
            evidence_kind: 'WMS_CALLBACK_EVIDENCE',
            station_code: 'TARGET_ARM',
            position_code: 'SINGLE_LAYER_A',
            rack_code: 'RACK-001',
            bin_code: 'BIN-001'
          },
          {
            resource_kind: 'SLOT',
            resource_code: 'A',
            display_label: 'Slot A',
            evidence_kind: 'TRACE_RESOURCE_EVIDENCE',
            station_code: 'TARGET_ARM',
            position_code: 'SINGLE_LAYER_A',
            rack_code: 'RACK-001',
            slot_code: 'A',
            bin_code: 'BIN-001'
          }
        ]
      }),
      manifest
    })

    const layout = model.positionGroups[0]?.rackLayouts[0]

    expect(layout?.slots[0]?.bin?.code).toBe('BIN-001')
    expect(layout?.slots[0]?.bin?.auditItems.map(item => item.resourceCode)).toEqual([
      'BIN-001',
      'A'
    ])
    expect(layout?.unlocatedBins).toEqual([])
  })

  it('attaches bin-scoped cell and material evidence to a slot-bound bin when slot code is omitted', () => {
    const model = buildRuntimeSceneModel({
      projection: createDetail({
        resource_evidence_items: [
          {
            resource_kind: 'RACK',
            resource_code: 'RACK-001',
            display_label: 'Rack RACK-001',
            evidence_kind: 'WES_ACTIVE_SNAPSHOT',
            station_code: 'TARGET_ARM',
            position_code: 'SINGLE_LAYER_A',
            rack_code: 'RACK-001'
          },
          {
            resource_kind: 'BIN',
            resource_code: 'BIN-001',
            display_label: 'Bin BIN-001',
            evidence_kind: 'WMS_CALLBACK_EVIDENCE',
            station_code: 'TARGET_ARM',
            position_code: 'SINGLE_LAYER_A',
            rack_code: 'RACK-001',
            bin_code: 'BIN-001'
          },
          {
            resource_kind: 'SLOT',
            resource_code: 'A',
            display_label: 'Slot A',
            evidence_kind: 'TRACE_RESOURCE_EVIDENCE',
            station_code: 'TARGET_ARM',
            position_code: 'SINGLE_LAYER_A',
            rack_code: 'RACK-001',
            slot_code: 'A',
            bin_code: 'BIN-001'
          },
          {
            resource_kind: 'CELL',
            resource_code: 'CELL-A1',
            display_label: 'Cell CELL-A1',
            evidence_kind: 'TRACE_RESOURCE_EVIDENCE',
            station_code: 'TARGET_ARM',
            position_code: 'SINGLE_LAYER_A',
            rack_code: 'RACK-001',
            bin_code: 'BIN-001'
          },
          {
            resource_kind: 'PKG',
            resource_code: 'PKG-001',
            display_label: 'PKG PKG-001',
            evidence_kind: 'WMS_CALLBACK_EVIDENCE',
            station_code: 'TARGET_ARM',
            position_code: 'SINGLE_LAYER_A',
            rack_code: 'RACK-001',
            bin_code: 'BIN-001',
            cell_code: 'CELL-A1',
            pkg_code: 'PKG-001'
          }
        ]
      }),
      manifest
    })

    const layout = model.positionGroups[0]?.rackLayouts[0]
    const slot = layout?.slots[0]

    expect(slot?.bin?.cells[0]?.code).toBe('CELL-A1')
    expect(slot?.bin?.cells[0]?.materials.map(material => material.code)).toEqual(['PKG-001'])
    expect(slot?.state).toBe('material')
    expect(layout?.unlocatedBins).toEqual([])
  })

  it('keeps bin-scoped material evidence outside cells when no cell code is supplied', () => {
    const model = buildRuntimeSceneModel({
      projection: createDetail({
        resource_evidence_items: [
          {
            resource_kind: 'RACK',
            resource_code: 'RACK-001',
            display_label: 'Rack RACK-001',
            evidence_kind: 'WES_ACTIVE_SNAPSHOT',
            station_code: 'TARGET_ARM',
            position_code: 'SINGLE_LAYER_A',
            rack_code: 'RACK-001'
          },
          {
            resource_kind: 'SLOT',
            resource_code: 'A',
            display_label: 'Slot A',
            evidence_kind: 'TRACE_RESOURCE_EVIDENCE',
            station_code: 'TARGET_ARM',
            position_code: 'SINGLE_LAYER_A',
            rack_code: 'RACK-001',
            slot_code: 'A',
            bin_code: 'BIN-001'
          },
          {
            resource_kind: 'CELL',
            resource_code: 'CELL-A1',
            display_label: 'Cell CELL-A1',
            evidence_kind: 'TRACE_RESOURCE_EVIDENCE',
            station_code: 'TARGET_ARM',
            position_code: 'SINGLE_LAYER_A',
            rack_code: 'RACK-001',
            slot_code: 'A',
            bin_code: 'BIN-001',
            reel_count: 1
          },
          {
            resource_kind: 'PKG',
            resource_code: 'PKG-BIN-SCOPED',
            display_label: 'PKG PKG-BIN-SCOPED',
            evidence_kind: 'TRACE_RESOURCE_EVIDENCE',
            station_code: 'TARGET_ARM',
            position_code: 'SINGLE_LAYER_A',
            rack_code: 'RACK-001',
            slot_code: 'A',
            bin_code: 'BIN-001',
            pkg_code: 'PKG-BIN-SCOPED'
          }
        ]
      }),
      manifest
    })

    const bin = model.positionGroups[0]?.rackLayouts[0]?.slots[0]?.bin

    expect(bin?.cells[0]?.materials).toEqual([])
    expect(bin?.cells[0]?.materialSummary?.reelCount).toBe(1)
    expect(bin?.looseMaterials.map(material => material.code)).toEqual(['PKG-BIN-SCOPED'])
  })

  it.each([
    ['WAITING_WMS', 'waiting'],
    ['TIMEOUT', 'blocked'],
    ['FAILED', 'blocked'],
    ['NONE', 'normal'],
    ['WMS_CALLBACK_RECEIVED', 'normal'],
    ['UNKNOWN', 'unknown']
  ] as const)('derives attentionState %s -> %s', (rackOperationWait, attentionState) => {
    const model = buildRuntimeSceneModel({
      projection: createDetail({ rack_operation_wait: rackOperationWait }),
      manifest
    })

    expect(model.positionGroups[0]?.attentionState).toBe(attentionState)
  })

  it('uses resource kind and resource code as a stack anchor when rack and bin are absent', () => {
    const model = buildRuntimeSceneModel({
      projection: createDetail({
        resource_evidence_items: [
          {
            resource_kind: 'CELL',
            resource_code: 'CELL-STANDALONE',
            display_label: 'Cell CELL-STANDALONE',
            evidence_kind: 'TRACE_RESOURCE_EVIDENCE',
            station_code: 'TARGET_ARM',
            position_code: 'SINGLE_LAYER_A'
          }
        ]
      }),
      manifest
    })

    expect(model.positionGroups[0]?.resourceStacks[0]).toEqual(
      expect.objectContaining({
        key: 'resource:CELL:CELL-STANDALONE',
        anchor: {
          kind: 'CELL',
          code: 'CELL-STANDALONE',
          displayLabel: 'Cell CELL-STANDALONE'
        }
      })
    )
  })

  it('uses bin code as a stack anchor when rack code is absent', () => {
    const model = buildRuntimeSceneModel({
      projection: createDetail({
        resource_evidence_items: [
          {
            resource_kind: 'BIN',
            resource_code: 'BIN-STANDALONE',
            display_label: 'Bin BIN-STANDALONE',
            evidence_kind: 'WMS_CALLBACK_EVIDENCE',
            station_code: 'TARGET_ARM',
            position_code: 'SINGLE_LAYER_A',
            bin_code: 'BIN-STANDALONE'
          }
        ]
      }),
      manifest
    })

    expect(model.positionGroups[0]?.resourceStacks[0]).toEqual(
      expect.objectContaining({
        key: 'bin:BIN-STANDALONE',
        anchor: {
          kind: 'BIN',
          code: 'BIN-STANDALONE',
          displayLabel: 'Bin BIN-STANDALONE'
        },
        auditItems: [expect.objectContaining({ resourceCode: 'BIN-STANDALONE' })]
      })
    )
  })

  it('keeps repeated child resources distinct when evidence context differs', () => {
    const model = buildRuntimeSceneModel({
      projection: createDetail({
        resource_evidence_items: [
          {
            resource_kind: 'RACK',
            resource_code: 'RACK-001',
            display_label: 'Rack RACK-001',
            evidence_kind: 'WES_ACTIVE_SNAPSHOT',
            station_code: 'TARGET_ARM',
            position_code: 'SINGLE_LAYER_A',
            rack_code: 'RACK-001'
          },
          {
            resource_kind: 'BIN',
            resource_code: 'BIN-001',
            display_label: 'Bin BIN-001',
            evidence_kind: 'WMS_CALLBACK_EVIDENCE',
            station_code: 'TARGET_ARM',
            position_code: 'SINGLE_LAYER_A',
            rack_code: 'RACK-001',
            bin_code: 'BIN-001',
            source_session_id: 20,
            source_trace_id: 'trace-20'
          },
          {
            resource_kind: 'BIN',
            resource_code: 'BIN-001',
            display_label: 'Bin BIN-001',
            evidence_kind: 'TRACE_RESOURCE_EVIDENCE',
            station_code: 'TARGET_ARM',
            position_code: 'SINGLE_LAYER_A',
            rack_code: 'RACK-001',
            bin_code: 'BIN-001',
            source_session_id: 21,
            source_trace_id: 'trace-21'
          }
        ]
      }),
      manifest
    })

    const stack = model.positionGroups[0]?.resourceStacks[0]
    const childEvidence = model.resourceEvidence.filter(item => item.resourceKind === 'BIN')

    expect(stack?.children.map(child => child.key)).toEqual(
      childEvidence.map(getRuntimeSceneEvidenceKey)
    )
    expect(stack?.children.map(child => child.evidenceKind)).toEqual([
      'WMS_CALLBACK_EVIDENCE',
      'TRACE_RESOURCE_EVIDENCE'
    ])
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
        projection: createDetail({
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
    const ngManifest = manifestWithBoundaries([
      {
        ...baseBoundary,
        station_role: 'TARGET_ARM',
        station_code: 'TARGET_ARM',
        business_demand_type: 'NG_PLACE'
      }
    ])
    const model = buildRuntimeSceneModel({
      projection: createDetail(),
      manifest: ngManifest
    })

    expect(model.boundaries[0]?.stationRole).toBe('TARGET_ARM')
    expect(model.boundaries.map(item => item.stationRole)).not.toContain(['NG', 'ARM'].join('_'))
  })

  it('maps legacy NG_ARM role data to TARGET_ARM before display', () => {
    const legacyManifest = manifestWithBoundaries([
      {
        ...baseBoundary,
        station_role: 'NG_ARM',
        station_code: 'NG_ARM',
        business_demand_type: 'NG_PLACE'
      }
    ])
    const model = buildRuntimeSceneModel({
      projection: createDetail({
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

  it('builds composite boundary keys while grouping duplicate physical positions once', () => {
    const duplicatePositionManifest = manifestWithBoundaries([
      {
        ...baseBoundary,
        station_role: 'SOURCE_ARM',
        station_code: 'SOURCE_ARM',
        position_code: 'SINGLE_LAYER_A'
      },
      {
        ...baseBoundary,
        station_role: 'SOURCE_ARM',
        station_code: 'SOURCE_ARM',
        position_code: 'SINGLE_LAYER_A',
        lease_scope: 'WORKSTATION',
        business_demand_type: 'SORTING_NG',
        wms_operation_type: 'RACK_RETURN'
      }
    ])

    const model = buildRuntimeSceneModel({
      projection: createDetail({
        resource_evidence_items: [
          {
            resource_kind: 'RACK',
            resource_code: 'RACK-010',
            display_label: 'Rack RACK-010',
            evidence_kind: 'WES_ACTIVE_SNAPSHOT',
            station_code: 'SOURCE_ARM',
            position_code: 'SINGLE_LAYER_A',
            rack_code: 'RACK-010'
          },
          {
            resource_kind: 'BIN',
            resource_code: 'BIN-010',
            display_label: 'Bin BIN-010',
            evidence_kind: 'WMS_CALLBACK_EVIDENCE',
            station_code: 'SOURCE_ARM',
            position_code: 'SINGLE_LAYER_A',
            rack_code: 'RACK-010',
            bin_code: 'BIN-010'
          }
        ]
      }),
      manifest: duplicatePositionManifest
    })

    expect(new Set(model.boundaries.map(item => item.key)).size).toBe(2)
    expect(model.boundaries.map(item => item.key)).toEqual([
      'SOURCE_ARM:SOURCE_ARM:SINGLE_LAYER_A:SINGLE_LAYER:ACTIVE_BIN_RACK:POSITION:SORTING_TARGET:RACK_MOVE',
      'SOURCE_ARM:SOURCE_ARM:SINGLE_LAYER_A:SINGLE_LAYER:ACTIVE_BIN_RACK:WORKSTATION:SORTING_NG:RACK_RETURN'
    ])
    expect(model.positionGroups).toHaveLength(1)
    expect(model.positionGroups[0]?.key).toBe(model.boundaries[0]?.key)
    expect(model.positionGroups[0]?.auditItems.map(item => item.resourceCode)).toEqual([
      'RACK-010',
      'BIN-010'
    ])
    expect(model.positionGroups[0]?.resourceStacks).toHaveLength(1)
  })

  it('keeps shared rack-kind resources separated by manifest position code', () => {
    const sharedPositionManifest = manifestWithBoundaries([
      {
        ...baseBoundary,
        station_role: 'SOURCE_ARM',
        station_code: 'SOURCE_ARM',
        position_code: 'SOURCE_LAYER_SHARED'
      },
      {
        ...baseBoundary,
        station_role: 'TARGET_ARM',
        station_code: 'TARGET_ARM',
        position_code: 'TARGET_LAYER_SHARED'
      }
    ])

    const model = buildRuntimeSceneModel({
      projection: createDetail({
        resource_evidence_items: [
          {
            resource_kind: 'RACK',
            resource_code: 'RACK-SOURCE',
            display_label: 'Rack RACK-SOURCE',
            evidence_kind: 'WES_ACTIVE_SNAPSHOT',
            station_code: 'SOURCE_ARM',
            position_code: 'SOURCE_LAYER_SHARED',
            rack_code: 'RACK-SOURCE'
          },
          {
            resource_kind: 'RACK',
            resource_code: 'RACK-TARGET',
            display_label: 'Rack RACK-TARGET',
            evidence_kind: 'WES_ACTIVE_SNAPSHOT',
            station_code: 'TARGET_ARM',
            position_code: 'TARGET_LAYER_SHARED',
            rack_code: 'RACK-TARGET'
          }
        ]
      }),
      manifest: sharedPositionManifest
    })

    expect(model.positionGroups.map(group => group.stationCode)).toEqual([
      'SOURCE_ARM',
      'TARGET_ARM'
    ])
    expect(
      model.positionGroups.map(group => group.auditItems.map(item => item.resourceCode))
    ).toEqual([['RACK-SOURCE'], ['RACK-TARGET']])
  })

  it('assigns stationless positioned evidence to a unique matching manifest boundary', () => {
    const model = buildRuntimeSceneModel({
      projection: createDetail({
        resource_evidence_items: [
          {
            resource_kind: 'RACK',
            resource_code: 'RACK-STATIONLESS',
            display_label: 'Rack RACK-STATIONLESS',
            evidence_kind: 'WES_ACTIVE_SNAPSHOT',
            position_code: 'SINGLE_LAYER_A',
            rack_code: 'RACK-STATIONLESS'
          }
        ]
      }),
      manifest
    })

    expect(model.boundaries[0]?.evidenceCount).toBe(1)
    expect(model.positionGroups).toHaveLength(1)
    expect(model.positionGroups[0]).toEqual(
      expect.objectContaining({
        key: model.boundaries[0]?.key,
        stationCode: 'TARGET_ARM',
        positionCode: 'SINGLE_LAYER_A'
      })
    )
    expect(model.positionGroups[0]?.auditItems.map(item => item.resourceCode)).toEqual([
      'RACK-STATIONLESS'
    ])
    expect(model.unlocatedAuditItems).toEqual([])
  })

  it('assigns stationless positioned evidence to duplicate resource contracts on one position', () => {
    const sharedPositionManifest = manifestWithBoundaries([
      {
        ...baseBoundary,
        station_role: 'SOURCE_ARM',
        station_code: 'SOURCE_ARM',
        position_code: 'SINGLE_LAYER_SHARED'
      },
      {
        ...baseBoundary,
        station_role: 'SOURCE_ARM',
        station_code: 'SOURCE_ARM',
        position_code: 'SINGLE_LAYER_SHARED',
        lease_scope: 'WORKSTATION',
        business_demand_type: 'SORTING_NG',
        wms_operation_type: 'RACK_RETURN'
      }
    ])

    const model = buildRuntimeSceneModel({
      projection: createDetail({
        resource_evidence_items: [
          {
            resource_kind: 'RACK',
            resource_code: 'RACK-STATIONLESS',
            display_label: 'Rack RACK-STATIONLESS',
            evidence_kind: 'WES_ACTIVE_SNAPSHOT',
            position_code: 'SINGLE_LAYER_SHARED',
            rack_code: 'RACK-STATIONLESS'
          }
        ]
      }),
      manifest: sharedPositionManifest
    })

    expect(model.boundaries.map(boundary => boundary.evidenceCount)).toEqual([1, 1])
    expect(model.unlocatedAuditItems).toEqual([])

    const groupsWithEvidence = model.positionGroups.filter(group => group.auditItems.length > 0)
    expect(groupsWithEvidence).toHaveLength(1)
    expect(groupsWithEvidence[0]).toEqual(
      expect.objectContaining({
        key: model.boundaries[0]?.key,
        stationCode: 'SOURCE_ARM',
        positionCode: 'SINGLE_LAYER_SHARED'
      })
    )
    expect(groupsWithEvidence[0]?.auditItems.map(item => item.resourceCode)).toEqual([
      'RACK-STATIONLESS'
    ])
  })

  it('falls back to generic evidence when contract fields or manifest are missing', () => {
    const projection = createDetail() as any
    delete projection.boundary.station_lease
    delete projection.boundary.rack_operation_wait
    delete projection.resource_evidence.kind

    const model = buildRuntimeSceneModel({
      projection,
      manifest: null
    })

    expect(model.semanticFallback).toBe(true)
    expect(model.semanticFallbackMessage).toContain('运行态边界字段未加载')
    expect(model.boundaries[0]?.stationLeaseLabel).toBe('Station lease：语义未加载')
    expect(model.boundaries[0]?.rackOperationWaitLabel).toBe('Rack operation：语义未加载')
    expect(model.boundaries[0]?.resourceEvidenceKindLabel).toBe('通用 evidence')
  })

  it.each([
    ['items', 'resource_evidence'],
    ['total_count', 'resource_evidence'],
    ['truncated', 'resource_evidence']
  ])('uses generated defaults when optional evidence field %s is missing', (field, section) => {
    const projection = createDetail() as any
    delete projection[section][field]

    const model = buildRuntimeSceneModel({
      projection,
      manifest
    })

    expect(model.semanticFallback).toBe(false)
    expect(model.boundaries[0]?.stationLeaseLabel).toBe('Station lease：调度租约占用')
    expect(model.boundaries[0]?.resourceEvidenceKindLabel).toBe('WMS 回调证据')
  })

  it('reports semantic fallback when a required semantic contract field is missing', () => {
    const projection = createDetail() as any
    delete projection.resource_evidence.kind

    const model = buildRuntimeSceneModel({
      projection,
      manifest
    })

    expect(model.semanticFallback).toBe(true)
    expect(model.semanticFallbackMessage).toContain('运行态边界字段未加载')
  })

  it('reports semantic fallback when evidence contract field shapes are invalid', () => {
    const projection = createDetail() as any
    projection.resource_evidence.items = {}
    projection.resource_evidence.total_count = Number.NaN
    projection.resource_evidence.truncated = 'false'

    const model = buildRuntimeSceneModel({
      projection,
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
      projection: createDetail(),
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
      projection: createDetail(),
      manifest: null
    })

    expect(model.semanticFallback).toBe(true)
    expect(model.semanticFallbackMessage).toContain('manifest/resource boundaries')
    expect(model.boundaries[0]).toEqual(
      expect.objectContaining({
        stationLeaseLabel: 'Station lease：语义未加载',
        rackSnapshotLabel: '执行快照：语义未加载',
        rackOperationWaitLabel: 'Rack operation：语义未加载',
        resourceEvidenceKindLabel: '通用 evidence'
      })
    )
  })

  it('does not derive boundaries from command position args when manifest resource boundaries are absent', () => {
    const commandOnlyManifest = {
      plugin_key: 'rough_sorter',
      contract_version: 'v1',
      devices: [],
      events: [],
      commands: [
        {
          command: 'MOVE_RACK_TO_TARGET',
          target_device_role: 'TARGET_ARM',
          payload_schema_ref: 'schemas/commands/move-rack-to-target.json',
          rack_position_args: [
            {
              name: 'target_position',
              rack_position_ref: 'COMMAND_ONLY_POSITION'
            }
          ],
          result_bindings: []
        }
      ],
      rack_positions: [
        {
          code: 'COMMAND_ONLY_POSITION',
          role: 'TARGET_ARM',
          station_code: 'TARGET_ARM',
          carrier_capability: {
            min_capacity: 0,
            max_capacity: 1,
            allowed_rack_kinds: ['SINGLE_LAYER'],
            allowed_slot_kinds: ['BIN_SLOT']
          }
        }
      ],
      resource_boundaries: [],
      topology: {
        flow_edges: [
          {
            type: 'material_flow',
            from_node: { kind: 'DEVICE_ROLE', ref: 'TARGET_ARM' },
            to_node: { kind: 'RACK_POSITION', ref: 'COMMAND_ONLY_POSITION' }
          }
        ]
      }
    } as unknown as WorkLinePluginManifestSummary

    const model = buildRuntimeSceneModel({
      projection: createDetail({
        resource_evidence_items: [],
        resource_evidence_total_count: 0,
        resource_evidence_truncated: false
      }),
      manifest: commandOnlyManifest
    })

    expect(model.semanticFallback).toBe(true)
    expect(model.semanticFallbackMessage).toContain('manifest/resource boundaries')
    expect(model.boundaries).toEqual([])
    expect(model.positionGroups).toEqual([])
    // COMMAND_ONLY_POSITION may legitimately appear in topologyNodes/topologyEdges
    // (T4: scene model consumes manifest.topology.flow_edges), but must not leak
    // into boundaries / position groups / resource layout.
    expect(model.unlocatedAuditItems).toEqual([])
    expect(model.resourceEvidence).toEqual([])
  })

  it('keeps no-manifest station and position evidence in one fallback physical group', () => {
    const model = buildRuntimeSceneModel({
      projection: createDetail({
        resource_evidence_items: [
          {
            resource_kind: 'RACK',
            resource_code: 'RACK-NO-MANIFEST',
            display_label: 'Rack RACK-NO-MANIFEST',
            evidence_kind: 'WES_ACTIVE_SNAPSHOT',
            station_code: 'TARGET_ARM',
            position_code: 'SINGLE_LAYER_A',
            rack_code: 'RACK-NO-MANIFEST'
          }
        ]
      }),
      manifest: null
    })

    expect(model.boundaries).toHaveLength(1)
    expect(model.boundaries[0]).toEqual(
      expect.objectContaining({
        stationCode: 'TARGET_ARM',
        positionCode: 'SINGLE_LAYER_A',
        evidenceCount: 1
      })
    )
    expect(model.positionGroups).toHaveLength(1)
    expect(model.positionGroups[0]).toEqual(
      expect.objectContaining({
        key: model.boundaries[0]?.key,
        stationCode: 'TARGET_ARM',
        positionCode: 'SINGLE_LAYER_A'
      })
    )
    expect(model.positionGroups[0]?.auditItems.map(item => item.resourceCode)).toEqual([
      'RACK-NO-MANIFEST'
    ])
    expect(model.positionGroups[0]?.resourceStacks).toHaveLength(1)
    expect(model.positionGroups[0]?.resourceStacks[0]).toEqual(
      expect.objectContaining({
        rackCode: 'RACK-NO-MANIFEST',
        evidenceCount: 1
      })
    )
    expect(model.positionGroups[0]?.rackLayouts).toHaveLength(0)
  })

  it('keeps no-manifest mixed station-scoped and stationless evidence out of empty duplicate groups', () => {
    const model = buildRuntimeSceneModel({
      projection: createDetail({
        resource_evidence_items: [
          {
            resource_kind: 'RACK',
            resource_code: 'RACK-SCOPED',
            display_label: 'Rack RACK-SCOPED',
            evidence_kind: 'WES_ACTIVE_SNAPSHOT',
            station_code: 'TARGET_ARM',
            position_code: 'SINGLE_LAYER_A',
            rack_code: 'RACK-SCOPED'
          },
          {
            resource_kind: 'RACK',
            resource_code: 'RACK-STATIONLESS',
            display_label: 'Rack RACK-STATIONLESS',
            evidence_kind: 'TRACE_RESOURCE_EVIDENCE',
            position_code: 'SINGLE_LAYER_A',
            rack_code: 'RACK-STATIONLESS'
          }
        ]
      }),
      manifest: null
    })

    expect(model.boundaries.map(boundary => boundary.evidenceCount)).toEqual([1, 1])
    expect(
      model.positionGroups.map(group => group.auditItems.map(item => item.resourceCode))
    ).toEqual([['RACK-SCOPED'], ['RACK-STATIONLESS']])
    expect(model.positionGroups.every(group => group.auditItems.length > 0)).toBe(true)
    expect(
      model.positionGroups.flatMap(group => group.auditItems.map(item => item.resourceCode))
    ).toEqual(['RACK-SCOPED', 'RACK-STATIONLESS'])
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

  it('builds distinct resource evidence keys for the same resource in different stations', () => {
    const source = getRuntimeSceneEvidenceKey({
      resourceKind: 'BIN',
      resourceKindLabel: 'Bin',
      resourceCode: 'BIN-001',
      displayLabel: 'BIN BIN-001',
      evidenceKind: 'WMS_CALLBACK_EVIDENCE',
      evidenceKindLabel: 'WMS 回调证据',
      stationCode: 'SOURCE_ARM',
      positionCode: 'SINGLE_LAYER_SHARED',
      sourceSessionId: 20,
      sourceTraceId: 'trace-20'
    })
    const target = getRuntimeSceneEvidenceKey({
      resourceKind: 'BIN',
      resourceKindLabel: 'Bin',
      resourceCode: 'BIN-001',
      displayLabel: 'BIN BIN-001',
      evidenceKind: 'WMS_CALLBACK_EVIDENCE',
      evidenceKindLabel: 'WMS 回调证据',
      stationCode: 'TARGET_ARM',
      positionCode: 'SINGLE_LAYER_SHARED',
      sourceSessionId: 20,
      sourceTraceId: 'trace-20'
    })

    expect(source).not.toBe(target)
  })

  describe('topology model from manifest', () => {
    function createTopologyManifest(overrides: {
      flow_edges: Array<{
        type: string
        from_node: { kind: string; ref: string }
        to_node: { kind: string; ref: string }
      }>
      rack_position_codes: string[]
    }): WorkLinePluginManifestSummary {
      return {
        plugin_key: 'rough_sorter',
        contract_version: 'v1',
        devices: [],
        events: [],
        commands: [],
        topology: { flow_edges: overrides.flow_edges },
        rack_positions: overrides.rack_position_codes.map(code => ({
          code,
          role: 'TARGET_ARM',
          station_code: 'TARGET_ARM',
          carrier_capability: {
            allowed_rack_kinds: ['SINGLE_LAYER'],
            allowed_slot_kinds: [],
            min_capacity: 0,
            max_capacity: 1
          }
        })),
        resource_boundaries: []
      } as unknown as WorkLinePluginManifestSummary
    }

    it('maps DEVICE_ROLE -> RACK_POSITION flow edge with resolved nodes', () => {
      const manifestWithDeviceFlow = createTopologyManifest({
        rack_position_codes: ['SINGLE_LAYER_A'],
        flow_edges: [
          {
            type: 'material_flow',
            from_node: { kind: 'DEVICE_ROLE', ref: 'ARM' },
            to_node: { kind: 'RACK_POSITION', ref: 'SINGLE_LAYER_A' }
          }
        ]
      })

      const model = buildRuntimeSceneModel({
        projection: createDetail(),
        manifest: manifestWithDeviceFlow
      })

      expect(model.topologyEdges).toEqual([
        {
          key: 'DEVICE_ROLE:ARM->RACK_POSITION:SINGLE_LAYER_A:MATERIAL_FLOW',
          fromNode: { kind: 'DEVICE_ROLE', ref: 'ARM', resolved: true },
          toNode: { kind: 'RACK_POSITION', ref: 'SINGLE_LAYER_A', resolved: true },
          type: 'MATERIAL_FLOW'
        }
      ])
      expect(model.topologyNodes).toEqual([
        { kind: 'DEVICE_ROLE', ref: 'ARM', resolved: true },
        { kind: 'RACK_POSITION', ref: 'SINGLE_LAYER_A', resolved: true }
      ])
      expect(model.topologyDiagnostics).toEqual([])
    })

    it('maps RACK_POSITION -> RACK_POSITION operation edge with stable key order', () => {
      const manifestWithRackToRack = createTopologyManifest({
        rack_position_codes: ['SOURCE_POS', 'TARGET_POS'],
        flow_edges: [
          {
            type: 'OPERATION',
            from_node: { kind: 'RACK_POSITION', ref: 'SOURCE_POS' },
            to_node: { kind: 'RACK_POSITION', ref: 'TARGET_POS' }
          }
        ]
      })

      const model = buildRuntimeSceneModel({
        projection: createDetail(),
        manifest: manifestWithRackToRack
      })

      expect(model.topologyEdges).toHaveLength(1)
      expect(model.topologyEdges[0]).toEqual({
        key: 'RACK_POSITION:SOURCE_POS->RACK_POSITION:TARGET_POS:OPERATION',
        fromNode: { kind: 'RACK_POSITION', ref: 'SOURCE_POS', resolved: true },
        toNode: { kind: 'RACK_POSITION', ref: 'TARGET_POS', resolved: true },
        type: 'OPERATION'
      })
      expect(model.topologyNodes.map(node => node.ref)).toEqual(['SOURCE_POS', 'TARGET_POS'])
      expect(model.topologyDiagnostics).toEqual([])
    })

    it('emits MANIFEST_MISSING diagnostic and empty edges when manifest is null', () => {
      const model = buildRuntimeSceneModel({
        projection: createDetail(),
        manifest: null
      })

      expect(model.topologyEdges).toEqual([])
      expect(model.topologyNodes).toEqual([])
      expect(model.topologyDiagnostics).toEqual([
        expect.objectContaining({ code: 'MANIFEST_MISSING' })
      ])
    })

    it('emits MANIFEST_LOAD_FAILED diagnostic when manifestLoadFailed is true', () => {
      const model = buildRuntimeSceneModel({
        projection: createDetail(),
        manifest: undefined,
        manifestLoadFailed: true
      })

      expect(model.topologyEdges).toEqual([])
      expect(model.topologyNodes).toEqual([])
      expect(model.topologyDiagnostics).toEqual([
        expect.objectContaining({ code: 'MANIFEST_LOAD_FAILED' })
      ])
    })

    it('drops edges with unknown DEVICE_ROLE / RACK_POSITION refs without throwing', () => {
      const manifestWithUnknownRefs = createTopologyManifest({
        rack_position_codes: ['SINGLE_LAYER_A'],
        flow_edges: [
          {
            type: 'material_flow',
            from_node: { kind: 'DEVICE_ROLE', ref: 'UNKNOWN_ROLE' },
            to_node: { kind: 'RACK_POSITION', ref: 'SINGLE_LAYER_A' }
          },
          {
            type: 'material_flow',
            from_node: { kind: 'DEVICE_ROLE', ref: 'ARM' },
            to_node: { kind: 'RACK_POSITION', ref: 'UNKNOWN_POSITION' }
          }
        ]
      })

      const model = buildRuntimeSceneModel({
        projection: createDetail(),
        manifest: manifestWithUnknownRefs
      })

      expect(model.topologyEdges).toEqual([])
      expect(model.topologyDiagnostics).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ code: 'UNKNOWN_DEVICE_ROLE', ref: 'UNKNOWN_ROLE' }),
          expect.objectContaining({ code: 'UNKNOWN_RACK_POSITION', ref: 'UNKNOWN_POSITION' })
        ])
      )
      expect(
        model.topologyNodes.find(node => node.kind === 'DEVICE_ROLE' && node.ref === 'UNKNOWN_ROLE')
      ).toEqual({ kind: 'DEVICE_ROLE', ref: 'UNKNOWN_ROLE', resolved: false })
      expect(
        model.topologyNodes.find(
          node => node.kind === 'RACK_POSITION' && node.ref === 'UNKNOWN_POSITION'
        )
      ).toEqual({ kind: 'RACK_POSITION', ref: 'UNKNOWN_POSITION', resolved: false })
    })
  })
})

describe('buildRuntimeSceneModel — HIDDEN_TOPOLOGY_ROLES', () => {
  it('exposes CLASSIFIER_WORK in HIDDEN_TOPOLOGY_ROLES by default', () => {
    expect(HIDDEN_TOPOLOGY_ROLES.has('CLASSIFIER_WORK')).toBe(true)
  })

  it('excludes devices whose device_role matches HIDDEN_TOPOLOGY_ROLES from deviceNodes', () => {
    const projection = createDetail({
      devices: [
        {
          id: 1,
          device_code: 'ST-01',
          device_name: '工位 1',
          device_role: 'STATION',
          role_index: 0,
          device_status: 'ONLINE',
          maintenance_mode: false,
          pending_command_count: 0
        },
        {
          id: 2,
          device_code: 'CLS-01',
          device_name: '分类工位',
          device_role: 'CLASSIFIER_WORK',
          role_index: 1,
          device_status: 'ONLINE',
          maintenance_mode: false,
          pending_command_count: 0
        },
        {
          id: 3,
          device_code: 'OUT-01',
          device_name: '出料',
          device_role: 'CONVEYOR_OUT',
          role_index: 2,
          device_status: 'ONLINE',
          maintenance_mode: false,
          pending_command_count: 0
        }
      ]
    })

    const model = buildRuntimeSceneModel({ projection, manifest })
    const ids = model.deviceNodes.map(d => d.id)
    expect(ids).toContain(1)
    expect(ids).toContain(3)
    expect(ids).not.toContain(2)
  })

  it('matches case-insensitively (lowercase device_role still filtered)', () => {
    const projection = createDetail({
      devices: [
        {
          id: 99,
          device_code: 'CLS-99',
          device_name: '分类工位',
          device_role: 'classifier_work',
          role_index: 0,
          device_status: 'ONLINE',
          maintenance_mode: false,
          pending_command_count: 0
        }
      ]
    })
    const model = buildRuntimeSceneModel({ projection, manifest })
    expect(model.deviceNodes).toHaveLength(0)
  })
})
