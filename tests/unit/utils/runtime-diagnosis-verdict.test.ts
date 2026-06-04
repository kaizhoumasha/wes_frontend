import { describe, expect, it } from 'vitest'
import type { DiagnosisVerdict, TraceBlockingPointResponse, TraceDetailResponse } from '@/types/runtime'
import {
  buildRuntimeDiagnosisVerdict,
  resolveRuntimeBlockingPointFetch,
  resolveRuntimeDiagnosisDefaultTab
} from '@/utils/runtime-diagnosis-verdict'

function detail(overrides: Partial<TraceDetailResponse> = {}): TraceDetailResponse {
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
      timelines: 0,
      diagnostics: 0,
      session_status: 'COMPLETED',
      latest_timeline_action: 'SESSION_COMPLETED',
      latest_timeline_status: 'SUCCESS'
    },
    session: {
      id: 11,
      session_code: 'SESSION-11',
      workline_id: 22,
      plugin_key: 'rough_sorter',
      run_mode: 'SIMULATION',
      status: 'COMPLETED',
      trace_id: 'trace-ok',
      ingress_count: 0,
      context_json: {}
    },
    sessions: [],
    callback_logs: [],
    inboxes: [],
    commands: [],
    outboxes: [],
    dispatch_attempts: [],
    timelines: [],
    diagnostics: [],
    ...overrides
  }
}

function verdict(overrides: Partial<DiagnosisVerdict>): DiagnosisVerdict {
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
      items: [
        {
          key: 'session',
          label: 'Session',
          count: 1,
          state: 'present',
          hint: '主证据'
        },
        {
          key: 'callback',
          label: 'Callback',
          count: 0,
          state: 'not_required',
          hint: '当前完成态不依赖 callback 证据'
        }
      ]
    },
    ...overrides
  }
}

function fallbackUnknownBlockingPoint(
  overrides: Partial<TraceBlockingPointResponse> = {}
): TraceBlockingPointResponse {
  return {
    trace_id: 'trace-ok',
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
      context: {
        extra: {}
      }
    },
    evidence: {},
    next_steps: [],
    ...overrides
  }
}

