import type { components } from '@/api/generated/openapi-types'

export type RuntimeHoldSummary = components['schemas']['RuntimeHoldSummary']
export type RuntimeHoldSource = components['schemas']['RuntimeHoldSource']
export type FailedCommandEvidence = components['schemas']['FailedCommandEvidence']
export type RuntimeHoldReleaseEligibility = components['schemas']['RuntimeHoldReleaseEligibility']
export type RuntimeHoldBlocker = components['schemas']['RuntimeHoldBlocker']
export type RuntimeHoldDetailResponse = components['schemas']['RuntimeHoldDetailResponse']
export type ResolveRuntimeHoldRequest = components['schemas']['ResolveRuntimeHoldRequest']
export type ResolveRuntimeHoldResponse = components['schemas']['ResolveRuntimeHoldResponse']
export type NgReasonOption = components['schemas']['NgReasonOption']
export type NgReturnItemResponse = components['schemas']['NgReturnItemResponse']
export type RuntimeRackOperationWait = components['schemas']['RuntimeRackOperationWait']
export type RuntimeResourceEvidenceItem = components['schemas']['RuntimeResourceEvidenceItem']
export type RuntimeResourceEvidenceKind = components['schemas']['RuntimeResourceEvidenceKind']
export type RuntimeResourceKind = components['schemas']['RuntimeResourceKind']
export type RuntimeSingleLayerRackSnapshot = components['schemas']['RuntimeSingleLayerRackSnapshot']
export type RuntimeStationLease = components['schemas']['RuntimeStationLease']
export type TraceResourceEvidenceResponse = components['schemas']['TraceResourceEvidenceResponse']
export type RuntimeWorklineReadiness = components['schemas']['RuntimeWorklineReadiness']
export type WorkLinePluginManifestSummary = components['schemas']['WorkLinePluginManifestSummary']
export type ResourceBoundary = components['schemas']['ResourceBoundary']

export interface RuntimeHoldConflictModel {
  code?: string
  message: string
  current_hold_version?: number
  current_status?: string
  release_eligibility?: RuntimeHoldReleaseEligibility
  refresh_url?: string
  material_identity_key?: string
  existing_ng_return_item_id?: number
  existing_runtime_hold_id?: number
  existing_status?: string
}

export interface RuntimeStatCard {
  key: string
  label: string
  value: number
  status: string
}

export interface RuntimeTraceListItem {
  session_id: number
  session_code: string
  trace_id?: string | null
  request_id?: string | null
  last_inbox_id?: number | null
  event_type?: string | null
  event_payload?: Record<string, unknown> | null
  business_key?: string | null
  barcode?: string | null
  workline_id: number
  workline_name?: string | null
  workline_code?: string | null
  device_id?: number | null
  device_name?: string | null
  device_code?: string | null
  command_code?: string | null
  current_device_id?: number | null
  current_device_name?: string | null
  current_device_code?: string | null
  current_action?: string | null
  current_action_source?: string | null
  last_device_id?: number | null
  last_device_name?: string | null
  last_device_code?: string | null
  status: string
  current_wait_type?: string | null
  failure_domain?: string | null
  failure_code?: string | null
  latest_timeline_action?: string | null
  latest_timeline_status?: string | null
  latest_timeline_message?: string | null
  started_at?: string | null
  last_ingress_at?: string | null
  deadline_at?: string | null
  is_timed_out: boolean
}

export interface RuntimeTraceListResponse {
  total: number
  items: RuntimeTraceListItem[]
}

export interface IntegrationDebugStageCheck {
  key: string
  label: string
  state: 'not_started' | 'ok' | 'waiting' | 'failed' | 'blocked' | 'unknown' | string
  evidence_count: number
  primary_evidence?: string | null
  links: string[]
}

export interface IntegrationDebugEvidenceLink {
  kind: string
  label: string
  api_path?: string | null
  route_name?: string | null
  route_params: Record<string, unknown>
  route_query: Record<string, unknown>
}

export interface IntegrationDebugNextAction {
  kind: string
  label: string
  description: string
  route_name?: string | null
  route_params: Record<string, unknown>
  route_query: Record<string, unknown>
}

