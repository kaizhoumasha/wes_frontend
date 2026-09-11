import { effectScope } from 'vue'
import { flushPromises } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type {
  DeviceEvidenceStreamEvent,
  DeviceEvidenceStreamOptions,
  DeviceIngressAttemptEvent
} from '@/api/streaming/deviceEvidenceStream'
import { consumeDeviceEvidenceStream } from '@/api/streaming/deviceEvidenceStream'
import { useDeviceEvidenceStream } from '@/views/ops/device-diagnostics/useDeviceEvidenceStream'

const historyMethod = vi.hoisted(() =>
  vi.fn(() => ({ send: async () => ({ items: [], next_cursor: null }) }))
)

vi.mock('@/api/modules/device', () => ({
  deviceApiMethods: { history: historyMethod }
}))

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

function attempt(index: number, bytes = 128, rawText?: string): DeviceEvidenceStreamEvent {
  const payload: DeviceIngressAttemptEvent = {
    request_id: `request-${index}`,
    kind: index % 2 ? 'DEVICE_RESULT' : 'DEVICE_EVENT',
    path: index % 2 ? '/api/v1/callback/result' : '/api/v1/callback/event',
    received_at: new Date(Date.UTC(2026, 7, 23, 8, 0, index)).toISOString(),
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
    raw_payload: rawText === undefined ? { index } : { index, text: rawText }
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
    // A successful history reload replaces the previous gap; the new drop adds one.
    expect(stream.rows.value.filter(row => row.gap)).toHaveLength(1)
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
    expect(
      stream.rows.value.find(row => row.requestId === 'request-1')?.attempt?.raw_payload
    ).toEqual({ index: 1 })
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

  it('orders internal observations by observed_at when processed_at is absent', () => {
    const { connector, sessions } = createConnector()
    const stream = useDeviceEvidenceStream({ connector })
    stream.connect()

    sessions[0]?.options.onEvent({
      type: 'device_evidence.updated',
      payload: {
        evidence_id: 100,
        kind: 'DEVICE_OBSERVATION',
        source_event_id: 'OBSERVATION:CMD-100',
        device_code: 'ARM-100',
        command_code: 'CMD-100',
        event_type: null,
        observation: 'NOT_ACCEPTED',
        reason_code: 'DELIVERY_REJECTED',
        observed_at: '2026-08-23T08:00:01Z',
        apply_status: 'PENDING',
        processed_at: null
      }
    })
    sessions[0]?.options.onEvent({
      type: 'device_evidence.updated',
      payload: {
        evidence_id: 100,
        kind: 'DEVICE_OBSERVATION',
        source_event_id: 'OBSERVATION:CMD-100',
        device_code: 'ARM-100',
        command_code: 'CMD-100',
        event_type: null,
        observation: 'RESULT_UNKNOWN',
        reason_code: 'TRANSPORT_RESULT_TIMEOUT',
        observed_at: '2026-08-23T08:00:02Z',
        apply_status: 'PENDING',
        processed_at: null
      }
    })

    expect(stream.rows.value).toMatchObject([
      {
        evidenceId: 100,
        recordedAt: '2026-08-23T08:00:02Z',
        latestUpdate: {
          observation: 'RESULT_UNKNOWN',
          reason_code: 'TRANSPORT_RESULT_TIMEOUT'
        }
      }
    ])
    stream.disconnect()
  })

  it('evicts by serialized UTF-8 payload bytes rather than observed request-body bytes', () => {
    const { connector, sessions } = createConnector()
    const stream = useDeviceEvidenceStream({ connector })
    stream.connect()
    const active = sessions[0]

    for (let index = 1; index <= 201; index += 1) {
      active?.options.onEvent(attempt(index))
    }
    expect(stream.rows.value).toHaveLength(200)
    expect(stream.rows.value[0]?.requestId).toBe('request-201')
    expect(stream.rows.value.at(-1)?.requestId).toBe('request-2')

    stream.clear()
    active?.options.onEvent(attempt(301, 10 * 1024 * 1024))
    active?.options.onEvent(attempt(302, 10 * 1024 * 1024))
    expect(stream.rows.value).toHaveLength(2)
    expect(stream.totalPayloadBytes.value).toBe(
      new TextEncoder().encode(JSON.stringify({ index: 301 })).byteLength +
        new TextEncoder().encode(JSON.stringify({ index: 302 })).byteLength
    )

    stream.clear()
    for (let index = 400; index < 500; index += 1) {
      active?.options.onEvent(attempt(index, 1, '汉'.repeat(70 * 1024)))
    }
    expect(stream.rows.value.length).toBeLessThan(100)
    expect(stream.totalPayloadBytes.value).toBeLessThanOrEqual(16 * 1024 * 1024)

    stream.clear()
    expect(stream.rows.value).toHaveLength(0)
    expect(active?.options.signal.aborted).toBe(false)
    stream.disconnect()
  })
})

