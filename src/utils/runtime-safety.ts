import type {
  RuntimeSafetyIncidentSummary,
  RuntimeWorklineDeviceItem,
  RuntimeWorklineSummary
} from '@/types/runtime'
import {
  ESTOPPED_RUNTIME_STATUS,
  RECONCILING_RUNTIME_STATUS,
  SAFETY_EVIDENCE_STALE_MS,
  STOPPED_RUNTIME_STATUS,
  WORKLINE_STOPPED_REASON
} from '@/constants/runtime-safety'

type WorklineRuntimeTone = 'primary' | 'success' | 'warning' | 'danger' | 'info'

export type SafetyEvidenceState = 'not_required' | 'loading' | 'ready' | 'error' | 'stale'

export type WorklineSafetyState =
  | 'UNLOCKED'
  | 'LOCKED_LOADING_EVIDENCE'
  | 'LOCKED_READY'
  | 'CLEARING'
  | 'CLEAR_UNKNOWN'
  | 'CLEAR_REJECTED'
  | 'CLEARED'

export interface WorklineRuntimeVerdict {
  tone: WorklineRuntimeTone
  label: string
  priority: number
  safetyLocked: boolean
  canAttemptClear: boolean
  blockedReason: string | null
  evidenceFreshness: SafetyEvidenceState
  state: WorklineSafetyState
}

export interface WorklineSafetyEvidenceInput {
  state?: SafetyEvidenceState
  lastLoadedAt?: number | null
  now?: number
  locked?: boolean
  blockedReason?: string | null
  clearing?: boolean
  clearRejected?: boolean
  clearUnknown?: boolean
}

function safetyVerdict(
  tone: WorklineRuntimeTone,
  label: string,
  opts: {
    safetyLocked?: boolean
    canAttemptClear?: boolean
    blockedReason?: string | null
    evidenceFreshness?: SafetyEvidenceState
    state?: WorklineSafetyState
  } = {}
): WorklineRuntimeVerdict {
  return {
    tone,
    label,
    priority: opts.safetyLocked ? 100_000 : 0,
    safetyLocked: opts.safetyLocked ?? false,
    canAttemptClear: opts.canAttemptClear ?? false,
    blockedReason: opts.blockedReason ?? null,
    evidenceFreshness: opts.evidenceFreshness ?? 'not_required',
    state: opts.state ?? 'UNLOCKED'
  }
}

function isRuntimeStatusEstopped(summary: RuntimeWorklineSummary | null | undefined): boolean {
  return summary?.runtime_status === ESTOPPED_RUNTIME_STATUS
}

function isRuntimeStatusReconciling(summary: RuntimeWorklineSummary | null | undefined): boolean {
  return summary?.runtime_status === RECONCILING_RUNTIME_STATUS
}

function isRuntimeStatusStopped(summary: RuntimeWorklineSummary | null | undefined): boolean {
  return summary?.runtime_status === STOPPED_RUNTIME_STATUS
}

function isActiveIncident(incident: RuntimeSafetyIncidentSummary | null | undefined): boolean {
  if (!incident) return false
  return !['CLEARED', 'RESOLVED', 'CLOSED'].includes(incident.status)
}

export function getWorklineDeviceSafetyEvidence(
  devices: RuntimeWorklineDeviceItem[] | null | undefined
): WorklineSafetyEvidenceInput | undefined {
  const estoppedDevices = devices?.filter(device => device.error_code === 'WORKLINE_ESTOPPED') ?? []
  if (estoppedDevices.length === 0) return undefined
  return {
    state: 'ready',
    locked: true,
    blockedReason: `已有 ${estoppedDevices.length} 台设备回推 WORKLINE_ESTOPPED，等待后端 safety incident 状态同步。`
  }
}

