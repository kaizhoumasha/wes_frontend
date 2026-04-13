import { afterEach, describe, expect, it, vi } from 'vitest'
import { env } from '@/config/env'

describe('env', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('preserves an empty API base URL for same-origin requests', () => {
    vi.stubEnv('VITE_API_BASE_URL', '')

    expect(env.apiBaseUrl).toBe('')
  })

  it('normalizes a versioned same-origin API base URL to avoid duplicating /api/v1', () => {
    vi.stubEnv('VITE_API_BASE_URL', '/api/v1')

    expect(env.apiBaseUrl).toBe('')
  })

  it('normalizes an absolute API base URL ending with /api/v1 to the host root', () => {
    vi.stubEnv('VITE_API_BASE_URL', 'http://192.168.0.221:8080/api/v1')

    expect(env.apiBaseUrl).toBe('http://192.168.0.221:8080')
  })

  it('falls back to the default API base URL only when unset', () => {
    vi.stubEnv('VITE_API_BASE_URL', undefined)

    expect(env.apiBaseUrl).toBe('http://localhost:8001')
  })

  it('falls back to the default app title only when unset', () => {
    vi.stubEnv('VITE_APP_TITLE', undefined)

    expect(env.appTitle).toBe('P9 MCS')
  })

  it('preserves an empty SSE URL when explicitly provided', () => {
    vi.stubEnv('VITE_SSE_URL', '')

    expect(env.sseUrl).toBe('')
  })

  it('falls back to the default SSE URL only when unset', () => {
    vi.stubEnv('VITE_SSE_URL', undefined)

    expect(env.sseUrl).toBe('http://localhost:8001/api/v1/events/stream')
  })
})
