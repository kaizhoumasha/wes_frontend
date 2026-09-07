import { describe, expect, it } from 'vitest'
import { ApiResponseError } from '@/api/client'
import { getStableStartReason } from '@/views/admin/worklines/config/startRequest'

describe('WorkLine START rejection', () => {
  it('recognizes only stable backend START reasons as definite rejection', () => {
    const conflict = new ApiResponseError('3012', 'conflict', 'now', {
      reason: 'VERSION_CONFLICT'
    })
    const unknown = new ApiResponseError('5000', 'server error', 'now')

    expect(getStableStartReason(conflict)).toBe('VERSION_CONFLICT')
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
