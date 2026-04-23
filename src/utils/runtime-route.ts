export type RuntimeRouteQueryValue = string | number | null | undefined

function toRuntimeRouteQueryValue(value: RuntimeRouteQueryValue): string | undefined {
  if (value === null || value === undefined || value === '') {
    return undefined
  }

  return String(value)
}

export function buildRuntimeWorklineQuery(worklineId: RuntimeRouteQueryValue, deviceId?: RuntimeRouteQueryValue) {
  return {
    worklineId: toRuntimeRouteQueryValue(worklineId),
    deviceId: toRuntimeRouteQueryValue(deviceId)
  }
}

export interface RuntimeTraceQueryInput {
  sessionId?: RuntimeRouteQueryValue
  requestId?: RuntimeRouteQueryValue
  correlationId?: RuntimeRouteQueryValue
  commandCode?: RuntimeRouteQueryValue
  dispatchKey?: RuntimeRouteQueryValue
  barcode?: RuntimeRouteQueryValue
  deviceId?: RuntimeRouteQueryValue
  worklineId?: RuntimeRouteQueryValue
}

export function buildRuntimeTraceQuery(query: RuntimeTraceQueryInput) {
  return {
    sessionId: toRuntimeRouteQueryValue(query.sessionId),
    requestId: toRuntimeRouteQueryValue(query.requestId),
    correlationId: toRuntimeRouteQueryValue(query.correlationId),
    commandCode: toRuntimeRouteQueryValue(query.commandCode),
    dispatchKey: toRuntimeRouteQueryValue(query.dispatchKey),
    barcode: toRuntimeRouteQueryValue(query.barcode),
    deviceId: toRuntimeRouteQueryValue(query.deviceId),
    worklineId: toRuntimeRouteQueryValue(query.worklineId)
  }
}
