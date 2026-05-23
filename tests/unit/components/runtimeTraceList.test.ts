import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import RuntimeTraceList from '@/components/runtime/overview/RuntimeTraceList.vue'
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

describe('RuntimeTraceList', () => {
  it('prefers barcode and business key before technical trace identifiers', () => {
    const wrapper = mount(RuntimeTraceList, {
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
          })
        ],
        loading: false
      }
    })

    const identifiers = wrapper.findAll('.runtime-trace-list__barcode').map(item => item.text())
    expect(identifiers).toEqual(['PKG-001', 'HHPN-002'])
  })
})
