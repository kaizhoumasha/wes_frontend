import type { DebugTasksInput } from '@/api/modules/transport'
import { _DebugTransportTaskRequestSchema } from '@/types/generated/zod-schemas'

export type TransportDebugTaskKind = DebugTasksInput['kind']

export function buildTransportDebugTask(
  kind: TransportDebugTaskKind,
  dataText: string,
  clientRequestId: string,
  stationId = ''
): DebugTasksInput {
  let data: unknown
  try {
    data = JSON.parse(dataText)
  } catch {
    throw new Error('data 必须是 JSON object')
  }
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    throw new Error('data 必须是 JSON object')
  }

  const parsed = _DebugTransportTaskRequestSchema.safeParse({
    kind,
    client_request_id: clientRequestId,
    ...(stationId.trim() ? { station_id: stationId.trim() } : {}),
    data
  })
  if (!parsed.success) throw new Error('Transport 参数不符合合同')
  return parsed.data
}
