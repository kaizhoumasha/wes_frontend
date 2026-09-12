import type { CallbackReceiptsResult, GetByTransportTaskIdResult } from '@/api/modules/transport'

const MAX_STRING_LENGTH = 4 * 1024
const MAX_COLLECTION_ITEMS = 100
const MAX_DEPTH = 8
const SENSITIVE_KEY = /authorization|cookie|credential|password|secret|token|api[-_]?key/i

export interface TransportWaitingStage {
  stage: string
  waiting_since: string
  waiting_duration: string
  last_attempt_at: string
  next_retry_at: string
}

interface SanitizeState {
  redactedFields: string[]
  truncatedSections: Set<string>
}

export function buildTransportWaitingStages(
  detail: GetByTransportTaskIdResult,
  now = new Date()
): TransportWaitingStage[] {
  const stages: TransportWaitingStage[] = []

  if (detail.status === 'PENDING') {
    const isSubmitBackoff = !detail.send_started_at && Boolean(detail.next_submit_at)
    const waitingSince = isSubmitBackoff
      ? detail.updated_at
      : (detail.send_started_at ?? detail.created_at)
    stages.push(
      waitingStage(
        isSubmitBackoff
          ? '提交退避'
          : detail.send_started_at
            ? '等待对端接纳'
            : 'WES 本地待发送',
        waitingSince,
        isSubmitBackoff ? detail.updated_at : detail.send_started_at,
        detail.next_submit_at,
        now
      )
    )
  } else if (detail.status === 'ACCEPTED' || detail.status === 'RECONCILING') {
    stages.push(
      waitingStage(
        detail.status === 'ACCEPTED' ? '已接纳待权威结果' : '权威结果待确认',
        detail.updated_at,
        null,
        null,
        now
      )
    )
  }

  if (detail.pending_evidence_count > 0) {
    stages.push(
      waitingStage(
        'WES 本地待处理 Evidence',
        detail.latest_evidence?.received_at ?? detail.updated_at,
        detail.latest_evidence?.processed_at ?? null,
        null,
        now
      )
    )
  }

  if (detail.outcome_version > detail.published_outcome_version) {
    stages.push(waitingStage('WES 本地待发布结果', detail.updated_at, null, null, now))
  }

  return stages
}

export function buildTransportDiagnosticExport(
  detail: GetByTransportTaskIdResult,
  callbackReceipt: CallbackReceiptsResult | null,
  exportedAt = new Date().toISOString(),
  callbackReceiptQueryFailed = false
) {
  const state: SanitizeState = { redactedFields: [], truncatedSections: new Set() }
  const request = sanitizeSection(detail.request, 'task.request', state)
  const result = detail.result ? sanitizeSection(detail.result, 'chain.result', state) : null
  const evidence = detail.latest_evidence
    ? sanitizeSection(detail.latest_evidence, 'chain.evidence', state)
    : null
  const receipt = receiptMatchesEvidence(detail, callbackReceipt)
    ? sanitizeSection(callbackReceipt, 'chain.callback_receipt', state)
    : null
  const missingSections = ['business_decision']
  if (!detail.send_started_at) missingSections.push('dispatch')
  if (!isAcceptanceObserved(detail.status)) missingSections.push('acceptance')
  if (!evidence) missingSections.push('evidence')
  if (!result) missingSections.push('result')
  if (!receipt) missingSections.push('callback_receipt')

  return {
    format: 'wes.transport-diagnostic-export.v1' as const,
    exported_at: exportedAt,
    scope: {
      coverage: 'WES_PERSISTED_FACTS_ONLY' as const,
      physical_completion_proof: false
    },
    task: {
      transport_task_id: detail.transport_task_id,
      client_request_id: detail.client_request_id,
      submit_operation_id: detail.submit_operation_id,
      kind: detail.kind,
      status: detail.status,
      reason_code: detail.reason_code,
      created_at: detail.created_at,
      updated_at: detail.updated_at,
      submit_attempt_count: detail.submit_attempt_count,
      request
    },
    chain: {
      business_decision: { observation: 'NOT_OBSERVED' as const, fact: null },
      dispatch: {
        observation: detail.send_started_at ? ('OBSERVED' as const) : ('NOT_OBSERVED' as const),
        send_started_at: detail.send_started_at,
        next_submit_at: detail.next_submit_at,
        result_deadline_at: detail.result_deadline_at
      },
      acceptance: {
        observation: acceptanceObservation(detail.status),
        status: detail.status
      },
      evidence: {
        observation: evidence ? ('OBSERVED' as const) : ('NOT_OBSERVED' as const),
        fact: evidence
      },
      result: {
        observation: result ? ('OBSERVED' as const) : ('NOT_OBSERVED' as const),
        fact: result
      },
      callback_receipt: {
        observation: receipt
          ? ('OBSERVED' as const)
          : callbackReceiptQueryFailed
            ? ('QUERY_FAILED' as const)
            : ('NOT_OBSERVED' as const),
        fact: receipt,
        query_error: callbackReceiptQueryFailed ? 'CALLBACK_RECEIPT_QUERY_FAILED' : null
      }
    },
    waiting: buildTransportWaitingStages(detail, new Date(exportedAt)),
    omissions: {
      missing_sections: missingSections,
      truncated_sections: [...state.truncatedSections],
      redacted_fields: state.redactedFields,
      query_failures: callbackReceiptQueryFailed
        ? [{ section: 'callback_receipt', error: 'CALLBACK_RECEIPT_QUERY_FAILED' }]
        : []
    }
  }
}

