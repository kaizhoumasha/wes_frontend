import type {
  DiagnosisEvidenceHealth,
  DiagnosisEvidenceHealthItem,
  DiagnosisEvidenceHealthItemKey,
  DiagnosisEvidenceHealthItemState,
  DiagnosisEvidenceHealthLevel,
  DiagnosisVerdict,
  DiagnosisVerdictBlockingPoint,
  DiagnosisVerdictSeverity,
  DiagnosisVerdictState,
  TraceBlockingPointResponse,
  TraceDetailResponse,
  TraceTimelineItem
} from '@/types/runtime'
import type { RuntimeTone } from '@/utils/runtime-display'
import { compactEnumLabel, isActiveStatus, isFailureStatus } from '@/utils/runtime-display'

export type RuntimeDiagnosisDefaultTab =
  | 'diagnostics'
  | 'ingress'
  | 'session'
  | 'execution'
  | 'raw'

export type RuntimeDiagnosisTopologyVerdict = 'success' | 'danger' | 'warning' | 'primary' | 'info'

export interface RuntimeDiagnosisCardViewModel {
  headerEyebrow: string
  headerTitle: string
  badgeLabel: string
  badgeTone: RuntimeTone
  title: string
  message: string
  operatorAction: string
  blockingPointLabel: string
  ownerLabel: string
  recoverabilityLabel: string
  requiresFieldAction: boolean
  showTechnicalInfo: boolean
  errorCode: string
  problemClass: string
  nextSteps: string[]
}

export interface RuntimeDiagnosisTopologyViewModel {
  verdict: RuntimeDiagnosisTopologyVerdict
  verdictTitle: string
  verdictDescription: string
  exceptionText: string
  operatorAction: string
}

export interface RuntimeDiagnosisEvidenceHealthViewModel {
  level: DiagnosisEvidenceHealthLevel
  summary: string
  missing: string[]
  items: DiagnosisEvidenceHealthItem[]
}

export interface RuntimeDiagnosisVerdictViewModel {
  state: DiagnosisVerdictState
  severity: DiagnosisVerdictSeverity
  blockingPoint: DiagnosisVerdictBlockingPoint
  owner: string | null
  requiresOperatorAction: boolean
  primaryAction: string
  title: string
  summary: string
  card: RuntimeDiagnosisCardViewModel
  topology: RuntimeDiagnosisTopologyViewModel
  evidenceHealth: RuntimeDiagnosisEvidenceHealthViewModel
  defaultTab: RuntimeDiagnosisDefaultTab
  shouldFetchBlockingPoint: boolean
}

export interface BuildRuntimeDiagnosisVerdictOptions {
  detail: TraceDetailResponse
  blockingPoint?: TraceBlockingPointResponse | null
}

const OWNER_LABELS: Record<string, string> = {
  DEVICE: '设备问题（联系设备维护）',
  INTEGRATION: '接入集成问题（联系技术）',
  WORKFLOW: '流程编排问题（联系技术）',
  PLUGIN: '业务插件问题（联系技术）',
  CONFIGURATION: '配置问题（联系运维）',
  MATERIAL: '物料问题（现场人员处理）',
  PLATFORM: '平台底层问题（联系技术支持）',
  OPS: '运维操作（当前人员处理）',
  OPERATOR: '运维操作（当前人员处理）',
  WORKLINE: '工作线准入',
  SESSION: '会话状态',
  SYSTEM: '系统诊断'
}

const RECOVERABILITY_LABELS: Record<string, string> = {
  AUTO_RETRYABLE: '系统自动重试中，请等待',
  MANUAL_RETRYABLE: '需人工触发重试',
  MANUAL_INTERVENTION_REQUIRED: '需现场人工介入处理',
  NON_RECOVERABLE: '当前流程不可恢复，需升级处理'
}

const EVIDENCE_LABELS: Record<DiagnosisEvidenceHealthItemKey, string> = {
  session: 'Session',
  timeline: 'Timeline',
  callback: 'Callback',
  inbox: 'Inbox',
  command: 'Command',
  outbox: 'Outbox',
  diagnostics: '诊断',
  workline_admission: 'START 准入',
  resource_wait: '资源等待'
}

function normalizeState(value: string | null | undefined): DiagnosisVerdictState {
  const state = value?.toLowerCase()
  if (
    state === 'completed_clear' ||
    state === 'running' ||
    state === 'waiting' ||
    state === 'blocked' ||
    state === 'failed' ||
    state === 'unknown'
  ) {
    return state
  }
  return 'unknown'
}

