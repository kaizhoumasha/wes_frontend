import { describe, expect, it, vi } from 'vitest'
import {
  consumeTransportEvidenceStream,
  type TransportEvidenceStreamEvent
} from '@/api/streaming/transportEvidenceStream'

function responseFromChunks(chunks: string[]): Response {
  const encoder = new TextEncoder()
  return new Response(
    new ReadableStream<Uint8Array>({
      start(controller) {
        for (const chunk of chunks) controller.enqueue(encoder.encode(chunk))
        controller.close()
      }
    }),
    { status: 200, headers: { 'Content-Type': 'text/event-stream' } }
  )
}

describe('consumeTransportEvidenceStream', () => {
  it('reuses authenticated SSE framing while accepting only the two Transport events', async () => {
    const events: TransportEvidenceStreamEvent[] = []
    const attempt = {
      request_id: '019f12d0-58d7-7b4d-a23a-1b90aa5d4471',
      operation_id: '019f12d0-58d7-7b4d-a23a-1b90aa5d4472',
      operation: 'transport.task.resulted@v1',
      transport_task_id: 'transport-1',
      kind: 'BIN_MOVE',
      outcome_revision: 1,
      received_at: '2026-08-28T08:00:00Z',
      disposition: 'RECEIVED',
      status_code: 202,
      error_code: null,
      observed_body_bytes: 256
    } as const
    const update = {
      evidence_id: 11,
      operation_id: attempt.operation_id,
      operation: attempt.operation,
      transport_task_id: attempt.transport_task_id,
      outcome_revision: 1,
      status: 'APPLIED',
      conflict_code: null,
      task_status: 'SUCCEEDED',
      reason_code: null,
      processed_at: '2026-08-28T08:00:01Z'
    } as const
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(
        responseFromChunks([
          `event: transport_ingress.attempted\ndata: ${JSON.stringify(attempt)}\n\n`,
          'event: unknown\ndata: {}\n\n',
          `event: transport_evidence.updated\ndata: ${JSON.stringify(update)}\n\n`
        ])
      )

    await consumeTransportEvidenceStream(
      {
        baseUrl: 'http://wes.test',
        signal: new AbortController().signal,
        onEvent: event => events.push(event)
      },
      { fetchImpl, getAccessToken: () => 'secret-token', refreshAccessToken: vi.fn() }
    )

    expect(events).toEqual([
      { type: 'transport_ingress.attempted', payload: attempt },
      { type: 'transport_evidence.updated', payload: update }
    ])
    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('http://wes.test/api/v1/transport/evidences/stream')
    expect(url).not.toContain('secret-token')
    expect(init.headers).toEqual({
      Accept: 'text/event-stream',
      Authorization: 'Bearer secret-token'
    })
  })
})
