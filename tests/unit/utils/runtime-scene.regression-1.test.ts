import { describe, expect, it } from 'vitest'
import { buildRuntimeSceneModel } from '@/utils/runtime-scene'
import type { RuntimeWorklineDetailResponse, WorkLinePluginManifestSummary } from '@/types/runtime'

const manifest: WorkLinePluginManifestSummary = {
  plugin_key: 'smt_sorting_inbound',
  contract_version: 'v1',
  single_layer_boundaries: [
    {
      station_role: 'TARGET',
      station_code: 'TARGET_STATION',
      position_code: 'TARGET_STATION',
      rack_kind: 'SINGLE_LAYER',
      snapshot_kind: 'ACTIVE_BIN_RACK',
      lease_scope: 'POSITION',
      business_demand_type: 'SORTING_NG',
      wms_operation_type: 'RACK_MOVE'
    }
  ],
  required_device_roles: [],
  supported_events: [],
  supported_commands: []
}

function createDetail(): RuntimeWorklineDetailResponse {
  return {
    summary: {
      id: 2,
      line_code: 'WL-SMT-SORTING-INBOUND-TEST',
      line_name: '测试 SMT 分拣入库作业线',
      line_type: 'SORTING',
      is_active: true,
      device_count: 1,
      active_session_count: 0,
      waiting_session_count: 0,
      failed_session_count: 0,
      error_device_count: 0,
      offline_device_count: 0,
      maintenance_device_count: 0,
      run_mode: 'SIMULATION',
      runtime_status: 'STOPPED',
      plugin_key: 'smt_sorting_inbound'
    },
    workline_readiness: 'NOT_READY',
    station_lease: 'IDLE',
    single_layer_rack_snapshot: 'MISSING',
    rack_operation_wait: 'NONE',
    resource_evidence_kind: 'GENERIC_EVIDENCE',
    resource_evidence_items: [],
    resource_evidence_total_count: 0,
    resource_evidence_truncated: false,
    devices: [
      {
        id: 203,
        device_code: 'SORT-NG-ARM-01',
        device_name: '测试 SMT 分拣入库 NG 机械臂',
        device_role: 'SORTING_NG_ARM',
        role_index: 1,
        device_status: 'IDLE',
        maintenance_mode: false,
        pending_command_count: 0
      }
    ],
    active_sessions: [],
    recent_failed_traces: [],
    recent_completed_traces: []
  }
}

describe('runtime scene QA regressions', () => {
  it('maps prefixed NG arm device roles to target arm display roles', () => {
    // Regression: ISSUE-001 — /runtime/monitor displayed SORTING_NG_ARM as an independent arm.
    // Found by /qa on 2026-06-08.
    const model = buildRuntimeSceneModel({
      detail: createDetail(),
      manifest
    })

    expect(model.deviceNodes[0]?.deviceRole).toBe('SORTING_TARGET_ARM')
    expect(model.deviceNodes[0]?.deviceName).toContain('目标机械臂')
    expect(model.deviceNodes[0]?.deviceName).not.toContain(' 目标机械臂')
    expect(JSON.stringify(model)).not.toContain('NG_ARM')
    expect(JSON.stringify(model)).not.toContain('NG 机械臂')
  })
})