function normalizeSeverity(value: string | null | undefined): DiagnosisVerdictSeverity {
  const severity = value?.toLowerCase()
  if (
    severity === 'success' ||
    severity === 'info' ||
    severity === 'warning' ||
    severity === 'danger'
  ) {
    return severity
  }
  return 'warning'
}

function normalizeBlockingPoint(value: string | null | undefined): DiagnosisVerdictBlockingPoint {
  const point = value?.toLowerCase()
  if (
    point === 'none' ||
    point === 'session' ||
    point === 'inbox' ||
    point === 'outbox' ||
    point === 'command' ||
    point === 'external_wms' ||
    point === 'resource' ||
    point === 'admission' ||
    point === 'unknown'
  ) {
    return point
  }
  return 'unknown'
}

function normalizeEvidenceState(value: string | null | undefined): DiagnosisEvidenceHealthItemState {
  const state = value?.toLowerCase()
  if (state === 'present' || state === 'empty' || state === 'missing' || state === 'not_required') {
    return state
  }
  return 'missing'
}

function normalizeEvidenceKey(value: string | null | undefined): DiagnosisEvidenceHealthItemKey {
  const key = value?.toLowerCase()
  if (
    key === 'session' ||
    key === 'timeline' ||
    key === 'callback' ||
    key === 'inbox' ||
    key === 'command' ||
    key === 'outbox' ||
    key === 'diagnostics' ||
    key === 'workline_admission' ||
    key === 'resource_wait'
  ) {
    return key
  }
  return 'diagnostics'
}

function severityToTopologyVerdict(
  state: DiagnosisVerdictState,
  severity: DiagnosisVerdictSeverity
): RuntimeDiagnosisTopologyVerdict {
  if (state === 'completed_clear') {
    return 'success'
  }
  if (state === 'failed' || state === 'blocked' || severity === 'danger') {
    return 'danger'
  }
  if (state === 'waiting' || state === 'unknown' || severity === 'warning') {
    return 'warning'
  }
  if (state === 'running') {
    return 'primary'
  }
  return 'info'
}

function severityToTone(
  state: DiagnosisVerdictState,
  severity: DiagnosisVerdictSeverity
): RuntimeTone {
  if (state === 'completed_clear') {
    return 'success'
  }
  if (state === 'blocked' || state === 'failed' || severity === 'danger') {
    return 'danger'
  }
  if (state === 'waiting' || state === 'unknown' || severity === 'warning') {
    return 'warning'
  }
  return 'info'
}

function latestFailureTimeline(detail: TraceDetailResponse): TraceTimelineItem | null {
  return [...detail.timelines]
    .sort((left, right) => left.seq_no - right.seq_no || left.id - right.id)
    .reverse()
    .find(item => item.failure_domain || item.message || item.action_type === 'MANUAL_HOLD') ?? null
}

function payloadText(item: TraceTimelineItem | null | undefined, key: string): string | undefined {
  const value = item?.payload_json?.[key]
  return typeof value === 'string' && value.trim() ? value : undefined
}

function isFallbackUnknownBlockingPoint(
  blockingPoint?: TraceBlockingPointResponse | null
): boolean {
  if (!blockingPoint) {
    return false
  }

  const diagnostic = blockingPoint.diagnostic_card
  const hasNoConcretePoint =
    blockingPoint.blocking_point.toLowerCase() === 'none' ||
    blockingPoint.blocking_point.toUpperCase() === 'UNKNOWN'
  return (
    hasNoConcretePoint &&
    diagnostic?.error_domain === 'SYSTEM' &&
    diagnostic?.error_code === 'UNKNOWN'
  )
}

function countEvidence(detail: TraceDetailResponse, key: DiagnosisEvidenceHealthItemKey): number {
  const counts: Record<DiagnosisEvidenceHealthItemKey, number> = {
    session: detail.session ? 1 : 0,
    timeline: detail.timelines.length,
    callback: detail.callback_logs.length,
    inbox: detail.inboxes.length,
    command: detail.commands.length,
    outbox: detail.outboxes.length,
    diagnostics: detail.diagnostics.length,
    workline_admission: 0,
    resource_wait: 0
  }
  return counts[key]
}

