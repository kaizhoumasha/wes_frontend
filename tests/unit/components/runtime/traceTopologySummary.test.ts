import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import TraceBlockingPointCard from '@/components/runtime/trace/TraceBlockingPointCard.vue'
import TraceTopologySummary from '@/components/runtime/trace/TraceTopologySummary.vue'
import type {
  RuntimeWorklineDetailResponse,
  TraceBlockingPointResponse,
  TraceDetailResponse
} from '@/types/runtime'

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
        stage: 'CALLBACK',
        action_type: 'COMMAND_SENT',
        actor_type: 'DEVICE',
        actor_code: 'RS-OUTPUT-ARM-01',
        status: 'SUCCESS'
      },
      {
        id: 4,
        session_id: 1001,
        workline_id: 8,
        trace_id: 'rough-sorter-curl-ok-1780459094',
        seq_no: 4,
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
      },
      {
        id: 2,
        device_code: 'RS-CONVEYOR-01',
        device_name: '测试粗分机输送线',
        device_role: 'CONVEYOR',
        role_index: 1,
        device_status: 'IDLE',
        maintenance_mode: false,
        pending_command_count: 0
      },
      {
        id: 3,
        device_code: 'RS-OUTPUT-ARM-01',
        device_name: '测试粗分机出料机械臂',
        device_role: 'OUTPUT_ARM',
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
    expect(text).toContain('物料过站')
    expect(text).toContain('最终落点')
    expect(text).toContain('RS-OUTPUT-ARM-01 / 投放到料箱')
    expect(text).toContain('异常发生在哪里')
    expect(text).toContain('完整工作线拓扑')
    expect(text).toContain('流程已完成')
    expect(text).toContain('诊断依据')
    expect(text).toContain('关键证据已纳入诊断')
    expect(text).not.toContain('Callback 0')
  })
})