function resolveEvidenceState(input?: WorklineSafetyEvidenceInput): SafetyEvidenceState {
  if (!input) return 'ready'
  if (input.state) return input.state
  if (!input.lastLoadedAt) return 'ready'
  const now = input.now ?? Date.now()
  return now - input.lastLoadedAt > SAFETY_EVIDENCE_STALE_MS ? 'stale' : 'ready'
}

function resolveSafetyBlockedReason(
  evidenceFreshness: SafetyEvidenceState,
  evidence?: WorklineSafetyEvidenceInput
): string | null {
  if (evidenceFreshness === 'error') {
    return '安全证据未加载，不能恢复接收。'
  }
  if (evidenceFreshness === 'stale') {
    return '安全证据已过期，不能恢复接收。'
  }
  return evidence?.blockedReason ?? null
}

export function isWorklineSafetyLocked(
  summary: RuntimeWorklineSummary | null | undefined,
  incident?: RuntimeSafetyIncidentSummary | null,
  evidence?: WorklineSafetyEvidenceInput
): boolean {
  if (
    isRuntimeStatusEstopped(summary) ||
    isRuntimeStatusReconciling(summary) ||
    isActiveIncident(incident) ||
    evidence?.locked
  )
    return true
  const evidenceState = resolveEvidenceState(evidence)
  return evidenceState === 'error' || evidenceState === 'stale'
}

export function getWorklineRuntimeVerdict(
  summary: RuntimeWorklineSummary,
  incident?: RuntimeSafetyIncidentSummary | null,
  evidence?: WorklineSafetyEvidenceInput
): WorklineRuntimeVerdict {
  const evidenceFreshness = resolveEvidenceState(evidence)
  const lockedByContract = isRuntimeStatusEstopped(summary) || isActiveIncident(incident)
  const lockedBySafety = lockedByContract || evidence?.locked === true
  const lockedByReconciliation = isRuntimeStatusReconciling(summary)

  if (evidence?.clearing) {
    return safetyVerdict('danger', '解除软件冻结中', {
      safetyLocked: true,
      blockedReason: '正在提交恢复检查，等待后端确认。',
      evidenceFreshness,
      state: 'CLEARING'
    })
  }

  if (evidence?.clearRejected) {
    return safetyVerdict('danger', '恢复被拒绝', {
      safetyLocked: true,
      blockedReason: '恢复检查未通过，请按拒绝原因处理后刷新安全证据。',
      evidenceFreshness,
      state: 'CLEAR_REJECTED'
    })
  }

  if (evidence?.clearUnknown) {
    return safetyVerdict('danger', '恢复结果未确认', {
      safetyLocked: true,
      blockedReason: '恢复请求结果未确认，请刷新工作线和事故状态。',
      evidenceFreshness,
      state: 'CLEAR_UNKNOWN'
    })
  }

  if (lockedByReconciliation) {
    return safetyVerdict('warning', '运行时对账中', {
      safetyLocked: true,
      canAttemptClear: false,
      blockedReason: '工作线正在 runtime reconciliation 对账，需人工确认后解除隔离。',
      evidenceFreshness,
      state: 'LOCKED_READY'
    })
  }

  if (lockedBySafety || evidenceFreshness === 'error' || evidenceFreshness === 'stale') {
    return safetyVerdict('danger', '软件急停冻结', {
      safetyLocked: true,
      canAttemptClear: evidenceFreshness === 'ready' && lockedByContract,
      blockedReason: resolveSafetyBlockedReason(evidenceFreshness, evidence),
      evidenceFreshness,
      state: evidenceFreshness === 'loading' ? 'LOCKED_LOADING_EVIDENCE' : 'LOCKED_READY'
    })
  }

  if (isRuntimeStatusStopped(summary)) {
    return safetyVerdict('warning', '等待现场 START', {
      safetyLocked: false,
      canAttemptClear: false,
      blockedReason: WORKLINE_STOPPED_REASON,
      evidenceFreshness,
      state: 'UNLOCKED'
    })
  }

  return safetyVerdict('success', '稳定')
}
