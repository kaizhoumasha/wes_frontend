import { describe, expect, it } from 'vitest'
import {
  classifyRuntimeRefresh,
  isRelevantRuntimeEvent,
  isRuntimeDomainAllowed,
  readRuntimeEventNumber
} from '@/utils/runtime-event'
import type { RuntimeSSEPayload } from '@/composables/useRuntimeSSE'

function createEvent(keys?: Record<string, unknown>): RuntimeSSEPayload {
  return {
    domain: 'workline_trace',
    keys
  }
}

describe('runtime-event', () => {
  it('reads positive integer identifiers from event keys', () => {
    expect(readRuntimeEventNumber(createEvent({ session_id: '42' }), 'session_id')).toBe(42)
    expect(readRuntimeEventNumber(createEvent({ session_id: 0 }), 'session_id')).toBeNull()
    expect(readRuntimeEventNumber(createEvent({ session_id: 'abc' }), 'session_id')).toBeNull()
  })

  it('matches events by any comparable scope key', () => {
    const event = createEvent({
      workline_id: 10,
      device_id: 21
    })

    expect(isRelevantRuntimeEvent(event, { worklineId: 10 })).toBe(true)
    expect(isRelevantRuntimeEvent(event, { deviceId: 21 })).toBe(true)
    expect(isRelevantRuntimeEvent(event, { worklineId: 11, deviceId: 99 })).toBe(false)
  })

  it('falls back to refresh when the event does not carry comparable scope keys', () => {
    const event = createEvent({ session_id: 15 })

    expect(isRelevantRuntimeEvent(event, { worklineId: 10 })).toBe(true)
    expect(isRelevantRuntimeEvent(createEvent(), { deviceId: 21 })).toBe(true)
  })

  it('allows safety runtime domains', () => {
    expect(isRuntimeDomainAllowed('workline_safety')).toBe(true)
    expect(isRuntimeDomainAllowed('safety')).toBe(true)
    expect(isRuntimeDomainAllowed('unknown_domain')).toBe(false)
  })

  it('classifies safety events as workline detail and incident refreshes', () => {
    const refresh = classifyRuntimeRefresh({
      domain: 'workline_safety',
      entity: 'incident',
      action: 'estop.activated',
      keys: { workline_id: 10, incident_id: 20 }
    })

    expect(refresh).toEqual({
      worklines: true,
      detail: true,
      activeIncident: true,
      sandbox: false
    })
  })
})
