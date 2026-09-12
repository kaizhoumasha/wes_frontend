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
    admission_task_id: 'WORK-001',
    current_source_rack: { rack_id: '510012', rack_face: '270' }
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
        bin_rack_positions: ['KT16']
      }
    })
    expect(resources).toEqual([
      { rackId: '610007', role: '转运货架', template: 'F01', target: 'OUT65', face: '90' },
      { rackId: '510002', role: '五层货架', template: 'CTU01', target: 'KT16', face: '90' },
      { rackId: '510012', role: '五层货架', template: 'CTU01', target: 'KT16', face: '270' }
    ])
    expect(buildRackTransportResources({ ...run, plan_resources: null })).toEqual([])
  })

  it('reuses the single five-rack work position and preserves opaque faces', () => {
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
        bin_rack_positions: ['KT16']
      }
    })
    expect(resources[0]?.face).toBe(' 90 ')
    expect(resources[3]?.target).toBe('KT16')
  })

  it('shows one source-rack option and uses its active face', () => {
    const resources = buildRackTransportResources({
      ...run,
      plan_resources: {
        plan_revision: 2,
        target_rack: { rack_id: '610007', rack_face: '90' },
        direct_picks: [],
        bin_source_racks: [
          { rack_id: '510012', rack_face: '270', plan_revision: 2 },
          { rack_id: '510012', rack_face: '90', plan_revision: 1 }
        ]
      },
      operation_context: {
        current_source_rack: { rack_id: '510012', rack_face: '270' }
      },
      site_configuration: {
        ...run.site_configuration,
        bin_rack_positions: ['KT16']
      }
    })

    expect(resources).toHaveLength(2)
    expect(resources[1]).toMatchObject({ rackId: '510012', face: '270', target: 'KT16' })
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
    expect(buildDefaultWmsData(run, 'BIN_INBOUND_BATCH')).toEqual({
      task_id: 'TASK-001',
      rack_id: '510012',
      rack_face: '270',
      max_bin_count: 4
    })
    expect(buildDefaultWmsData(run, 'BIN_RETURN_BATCH')).toEqual({
      workline_code: 'KT16',
      rack_id: '510012',
      rack_face: '270',
      return_candidates: [
        {
          sequence_no: 1,
          bin_code: 'BIN-001',
          source: { type: 'HANDOFF_POSITION', location_code: 'OUT-EDITABLE' }
        }
      ]
    })
    expect(
      buildDefaultWmsData(
        {
          ...run,
          operation_context: {
            ...run.operation_context,
            departure_candidate: {
              rack_id: '510012',
              rack_face: '270',
              current_location: 'KT16',
              role: 'SOURCE_RACK'
            }
          }
        },
        'RACK_DEPARTURE'
      )
    ).toEqual({
      task_id: 'TASK-001',
      rack_id: '510012',
      current_location: { type: 'RACK_POSITION', location_code: 'KT16' },
      current_face: '270'
    })
    expect(
      buildDefaultWmsData(
        {
          ...run,
          operation_context: {
            ...run.operation_context,
            departure_candidate: {
              rack_id: '610007',
              rack_face: '90',
              current_location: 'OUT65',
              role: 'TARGET_RACK'
            }
          }
        },
        'RACK_DEPARTURE'
      )
    ).toEqual({
      task_id: 'TASK-001',
      rack_id: '610007',
      current_location: { type: 'RACK_POSITION', location_code: 'OUT65' },
      current_face: '90'
    })
  })

  it('does not guess the current physical source from the first planned rack', () => {
    const historicalRun = { ...run, operation_context: {} }

    expect(buildDefaultWmsData(historicalRun, 'BIN_INBOUND_BATCH')).toMatchObject({
      rack_id: '',
      rack_face: ''
    })
    expect(buildDefaultWmsData(historicalRun, 'BIN_RETURN_BATCH')).toMatchObject({
      rack_id: '',
      rack_face: ''
    })
    expect(buildDefaultWmsData(historicalRun, 'RACK_DEPARTURE')).toEqual({
      task_id: 'TASK-001',
      rack_id: '',
      current_location: { type: 'RACK_POSITION', location_code: '' },
      current_face: ''
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