function evidenceItem(
  detail: TraceDetailResponse,
  key: DiagnosisEvidenceHealthItemKey,
  state: DiagnosisEvidenceHealthItemState,
  hint: string
): DiagnosisEvidenceHealthItem {
  return {
    key,
    label: EVIDENCE_LABELS[key],
    count: countEvidence(detail, key),
    state,
    hint
  }
}

function legacyEvidenceHealth(
  detail: TraceDetailResponse,
  state: DiagnosisVerdictState
): DiagnosisEvidenceHealth {
  if (state === 'completed_clear') {
    return {
      level: 'complete',
      summary: '完成态证据已足够判断无阻塞点',
      missing: [],
      items: [
        evidenceItem(detail, 'session', detail.session ? 'present' : 'missing', '主证据'),
        evidenceItem(detail, 'timeline', detail.timelines.length ? 'present' : 'not_required', '完成态可由会话状态确认'),
        evidenceItem(detail, 'callback', detail.callback_logs.length ? 'present' : 'not_required', '当前完成态不依赖 callback 证据'),
        evidenceItem(detail, 'inbox', detail.inboxes.length ? 'present' : 'empty', '当前完成态无待处理 inbox'),
        evidenceItem(detail, 'command', detail.commands.length ? 'present' : 'empty', '当前完成态无失败设备指令'),
        evidenceItem(detail, 'outbox', detail.outboxes.length ? 'present' : 'empty', '当前完成态无待发送 outbox'),
        evidenceItem(detail, 'diagnostics', detail.diagnostics.length ? 'present' : 'not_required', '当前完成态不依赖持久化诊断')
      ]
    }
  }

  const missing = [
    !detail.session ? 'session' : null,
    !detail.timelines.length ? 'timeline' : null,
    !detail.diagnostics.length ? 'diagnostics' : null
  ].filter((item): item is string => Boolean(item))
  return {
    level: missing.length ? 'partial' : 'complete',
    summary: missing.length ? `缺少 ${missing.join(' / ')} 证据` : '证据足够支撑当前诊断',
    missing,
    items: [
      evidenceItem(detail, 'session', detail.session ? 'present' : 'missing', '会话状态用于判断运行结论'),
      evidenceItem(detail, 'timeline', detail.timelines.length ? 'present' : 'missing', '时间线用于定位推进位置'),
      evidenceItem(detail, 'callback', detail.callback_logs.length ? 'present' : 'empty', '入口回调用于复核外部请求'),
      evidenceItem(detail, 'inbox', detail.inboxes.length ? 'present' : 'empty', 'Inbox 用于复核入口处理结果'),
      evidenceItem(detail, 'command', detail.commands.length ? 'present' : 'empty', 'Command 用于复核设备执行'),
      evidenceItem(detail, 'outbox', detail.outboxes.length ? 'present' : 'empty', 'Outbox 用于复核外发与等待'),
      evidenceItem(detail, 'diagnostics', detail.diagnostics.length ? 'present' : 'missing', '诊断证据用于确认责任归属')
    ]
  }
}

function normalizeEvidenceHealth(
  detail: TraceDetailResponse,
  state: DiagnosisVerdictState,
  evidenceHealth: DiagnosisEvidenceHealth | null | undefined
): DiagnosisEvidenceHealth {
  if (!evidenceHealth) {
    return legacyEvidenceHealth(detail, state)
  }

  return {
    level:
      evidenceHealth.level === 'complete' ||
      evidenceHealth.level === 'partial' ||
      evidenceHealth.level === 'missing'
        ? evidenceHealth.level
        : 'partial',
    summary: evidenceHealth.summary || '证据健康状态待确认',
    missing: evidenceHealth.missing ?? [],
    items: (evidenceHealth.items ?? []).map(item => {
      const key = normalizeEvidenceKey(item.key)
      return {
        key,
        label: item.label || EVIDENCE_LABELS[key],
        count: Number.isFinite(item.count) ? item.count : 0,
        state: normalizeEvidenceState(item.state),
        hint: item.hint || '暂无说明'
      }
    })
  }
}

function completedClearVerdict(detail: TraceDetailResponse): DiagnosisVerdict {
  return {
    state: 'completed_clear',
    severity: 'success',
    title: '流程已完成',
    summary: '当前案件已正常结束，未发现阻塞点。',
    requires_operator_action: false,
    primary_action: '无需现场处置',
    blocking_point: 'none',
    owner: null,
    evidence_health: legacyEvidenceHealth(detail, 'completed_clear')
  }
}

