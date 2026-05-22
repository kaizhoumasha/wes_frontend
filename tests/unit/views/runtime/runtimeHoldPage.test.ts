import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type {
  NgReasonOption,
  RuntimeHoldConflictModel,
  RuntimeHoldDetailResponse
} from '@/types/runtime'

const mocks = vi.hoisted(() => {
  const route = { params: { holdId: '11' } }
  const store = {
    detail: null as RuntimeHoldDetailResponse | null,
    ngReasons: [] as NgReasonOption[],
    loading: false,
    submitting: false,
    lastConflict: null as RuntimeHoldConflictModel | null,
    ngReasonLoadError: null as unknown,
    loadHold: vi.fn(),
    loadNgReasons: vi.fn(),
    resolveHold: vi.fn(),
    applyConflictModel: vi.fn()
  }
  return {
    route,
    store,
    router: { push: vi.fn() }
  }
})

vi.mock('vue-router', () => ({
  useRoute: () => mocks.route,
  useRouter: () => mocks.router
}))

vi.mock('@/stores/runtime-hold', () => ({
  useRuntimeHoldStore: () => mocks.store
}))

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
    failed_command_evidence: {
      command_id: 601,
      command_code: 'CMD-001',
      status: 'FAILED',
      result: 'FAILED',
      error_detail: { message: '设备正在执行其他任务' },
      result_data: null
    },
    release_eligibility: {
      can_resolve: true,
      required_checks: ['physical_state_confirmed', 'late_callback_reviewed'],
      allowed_resolutions: ['COMPLETED', 'FAILED', 'CANCELLED'],
      allowed_material_dispositions: ['CONTINUE', 'RETURN_TO_NG'],
      latest_evidence_hash: 'hash-before',
      reason: null
    },
    blockers: [],
    ...overrides
  }
}

async function mountPage() {
  const { default: RuntimeHoldPage } = await import('@/views/runtime/holds/RuntimeHoldPage.vue')
  const wrapper = mount(RuntimeHoldPage, {
    global: {
      stubs: {
        RouterLink: true
      }
    }
  })
  await flushPromises()
  return wrapper
}

