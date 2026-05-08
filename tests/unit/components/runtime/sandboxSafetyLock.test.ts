import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import SandboxActionList from '@/components/common/runtime/SandboxActionList.vue'
import type { SandboxCompletedSession, SandboxPendingOutbox } from '@/types/runtime'

function createOutbox(overrides: Partial<SandboxPendingOutbox> = {}): SandboxPendingOutbox {
  return {
    id: 1,
    session_id: 10,
    workline_id: 20,
    dispatch_key: 'device-command:CMD-1',
    dispatch_type: 'COMMAND',
    target_type: 'DEVICE',
    target_code: 'ARM01',
    status: 'SENT',
    payload_json: {},
    ...overrides
  }
}

describe('sandbox safety lock', () => {
  it('disables sandbox action list controls when safety locked', () => {
    const wrapper = mount(SandboxActionList, {
      props: {
        items: [createOutbox()],
        loading: null,
        disabled: true,
        disabledReason: '软件急停冻结'
      },
      global: {
        stubs: {
          RuntimeStatusBadge: true,
          ElButton: {
            props: ['disabled', 'title'],
            template: '<button :disabled="disabled" :title="title"><slot /></button>'
          }
        }
      }
    })

    const button = wrapper.get('button')

    expect(button.attributes('disabled')).toBeDefined()
    expect(button.attributes('title')).toBe('软件急停冻结')
  })

  it('hides stale pending operation after result is completed', () => {
    const outbox = createOutbox({ status: 'ACKED' })
    const completedItems: SandboxCompletedSession[] = [
      {
        session: {
          id: 10,
          session_code: 'SES-1',
          status: 'COMPLETED',
          step_code: null,
          barcode: null,
          created_at: null,
          started_at: null,
          ended_at: null
        },
        outbox_items: [outbox]
      }
    ]

    const wrapper = mount(SandboxActionList, {
      props: {
        items: [outbox],
        completedItems
      },
      global: {
        stubs: {
          RuntimeStatusBadge: true,
          ElButton: {
            props: ['disabled', 'title'],
            template: '<button :disabled="disabled" :title="title"><slot /></button>'
          }
        }
      }
    })

    expect(wrapper.text()).toContain('无待操作命令')
    expect(wrapper.text()).not.toContain('模拟 Result')
  })

  it('uses scanned entity fields as completed item identity', () => {
    const outbox = createOutbox({ status: 'ACKED' })
    const completedItems: SandboxCompletedSession[] = [
      {
        session: {
          id: 10,
          session_code: 'SES-1',
          status: 'COMPLETED',
          step_code: 'WAITING_MEASUREMENT',
          barcode: null,
          created_at: null,
          started_at: null,
          ended_at: null,
          event_type: 'SCAN_COMPLETED',
          event_payload: {
            data: {
              PkgID: 'SVYU00125TP4LCR02_9',
              HHPN: '620100L00-011-G',
              MfrPN: 'CC0402JRNPO9BN220',
              Qty: '7387',
              LotCode: '8904936031'
            }
          }
        },
        outbox_items: [outbox]
      }
    ]

    const wrapper = mount(SandboxActionList, {
      props: {
        items: [],
        completedItems
      },
      global: {
        stubs: {
          RuntimeStatusBadge: true,
          ElButton: {
            props: ['disabled', 'title'],
            template: '<button :disabled="disabled" :title="title"><slot /></button>'
          }
        }
      }
    })

    expect(wrapper.text()).toContain('PkgID')
    expect(wrapper.text()).toContain('SVYU00125TP4LCR02_9')
    expect(wrapper.text()).toContain('620100L00-011-G')
    expect(wrapper.text()).toContain('CC0402JRNPO9BN220')
    expect(wrapper.text()).not.toContain('SES-1')
  })

  it('keeps submitted pending command visible but disables result action', () => {
    const outbox = createOutbox({ status: 'ACKED' })
    const wrapper = mount(SandboxActionList, {
      props: {
        items: [outbox],
        submittedResultOutboxIds: new Set([outbox.id]),
        submittedResultReason: 'Result 已提交'
      },
      global: {
        stubs: {
          RuntimeStatusBadge: true,
          ElButton: {
            props: ['disabled', 'title'],
            template: '<button :disabled="disabled" :title="title"><slot /></button>'
          }
        }
      }
    })

    const button = wrapper.get('button')

    expect(wrapper.text()).toContain('模拟 Result')
    expect(button.attributes('disabled')).toBeDefined()
    expect(button.attributes('title')).toBe('Result 已提交')
  })
})