function legacyVerdictFromFailure(
  detail: TraceDetailResponse,
  blockingPoint?: TraceBlockingPointResponse | null
): DiagnosisVerdict | null {
  const timeline = latestFailureTimeline(detail)
  const concreteBlockingPoint =
    blockingPoint && !isFallbackUnknownBlockingPoint(blockingPoint) ? blockingPoint : null
  const shouldUseBlockingPoint = Boolean(concreteBlockingPoint)
  const hasTraceFailure = Boolean(
    detail.session?.failure_domain ||
      detail.session?.failure_code ||
      detail.session?.failure_message ||
      timeline?.failure_domain ||
      timeline?.message ||
      payloadText(timeline, 'reason_code')
  )
  const failureDomain =
    detail.session?.failure_domain ||
    timeline?.failure_domain ||
    concreteBlockingPoint?.diagnostic_card.error_domain
  const failureCode =
    detail.session?.failure_code ||
    payloadText(timeline, 'reason_code') ||
    (concreteBlockingPoint
      ? concreteBlockingPoint.diagnostic_card.error_code !== 'UNKNOWN'
        ? concreteBlockingPoint.diagnostic_card.error_code
        : concreteBlockingPoint.blocking_point
      : null)
  const failureMessage =
    detail.session?.failure_message ||
    timeline?.message ||
    detail.summary.latest_timeline_message ||
    (concreteBlockingPoint
      ? concreteBlockingPoint.diagnostic_card.user_message || concreteBlockingPoint.diagnostic_card.summary
      : null)
  const suggestedAction =
    payloadText(timeline, 'suggested_action') ||
    detail.session?.required_operator_action ||
    blockingPoint?.operator_action ||
    blockingPoint?.diagnostic_card.operator_action ||
    null

  if (!hasTraceFailure && !shouldUseBlockingPoint) {
    return null
  }

  const state = isFailureStatus(detail.session?.status ?? detail.summary.session_status)
    ? 'failed'
    : 'blocked'
  const title = [failureDomain, failureCode].filter(Boolean).join(' / ') || 'Trace 已定位原因'
  const summary = [title, failureMessage].filter(Boolean).join('：')
  return {
    state,
    severity: 'danger',
    title,
    summary: summary || 'Trace 已定位到业务异常，请按建议动作处理。',
    requires_operator_action: true,
    primary_action: suggestedAction || '查看阻塞点证据后处理',
    blocking_point: normalizeBlockingPoint(blockingPoint?.blocking_point || failureCode || 'unknown'),
    owner: failureDomain || blockingPoint?.owner || null,
    evidence_health: legacyEvidenceHealth(detail, state)
  }
}

function legacyVerdict(
  detail: TraceDetailResponse,
  blockingPoint?: TraceBlockingPointResponse | null
): DiagnosisVerdict {
  const status = detail.session?.status ?? detail.summary.session_status
  const hasCompletedStatus =
    status === 'COMPLETED' || detail.summary.latest_timeline_action === 'SESSION_COMPLETED'

  if (hasCompletedStatus && (!blockingPoint || isFallbackUnknownBlockingPoint(blockingPoint))) {
    return completedClearVerdict(detail)
  }

  const failure = legacyVerdictFromFailure(detail, blockingPoint)
  if (failure) {
    return failure
  }

  if (isActiveStatus(status) || isActiveStatus(detail.summary.latest_timeline_status)) {
    return {
      state: detail.session?.current_wait_type ? 'waiting' : 'running',
      severity: detail.session?.current_wait_type ? 'warning' : 'info',
      title: detail.session?.current_wait_type ? '流程等待中' : '流程运行中',
      summary: detail.session?.current_wait_type
        ? `当前等待 ${compactEnumLabel(detail.session.current_wait_type)}。`
        : '当前流程正在正常推进。',
      requires_operator_action: false,
      primary_action: detail.session?.current_wait_type ? '继续观察等待证据' : '继续观察运行进度',
      blocking_point: detail.session?.current_wait_type ? 'unknown' : 'none',
      owner: null,
      evidence_health: legacyEvidenceHealth(
        detail,
        detail.session?.current_wait_type ? 'waiting' : 'running'
      )
    }
  }

  return {
    state: 'unknown',
    severity: 'warning',
    title: '诊断不足',
    summary: '缺少足够证据，无法判断当前 Trace 是否需要处置。',
    requires_operator_action: false,
    primary_action: '补齐缺失证据后复核',
    blocking_point: 'unknown',
    owner: null,
    evidence_health: legacyEvidenceHealth(detail, 'unknown')
  }
}