describe('TraceBlockingPointCard', () => {
  it('shows trace material failure instead of fallback unknown diagnostic card', () => {
    const detail = createDetail()
    detail.summary = {
      ...detail.summary,
      session_status: 'MANUAL_HOLD',
      latest_timeline_action: 'MANUAL_HOLD',
      latest_timeline_status: 'PENDING',
      latest_timeline_message: 'SMT 可用货架快照必须包含 A/B/C/D 4 个料箱'
    }
    detail.session = {
      ...detail.session!,
      status: 'MANUAL_HOLD',
      failure_domain: 'MATERIAL',
      failure_code: 'ACTIVE_RACK_SNAPSHOT_INVALID',
      failure_message: 'SMT 可用货架快照必须包含 A/B/C/D 4 个料箱'
    }
    detail.timelines.push({
      id: 4,
      session_id: 1001,
      workline_id: 8,
      trace_id: 'rough-sorter-curl-final-1780458849',
      seq_no: 4,
      occurred_at: '2026-06-03T01:03:00Z',
      stage: 'MANUAL',
      action_type: 'MANUAL_HOLD',
      actor_type: 'ORCHESTRATOR',
      actor_code: null,
      status: 'PENDING',
      failure_domain: 'MATERIAL',
      message: 'SMT 可用货架快照必须包含 A/B/C/D 4 个料箱',
      payload_json: {
        reason_code: 'ACTIVE_RACK_SNAPSHOT_INVALID',
        suggested_action: '人工检查粗分机当前物料与依赖状态'
      }
    })

    const blockingPoint: TraceBlockingPointResponse = {
      trace_id: 'rough-sorter-curl-final-1780458849',
      blocking_point: 'none',
      owner: 'platform',
      recoverability: 'manual_intervention_required',
      operator_action:
        '发生未知系统错误。记录料盘条码和当前时间，联系技术支持，并提供页面显示的诊断码。',
      diagnostic_card: {
        title: 'UNKNOWN',
        summary: '当前 trace 未发现明确阻塞点',
        error_code: 'UNKNOWN',
        error_domain: 'SYSTEM',
        severity: 'error',
        recoverability: 'manual_intervention_required',
        problem_class: 'software',
        user_message: '系统出现未分类异常，请联系技术支持。',
        operator_action:
          '发生未知系统错误。记录料盘条码和当前时间，联系技术支持，并提供页面显示的诊断码。',
        next_steps: [],
        context: { extra: {} }
      },
      evidence: {},
      next_steps: []
    }

    const wrapper = mount(TraceBlockingPointCard, {
      props: {
        detail,
        blockingPoint
      },
      global: {
        stubs: {
          ElCard: { template: '<section><slot name="header" /><slot /></section>' },
          RuntimeStatusBadge: { template: '<span />' }
        }
      }
    })

    const text = wrapper.text()
    expect(text).toContain('MATERIAL / ACTIVE_RACK_SNAPSHOT_INVALID')
    expect(text).toContain('SMT 可用货架快照必须包含 A/B/C/D 4 个料箱')
    expect(text).toContain('人工检查粗分机当前物料与依赖状态')
    expect(text).toContain('物料问题（现场人员处理）')
    expect(text).not.toContain('系统出现未分类异常，请联系技术支持。')
  })

  it('uses timeline-only failure when session failure fields are empty', () => {
    const detail = createDetail()
    detail.summary = {
      ...detail.summary,
      session_status: 'MANUAL_HOLD',
      latest_timeline_action: 'MANUAL_HOLD',
      latest_timeline_status: 'PENDING',
      latest_timeline_message: 'SMT 可用货架快照必须包含 A/B/C/D 4 个料箱'
    }
    detail.session = {
      ...detail.session!,
      status: 'MANUAL_HOLD'
    }
    detail.timelines.push({
      id: 4,
      session_id: 1001,
      workline_id: 8,
      trace_id: 'rough-sorter-curl-final-1780458849',
      seq_no: 4,
      occurred_at: '2026-06-03T01:03:00Z',
      stage: 'MANUAL',
      action_type: 'MANUAL_HOLD',
      actor_type: 'ORCHESTRATOR',
      actor_code: null,
      status: 'PENDING',
      failure_domain: 'MATERIAL',
      message: 'SMT 可用货架快照必须包含 A/B/C/D 4 个料箱',
      payload_json: {
        reason_code: 'ACTIVE_RACK_SNAPSHOT_INVALID',
        suggested_action: '人工检查粗分机当前物料与依赖状态'
      }
    })

    const blockingPoint: TraceBlockingPointResponse = {
      trace_id: 'rough-sorter-curl-final-1780458849',
      blocking_point: 'none',
      owner: 'platform',
      recoverability: 'manual_intervention_required',
      operator_action:
        '发生未知系统错误。记录料盘条码和当前时间，联系技术支持，并提供页面显示的诊断码。',
      diagnostic_card: {
        title: 'UNKNOWN',
        summary: '当前 trace 未发现明确阻塞点',
        error_code: 'UNKNOWN',
        error_domain: 'SYSTEM',
        severity: 'error',
        recoverability: 'manual_intervention_required',
        problem_class: 'software',
        user_message: '系统出现未分类异常，请联系技术支持。',
        operator_action:
          '发生未知系统错误。记录料盘条码和当前时间，联系技术支持，并提供页面显示的诊断码。',
        next_steps: [],
        context: { extra: {} }
      },
      evidence: {},
      next_steps: []
    }

    const wrapper = mount(TraceBlockingPointCard, {
      props: {
        detail,
        blockingPoint
      },
      global: {
        stubs: {
          ElCard: { template: '<section><slot name="header" /><slot /></section>' },
          RuntimeStatusBadge: { template: '<span />' }
        }
      }
    })

    const text = wrapper.text()
    expect(text).toContain('MATERIAL / ACTIVE_RACK_SNAPSHOT_INVALID')
    expect(text).toContain('SMT 可用货架快照必须包含 A/B/C/D 4 个料箱')
    expect(text).toContain('人工检查粗分机当前物料与依赖状态')
    expect(text).toContain('物料问题（现场人员处理）')
    expect(text).not.toContain('系统出现未分类异常，请联系技术支持。')
  })
})
