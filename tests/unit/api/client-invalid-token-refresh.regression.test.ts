import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/router', () => ({
  default: {
    push: vi.fn()
  }
}))

vi.mock('@/composables/permission-state', () => ({
  clearPermissionState: vi.fn()
}))

function apiResponse(code: string, data: unknown, message = 'ok'): Response {
  return new Response(
    JSON.stringify({
      code,
      message,
      data,
      timestamp: '2026-08-21T00:00:00Z'
    }),
    {
      status: code === '1000' ? 200 : 401,
      headers: { 'Content-Type': 'application/json' }
    }
  )
}

describe('invalid access-token refresh regression', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('refreshes and retries when the backend returns INVALID_TOKEN', async () => {
    // Regression: ISSUE-001 — Redis expiry returned 2012 and skipped silent refresh
    // Found by /qa on 2026-08-21
    // Report: .gstack/qa-reports/qa-report-localhost-5173-2026-08-21.md
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(apiResponse('2012', null, 'Token 已失效'))
      .mockResolvedValueOnce(
        apiResponse('1000', {
          access_token: 'refreshed-access-token',
          expires_in: 3600
        })
      )
      .mockResolvedValueOnce(apiResponse('1000', { id: 'application-1' }))
    vi.stubGlobal('fetch', fetchMock)
    localStorage.setItem('access_token', 'invalid-access-token')

    const { apiClient } = await import('@/api/client')
    const result = await apiClient.Get('/api/v1/api-auth/applications')

    expect(result).toEqual({ id: 'application-1' })
    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(localStorage.getItem('access_token')).toBe('refreshed-access-token')
  })
})
