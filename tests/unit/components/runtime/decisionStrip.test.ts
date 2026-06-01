import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import DecisionStrip from '@/components/runtime/devices/DecisionStrip.vue'
import type { RuntimeWorklineDetailResponse, RuntimeWorklineSummary } from '@/types/runtime'

function createSummary(overrides: Partial<RuntimeWorklineSummary> = {}): RuntimeWorklineSummary {
  return {
    id: 20,
    line_code: 'WL-20',
    line_name: '调试线',
    line_type: 'SMT',
    is_active: true,
    device_count: 1,
    active_session_count: 0,
    waiting_session_count: 0,
    failed_session_count: 0,
    error_device_count: 0,
    offline_device_count: 0,
    maintenance_device_count: 0,
    run_mode: 'SIMULATION',
    ...overrides
  }
}

function createDetail(): RuntimeWorklineDetailResponse {
  return {
    summary: createSummary(),
    devices: [
      {
        id: 101,
        device_code: 'ARM03',
        device_name: '三号机械臂',
        device_role: 'ARM',
        role_index: 3,
        device_status: 'IDLE',
        maintenance_mode: false,
        pending_command_count: 0,
        open_command_count: 2,
        blocked_outbox_count: 1,
        open_issue_count: 1,
        active_runtime_hold_ids: [77]
      }
    ],
    active_sessions: [],
    recent_failed_traces: [],
    recent_completed_traces: []
  }
}

describe('DecisionStrip', () => {
  it('summarizes runtime hold, parked outbox, and unfinished command counts', () => {
    const wrapper = mount(DecisionStrip, {
      props: {
        summary: createSummary(),
        detail: createDetail()
      },
      global: {
        stubs: {
          RouterLink: { props: ['to'], template: '<a><slot /></a>' },
          ElTooltip: { template: '<span><slot /><slot name="content" /></span>' }
        }
      }
    })

    expect(wrapper.text()).toContain('存在阻塞')
    expect(wrapper.text()).toContain('Hold 1')
    expect(wrapper.text()).toContain('停靠 1')
    expect(wrapper.text()).toContain('未完成 2')
    expect(wrapper.text()).toContain('进入 Hold')
  })

  it('renders STOPPED as the primary warning verdict before normal idle state', () => {
    const wrapper = mount(DecisionStrip, {
      props: {
        summary: createSummary({ runtime_status: 'STOPPED' }),
        detail: { ...createDetail(), devices: [], summary: createSummary({ runtime_status: 'STOPPED' }) }
      },
      global: {
        stubs: {
          RouterLink: { props: ['to'], template: '<a><slot /></a>' },
          ElTooltip: { template: '<span><slot /><slot name="content" /></span>' }
        }
      }
    })

    expect(wrapper.classes()).toContain('decision-strip--warning')
    expect(wrapper.text()).toContain('等待现场 START')
    expect(wrapper.text()).toContain('现场 START 后才接收生产事件')
    expect(wrapper.text()).not.toContain('稳定')
  })
})
