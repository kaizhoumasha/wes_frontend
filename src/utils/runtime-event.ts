import type { RuntimeSSEPayload } from '@/composables/useRuntimeSSE'

type RuntimeEventScopeKey = 'session_id' | 'workline_id' | 'device_id'

export interface RuntimeEventScope {
  sessionId?: number | null
  worklineId?: number | null
  deviceId?: number | null
}

function normalizeRuntimeEventValue(value: unknown): string | null {
  const rawValue = Array.isArray(value) ? value[0] : value
  if (rawValue === null || rawValue === undefined || rawValue === '') {
    return null
  }

  return String(rawValue)
}

export function readRuntimeEventNumber(event: RuntimeSSEPayload | null | undefined, key: RuntimeEventScopeKey): number | null {
  const normalizedValue = normalizeRuntimeEventValue(event?.keys?.[key])
  if (!normalizedValue) {
    return null
  }

  const numericValue = Number(normalizedValue)
  return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : null
}

export function isRelevantRuntimeEvent(
  event: RuntimeSSEPayload | null | undefined,
  scope: RuntimeEventScope
): boolean {
  if (!event?.keys) {
    return true
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