describe('buildRuntimeDiagnosisVerdict', () => {
  it('prefers backend diagnosis_verdict over legacy blocking fields', () => {
    const model = buildRuntimeDiagnosisVerdict({
      detail: detail({
        diagnosis_verdict: verdict({
          state: 'waiting',
          severity: 'warning',
          title: '等待 START 准入',
          summary: '工作线正在等待设备接纳检查。',
          primary_action: '观察 START 准入结果',
          blocking_point: 'admission',
          owner: 'workline'
        })
      }),
      blockingPoint: fallbackUnknownBlockingPoint()
    })

    expect(model.state).toBe('waiting')
    expect(model.card.title).toBe('等待 START 准入')
    expect(model.card.operatorAction).toBe('观察 START 准入结果')
    expect(model.card.blockingPointLabel).toBe('Admission')
    expect(model.card.operatorAction).not.toContain('联系技术支持')
  })

  it('corrects completed + none + UNKNOWN legacy fallback to completed_clear', () => {
    const model = buildRuntimeDiagnosisVerdict({
      detail: detail(),
      blockingPoint: fallbackUnknownBlockingPoint()
    })

    expect(model.state).toBe('completed_clear')
    expect(model.topology.verdict).toBe('success')
    expect(model.card.headerEyebrow).toBe('诊断结论')
    expect(model.card.title).toBe('无阻塞点')
    expect(model.card.operatorAction).toBe('无需现场处置')
    expect(model.card.requiresFieldAction).toBe(false)
    expect(model.card.message).not.toContain('UNKNOWN')
    expect(model.card.operatorAction).not.toContain('联系技术支持')
  })

  it('keeps blocked and failed verdicts actionable', () => {
    const blocked = buildRuntimeDiagnosisVerdict({
      detail: detail({
        diagnosis_verdict: verdict({
          state: 'blocked',
          severity: 'danger',
          title: '设备命令阻塞',
          summary: '输出机械臂未回传完成。',
          requires_operator_action: true,
          primary_action: '检查输出机械臂并重试',
          blocking_point: 'command',
          owner: 'device'
        })
      })
    })
    const failed = buildRuntimeDiagnosisVerdict({
      detail: detail({
        diagnosis_verdict: verdict({
          state: 'failed',
          severity: 'danger',
          title: '流程失败',
          summary: '设备命令执行失败。',
          requires_operator_action: true,
          primary_action: '复位设备后重新执行',
          blocking_point: 'command',
          owner: 'device'
        })
      })
    })

    expect(blocked.card.requiresFieldAction).toBe(true)
    expect(blocked.card.headerEyebrow).toContain('现场处置')
    expect(blocked.card.operatorAction).toBe('检查输出机械臂并重试')
    expect(failed.card.requiresFieldAction).toBe(true)
    expect(failed.card.headerEyebrow).toContain('现场处置')
    expect(failed.card.operatorAction).toBe('复位设备后重新执行')
  })

  it('describes unknown as diagnosis insufficient with missing evidence', () => {
    const model = buildRuntimeDiagnosisVerdict({
      detail: detail({
        diagnosis_verdict: verdict({
          state: 'unknown',
          severity: 'warning',
          title: '诊断不足',
          summary: '缺少 Timeline 与诊断证据，无法判断是否阻塞。',
          requires_operator_action: false,
          primary_action: '补齐缺失证据后复核',
          blocking_point: 'unknown',
          owner: null,
          evidence_health: {
            level: 'missing',
            summary: '缺少关键证据',
            missing: ['timeline', 'diagnostics'],
            items: [
              {
                key: 'timeline',
                label: 'Timeline',
                count: 0,
                state: 'missing',
                hint: '缺少时间线，无法确认推进位置'
              }
            ]
          }
        })
      })
    })

    expect(model.card.headerEyebrow).toBe('诊断不足')
    expect(model.card.title).toBe('诊断不足')
    expect(model.card.message).toContain('缺少 Timeline')
    expect(model.card.operatorAction).toBe('补齐缺失证据后复核')
    expect(model.card.requiresFieldAction).toBe(false)
    expect(model.defaultTab).toBe('raw')
  })

  it('treats waiting admission/resource as non-field-action unless backend requires action', () => {
    const waiting = buildRuntimeDiagnosisVerdict({
      detail: detail({
        diagnosis_verdict: verdict({
          state: 'waiting',
          severity: 'warning',
          title: '等待设备接纳',
          summary: 'ECS 设备暂未满足 AUTO/IDLE。',
          requires_operator_action: false,
          primary_action: '继续观察 ECS 状态探测',
          blocking_point: 'resource',
          owner: 'device'
        })
      })
    })
    const escalated = buildRuntimeDiagnosisVerdict({
      detail: detail({
        diagnosis_verdict: verdict({
          state: 'waiting',
          severity: 'warning',
          title: '等待设备接纳',
          summary: 'ECS 设备长时间未满足 AUTO/IDLE。',
          requires_operator_action: true,
          primary_action: '现场确认设备状态',
          blocking_point: 'resource',
          owner: 'device'
        })
      })
    })

    expect(waiting.card.headerEyebrow).toBe('等待对象')
    expect(waiting.card.requiresFieldAction).toBe(false)
    expect(waiting.card.operatorAction).toBe('继续观察 ECS 状态探测')
    expect(escalated.card.requiresFieldAction).toBe(true)
    expect(escalated.card.operatorAction).toBe('现场确认设备状态')
  })

  it('exposes per-source evidence health from backend verdict', () => {
    const model = buildRuntimeDiagnosisVerdict({
      detail: detail({
        diagnosis_verdict: verdict({
          evidence_health: {
            level: 'partial',
            summary: '准入证据部分完整',
            missing: ['resource_wait'],
            items: [
              {
                key: 'workline_admission',
                label: 'START 准入',
                count: 2,
                state: 'present',
                hint: '最近一次准入检查可用'
              },
              {
                key: 'resource_wait',
                label: '资源等待',
                count: 0,
                state: 'missing',
                hint: '未找到资源等待明细'
              }
            ]
          }
        })
      })
    })

    expect(model.evidenceHealth.summary).toBe('准入证据部分完整')
    expect(model.evidenceHealth.items).toEqual([
      expect.objectContaining({
        key: 'workline_admission',
        count: 2,
        state: 'present',
        hint: '最近一次准入检查可用'
      }),
      expect.objectContaining({
        key: 'resource_wait',
        count: 0,
        state: 'missing',
        hint: '未找到资源等待明细'
      })
    ])
  })
})

describe('runtime diagnosis tab and request strategy', () => {
  it('resolves default evidence tab by verdict state', () => {
    expect(resolveRuntimeDiagnosisDefaultTab('completed_clear')).toBe('session')
    expect(resolveRuntimeDiagnosisDefaultTab('blocked')).toBe('diagnostics')
    expect(resolveRuntimeDiagnosisDefaultTab('failed')).toBe('diagnostics')
    expect(resolveRuntimeDiagnosisDefaultTab('waiting')).toBe('execution')
    expect(resolveRuntimeDiagnosisDefaultTab('unknown')).toBe('raw')
  })

  it('skips blocking-point fetch for completed_clear and non-actionable running', () => {
    expect(
      resolveRuntimeBlockingPointFetch(
        buildRuntimeDiagnosisVerdict({
          detail: detail({
            diagnosis_verdict: verdict({
              state: 'completed_clear',
              requires_operator_action: false
            })
          })
        })
      )
    ).toBe(false)

    expect(
      resolveRuntimeBlockingPointFetch(
        buildRuntimeDiagnosisVerdict({
          detail: detail({
            diagnosis_verdict: verdict({
              state: 'running',
              severity: 'info',
              title: '流程运行中',
              summary: '当前流程正常推进。',
              requires_operator_action: false,
              primary_action: '继续观察',
              blocking_point: 'none'
            })
          })
        })
      )
    ).toBe(false)
  })

  it('fetches blocking-point for waiting, blocked, failed, and unknown', () => {
    for (const state of ['waiting', 'blocked', 'failed', 'unknown'] as const) {
      expect(
        resolveRuntimeBlockingPointFetch(
          buildRuntimeDiagnosisVerdict({
            detail: detail({
              diagnosis_verdict: verdict({
                state,
                severity: state === 'failed' || state === 'blocked' ? 'danger' : 'warning',
                title: state,
                summary: state,
                requires_operator_action: state === 'blocked' || state === 'failed',
                blocking_point: state === 'unknown' ? 'unknown' : 'resource'
              })
            })
          })
        )
      ).toBe(true)
    }
  })
})
