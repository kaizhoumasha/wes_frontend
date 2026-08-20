import { beforeEach, describe, expect, it, vi } from 'vitest'

const handleAuthErrorMock = vi.hoisted(() => vi.fn())

vi.mock('@/router', () => ({
  default: {
    push: vi.fn()
  }
}))

vi.mock('@/composables/permission-state', () => ({
  clearPermissionState: vi.fn()
}))

vi.mock('@/api/services/auth-error-handler', () => ({
  handleAuthError: handleAuthErrorMock
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

function requestPath(input: RequestInfo | URL): string {
  const url = input instanceof Request ? input.url : String(input)
  return new URL(url).pathname
}

describe('invalid access-token refresh regression', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.unstubAllGlobals()
    handleAuthErrorMock.mockReset()
    localStorage.clear()
  })

  it.each([
    ['2012', 'Token 已失效'],
    ['2013', 'Token 已过期']
  ])(
    'refreshes and retries when the backend returns access-token error %s',
    async (code, message) => {
      // Regression: ISSUE-001 — Redis expiry returned 2012 and skipped silent refresh.
      // The same branch still owns the existing 2013 refresh behavior, so both codes stay covered.
      // Found by /qa on 2026-08-21
      // Report: .gstack/qa-reports/qa-report-localhost-5173-2026-08-21.md
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(apiResponse(code, null, message))
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
      const [retriedInput, retriedInit] = fetchMock.mock.calls[2] as unknown as [
        RequestInfo | URL,
        RequestInit | undefined
      ]
      const retriedHeaders =
        retriedInput instanceof Request ? retriedInput.headers : new Headers(retriedInit?.headers)
      expect(retriedHeaders.get('Authorization')).toBe('Bearer refreshed-access-token')
      expect(handleAuthErrorMock).not.toHaveBeenCalled()
    }
  )

  it('does not recursively refresh when the refresh request itself is rejected', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(apiResponse('2012', null, 'Token 已失效'))
      .mockResolvedValueOnce(apiResponse('2012', null, 'Refresh Token 已失效'))
    vi.stubGlobal('fetch', fetchMock)
    localStorage.setItem('access_token', 'invalid-access-token')

    const [{ apiClient }, { setTokenRefreshRouter }] = await Promise.all([
      import('@/api/client'),
      import('@/api/services/token-refresh')
    ])
    const push = vi.fn().mockResolvedValue(undefined)
    setTokenRefreshRouter({ push } as never)

    await expect(apiClient.Get('/api/v1/api-auth/applications')).rejects.toMatchObject({
      code: '2012'
    })

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(localStorage.getItem('access_token')).toBeNull()
    expect(push).toHaveBeenCalledWith('/login')
    expect(handleAuthErrorMock).toHaveBeenCalled()
  })

  it('queues concurrent invalid-token requests behind one refresh', async () => {
    let releaseRefresh!: () => void
    const refreshGate = new Promise<void>(resolve => {
      releaseRefresh = resolve
    })
    const originalAttempts = new Map<string, number>()
    let refreshRequestCount = 0
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const path = requestPath(input)
      if (path === '/api/v1/auth/refresh') {
        refreshRequestCount++
        await refreshGate
        return apiResponse('1000', {
          access_token: 'refreshed-access-token',
          expires_in: 3600
        })
      }

      const attempt = (originalAttempts.get(path) ?? 0) + 1
      originalAttempts.set(path, attempt)
      return attempt === 1
        ? apiResponse('2012', null, 'Token 已失效')
        : apiResponse('1000', { path })
    })
    vi.stubGlobal('fetch', fetchMock)
    localStorage.setItem('access_token', 'invalid-access-token')

    const { apiClient } = await import('@/api/client')
    const resultsPromise = Promise.all([
      apiClient.Get('/api/v1/api-auth/applications'),
      apiClient.Get('/api/v1/admin/users')
    ])

    await vi.waitFor(() => {
      expect(refreshRequestCount).toBe(1)
      expect(originalAttempts.get('/api/v1/api-auth/applications')).toBe(1)
      expect(originalAttempts.get('/api/v1/admin/users')).toBe(1)
    })
    releaseRefresh()

    await expect(resultsPromise).resolves.toEqual([
      { path: '/api/v1/api-auth/applications' },
      { path: '/api/v1/admin/users' }
    ])
    expect(refreshRequestCount).toBe(1)
    expect(originalAttempts.get('/api/v1/api-auth/applications')).toBe(2)
    expect(originalAttempts.get('/api/v1/admin/users')).toBe(2)
    expect(handleAuthErrorMock).not.toHaveBeenCalled()
  })

  it('refreshes each original request at most once', async () => {
    let originalRequestCount = 0
    let refreshRequestCount = 0
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      if (requestPath(input) === '/api/v1/auth/refresh') {
        refreshRequestCount++
        return refreshRequestCount === 1
          ? apiResponse('1000', {
              access_token: 'refreshed-access-token',
              expires_in: 3600
            })
          : apiResponse('2012', null, 'Refresh Token 已失效')
      }

      originalRequestCount++
      return apiResponse('2012', null, 'Token 已失效')
    })
    vi.stubGlobal('fetch', fetchMock)
    localStorage.setItem('access_token', 'invalid-access-token')

    const { apiClient } = await import('@/api/client')

    await expect(apiClient.Get('/api/v1/api-auth/applications')).rejects.toMatchObject({
      code: '2012'
    })
    expect(refreshRequestCount).toBe(1)
    expect(originalRequestCount).toBe(2)
    expect(handleAuthErrorMock).toHaveBeenCalledTimes(1)
  })

  it('does not strand a late invalid-token response after the refreshed token is published', async () => {
    let releaseLateResponse!: () => void
    const lateResponseGate = new Promise<void>(resolve => {
      releaseLateResponse = resolve
    })
    let releaseContextRefresh!: () => void
    const contextRefreshGate = new Promise<void>(resolve => {
      releaseContextRefresh = resolve
    })
    let markContextRefreshStarted!: () => void
    const contextRefreshStarted = new Promise<void>(resolve => {
      markContextRefreshStarted = resolve
    })
    const originalAttempts = new Map<string, number>()
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const path = requestPath(input)
      if (path === '/api/v1/auth/refresh') {
        return apiResponse('1000', {
          access_token: 'refreshed-access-token',
          expires_in: 3600
        })
      }

      const attempt = (originalAttempts.get(path) ?? 0) + 1
      originalAttempts.set(path, attempt)
      if (path === '/api/v1/admin/users' && attempt === 1) {
        await lateResponseGate
      }
      return attempt === 1
        ? apiResponse('2012', null, 'Token 已失效')
        : apiResponse('1000', { path })
    })
    vi.stubGlobal('fetch', fetchMock)
    localStorage.setItem('access_token', 'invalid-access-token')

    const [{ apiClient }, { setOnTokenRefreshed }] = await Promise.all([
      import('@/api/client'),
      import('@/api/services/token-refresh')
    ])
    let contextRefreshCount = 0
    setOnTokenRefreshed(async () => {
      contextRefreshCount++
      if (contextRefreshCount === 1) {
        markContextRefreshStarted()
        await contextRefreshGate
      }
    })

    const firstRequest = apiClient
      .Get('/api/v1/api-auth/applications')
      .then(result => result)
    const lateRequest = apiClient.Get('/api/v1/admin/users').then(result => result)

    await contextRefreshStarted
    releaseLateResponse()
    const lateOutcome = await Promise.race([
      lateRequest.then(value => ({ settled: true as const, value })),
      new Promise<{ settled: false }>(resolve => {
        setTimeout(() => resolve({ settled: false }), 250)
      })
    ])
    releaseContextRefresh()

    await expect(firstRequest).resolves.toEqual({ path: '/api/v1/api-auth/applications' })
    expect(lateOutcome).toEqual({
      settled: true,
      value: { path: '/api/v1/admin/users' }
    })
    expect(originalAttempts.get('/api/v1/admin/users')).toBe(2)
    expect(handleAuthErrorMock).not.toHaveBeenCalled()
  })
})
