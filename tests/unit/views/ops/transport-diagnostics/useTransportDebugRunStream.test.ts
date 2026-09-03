import { ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import type { TransportDebugRunStreamOptions } from '@/api/streaming/transportDebugRunStream'
import { useTransportDebugRunStream } from '@/views/ops/transport-diagnostics/useTransportDebugRunStream'

describe('useTransportDebugRunStream', () => {
  it('refreshes from invalidations and polls only while visible and disconnected', async () => {
    vi.useFakeTimers()
    let attempt!: TransportDebugRunStreamOptions
    const connector = vi.fn((options: TransportDebugRunStreamOptions) => {
      attempt = options
      return new Promise<void>(() => undefined)
    })
    const refreshRun = vi.fn().mockResolvedValue(undefined)
    const loadRecentRuns = vi.fn().mockResolvedValue(undefined)
    const stream = useTransportDebugRunStream({
      connector, visible: ref(true), activeRunId: ref('run-1'), refreshRun,
      loadRecentRuns, pollIntervalMs: 1000
    })
    stream.connect()
    await vi.waitFor(() => expect(connector).toHaveBeenCalledOnce())
    await vi.advanceTimersByTimeAsync(1000)
    expect(refreshRun).toHaveBeenCalledWith('run-1')
    attempt.onEvent({
      type: 'transport_debug_run.updated',
      payload: { run_id: 'run-2', version: 2, status: 'RUNNING', updated_at: 'now' }
    })
    expect(refreshRun).toHaveBeenCalledWith('run-2')
    attempt.onOpen?.()
    expect(stream.connectionState.value).toBe('CONNECTED')
    expect(loadRecentRuns).toHaveBeenCalledOnce()
    expect(vi.getTimerCount()).toBe(1)
    stream.disconnect()
    vi.useRealTimers()
  })

  it('polls through HTTP when SSE is not authorized', async () => {
    vi.useFakeTimers()
    const refreshRun = vi.fn().mockResolvedValue(undefined)
    const stream = useTransportDebugRunStream({
      connector: vi.fn(), visible: ref(true), activeRunId: ref('run-1'),
      refreshRun, pollIntervalMs: 1000
    })
    stream.connect(false)
    await vi.advanceTimersByTimeAsync(1000)
    expect(refreshRun).toHaveBeenCalledWith('run-1')
    stream.disconnect()
    vi.useRealTimers()
  })

  it('polls the persisted run list until an active run is discovered', async () => {
    vi.useFakeTimers()
    const refreshRun = vi.fn().mockResolvedValue(undefined)
    const loadRecentRuns = vi.fn().mockResolvedValue(undefined)
    const stream = useTransportDebugRunStream({
      connector: vi.fn(), visible: ref(true), activeRunId: ref(null),
      refreshRun, loadRecentRuns, pollIntervalMs: 1000
    })
    stream.connect(false)
    await vi.advanceTimersByTimeAsync(1000)
    expect(loadRecentRuns).toHaveBeenCalledOnce()
    expect(refreshRun).not.toHaveBeenCalled()
    stream.disconnect()
    vi.useRealTimers()
  })
})
