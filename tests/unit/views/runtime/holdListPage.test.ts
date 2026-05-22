import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { RuntimeHoldSummary } from '@/types/runtime'

const mocks = vi.hoisted(() => {
  const runtimeHoldsSend = vi.fn()
  const runtimeHolds = vi.fn(() => ({ send: runtimeHoldsSend }))
  return {
    router: { push: vi.fn() },
    runtimeHolds,
    runtimeHoldsSend,
    worklines: vi.fn(),
    worklineDetail: vi.fn(),
    runtimeHoldDetail: vi.fn()
  }
})

vi.mock('vue-router', () => ({
  useRouter: () => mocks.router
}))

vi.mock('@/api/modules/runtime', () => ({
  runtimeApiMethods: {
    runtimeHolds: mocks.runtimeHolds,
    worklines: mocks.worklines,
    worklineDetail: mocks.worklineDetail,
    runtimeHoldDetail: mocks.runtimeHoldDetail
  }
}))

function createHold(overrides: Partial<RuntimeHoldSummary> = {}): RuntimeHoldSummary {
  return {
    id: 4,
    hold_type: 'RUNTIME_RECONCILIATION',
    status: 'OPEN',
    blocking: true,
    workline_id: 45,
    session_id: 93,
    trace_id: 'trace-timeout',
    plugin_key: 'smt_classifier',
    contract_version: '1.0',
    source_reason: 'CALLBACK_DEADLINE_EXPIRED',
    material_disposition: null,
    ng_reason_code: null,
    ng_reason_label: null,
    version: 0,
    created_at: '2026-05-22T11:49:09Z',
    resolved_at: null,
    resolved_by: null,
    ...overrides
  }
}

async function mountPage() {
  const { default: HoldListPage } = await import('@/views/runtime/holds/HoldListPage.vue')
  const wrapper = mount(HoldListPage, {
    global: {
      stubs: {
        RuntimeEmptyState: {
          props: ['title', 'description', 'hint'],
          template: '<div>{{ title }} {{ description }} {{ hint }}</div>'
        },
        RuntimeStatusBadge: {
          props: ['label'],
          template: '<span>{{ label }}</span>'
        },
        'el-select': { template: '<div><slot /></div>' },
        'el-option': true,
        'el-skeleton': true
      }
    }
  })
  await flushPromises()
  return wrapper
}

describe('HoldListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.runtimeHoldsSend.mockResolvedValue([createHold()])
  })

  it('loads active runtime holds directly so session-level timeout holds appear', async () => {
    const wrapper = await mountPage()

    expect(mocks.runtimeHolds).toHaveBeenCalledWith({ active_only: true, limit: 100 })
    expect(mocks.worklines).not.toHaveBeenCalled()
    expect(mocks.runtimeHoldDetail).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('CALLBACK_DEADLINE_EXPIRED')
    expect(wrapper.text()).toContain('#4')
  })
})
