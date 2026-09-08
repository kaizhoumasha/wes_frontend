import { describe, expect, it } from 'vitest'
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
  it('未知事件忽略，已知事件的错误结构或超大报文明确失败', () => {
    expect(parseWmsDiagnosticsEvent('other', {})).toBeNull()
    expect(() => parseWmsDiagnosticsEvent('wms_exchange.completed', {})).toThrow()
    expect(() =>
      parseWmsDiagnosticsEvent('wms_exchange.started', { ...payload, extra: 'x'.repeat(32768) })
    ).toThrow()
  })
})
