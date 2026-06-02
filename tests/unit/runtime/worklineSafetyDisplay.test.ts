import { describe, expect, it } from 'vitest'
import type { RuntimeSafetyIncidentSummary, RuntimeWorklineSummary } from '@/types/runtime'
import {
  getWorklineRiskLabel,
  getWorklineRiskScore,
  getWorklineRiskTone
} from '@/utils/runtime-display'
import { getWorklineDeviceSafetyEvidence, getWorklineRuntimeVerdict } from '@/utils/runtime-safety'

function createSummary(overrides: Partial<RuntimeWorklineSummary> = {}): RuntimeWorklineSummary {
  return {
    id: 1,
    line_code: 'LINE-1',
    line_name: 'Line 1',
    line_type: 'SMT',
    is_active: true,
    device_count: 2,
    active_session_count: 1,
    waiting_session_count: 0,
    failed_session_count: 0,
    error_device_count: 0,
    offline_device_count: 0,
    maintenance_device_count: 0,
    run_mode: 'SIMULATION',
    ...overrides
  }
}

function createIncident(
  overrides: Partial<RuntimeSafetyIncidentSummary> = {}
): RuntimeSafetyIncidentSummary {
  return {
    id: 1001,
    workline_id: 1,
    status: 'ACTIVE',
    ...overrides
  }
}

describe('workline safety display', () => {
  it('prioritizes ESTOPPED above normal workline risk', () => {
    const summary = createSummary({
      runtime_status: 'ESTOPPED',
      failed_session_count: 1,
      offline_device_count: 1
    })

    expect(getWorklineRiskScore(summary)).toBe(100_000)
    expect(getWorklineRiskTone(summary)).toBe('danger')
    expect(getWorklineRiskLabel(summary)).toBe('软件急停冻结')
  })

  it('locks the workline when an active incident exists even if summary is not ESTOPPED', () => {
    const verdict = getWorklineRuntimeVerdict(createSummary(), createIncident())

    expect(verdict.safetyLocked).toBe(true)
    expect(verdict.label).toBe('软件急停冻结')
    expect(verdict.canAttemptClear).toBe(true)
  })

  it('locks the workline when runtime status is RECONCILING without a safety incident', () => {
    const verdict = getWorklineRuntimeVerdict(createSummary({ runtime_status: 'RECONCILING' }), null)

    expect(verdict.safetyLocked).toBe(true)
    expect(verdict.label).toBe('运行时对账中')
    expect(verdict.canAttemptClear).toBe(false)
    expect(verdict.blockedReason).toContain('runtime reconciliation')
  })

  it('shows STOPPED as waiting for START without safety clear semantics', () => {
    const summary = createSummary({
      runtime_status: 'STOPPED',
      active_session_count: 0,
      failed_session_count: 2,
      offline_device_count: 1,
      error_device_count: 1,
      waiting_session_count: 3
    })
    const verdict = getWorklineRuntimeVerdict(summary, null)

    expect(getWorklineRiskScore(summary)).toBe(34)
    expect(getWorklineRiskTone(summary)).toBe('warning')
    expect(getWorklineRiskLabel(summary)).toBe('等待现场硬件 START')
    expect(verdict.tone).toBe('warning')
    expect(verdict.label).toBe('等待现场硬件 START')
    expect(verdict.safetyLocked).toBe(false)
    expect(verdict.canAttemptClear).toBe(false)
    expect(verdict.blockedReason).toContain('未 START')
  })

  it('keeps safety locked when evidence is stale or failed to load', () => {
    const staleVerdict = getWorklineRuntimeVerdict(createSummary(), null, { state: 'stale' })
    const errorVerdict = getWorklineRuntimeVerdict(createSummary(), null, { state: 'error' })

    expect(staleVerdict.safetyLocked).toBe(true)
    expect(staleVerdict.canAttemptClear).toBe(false)
    expect(staleVerdict.blockedReason).toContain('已过期')
    expect(errorVerdict.safetyLocked).toBe(true)
    expect(errorVerdict.canAttemptClear).toBe(false)
    expect(errorVerdict.blockedReason).toContain('未加载')
  })

  it('locks the workline from device WORKLINE_ESTOPPED evidence before summary fields sync', () => {
    const evidence = getWorklineDeviceSafetyEvidence([
      {
        id: 10,
        device_code: 'ARM01',
        device_name: 'Arm 01',
        device_role: 'INPUT_ARM',
        role_index: 1,
        device_status: 'ERROR',
        maintenance_mode: false,
        error_code: 'WORKLINE_ESTOPPED'
      }
    ])
    const verdict = getWorklineRuntimeVerdict(createSummary(), null, evidence)

    expect(verdict.safetyLocked).toBe(true)
    expect(verdict.label).toBe('软件急停冻结')
    expect(verdict.canAttemptClear).toBe(false)
    expect(verdict.blockedReason).toContain('WORKLINE_ESTOPPED')
  })
})
