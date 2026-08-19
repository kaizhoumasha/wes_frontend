import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiResponseError } from '@/api/client'
import {
  clearPendingStartRequest,
  ensurePendingStartRequest,
  getStableStartReason,
  readPendingStartRequest
} from '@/views/admin/worklines/config/startRequest'

describe('WorkLine START request identity', () => {
  beforeEach(() => sessionStorage.clear())

  afterEach(() => vi.useRealTimers())

  it('keeps one request id per WorkLine without a timestamp or TTL', () => {
    const first = ensurePendingStartRequest(7, () => 'request-7')
    const replay = ensurePendingStartRequest(7, () => 'different')
    const other = ensurePendingStartRequest(8, () => 'request-8')

    expect(first).toBe('request-7')
    expect(replay).toBe('request-7')
    expect(other).toBe('request-8')
    expect(sessionStorage.getItem('wes:workline:start:7')).toBe('request-7')
    expect(sessionStorage.getItem('wes:workline:start:7:time')).toBeNull()

    clearPendingStartRequest(7)
    expect(readPendingStartRequest(7)).toBeNull()
  })

  it('keeps raw storage after time advances beyond the generic cache TTL', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-20T00:00:00Z'))
    ensurePendingStartRequest(7, () => 'request-7')

    vi.advanceTimersByTime(6 * 60 * 1000)

    expect(readPendingStartRequest(7)).toBe('request-7')
  })

  it('recognizes only stable backend START reasons as definite rejection', () => {
    const conflict = new ApiResponseError('3012', 'conflict', 'now', {
      reason: 'IDEMPOTENCY_CONFLICT'
    })
    const unknown = new ApiResponseError('5000', 'server error', 'now')

    expect(getStableStartReason(conflict)).toBe('IDEMPOTENCY_CONFLICT')
    expect(getStableStartReason(unknown)).toBeNull()
    expect(getStableStartReason(new TypeError('Failed to fetch'))).toBeNull()
  })

  it('treats a schema-valid SERVICE_UNAVAILABLE response as definite rejection', () => {
    const unavailable = new ApiResponseError('5003', 'unavailable', 'now', {
      reason: 'SERVICE_UNAVAILABLE'
    })

    expect(getStableStartReason(unavailable)).toBe('SERVICE_UNAVAILABLE')
  })

  it('does not classify malformed START error data as a definite rejection', () => {
    const malformed = new ApiResponseError('5003', 'unavailable', 'now', {
      reason: 503
    })

    expect(getStableStartReason(malformed)).toBeNull()
  })
})
