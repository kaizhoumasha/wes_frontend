import { describe, expect, it } from 'vitest'
import type { PlaneActiveObjectView } from '@/api/types/plane-v2'
import {
  filterActiveObjects,
  findResourceState,
  matchesSelectedResource,
  nextPollDelayMs,
  sameResourceRef
} from '@/views/admin/worklines/components/activity-monitor/planeV2Helpers'

describe('nextPollDelayMs', () => {
  it('stays at the 15s baseline while healthy', () => {
    expect(nextPollDelayMs(0)).toBe(15_000)
    expect(nextPollDelayMs(-1)).toBe(15_000)
  })

  it('escalates 15/30/60/120s across consecutive failures and caps at 120s', () => {
    expect(nextPollDelayMs(1)).toBe(15_000)
    expect(nextPollDelayMs(2)).toBe(30_000)
    expect(nextPollDelayMs(3)).toBe(60_000)
    expect(nextPollDelayMs(4)).toBe(120_000)
    expect(nextPollDelayMs(9)).toBe(120_000)
  })
})

describe('sameResourceRef / matchesSelectedResource', () => {
  it('requires both group and key to match', () => {
    expect(
      sameResourceRef({ group: 'POSITION_SLOT', key: 'A' }, { group: 'POSITION_SLOT', key: 'A' })
    ).toBe(true)
    expect(
      sameResourceRef({ group: 'POSITION_SLOT', key: 'A' }, { group: 'DEVICE_ROLE', key: 'A' })
    ).toBe(false)
    expect(sameResourceRef(null, { group: 'POSITION_SLOT', key: 'A' })).toBe(false)
  })

  it('treats no selection as matching everything', () => {
    expect(matchesSelectedResource(null, null)).toBe(true)
    expect(matchesSelectedResource({ group: 'DEVICE_ROLE', key: 'X' }, null)).toBe(true)
    expect(matchesSelectedResource(null, { group: 'DEVICE_ROLE', key: 'X' })).toBe(false)
  })
})

describe('findResourceState', () => {
  it('finds the state matching group and key exactly', () => {
    const states = [
      {
        resource_ref: { group: 'POSITION_SLOT' as const, key: 'A' },
        active_object_count: 2,
        highest_conflict_state: 'OK' as const
      },
      {
        resource_ref: { group: 'DEVICE_ROLE' as const, key: 'A' },
        active_object_count: 1,
        highest_conflict_state: 'TRANSIENT' as const
      }
    ]
    expect(findResourceState(states, { group: 'DEVICE_ROLE', key: 'A' })?.active_object_count).toBe(
      1
    )
    expect(findResourceState(states, { group: 'DEVICE_ROLE', key: 'B' })).toBeUndefined()
  })
})

function makeObject(overrides: Partial<PlaneActiveObjectView>): PlaneActiveObjectView {
  return {
    object_type: 'TRANSPORT_TASK',
    object_key: 'T-1',
    conflict_state: 'OK',
    primary_source: null,
    all_sources: [],
    operator_hint: null,
    location_summary: null,
    evidence_refs: [],
    resource_ref: null,
    ...overrides
  }
}

describe('filterActiveObjects', () => {
  const objects = [
    makeObject({
      object_key: 'mapped',
      resource_ref: { group: 'POSITION_SLOT', key: 'A' },
      conflict_state: 'OK'
    }),
    makeObject({
      object_key: 'other-resource',
      resource_ref: { group: 'DEVICE_ROLE', key: 'B' },
      conflict_state: 'TRANSIENT'
    }),
    makeObject({ object_key: 'unmapped', resource_ref: null, conflict_state: 'RECONCILING' })
  ]

  it('filters by selected resource when unmappedOnly is false', () => {
    const result = filterActiveObjects(objects, {
      selectedResourceRef: { group: 'POSITION_SLOT', key: 'A' }
    })
    expect(result.map(o => o.object_key)).toEqual(['mapped'])
  })

  it('shows only unmapped objects when unmappedOnly is true, ignoring resource selection', () => {
    const result = filterActiveObjects(objects, {
      selectedResourceRef: { group: 'POSITION_SLOT', key: 'A' },
      unmappedOnly: true
    })
    expect(result.map(o => o.object_key)).toEqual(['unmapped'])
  })

  it('combines conflict_state and object_type filters', () => {
    const result = filterActiveObjects(objects, { conflictState: 'TRANSIENT' })
    expect(result.map(o => o.object_key)).toEqual(['other-resource'])
  })
})