export interface IntegrationDebugCaseResponse {
  case_id: string
  session_id?: number | null
  session_code?: string | null
  trace_id?: string | null
  request_id?: string | null
  command_code?: string | null
  status: string
  phase: string
  verdict: 'ok' | 'waiting' | 'blocked' | 'failed' | 'unknown' | string
  blocking_domain?: string | null
  blocking_code?: string | null
  owner: string
  severity: string
  recoverability: string
  summary: string
  facts: Record<string, unknown>
  stage_checks: IntegrationDebugStageCheck[]
  evidence_links: IntegrationDebugEvidenceLink[]
  next_actions: IntegrationDebugNextAction[]
  trace_detail?: TraceDetailResponse | null
}

export interface IntegrationDebugCaseListResponse {
  total: number
  items: IntegrationDebugCaseResponse[]
}

export interface IntegrationDebugLatestQuery {
  limit?: number
  workline_id?: number
  device_id?: number
  status?: string
}

export interface IntegrationDebugLookupQuery {
  anchor_type: string
  anchor: string
  include_raw?: boolean
}

export interface TraceQueryPayload {
  workline_id?: number
  device_id?: number
  status?: string
  keyword?: string
  only_active?: boolean
  only_failed?: boolean
  limit?: number
  offset?: number
}

export interface TraceOverviewSummary {
  callback_logs: number
  inboxes: number
  commands: number
  outboxes: number
  timelines: number
  diagnostics: number
  session_status?: string | null
  current_wait_type?: string | null
  latest_timeline_action?: string | null
  latest_timeline_status?: string | null
  latest_timeline_message?: string | null
}

export interface TraceContextResponse {
  request_id?: string | null
  trace_id?: string | null
  event_id?: string | null
  causation_id?: string | null
  workline_id?: number | null
  session_id?: number | null
  inbox_id?: number | null
  device_id?: number | null
  device_code?: string | null
  command_id?: number | null
  command_code?: string | null
  outbox_id?: number | null
  dispatch_key?: string | null
  canonical_event_type?: string | null
  transition?: string | null
  plugin_key?: string | null
  contract_version?: string | null
}

export interface TraceCallbackLogItem {
  id: number
  callback_type: string
  subject_code: string
  request_id?: string | null
  trace_id?: string | null
  event_id?: string | null
  causation_id?: string | null
  response_status: number
  response_time_ms: number
  error_message?: string | null
  ingress_outcome?: string | null
  failure_stage?: string | null
  request_body: Record<string, unknown>
  created_at: string
  updated_at?: string | null
}

export interface TraceInboxItem {
  id: number
  kind: string
  source_system: string
  source_message_id?: string | null
  trace_id?: string | null
  event_id?: string | null
  causation_id?: string | null
  workline_id?: number | null
  device_id?: number | null
  command_id?: number | null
  session_id?: number | null
  status: string
  received_at: string
  processed_at?: string | null
  attempt_count: number
  max_attempts: number
  next_retry_at?: string | null
  error_message?: string | null
  payload_json: Record<string, unknown>
}

export interface TraceSessionItem {
  id: number
  session_code: string
  workline_id: number
  plugin_key: string
  run_mode: string
  business_key?: string | null
  barcode?: string | null
  status: string
  trace_id?: string | null
  started_at?: string | null
  ended_at?: string | null
  current_wait_type?: string | null
  waiting_since?: string | null
  deadline_at?: string | null
  awaiting_command_id?: number | null
  required_operator_action?: string | null
  failure_domain?: string | null
  failure_code?: string | null
  failure_message?: string | null
  ingress_count: number
  last_request_id?: string | null
  last_ingress_at?: string | null
  last_inbox_id?: number | null
  context_json: Record<string, unknown>
}

export interface TraceCommandItem {
  id: number
  device_id: number
  command_code: string
  trace_id?: string | null
  workline_id?: number | null
  session_id?: string | number | null
  task_type: string
  status: string
  result?: string | null
  retry_count: number
  sent_at?: string | null
  ack_received_at?: string | null
  completed_at?: string | null
  ack_code?: number | null
  ack_message?: string | null
  ack_trace_id?: string | null
  params: Record<string, unknown>
  result_data?: Record<string, unknown> | null
  error_detail?: Record<string, unknown> | null
  duration_ms?: number | null
}

