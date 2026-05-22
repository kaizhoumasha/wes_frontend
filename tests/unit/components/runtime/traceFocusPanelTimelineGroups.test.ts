import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => {
  const send = vi.fn()
  return {
    send,
    runtimeApiMethods: {
      sessionPath: vi.fn(() => ({ send })),
      tracePath: vi.fn(() => ({ send }))
    }
  }
})

vi.mock('@/api/modules/runtime', () => ({
  runtimeApiMethods: mocks.runtimeApiMethods
}))

async function flushAsync() {
  await Promise.resolve()
  await nextTick()
}

describe('TraceFocusPanel timeline groups', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.send.mockResolvedValue({
      workline_id: 45,
      session_id: 20,
      trace_id: 'trace-20',
      devices: [],
      timeline_groups: [
        {
          group_key: 'orchestrator:session',
          group_type: 'orchestrator',
          display_name: '编排 / Session',
          events: [
            {
              id: 1,
              session_id: 20,
              workline_id: 45,
              seq_no: 1,
              occurred_at: '2026-05-07T01:00:00Z',
              stage: 'INGEST',
              action_type: 'SESSION_CREATED',
              actor_type: 'ORCHESTRATOR',
              status: 'SUCCESS',
              related_inbox_id: 901
            }
          ]
        },
        {
          group_key: 'device:301',
          group_type: 'device',
          display_name: '设备 #301',
          device_id: 301,
          is_current: true,
          is_blocked: true,
          events: [
            {
              id: 2,
              session_id: 20,
              workline_id: 45,
              seq_no: 2,
              occurred_at: '2026-05-07T01:01:00Z',
              stage: 'CALLBACK',
              action_type: 'DECISION_MADE',
              actor_type: 'DEVICE',
              actor_code: 'smt_classifier',
              status: 'SUCCESS',
              payload_json: {
                transition: 'scan_ok'
              }
            },
            {
              id: 3,
              session_id: 20,
              workline_id: 45,
              seq_no: 3,
              occurred_at: '2026-05-07T01:02:00Z',
              stage: 'CALLBACK',
              action_type: 'COMMAND_SENT',
              actor_type: 'DEVICE',
              actor_code: 'ARM01',
              status: 'SUCCESS',
              related_command_id: 101,
              payload_json: {
                command_type: 'MEASUREMENT_REEL'
              }
            },
            {
              id: 4,
              session_id: 20,
              workline_id: 45,
              seq_no: 4,
              occurred_at: '2026-05-07T01:03:00Z',
              stage: 'CALLBACK',
              action_type: 'WAIT_STARTED',
              actor_type: 'DEVICE',
              actor_code: 'ARM01',
              status: 'PENDING',
              related_command_id: 101,
              from_status: 'WAITING_DEVICE_RESULT',
              to_status: 'WAITING_DEVICE_RESULT'
            },
            {
              id: 5,
              session_id: 20,
              workline_id: 45,
              seq_no: 5,
              occurred_at: '2026-05-07T01:04:00Z',
              stage: 'CALLBACK',
              action_type: 'SESSION_COMPLETED',
              actor_type: 'ORCHESTRATOR',
              status: 'SUCCESS',
              from_status: 'WAITING_DEVICE_RESULT',
              to_status: 'COMPLETED'
            }
          ]
        }
      ],
      evidence: {
        trace: {},
        summary: {},
        session: null,
        sessions: [],
        callback_logs: [],
        inboxes: [
          {
            id: 901,
            workline_id: 45,
            device_id: 301,
            device_code: 'ARM03',
            event_type: 'SCAN_COMPLETED',
            status: 'PROCESSED',
            received_at: '2026-05-07T01:00:00Z',
            payload_json: {
              data: {
                PkgID: 'PKG-001',
                HHPN: '620100L00-011-G',
                MfrPN: 'CC0402JRNPO9BN220',
                Qty: '7387',
                LotCode: '8904936031',
                DateCode: '122625',
                location: 'ARM03'
              }
            }
          }
        ],
        commands: [],
        outboxes: [],
        dispatch_attempts: [],
        timelines: [],
        diagnostics: []
      }
    })
  })

  it('renders grouped timeline as the primary execution timeline', async () => {
    const { default: TraceFocusPanel } =
      await import('@/components/common/runtime/TraceFocusPanel.vue')

    const wrapper = mount(TraceFocusPanel, {
      props: {
        worklineId: 45,
        sessionId: 20
      },
      global: {
        stubs: {
          TraceHealthPipeline: true,
          ElCard: { template: '<section><slot name="header" /><slot /></section>' },
          ElButton: { template: '<button><slot /></button>' },
          ElCheckbox: { template: '<label><slot /></label>' }
        }
      }
    })

    await flushAsync()

    expect(wrapper.text()).toContain('编排 / Session')
    expect(wrapper.text()).toContain('设备 #301')
    expect(wrapper.text()).toContain('会话完成')
  })

  it('shows newest business-readable events first and hides raw action names by default', async () => {
    const { default: TraceFocusPanel } =
      await import('@/components/common/runtime/TraceFocusPanel.vue')

    const wrapper = mount(TraceFocusPanel, {
      props: {
        worklineId: 45,
        sessionId: 20
      },
      global: {
        stubs: {
          TraceHealthPipeline: true,
          ElCard: { template: '<section><slot name="header" /><slot /></section>' },
          ElButton: { template: '<button><slot /></button>' },
          ElCheckbox: { template: '<label><slot /></label>' }
        }
      }
    })

    await flushAsync()

    const text = wrapper.text()
    expect(text).toContain('编排判定下一步')
    expect(text).toContain('下发设备指令')
    expect(text).toContain('等待设备回传')
    expect(text).toContain('会话完成')
    expect(text.indexOf('会话完成')).toBeLessThan(text.indexOf('下发设备指令'))
    expect(text).not.toContain('Decision Made')
    expect(text).not.toContain('Command Sent')
    expect(text).not.toContain('Wait Started')
    expect(text).not.toContain('扫码通过，进入测量步骤')
  })

  it('labels historical wait-start events as wait started instead of still waiting', async () => {
    const { default: TraceFocusPanel } =
      await import('@/components/common/runtime/TraceFocusPanel.vue')

    const wrapper = mount(TraceFocusPanel, {
      props: {
        worklineId: 45,
        sessionId: 20
      },
      global: {
        stubs: {
          TraceHealthPipeline: true,
          ElCard: { template: '<section><slot name="header" /><slot /></section>' },
          ElButton: { template: '<button><slot /></button>' },
          ElCheckbox: { template: '<label><slot /></label>' }
        }
      }
    })

    await flushAsync()

    const text = wrapper.text()
    const waitTitleIndex = text.indexOf('等待设备回传')
    const commandTitleIndex = text.indexOf('下发设备指令')
    const waitEventText = text.slice(waitTitleIndex, commandTitleIndex)
    expect(waitEventText).toContain('开始等待')
    expect(waitEventText).not.toContain('等待中')
  })

  it('shows elapsed duration for execution and wait steps', async () => {
    const { default: TraceFocusPanel } =
      await import('@/components/common/runtime/TraceFocusPanel.vue')

    const wrapper = mount(TraceFocusPanel, {
      props: {
        worklineId: 45,
        sessionId: 20
      },
      global: {
        stubs: {
          TraceHealthPipeline: true,
          ElCard: { template: '<section><slot name="header" /><slot /></section>' },
          ElButton: { template: '<button><slot /></button>' },
          ElCheckbox: { template: '<label><slot /></label>' }
        }
      }
    })

    await flushAsync()

    const text = wrapper.text()
    const waitTitleIndex = text.indexOf('等待设备回传')
    const commandTitleIndex = text.indexOf('下发设备指令')
    const commandEndIndex = text.indexOf('编排判定下一步')
    const waitEventText = text.slice(waitTitleIndex, commandTitleIndex)
    const commandEventText = text.slice(commandTitleIndex, commandEndIndex)
    expect(waitEventText).toContain('等待 1m')
    expect(commandEventText).toContain('耗时 1m')
  })

  it('hides no-op status changes in grouped timeline events', async () => {
    const { default: TraceFocusPanel } =
      await import('@/components/common/runtime/TraceFocusPanel.vue')

    const wrapper = mount(TraceFocusPanel, {
      props: {
        worklineId: 45,
        sessionId: 20
      },
      global: {
        stubs: {
          TraceHealthPipeline: true,
          ElCard: { template: '<section><slot name="header" /><slot /></section>' },
          ElButton: { template: '<button><slot /></button>' },
          ElCheckbox: { template: '<label><slot /></label>' }
        }
      }
    })

    await flushAsync()

    expect(wrapper.text()).not.toContain('等待设备回传→等待设备回传')
  })

  it('shows event submit payload data on related timeline events', async () => {
    const { default: TraceFocusPanel } =
      await import('@/components/common/runtime/TraceFocusPanel.vue')

    const wrapper = mount(TraceFocusPanel, {
      props: {
        worklineId: 45,
        sessionId: 20
      },
      global: {
        stubs: {
          TraceHealthPipeline: true,
          ElCard: { template: '<section><slot name="header" /><slot /></section>' },
          ElButton: { template: '<button><slot /></button>' },
          ElCheckbox: { template: '<label><slot /></label>' }
        }
      }
    })

    await flushAsync()

    const text = wrapper.text()
    expect(text).toContain('扫码数据')
    expect(text).toContain('PKG-001')
    expect(text).toContain('620100L00-011-G')
    expect(text).toContain('CC0402JRNPO9BN220')
    expect(text).toContain('7387')
  })
})
