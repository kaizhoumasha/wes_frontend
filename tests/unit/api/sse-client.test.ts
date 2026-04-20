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
    sse.disconnect()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('reuses the last SSE event id on the next connection attempt', async () => {
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
})
