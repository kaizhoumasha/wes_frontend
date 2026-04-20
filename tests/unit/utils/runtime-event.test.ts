import { describe, expect, it } from 'vitest'
import { isRelevantRuntimeEvent, readRuntimeEventNumber } from '@/utils/runtime-event'
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
})
