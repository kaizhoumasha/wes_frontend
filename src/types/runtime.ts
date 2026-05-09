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
  plugin_state?: string | null
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

export interface TraceQueryPayload {
  workline_id?: number
  device_id?: number
  status?: string
  plugin_state?: string
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
  plugin_state?: string | null
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
  device_id: string
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
  plugin_state?: string | null
  trace_id?: string | null
  started_at?: string | null
  ended_at?: string | null
  current_wait_type?: string | null
  current_wait_token?: string | null
  waiting_since?: string | null
  deadline_at?: string | null
  awaiting_command_id?: number | null
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
  issued_plugin_state?: string | null
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

export interface TraceBlockingPointResponse {
  trace_id: string
  request_id?: string | null
  blocking_point: string
  owner: string
  recoverability: string
  operator_action: string
  diagnostic_card: DiagnosticCardResponse
  evidence: Record<string, unknown>
  next_steps: string[]
}

export interface TraceDetailResponse {
  trace: TraceContextResponse
  summary: TraceOverviewSummary
  session?: TraceSessionItem | null
  sessions: TraceSessionItem[]
  callback_logs: TraceCallbackLogItem[]
  inboxes: TraceInboxItem[]
  commands: TraceCommandItem[]
  outboxes: TraceOutboxItem[]
  dispatch_attempts: TraceDispatchAttemptItem[]
  timelines: TraceTimelineItem[]
  diagnostics: TraceDiagnosticItem[]
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

export interface RuntimeWorklineDeviceItem {
  id: number
  device_code: string
  device_name: string
  device_role: string
  role_index: number
  upstream_device_id?: number | null
  device_status: string
  maintenance_mode: boolean
  current_command_id?: number | null
  open_command_count?: number
  pending_command_count: number
  blocked_outbox_count?: number
  open_issue_count?: number
  active_runtime_hold_ids?: number[]
  last_heartbeat_at?: string | null
  error_code?: string | null
}

export interface RuntimeWorklineDetailResponse {
  summary: RuntimeWorklineSummary
  devices: RuntimeWorklineDeviceItem[]
  active_sessions: RuntimeTraceListItem[]
  recent_failed_traces: RuntimeTraceListItem[]
  recent_completed_traces: RuntimeTraceListItem[]
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
    plugin_state: string | null
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
  actions: RuntimeTraceDeviceAction[]
}

export interface RuntimeTraceTimelineGroup {
  group_key: string
  group_type: string
  display_name: string
  device_id?: number | null
  device_code?: string | null
  is_current: boolean
  is_blocked: boolean
  events: TraceTimelineItem[]
}

export interface RuntimeBlockingReason {
  device_id?: number | null
  reason: string
  detail?: string | null
}

export interface RuntimeTracePathResponse {
  workline_id?: number | null
  session_id?: number | null
  trace_id?: string | null
  devices: RuntimeTraceDevicePathNode[]
  timeline_groups: RuntimeTraceTimelineGroup[]
  current_blocking_device_id?: number | null
  blocking_reason?: RuntimeBlockingReason | null
  evidence?: TraceDetailResponse | null
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
