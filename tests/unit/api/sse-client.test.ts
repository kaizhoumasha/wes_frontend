import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

function createSSEStreamResponse(chunks: string[]) {
  const encoder = new TextEncoder()

  return {
    ok: true,
    status: 200,
    body: new ReadableStream<Uint8Array>({
      start(controller) {
        chunks.forEach(chunk => {
          controller.enqueue(encoder.encode(chunk))
        })
        controller.close()
      }
    })
  }
}

describe('sse-client', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(async () => {
    const sse = await import('@/api/services/sse-client')
    sse.resetSSESession()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('reuses the last SSE event id after reconnecting from a manual disconnect', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(createSSEStreamResponse(['id: 41\nevent: business_status\ndata: {"ok":true}\n\n']))
      .mockResolvedValueOnce(createSSEStreamResponse(['event: business_status\ndata: {"ok":true}\n\n']))

    vi.stubGlobal('fetch', fetchMock)

    vi.doMock('@/config/env', () => ({
      env: {
        sseUrl: 'http://example.com/api/v1/sys/events/stream'
      }
    }))

    vi.doMock('@/api/services/token-refresh', () => ({
      getAccessToken: () => 'token-123'
    }))

    const sse = await import('@/api/services/sse-client')

    sse.connect()

    await vi.waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1)
      expect(sse.getConnectionState()).toBe('error')
    })

    sse.disconnect()
    sse.connect()

    await vi.waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2)
    })

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'http://example.com/api/v1/sys/events/stream',
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: 'text/event-stream',
          Authorization: 'Bearer token-123',
          'Cache-Control': 'no-cache',
          'Last-Event-ID': '41'
        })
      })
    )
  })

  it('clears the replay cursor when resetting the SSE session', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(createSSEStreamResponse(['id: 41\nevent: business_status\ndata: {"ok":true}\n\n']))
      .mockResolvedValueOnce(createSSEStreamResponse(['event: business_status\ndata: {"ok":true}\n\n']))

    vi.stubGlobal('fetch', fetchMock)

    vi.doMock('@/config/env', () => ({
      env: {
        sseUrl: 'http://example.com/api/v1/sys/events/stream'
      }
    }))

    vi.doMock('@/api/services/token-refresh', () => ({
      getAccessToken: () => 'token-123'
    }))

    const sse = await import('@/api/services/sse-client')

    sse.connect()

    await vi.waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1)
      expect(sse.getConnectionState()).toBe('error')
    })

    sse.resetSSESession()
    sse.connect()

    await vi.waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2)
    })

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'http://example.com/api/v1/sys/events/stream',
      expect.objectContaining({
        headers: expect.not.objectContaining({
          'Last-Event-ID': '41'
        })
      })
    )
  })

  it('treats an empty sseUrl as a same-origin path instead of localhost fallback', async () => {
    vi.doMock('@/config/env', () => ({
      env: {
        sseUrl: ''
      }
    }))

    vi.doMock('@/api/services/token-refresh', () => ({
      getAccessToken: () => null
    }))

    const sse = await import('@/api/services/sse-client')

    expect(sse.getSSEUrl()).toBe(new URL('/api/v1/sys/events/stream', window.location.origin).toString())
  })
})
