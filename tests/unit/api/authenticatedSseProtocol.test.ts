import { expect, it, vi } from 'vitest'
import {
  AuthenticatedSseProtocolError,
  consumeAuthenticatedSse
} from '@/api/streaming/authenticatedSseStream'

it('显式协议错误取消开放中的底层流并保留错误', async () => {
  const cancel = vi.fn()
  const failure = new AuthenticatedSseProtocolError('invalid event')
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new TextEncoder().encode('event: sample\ndata: {}\n\n'))
    },
    cancel
  })
  const onEvent = vi.fn()
  await expect(
    consumeAuthenticatedSse(
      {
        path: '/stream',
        baseUrl: 'http://localhost',
        signal: new AbortController().signal,
        parseEvent: () => {
          throw failure
        },
        onEvent
      },
      {
        fetchImpl: vi
          .fn()
          .mockResolvedValue(
            new Response(body, { headers: { 'Content-Type': 'text/event-stream' } })
          ),
        getAccessToken: () => null,
        refreshAccessToken: vi.fn()
      }
    )
  ).rejects.toBe(failure)
  expect(cancel).toHaveBeenCalledExactlyOnceWith(failure)
  expect(body.locked).toBe(false)
  expect(onEvent).not.toHaveBeenCalled()
}, 500)
