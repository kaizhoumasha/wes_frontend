import { describe, expect, it } from 'vitest'
import { buildRuntimeTraceTopology } from '@/utils/runtime-trace-topology'
import type { TraceDetailResponse, TraceTimelineItem } from '@/types/runtime'

function timeline(overrides: Partial<TraceTimelineItem>): TraceTimelineItem {
  return {
    id: overrides.id ?? 1,
    session_id: 11,
    workline_id: 22,
    trace_id: 'trace-ok',
    seq_no: overrides.seq_no ?? 1,
    occurred_at: overrides.occurred_at ?? '2026-06-03T01:00:00Z',
    stage: overrides.stage ?? 'CALLBACK',
    action_type: overrides.action_type ?? 'COMMAND_SENT',
    actor_type: overrides.actor_type ?? 'DEVICE',
    actor_code: overrides.actor_code ?? 'RS-INPUT-ARM-01',
    from_status: overrides.from_status,
    to_status: overrides.to_status,
    status: overrides.status ?? 'SUCCESS',
    failure_domain: overrides.failure_domain,
    message: overrides.message,
    payload_json: overrides.payload_json,
    related_inbox_id: overrides.related_inbox_id,
    related_command_id: overrides.related_command_id
  }
}

function detail(overrides: Partial<TraceDetailResponse>): TraceDetailResponse {
  return {
    trace: {
      trace_id: 'trace-ok',
      session_id: 11,
      workline_id: 22,
      device_code: 'RS-INPUT-ARM-01'
    },
    summary: {
      callback_logs: 0,
      inboxes: 0,
      commands: 0,
      outboxes: 0,
      timelines: overrides.timelines?.length ?? 0,
      diagnostics: 0,
      session_status: 'COMPLETED',
      latest_timeline_action: 'SESSION_COMPLETED',
      latest_timeline_status: 'SUCCESS'
    },
    session: {
      id: 11,
      session_code: 'WL-20260603-001',
      workline_id: 22,
      plugin_key: 'rough_sorter',
      run_mode: 'MOCK',
      barcode: 'PKG-001',
      status: 'COMPLETED',
      trace_id: 'trace-ok',
      ingress_count: 5,
      context_json: {}
    },
    sessions: [],
    callback_logs: [],
    inboxes: [],
    commands: [
      {
        id: 101,
        device_id: 1,
        command_code: 'CMD-PICK',
        trace_id: 'trace-ok',
        task_type: 'PICK_AND_PUT',
        status: 'COMPLETED',
        retry_count: 0,
        params: {},
        completed_at: '2026-06-03T01:00:02Z'
      },
      {
        id: 102,
        device_id: 2,
        command_code: 'CMD-MOVE',
        trace_id: 'trace-ok',
        task_type: 'MOVE_FORWARD',
        status: 'COMPLETED',
        retry_count: 0,
        params: {},
        completed_at: '2026-06-03T01:00:05Z'
      }
    ],
    outboxes: [],
    dispatch_attempts: [],
    diagnostics: [],
    ...overrides
  }
}

