import { describe, expect, it, vi } from 'vitest'
import { consumeAuthenticatedSse } from '@/api/streaming/authenticatedSseStream'
import { parseWmsDiagnosticsEvent } from '@/api/streaming/wmsDiagnosticsStream'

describe('WMS 诊断 SSE 合同', () => {
  const payload = {
    attempt_id: 'a',
    observed_at: '2026-09-08T12:00:00Z',
    direction: 'WMS_TO_WES',
    exchange_id: null
  }
  it('复用正式详情 Schema，允许当次观察尚未保存', () => {
    expect(parseWmsDiagnosticsEvent('wms_exchange.completed', payload)?.phase).toBe('completed')
    expect(
      parseWmsDiagnosticsEvent('wms_exchange.started', payload)?.exchange.exchange_id
    ).toBeNull()
  })
  it.each([{}, { ...payload, extra: 'x'.repeat(32768) }])(
    '已知事件的校验失败穿过真实帧解析器上报',
    async invalid => {
      const onEvent = vi.fn()
      const response = new Response(
        `event: wms_exchange.completed\ndata: ${JSON.stringify(invalid)}\n\n`,
        { headers: { 'Content-Type': 'text/event-stream' } }
      )
      await expect(
        consumeAuthenticatedSse(
          {
            path: '/stream',
            baseUrl: 'http://localhost',
            signal: new AbortController().signal,
            parseEvent: parseWmsDiagnosticsEvent,
            onEvent
          },
          {
            fetchImpl: vi.fn().mockResolvedValue(response),
            getAccessToken: () => null,
            refreshAccessToken: vi.fn()
          }
        )
      ).rejects.toThrow('实时流已中断')
      expect(onEvent).not.toHaveBeenCalled()
      expect(response.body?.locked).toBe(false)
    }
  )
  it('未知事件忽略，已知事件的错误结构或超大报文明确失败', () => {
    expect(parseWmsDiagnosticsEvent('other', {})).toBeNull()
    expect(() => parseWmsDiagnosticsEvent('wms_exchange.completed', {})).toThrow()
    expect(() =>
      parseWmsDiagnosticsEvent('wms_exchange.started', { ...payload, extra: 'x'.repeat(32768) })
    ).toThrow()
  })
})