function historyItem(index: number) {
  const event = attempt(index)
  return {
    row_key: `attempt:${event.payload.request_id}`,
    recorded_at: '2026-08-23T08:00:00Z',
    attempt: event.payload,
    latest_update: null
  }
}

describe('device history with live stream', () => {
  it('loads recent history on entry and merges live attempts exactly once while preserving newer status', async () => {
    const { connector, sessions } = createConnector()
    let finish!: (page: unknown) => void
    const loadHistory = vi.fn().mockImplementation(
      () =>
        new Promise(resolve => {
          finish = resolve
        })
    )
    const stream = useDeviceEvidenceStream({ connector, loadHistory })
    stream.connect()
    expect(loadHistory).toHaveBeenCalledWith({ limit: 20 })
    sessions[0]?.options.onEvent(attempt(1))
    sessions[0]?.options.onEvent({
      type: 'device_evidence.updated',
      payload: {
        evidence_id: 1,
        kind: 'DEVICE_RESULT',
        source_event_id: 'source-1',
        device_code: 'ARM-01',
        command_code: 'CMD-1',
        event_type: null,
        apply_status: 'APPLIED',
        processed_at: '2026-08-23T08:00:02Z'
      }
    })
    finish({ items: [historyItem(1), historyItem(2)], next_cursor: 'older' })
    await flushPromises()
    expect(stream.rows.value).toHaveLength(2)
    expect(
      stream.rows.value.find(row => row.requestId === 'request-1')?.latestUpdate?.apply_status
    ).toBe('APPLIED')
    expect(stream.nextCursor.value).toBe('older')
    stream.disconnect()
  })

  it('uses the cursor for older history and deduplicates overlapping pages', async () => {
    const { connector } = createConnector()
    const loadHistory = vi
      .fn()
      .mockResolvedValueOnce({ items: [historyItem(2)], next_cursor: 'older' })
      .mockResolvedValueOnce({ items: [historyItem(2), historyItem(1)], next_cursor: null })
    const stream = useDeviceEvidenceStream({ connector, loadHistory })
    await stream.loadRecent()
    await stream.loadMore()
    expect(loadHistory).toHaveBeenLastCalledWith({ limit: 20, cursor: 'older' })
    expect(stream.rows.value).toHaveLength(2)
    expect(stream.nextCursor.value).toBeNull()
  })

  it('discards old filter responses and stopped stream events after filters change', async () => {
    const { connector, sessions } = createConnector()
    let finish!: (page: unknown) => void
    const loadHistory = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise(resolve => {
            finish = resolve
          })
      )
      .mockResolvedValue({ items: [], next_cursor: null })
    const stream = useDeviceEvidenceStream({ connector, loadHistory })
    stream.connect()
    sessions[0]?.options.onEvent(attempt(1))
    stream.setFilters({ device_code: 'ARM-02' })
    sessions[0]?.options.onEvent(attempt(2))
    finish({ items: [historyItem(1)], next_cursor: 'stale' })
    await flushPromises()
    expect(stream.rows.value).toHaveLength(0)
    expect(stream.nextCursor.value).toBeNull()
    expect(loadHistory).toHaveBeenLastCalledWith({ limit: 20, device_code: 'ARM-02' })
    stream.disconnect()
  })

  it('reloads persisted history when an automatic reconnect opens', async () => {
    vi.useFakeTimers()
    const { connector, sessions } = createConnector()
    const loadHistory = vi.fn().mockResolvedValue({ items: [historyItem(1)], next_cursor: null })
    const stream = useDeviceEvidenceStream({ connector, loadHistory, initialRetryDelayMs: 100 })
    stream.connect()
    sessions[0]?.options.onOpen?.()
    await flushPromises()
    loadHistory.mockResolvedValue({ items: [historyItem(2), historyItem(1)], next_cursor: null })
    sessions[0]?.reject(new Error('network lost'))
    await flushPromises()
    await vi.advanceTimersByTimeAsync(100)
    sessions[1]?.options.onOpen?.()
    await flushPromises()
    expect(stream.rows.value.map(row => row.requestId)).toContain('request-2')
    expect(loadHistory).toHaveBeenCalledTimes(3)
    stream.disconnect()
  })

  it('does not let a pending history response repopulate cleared or unmounted rows', async () => {
    const { connector } = createConnector()
    let finish!: (page: unknown) => void
    const loadHistory = vi.fn().mockImplementation(
      () =>
        new Promise(resolve => {
          finish = resolve
        })
    )
    const scope = effectScope()
    const stream = scope.run(() => useDeviceEvidenceStream({ connector, loadHistory }))!
    stream.connect()
    stream.clear()
    finish({ items: [historyItem(1)], next_cursor: 'stale' })
    await flushPromises()
    expect(stream.rows.value).toHaveLength(0)
    stream.connect()
    scope.stop()
    finish({ items: [historyItem(2)], next_cursor: 'stale' })
    await flushPromises()
    expect(stream.rows.value).toHaveLength(0)
  })
  it('shows legacy evidence without inventing an HTTP attempt, including pending evidence', async () => {
    const loadHistory = vi.fn().mockResolvedValue({
      items: [
        {
          row_key: 'evidence:90',
          recorded_at: '2026-08-23T08:00:00Z',
          attempt: null,
          latest_update: {
            evidence_id: 90,
            kind: 'DEVICE_EVENT',
            device_code: 'ARM-01',
            source_event_id: 'legacy-90',
            command_code: null,
            event_type: 'ARRIVED',
            apply_status: 'PENDING',
            processed_at: null
          }
        }
      ],
      next_cursor: null
    })
    const stream = useDeviceEvidenceStream({ loadHistory })
    await stream.loadRecent()
    expect(stream.rows.value[0]).toMatchObject({
      requestId: null,
      attempt: null,
      recordedAt: '2026-08-23T08:00:00Z',
      latestUpdate: { apply_status: 'PENDING', processed_at: null }
    })
  })

  it('removes rows that leave a selected status even when the history snapshot is pending', async () => {
    const { connector, sessions } = createConnector()
    let finish!: (page: unknown) => void
    const loadHistory = vi.fn().mockImplementation(
      () =>
        new Promise(resolve => {
          finish = resolve
        })
    )
    const stream = useDeviceEvidenceStream({ connector, loadHistory })
    stream.setFilters({ device_code: 'ARM-01', apply_status: 'PENDING' })
    expect(sessions[0]?.options.filters).toEqual({ device_code: 'ARM-01' })
    sessions[0]?.options.onEvent(attempt(1))
    expect(stream.rows.value).toHaveLength(1)
    sessions[0]?.options.onEvent({
      type: 'device_evidence.updated',
      payload: {
        evidence_id: 1,
        kind: 'DEVICE_RESULT',
        device_code: 'ARM-01',
        source_event_id: 'source-1',
        command_code: 'CMD-1',
        event_type: null,
        apply_status: 'APPLIED',
        processed_at: '2026-08-23T08:00:02Z'
      }
    })
    finish({ items: [historyItem(1)], next_cursor: null })
    await flushPromises()
    expect(stream.rows.value).toHaveLength(0)
    stream.disconnect()
  })

  it('keeps live rows and exposes a retryable history failure', async () => {
    const { connector, sessions } = createConnector()
    const loadHistory = vi.fn().mockRejectedValue(new Error('history unavailable'))
    const stream = useDeviceEvidenceStream({ connector, loadHistory })
    stream.connect()
    sessions[0]?.options.onEvent(attempt(1))
    await flushPromises()
    expect(stream.rows.value).toHaveLength(1)
    expect(stream.historyError.value?.message).toBe('history unavailable')
    expect(stream.loadingHistory.value).toBe(false)
    loadHistory.mockResolvedValue({ items: [historyItem(1)], next_cursor: null })
    await stream.loadRecent()
    expect(stream.historyError.value).toBeNull()
    expect(stream.rows.value).toHaveLength(1)
    stream.disconnect()
  })
  it('does not share the pre-subscription HTTP request with the onOpen backfill', () => {
    const { connector, sessions } = createConnector()
    const stream = useDeviceEvidenceStream({ connector })
    stream.connect()
    sessions[0]?.options.onOpen?.()
    expect(historyMethod).toHaveBeenLastCalledWith(
      { limit: 20 },
      { cacheFor: 0, shareRequest: false }
    )
    stream.disconnect()
  })

  it('merges an update received before the HTTP attempts arrive into every matching attempt', async () => {
    const { connector, sessions } = createConnector()
    let finish!: (page: unknown) => void
    const loadHistory = vi.fn().mockImplementation(
      () =>
        new Promise(resolve => {
          finish = resolve
        })
    )
    const stream = useDeviceEvidenceStream({ connector, loadHistory })
    stream.connect()
    sessions[0]?.options.onEvent({
      type: 'device_evidence.updated',
      payload: {
        evidence_id: 1,
        kind: 'DEVICE_RESULT',
        device_code: 'ARM-01',
        source_event_id: 'source-1',
        command_code: 'CMD-1',
        event_type: null,
        apply_status: 'APPLIED',
        processed_at: '2026-08-23T08:00:02Z'
      }
    })
    const duplicate = historyItem(1)
    duplicate.row_key = 'attempt:duplicate'
    duplicate.attempt = { ...duplicate.attempt, request_id: 'duplicate' }
    finish({ items: [historyItem(1), duplicate], next_cursor: null })
    await flushPromises()
    expect(stream.rows.value).toHaveLength(2)
    expect(
      stream.rows.value.every(row => row.attempt && row.latestUpdate?.apply_status === 'APPLIED')
    ).toBe(true)
    stream.disconnect()
  })

  it('unrelated status traffic does not evict matching history or exhaust its pagination budget', async () => {
    const { connector, sessions } = createConnector()
    const loadHistory = vi.fn().mockResolvedValue({ items: [historyItem(1)], next_cursor: 'older' })
    const stream = useDeviceEvidenceStream({ connector, loadHistory })
    stream.setFilters({ apply_status: 'PENDING' })
    await flushPromises()
    for (let i = 2; i <= 250; i += 1) {
      const event = attempt(i)
      sessions[0]?.options.onEvent({
        ...event,
        payload: { ...event.payload, apply_status: 'APPLIED' }
      })
    }
    expect(stream.rows.value.map(row => row.requestId)).toEqual(['request-1'])
    expect(stream.historyLimitReached.value).toBe(false)
    await stream.loadMore()
    expect(loadHistory).toHaveBeenLastCalledWith({
      apply_status: 'PENDING',
      limit: 20,
      cursor: 'older'
    })
    stream.disconnect()
  })
})

