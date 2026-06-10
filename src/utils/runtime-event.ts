import type { RuntimeSSEPayload } from '@/composables/useRuntimeSSE'
import { ALLOWED_RUNTIME_EVENT_DOMAINS } from '@/constants/runtime-safety'

type RuntimeEventNumberScopeKey = 'session_id' | 'workline_id' | 'device_id'
export type RuntimeRefreshTarget = 'worklines' | 'projection' | 'activeIncident' | 'sandbox'

export interface RuntimeEventScope {
  traceId?: string | null
  sessionId?: number | null
  worklineId?: number | null
  deviceId?: number | null
}

export interface RuntimeRefreshClassification {
  worklines: boolean
  projection: boolean
  activeIncident: boolean
  sandbox: boolean
}

function normalizeRuntimeEventValue(value: unknown): string | null {
  const rawValue = Array.isArray(value) ? value[0] : value
  if (rawValue === null || rawValue === undefined || rawValue === '') {
    return null
  }

  return String(rawValue)
}

export function readRuntimeEventNumber(
  event: RuntimeSSEPayload | null | undefined,
  key: RuntimeEventNumberScopeKey
): number | null {
  const normalizedValue = normalizeRuntimeEventValue(event?.keys?.[key])
  if (!normalizedValue) {
    return null
  }

  const numericValue = Number(normalizedValue)
  return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : null
}

export function readRuntimeEventText(
  event: RuntimeSSEPayload | null | undefined,
  key: string
): string | null {
  return normalizeRuntimeEventValue(event?.keys?.[key])
}

export function isRuntimeDomainAllowed(domain: string | null | undefined): boolean {
  return Boolean(domain && ALLOWED_RUNTIME_EVENT_DOMAINS.has(domain))
}

export function classifyRuntimeRefresh(
  event: RuntimeSSEPayload | null | undefined
): RuntimeRefreshClassification {
  const targets: RuntimeRefreshClassification = {
    worklines: true,
    projection: false,
    activeIncident: false,
    sandbox: false
  }

  if (!event) return targets
  if (!isRuntimeDomainAllowed(event.domain)) {
    return {
      worklines: false,
      projection: false,
      activeIncident: false,
      sandbox: false
    }
  }

  const entity = event.entity ?? ''

  if (entity === 'incident') {
    return {
      worklines: true,
      projection: true,
      activeIncident: true,
      sandbox: false
    }
  }

  if (entity === 'workline') {
    return {
      worklines: true,
      projection: true,
      activeIncident: false,
      sandbox: false
    }
  }

  if (entity === 'session') {
    return {
      worklines: true,
      projection: true,
      activeIncident: false,
      sandbox: true
    }
  }

  if (['device', 'outbox', 'command'].includes(entity)) {
    return {
      worklines: false,
      projection: true,
      activeIncident: false,
      sandbox: true
    }
  }

  return targets
}

export function isRelevantRuntimeEvent(
  event: RuntimeSSEPayload | null | undefined,
  scope: RuntimeEventScope
): boolean {
  if (event && !isRuntimeDomainAllowed(event.domain)) {
    return false
  }

  if (!event?.keys) {
    return true
  }

  const eventTraceId = readRuntimeEventText(event, 'trace_id')
  if (scope.traceId && eventTraceId) {
    return scope.traceId === eventTraceId
  }

  const comparisons = [
    {
      scopeValue: scope.sessionId ?? null,
      eventValue: readRuntimeEventNumber(event, 'session_id')
    },
    {
      scopeValue: scope.worklineId ?? null,
      eventValue: readRuntimeEventNumber(event, 'workline_id')
    },
    {
      scopeValue: scope.deviceId ?? null,
      eventValue: readRuntimeEventNumber(event, 'device_id')
    }
  ].filter(item => item.scopeValue)

  const comparableItems = comparisons.filter(item => item.eventValue !== null)
  if (!comparableItems.length) {
    return true
  }

  return comparableItems.some(item => item.scopeValue === item.eventValue)
}
