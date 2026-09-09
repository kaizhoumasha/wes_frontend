import { get, post, resolveApiBaseUrl } from '@/api/client'
import { getAccessToken } from '@/api/services/token-refresh'

export type IntegrationProfile =
  | 'CONTRACT_SIMULATION'
  | 'DEVICE_INTEGRATION'
  | 'FULL_SITE_INTEGRATION'

export type IntegrationPhase =
  | 'BIND_TASK'
  | 'TASK_PREPARE'
  | 'PLAN_RECEIPT'
  | 'RACK_TRANSPORT'
  | 'RACK_ARRIVAL'
  | 'BIN_INBOUND_BATCH'
  | 'BIN_TRANSPORT'
  | 'POINT1_ARRIVAL'
  | 'POINT2_SCAN'
  | 'WORK_ADMISSION'
  | 'WORK_COMPLETION'
  | 'COMPLETION_REPORT'
  | 'POINT2_RELEASE'
  | 'POINT3_ROUTE'
  | 'RETURN_BUFFER'
  | 'BIN_RETURN_BATCH'
  | 'BIN_RETURN_TRANSPORT'
  | 'RACK_DEPARTURE'
  | 'TASK_COMPLETION'
  | 'CLEANUP'

export type IntegrationRunStatus =
  | 'CREATED'
  | 'WAITING_TASK'
  | 'ACTIVE'
  | 'WAITING_EXTERNAL'
  | 'COMPLETED'
  | 'NEEDS_ATTENTION'
  | 'CLOSED_BY_OPERATOR'

export interface IntegrationRunStep {
  ordinal: number
  phase: IntegrationPhase
  status: 'PENDING' | 'WAITING' | 'SUCCEEDED' | 'NEEDS_ATTENTION'
  client_request_id: string | null
  operation: string | null
  operation_id: string | null
  wms_confirmation_id: number | null
  transport_task_id: string | null
  device_command_code: string | null
  request: Record<string, unknown>
  result: Record<string, unknown>
  reason_code: string | null
  created_at: string
}

export interface IntegrationRun {
  run_id: string
  workline_id: number
  workline_code: string
  scenario_key: 'manual_outbound_picking@v1'
  expected_plugin_key: 'manual_bin_processing'
  profile: IntegrationProfile
  environment_label: string
  operator_user_id: number
  status: IntegrationRunStatus
  current_phase: IntegrationPhase
  version: number
  task_id: string | null
  issued_operation_id: string | null
  bin_code: string | null
  device_code: string | null
  rack_id: string | null
  plan_resources: {
    plan_revision: number
    target_rack: { rack_id: string; rack_face: string }
    direct_picks: Array<Record<string, string | number>>
    bin_source_racks: Array<{ rack_id: string; rack_face: string; plan_revision: number }>
  } | null
  site_configuration: {
    outbound_rcs_template: 'CTU01'
    return_rcs_template: 'CTU03'
    bin_rack_positions: string[]
    outbound_transfer_position: string
    return_zone_code: string
    infeed_position: string
    outfeed_position: string
    ecs_endpoint_base_url: string
    scan_device_codes: string[]
  }
  operation_context: Record<string, unknown>
  attention_code: string | null
  attention_detail: string | null
  wms_cleanup_confirmed: boolean
  site_cleanup_confirmed: boolean
  created_at: string
  updated_at: string
  steps: IntegrationRunStep[]
}

export interface CreateIntegrationRunInput {
  workline_code: string
  profile: IntegrationProfile
  environment_label: string
  device_code: string
  rack_id?: string
}

export interface VersionInput {
  expected_version: number
}

export interface TransportActionInput extends VersionInput {
  client_request_id: string
  kind: 'MOVE_RACK' | 'ROTATE_RACK' | 'MOVE_BINS'
  rack_id: string
  source: Record<string, string>
  target?: Record<string, string>
  rcs_template_id: 'CTU01' | 'CTU02' | 'CTU03' | 'F01'
  target_face?: string
  bin_code?: string
}

export interface DeviceActionInput extends VersionInput {
  client_request_id: string
  device_code: string
  task_type: string
  params: Record<string, unknown>
  timeout_ms: number
  reason: string
}

const ROOT = '/api/v1/workline-integration-debug/runs'
const path = (runId: string, suffix = '') => `${ROOT}/${encodeURIComponent(runId)}${suffix}`
const sendPost = <T>(url: string, body: object) =>
  post<T>(url, body as Record<string, unknown>).send()

