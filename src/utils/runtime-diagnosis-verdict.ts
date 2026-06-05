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
  TraceDetailResponse
} from '@/types/runtime'
import type { RuntimeTone } from '@/utils/runtime-display'
import { compactEnumLabel } from '@/utils/runtime-display'

export type RuntimeDiagnosisDefaultTab = 'diagnostics' | 'ingress' | 'session' | 'execution' | 'raw'

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
  verdict?: DiagnosisVerdict | null
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

function normalizeEvidenceState(
  value: string | null | undefined
): DiagnosisEvidenceHealthItemState {
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

function normalizeEvidenceHealth(
  evidenceHealth: DiagnosisEvidenceHealth | null | undefined
): RuntimeDiagnosisEvidenceHealthViewModel {
  if (!evidenceHealth) {
    return contractMissingEvidenceHealth()
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

function contractMissingEvidenceHealth(): RuntimeDiagnosisEvidenceHealthViewModel {
  return {
    level: 'missing',
    summary: '后端诊断契约缺失',
    missing: ['diagnosis_verdict'],
    items: [
      {
        key: 'diagnostics',
        label: EVIDENCE_LABELS.diagnostics,
        count: 0,
        state: 'missing',
        hint: 'Trace 响应缺少后端 diagnosis_verdict'
      }
    ]
  }
}

function contractMissingVerdict(): DiagnosisVerdict {
  return {
    state: 'unknown',
    severity: 'warning',
    title: '后端诊断缺失',
    summary: 'Trace 响应缺少 diagnosis_verdict，无法展示后端诊断结论。',
    requires_operator_action: false,
    primary_action: '刷新 Trace 或检查后端契约',
    blocking_point: 'unknown',
    owner: 'system',
    evidence_health: contractMissingEvidenceHealth()
  }
}

function normalizeVerdict(source: DiagnosisVerdict | null | undefined): DiagnosisVerdict {
  if (!source) {
    return contractMissingVerdict()
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
    evidence_health: normalizeEvidenceHealth(source.evidence_health)
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
  const missing = verdict.evidence_health.missing ?? []
  if (verdict.state === 'unknown' && missing.length) {
    return missing.map(item => `补齐 ${compactEnumLabel(item)} 证据`)
  }
  return (blockingPoint?.diagnostic_card?.next_steps ?? blockingPoint?.next_steps ?? [])
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
    errorCode:
      blockingPoint?.diagnostic_card?.error_code || compactEnumLabel(verdict.blocking_point),
    problemClass:
      blockingPoint?.diagnostic_card?.problem_class || compactEnumLabel(verdict.owner) || '—',
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
  verdict = null,
  blockingPoint = null
}: BuildRuntimeDiagnosisVerdictOptions): RuntimeDiagnosisVerdictViewModel {
  const sourceVerdict = verdict ?? detail.diagnosis_verdict ?? blockingPoint?.diagnosis_verdict ?? null
  const normalizedSourceVerdict = normalizeVerdict(sourceVerdict)
  const evidenceHealth = normalizeEvidenceHealth(normalizedSourceVerdict.evidence_health)
  const normalizedVerdict = {
    ...normalizedSourceVerdict,
    evidence_health: evidenceHealth
  }
  const defaultTab = resolveRuntimeDiagnosisDefaultTab(normalizedVerdict.state)
  const baseModel = {
    state: normalizedVerdict.state,
    severity: normalizedVerdict.severity,
    blockingPoint: normalizedVerdict.blocking_point,
    owner: normalizedVerdict.owner ?? null,
    requiresOperatorAction: normalizedVerdict.requires_operator_action,
    primaryAction:
      normalizedVerdict.primary_action || defaultPrimaryAction(normalizedVerdict.state),
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
