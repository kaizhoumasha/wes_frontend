import { describe, expect, it, vi } from 'vitest'
import {
  AuthenticatedSseHttpError,
  createAuthenticatedSseConnection
} from '@/api/streaming/authenticatedSseStream'

describe('createAuthenticatedSseConnection', () => {
  it('owns reconnect state, gap reporting and explicit shutdown', async () => {
    vi.useFakeTimers()
    const states: string[] = []
    const gaps: boolean[] = []
    const connector = vi.fn(async ({ onOpen }: { onOpen: () => void }) => onOpen())
    const connection = createAuthenticatedSseConnection({
      connector,
      initialRetryDelayMs: 50,
      onStateChange: state => states.push(state),
      onGap: () => gaps.push(true)
    })

    connection.connect()
    await vi.waitFor(() => expect(connector).toHaveBeenCalledTimes(1))
    expect(states).toEqual(['CONNECTING', 'CONNECTED', 'CONNECTING'])
    expect(gaps).toEqual([true])

    await vi.advanceTimersByTimeAsync(50)
    await vi.waitFor(() => expect(connector).toHaveBeenCalledTimes(2))
    expect(states).toContain('RECONNECTED')

    connection.disconnect()
    expect(states.at(-1)).toBe('DISCONNECTED')
    expect(vi.getTimerCount()).toBe(0)
    vi.useRealTimers()
  })

  it('does not retry an authorization failure', async () => {
    vi.useFakeTimers()
    const states: string[] = []
    const errors: Error[] = []
    const connector = vi.fn().mockRejectedValue(new AuthenticatedSseHttpError(403))
    const connection = createAuthenticatedSseConnection({
      connector,
      onStateChange: state => states.push(state),
      onError: error => errors.push(error)
    })

    connection.connect()
    await vi.waitFor(() => expect(errors).toHaveLength(1))
    expect(states.at(-1)).toBe('DISCONNECTED')
    expect(vi.getTimerCount()).toBe(0)
    vi.useRealTimers()
  })
})