export interface TraceOutboxItem {
  id: number
  session_id?: number | null
  workline_id: number
  dispatch_type: string
  dispatch_key: string
  target_type: string
  target_code: string
  status: string
  attempt_count: number
  next_retry_at?: string | null
  last_error?: string | null
  blocked_by_runtime_hold_id?: number | null
  blocked_by_reconciliation_session_id?: number | null
  blocked_device_id?: number | null
  blocked_workline_id?: number | null
  blocked_reason?: string | null
  created_at: string
  sent_at?: string | null
  finished_at?: string | null
  payload_json: Record<string, unknown>
}

export interface TraceTimelineItem {
  id: number
  session_id: number
  workline_id: number
  trace_id?: string | null
  seq_no: number
  occurred_at: string
  stage: string
  action_type: string
  actor_type: string
  actor_code?: string | null
  from_status?: string | null
  to_status?: string | null
  status: string
  failure_domain?: string | null
  message?: string | null
  payload_json?: Record<string, unknown> | null
  related_inbox_id?: number | null
  related_command_id?: number | null
}

export interface TraceDiagnosticItem {
  request_id?: string | null
  trace_id?: string | null
  session_id?: number | null
  inbox_id?: number | null
  outbox_id?: number | null
  command_code?: string | null
  device_code?: string | null
  workline_id?: number | null
  workline_code?: string | null
  plugin_key?: string | null
  canonical_event_type?: string | null
  transition?: string | null
  extra: Record<string, unknown>
}

export interface TraceDispatchAttemptItem {
  id: number
  outbox_id: number
  dispatch_key: string
  attempt_no: number
  lease_token: string
  status: string
  target_type?: string | null
  target_code?: string | null
  started_at: string
  finalized_at?: string | null
  error_message?: string | null
  response_json?: Record<string, unknown>
  trace_json?: Record<string, unknown>
}

export interface DiagnosticCardResponse {
  title: string
  summary: string
  error_code: string
  error_domain: string
  severity: string
  recoverability: string
  problem_class: string
  user_message: string
  operator_action?: string | null
  technical_summary?: string | null
  next_steps: string[]
  context: TraceDiagnosticItem
}

export type DiagnosisVerdictState =
  | 'completed_clear'
  | 'running'
  | 'waiting'
  | 'blocked'
  | 'failed'
  | 'unknown'

export type DiagnosisVerdictSeverity = 'success' | 'info' | 'warning' | 'danger'

export type DiagnosisVerdictBlockingPoint =
  | 'none'
  | 'session'
  | 'inbox'
  | 'outbox'
  | 'command'
  | 'external_wms'
  | 'resource'
  | 'admission'
  | 'unknown'

export type DiagnosisEvidenceHealthLevel = 'complete' | 'partial' | 'missing'

export type DiagnosisEvidenceHealthItemKey =
  | 'session'
  | 'timeline'
  | 'callback'
  | 'inbox'
  | 'command'
  | 'outbox'
  | 'diagnostics'
  | 'workline_admission'
  | 'resource_wait'

export type DiagnosisEvidenceHealthItemState = 'present' | 'empty' | 'missing' | 'not_required'

export interface DiagnosisEvidenceHealthItem {
  key: DiagnosisEvidenceHealthItemKey
  label: string
  count: number
  state: DiagnosisEvidenceHealthItemState
  hint: string
}

export interface DiagnosisEvidenceHealth {
  level: DiagnosisEvidenceHealthLevel
  summary: string
  missing?: string[]
  items?: DiagnosisEvidenceHealthItem[]
}

export interface DiagnosisVerdict {
  state: DiagnosisVerdictState
  severity: DiagnosisVerdictSeverity
  title: string
  summary: string
  requires_operator_action: boolean
  primary_action?: string | null
  blocking_point: DiagnosisVerdictBlockingPoint
  owner?: string | null
  evidence_health: DiagnosisEvidenceHealth
}

export interface TraceBlockingPointResponse {
  trace_id: string
  request_id?: string | null
  blocking_point: string
  diagnosis_verdict: DiagnosisVerdict
  owner: string
  recoverability: string
  operator_action: string
  diagnostic_card: DiagnosticCardResponse
  evidence?: Record<string, unknown>
  next_steps?: string[]
}

