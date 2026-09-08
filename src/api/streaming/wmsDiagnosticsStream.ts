import { z } from 'zod'
import { ExchangeDetailSchema } from '@/types/generated/zod-schemas'
import type { StreamQuery } from '@/api/modules/wmsDiagnostics'
import {
  consumeAuthenticatedSse,
  type AuthenticatedSseOptions
} from '@/api/streaming/authenticatedSseStream'

// SSE 与已保存详情使用同一内容合同；实时观察可能尚未保存。
const observationSchema = ExchangeDetailSchema.extend({ exchange_id: z.string().nullable() })
export type WmsObservation = z.infer<typeof observationSchema>
export interface WmsDiagnosticsEvent {
  phase: 'started' | 'completed'
  exchange: WmsObservation
}
export type WmsDiagnosticsStreamOptions = Pick<
  AuthenticatedSseOptions<WmsDiagnosticsEvent>,
  'signal' | 'onOpen' | 'onEvent'
> & { query?: StreamQuery }

export function parseWmsDiagnosticsEvent(
  type: string,
  payload: unknown
): WmsDiagnosticsEvent | null {
  if (type !== 'wms_exchange.started' && type !== 'wms_exchange.completed') return null
  if (new TextEncoder().encode(JSON.stringify(payload)).byteLength > 32 * 1024) {
    throw new Error('诊断事件超过 32 KiB，实时流已中断')
  }
  const result = observationSchema.safeParse(payload)
  if (!result.success) throw new Error('诊断事件不符合展示合同，实时流已中断')
  return { phase: type === 'wms_exchange.started' ? 'started' : 'completed', exchange: result.data }
}

export function consumeWmsDiagnosticsStream(options: WmsDiagnosticsStreamOptions): Promise<void> {
  return consumeAuthenticatedSse({
    ...options,
    path: '/api/v1/wms-diagnostics/exchanges/stream',
    parseEvent: parseWmsDiagnosticsEvent
  })
}
