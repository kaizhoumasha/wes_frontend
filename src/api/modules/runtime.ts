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

  devices() {
    return apiClient.Get<RuntimeDeviceSummary[]>('/api/v1/workline/runtime/devices')
  },

  deviceDetail(deviceId: number) {
    return apiClient.Get<RuntimeDeviceDetailResponse>(`/api/v1/workline/runtime/devices/${deviceId}`)
  },

  queryTraces(payload: TraceQueryPayload) {
    return apiClient.Post<RuntimeTraceListResponse>('/api/v1/workline/trace/query', payload)
  },

  traceByRequestId(requestId: string) {
    return apiClient.Get<TraceDetailResponse>(`/api/v1/workline/trace/request/${encodeURIComponent(requestId)}`)
  },

  traceByCorrelationId(correlationId: string) {
    return apiClient.Get<TraceDetailResponse>(`/api/v1/workline/trace/correlation/${encodeURIComponent(correlationId)}`)
  },

  traceBySessionId(sessionId: number) {
    return apiClient.Get<TraceDetailResponse>(`/api/v1/workline/trace/session/${sessionId}`)
  },

  traceByCommandCode(commandCode: string) {
    return apiClient.Get<TraceDetailResponse>(`/api/v1/workline/trace/command/${encodeURIComponent(commandCode)}`)
  },

  traceByDispatchKey(dispatchKey: string) {
    return apiClient.Get<TraceDetailResponse>(`/api/v1/workline/trace/dispatch/${encodeURIComponent(dispatchKey)}`)
  },
}
