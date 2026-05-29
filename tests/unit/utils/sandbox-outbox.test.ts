import { describe, expect, it } from 'vitest'
import {
  buildSandboxExternalCallbackPayload,
  resolveSandboxExternalCallbackType
} from '@/utils/sandbox-outbox'
import type { SandboxPendingOutbox } from '@/types/runtime'

function createExternalOutbox(overrides: Partial<SandboxPendingOutbox> = {}): SandboxPendingOutbox {
  return {
    id: 4,
    session_id: 1,
    workline_id: 45,
    dispatch_key: 'rack-operation:external:trace-001:1:ALLOCATE_AND_MOVE_RACK',
    dispatch_type: 'EXTERNAL_HTTP',
    target_type: 'EXTERNAL_SYSTEM',
    target_code: 'WMS_RCS_RACK_OPERATION',
    status: 'SENT',
    payload_json: {
      callback_type: 'WMS_RACK_ARRIVED',
      operation_key: 'external:smt_rack_bin:trace-001:RACK_OPERATION',
      target_position_code: 'SINGLE_LAYER_A',
      rack_code: 'RACK-001',
      rack_kind: 'SINGLE_LAYER'
    },
    is_current_action: true,
    is_actionable: true,
    ...overrides
  }
}

describe('sandbox-outbox external callback helpers', () => {
  it('builds editable callback payload from external HTTP outbox business data', () => {
    const outbox = createExternalOutbox()

    expect(resolveSandboxExternalCallbackType(outbox)).toBe('WMS_RACK_ARRIVED')
    expect(buildSandboxExternalCallbackPayload(outbox)).toMatchObject({
      callback_type: 'WMS_RACK_ARRIVED',
      operation_key: 'external:smt_rack_bin:trace-001:RACK_OPERATION',
      target_position_code: 'SINGLE_LAYER_A',
      position_code: 'SINGLE_LAYER_A',
      rack_code: 'RACK-001',
      rack_kind: 'SINGLE_LAYER'
    })
  })

  it('fills sandbox rack projection fields when WMS rack arrived outbox has no rack code', () => {
    const outbox = createExternalOutbox({
      id: 8,
      payload_json: {
        callback_type: 'WMS_RACK_ARRIVED',
        operation_key: 'external:smt_rack_bin:trace-002:RACK_OPERATION',
        target_position_code: 'SINGLE_LAYER_A',
        rack_code: null,
        rack_kind: 'SINGLE_LAYER'
      }
    })

    expect(buildSandboxExternalCallbackPayload(outbox)).toMatchObject({
      rack_code: 'SANDBOX-RACK-8',
      position_code: 'SINGLE_LAYER_A',
      rack_kind: 'SINGLE_LAYER',
      active_bin_rack: {
        rack_code: 'SANDBOX-RACK-8',
        rack_id: 'SANDBOX-RACK-8'
      },
      bin_mounts: [
        { rack_code: 'SANDBOX-RACK-8', rack_slot_code: 'A', bin_code: 'SANDBOX-BIN-8-A' },
        { rack_code: 'SANDBOX-RACK-8', rack_slot_code: 'B', bin_code: 'SANDBOX-BIN-8-B' },
        { rack_code: 'SANDBOX-RACK-8', rack_slot_code: 'C', bin_code: 'SANDBOX-BIN-8-C' },
        { rack_code: 'SANDBOX-RACK-8', rack_slot_code: 'D', bin_code: 'SANDBOX-BIN-8-D' }
      ]
    })
    const payload = buildSandboxExternalCallbackPayload(outbox)
    expect((payload.active_bin_rack as { cells: unknown[] }).cells).toHaveLength(4)
  })
})
