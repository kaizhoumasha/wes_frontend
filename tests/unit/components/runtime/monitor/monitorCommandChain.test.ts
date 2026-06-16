import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import MonitorCommandChain from '@/components/runtime/monitor/MonitorCommandChain.vue'
import type { RuntimeSceneCommandSnapshotView } from '@/utils/runtime-scene'

function createCommand(
  overrides: Partial<RuntimeSceneCommandSnapshotView> = {}
): RuntimeSceneCommandSnapshotView {
  return {
    id: 1,
    code: 'PICK_AND_PUT',
    status: 'PENDING',
    ackState: 'pending',
    sentAt: '2026-06-15T15:40:01Z',
    ackReceivedAt: null,
    ackCode: null,
    ackMessage: null,
    ...overrides
  }
}

describe('MonitorCommandChain', () => {
  it('renders idle placeholder when there is no command', () => {
    const wrapper = mount(MonitorCommandChain, {
      props: { command: null }
    })

    expect(wrapper.get('[data-test="monitor-command-chain-idle"]').text()).toContain(
      '暂无在途指令'
    )
    expect(wrapper.get('[data-test="monitor-command-chain-ack-state"]').text()).toBe(
      '空闲'
    )
    expect(wrapper.find('[data-test="monitor-command-chain-code"]').exists()).toBe(false)
  })

  it('renders command code, status, and timestamps for a pending command', () => {
    const wrapper = mount(MonitorCommandChain, {
      props: { command: createCommand() }
    })

    expect(wrapper.get('[data-test="monitor-command-chain-code"]').text()).toBe(
      'PICK_AND_PUT'
    )
    expect(wrapper.get('[data-test="monitor-command-chain-status"]').text()).toBe(
      'PENDING'
    )
    expect(wrapper.get('[data-test="monitor-command-chain-sent-at"]').text()).toBe(
      '2026-06-15T15:40:01Z'
    )
    expect(wrapper.get('[data-test="monitor-command-chain-ack-at"]').text()).toBe('—')
    expect(wrapper.get('[data-test="monitor-command-chain-ack-state"]').text()).toBe(
      '等待 ACK'
    )
  })

  it('switches to acked label and shows ack details when present', () => {
    const wrapper = mount(MonitorCommandChain, {
      props: {
        command: createCommand({
          ackState: 'acked',
          status: 'ACKED',
          ackReceivedAt: '2026-06-15T15:40:03Z',
          ackCode: 200,
          ackMessage: 'ECS accepted'
        })
      }
    })

    expect(wrapper.get('[data-test="monitor-command-chain-ack-state"]').text()).toBe(
      '已 ACK'
    )
    expect(wrapper.get('[data-test="monitor-command-chain-ack-at"]').text()).toBe(
      '2026-06-15T15:40:03Z'
    )
    const detail = wrapper.get('[data-test="monitor-command-chain-ack-detail"]').text()
    expect(detail).toContain('200')
    expect(detail).toContain('ECS accepted')
  })

  it('shows rejected label when command is rejected', () => {
    const wrapper = mount(MonitorCommandChain, {
      props: { command: createCommand({ ackState: 'rejected', status: 'REJECTED' }) }
    })

    expect(wrapper.get('[data-test="monitor-command-chain-ack-state"]').text()).toBe(
      '已拒绝'
    )
  })
})
