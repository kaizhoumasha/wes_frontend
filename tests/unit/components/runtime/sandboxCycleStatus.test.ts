import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import SandboxCycleStatus from '@/components/runtime/sandbox/SandboxCycleStatus.vue'
import type { RuntimeTraceListItem, SandboxPendingOutbox } from '@/types/runtime'

function createSession(overrides: Partial<RuntimeTraceListItem> = {}): RuntimeTraceListItem {
  return {
    session_id: 93,
    session_code: 'SES-93',
    trace_id: 'trace-93',
    request_id: 'req-93',
    workline_id: 45,
    workline_name: 'SMT',
    workline_code: 'SMT-45',
    device_id: 301,
    device_name: 'ARM03',
    device_code: 'ARM03',
    command_code: 'CMD',
    status: 'WAITING_DEVICE_RESULT',
    plugin_state: 'WAITING_MEASUREMENT',
    current_wait_type: 'DEVICE_CALLBACK',
    failure_domain: null,
    failure_code: null,
    started_at: '2026-05-22T00:00:00Z',
    last_ingress_at: '2026-05-22T00:00:00Z',
    deadline_at: null,
    is_timed_out: false,
    ...overrides
  }
}

function createOutbox(overrides: Partial<SandboxPendingOutbox> = {}): SandboxPendingOutbox {
  return {
    id: 501,
    session_id: 93,
    workline_id: 45,
    dispatch_key: 'dispatch-501',
    dispatch_type: 'DEVICE_COMMAND',
    target_type: 'DEVICE',
    target_code: 'ARM03',
    status: 'SENT',
    payload_json: {},
    is_current_action: true,
    is_actionable: true,
    ...overrides
  }
}

function mountCycle(
  activeSessions: RuntimeTraceListItem[] = [],
  pendingOutboxes: SandboxPendingOutbox[] = []
) {
  return mount(SandboxCycleStatus, {
    props: {
      activeSessions,
      pendingOutboxes
    },
    global: {
      stubs: {
        RuntimeStatusBadge: {
          props: ['status'],
          template: '<span>{{ status }}</span>'
        }
      }
    }
  })
}

describe('SandboxCycleStatus', () => {
  it('shows ready state when there is no active session or pending action', () => {
    const wrapper = mountCycle()

    expect(wrapper.text()).toContain('就绪')
    expect(wrapper.text()).toContain('选择设备 → 发送 Event → 开始测试')
    expect(wrapper.text()).toContain('无活跃会话')
  })

  it('shows active session wait context while waiting for orchestration output', () => {
    const wrapper = mountCycle([createSession({ is_timed_out: true })])

    expect(wrapper.text()).toContain('等待注入')
    expect(wrapper.text()).toContain('会话运行中，等待系统派发命令')
    expect(wrapper.text()).toContain('SES-93')
    expect(wrapper.text()).toContain('WAITING_MEASUREMENT')
    expect(wrapper.text()).toContain('等待 设备回调')
    expect(wrapper.text()).toContain('已超时')
  })

  it('prioritizes result submission hint when ACKED commands are pending', () => {
    const wrapper = mountCycle([createSession()], [createOutbox({ status: 'ACKED' })])

    expect(wrapper.text()).toContain('待操作')
    expect(wrapper.text()).toContain('有命令需要提交 Result')
    expect(wrapper.text()).toContain('1 待 Result')
  })

  it('shows blocked command counts before generic pending action hints', () => {
    const wrapper = mountCycle(
      [createSession()],
      [createOutbox({ status: 'BLOCKED_RESOURCE', dispatch_type: 'DEVICE_COMMAND' })]
    )

    expect(wrapper.text()).toContain('待操作')
    expect(wrapper.text()).toContain('有命令被阻塞')
    expect(wrapper.text()).toContain('1 阻塞')
  })

  it('marks the loop done when the newest session is terminal', () => {
    const wrapper = mountCycle([createSession({ status: 'COMPLETED' })])

    expect(wrapper.text()).toContain('循环结束')
    expect(wrapper.text()).toContain('可继续发起新 Event 开始下一轮')
  })
})
