import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import TraceTopologySummary from '@/components/runtime/trace/TraceTopologySummary.vue'
import type { RuntimeWorklineDetailResponse, TraceDetailResponse } from '@/types/runtime'

function createDetail(): TraceDetailResponse {
  return {
    trace: {
      trace_id: 'rough-sorter-curl-ok-1780459094',
      session_id: 1001,
      workline_id: 8,
      device_code: 'RS-INPUT-ARM-01'
    },
    summary: {
      callback_logs: 5,
      inboxes: 6,
      commands: 3,
      outboxes: 4,
      timelines: 4,
      diagnostics: 30,
      session_status: 'COMPLETED',
      latest_timeline_action: 'SESSION_COMPLETED',
      latest_timeline_status: 'SUCCESS'
    },
    session: {
      id: 1001,
      session_code: 'SESSION-1001',
      workline_id: 8,
      plugin_key: 'rough_sorter',
      run_mode: 'MOCK',
      barcode: 'PKG-CAP001-LOT-A',
      status: 'COMPLETED',
      trace_id: 'rough-sorter-curl-ok-1780459094',
      ingress_count: 5,
      context_json: {}
    },
    sessions: [],
    callback_logs: [],
    inboxes: [],
    commands: [],
    outboxes: [],
    dispatch_attempts: [],
    diagnostics: [],
    timelines: [
      {
        id: 1,
        session_id: 1001,
        workline_id: 8,
        trace_id: 'rough-sorter-curl-ok-1780459094',
        seq_no: 1,
        occurred_at: '2026-06-03T01:00:00Z',
        stage: 'CALLBACK',
        action_type: 'COMMAND_SENT',
        actor_type: 'DEVICE',
        actor_code: 'RS-INPUT-ARM-01',
        status: 'SUCCESS'
      },
      {
        id: 2,
        session_id: 1001,
        workline_id: 8,
        trace_id: 'rough-sorter-curl-ok-1780459094',
        seq_no: 2,
        occurred_at: '2026-06-03T01:01:00Z',
        stage: 'CALLBACK',
        action_type: 'COMMAND_SENT',
        actor_type: 'DEVICE',
        actor_code: 'RS-CONVEYOR-01',
        status: 'SUCCESS'
      },
      {
        id: 3,
        session_id: 1001,
        workline_id: 8,
        trace_id: 'rough-sorter-curl-ok-1780459094',
        seq_no: 3,
        occurred_at: '2026-06-03T01:02:00Z',
        stage: 'COMPLETE',
        action_type: 'SESSION_COMPLETED',
        actor_type: 'ORCHESTRATOR',
        status: 'SUCCESS'
      }
    ]
  }
}

function createWorklineDetail(): RuntimeWorklineDetailResponse {
  return {
    summary: {
      id: 8,
      line_code: 'ROUGH-SORTER',
      line_name: '粗分线',
      line_type: 'SORTING',
      is_active: true,
      device_count: 3,
      active_session_count: 0,
      waiting_session_count: 0,
      failed_session_count: 0,
      error_device_count: 0,
      offline_device_count: 0,
      maintenance_device_count: 0,
      run_mode: 'MOCK'
    },
    devices: [
      {
        id: 1,
        device_code: 'RS-INPUT-ARM-01',
        device_name: '输入机械臂',
        device_role: 'INPUT_ARM',
        role_index: 1,
        device_status: 'IDLE',
        maintenance_mode: false,
        pending_command_count: 0
      }
    ],
    active_sessions: [],
    recent_failed_traces: [],
    recent_completed_traces: []
  }
}

describe('TraceTopologySummary', () => {
  it('renders topology-first trace context for operators', () => {
    const wrapper = mount(TraceTopologySummary, {
      props: {
        detail: createDetail(),
        worklineDetail: createWorklineDetail()
      },
      global: {
        stubs: {
          RuntimeStatusBadge: { template: '<span />' },
          WorklineRouteMap: { template: '<div>完整工作线拓扑</div>' }
        }
      }
    })

    const text = wrapper.text()
    expect(text).toContain('工作线拓扑')
    expect(text).toContain('乐观路径')
    expect(text).toContain('现在在哪')
    expect(text).toContain('异常发生在哪里')
    expect(text).toContain('完整工作线拓扑')
    expect(text).toContain('流程已完成')
  })
})
