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

  it('falls back to the default API base URL only when unset', () => {
    vi.stubEnv('VITE_API_BASE_URL', undefined)

    expect(env.apiBaseUrl).toBe('http://localhost:8001')
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
