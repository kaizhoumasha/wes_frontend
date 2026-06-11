import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import DecisionStrip from '@/components/runtime/devices/DecisionStrip.vue'
import type { RuntimeWorklineMonitorProjectionResponse, RuntimeWorklineSummary } from '@/types/runtime'

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

function createProjection(summary = createSummary()): RuntimeWorklineMonitorProjectionResponse {
  return {
    summary,
    boundary: {
      workline_readiness: 'READY',
      station_lease: 'IDLE',
      single_layer_rack_snapshot: 'ACTIVE',
      rack_operation_wait: 'NONE',
      resource_evidence_kind: 'WES_ACTIVE_SNAPSHOT'
    },
    device_nodes: [
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
    active_sessions: {
      items: [],
      total_count: 0,
      truncated: false
    },
    recent_failed_traces: {
      items: [],
      total_count: 0,
      truncated: false
    },
    recent_completed_traces: {
      items: [],
      total_count: 0,
      truncated: false
    },
    resource_evidence: {
      items: [],
      total_count: 0,
      truncated: false
    },
    action_candidates: {
      pending_reconciliation: null
    },
    generated_at: '2026-06-10T12:00:00Z'
  }
}

describe('DecisionStrip', () => {
  it('summarizes runtime hold, parked outbox, and unfinished command counts', () => {
    const wrapper = mount(DecisionStrip, {
      props: {
        summary: createSummary(),
        projection: createProjection()
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
        projection: createProjection(createSummary({ runtime_status: 'STOPPED' }))
      },
      global: {
        stubs: {
          RouterLink: { props: ['to'], template: '<a><slot /></a>' },
          ElTooltip: { template: '<span><slot /><slot name="content" /></span>' }
        }
      }
    })

    expect(wrapper.classes()).toContain('decision-strip--warning')
    expect(wrapper.text()).toContain('等待现场硬件 START')
    expect(wrapper.text()).toContain('现场硬件 START 后才接收生产事件')
    expect(wrapper.text()).not.toContain('稳定')
  })
})
