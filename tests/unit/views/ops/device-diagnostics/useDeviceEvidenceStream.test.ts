import { flushPromises } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type {
  DeviceEvidenceStreamEvent,
  DeviceEvidenceStreamOptions,
  DeviceIngressAttemptEvent
} from '@/api/streaming/deviceEvidenceStream'
import { consumeDeviceEvidenceStream } from '@/api/streaming/deviceEvidenceStream'
import { useDeviceEvidenceStream } from '@/views/ops/device-diagnostics/useDeviceEvidenceStream'

interface StreamSession {
  options: DeviceEvidenceStreamOptions
  resolve: () => void
  reject: (error: unknown) => void
}

function createConnector() {
  const sessions: StreamSession[] = []
  const connector = vi.fn((options: DeviceEvidenceStreamOptions) => {
    return new Promise<void>((resolve, reject) => {
      sessions.push({ options, resolve, reject })
      options.signal.addEventListener(
        'abort',
        () => reject(new DOMException('Aborted', 'AbortError')),
        {
          once: true
        }
      )
    })
  })
  return { connector, sessions }
}

function attempt(index: number, bytes = 128): DeviceEvidenceStreamEvent {
  const payload: DeviceIngressAttemptEvent = {
    request_id: `request-${index}`,
    kind: index % 2 ? 'DEVICE_RESULT' : 'DEVICE_EVENT',
    path: index % 2 ? '/api/v1/callback/result' : '/api/v1/callback/event',
    received_at: '2026-08-23T08:00:00Z',
    disposition: 'ACCEPTED',
    status_code: 200,
    evidence_id: index,
    source_event_id: `source-${index}`,
    device_code: 'ARM-01',
    command_code: index % 2 ? `CMD-${index}` : null,
    event_type: index % 2 ? null : 'ARRIVED',
    apply_status: 'PENDING',
    error_code: null,
    observed_body_bytes: bytes,
    raw_payload: { index }
  }
  return { type: 'device_ingress.attempted', payload }
}

afterEach(() => {
  vi.useRealTimers()
})

