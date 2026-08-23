import { describe, expect, it, vi } from 'vitest'
import {
  DeviceEvidenceStreamHttpError,
  DeviceEvidenceStreamProtocolError,
  consumeDeviceEvidenceStream,
  type DeviceEvidenceStreamEvent
} from '@/api/streaming/deviceEvidenceStream'

function responseFromChunks(chunks: string[], status = 200): Response {
  const encoder = new TextEncoder()
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk))
      }
      controller.close()
    }
  })
  return new Response(body, { status })
}

const ATTEMPT = {
  request_id: '019f12d0-58d7-7b4d-a23a-1b90aa5d4471',
  kind: 'DEVICE_RESULT',
  path: '/api/v1/callback/result',
  received_at: '2026-08-23T08:00:00Z',
  disposition: 'ACCEPTED',
  status_code: 200,
  evidence_id: 1,
  source_event_id: 'RESULT:CMD-001',
  device_code: 'ARM-01',
  command_code: 'CMD-001',
  event_type: null,
  apply_status: 'PENDING',
  error_code: null,
  observed_body_bytes: 128,
  raw_payload: { command_code: 'CMD-001' }
} as const

describe('consumeDeviceEvidenceStream', () => {
  it('parses LF/CRLF, chunk boundaries, multiple frames, multiline data and heartbeat', async () => {
    const events: DeviceEvidenceStreamEvent[] = []
    const update = {
      evidence_id: 1,
      kind: 'DEVICE_RESULT',
      source_event_id: 'RESULT:CMD-001',
      device_code: 'ARM-01',
      command_code: 'CMD-001',
      event_type: null,
      apply_status: 'APPLIED',
      processed_at: '2026-08-23T08:00:01Z'
    }
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(
        responseFromChunks([
          ': heartbeat\r\n\r\nevent: device_ingress.at',
          `tempted\r\ndata: ${JSON.stringify(ATTEMPT)}\r\n\r\n`,
          'event: device_evidence.updated\ndata: {"evidence_id":1,"kind":"DEVICE_RESULT",\n',
          `data: ${JSON.stringify(update).slice('{"evidence_id":1,"kind":"DEVICE_RESULT",'.length)}\n\n`,
          'event: unknown\ndata: {}\n\nevent: device_ingress.attempted\ndata: not-json\n\n'
        ])
      )

    await consumeDeviceEvidenceStream(
      {
        baseUrl: 'http://wes.test',
        filters: {},
        signal: new AbortController().signal,
        onEvent: event => events.push(event)
      },
      {
        fetchImpl,
        getAccessToken: () => 'secret-token',
        refreshAccessToken: vi.fn()
      }
    )

    expect(events).toEqual([
      { type: 'device_ingress.attempted', payload: ATTEMPT },
      { type: 'device_evidence.updated', payload: update }
    ])
  })

  it('encodes filters and sends the token only in the Authorization header', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(responseFromChunks([]))

    await consumeDeviceEvidenceStream(
      {
        baseUrl: 'http://wes.test/base/',
        filters: {
          device_code: 'ARM 01',
          kind: 'DEVICE_EVENT',
          command_code: 'CMD/01',
          apply_status: 'RECONCILING'
        },
        signal: new AbortController().signal,
        onEvent: vi.fn()
      },
      {
        fetchImpl,
        getAccessToken: () => 'secret-token',
        refreshAccessToken: vi.fn()
      }
    )

    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit]
    expect(url).toBe(
      'http://wes.test/api/v1/device/evidences/stream?device_code=ARM+01&kind=DEVICE_EVENT&command_code=CMD%2F01&apply_status=RECONCILING'
    )
    expect(url).not.toContain('secret-token')
    expect(init.headers).toEqual({ Authorization: 'Bearer secret-token' })
    expect(init.credentials).toBe('include')
  })

  it('refreshes once after the first 401 and never loops on the second 401', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(responseFromChunks([], 401))
      .mockResolvedValueOnce(responseFromChunks([], 401))
    const refreshAccessToken = vi.fn().mockResolvedValue('new-token')

    const promise = consumeDeviceEvidenceStream(
      {
        baseUrl: 'http://wes.test',
        filters: {},
        signal: new AbortController().signal,
        onEvent: vi.fn()
      },
      {
        fetchImpl,
        getAccessToken: () => 'old-token',
        refreshAccessToken
      }
    )

    await expect(promise).rejects.toEqual(new DeviceEvidenceStreamHttpError(401))
    expect(refreshAccessToken).toHaveBeenCalledTimes(1)
    expect(fetchImpl).toHaveBeenCalledTimes(2)
    expect((fetchImpl.mock.calls[1]?.[1] as RequestInit).headers).toEqual({
      Authorization: 'Bearer new-token'
    })
  })

  it('reports non-2xx without leaking URL or token', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(responseFromChunks([], 503))

    const promise = consumeDeviceEvidenceStream(
      {
        baseUrl: 'http://wes.test',
        filters: {},
        signal: new AbortController().signal,
        onEvent: vi.fn()
      },
      {
        fetchImpl,
        getAccessToken: () => 'secret-token',
        refreshAccessToken: vi.fn()
      }
    )

    await expect(promise).rejects.toMatchObject({ status: 503 })
    await expect(promise).rejects.not.toThrow(/secret-token|wes\.test/)
  })

  it('does not refresh an aborted request', async () => {
    const controller = new AbortController()
    controller.abort()
    const refreshAccessToken = vi.fn()
    const fetchImpl = vi.fn().mockRejectedValue(new DOMException('Aborted', 'AbortError'))

    await expect(
      consumeDeviceEvidenceStream(
        {
          baseUrl: 'http://wes.test',
          filters: {},
          signal: controller.signal,
          onEvent: vi.fn()
        },
        { fetchImpl, getAccessToken: () => 'secret-token', refreshAccessToken }
      )
    ).rejects.toMatchObject({ name: 'AbortError' })
    expect(refreshAccessToken).not.toHaveBeenCalled()
  })

  it('cancels an unterminated frame that exceeds the protocol buffer limit', async () => {
    const cancel = vi.fn()
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array(512 * 1024 + 1))
      },
      cancel
    })
    const fetchImpl = vi.fn().mockResolvedValue(new Response(body, { status: 200 }))

    const promise = consumeDeviceEvidenceStream(
      {
        baseUrl: 'http://wes.test',
        filters: {},
        signal: new AbortController().signal,
        onEvent: vi.fn()
      },
      { fetchImpl, getAccessToken: () => 'secret-token', refreshAccessToken: vi.fn() }
    )

    await expect(promise).rejects.toBeInstanceOf(DeviceEvidenceStreamProtocolError)
    expect(cancel).toHaveBeenCalledOnce()
  })

  it('rejects invalid UTF-8 before it can reduce the incomplete-frame byte count', async () => {
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array([0xff, 0x0a, 0x0a]))
        controller.enqueue(new Uint8Array(512 * 1024 + 1))
        controller.close()
      }
    })
    const fetchImpl = vi.fn().mockResolvedValue(new Response(body, { status: 200 }))

    const promise = consumeDeviceEvidenceStream(
      {
        baseUrl: 'http://wes.test',
        filters: {},
        signal: new AbortController().signal,
        onEvent: vi.fn()
      },
      { fetchImpl, getAccessToken: () => 'secret-token', refreshAccessToken: vi.fn() }
    )

    await expect(promise).rejects.toBeInstanceOf(DeviceEvidenceStreamProtocolError)
  })
})