export interface TraceDetailResponse {
  trace: TraceContextResponse
  summary: TraceOverviewSummary
  sessions: TraceSessionItem[]
  callback_logs: TraceCallbackLogItem[]
  inboxes: TraceInboxItem[]
  commands: TraceCommandItem[]
  outboxes: TraceOutboxItem[]
  dispatch_attempts: TraceDispatchAttemptItem[]
  timelines: TraceTimelineItem[]
  diagnostics: TraceDiagnosticItem[]
  resource_evidence?: TraceResourceEvidenceResponse
  diagnosis_verdict: DiagnosisVerdict
}

export interface RuntimeWorklineSummary {
  id: number
  line_code: string
  line_name: string
  line_type: string
  zone_name?: string | null
  plugin_key?: string | null
  contract_version?: string | null
  is_active: boolean
  device_count: number
  active_session_count: number
  waiting_session_count: number
  failed_session_count: number
  error_device_count: number
  offline_device_count: number
  maintenance_device_count: number
  run_mode: string
  runtime_status?: string | null
  active_safety_incident_id?: number | null
  start_admission_status?: string | null
  start_admission_message?: string | null
  start_admission_failed_device_code?: string | null
  start_admission_checked_at?: string | null
  last_start_request_id?: string | null
  last_start_trace_id?: string | null
  stopped_at?: string | null
  stopped_reason?: string | null
  resumed_at?: string | null
  last_activity_at?: string | null
}

export interface RuntimeSafetyIncidentSummary {
  id: number
  workline_id: number
  incident_code?: string | null
  status: string
  severity?: string | null
  stopped_at?: string | null
  stopped_reason?: string | null
  drain_status?: string | null
  remote_unknown_command_count?: number | null
  created_at?: string | null
  updated_at?: string | null
}

export interface RuntimeSafetyIncidentDetail extends RuntimeSafetyIncidentSummary {
  summary_counts?: Record<string, number>
  failed_checks?: string[]
  required_actions?: string[]
  timeline?: Array<Record<string, unknown>>
}

export interface RuntimeSimulateEstopRequest {
  reason?: string | null
  source_device_id?: number | null
  payload?: Record<string, unknown>
}

export interface RuntimeClearEstopRequest {
  checks: Record<string, boolean>
  reason?: string | null
}

export interface SandboxCleanupRequest {
  dry_run: boolean
  confirmation?: string | null
}

export type SandboxCleanupCounts = Record<string, number>

export interface SandboxCleanupResponse {
  workline_id: number
  dry_run: boolean
  deleted: boolean
  counts: SandboxCleanupCounts
  affected_session_ids: number[]
  message: string
}

export interface DebugDataCleanupRequest {
  dry_run: boolean
  confirmation?: string | null
}

export type DebugDataCleanupCounts = Record<string, number>

export interface DebugDataCleanupResponse {
  scope: 'WORKLINE' | 'ALL'
  workline_id?: number | null
  dry_run: boolean
  deleted: boolean
  counts: DebugDataCleanupCounts
  affected_workline_ids: number[]
  affected_session_ids: number[]
  message: string
}

export type RuntimeWorklineMonitorProjectionResponse = components['schemas']['RuntimeWorklineMonitorProjectionResponse']
export type RuntimeWorklineBoundary = components['schemas']['RuntimeWorklineBoundary']
export type RuntimeMonitorDeviceNode = components['schemas']['RuntimeMonitorDeviceNode']
export type RuntimeMonitorSessionSection = components['schemas']['RuntimeMonitorSessionSection']
export type RuntimeMonitorTraceSection = components['schemas']['RuntimeMonitorTraceSection']
export type RuntimeMonitorEvidenceSection = components['schemas']['RuntimeMonitorEvidenceSection']
export type RuntimeMonitorActionCandidates = components['schemas']['RuntimeMonitorActionCandidates']
export type RuntimeMonitorTraceItem = components['schemas']['RuntimeMonitorTraceItem']
export type RuntimeMonitorSessionItem = components['schemas']['RuntimeMonitorSessionItem']
export type RuntimeMonitorReconciliationCandidate = components['schemas']['RuntimeMonitorReconciliationCandidate']

export type RuntimeScenePluginManifestSummary = WorkLinePluginManifestSummary

