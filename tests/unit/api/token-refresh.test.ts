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
  beforeEach(() => {
    vi.resetModules()
    localStorage.clear()
  })

  it('clears auth tokens', async () => {
    const { clearTokens, TOKEN_KEY, TOKEN_EXPIRES_AT_KEY } = await import('@/api/services/token-refresh')

    localStorage.setItem(TOKEN_KEY, 'token-123')
    localStorage.setItem(TOKEN_EXPIRES_AT_KEY, '123456')

    clearTokens()

    expect(localStorage.getItem(TOKEN_KEY)).toBeNull()
    expect(localStorage.getItem(TOKEN_EXPIRES_AT_KEY)).toBeNull()
  })
})