describe('buildRuntimeTraceTopology', () => {
  it('summarizes completed rough sorter flow as an optimistic workline path', () => {
    const model = buildRuntimeTraceTopology({
      detail: detail({
        timelines: [
          timeline({ id: 1, seq_no: 1, action_type: 'SESSION_CREATED', actor_code: null }),
          timeline({
            id: 2,
            seq_no: 2,
            action_type: 'COMMAND_SENT',
            actor_code: 'RS-INPUT-ARM-01',
            related_command_id: 101
          }),
          timeline({
            id: 3,
            seq_no: 3,
            action_type: 'COMMAND_SENT',
            actor_code: 'RS-CONVEYOR-01',
            related_command_id: 102
          }),
          timeline({
            id: 4,
            seq_no: 4,
            action_type: 'COMMAND_SENT',
            actor_code: 'RS-OUTPUT-ARM-01'
          }),
          timeline({
            id: 5,
            seq_no: 5,
            action_type: 'SESSION_COMPLETED',
            actor_code: null,
            to_status: 'COMPLETED'
          })
        ]
      })
    })

    expect(model.verdict).toBe('success')
    expect(model.verdictTitle).toBe('流程已完成')
    expect(model.pathNodes.map(node => node.deviceCode)).toEqual([
      'RS-INPUT-ARM-01',
      'RS-CONVEYOR-01',
      'RS-OUTPUT-ARM-01'
    ])
    expect(model.currentNode?.deviceCode).toBe('RS-OUTPUT-ARM-01')
    expect(model.exceptionNode).toBeNull()
    expect(model.exceptionText).toBe('无异常')
  })

  it('ignores fallback unknown blocking point for completed traces', () => {
    const model = buildRuntimeTraceTopology({
      detail: detail({
        timelines: [
          timeline({
            id: 1,
            seq_no: 1,
            action_type: 'COMMAND_SENT',
            actor_code: 'RS-INPUT-ARM-01',
            related_command_id: 101
          }),
          timeline({
            id: 2,
            seq_no: 2,
            action_type: 'SESSION_COMPLETED',
            actor_code: null,
            to_status: 'COMPLETED'
          })
        ]
      }),
      blockingPoint: {
        trace_id: 'trace-ok',
        blocking_point: 'UNKNOWN',
        owner: 'system',
        recoverability: 'support',
        operator_action: '联系技术支持',
        diagnostic_card: {
          title: '未发现明确阻塞点',
          summary: '当前 trace 未发现明确阻塞点',
          error_code: 'UNKNOWN',
          error_domain: 'SYSTEM',
          severity: 'low',
          recoverability: 'support',
          problem_class: 'unknown',
          user_message: '当前 trace 未发现明确阻塞点',
          operator_action: '联系技术支持',
          next_steps: [],
          context: { extra: {} }
        },
        evidence: {},
        next_steps: []
      }
    })

    expect(model.verdict).toBe('success')
    expect(model.exceptionText).toBe('无异常')
    expect(model.operatorAction).toBe('无需处置')
  })

  it('merges path devices with timeline command evidence', () => {
    const model = buildRuntimeTraceTopology({
      detail: detail({
        timelines: [
          timeline({
            id: 1,
            seq_no: 1,
            action_type: 'COMMAND_SENT',
            actor_code: 'RS-INPUT-ARM-01',
            related_command_id: 101
          }),
          timeline({
            id: 2,
            seq_no: 2,
            action_type: 'COMMAND_SENT',
            actor_code: 'RS-CONVEYOR-01',
            related_command_id: 102
          })
        ]
      }),
      path: {
        workline_id: 22,
        session_id: 11,
        trace_id: 'trace-ok',
        current_blocking_device_id: null,
        blocking_reason: null,
        timeline_groups: [],
        devices: [
          {
            device_id: 1,
            device_code: 'RS-INPUT-ARM-01',
            device_name: '输入机械臂',
            is_current: false,
            actions: []
          },
          {
            device_id: 2,
            device_code: 'RS-CONVEYOR-01',
            device_name: '输送线',
            is_current: true,
            actions: []
          }
        ]
      }
    })

    expect(model.pathNodes.map(node => node.deviceName)).toEqual(['输入机械臂', '输送线'])
    expect(model.pathNodes.map(node => node.actionLabel)).toEqual(['PICK_AND_PUT', 'MOVE_FORWARD'])
  })

  it('uses is_current path node as current location when device code is missing', () => {
    const model = buildRuntimeTraceTopology({
      detail: detail({
        summary: {
          callback_logs: 0,
          inboxes: 0,
          commands: 1,
          outboxes: 1,
          timelines: 1,
          diagnostics: 0,
          session_status: 'RUNNING',
          latest_timeline_action: 'COMMAND_SENT',
          latest_timeline_status: 'SENT'
        },
        session: {
          id: 11,
          session_code: 'WL-20260603-001',
          workline_id: 22,
          plugin_key: 'rough_sorter',
          run_mode: 'MOCK',
          status: 'RUNNING',
          ingress_count: 1,
          context_json: {}
        },
        timelines: [
          timeline({
            id: 1,
            seq_no: 1,
            action_type: 'COMMAND_SENT',
            actor_code: 'RS-INPUT-ARM-01'
          })
        ]
      }),
      path: {
        workline_id: 22,
        session_id: 11,
        trace_id: 'trace-ok',
        current_blocking_device_id: null,
        blocking_reason: null,
        timeline_groups: [],
        devices: [
          {
            device_id: 1,
            device_code: null,
            device_name: '输入机械臂',
            is_current: true,
            actions: []
          },
          {
            device_id: 2,
            device_code: null,
            device_name: '输送线',
            is_current: false,
            actions: []
          }
        ]
      }
    })

    expect(model.pathNodes[0].state).toBe('current')
    expect(model.currentNode?.deviceName).toBe('输入机械臂')
    expect(model.currentLabel).toBe('第 1 站 · 输入机械臂')
  })

  it('shows failed timeline as exception while session is still waiting', () => {
    const model = buildRuntimeTraceTopology({
      detail: detail({
        summary: {
          callback_logs: 0,
          inboxes: 0,
          commands: 1,
          outboxes: 1,
          timelines: 2,
          diagnostics: 1,
          session_status: 'WAITING_DEVICE_RESULT',
          latest_timeline_action: 'COMMAND_FAILED',
          latest_timeline_status: 'FAILED'
        },
        session: {
          id: 11,
          session_code: 'WL-20260603-001',
          workline_id: 22,
          plugin_key: 'rough_sorter',
          run_mode: 'MOCK',
          status: 'WAITING_DEVICE_RESULT',
          ingress_count: 2,
          context_json: {}
        },
        timelines: [
          timeline({
            id: 1,
            seq_no: 1,
            action_type: 'COMMAND_SENT',
            actor_code: 'RS-INPUT-ARM-01'
          }),
          timeline({
            id: 2,
            seq_no: 2,
            action_type: 'COMMAND_FAILED',
            actor_code: 'RS-INPUT-ARM-01',
            status: 'FAILED',
            failure_domain: 'DEVICE',
            message: '入料机械臂回调失败'
          })
        ]
      })
    })

    expect(model.verdict).toBe('warning')
    expect(model.exceptionNode?.deviceName).toBe('RS-INPUT-ARM-01')
    expect(model.exceptionText).toContain('DEVICE')
    expect(model.exceptionText).toContain('入料机械臂回调失败')
  })

  it('marks the first failed device as exception and current location', () => {
    const model = buildRuntimeTraceTopology({
      detail: detail({
        summary: {
          callback_logs: 0,
          inboxes: 0,
          commands: 1,
          outboxes: 1,
          timelines: 3,
          diagnostics: 1,
          session_status: 'FAILED',
          latest_timeline_action: 'COMMAND_FAILED',
          latest_timeline_status: 'FAILED'
        },
        session: {
          id: 11,
          session_code: 'WL-20260603-001',
          workline_id: 22,
          plugin_key: 'rough_sorter',
          run_mode: 'MOCK',
          status: 'FAILED',
          failure_domain: 'DEVICE',
          failure_code: 'COMMAND_TIMEOUT',
          failure_message: '输出机械臂未回传完成',
          ingress_count: 3,
          context_json: {}
        },
        timelines: [
          timeline({
            id: 1,
            seq_no: 1,
            action_type: 'COMMAND_SENT',
            actor_code: 'RS-INPUT-ARM-01'
          }),
          timeline({
            id: 2,
            seq_no: 2,
            action_type: 'COMMAND_SENT',
            actor_code: 'RS-OUTPUT-ARM-01',
            status: 'FAILED',
            failure_domain: 'DEVICE',
            message: '输出机械臂未回传完成'
          })
        ]
      }),
      blockingPoint: {
        trace_id: 'trace-ok',
        blocking_point: 'COMMAND_TIMEOUT',
        owner: 'device',
        recoverability: 'manual',
        operator_action: '检查输出机械臂并重试',
        diagnostic_card: {
          title: '输出机械臂超时',
          summary: '输出机械臂未回传完成',
          error_code: 'COMMAND_TIMEOUT',
          error_domain: 'DEVICE',
          severity: 'high',
          recoverability: 'manual',
          problem_class: 'device_timeout',
          user_message: '输出机械臂未回传完成',
          next_steps: [],
          context: { extra: {} }
        },
        evidence: {},
        next_steps: []
      }
    })

    expect(model.verdict).toBe('danger')
    expect(model.currentNode?.deviceCode).toBe('RS-OUTPUT-ARM-01')
    expect(model.exceptionNode?.deviceCode).toBe('RS-OUTPUT-ARM-01')
    expect(model.exceptionText).toContain('DEVICE / COMMAND_TIMEOUT')
    expect(model.operatorAction).toBe('检查输出机械臂并重试')
  })
})
