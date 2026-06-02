import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import SandboxActionList from '@/components/runtime/sandbox/SandboxActionList.vue'
import type { RuntimeTraceListItem, SandboxPendingOutbox } from '@/types/runtime'

const routerLinkStub = {
  props: ['to'],
  template: '<a><slot /></a>'
}

describe('SandboxActionList failure visibility', () => {
  it('shows manual-hold failure reason when an event creates no outbox', () => {
    const activeSessions = [
      {
        session_id: 93,
        session_code: 'SES_08b230946aea4eef',
        trace_id: 'sandbox:mpgo094b-qn761w',
        business_key: 'e1167e54de47c5eb',
        barcode: '1111111',
        workline_id: 45,
        status: 'MANUAL_HOLD',
        current_wait_type: null,
        failure_domain: 'MATERIAL',
        failure_code: 'PAYLOAD_INVALID',
        latest_timeline_message: '扫码事件 payload 非法: data.location 缺失',
        last_inbox_id: 370,
        is_timed_out: false
      }
    ] as RuntimeTraceListItem[]

    const wrapper = mount(SandboxActionList, {
      props: {
        items: [],
        activeSessions
      },
      global: {
        stubs: {
          RouterLink: routerLinkStub,
          RuntimeStatusBadge: true,
          ElButton: {
            props: ['disabled', 'title'],
            template: '<button :disabled="disabled" :title="title"><slot /></button>'
          }
        }
      }
    })

    expect(wrapper.text()).toContain('PAYLOAD_INVALID')
    expect(wrapper.text()).toContain('扫码事件 payload 非法')
    expect(wrapper.text()).toContain('请修正 Event payload 后重新发送')

    const replayButton = wrapper.find('button[data-test="sandbox-replay-inbox"]')
    expect(replayButton.exists()).toBe(true)
    replayButton.trigger('click')
    expect(wrapper.emitted('replay')?.[0]).toEqual([activeSessions[0]])
  })

  it('shows a runtime hold shortcut when a manual-hold session has no replayable failure code', () => {
    const activeSessions = [
      {
        session_id: 93,
        session_code: 'SES_08b230946aea4eef',
        trace_id: 'sandbox:mpgo094b-qn761w',
        business_key: 'e1167e54de47c5eb',
        barcode: '1111111',
        workline_id: 45,
        status: 'MANUAL_HOLD',
        current_wait_type: null,
        latest_timeline_message: 'Command ACK exhausted; runtime reconciliation started.',
        is_timed_out: false
      }
    ] as RuntimeTraceListItem[]

    const wrapper = mount(SandboxActionList, {
      props: {
        items: [],
        activeSessions,
        runtimeHoldIds: [3]
      },
      global: {
        stubs: {
          RouterLink: routerLinkStub,
          RuntimeStatusBadge: true,
          ElButton: {
            props: ['disabled', 'title'],
            template: '<button :disabled="disabled" :title="title"><slot /></button>'
          }
        }
      }
    })

    expect(wrapper.text()).toContain('MANUAL_HOLD')
    expect(wrapper.text()).toContain('Command ACK exhausted')
    expect(wrapper.text()).toContain('Runtime Hold #3')
    expect(wrapper.text()).toContain('前往 Hold 处置页确认现场状态')
  })

  it('prints device command parameters for supplier verification', () => {
    const items = [
      {
        id: 501,
        session_id: 93,
        workline_id: 45,
        dispatch_key: 'dispatch-measure-001',
        dispatch_type: 'DEVICE_COMMAND',
        target_type: 'DEVICE',
        target_code: 'ARM03',
        status: 'SENT',
        payload_json: {
          command_code: 'CMD_MEASUREMENT_REEL_001',
          task_type: 'MEASUREMENT_REEL',
          params: {
            PkgID: 'SVYU00125TP4LCR02_2',
            station: 'ARM03'
          }
        },
        is_current_action: true,
        is_actionable: true
      }
    ] as SandboxPendingOutbox[]

    const wrapper = mount(SandboxActionList, {
      props: { items },
      global: {
        stubs: {
          RouterLink: routerLinkStub,
          RuntimeStatusBadge: true,
          ElButton: {
            props: ['disabled', 'title'],
            template: '<button :disabled="disabled" :title="title"><slot /></button>'
          }
        }
      }
    })

    expect(wrapper.text()).toContain('设备实际 Payload')
    expect(wrapper.text()).toContain('CMD_MEASUREMENT_REEL_001')
    expect(wrapper.text()).toContain('MEASUREMENT_REEL')
    expect(wrapper.text()).toContain('ARM03')
    expect(wrapper.text()).toContain('SVYU00125TP4LCR02_2')
    expect(wrapper.find('[data-test="copy-command-envelope"]').exists()).toBe(true)
  })

  it('prints device command parameters in expanded active history records', async () => {
    const items = [
      {
        id: 502,
        session_id: 94,
        workline_id: 45,
        dispatch_key: 'dispatch-history-001',
        dispatch_type: 'DEVICE_COMMAND',
        target_type: 'DEVICE',
        target_code: 'ARM03',
        status: 'ACKED',
        payload_json: {
          command_code: 'CMD_HISTORY_REEL_001',
          task_type: 'MEASUREMENT_REEL',
          params: {
            PkgID: 'HISTORY-PKG-001',
            station: 'ARM03'
          }
        },
        is_current_action: false,
        is_actionable: false
      }
    ] as SandboxPendingOutbox[]

    const wrapper = mount(SandboxActionList, {
      props: { items },
      global: {
        stubs: {
          RouterLink: routerLinkStub,
          RuntimeStatusBadge: true,
          ElButton: {
            props: ['disabled', 'title'],
            template: '<button :disabled="disabled" :title="title"><slot /></button>'
          }
        }
      }
    })

    await wrapper.find('.sandbox-action-list__history-toggle').trigger('click')

    expect(wrapper.text()).toContain('设备实际 Payload')
    expect(wrapper.text()).toContain('CMD_HISTORY_REEL_001')
    expect(wrapper.text()).toContain('HISTORY-PKG-001')
    expect(wrapper.find('[data-test="copy-command-envelope"]').exists()).toBe(true)
  })

  it('renders the triggering event inside expanded active history in reverse order', async () => {
    const activeSessions = [
      {
        session_id: 94,
        session_code: 'SES-ACTIVE-94',
        trace_id: 'sandbox:event-chain-active',
        business_key: 'ACTIVE-PKG-001',
        barcode: 'ACTIVE-PKG-001',
        workline_id: 45,
        status: 'RUNNING',
        current_wait_type: null,
        event_type: 'SCAN_COMPLETED',
        event_payload: {
          event_type: 'SCAN_COMPLETED',
          device_code: 'ARM03',
          replay_of_event_id: 'sandbox:SCAN_COMPLETED:original-active',
          replay_reason: 'sandbox manual hold replay: PAYLOAD_INVALID',
          replay_operator_id: null,
          data: {
            PkgID: 'ACTIVE-PKG-001'
          }
        },
        is_timed_out: false
      }
    ] as RuntimeTraceListItem[]
    const items = [
      {
        id: 504,
        session_id: 94,
        workline_id: 45,
        dispatch_key: 'dispatch-active-event-chain-001',
        dispatch_type: 'DEVICE_COMMAND',
        target_type: 'DEVICE',
        target_code: 'ARM03',
        status: 'ACKED',
        payload_json: {
          command_code: 'CMD_ACTIVE_CHAIN_001',
          task_type: 'MEASUREMENT_REEL',
          params: {
            PkgID: 'ACTIVE-PKG-001'
          }
        },
        is_current_action: false,
        is_actionable: false
      }
    ] as SandboxPendingOutbox[]

    const wrapper = mount(SandboxActionList, {
      props: {
        items,
        activeSessions
      },
      global: {
        stubs: {
          RouterLink: routerLinkStub,
          RuntimeStatusBadge: true,
          ElButton: {
            props: ['disabled', 'title'],
            template: '<button :disabled="disabled" :title="title"><slot /></button>'
          }
        }
      }
    })

    expect(wrapper.text()).not.toContain('SCAN_COMPLETED')

    const historyToggle = wrapper.find('.sandbox-action-list__history-toggle')
    expect(historyToggle.text()).toContain('2 条历史')
    await historyToggle.trigger('click')

    const text = wrapper.find('.sandbox-action-list__history-items').text()
    expect(text).toContain('Event')
    expect(text).toContain('SCAN_COMPLETED')
    expect(text).toContain('ACTIVE-PKG-001')
    expect(wrapper.find('[data-test="copy-event-envelope"]').exists()).toBe(true)
    expect(text.indexOf('CMD_ACTIVE_CHAIN_001')).toBeLessThan(text.indexOf('Event'))

    const eventJson = wrapper.find('.sandbox-action-list__event-step pre').text()
    expect(eventJson).toContain('"event_type": "SCAN_COMPLETED"')
    expect(eventJson).toContain('"device_code": "ARM03"')
    expect(eventJson).not.toContain('"payload_json"')
    expect(eventJson).not.toContain('"business_key"')
    expect(eventJson).not.toContain('"inbox_id"')
    expect(eventJson).not.toContain('"replay_of_event_id"')
    expect(eventJson).not.toContain('"replay_reason"')
    expect(eventJson).not.toContain('"replay_operator_id"')
  })

  it('prints device command parameters in expanded completed records', async () => {
    const completedItems = [
      {
        session: {
          id: 95,
          session_code: 'SES-COMPLETED-95',
          status: 'COMPLETED',
          barcode: 'COMPLETED-PKG-001',
          created_at: null,
          started_at: null,
          ended_at: null,
          event_type: 'SCAN_COMPLETED',
          event_payload: {
            data: {
              PkgID: 'COMPLETED-PKG-001'
            }
          }
        },
        outbox_items: [
          {
            id: 503,
            session_id: 95,
            workline_id: 45,
            dispatch_key: 'dispatch-completed-001',
            dispatch_type: 'DEVICE_COMMAND',
            target_type: 'DEVICE',
            target_code: 'ARM03',
            status: 'ACKED',
            payload_json: {
              command_code: 'CMD_COMPLETED_REEL_001',
              task_type: 'MEASUREMENT_REEL',
              params: {
                PkgID: 'COMPLETED-PKG-001',
                station: 'ARM03'
              }
            },
            is_current_action: false,
            is_actionable: false
          }
        ]
      }
    ]

    const wrapper = mount(SandboxActionList, {
      props: {
        items: [],
        completedItems
      },
      global: {
        stubs: {
          RouterLink: routerLinkStub,
          RuntimeStatusBadge: true,
          ElButton: {
            props: ['disabled', 'title'],
            template: '<button :disabled="disabled" :title="title"><slot /></button>'
          }
        }
      }
    })

    await wrapper.find('.sandbox-action-list__completed-session-header').trigger('click')

    expect(wrapper.text()).toContain('设备实际 Payload')
    expect(wrapper.text()).toContain('CMD_COMPLETED_REEL_001')
    expect(wrapper.text()).toContain('COMPLETED-PKG-001')
    expect(wrapper.find('[data-test="copy-command-envelope"]').exists()).toBe(true)
  })

  it('renders the triggering event inside completed history in reverse order', async () => {
    const completedItems = [
      {
        session: {
          id: 96,
          session_code: 'SES-COMPLETED-96',
          status: 'COMPLETED',
          barcode: 'COMPLETED-EVENT-PKG-001',
          created_at: null,
          started_at: null,
          ended_at: null,
          event_type: 'SCAN_COMPLETED',
          event_payload: {
            event_type: 'SCAN_COMPLETED',
            device_code: 'ARM03',
            replay_of_event_id: 'sandbox:SCAN_COMPLETED:original-completed',
            replay_reason: 'sandbox manual hold replay: PAYLOAD_INVALID',
            replay_operator_id: null,
            data: {
              PkgID: 'COMPLETED-EVENT-PKG-001'
            }
          }
        },
        outbox_items: [
          {
            id: 505,
            session_id: 96,
            workline_id: 45,
            dispatch_key: 'dispatch-completed-event-chain-001',
            dispatch_type: 'DEVICE_COMMAND',
            target_type: 'DEVICE',
            target_code: 'ARM03',
            status: 'ACKED',
            payload_json: {
              command_code: 'CMD_COMPLETED_CHAIN_001',
              task_type: 'MEASUREMENT_REEL',
              params: {
                PkgID: 'COMPLETED-EVENT-PKG-001'
              }
            },
            is_current_action: false,
            is_actionable: false
          }
        ]
      }
    ]

    const wrapper = mount(SandboxActionList, {
      props: {
        items: [],
        completedItems
      },
      global: {
        stubs: {
          RouterLink: routerLinkStub,
          RuntimeStatusBadge: true,
          ElButton: {
            props: ['disabled', 'title'],
            template: '<button :disabled="disabled" :title="title"><slot /></button>'
          }
        }
      }
    })

    expect(wrapper.text()).not.toContain('Event')

    await wrapper.find('.sandbox-action-list__completed-session-header').trigger('click')

    const text = wrapper.find('.sandbox-action-list__history-items').text()
    expect(text).toContain('Event')
    expect(text).toContain('SCAN_COMPLETED')
    expect(text).toContain('COMPLETED-EVENT-PKG-001')
    expect(wrapper.find('[data-test="copy-event-envelope"]').exists()).toBe(true)
    expect(text.indexOf('CMD_COMPLETED_CHAIN_001')).toBeLessThan(text.indexOf('Event'))

    const eventJson = wrapper.find('.sandbox-action-list__event-step pre').text()
    expect(eventJson).toContain('"event_type": "SCAN_COMPLETED"')
    expect(eventJson).toContain('"device_code": "ARM03"')
    expect(eventJson).not.toContain('"payload_json"')
    expect(eventJson).not.toContain('"business_key"')
    expect(eventJson).not.toContain('"inbox_id"')
    expect(eventJson).not.toContain('"replay_of_event_id"')
    expect(eventJson).not.toContain('"replay_reason"')
    expect(eventJson).not.toContain('"replay_operator_id"')
  })
})
