import {
  worklineApiMethods,
  runtimeHoldApiMethods,
  type ReconciliationsSessionsResolveInput,
  type ReconciliationsSessionsResolveResult,
  type RuntimeHoldNgReasonsQuery,
  type NgReturnItemsQuery,
  type ResolveInput
} from '@/api/modules/workline'
import { apiClient } from '@/api/client'
import type {
  RuntimeClearEstopRequest,
  RuntimeDeviceDetailResponse,
  RuntimeDeviceSummary,
  RuntimeOverviewResponse,
  RuntimeTraceListResponse,
  RuntimeTracePathResponse,
  RuntimeSafetyIncidentSummary,
  RuntimeSimulateEstopRequest,
  RuntimeHoldDetailResponse,
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

function adaptRuntimeMethod<T>(method: { send: () => Promise<unknown> }): RuntimeApiMethod<T> {
  return {
    send: () => method.send() as Promise<T>
  }
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

  sandboxSimulateEstop(worklineId: number, payload: RuntimeSimulateEstopRequest) {
    return adaptRuntimeMethod<RuntimeSafetyIncidentSummary>(
      apiClient.Post(
        `/api/v1/workline/operations/sandbox/worklines/${worklineId}/simulate-estop`,
        payload
      )
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