function normalizeVerdict(
  detail: TraceDetailResponse,
  blockingPoint?: TraceBlockingPointResponse | null
): DiagnosisVerdict {
  const source = detail.diagnosis_verdict ?? blockingPoint?.diagnosis_verdict ?? null
  if (!source) {
    return legacyVerdict(detail, blockingPoint)
  }

  const state = normalizeState(source.state)
  return {
    state,
    severity: normalizeSeverity(source.severity),
    title: source.title || stateTitle(state),
    summary: source.summary || stateSummary(state),
    requires_operator_action: Boolean(source.requires_operator_action),
    primary_action: source.primary_action ?? defaultPrimaryAction(state),
    blocking_point: normalizeBlockingPoint(source.blocking_point),
    owner: source.owner ?? null,
    evidence_health: normalizeEvidenceHealth(detail, state, source.evidence_health)
  }
}

function stateTitle(state: DiagnosisVerdictState): string {
  const map: Record<DiagnosisVerdictState, string> = {
    completed_clear: '流程已完成',
    running: '流程运行中',
    waiting: '流程等待中',
    blocked: '流程已阻塞',
    failed: '流程失败',
    unknown: '诊断不足'
  }
  return map[state]
}

function stateSummary(state: DiagnosisVerdictState): string {
  const map: Record<DiagnosisVerdictState, string> = {
    completed_clear: '当前案件已正常结束，未发现阻塞点。',
    running: '当前流程正在正常推进。',
    waiting: '当前流程正在等待外部事件或设备条件。',
    blocked: '当前流程存在明确阻塞点。',
    failed: '当前流程已失败，需要处理后恢复。',
    unknown: '缺少足够证据，无法判断当前 Trace 是否需要处置。'
  }
  return map[state]
}

function defaultPrimaryAction(state: DiagnosisVerdictState): string {
  const map: Record<DiagnosisVerdictState, string> = {
    completed_clear: '无需现场处置',
    running: '继续观察运行进度',
    waiting: '继续观察等待证据',
    blocked: '查看阻塞点证据后处理',
    failed: '查看失败证据后处理',
    unknown: '补齐缺失证据后复核'
  }
  return map[state]
}

function headerEyebrow(state: DiagnosisVerdictState, requiresAction: boolean): string {
  if (state === 'blocked' || state === 'failed' || requiresAction) {
    return '现场处置 · 阻塞点诊断卡'
  }
  if (state === 'waiting') {
    return '等待对象'
  }
  if (state === 'unknown') {
    return '诊断不足'
  }
  return '诊断结论'
}

function cardTitle(verdict: DiagnosisVerdict): string {
  if (verdict.state === 'completed_clear') {
    return '无阻塞点'
  }
  return verdict.title
}

function blockingPointLabel(point: DiagnosisVerdictBlockingPoint): string {
  const labels: Partial<Record<DiagnosisVerdictBlockingPoint, string>> = {
    admission: 'Admission',
    resource: 'Resource',
    command: 'Command',
    session: 'Session',
    inbox: 'Inbox',
    outbox: 'Outbox',
    unknown: 'Unknown'
  }
  if (point === 'none') {
    return '无阻塞点'
  }
  if (point === 'external_wms') {
    return 'External WMS'
  }
  return labels[point] || compactEnumLabel(point)
}

function ownerLabel(owner: string | null | undefined): string {
  const raw = owner?.toUpperCase() ?? ''
  return OWNER_LABELS[raw] || compactEnumLabel(owner) || '—'
}

function recoverabilityLabel(blockingPoint?: TraceBlockingPointResponse | null): string {
  const raw = blockingPoint?.recoverability?.toUpperCase() ?? ''
  return RECOVERABILITY_LABELS[raw] || compactEnumLabel(blockingPoint?.recoverability) || '—'
}

function cardNextSteps(
  verdict: DiagnosisVerdict,
  blockingPoint?: TraceBlockingPointResponse | null
): string[] {
  if (verdict.state === 'unknown' && verdict.evidence_health.missing.length) {
    return verdict.evidence_health.missing.map(item => `补齐 ${compactEnumLabel(item)} 证据`)
  }
  return (blockingPoint?.diagnostic_card.next_steps ?? blockingPoint?.next_steps ?? [])
    .filter(Boolean)
    .slice(0, 5)
}

