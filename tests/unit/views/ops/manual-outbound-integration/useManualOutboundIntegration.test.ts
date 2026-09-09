import { describe, expect, it, vi } from 'vitest'
import type { IntegrationRun } from '@/api/manualOutboundIntegrationApi'
import { useManualOutboundIntegration } from '@/views/ops/manual-outbound-integration/useManualOutboundIntegration'

function snapshot(
  runId: string,
  version: number,
  status: IntegrationRun['status'] = 'ACTIVE'
): IntegrationRun {
  return {
    run_id: runId,
    workline_id: 3,
    workline_code: 'KT16',
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
      workline_code: 'KT16',
      profile: 'CONTRACT_SIMULATION',
      environment_label: 'integration',
      device_code: 'SIM-ECS-01'
    })

    expect(state.currentRun.value?.run_id).toBe('run-2')
  })

  it('does not replace a newer SSE snapshot with an older create response', async () => {
    let resolveCreate!: (value: IntegrationRun) => void
    const api = {
      list: vi.fn().mockResolvedValue([]),
      get: vi.fn(),
      create: vi.fn().mockReturnValue(
        new Promise<IntegrationRun>(resolve => {
          resolveCreate = resolve
        })
      )
    }
    const state = useManualOutboundIntegration({ api })
    const creating = state.create({
      workline_code: 'KT16',
      profile: 'CONTRACT_SIMULATION',
      environment_label: 'integration',
      device_code: 'SIM-ECS-01'
    })

    state.accept(snapshot('run-2', 2, 'WAITING_TASK'))
    resolveCreate(snapshot('run-2', 1, 'WAITING_TASK'))
    await creating

    expect(state.currentRun.value?.version).toBe(2)
  })

  it('keeps the latest run selection when an earlier detail request finishes last', async () => {
    let resolveRun1!: (value: IntegrationRun) => void
    let resolveRun2!: (value: IntegrationRun) => void
    const api = {
      list: vi.fn().mockResolvedValue([snapshot('run-1', 1), snapshot('run-2', 1)]),
      get: vi.fn(
        (runId: string) =>
          new Promise<IntegrationRun>(resolve => {
            if (runId === 'run-1') resolveRun1 = resolve
            else resolveRun2 = resolve
          })
      ),
      create: vi.fn()
    }
    const state = useManualOutboundIntegration({ api })
    await state.load()

    const first = state.select('run-1')
    const second = state.select('run-2')
    resolveRun2(snapshot('run-2', 2))
    await second
    resolveRun1(snapshot('run-1', 2))
    await first

    expect(state.currentRun.value?.run_id).toBe('run-2')
  })

  it('reloads the selected run even after it falls outside the recent list', async () => {
    const api = {
      list: vi
        .fn()
        .mockResolvedValueOnce([snapshot('run-old', 1)])
        .mockResolvedValueOnce([snapshot('run-new', 1)]),
      get: vi.fn().mockResolvedValue(snapshot('run-old', 2)),
      create: vi.fn()
    }
    const state = useManualOutboundIntegration({ api })
    await state.load()

    await state.load()

    expect(api.get).toHaveBeenCalledWith('run-old')
    expect(state.currentRun.value?.run_id).toBe('run-old')
    expect(state.currentRun.value?.version).toBe(2)
  })

  it('does not replace a newer SSE snapshot with an older detail response', async () => {
    let resolveDetail!: (value: IntegrationRun) => void
    const api = {
      list: vi.fn().mockResolvedValue([snapshot('run-1', 1)]),
      get: vi.fn().mockReturnValue(
        new Promise<IntegrationRun>(resolve => {
          resolveDetail = resolve
        })
      ),
      create: vi.fn()
    }
    const state = useManualOutboundIntegration({ api })
    await state.load()

    const selecting = state.select('run-1')
    state.accept(snapshot('run-1', 3))
    resolveDetail(snapshot('run-1', 2))
    await selecting

    expect(state.currentRun.value?.version).toBe(3)
  })
})
