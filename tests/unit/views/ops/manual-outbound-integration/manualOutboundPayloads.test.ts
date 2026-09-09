import { describe, expect, it } from 'vitest'
import type { IntegrationRun } from '@/api/manualOutboundIntegrationApi'
import {
  buildDefaultDeviceData,
  buildDefaultWmsData,
  parseEditableJsonObject
} from '@/views/ops/manual-outbound-integration/manualOutboundPayloads'

const run = {
  task_id: 'TASK-001',
  workline_code: 'KT16',
  bin_code: 'BIN-001',
  operation_context: {
    admission_task_id: 'WORK-001'
  },
  site_configuration: {
    outfeed_position: 'OUT-EDITABLE',
    outbound_transfer_position: 'TRANSFER-EDITABLE',
    scan_device_codes: ['SCAN-1', 'SCAN-2', 'SCAN-3', 'SCAN-4']
  },
  steps: [
    {
      phase: 'POINT2_SCAN',
      result: { bin_code: 'BIN-001', scanned_at: 1788980000000 }
    }
  ]
} as IntegrationRun

describe('manual outbound editable payloads', () => {
  it('builds the exact editable WMS data for the selected node', () => {
    expect(buildDefaultWmsData(run, 'TASK_PREPARE')).toEqual({
      task_id: 'TASK-001',
      workline_code: 'KT16'
    })
    expect(buildDefaultWmsData(run, 'WORK_ADMISSION')).toEqual({
      bin_code: 'BIN-001',
      scanned_at: 1788980000000
    })
  })

  it('builds an editable ECS command while leaving technical identity to WES', () => {
    expect(buildDefaultDeviceData(run, 'POINT3_ROUTE')).toEqual({
      device_code: 'SCAN-3',
      task_type: 'MOVE_FORWARD',
      params: {},
      timeout_ms: 30000,
      reason: '人工出库现场联调'
    })
  })

  it('accepts only a JSON object', () => {
    expect(parseEditableJsonObject('{"rack_id":"RACK-01"}', 'WMS data')).toEqual({
      rack_id: 'RACK-01'
    })
    expect(() => parseEditableJsonObject('[]', 'WMS data')).toThrow('WMS data 必须是 JSON object')
  })
})