export type RuntimeSceneNodeState = 'idle' | 'running' | 'waiting' | 'hold' | 'error'

export interface RuntimeSceneLane {
  id: string
  label: string
  role: string
  order: number
  kind: 'manifest' | 'fallback' | 'uncategorized'
}

export interface RuntimeSceneNodeBadge {
  kind: 'current-command' | 'open-command' | 'runtime-hold' | 'parked-outbox' | 'active-session'
  label: string
  tone: 'info' | 'primary' | 'warning' | 'danger'
  count?: number
}

export interface RuntimeSceneNode {
  id: string
  deviceId: number
  laneId: string
  role: string
  roleIndex: number
  deviceCode: string
  deviceName: string
  status: string
  state: RuntimeSceneNodeState
  isSelected: boolean
  isCurrent: boolean
  maintenanceMode: boolean
  errorCode?: string | null
  badges: RuntimeSceneNodeBadge[]
}

export interface RuntimeSceneFlow {
  id: string
  fromNodeId: string
  toNodeId: string
  source: 'upstream' | 'fallback-order'
}

export interface RuntimeSceneOverlay {
  id: string
  kind: 'active-session' | 'blocking-device'
  deviceId?: number | null
  label: string
  tone: 'info' | 'primary' | 'warning' | 'danger'
}

export interface RuntimeSceneGap {
  id: string
  role: string
  label: string
  requiredCount: number
  actualCount: number
}

export interface RuntimeSceneVerdict {
  status?: string | null
  label: string
  manifestLoaded: boolean
  manifestWarning?: string | null
}

export interface RuntimeSceneModel {
  workline: RuntimeWorklineSummary
  verdict: RuntimeSceneVerdict
  lanes: RuntimeSceneLane[]
  nodes: RuntimeSceneNode[]
  flows: RuntimeSceneFlow[]
  overlays: RuntimeSceneOverlay[]
  gaps: RuntimeSceneGap[]
}

export interface RuntimeDeviceSummary {
  id: number
  device_code: string
  device_name: string
  device_role: string
  role_index: number
  workline_id?: number | null
  workline_name?: string | null
  workline_code?: string | null
  device_status: string
  maintenance_mode: boolean
  current_command_id?: number | null
  open_command_count?: number
  pending_command_count: number
  blocked_outbox_count?: number
  open_issue_count?: number
  active_runtime_hold_ids?: number[]
  last_heartbeat_at?: string | null
  recent_callback_at?: string | null
  error_code?: string | null
}

export interface RuntimeDeviceDetailResponse {
  summary: RuntimeDeviceSummary
  recent_commands: TraceCommandItem[]
  recent_callbacks: TraceCallbackLogItem[]
  active_sessions: RuntimeTraceListItem[]
}

export interface RuntimeDeviceHealthSummary {
  total: number
  abnormal: number
  maintenance: number
  loaded: number
  healthy: number
}

export interface RuntimeOverviewResponse {
  stats: RuntimeStatCard[]
  recent_active_traces: RuntimeTraceListItem[]
  recent_failed_traces: RuntimeTraceListItem[]
  hot_worklines: RuntimeWorklineSummary[]
  abnormal_devices: RuntimeDeviceSummary[]
  device_health: RuntimeDeviceHealthSummary
}

export interface SandboxPendingOutbox {
  id: number
  session_id?: number | null
  workline_id?: number | null
  dispatch_key?: string | null
  dispatch_type?: string | null
  target_type?: string | null
  target_code?: string | null
  status?: string | null
  payload_json?: Record<string, unknown> | null
  source_device?: string | null
  last_error?: string | null
  command_status?: string | null
  is_current_action?: boolean | null
  is_actionable?: boolean | null
  runtime_hold_id?: number | null
  failure_summary?: {
    code?: string | null
    message?: string | null
    runtime_hold_id?: number | null
  } | null
  history_group_key?: string | null
}

export interface SandboxCompletedSession {
  history_group_key?: string | null
  session: {
    id: number
    session_code: string
    status: string
    barcode: string | null
    created_at: string | null
    started_at: string | null
    ended_at: string | null
    event_type?: string | null
    event_payload?: Record<string, unknown> | null
    failure_domain?: string | null
    failure_code?: string | null
    failure_message?: string | null
  }
  outbox_items: SandboxPendingOutbox[]
}

