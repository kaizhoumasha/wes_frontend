import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/router', () => ({
  default: {
    push: vi.fn(),
  }
}))

vi.mock('@/composables/permission-state', () => ({
  clearPermissionState: vi.fn()
}))

describe('token-refresh', () => {
  beforeEach(async () => {
    vi.resetModules()
    localStorage.clear()

    const { resetSSESessionState } = await import('@/api/services/sse-session')
    resetSSESessionState()
  })

  it('clears the SSE replay cursor when auth tokens are cleared', async () => {
    const { clearTokens, TOKEN_KEY, TOKEN_EXPIRES_AT_KEY } = await import('@/api/services/token-refresh')
    const { getLastSSEEventId, setLastSSEEventId } = await import('@/api/services/sse-session')

    localStorage.setItem(TOKEN_KEY, 'token-123')
    localStorage.setItem(TOKEN_EXPIRES_AT_KEY, '123456')
    setLastSSEEventId('evt-41')

    clearTokens()

    expect(localStorage.getItem(TOKEN_KEY)).toBeNull()
    expect(localStorage.getItem(TOKEN_EXPIRES_AT_KEY)).toBeNull()
    expect(getLastSSEEventId()).toBeNull()
  })
})
