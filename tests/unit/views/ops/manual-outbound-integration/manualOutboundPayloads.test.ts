import { describe, expect, it } from 'vitest'
import type { IntegrationRun } from '@/api/manualOutboundIntegrationApi'
import {
  buildDefaultDeviceData,
  buildDefaultWmsData,
  buildRackTransportResources,
  buildInboundBatchTransport,
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
  it('selects outbound templates and faces from plan resource roles', () => {
    const resources = buildRackTransportResources({
      ...run,
      plan_resources: {
        plan_revision: 1,
        target_rack: { rack_id: '610007', rack_face: '90' },
        direct_picks: [],
        bin_source_racks: [
          { rack_id: '510002', rack_face: '90', plan_revision: 1 },
          { rack_id: '510012', rack_face: '270', plan_revision: 1 }
        ]
      },
      site_configuration: {
        ...run.site_configuration,
        outbound_transfer_position: 'OUT65',
        bin_rack_positions: ['KT16', 'KT17']
      }
    })
    expect(resources).toEqual([
      { rackId: '610007', role: '转运货架', template: 'F01', target: 'OUT65', face: '90' },
      { rackId: '510002', role: '五层货架', template: 'CTU01', target: 'KT16', face: '90' },
      { rackId: '510012', role: '五层货架', template: 'CTU01', target: 'KT17', face: '270' }
    ])
    expect(buildRackTransportResources({ ...run, plan_resources: null })).toEqual([])
  })

  it('leaves extra rack destinations unselected and preserves opaque faces', () => {
    const resources = buildRackTransportResources({
      ...run,
      plan_resources: {
        plan_revision: 1,
        target_rack: { rack_id: '610007', rack_face: ' 90 ' },
        direct_picks: [],
        bin_source_racks: ['510002', '510012', '510013'].map(rack_id => ({
          rack_id,
          rack_face: '270',
          plan_revision: 1
        }))
      },
      site_configuration: {
        ...run.site_configuration,
        bin_rack_positions: ['KT16', 'KT17']
      }
    })
    expect(resources[0]?.face).toBe(' 90 ')
    expect(resources[3]?.target).toBe('')
  })

  it('builds the exact editable WMS data for the selected node', () => {
    expect(buildDefaultWmsData(run, 'TASK_PREPARE')).toEqual({
      task_id: 'TASK-001',
      workline_code: 'KT16'
    })
    expect(buildDefaultWmsData(run, 'WORK_ADMISSION')).toEqual({
      task_id: 'TASK-001',
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

describe('whole inbound batch transport', () => {
  it.each([1, 2, 4])('uses all %i WMS bins from their exact source slots', count => {
    const bins = Array.from({ length: count }, (_, index) => ({
      bin_code: `BIN-${index}`,
      source_locator: {
        type: 'RACK_BIN_SLOT',
        rack_id: '510012',
        rack_face: '270',
        slot_id: `SLOT-${index}`
      }
    }))
    const batch = buildInboundBatchTransport({
      ...run,
      operation_context: { inbound_bins: bins },
      site_configuration: { ...run.site_configuration, infeed_position: 'CNV0301' }
    })
    expect(batch.bins).toEqual(bins)
    expect(batch.action).toEqual({
      kind: 'MOVE_BINS',
      rack_id: '510012',
      source: { kind: 'RACK', location_code: '510012' },
      target: { kind: 'HANDOFF_POSITION', location_code: 'CNV0301' }
    })
  })
  it('does not allow feeding without a saved WMS batch', () => {
    expect(() => buildInboundBatchTransport(run)).toThrow('WMS')
  })
})