export const worklineIntegrationDebugApi = {
  list: (limit = 20) => get<IntegrationRun[]>(`${ROOT}?limit=${limit}`).send(),
  get: (runId: string) => get<IntegrationRun>(path(runId)).send(),
  create: (body: CreateIntegrationRunInput) => sendPost<IntegrationRun>(ROOT, body),
  bindTask: (runId: string, body: VersionInput & { task_id: string }) =>
    sendPost<IntegrationRun>(path(runId, '/bind-task'), body),
  prepareTask: (runId: string, body: VersionInput & { client_request_id: string }) =>
    sendPost<IntegrationRun>(path(runId, '/wms/prepare'), body),
  refreshPlan: (runId: string, body: VersionInput) =>
    sendPost<IntegrationRun>(path(runId, '/plan/refresh'), body),
  point2Scan: (runId: string, body: VersionInput & { bin_code: string; scanned_at: number }) =>
    sendPost<IntegrationRun>(path(runId, '/point2-scan'), body),
  workAdmission: (runId: string, body: VersionInput & { client_request_id: string }) =>
    sendPost<IntegrationRun>(path(runId, '/wms/work-admission'), body),
  refreshWms: (runId: string, body: VersionInput & { client_request_id: string }) =>
    sendPost<IntegrationRun>(path(runId, '/wms/refresh'), body),
  binInboundBatch: (
    runId: string,
    body: VersionInput & {
      client_request_id: string
      rack_id: string
      rack_face: string
      max_bin_count: number
    }
  ) => sendPost<IntegrationRun>(path(runId, '/wms/bin-inbound-batch'), body),
  binReturnBatch: (
    runId: string,
    body: VersionInput & {
      client_request_id: string
      rack_id: string
      rack_face: string
      source_location_code: string
    }
  ) => sendPost<IntegrationRun>(path(runId, '/wms/bin-return-batch'), body),
  rackDeparture: (
    runId: string,
    body: VersionInput & {
      client_request_id: string
      rack_id: string
      current_location_code: string
      current_face: string
    }
  ) => sendPost<IntegrationRun>(path(runId, '/wms/rack-departure'), body),
  taskCompletion: (runId: string, body: VersionInput & { client_request_id: string }) =>
    sendPost<IntegrationRun>(path(runId, '/wms/task-completion'), body),
  bindCompletion: (runId: string, body: VersionInput & { operation_id: string }) =>
    sendPost<IntegrationRun>(path(runId, '/wms/bind-completion'), body),
  completionApplyReport: (
    runId: string,
    body: VersionInput & {
      client_request_id: string
      completion_operation_id: string
      apply_revision: number
      apply_result: 'APPLIED' | 'RECONCILING'
      reason_code?: string
      occurred_at: number
    }
  ) => sendPost<IntegrationRun>(path(runId, '/wms/completion-apply-report'), body),
  transport: (runId: string, body: TransportActionInput) =>
    sendPost<IntegrationRun>(path(runId, '/transport'), body),
  refreshTransport: (runId: string, body: VersionInput & { client_request_id: string }) =>
    sendPost<IntegrationRun>(path(runId, '/transport/refresh'), body),
  deviceCommand: (runId: string, body: DeviceActionInput) =>
    sendPost<IntegrationRun>(path(runId, '/device-command'), body),
  confirmPhase: (runId: string, body: VersionInput & { note: string }) =>
    sendPost<IntegrationRun>(path(runId, '/confirm-phase'), body),
  complete: (runId: string, body: VersionInput) =>
    sendPost<IntegrationRun>(path(runId, '/complete'), body),
  takeover: (runId: string, body: VersionInput) =>
    sendPost<IntegrationRun>(path(runId, '/takeover'), body),
  close: (
    runId: string,
    body: VersionInput & { wms_cleanup_confirmed: boolean; site_cleanup_confirmed: boolean }
  ) => sendPost<IntegrationRun>(path(runId, '/close'), body),
  exportEvidence: async (runId: string) => {
    const response = await fetch(new URL(path(runId, '/export'), resolveApiBaseUrl()), {
      credentials: 'include',
      headers: { ...(getAccessToken() ? { Authorization: `Bearer ${getAccessToken()}` } : {}) }
    })
    if (!response.ok) throw new Error(`导出失败（HTTP ${response.status}）`)
    return response.blob()
  }
}
