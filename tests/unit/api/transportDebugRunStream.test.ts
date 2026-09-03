import { describe, expect, it, vi } from 'vitest'
import { consumeTransportDebugRunStream } from '@/api/streaming/transportDebugRunStream'

function response(body: string): Response {
  return new Response(body, { status: 200, headers: { 'Content-Type': 'text/event-stream' } })
}

describe('consumeTransportDebugRunStream', () => {
  it('accepts only the strict persisted-run invalidation event', async () => {
    const events: unknown[] = []
    const valid = { run_id: 'run-1', version: 3, status: 'RUNNING', updated_at: '2026-09-03T00:00:00Z' }
    const fetchImpl = vi.fn().mockResolvedValue(response(
      `event: transport_debug_run.updated\ndata: ${JSON.stringify(valid)}\n\n` +
      `event: transport_debug_run.updated\ndata: ${JSON.stringify({ ...valid, status: 'UNKNOWN' })}\n\n`
    ))
    await consumeTransportDebugRunStream({
      baseUrl: 'http://wes.test', signal: new AbortController().signal, onEvent: event => events.push(event)
    }, { fetchImpl, getAccessToken: () => 'token', refreshAccessToken: vi.fn() })
    expect(events).toEqual([{ type: 'transport_debug_run.updated', payload: valid }])
  })
})
