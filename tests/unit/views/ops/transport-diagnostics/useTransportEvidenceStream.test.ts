import { describe, expect, it, vi } from 'vitest'
import { useTransportEvidenceStream } from '@/views/ops/transport-diagnostics/useTransportEvidenceStream'
import type { TransportEvidenceStreamOptions } from '@/api/streaming/transportEvidenceStream'

describe('useTransportEvidenceStream', () => {
  it('reports a live-only gap and refreshes once after reconnect', async () => {
    vi.useFakeTimers()
    const attempts: TransportEvidenceStreamOptions[] = []
    const resolvers: Array<() => void> = []
    const onReconnect = vi.fn()
    const connector = vi.fn((options: TransportEvidenceStreamOptions) => {
      attempts.push(options)
      return new Promise<void>(resolve => resolvers.push(resolve))
    })
    const stream = useTransportEvidenceStream({ connector, onEvent: vi.fn(), onReconnect })

    stream.connect()
    await vi.waitFor(() => expect(attempts).toHaveLength(1))
    attempts[0]?.onOpen?.()
    expect(stream.connectionState.value).toBe('CONNECTED')
    resolvers[0]?.()
    await vi.waitFor(() => expect(stream.hasGap.value).toBe(true))

    await vi.advanceTimersByTimeAsync(500)
    await vi.waitFor(() => expect(attempts).toHaveLength(2))
    attempts[1]?.onOpen?.()
    expect(stream.connectionState.value).toBe('RECONNECTED')
    expect(onReconnect).toHaveBeenCalledOnce()

    stream.disconnect()
    expect(vi.getTimerCount()).toBe(0)
    vi.useRealTimers()
  })
})
