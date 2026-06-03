import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import RuntimeCaseQueue from '@/components/runtime/overview/RuntimeCaseQueue.vue'
import type { RuntimeTraceListItem } from '@/types/runtime'

vi.mock('@/utils/runtime-display', async importOriginal => {
  const actual = await importOriginal<typeof import('@/utils/runtime-display')>()
  return {
    ...actual,
    formatRuntimeRelative: () => '刚刚'
  }
})

function createTrace(overrides: Partial<RuntimeTraceListItem> = {}): RuntimeTraceListItem {
  return {
    session_id: 501,
    session_code: 'S-501',
    trace_id: 'trace-501',
    request_id: 'req-501',
    workline_id: 101,
    workline_name: 'Workline 101',
    workline_code: 'WL-101',
    device_id: 201,
    device_name: 'Scanner 201',
    device_code: 'DV-201',
    command_code: 'SCAN',
    status: 'FAILED',
    plugin_state: 'SCAN',
    current_wait_type: null,
    failure_domain: 'DEVICE',
    failure_code: 'DEVICE_TIMEOUT',
    started_at: '2026-04-27T01:00:00Z',
    last_ingress_at: '2026-04-27T01:01:00Z',
    deadline_at: null,
    is_timed_out: false,
    ...overrides
  }
}

describe('RuntimeCaseQueue', () => {
  it('prefers barcode, session code, and business key before technical trace identifiers', () => {
    const wrapper = mount(RuntimeCaseQueue, {
      props: {
        traces: [
          createTrace({
            barcode: 'PKG-001',
            business_key: 'HHPN-001',
            trace_id: 'trace-001',
            session_code: 'S-001'
          }),
          createTrace({
            session_id: 502,
            barcode: null,
            business_key: 'HHPN-002',
            trace_id: 'trace-002',
            session_code: 'S-002'
          }),
          createTrace({
            session_id: 503,
            barcode: null,
            business_key: 'HHPN-003',
            trace_id: 'trace-003',
            session_code: null
          })
        ],
        loading: false
      }
    })

    const identifiers = wrapper.findAll('.runtime-case-queue__barcode').map(item => item.text())
    expect(identifiers).toEqual(['PKG-001', 'S-002', 'HHPN-003'])
    expect(wrapper.text()).not.toContain('trace-001')
  })
})
