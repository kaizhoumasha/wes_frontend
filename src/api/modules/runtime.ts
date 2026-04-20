import { apiClient } from '@/api/client'
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

function getTraceDetail(path: string, value: number | string) {
  return apiClient.Get<TraceDetailResponse>(`/api/v1/workline/trace/${path}/${encodeURIComponent(String(value))}`)
}

export const runtimeApiMethods = {
  overview() {
    return apiClient.Get<RuntimeOverviewResponse>('/api/v1/workline/runtime/overview')
  },

  worklines() {
    return apiClient.Get<RuntimeWorklineSummary[]>('/api/v1/workline/runtime/worklines')
  },

  worklineDetail(worklineId: number) {
    return apiClient.Get<RuntimeWorklineDetailResponse>(`/api/v1/workline/runtime/worklines/${worklineId}`)
  },

  devices(worklineId: number) {
    return apiClient.Get<RuntimeDeviceSummary[]>('/api/v1/workline/runtime/devices', {
      params: { worklineId }
    })
  },

  deviceDetail(deviceId: number, worklineId: number) {
    return apiClient.Get<RuntimeDeviceDetailResponse>(`/api/v1/workline/runtime/devices/${deviceId}`, {
      params: { worklineId }
    })
  },

  queryTraces(payload: TraceQueryPayload) {
    return apiClient.Post<RuntimeTraceListResponse>('/api/v1/workline/trace/query', payload)
  },

  traceByRequestId(requestId: string) {
    return getTraceDetail('request', requestId)
  },

  traceByCorrelationId(correlationId: string) {
    return getTraceDetail('correlation', correlationId)
  },

  traceBySessionId(sessionId: number) {
    return getTraceDetail('session', sessionId)
  },

  traceByCommandCode(commandCode: string) {
    return getTraceDetail('command', commandCode)
  },

  traceByDispatchKey(dispatchKey: string) {
    return getTraceDetail('dispatch', dispatchKey)
  },
}