export function createTransportDiagnosticFile(
  detail: GetByTransportTaskIdResult,
  callbackReceipt: CallbackReceiptsResult | null,
  exportedAt = new Date().toISOString(),
  callbackReceiptQueryFailed = false
): { filename: string; content: string } {
  const timestamp = new Date(exportedAt).toISOString().replace(/[-:]/g, '').replace('.000', '')
  const safeTaskId = detail.transport_task_id.replace(/[^a-zA-Z0-9._-]/g, '_')
  return {
    filename: `wes-transport-${safeTaskId}-${timestamp}.json`,
    content: `${JSON.stringify(buildTransportDiagnosticExport(detail, callbackReceipt, exportedAt, callbackReceiptQueryFailed), null, 2)}\n`
  }
}

export function downloadTransportDiagnosticFile(
  detail: GetByTransportTaskIdResult,
  callbackReceipt: CallbackReceiptsResult | null,
  callbackReceiptQueryFailed = false
): void {
  const file = createTransportDiagnosticFile(
    detail,
    callbackReceipt,
    new Date().toISOString(),
    callbackReceiptQueryFailed
  )
  const url = URL.createObjectURL(
    new Blob([file.content], { type: 'application/json;charset=utf-8' })
  )
  try {
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = file.filename
    anchor.click()
  } finally {
    URL.revokeObjectURL(url)
  }
}

function waitingStage(
  stage: string,
  waitingSince: string,
  lastAttemptAt: string | null,
  nextRetryAt: string | null,
  now: Date
): TransportWaitingStage {
  return {
    stage,
    waiting_since: waitingSince,
    waiting_duration: formatDuration(waitingSince, now),
    last_attempt_at: lastAttemptAt ?? '无记录',
    next_retry_at: nextRetryAt ?? '未安排'
  }
}

function formatDuration(startedAt: string, now: Date): string {
  const started = new Date(startedAt)
  if (Number.isNaN(started.getTime())) return '无记录'
  const totalSeconds = Math.max(0, Math.floor((now.getTime() - started.getTime()) / 1000))
  const days = Math.floor(totalSeconds / 86_400)
  const hours = Math.floor((totalSeconds % 86_400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  if (days > 0) return `${days} 天 ${hours} 小时`
  if (hours > 0) return `${hours} 小时 ${minutes} 分`
  if (minutes > 0) return `${minutes} 分 ${seconds} 秒`
  return `${seconds} 秒`
}

function acceptanceObservation(status: GetByTransportTaskIdResult['status']) {
  if (status === 'REJECTED') return 'REJECTED' as const
  return isAcceptanceObserved(status) ? ('OBSERVED' as const) : ('NOT_OBSERVED' as const)
}

function isAcceptanceObserved(status: GetByTransportTaskIdResult['status']): boolean {
  return status === 'ACCEPTED' || status === 'SUCCEEDED' || status === 'FAILED'
}

function receiptMatchesEvidence(
  detail: GetByTransportTaskIdResult,
  receipt: CallbackReceiptsResult | null
): receipt is CallbackReceiptsResult {
  return Boolean(
    receipt &&
    detail.latest_evidence &&
    receipt.operation === detail.latest_evidence.operation &&
    receipt.operation_id === detail.latest_evidence.operation_id
  )
}

function sanitizeSection(value: unknown, section: string, state: SanitizeState): unknown {
  return sanitizeValue(value, section, section, state, 0)
}

function sanitizeValue(
  value: unknown,
  path: string,
  section: string,
  state: SanitizeState,
  depth: number
): unknown {
  if (depth > MAX_DEPTH) {
    state.truncatedSections.add(section)
    return '[TRUNCATED: depth limit]'
  }
  if (typeof value === 'string' && value.length > MAX_STRING_LENGTH) {
    state.truncatedSections.add(section)
    return `${value.slice(0, MAX_STRING_LENGTH)}[TRUNCATED]`
  }
  if (Array.isArray(value)) {
    if (value.length > MAX_COLLECTION_ITEMS) state.truncatedSections.add(section)
    return value
      .slice(0, MAX_COLLECTION_ITEMS)
      .map((item, index) => sanitizeValue(item, `${path}[${index}]`, section, state, depth + 1))
  }
  if (typeof value === 'object' && value !== null) {
    const entries = Object.entries(value)
    if (entries.length > MAX_COLLECTION_ITEMS) state.truncatedSections.add(section)
    return Object.fromEntries(
      entries.slice(0, MAX_COLLECTION_ITEMS).flatMap(([key, item]) => {
        const itemPath = `${path}.${key}`
        if (SENSITIVE_KEY.test(key)) {
          state.redactedFields.push(itemPath)
          return []
        }
        return [[key, sanitizeValue(item, itemPath, section, state, depth + 1)]]
      })
    )
  }
  return value
}
