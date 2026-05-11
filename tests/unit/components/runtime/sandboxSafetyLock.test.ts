import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import SandboxActionList from '@/components/common/runtime/SandboxActionList.vue'
import type {
  RuntimeTraceListItem,
  SandboxCompletedSession,
  SandboxPendingOutbox
} from '@/types/runtime'

function createOutbox(overrides: Partial<SandboxPendingOutbox> = {}): SandboxPendingOutbox {
  return {
    id: 1,
    session_id: 10,
    workline_id: 20,
    dispatch_key: 'device-command:CMD-1',
    dispatch_type: 'DEVICE_COMMAND',
    target_type: 'DEVICE',
    target_code: 'ARM01',
    status: 'SENT',
    payload_json: {},
    ...overrides
  }
}

const routerLinkStub = {
  props: ['to'],
  template: '<a><slot /></a>'
}

describe('sandbox safety lock', () => {
  it('shows active session immediately before command outbox is created', () => {
    const activeSessions = [
      {
        session_id: 12,
        session_code: 'SES-12',
        status: 'RUNNING',
        plugin_state: 'WAITING_REEL',
        barcode: 'PKG-12',
        current_wait_type: null
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

    expect(wrapper.text()).toContain('需人工推进命令')
    expect(wrapper.findAll('.sandbox-action-list__pending-session')).toHaveLength(1)
    expect(wrapper.text()).toContain('PKG-12')
    expect(wrapper.text()).toContain('WAITING_REEL')
    expect(wrapper.text()).toContain('编排中')
    expect(wrapper.text()).toContain('事件已接收，等待运行时产生下一步命令。')
  })

  it('groups pending commands by session context', () => {
    const first = createOutbox({
      id: 1,
      session_id: 10,
      dispatch_key: 'device-command:CMD-1'
    })
    const second = createOutbox({
      id: 2,
      session_id: 10,
      dispatch_key: 'device-command:CMD-2'
    })
    const third = createOutbox({
      id: 3,
      session_id: 11,
      dispatch_key: 'device-command:CMD-3'
    })
    const activeSessions = [
      {
        session_id: 10,
        session_code: 'SES-10',
        status: 'WAITING_DEVICE_RESULT',
        plugin_state: 'WAITING_MEASUREMENT',
        barcode: 'PKG-10',
        current_wait_type: 'DEVICE_CALLBACK'
      },
      {
        session_id: 11,
        session_code: 'SES-11',
        status: 'WAITING_DEVICE_RESULT',
        plugin_state: 'WAITING_REEL',
        barcode: 'PKG-11',
        current_wait_type: 'DEVICE_CALLBACK'
      }
    ] as RuntimeTraceListItem[]

    const wrapper = mount(SandboxActionList, {
      props: {
        items: [first, second, third],
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

    expect(wrapper.text()).toContain('需人工推进命令')
    expect(wrapper.text()).toContain('3 条可操作')
    expect(wrapper.findAll('.sandbox-action-list__pending-session')).toHaveLength(2)
    expect(wrapper.text()).toContain('PKG-10')
    expect(wrapper.text()).toContain('WAITING_MEASUREMENT')
    expect(wrapper.text()).toContain('2 条命令')
    expect(wrapper.text()).toContain('PKG-11')
    expect(wrapper.text()).toContain('1 条命令')
  })

  it('merges active session rows with backend sandbox history group keys', () => {
    const outbox = createOutbox({
      id: 2,
      session_id: 10,
      dispatch_key: 'device-command:CMD-2',
      history_group_key: 'session:10'
    })
    const activeSessions = [
      {
        session_id: 10,
        session_code: 'SES-10',
        status: 'WAITING_DEVICE_RESULT',
        plugin_state: 'WAITING_MEASUREMENT',
        barcode: 'PKG-10',
        current_wait_type: 'DEVICE_CALLBACK'
      }
    ] as RuntimeTraceListItem[]

    const wrapper = mount(SandboxActionList, {
      props: {
        items: [outbox],
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

    expect(wrapper.findAll('.sandbox-action-list__pending-session')).toHaveLength(1)
    expect(wrapper.text()).toContain('1 条可操作')
    expect(wrapper.text()).toContain('1 条命令')
    expect(wrapper.text()).not.toContain('事件已接收，等待运行时产生下一步命令。')
  })

  it('shows ACK action for undispatched sandbox device commands', async () => {
    const outbox = createOutbox({ status: 'NEW' })
    const wrapper = mount(SandboxActionList, {
      props: {
        items: [outbox],
        loading: null
      },
      global: {
        stubs: {
          RouterLink: routerLinkStub,
          RuntimeStatusBadge: true,
          ElButton: {
            props: ['disabled', 'title'],
            emits: ['click'],
            template:
              '<button :disabled="disabled" :title="title" @click="$emit(\'click\')"><slot /></button>'
          }
        }
      }
    })

    const button = wrapper.get('button')
    await button.trigger('click')

    expect(wrapper.text()).toContain('模拟 ACK')
    expect(wrapper.emitted('ack')).toEqual([[outbox]])
  })

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
          RouterLink: routerLinkStub,
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
          plugin_state: null,
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
          RouterLink: routerLinkStub,
          RuntimeStatusBadge: true,
          ElButton: {
            props: ['disabled', 'title'],
            template: '<button :disabled="disabled" :title="title"><slot /></button>'
          }
        }
      }
    })

    expect(wrapper.text()).toContain('暂无需人工推进命令')
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
          plugin_state: 'WAITING_MEASUREMENT',
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
          RouterLink: routerLinkStub,
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

  it('shows failed terminal session reason in ended sessions', () => {
    const outbox = createOutbox({ status: 'CANCELLED', last_error: 'DEVICE_BUSY' })
    const completedItems: SandboxCompletedSession[] = [
      {
        session: {
          id: 12,
          session_code: 'SES-12',
          status: 'FAILED',
          plugin_state: 'WAITING_CONVEYOR',
          barcode: 'PKG-12',
          created_at: null,
          started_at: null,
          ended_at: null,
          event_type: 'SCAN_COMPLETED',
          failure_domain: 'ORCHESTRATION',
          failure_code: 'DEVICE_BUSY',
          failure_message: '设备正在执行任务'
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
          RouterLink: routerLinkStub,
          RuntimeStatusBadge: true,
          ElButton: {
            props: ['disabled', 'title'],
            template: '<button :disabled="disabled" :title="title"><slot /></button>'
          }
        }
      }
    })

    expect(wrapper.text()).toContain('历史命令')
    expect(wrapper.text()).toContain('PKG-12')
    expect(wrapper.text()).toContain('DEVICE_BUSY')
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
          RouterLink: routerLinkStub,
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

  it('shows failed history command evidence and runtime hold entry without actions', async () => {
    const failedOutbox = createOutbox({
      id: 9,
      status: 'FAILED',
      is_actionable: false,
      runtime_hold_id: 77,
      failure_summary: {
        code: 'ACK_TIMEOUT',
        message: '设备未 ACK',
        runtime_hold_id: 77
      }
    })
    const completedItems: SandboxCompletedSession[] = [
      {
        session: {
          id: 10,
          session_code: 'SES-10',
          status: 'FAILED',
          plugin_state: 'WAITING_MEASUREMENT',
          barcode: 'PKG-10',
          created_at: null,
          started_at: null,
          ended_at: null
        },
        outbox_items: [failedOutbox]
      }
    ]

    const wrapper = mount(SandboxActionList, {
      props: {
        items: [failedOutbox],
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

    expect(wrapper.text()).toContain('历史命令')
    await wrapper.get('.sandbox-action-list__completed-session-header').trigger('click')
    expect(wrapper.text()).toContain('ACK_TIMEOUT: 设备未 ACK')
    expect(wrapper.text()).toContain('Runtime Hold #77')
    expect(wrapper.text()).not.toContain('模拟 ACK')
    expect(wrapper.text()).not.toContain('模拟 Result')
  })
})
