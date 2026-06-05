import {
  worklineApiMethods,
  runtimeHoldApiMethods,
  type ReconciliationsSessionsResolveInput,
  type ReconciliationsSessionsResolveResult,
  type RuntimeHoldNgReasonsQuery,
  type NgReturnItemsQuery,
  type ResolveInput,
  type SandboxWorklinesStartInput
} from '@/api/modules/workline'
import { apiClient } from '@/api/client'
import type { components } from '@/api/generated/openapi-types'
import type {
  RuntimeClearEstopRequest,
  RuntimeDeviceDetailResponse,
  RuntimeDeviceSummary,
  RuntimeOverviewResponse,
  RuntimeTraceListResponse,
  RuntimeTracePathResponse,
  RuntimeSafetyIncidentSummary,
  RuntimeSimulateEstopRequest,
  DebugDataCleanupRequest,
  DebugDataCleanupResponse,
  IntegrationDebugCaseListResponse,
  IntegrationDebugCaseResponse,
  IntegrationDebugLatestQuery,
  IntegrationDebugLookupQuery,
  SandboxCleanupRequest,
  SandboxCleanupResponse,
  RuntimeHoldDetailResponse,
  RuntimeHoldSummary,
  RuntimeScenePluginManifestSummary,
  ResolveRuntimeHoldResponse,
  NgReasonOption,
  NgReturnItemResponse,
  RuntimeWorklineDetailResponse,
  RuntimeWorklineSummary,
  ManualSessionOperationPayload,
  ReplayInboxPayload,
  SandboxAckRequest,
  SandboxCompletedSession,
  SandboxEventRequest,
  SandboxExternalCallbackRequest,
  SandboxPendingOutbox,
  SandboxResultRequest,
  SandboxTemplatesResponse,
  TraceBlockingPointResponse,
  TraceDetailResponse,
  TraceQueryPayload,
  WorklineOperationRecord
} from '@/types/runtime'

interface RuntimeApiMethod<T> {
  send: () => Promise<T>
}

export interface RuntimeHoldListQuery {
  workline_id?: number
  session_id?: number
  status?: string
  active_only?: boolean
  limit?: number
}

export interface WorklineStartRequestedPayload {
  deviceCode: string
  traceId?: string
}

type CallbackEventAcceptedData = components['schemas']['CallbackEventAcceptedResponse']
type CallbackEventRejectedData = components['schemas']['CallbackRejectedResponse']
type WorklineStartRequestedResult = CallbackEventAcceptedData | CallbackEventRejectedData | null

function adaptRuntimeMethod<T>(method: { send: () => Promise<unknown> }): RuntimeApiMethod<T> {
  return {
    send: () => method.send() as Promise<T>
  }
}

function runtimeHoldListUrl(query?: RuntimeHoldListQuery): string {
  const params = new URLSearchParams()
  if (query?.workline_id !== undefined) params.set('workline_id', String(query.workline_id))
  if (query?.session_id !== undefined) params.set('session_id', String(query.session_id))
  if (query?.status !== undefined) params.set('status', query.status)
  if (query?.active_only !== undefined) params.set('active_only', String(query.active_only))
  if (query?.limit !== undefined) params.set('limit', String(query.limit))

  const queryString = params.toString()
  return queryString
    ? `/api/v1/workline/runtime-holds?${queryString}`
    : '/api/v1/workline/runtime-holds'
}

