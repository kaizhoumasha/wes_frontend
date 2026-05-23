import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import SessionBoard from '@/components/runtime/monitor/SessionBoard.vue'
import type { RuntimeTraceListItem } from '@/types/runtime'

function createTrace(overrides: Partial<RuntimeTraceListItem> = {}): RuntimeTraceListItem {
  return {
    session_id: 501,
    session_code: 'SES-501',
    workline_id: 45,
    status: 'COMPLETED',
    started_at: '2026-05-07T01:00:00Z',
    ...overrides
  }
}

describe('SessionBoard', () => {
  it('shows recent completed traces in completed lane', () => {
    const wrapper = mount(SessionBoard, {
      props: {
        activeSessions: [],
        recentFailedTraces: [],
        recentCompletedTraces: [createTrace()]
      },
      global: {
        stubs: {
          RuntimeStatusBadge: true,
          ElCard: { template: '<section><slot name="header" /><slot /></section>' }
        }
      }
    })

    expect(wrapper.text()).toContain('已完成')
    expect(wrapper.text()).toContain('SES-501')
  })

  it('uses physical scan identity before session code in lane cards', () => {
    const wrapper = mount(SessionBoard, {
      props: {
        activeSessions: [],
        recentFailedTraces: [
          createTrace({
            session_code: 'SES-502',
            barcode: 'PKG-502',
            business_key: 'HHPN-502',
            status: 'FAILED'
          })
        ],
        recentCompletedTraces: []
      },
      global: {
        stubs: {
          RuntimeStatusBadge: true,
          ElCard: { template: '<section><slot name="header" /><slot /></section>' }
        }
      }
    })

    expect(wrapper.find('.session-board__item-code').text()).toBe('PKG-502')
    expect(wrapper.text()).not.toContain('SES-502')
    expect(wrapper.get('.session-board__item').attributes('title')).toBe('SES-502')
  })
})
