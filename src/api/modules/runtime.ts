import { worklineApiMethods } from '@/api/modules/workline'
import type {
  RuntimeDeviceDetailResponse,
  RuntimeDeviceSummary,
  RuntimeOverviewResponse,
  RuntimeTraceListResponse,
  RuntimeWorklineDetailResponse,
  RuntimeWorklineSummary,
  TraceDetailResponse,
  TraceQueryPayload,
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
  overview() {
    return adaptRuntimeMethod<RuntimeOverviewResponse>(worklineApiMethods.overview())
  },

  worklines() {
    return adaptRuntimeMethod<RuntimeWorklineSummary[]>(worklineApiMethods.worklines())
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
        step_code: payload.step_code,
        workline_id: payload.workline_id
      })
    )
  },

  traceByRequestId(requestId: string) {
    return adaptRuntimeMethod<TraceDetailResponse>(worklineApiMethods.request({ request_id: requestId }))
  },

  traceByCorrelationId(correlationId: string) {
    return adaptRuntimeMethod<TraceDetailResponse>(
      worklineApiMethods.correlation({ correlation_id: correlationId })
    )
  },

  traceBySessionId(sessionId: number) {
    return adaptRuntimeMethod<TraceDetailResponse>(worklineApiMethods.session({ session_id: sessionId }))
  },

  traceByCommandCode(commandCode: string) {
    return adaptRuntimeMethod<TraceDetailResponse>(worklineApiMethods.command({ command_code: commandCode }))
  },

  traceByDispatchKey(dispatchKey: string) {
    return adaptRuntimeMethod<TraceDetailResponse>(worklineApiMethods.dispatch({ dispatch_key: dispatchKey }))
  },
}