describe('RuntimeHoldPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.route.params.holdId = '11'
    mocks.store.detail = null
    mocks.store.ngReasons = [
      {
        source: 'PLUGIN',
        code: 'SIZE_ABNORMAL',
        label: '尺寸异常',
        plugin_key: 'smt_classifier',
        contract_version: '1.0',
        maps_from: ['SIZE_ERROR']
      }
    ]
    mocks.store.loading = false
    mocks.store.submitting = false
    mocks.store.lastConflict = null
    mocks.store.ngReasonLoadError = null
    mocks.store.loadHold.mockImplementation(async () => mocks.store.detail ?? createDetail())
    mocks.store.loadNgReasons.mockResolvedValue(mocks.store.ngReasons)
    mocks.store.resolveHold.mockResolvedValue({ hold_id: 11, status: 'RESOLVED' })
  })

  it('shows loading state', async () => {
    mocks.store.loading = true

    const wrapper = await mountPage()

    expect(wrapper.text()).toContain('加载中')
  })

  it('shows load error and retries the current hold', async () => {
    mocks.store.loadHold.mockRejectedValueOnce(new Error('permission denied'))

    const wrapper = await mountPage()

    expect(wrapper.text()).toContain('无法打开 Runtime Hold')
    await wrapper.get('[data-test="runtime-hold-retry"]').trigger('click')
    expect(mocks.store.loadHold).toHaveBeenCalledTimes(2)
  })

  it('shows resolved state without submit entry', async () => {
    mocks.store.detail = createDetail({
      summary: { ...createDetail().summary, status: 'RESOLVED' },
      release_eligibility: {
        ...createDetail().release_eligibility,
        can_resolve: false,
        reason: 'RuntimeHold status is RESOLVED'
      }
    })

    const wrapper = await mountPage()

    expect(wrapper.text()).toContain('已闭环')
    expect(wrapper.find('[data-test="runtime-hold-submit"]').exists()).toBe(false)
  })

  it('surfaces missing and ambiguous material identity states', async () => {
    mocks.store.detail = createDetail({
      evidence_snapshot_json: { material_identity_status: 'MISSING' }
    })
    let wrapper = await mountPage()
    expect(wrapper.text()).toContain('物料身份缺失')

    mocks.store.detail = createDetail({
      evidence_snapshot_json: { material_identity_status: 'AMBIGUOUS' }
    })
    wrapper = await mountPage()
    expect(wrapper.text()).toContain('物料身份冲突')
  })

  it('shows reason catalog failure and blocks NG disposition submit affordance', async () => {
    mocks.store.detail = createDetail()
    mocks.store.ngReasons = []
    mocks.store.ngReasonLoadError = new Error('catalog failed')

    const wrapper = await mountPage()
    await wrapper.get<HTMLInputElement>('input[value="RETURN_TO_NG"]').setValue(true)

    expect(wrapper.text()).toContain('NG 原因不可用')
    expect(
      wrapper.get<HTMLButtonElement>('[data-test="runtime-hold-submit"]').element.disabled
    ).toBe(true)
  })

  it('shows late evidence conflict notice', async () => {
    mocks.store.detail = createDetail()
    mocks.store.lastConflict = {
      code: 'RUNTIME_HOLD_EVIDENCE_CHANGED',
      message: 'evidence changed',
      current_hold_version: 2,
      current_status: 'OPEN',
      release_eligibility: {
        ...createDetail().release_eligibility,
        latest_evidence_hash: 'hash-after'
      },
      refresh_url: '/api/v1/workline/runtime-holds/11'
    }

    const wrapper = await mountPage()

    expect(wrapper.text()).toContain('证据已更新')
  })

  it('requires NG location scan before material scan for RETURN_TO_NG', async () => {
    mocks.store.detail = createDetail()

    const wrapper = await mountPage()
    await wrapper.get<HTMLInputElement>('input[value="RETURN_TO_NG"]').setValue(true)

    const materialInput = wrapper.get<HTMLInputElement>('[data-test="material-scan-payload"]')
    expect(materialInput.element.disabled).toBe(true)

    await wrapper.get<HTMLInputElement>('[data-test="ng-location-scan"]').setValue('NG-RACK-01')
    expect(
      wrapper.get<HTMLInputElement>('[data-test="material-scan-payload"]').element.disabled
    ).toBe(false)
  })

  it('forces FAILED session resolution when RETURN_TO_NG is submitted', async () => {
    mocks.store.detail = createDetail()

    const wrapper = await mountPage()
    await wrapper.get<HTMLInputElement>('input[value="RETURN_TO_NG"]').setValue(true)

    const resolution = wrapper.get<HTMLSelectElement>('[data-test="runtime-hold-resolution"]')
    expect(resolution.element.value).toBe('FAILED')
    expect(resolution.findAll('option')).toHaveLength(1)

    const checkboxes = wrapper.findAll<HTMLInputElement>('input[type="checkbox"]')
    for (const checkbox of checkboxes) {
      await checkbox.setValue(true)
    }
    await wrapper
      .get<HTMLSelectElement>('[data-test="runtime-hold-ng-reason"]')
      .setValue('SIZE_ABNORMAL')
    await wrapper.get<HTMLInputElement>('[data-test="ng-location-scan"]').setValue('NG-RACK-01')
    await wrapper.get<HTMLInputElement>('[data-test="material-scan-payload"]').setValue('PKG-001')
    await wrapper.get<HTMLTextAreaElement>('textarea').setValue('退回 NG 验收')

    await wrapper.get('[data-test="runtime-hold-submit"]').trigger('click')
    await flushPromises()

    expect(mocks.store.resolveHold).toHaveBeenCalledWith(
      11,
      expect.objectContaining({
        material_disposition: 'RETURN_TO_NG',
        resolution: 'FAILED',
        ng_reason: expect.objectContaining({ code: 'SIZE_ABNORMAL' }),
        physical_handoff_evidence: expect.objectContaining({
          ng_location_code: 'NG-RACK-01',
          material_scan_payload: 'PKG-001',
          line_clear_checked: true,
          late_callback_reviewed: true
        })
      })
    )
  })
})
