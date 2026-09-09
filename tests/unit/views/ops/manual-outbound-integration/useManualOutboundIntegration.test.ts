import { describe, expect, it, vi } from 'vitest'
import type { IntegrationRun } from '@/api/modules/worklineIntegrationDebug'
import { useManualOutboundIntegration } from '@/views/ops/manual-outbound-integration/useManualOutboundIntegration'

function snapshot(
  runId: string,
  version: number,
  status: IntegrationRun['status'] = 'ACTIVE'
): IntegrationRun {
  return {
    run_id: runId,
    workline_id: 3,
    workline_code: 'sorting-3',
    scenario_key: 'manual_outbound_picking@v1',
    expected_plugin_key: 'manual_bin_processing',
    profile: 'CONTRACT_SIMULATION',
    environment_label: 'integration',
    operator_user_id: 42,
    status,
    current_phase: 'POINT2_SCAN',
    version,
    task_id: 'PICK-001',
    issued_operation_id: 'issued-1',
    bin_code: null,
    device_code: 'SIM-ECS-01',
    rack_id: null,
    attention_code: null,
    attention_detail: null,
    wms_cleanup_confirmed: false,
    site_cleanup_confirmed: false,
    created_at: '2026-09-08T00:00:00Z',
    updated_at: `2026-09-08T00:00:0${version}Z`,
    steps: []
  }
}

describe('useManualOutboundIntegration', () => {
  it('keeps the newest persisted version when SSE or refresh arrives out of order', async () => {
    const api = {
      list: vi.fn().mockResolvedValue([snapshot('run-1', 1)]),
      get: vi.fn().mockResolvedValue(snapshot('run-1', 3)),
      create: vi.fn()
    }
    const state = useManualOutboundIntegration({ api })

    await state.load()
    await state.select('run-1')
    state.accept(snapshot('run-1', 2))

    expect(state.currentRun.value?.version).toBe(3)
  })

  it('selects a newly created run after viewing closed history', async () => {
    const created = snapshot('run-2', 0, 'WAITING_TASK')
    const api = {
      list: vi.fn().mockResolvedValue([snapshot('run-1', 2, 'CLOSED_BY_OPERATOR')]),
      get: vi.fn(),
      create: vi.fn().mockResolvedValue(created)
    }
    const state = useManualOutboundIntegration({ api })
    await state.load()

    await state.create({
      workline_code: 'sorting-3',
      profile: 'CONTRACT_SIMULATION',
      environment_label: 'integration',
      device_code: 'SIM-ECS-01'
    })

    expect(state.currentRun.value?.run_id).toBe('run-2')
  })
})
