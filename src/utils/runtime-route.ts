export type RuntimeRouteQueryValue = string | number | null | undefined

function toRuntimeRouteQueryValue(value: RuntimeRouteQueryValue): string | undefined {
  if (value === null || value === undefined || value === '') {
    return undefined
  }

  return String(value)
}

export function buildRuntimeWorklineQuery(
  worklineId: RuntimeRouteQueryValue,
  deviceId?: RuntimeRouteQueryValue,
  mode?: RuntimeRouteQueryValue,
  sessionId?: RuntimeRouteQueryValue,
  traceId?: RuntimeRouteQueryValue,
) {
  return {
    worklineId: toRuntimeRouteQueryValue(worklineId),
    deviceId: toRuntimeRouteQueryValue(deviceId),
    mode: toRuntimeRouteQueryValue(mode),
    sessionId: toRuntimeRouteQueryValue(sessionId),
    traceId: toRuntimeRouteQueryValue(traceId),
  }
}

export interface RuntimeTraceQueryInput {
  traceId?: RuntimeRouteQueryValue
  sessionId?: RuntimeRouteQueryValue
  requestId?: RuntimeRouteQueryValue
  commandCode?: RuntimeRouteQueryValue
  dispatchKey?: RuntimeRouteQueryValue
  barcode?: RuntimeRouteQueryValue
  deviceId?: RuntimeRouteQueryValue
  worklineId?: RuntimeRouteQueryValue
}

export function buildRuntimeTraceQuery(query: RuntimeTraceQueryInput) {
  return {
    traceId: toRuntimeRouteQueryValue(query.traceId),
    sessionId: toRuntimeRouteQueryValue(query.sessionId),
    requestId: toRuntimeRouteQueryValue(query.requestId),
    commandCode: toRuntimeRouteQueryValue(query.commandCode),
    dispatchKey: toRuntimeRouteQueryValue(query.dispatchKey),
    barcode: toRuntimeRouteQueryValue(query.barcode),
    deviceId: toRuntimeRouteQueryValue(query.deviceId),
    worklineId: toRuntimeRouteQueryValue(query.worklineId)
  }
}