export interface WorklineOperationRecord {
  id: number
  kind?: string | null
  source_message_id?: string | null
  trace_id?: string | null
  session_id?: number | null
  workline_id?: number | null
  status?: string | null
}

export interface ReplayInboxPayload {
  reason: string
  operator_id?: string | null
}

export type ManualOperationType = 'HOLD' | 'RESUME' | 'CANCEL'

export type WorklineMode = 'live' | 'trace' | 'sandbox'

export interface ManualSessionOperationPayload {
  operation: ManualOperationType
  operator_id: string
  reason: string
}

export interface RuntimeTraceDeviceAction {
  kind: string
  label: string
  status?: string | null
  timestamp?: string | null
  message?: string | null
}

export interface RuntimeTraceDevicePathNode {
  device_id: number
  device_code?: string | null
  device_name?: string | null
  device_role?: string | null
  is_current: boolean
  actions?: RuntimeTraceDeviceAction[]
}

export interface RuntimeTraceTimelineGroup {
  group_key: string
  group_type: string
  display_name: string
  device_id?: number | null
  device_code?: string | null
  is_current: boolean
  is_blocked: boolean
  events?: TraceTimelineItem[]
}

export interface RuntimeBlockingReason {
  device_id?: number | null
  reason: string
  detail?: string | null
}

export interface RuntimeActiveBinRackCellView {
  bin_cell_index?: number | string | null
  bin_cell_code?: string | null
  bin_cell_location?: string | null
  status?: string | null
  capacity_depth_mm?: number | null
  used_depth_mm?: number | null
  material_identity_key?: string | null
  pkg_code?: string | null
  is_reserved?: boolean | null
}

export interface RuntimeActiveBinRackBinView {
  rack_slot_code?: string | null
  rack_slot_location_code?: string | null
  bin_id?: number | string | null
  bin_code?: string | null
  bin_type?: string | null
  bin_orientation_code?: string | null
  cells?: RuntimeActiveBinRackCellView[]
}

export interface RuntimeActiveBinRackView {
  rack_id?: number | string | null
  rack_code?: string | null
  rack_kind?: string | null
  rack_type?: string | null
  bins?: RuntimeActiveBinRackBinView[]
}

export interface RuntimeTraceResourceView {
  active_bin_racks?: RuntimeActiveBinRackView[]
}

export interface RuntimeTracePathResponse {
  workline_id?: number | null
  session_id?: number | null
  trace_id?: string | null
  diagnosis_verdict: DiagnosisVerdict
  sessions?: TraceSessionItem[]
  resource_view?: RuntimeTraceResourceView
  devices?: RuntimeTraceDevicePathNode[]
  timeline_groups?: RuntimeTraceTimelineGroup[]
  current_blocking_device_id?: number | null
  blocking_reason?: RuntimeBlockingReason | null
}

export interface SandboxEventRequest {
  workline_id: number
  device_id: number
  event_type: string
  trace_id?: string | null
  session_id?: number | null
  payload?: Record<string, unknown>
  timestamp?: string | null
}

export interface SandboxResultRequest {
  command_code: string
  device_code: string
  result: 'SUCCESS' | 'FAILED'
  payload?: Record<string, unknown>
  error_detail?: string | null
  timestamp?: string | null
}

export interface SandboxAckRequest {
  dispatch_key: string
}

export interface SandboxExternalCallbackRequest {
  dispatch_key: string
  callback_type?: string | null
  payload?: Record<string, unknown>
  source_system?: 'WMS' | 'RCS'
  source_event_id?: string | null
  source_version?: string
  request_id?: string | null
  occurred_at?: string | null
  timestamp?: string | null
  signature?: string
}

export interface SandboxEventTemplate {
  event_type: string
  label: string
  payload_template: Record<string, unknown>
}

export interface SandboxResultTemplate {
  command_type: string
  label: string
  success_payload_template: Record<string, unknown>
  failed_payload_template: Record<string, unknown>
  error_template?: string | null
}

export interface SandboxTemplatesResponse {
  event_templates: SandboxEventTemplate[]
  result_templates: SandboxResultTemplate[]
}
