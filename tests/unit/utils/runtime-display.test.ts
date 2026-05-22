import { describe, expect, it } from 'vitest'
import { aggregateSessionsByDevice } from '@/utils/runtime-display'
import type { RuntimeTraceListItem } from '@/types/runtime'

function createTrace(overrides: Partial<RuntimeTraceListItem>): RuntimeTraceListItem {
  return {
    session_id: 1,
    session_code: 'S-1',
    workline_id: 101,
    status: 'RUNNING',
    is_timed_out: false,
    ...overrides
  }
}

describe('runtime-display', () => {
  it('aggregates active runtime sessions by device and ignores unassigned sessions', () => {
    const counts = aggregateSessionsByDevice([
      createTrace({ session_id: 1, device_id: 201 }),
      createTrace({ session_id: 2, device_id: 201 }),
      createTrace({ session_id: 3, device_id: 202 }),
      createTrace({ session_id: 4, device_id: null }),
      createTrace({ session_id: 5 })
    ])

    expect([...counts.entries()]).toEqual([
      [201, 2],
      [202, 1]
    ])
  })
})
