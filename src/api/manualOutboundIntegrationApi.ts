import { apiClient, resolveApiBaseUrl } from '@/api/client'
import {
  worklineIntegrationDebugApiMethods,
  type WmsBinInboundBatchInput,
  type WmsBinReturnBatchInput,
  type WmsCompletionApplyReportInput,
  type WmsPrepareInput,
  type WmsRackDepartureInput,
  type WmsRetryInput,
  type WmsTaskCompletionInput,
  type WmsWorkAdmissionInput
} from '@/api/modules/worklineIntegrationDebug'
import { getAccessToken, refreshAccessToken } from '@/api/services/token-refresh'

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
  | 'POINT2_RELEASE'
  | 'COMPLETION_REPORT'
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
  source:
    | { kind: 'RACK'; location_code: string }
    | { kind: 'RACK_POSITION'; location_code: string }
    | { kind: 'RACK_BIN_SLOT'; rack_id: string; rack_face: string; slot_id: string }
    | { kind: 'HANDOFF_POSITION'; location_code: string }
  target?:
    | { kind: 'RACK_POSITION'; location_code: string }
    | { kind: 'ZONE'; location_code: string }
    | { kind: 'RACK_BIN_SLOT'; rack_id: string; rack_face: string; slot_id: string }
    | { kind: 'HANDOFF_POSITION'; location_code: string }
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
const runParams = (runId: string) => ({ run_id: runId })
const asRun = (request: Promise<unknown>) => request as Promise<IntegrationRun>
const asRuns = (request: Promise<unknown>) => request as Promise<IntegrationRun[]>

export const worklineIntegrationDebugApi = {
  list: (limit = 20) => asRuns(worklineIntegrationDebugApiMethods.runs({ limit }).send()),
  get: (runId: string) =>
    asRun(worklineIntegrationDebugApiMethods.getByRunId(runParams(runId)).send()),
  create: (body: CreateIntegrationRunInput) =>
    asRun(worklineIntegrationDebugApiMethods.createRuns(body).send()),
  bindTask: (runId: string, body: VersionInput & { task_id: string }) =>
    asRun(worklineIntegrationDebugApiMethods.bindTask(runParams(runId), body).send()),
  prepareTask: (runId: string, body: WmsPrepareInput) =>
    asRun(worklineIntegrationDebugApiMethods.wmsPrepare(runParams(runId), body).send()),
  refreshPlan: (runId: string, body: VersionInput) =>
    asRun(worklineIntegrationDebugApiMethods.planRefresh(runParams(runId), body).send()),
  point2Scan: (runId: string, body: VersionInput & { bin_code: string; scanned_at: number }) =>
    asRun(worklineIntegrationDebugApiMethods.point2Scan(runParams(runId), body).send()),
  workAdmission: (runId: string, body: WmsWorkAdmissionInput) =>
    asRun(worklineIntegrationDebugApiMethods.wmsWorkAdmission(runParams(runId), body).send()),
  refreshWms: (runId: string, body: VersionInput & { client_request_id: string }) =>
    asRun(worklineIntegrationDebugApiMethods.wmsRefresh(runParams(runId), body).send()),
  retryWms: (
    runId: string,
    body: WmsRetryInput
  ) => asRun(worklineIntegrationDebugApiMethods.wmsRetry(runParams(runId), body).send()),
  binInboundBatch: (
    runId: string,
    body: WmsBinInboundBatchInput
  ) => asRun(worklineIntegrationDebugApiMethods.wmsBinInboundBatch(runParams(runId), body).send()),
  binReturnBatch: (
    runId: string,
    body: WmsBinReturnBatchInput
  ) => asRun(worklineIntegrationDebugApiMethods.wmsBinReturnBatch(runParams(runId), body).send()),
  rackDeparture: (
    runId: string,
    body: WmsRackDepartureInput
  ) => asRun(worklineIntegrationDebugApiMethods.wmsRackDeparture(runParams(runId), body).send()),
  taskCompletion: (runId: string, body: WmsTaskCompletionInput) =>
    asRun(worklineIntegrationDebugApiMethods.wmsTaskCompletion(runParams(runId), body).send()),
  bindCompletion: (runId: string, body: VersionInput & { operation_id: string }) =>
    asRun(worklineIntegrationDebugApiMethods.wmsBindCompletion(runParams(runId), body).send()),
  completionApplyReport: (
    runId: string,
    body: WmsCompletionApplyReportInput
  ) =>
    asRun(
      worklineIntegrationDebugApiMethods.wmsCompletionApplyReport(runParams(runId), body).send()
    ),
  transport: (runId: string, body: TransportActionInput) =>
    asRun(worklineIntegrationDebugApiMethods.transport(runParams(runId), body).send()),
  refreshTransport: (runId: string, body: VersionInput & { client_request_id: string }) =>
    asRun(worklineIntegrationDebugApiMethods.transportRefresh(runParams(runId), body).send()),
  deviceCommand: (runId: string, body: DeviceActionInput) =>
    asRun(worklineIntegrationDebugApiMethods.deviceCommand(runParams(runId), body).send()),
  refreshDevice: (runId: string, body: VersionInput & { client_request_id: string }) =>
    asRun(worklineIntegrationDebugApiMethods.deviceCommandRefresh(runParams(runId), body).send()),
  confirmPhase: (runId: string, body: VersionInput & { note: string }) =>
    asRun(worklineIntegrationDebugApiMethods.confirmPhase(runParams(runId), body).send()),
  complete: (runId: string, body: VersionInput) =>
    asRun(worklineIntegrationDebugApiMethods.complete(runParams(runId), body).send()),
  takeover: (runId: string, body: VersionInput) =>
    asRun(worklineIntegrationDebugApiMethods.takeover(runParams(runId), body).send()),
  close: (
    runId: string,
    body: VersionInput & { wms_cleanup_confirmed: boolean; site_cleanup_confirmed: boolean }
  ) => asRun(worklineIntegrationDebugApiMethods.close(runParams(runId), body).send()),
  exportEvidence: async (runId: string) => {
    const apiBaseUrl = new URL(resolveApiBaseUrl(), window.location.origin)
    const url = new URL(path(runId, '/export'), apiBaseUrl)
    const request = (token: string | null) =>
      fetch(url, {
        credentials: 'include',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      })
    const requestToken = getAccessToken()
    let response = await request(requestToken)
    if (response.status === 401) {
      const currentToken = getAccessToken()
      const retryToken =
        currentToken && currentToken !== requestToken
          ? currentToken
          : await refreshAccessToken(apiClient)
      response = await request(retryToken)
    }
    if (!response.ok) throw new Error(`导出失败（HTTP ${response.status}）`)
    return response.blob()
  }
}
