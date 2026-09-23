import { describe, expect, it } from 'vitest'
import { toApiTime, toApiTimeFromTimezone } from '@/utils/timezone'

describe('timezone conversion helpers', () => {
  it('converts application-local time to a UTC ISO timestamp', () => {
    expect(toApiTime('2024-01-01 20:00:00')).toBe('2024-01-01T12:00:00.000Z')
  })

  it('converts arbitrary timezone wall time to UTC across DST', () => {
    expect(toApiTimeFromTimezone('2024-01-01 12:00:00', 'America/Chicago')).toBe(
      '2024-01-01T18:00:00.000Z'
    )
    expect(toApiTimeFromTimezone('2024-07-01 12:00:00', 'America/Chicago')).toBe(
      '2024-07-01T17:00:00.000Z'
    )
  })
})