describe('device history ordering and capacity regressions', () => {
  it('keeps a completed status when its pending attempt arrives after an idle history read', async () => {
    const { connector, sessions } = createConnector()
    const loadHistory = vi.fn().mockResolvedValue({ items: [], next_cursor: null })
    const stream = useDeviceEvidenceStream({ connector, loadHistory })
    stream.setFilters({ apply_status: 'PENDING' })
    await flushPromises()
    sessions[0]?.options.onEvent({
      type: 'device_evidence.updated',
      payload: {
        evidence_id: 1,
        kind: 'DEVICE_RESULT',
        source_event_id: 'source-1',
        device_code: 'ARM-01',
        command_code: 'CMD-1',
        event_type: null,
        apply_status: 'APPLIED',
        processed_at: '2026-08-23T08:00:02Z'
      }
    })
    sessions[0]?.options.onEvent(attempt(1))
    expect(stream.rows.value).toHaveLength(0)
    stream.disconnect()
  })

  it('caps disconnect markers when history remains unavailable', async () => {
    vi.useFakeTimers()
    const { connector, sessions } = createConnector()
    const loadHistory = vi.fn().mockRejectedValue(new Error('history unavailable'))
    const stream = useDeviceEvidenceStream({ connector, loadHistory, initialRetryDelayMs: 100 })
    stream.connect()
    sessions[0]?.options.onOpen?.()
    await flushPromises()
    for (let index = 1; index <= 200; index += 1) sessions[0]?.options.onEvent(attempt(index))
    sessions[0]?.reject(new Error('socket closed'))
    await flushPromises()
    expect(stream.rows.value).toHaveLength(200)
    expect(stream.rows.value.some(row => row.gap)).toBe(true)
    expect(stream.historyLimitReached.value).toBe(true)
    stream.disconnect()
  })
})