describe('useDeviceEvidenceStream', () => {
  it.each([
    { status: 401, expectedFetches: 2, expectedRefreshes: 1 },
    { status: 403, expectedFetches: 1, expectedRefreshes: 0 }
  ])(
    'stops reconnecting after terminal HTTP $status authentication failure',
    async ({ status, expectedFetches, expectedRefreshes }) => {
      vi.useFakeTimers()
      const fetchImpl = vi.fn().mockResolvedValue(new Response(null, { status }))
      const refreshAccessToken = vi.fn().mockResolvedValue('refreshed-token')
      const connector = (options: DeviceEvidenceStreamOptions) =>
        consumeDeviceEvidenceStream(options, {
          fetchImpl,
          getAccessToken: () => 'expired-token',
          refreshAccessToken
        })
      const stream = useDeviceEvidenceStream({ connector, initialRetryDelayMs: 100 })

      stream.connect()
      await flushPromises()
      await vi.advanceTimersByTimeAsync(1_000)
      await flushPromises()

      expect(fetchImpl).toHaveBeenCalledTimes(expectedFetches)
      expect(refreshAccessToken).toHaveBeenCalledTimes(expectedRefreshes)
      expect(stream.connectionState.value).toBe('DISCONNECTED')
      expect(stream.lastError.value?.message).toBe(`SSE 连接失败（HTTP ${status}）`)
      expect(vi.getTimerCount()).toBe(0)
    }
  )

  it('tracks CONNECTED and RECONNECTED and inserts one gap only after a live connection drops', async () => {
    vi.useFakeTimers()
    const { connector, sessions } = createConnector()
    const stream = useDeviceEvidenceStream({ connector, initialRetryDelayMs: 100 })

    stream.connect()
    expect(stream.connectionState.value).toBe('CONNECTING')
    sessions[0]?.options.onOpen?.()
    expect(stream.connectionState.value).toBe('CONNECTED')

    sessions[0]?.reject(new Error('socket closed'))
    await flushPromises()
    expect(stream.rows.value).toHaveLength(1)
    expect(stream.rows.value[0]?.gap).toBe(true)

    await vi.advanceTimersByTimeAsync(100)
    sessions[1]?.options.onOpen?.()
    expect(stream.connectionState.value).toBe('RECONNECTED')

    sessions[1]?.reject(new Error('socket closed again'))
    await flushPromises()
    expect(stream.rows.value.filter(row => row.gap)).toHaveLength(2)
    stream.disconnect()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('does not insert a gap for first-connect failure, manual disconnect or filter replacement', async () => {
    vi.useFakeTimers()
    const { connector, sessions } = createConnector()
    const stream = useDeviceEvidenceStream({ connector, initialRetryDelayMs: 100 })

    stream.connect()
    sessions[0]?.reject(new Error('unreachable'))
    await flushPromises()
    expect(stream.rows.value).toHaveLength(0)

    stream.setFilters({ device_code: 'ARM-02', kind: 'DEVICE_EVENT' })
    await flushPromises()
    const latest = sessions.at(-1)
    expect(latest?.options.filters).toEqual({ device_code: 'ARM-02', kind: 'DEVICE_EVENT' })
    latest?.options.onOpen?.()
    stream.disconnect()
    expect(stream.rows.value).toHaveLength(0)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('keeps attempt payload and applies updates to every in-memory row with the same evidence id', async () => {
    const { connector, sessions } = createConnector()
    const stream = useDeviceEvidenceStream({ connector })
    stream.connect()
    const active = sessions[0]

    active?.options.onEvent(attempt(1))
    active?.options.onEvent({
      ...attempt(2),
      payload: { ...attempt(2).payload, evidence_id: 1, request_id: 'request-duplicate' }
    } as DeviceEvidenceStreamEvent)
    active?.options.onEvent({
      type: 'device_evidence.updated',
      payload: {
        evidence_id: 1,
        kind: 'DEVICE_RESULT',
        source_event_id: 'source-1',
        device_code: 'ARM-01',
        command_code: 'CMD-1',
        event_type: null,
        apply_status: 'APPLIED',
        processed_at: '2026-08-23T08:00:01Z'
      }
    })

    expect(stream.rows.value).toHaveLength(2)
    expect(stream.rows.value.every(row => row.latestUpdate?.apply_status === 'APPLIED')).toBe(true)
    expect(stream.rows.value[0]?.attempt?.raw_payload).toEqual({ index: 1 })
    stream.disconnect()
  })

  it('creates a payload-free row for an unmatched update', () => {
    const { connector, sessions } = createConnector()
    const stream = useDeviceEvidenceStream({ connector })
    stream.connect()

    sessions[0]?.options.onEvent({
      type: 'device_evidence.updated',
      payload: {
        evidence_id: 99,
        kind: 'DEVICE_EVENT',
        source_event_id: 'source-99',
        device_code: 'ARM-99',
        command_code: null,
        event_type: 'ARRIVED',
        apply_status: 'IGNORED',
        processed_at: '2026-08-23T08:00:01Z'
      }
    })

    expect(stream.rows.value).toMatchObject([
      { evidenceId: 99, payloadBytes: 0, attempt: null, gap: false }
    ])
    stream.disconnect()
  })

  it('evicts oldest rows beyond 200 rows or 16 MiB and clear keeps the connection alive', () => {
    const { connector, sessions } = createConnector()
    const stream = useDeviceEvidenceStream({ connector })
    stream.connect()
    const active = sessions[0]

    for (let index = 1; index <= 201; index += 1) {
      active?.options.onEvent(attempt(index))
    }
    expect(stream.rows.value).toHaveLength(200)
    expect(stream.rows.value[0]?.requestId).toBe('request-2')

    stream.clear()
    active?.options.onEvent(attempt(301, 10 * 1024 * 1024))
    active?.options.onEvent(attempt(302, 10 * 1024 * 1024))
    expect(stream.rows.value).toHaveLength(1)
    expect(stream.rows.value[0]?.requestId).toBe('request-302')
    expect(stream.totalPayloadBytes.value).toBe(10 * 1024 * 1024)

    stream.clear()
    expect(stream.rows.value).toHaveLength(0)
    expect(active?.options.signal.aborted).toBe(false)
    stream.disconnect()
  })
})