export const runtimeApiMethods = {
  overview(query?: { includeSim?: boolean }) {
    return adaptRuntimeMethod<RuntimeOverviewResponse>(worklineApiMethods.overview(query))
  },

  worklines(query?: { excludeSimulation?: boolean }) {
    return adaptRuntimeMethod<RuntimeWorklineSummary[]>(worklineApiMethods.worklines(query))
  },

  worklineDetail(worklineId: number) {
    return adaptRuntimeMethod<RuntimeWorklineDetailResponse>(
      worklineApiMethods.getWorklines({ workline_id: worklineId })
    )
  },

  worklinePluginManifest(pluginKey: string) {
    return adaptRuntimeMethod<RuntimeScenePluginManifestSummary>(
      apiClient.Get(`/api/v1/workline/plugins/${encodeURIComponent(pluginKey)}/manifest`)
    )
  },

  devices(worklineId: number) {
    return adaptRuntimeMethod<RuntimeDeviceSummary[]>(worklineApiMethods.devices({ worklineId }))
  },

  deviceDetail(deviceId: number, worklineId: number) {
    return adaptRuntimeMethod<RuntimeDeviceDetailResponse>(
      worklineApiMethods.getDevices({ device_id: deviceId }, { worklineId })
    )
  },

  queryTraces(payload: TraceQueryPayload) {
    return adaptRuntimeMethod<RuntimeTraceListResponse>(
      worklineApiMethods.query({
        limit: payload.limit ?? 20,
        offset: payload.offset ?? 0,
        only_active: payload.only_active ?? false,
        only_failed: payload.only_failed ?? false,
        device_id: payload.device_id,
        keyword: payload.keyword,
        status: payload.status,
        workline_id: payload.workline_id
      })
    )
  },

  traceByRequestId(requestId: string) {
    return adaptRuntimeMethod<TraceDetailResponse>(
      worklineApiMethods.request({ request_id: requestId })
    )
  },

  traceByTraceId(traceId: string) {
    return adaptRuntimeMethod<TraceDetailResponse>(worklineApiMethods.trace({ trace_id: traceId }))
  },

  traceBlockingPoint(traceId: string) {
    return adaptRuntimeMethod<TraceBlockingPointResponse>(
      worklineApiMethods.blockingPoint({ trace_id: traceId })
    )
  },

  traceBySessionId(sessionId: number) {
    return adaptRuntimeMethod<TraceDetailResponse>(
      worklineApiMethods.session({ session_id: sessionId })
    )
  },

  traceByCommandCode(commandCode: string) {
    return adaptRuntimeMethod<TraceDetailResponse>(
      worklineApiMethods.command({ command_code: commandCode })
    )
  },

  traceByDispatchKey(dispatchKey: string) {
    return adaptRuntimeMethod<TraceDetailResponse>(
      worklineApiMethods.dispatch({ dispatch_key: dispatchKey })
    )
  },

  integrationDebugLatest(query?: IntegrationDebugLatestQuery) {
    return adaptRuntimeMethod<IntegrationDebugCaseListResponse>(
      worklineApiMethods.casesLatest(query)
    )
  },

  integrationDebugLookup(query: IntegrationDebugLookupQuery) {
    return adaptRuntimeMethod<IntegrationDebugCaseResponse>(worklineApiMethods.casesLookup(query))
  },

  sandboxPending(limit = 50, worklineId?: number, deviceId?: number) {
    return adaptRuntimeMethod<SandboxPendingOutbox[]>(
      worklineApiMethods.sandboxPending({ limit, workline_id: worklineId, device_id: deviceId })
    )
  },

  sandboxCompleted(limit = 50, worklineId?: number, deviceId?: number) {
    return adaptRuntimeMethod<SandboxCompletedSession[]>(
      worklineApiMethods.sandboxCompleted({ limit, workline_id: worklineId, device_id: deviceId })
    )
  },

  sandboxEvent(payload: SandboxEventRequest) {
    return adaptRuntimeMethod<WorklineOperationRecord>(
      worklineApiMethods.sandboxEvents({
        workline_id: payload.workline_id,
        device_id: payload.device_id,
        event_type: payload.event_type,
        trace_id: payload.trace_id,
        session_id: payload.session_id,
        payload: payload.payload,
        timestamp: payload.timestamp
      })
    )
  },

  sandboxResult(payload: SandboxResultRequest) {
    return adaptRuntimeMethod<WorklineOperationRecord>(
      worklineApiMethods.results({
        command_code: payload.command_code,
        device_code: payload.device_code,
        result: payload.result,
        payload: payload.payload,
        error_detail: payload.error_detail,
        timestamp: payload.timestamp
      })
    )
  },

  sandboxAck(payload: SandboxAckRequest) {
    return adaptRuntimeMethod<SandboxPendingOutbox>(
      worklineApiMethods.sandboxAck({
        dispatch_key: payload.dispatch_key
      })
    )
  },

  sandboxExternalCallback(payload: SandboxExternalCallbackRequest) {
    return adaptRuntimeMethod<WorklineOperationRecord>(
      worklineApiMethods.sandboxExternalCallbacks({
        dispatch_key: payload.dispatch_key,
        callback_type: payload.callback_type,
        payload: payload.payload ?? {},
        source_system: payload.source_system ?? 'WMS',
        source_event_id: payload.source_event_id,
        source_version: payload.source_version ?? '1',
        request_id: payload.request_id,
        occurred_at: payload.occurred_at,
        timestamp: payload.timestamp,
        signature: payload.signature ?? 'sandbox'
      })
    )
  },

  sandboxSimulateEstop(worklineId: number, payload: RuntimeSimulateEstopRequest) {
    return adaptRuntimeMethod<RuntimeSafetyIncidentSummary>(
      apiClient.Post(
        `/api/v1/workline/operations/sandbox/worklines/${worklineId}/simulate-estop`,
        payload
      )
    )
  },

  worklineStartRequested(worklineId: number, payload: WorklineStartRequestedPayload) {
    const traceId = payload.traceId ?? `sandbox:start:${worklineId}:${Date.now().toString(36)}`
    const body: SandboxWorklinesStartInput = {
      device_code: payload.deviceCode,
      trace_id: traceId
    }
    return adaptRuntimeMethod<WorklineStartRequestedResult>(
      worklineApiMethods.sandboxWorklinesStart({ workline_id: worklineId }, body)
    )
  },

  clearEstop(worklineId: number, payload: RuntimeClearEstopRequest) {
    return adaptRuntimeMethod<RuntimeSafetyIncidentSummary>(
      apiClient.Post(
        `/api/v1/workline/operations/safety/worklines/${worklineId}/clear-estop`,
        payload
      )
    )
  },

  sandboxCleanup(worklineId: number, payload: SandboxCleanupRequest) {
    return adaptRuntimeMethod<SandboxCleanupResponse>(
      apiClient.Post(`/api/v1/workline/operations/sandbox/worklines/${worklineId}/cleanup`, payload)
    )
  },

  debugDataCleanupWorkline(worklineId: number, payload: DebugDataCleanupRequest) {
    return adaptRuntimeMethod<DebugDataCleanupResponse>(
      apiClient.Post(
        `/api/v1/workline/operations/debug-data/worklines/${worklineId}/cleanup`,
        payload
      )
    )
  },

  debugDataCleanupAll(payload: DebugDataCleanupRequest) {
    return adaptRuntimeMethod<DebugDataCleanupResponse>(
      apiClient.Post('/api/v1/workline/operations/debug-data/cleanup-all', payload)
    )
  },

  sandboxTemplates(worklineId: number, deviceId?: number) {
    return adaptRuntimeMethod<SandboxTemplatesResponse>(
      worklineApiMethods.sandboxTemplates({ workline_id: worklineId, device_id: deviceId })
    )
  },

  replayInbox(inboxId: number, payload: ReplayInboxPayload) {
    return adaptRuntimeMethod<WorklineOperationRecord>(
      worklineApiMethods.replayInboxes({ inbox_id: inboxId }, payload)
    )
  },

  resolveRuntimeReconciliation(sessionId: number, payload: ReconciliationsSessionsResolveInput) {
    return adaptRuntimeMethod<ReconciliationsSessionsResolveResult>(
      worklineApiMethods.reconciliationsSessionsResolve({ session_id: sessionId }, payload)
    )
  },

  manualSessionOperation(sessionId: number, payload: ManualSessionOperationPayload) {
    return adaptRuntimeMethod<WorklineOperationRecord>(
      worklineApiMethods.manualSessions({ session_id: sessionId }, payload)
    )
  },

  sessionPath(sessionId: number) {
    return adaptRuntimeMethod<RuntimeTracePathResponse>(
      worklineApiMethods.sessionsPath({ session_id: sessionId })
    )
  },

  tracePath(traceId: string) {
    return adaptRuntimeMethod<RuntimeTracePathResponse>(
      worklineApiMethods.tracesPath({ trace_id: traceId })
    )
  },

  runtimeHolds(query?: RuntimeHoldListQuery) {
    return adaptRuntimeMethod<RuntimeHoldSummary[]>(apiClient.Get(runtimeHoldListUrl(query)))
  },

  runtimeHoldDetail(holdId: number) {
    return adaptRuntimeMethod<RuntimeHoldDetailResponse>(
      runtimeHoldApiMethods.runtimeHoldDetail(holdId)
    )
  },

  resolveRuntimeHold(holdId: number, payload: ResolveInput) {
    return adaptRuntimeMethod<ResolveRuntimeHoldResponse>(
      runtimeHoldApiMethods.resolveRuntimeHold(holdId, payload)
    )
  },

  runtimeHoldNgReasons(query?: RuntimeHoldNgReasonsQuery) {
    return adaptRuntimeMethod<NgReasonOption[]>(runtimeHoldApiMethods.runtimeHoldNgReasons(query))
  },

  ngReturnItems(query?: NgReturnItemsQuery) {
    return adaptRuntimeMethod<NgReturnItemResponse[]>(runtimeHoldApiMethods.ngReturnItems(query))
  }
}