function buildCardViewModel(
  verdict: DiagnosisVerdict,
  blockingPoint?: TraceBlockingPointResponse | null
): RuntimeDiagnosisCardViewModel {
  const requiresFieldAction =
    verdict.requires_operator_action || verdict.state === 'blocked' || verdict.state === 'failed'
  const action = verdict.primary_action || defaultPrimaryAction(verdict.state)

  return {
    headerEyebrow: headerEyebrow(verdict.state, requiresFieldAction),
    headerTitle: requiresFieldAction ? '阻塞点诊断卡' : '诊断结论',
    badgeLabel: blockingPointLabel(verdict.blocking_point),
    badgeTone: severityToTone(verdict.state, verdict.severity),
    title: cardTitle(verdict),
    message: verdict.summary,
    operatorAction: action,
    blockingPointLabel: blockingPointLabel(verdict.blocking_point),
    ownerLabel: ownerLabel(verdict.owner),
    recoverabilityLabel: recoverabilityLabel(blockingPoint),
    requiresFieldAction,
    showTechnicalInfo: requiresFieldAction && Boolean(blockingPoint),
    errorCode: blockingPoint?.diagnostic_card.error_code || compactEnumLabel(verdict.blocking_point),
    problemClass: blockingPoint?.diagnostic_card.problem_class || compactEnumLabel(verdict.owner) || '—',
    nextSteps: cardNextSteps(verdict, blockingPoint)
  }
}

function buildTopologyViewModel(verdict: DiagnosisVerdict): RuntimeDiagnosisTopologyViewModel {
  const topologyVerdict = severityToTopologyVerdict(verdict.state, verdict.severity)
  const action = verdict.primary_action || defaultPrimaryAction(verdict.state)
  const exceptionText = verdict.state === 'completed_clear' ? '无异常' : verdict.summary
  return {
    verdict: topologyVerdict,
    verdictTitle: verdict.title,
    verdictDescription: verdict.summary,
    exceptionText,
    operatorAction: action
  }
}

export function resolveRuntimeDiagnosisDefaultTab(
  state: DiagnosisVerdictState
): RuntimeDiagnosisDefaultTab {
  const map: Record<DiagnosisVerdictState, RuntimeDiagnosisDefaultTab> = {
    completed_clear: 'session',
    running: 'execution',
    waiting: 'execution',
    blocked: 'diagnostics',
    failed: 'diagnostics',
    unknown: 'raw'
  }
  return map[state]
}

export function resolveRuntimeBlockingPointFetch(
  model: Pick<RuntimeDiagnosisVerdictViewModel, 'state' | 'requiresOperatorAction'>
): boolean {
  if (model.state === 'completed_clear') {
    return false
  }
  if (model.state === 'running' && !model.requiresOperatorAction) {
    return false
  }
  return true
}

export function buildRuntimeDiagnosisVerdict({
  detail,
  blockingPoint = null
}: BuildRuntimeDiagnosisVerdictOptions): RuntimeDiagnosisVerdictViewModel {
  const verdict = normalizeVerdict(detail, blockingPoint)
  const evidenceHealth = normalizeEvidenceHealth(detail, verdict.state, verdict.evidence_health)
  const normalizedVerdict = {
    ...verdict,
    evidence_health: evidenceHealth
  }
  const defaultTab = resolveRuntimeDiagnosisDefaultTab(normalizedVerdict.state)
  const baseModel = {
    state: normalizedVerdict.state,
    severity: normalizedVerdict.severity,
    blockingPoint: normalizedVerdict.blocking_point,
    owner: normalizedVerdict.owner ?? null,
    requiresOperatorAction: normalizedVerdict.requires_operator_action,
    primaryAction: normalizedVerdict.primary_action || defaultPrimaryAction(normalizedVerdict.state),
    title: normalizedVerdict.title,
    summary: normalizedVerdict.summary,
    card: buildCardViewModel(normalizedVerdict, blockingPoint),
    topology: buildTopologyViewModel(normalizedVerdict),
    evidenceHealth,
    defaultTab
  }

  return {
    ...baseModel,
    shouldFetchBlockingPoint: resolveRuntimeBlockingPointFetch(baseModel)
  }
}
