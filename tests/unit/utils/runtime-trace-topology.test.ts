import { describe, expect, it } from 'vitest'
import { buildRuntimeTraceTopology } from '@/utils/runtime-trace-topology'
import type {
  DiagnosisVerdict,
  TraceDetailResponse,
  TraceSessionItem,
  TraceTimelineItem
} from '@/types/runtime'

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

function traceSession(overrides: Partial<TraceSessionItem> = {}): TraceSessionItem {
  return {
    id: 11,
    session_code: 'WL-20260603-001',
    workline_id: 22,
    plugin_key: 'rough_sorter',
    run_mode: 'MOCK',
    barcode: 'PKG-001',
    status: 'COMPLETED',
    trace_id: 'trace-ok',
    ingress_count: 5,
    context_json: {},
    ...overrides
  }
}

function diagnosisVerdict(): DiagnosisVerdict {
  return {
    state: 'completed_clear',
    severity: 'success',
    title: '流程已完成',
    summary: '当前案件已正常结束，未发现阻塞点。',
    requires_operator_action: false,
    primary_action: '无需现场处置',
    blocking_point: 'none',
    owner: null,
    evidence_health: {
      level: 'complete',
      summary: '证据完整',
      missing: [],
      items: []
    }
  }
}

function blockedVerdict(overrides: Partial<DiagnosisVerdict> = {}): DiagnosisVerdict {
  return {
    ...diagnosisVerdict(),
    state: 'blocked',
    severity: 'danger',
    title: 'DEVICE / COMMAND_TIMEOUT',
    summary: 'DEVICE / COMMAND_TIMEOUT：输出机械臂未回传完成',
    requires_operator_action: true,
    primary_action: '检查输出机械臂并重试',
    blocking_point: 'command',
    owner: 'device',
    ...overrides
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
    sessions: [traceSession()],
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
    diagnosis_verdict: diagnosisVerdict(),
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
    expect(model.pathNodes.map(node => node.state)).toEqual(['completed', 'completed', 'final'])
    expect(model.materialPositionLabel).toBe('最终落点')
    expect(model.materialPositionValue).toBe('RS-OUTPUT-ARM-01 / 投放到料箱')
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
    expect(model.operatorAction).toBe('无需现场处置')
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
        diagnosis_verdict: {
          ...diagnosisVerdict(),
          state: 'running',
          severity: 'info',
          title: '流程运行中',
          summary: '当前流程正常推进。',
          primary_action: '继续观察运行进度',
          blocking_point: 'none'
        },
        sessions: [],
        resource_view: {
          active_bin_racks: []
        },
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
    expect(model.pathNodes.map(node => node.actionLabel)).toEqual(['入料抓取', '输送前进'])
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
        sessions: [
          traceSession({
            status: 'RUNNING',
            ingress_count: 1,
            context_json: {}
          })
        ],
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
        diagnosis_verdict: {
          ...diagnosisVerdict(),
          state: 'running',
          severity: 'info',
          title: '流程运行中',
          summary: '当前流程正常推进。',
          primary_action: '继续观察运行进度',
          blocking_point: 'none'
        },
        sessions: [],
        resource_view: {
          active_bin_racks: []
        },
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
    expect(model.materialPositionLabel).toBe('当前停留')
    expect(model.materialPositionValue).toBe('输入机械臂 / 暂无动作证据')
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
        sessions: [
          traceSession({
            status: 'WAITING_DEVICE_RESULT',
            ingress_count: 2,
            context_json: {}
          })
        ],
        diagnosis_verdict: blockedVerdict({
          title: 'DEVICE / COMMAND_FAILED',
          summary: 'DEVICE / COMMAND_FAILED：入料机械臂回调失败',
          primary_action: '检查入料机械臂并重试'
        }),
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

    expect(model.verdict).toBe('danger')
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
        sessions: [
          traceSession({
            status: 'FAILED',
            failure_domain: 'DEVICE',
            failure_code: 'COMMAND_TIMEOUT',
            failure_message: '输出机械臂未回传完成',
            ingress_count: 3,
            context_json: {}
          })
        ],
        diagnosis_verdict: blockedVerdict(),
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
        next_steps: [],
        diagnosis_verdict: blockedVerdict()
      }
    })

    expect(model.verdict).toBe('danger')
    expect(model.currentNode?.deviceCode).toBe('RS-OUTPUT-ARM-01')
    expect(model.exceptionNode?.deviceCode).toBe('RS-OUTPUT-ARM-01')
    expect(model.exceptionText).toContain('DEVICE / COMMAND_TIMEOUT')
    expect(model.operatorAction).toBe('检查输出机械臂并重试')
  })

  it('prefers manual hold material failure over fallback unknown blocking point', () => {
    const model = buildRuntimeTraceTopology({
      detail: detail({
        summary: {
          callback_logs: 4,
          inboxes: 4,
          commands: 2,
          outboxes: 3,
          timelines: 8,
          diagnostics: 22,
          session_status: 'MANUAL_HOLD',
          latest_timeline_action: 'MANUAL_HOLD',
          latest_timeline_status: 'PENDING',
          latest_timeline_message: 'SMT 可用货架快照必须包含 A/B/C/D 4 个料箱'
        },
        sessions: [
          traceSession({
            status: 'MANUAL_HOLD',
            trace_id: 'rough-sorter-curl-final-1780458849',
            failure_domain: 'MATERIAL',
            failure_code: 'ACTIVE_RACK_SNAPSHOT_INVALID',
            failure_message: 'SMT 可用货架快照必须包含 A/B/C/D 4 个料箱',
            ingress_count: 2,
            context_json: {
              phase: 'WAITING_RACK'
            }
          })
        ],
        diagnosis_verdict: blockedVerdict({
          title: 'MATERIAL / ACTIVE_RACK_SNAPSHOT_INVALID',
          summary: 'MATERIAL / ACTIVE_RACK_SNAPSHOT_INVALID：SMT 可用货架快照必须包含 A/B/C/D 4 个料箱',
          primary_action: '人工检查粗分机当前物料与依赖状态',
          blocking_point: 'resource',
          owner: 'material'
        }),
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
            action_type: 'COMMAND_ACKED',
            actor_code: 'RS-INPUT-ARM-01',
            status: 'SUCCESS',
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
            action_type: 'COMMAND_ACKED',
            actor_code: 'RS-CONVEYOR-01',
            status: 'SUCCESS',
            related_command_id: 102
          }),
          timeline({
            id: 5,
            seq_no: 5,
            stage: 'WAITING',
            action_type: 'WAIT_STARTED',
            actor_type: 'EXTERNAL_SYSTEM',
            actor_code: 'WMS_RCS',
            to_status: 'WAITING_EXTERNAL',
            status: 'PENDING',
            payload_json: {
              wait_type: 'RACK_OPERATION'
            }
          }),
          timeline({
            id: 6,
            seq_no: 6,
            stage: 'MANUAL',
            action_type: 'MANUAL_HOLD',
            actor_type: 'ORCHESTRATOR',
            actor_code: null,
            from_status: 'WAITING_EXTERNAL',
            to_status: 'MANUAL_HOLD',
            status: 'PENDING',
            failure_domain: 'MATERIAL',
            message: 'SMT 可用货架快照必须包含 A/B/C/D 4 个料箱',
            payload_json: {
              reason_code: 'ACTIVE_RACK_SNAPSHOT_INVALID',
              suggested_action: '人工检查粗分机当前物料与依赖状态'
            }
          })
        ]
      }),
      blockingPoint: {
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
        next_steps: [],
        diagnosis_verdict: blockedVerdict({
          title: 'MATERIAL / ACTIVE_RACK_SNAPSHOT_INVALID',
          summary: 'MATERIAL / ACTIVE_RACK_SNAPSHOT_INVALID：SMT 可用货架快照必须包含 A/B/C/D 4 个料箱',
          primary_action: '人工检查粗分机当前物料与依赖状态',
          blocking_point: 'resource',
          owner: 'material'
        })
      }
    })

    expect(model.verdict).toBe('danger')
    expect(model.exceptionText).toBe(
      'MATERIAL / ACTIVE_RACK_SNAPSHOT_INVALID：SMT 可用货架快照必须包含 A/B/C/D 4 个料箱'
    )
    expect(model.exceptionText).not.toContain('UNKNOWN')
    expect(model.operatorAction).toBe('人工检查粗分机当前物料与依赖状态')
  })

  it('keeps a real blocking point even when the diagnostic card is unknown', () => {
    const model = buildRuntimeTraceTopology({
      detail: detail({
        summary: {
          callback_logs: 0,
          inboxes: 0,
          commands: 0,
          outboxes: 0,
          timelines: 1,
          diagnostics: 1,
          session_status: 'RUNNING',
          latest_timeline_action: 'WAIT_STARTED',
          latest_timeline_status: 'PENDING'
        },
        sessions: [
          traceSession({
            status: 'RUNNING',
            ingress_count: 1,
            context_json: {}
          })
        ],
        diagnosis_verdict: blockedVerdict({
          title: 'SYSTEM / COMMAND_TIMEOUT',
          summary: 'SYSTEM / COMMAND_TIMEOUT：后端暂未分类，但阻塞点已定位为命令超时',
          primary_action: '检查设备连接后重试'
        }),
        timelines: [
          timeline({
            id: 1,
            seq_no: 1,
            action_type: 'WAIT_STARTED',
            actor_code: 'RS-OUTPUT-ARM-01',
            status: 'PENDING'
          })
        ]
      }),
      blockingPoint: {
        trace_id: 'trace-ok',
        blocking_point: 'COMMAND_TIMEOUT',
        owner: 'device',
        recoverability: 'manual',
        operator_action: '检查设备连接后重试',
        diagnostic_card: {
          title: 'UNKNOWN',
          summary: '后端暂未分类，但阻塞点已定位为命令超时',
          error_code: 'UNKNOWN',
          error_domain: 'SYSTEM',
          severity: 'high',
          recoverability: 'manual',
          problem_class: 'unknown',
          user_message: '后端暂未分类，但阻塞点已定位为命令超时',
          operator_action: '检查设备连接后重试',
          next_steps: [],
          context: { extra: {} }
        },
        evidence: {},
        next_steps: [],
        diagnosis_verdict: blockedVerdict({
          title: 'SYSTEM / COMMAND_TIMEOUT',
          summary: 'SYSTEM / COMMAND_TIMEOUT：后端暂未分类，但阻塞点已定位为命令超时',
          primary_action: '检查设备连接后重试'
        })
      }
    })

    expect(model.exceptionText).toContain('SYSTEM / COMMAND_TIMEOUT')
    expect(model.exceptionText).toContain('后端暂未分类，但阻塞点已定位为命令超时')
    expect(model.operatorAction).toBe('检查设备连接后重试')
  })

  it('does not let fallback unknown blocking point action override non-actionable running', () => {
    const model = buildRuntimeTraceTopology({
      detail: detail({
        summary: {
          callback_logs: 0,
          inboxes: 0,
          commands: 0,
          outboxes: 0,
          timelines: 1,
          diagnostics: 1,
          session_status: 'RUNNING',
          latest_timeline_action: 'WAIT_STARTED',
          latest_timeline_status: 'PENDING'
        },
        sessions: [
          traceSession({
            status: 'RUNNING',
            ingress_count: 1,
            context_json: {}
          })
        ],
        diagnosis_verdict: {
          ...diagnosisVerdict(),
          state: 'running',
          severity: 'info',
          title: '流程运行中',
          summary: '当前流程正常推进。',
          primary_action: '继续观察运行进度',
          blocking_point: 'none'
        },
        timelines: [
          timeline({
            id: 1,
            seq_no: 1,
            action_type: 'WAIT_STARTED',
            actor_code: 'RS-CONVEYOR-01',
            status: 'PENDING'
          })
        ]
      }),
      blockingPoint: {
        trace_id: 'trace-ok',
        blocking_point: 'none',
        owner: 'platform',
        recoverability: 'manual_intervention_required',
        operator_action: '记录当前时间并联系技术支持',
        diagnostic_card: {
          title: 'UNKNOWN',
          summary: '当前 trace 未发现明确阻塞点',
          error_code: 'UNKNOWN',
          error_domain: 'SYSTEM',
          severity: 'error',
          recoverability: 'manual_intervention_required',
          problem_class: 'software',
          user_message: '系统出现未分类异常，请联系技术支持。',
          operator_action: '记录当前时间并联系技术支持',
          next_steps: [],
          context: { extra: {} }
        },
        evidence: {},
        next_steps: [],
        diagnosis_verdict: {
          ...diagnosisVerdict(),
          state: 'running',
          severity: 'info',
          title: '流程运行中',
          summary: '当前流程正常推进。',
          primary_action: '继续观察运行进度',
          blocking_point: 'none'
        }
      }
    })

    expect(model.operatorAction).toBe('继续观察运行进度')
    expect(model.operatorAction).not.toContain('联系技术支持')
  })
})
