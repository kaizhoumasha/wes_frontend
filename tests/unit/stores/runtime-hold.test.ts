import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useRuntimeHoldStore } from '@/stores/runtime-hold'
import type {
  ResolveRuntimeHoldRequest,
  RuntimeHoldDetailResponse,
  RuntimeHoldReleaseEligibility
} from '@/types/runtime'

const mocks = vi.hoisted(() => {
  const detailSend = vi.fn()
  const resolveSend = vi.fn()
  const ngReasonsSend = vi.fn()
  return {
    detailSend,
    resolveSend,
    ngReasonsSend,
    runtimeApiMethods: {
      runtimeHoldDetail: vi.fn(() => ({ send: detailSend })),
      resolveRuntimeHold: vi.fn(() => ({ send: resolveSend })),
      runtimeHoldNgReasons: vi.fn(() => ({ send: ngReasonsSend }))
    }
  }
})

vi.mock('@/api/modules/runtime', () => ({
  runtimeApiMethods: mocks.runtimeApiMethods
}))

function createEligibility(
  overrides: Partial<RuntimeHoldReleaseEligibility> = {}
): RuntimeHoldReleaseEligibility {
  return {
    can_resolve: true,
    required_checks: ['physical_state_confirmed'],
    allowed_resolutions: ['COMPLETED', 'FAILED', 'CANCELLED'],
    allowed_material_dispositions: ['CONTINUE', 'RETURN_TO_NG'],
    latest_evidence_hash: 'hash-before',
    reason: null,
    ...overrides
  }
}

function createDetail(
  overrides: Partial<RuntimeHoldDetailResponse> = {}
): RuntimeHoldDetailResponse {
  return {
    summary: {
      id: 11,
      hold_type: 'RUNTIME_RECONCILIATION',
      status: 'OPEN',
      blocking: true,
      workline_id: 45,
      session_id: 91,
      trace_id: 'trace-001',
      plugin_key: 'smt_classifier',
      contract_version: '1.0',
      source_reason: 'COMMAND_ACK_EXHAUSTED',
      material_disposition: null,
      ng_reason_code: null,
      ng_reason_label: null,
      version: 1,
      created_at: '2026-05-09T10:00:00Z',
      resolved_at: null,
      resolved_by: null
    },
    source: {
      source_kind: 'DISPATCH_ACK_EXHAUSTED',
      source_reason: 'COMMAND_ACK_EXHAUSTED',
      source_inbox_id: null,
      source_outbox_id: 501,
      source_command_id: 601,
      source_device_id: 7,
      source_idempotency_key: 'dispatch-ack-exhausted:501:601'
    },
    evidence_snapshot_json: {},
    release_evidence_json: {},
    failed_command_evidence: null,
    release_eligibility: createEligibility(),
    blockers: [],
    ...overrides
  }
}

function continuePayload(): ResolveRuntimeHoldRequest {
  return {
    checks: { physical_state_confirmed: true },
    hold_version: 1,
    latest_evidence_hash: 'hash-before',
    material_disposition: 'CONTINUE',
    operator_note: '现场确认可继续',
    resolution: 'COMPLETED',
    result_payload: null
  }
}

function returnToNgPayload(): ResolveRuntimeHoldRequest {
  return {
    ...continuePayload(),
    material_disposition: 'RETURN_TO_NG',
    ng_reason: {
      source: 'PLUGIN',
      code: 'SIZE_ABNORMAL',
      label: '尺寸异常'
    },
    physical_handoff_evidence: {
      ng_location_scan: 'NG-RACK-01',
      material_scan_payload: { PkgID: 'PKG-001' },
      line_clear_checked: true,
      late_callback_reviewed: true
    }
  }
}

describe('useRuntimeHoldStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mocks.detailSend.mockResolvedValue(createDetail())
    mocks.resolveSend.mockResolvedValue({ hold_id: 11, status: 'RESOLVED' })
    mocks.ngReasonsSend.mockResolvedValue([])
  })

  it('applies 409 conflict decision model to current detail', async () => {
    const store = useRuntimeHoldStore()
    await store.loadHold(11)
    const conflictEligibility = createEligibility({ latest_evidence_hash: 'hash-after' })
    const conflictError = {
      code: 'RUNTIME_HOLD_VERSION_CONFLICT',
      message: 'Runtime Hold has changed',
      data: {
        current_hold_version: 3,
        current_status: 'OPEN',
        release_eligibility: conflictEligibility,
        refresh_url: '/api/v1/workline/runtime-holds/11'
      }
    }
    mocks.resolveSend.mockRejectedValueOnce(conflictError)

    await expect(store.resolveHold(11, continuePayload())).rejects.toBe(conflictError)

    expect(store.lastConflict).toEqual({
      code: 'RUNTIME_HOLD_VERSION_CONFLICT',
      message: 'Runtime Hold has changed',
      current_hold_version: 3,
      current_status: 'OPEN',
      release_eligibility: conflictEligibility,
      refresh_url: '/api/v1/workline/runtime-holds/11'
    })
    expect(store.detail?.summary.version).toBe(3)
    expect(store.detail?.release_eligibility.latest_evidence_hash).toBe('hash-after')
    expect(store.submitting).toBe(false)
  })

  it('applies material conflict fields from Runtime Hold 409 responses', async () => {
    const store = useRuntimeHoldStore()
    await store.loadHold(11)
    const conflictEligibility = createEligibility({ latest_evidence_hash: 'hash-after-material' })
    const conflictError = {
      code: 'RUNTIME_HOLD_MATERIAL_CONFLICT',
      message: 'material already has active NG return item: smt:PKG-001',
      data: {
        material_identity_key: 'smt:PKG-001',
        existing_ng_return_item_id: 501,
        existing_runtime_hold_id: 12,
        existing_status: 'WAITING_REWORK',
        current_hold_version: 4,
        current_status: 'OPEN',
        release_eligibility: conflictEligibility,
        refresh_url: '/api/v1/workline/runtime-holds/11'
      }
    }
    mocks.resolveSend.mockRejectedValueOnce(conflictError)

    await expect(store.resolveHold(11, continuePayload())).rejects.toBe(conflictError)

    expect(store.lastConflict).toEqual({
      code: 'RUNTIME_HOLD_MATERIAL_CONFLICT',
      message: 'material already has active NG return item: smt:PKG-001',
      current_hold_version: 4,
      current_status: 'OPEN',
      release_eligibility: conflictEligibility,
      refresh_url: '/api/v1/workline/runtime-holds/11',
      material_identity_key: 'smt:PKG-001',
      existing_ng_return_item_id: 501,
      existing_runtime_hold_id: 12,
      existing_status: 'WAITING_REWORK'
    })
    expect(store.detail?.summary.version).toBe(4)
    expect(store.detail?.release_eligibility.latest_evidence_hash).toBe('hash-after-material')
  })

  it('blocks RETURN_TO_NG submit when reason catalog failed to load', async () => {
    const store = useRuntimeHoldStore()
    const catalogError = new Error('reason catalog unavailable')
    mocks.ngReasonsSend.mockRejectedValueOnce(catalogError)

    await expect(store.loadNgReasons('smt_classifier', '1.0')).rejects.toBe(catalogError)
    await expect(store.resolveHold(11, returnToNgPayload())).rejects.toThrow(
      'NG reason catalog is not available'
    )

    expect(store.ngReasonCatalogReady).toBe(false)
    expect(mocks.runtimeApiMethods.resolveRuntimeHold).not.toHaveBeenCalled()
  })
})
