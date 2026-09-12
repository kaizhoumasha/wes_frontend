import { describe, expect, it } from 'vitest'
import {
  buildTransportDiagnosticExport,
  buildTransportWaitingStages,
  createTransportDiagnosticFile
} from '@/views/ops/transport-diagnostics/transportDiagnosticExport'
import type { CallbackReceiptsResult, GetByTransportTaskIdResult } from '@/api/modules/transport'

const detail: GetByTransportTaskIdResult = {
  transport_task_id: 'transport-1',
  client_request_id: 'client-1',
  submit_operation_id: 'submit-1',
  kind: 'RACK_MOVE',
  status: 'RECONCILING',
  reason_code: 'TRANSPORT_RESULT_TIMEOUT',
  created_at: '2026-09-09T10:00:00Z',
  updated_at: '2026-09-09T10:06:00Z',
  latest_evidence: {
    operation: 'transport.task.resulted@v1',
    operation_id: '019f12d0-58d7-7000-8000-000000000099',
    outcome_revision: 1,
    status: 'PENDING',
    conflict_code: null,
    received_at: '2026-09-09T10:04:00Z',
    processed_at: null
  },
  send_started_at: '2026-09-09T10:00:01Z',
  next_submit_at: null,
  result_deadline_at: '2026-09-09T10:05:01Z',
  submit_attempt_count: 2,
  outcome_version: 3,
  published_outcome_version: 2,
  pending_evidence_count: 1,
  request: { kind: 'RACK_MOVE' },
  result: null
}

const receipt: CallbackReceiptsResult = {
  operation: 'transport.task.resulted@v1',
  operation_id: '019f12d0-58d7-7000-8000-000000000099',
  response_http_status: 200,
  response_code: 'RECEIVED',
  response_data: { accepted: true },
  received_at: '2026-09-09T10:04:00Z',
  conflict_code: null
}

describe('transport diagnostic export', () => {
  it('builds fixed WES-only facts and marks unavailable chain sections', () => {
    const exported = buildTransportDiagnosticExport(detail, receipt, '2026-09-09T10:10:00Z')

    expect(exported).toMatchObject({
      format: 'wes.transport-diagnostic-export.v1',
      exported_at: '2026-09-09T10:10:00Z',
      scope: { physical_completion_proof: false },
      task: { transport_task_id: 'transport-1' },
      chain: {
        business_decision: { observation: 'NOT_OBSERVED' },
        callback_receipt: { observation: 'OBSERVED', fact: receipt },
        result: { observation: 'NOT_OBSERVED' }
      }
    })
    expect(exported.omissions.missing_sections).toEqual([
      'business_decision',
      'acceptance',
      'result'
    ])
  })

  it('redacts credential-shaped keys and reports oversized sections as truncated', () => {
    const exported = buildTransportDiagnosticExport(
      {
        ...detail,
        request: {
          headers: { Authorization: 'Bearer secret-token' },
          password: 'do-not-export',
          payload: 'x'.repeat(70 * 1024)
        }
      },
      null,
      '2026-09-09T10:10:00Z'
    )
    const serialized = JSON.stringify(exported)

    expect(serialized).not.toContain('secret-token')
    expect(serialized).not.toContain('do-not-export')
    expect(exported.omissions.redacted_fields).toEqual([
      'task.request.headers.Authorization',
      'task.request.password'
    ])
    expect(exported.omissions.truncated_sections).toContain('task.request')
    expect(exported.omissions.missing_sections).toContain('callback_receipt')
  })

  it('does not export a mismatched receipt and records receipt query failure separately', () => {
    const exported = buildTransportDiagnosticExport(
      detail,
      { ...receipt, operation_id: 'different-operation-id' },
      '2026-09-09T10:10:00Z',
      true
    )

    expect(exported.chain.callback_receipt).toEqual({
      observation: 'QUERY_FAILED',
      fact: null,
      query_error: 'CALLBACK_RECEIPT_QUERY_FAILED'
    })
    expect(exported.omissions.query_failures).toEqual([
      { section: 'callback_receipt', error: 'CALLBACK_RECEIPT_QUERY_FAILED' }
    ])
  })

  it('shows every simultaneous wait without inventing retry plans', () => {
    expect(buildTransportWaitingStages(detail, new Date('2026-09-09T10:10:00Z'))).toEqual([
      {
        stage: '权威结果待确认',
        waiting_since: '2026-09-09T10:06:00Z',
        waiting_duration: '4 分 0 秒',
        last_attempt_at: '无记录',
        next_retry_at: '未安排'
      },
      {
        stage: 'WES 本地待处理 Evidence',
        waiting_since: '2026-09-09T10:04:00Z',
        waiting_duration: '6 分 0 秒',
        last_attempt_at: '无记录',
        next_retry_at: '未安排'
      },
      {
        stage: 'WES 本地待发布结果',
        waiting_since: '2026-09-09T10:06:00Z',
        waiting_duration: '4 分 0 秒',
        last_attempt_at: '无记录',
        next_retry_at: '未安排'
      }
    ])
  })

  it('shows the persisted submit backoff schedule and attempt time', () => {
    expect(
      buildTransportWaitingStages(
        {
          ...detail,
          status: 'PENDING',
          updated_at: '2026-09-09T10:08:00Z',
          send_started_at: null,
          next_submit_at: '2026-09-09T10:12:00Z',
          pending_evidence_count: 0,
          outcome_version: 0,
          published_outcome_version: 0,
          latest_evidence: null
        },
        new Date('2026-09-09T10:10:00Z')
      )
    ).toEqual([
      {
        stage: '提交退避',
        waiting_since: '2026-09-09T10:08:00Z',
        waiting_duration: '2 分 0 秒',
        last_attempt_at: '2026-09-09T10:08:00Z',
        next_retry_at: '2026-09-09T10:12:00Z'
      }
    ])
  })

  it('creates a deterministic JSON download without credentials', () => {
    const file = createTransportDiagnosticFile(detail, receipt, '2026-09-09T10:10:00Z')

    expect(file.filename).toBe('wes-transport-transport-1-20260909T101000Z.json')
    expect(JSON.parse(file.content)).toMatchObject({
      format: 'wes.transport-diagnostic-export.v1',
      task: { transport_task_id: 'transport-1' }
    })
  })
})
