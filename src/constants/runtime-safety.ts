export const ESTOPPED_RUNTIME_STATUS = 'ESTOPPED'
export const RECONCILING_RUNTIME_STATUS = 'RECONCILING'

export const RESERVED_SAFETY_EVENT_TYPES = new Set(['ESTOP_PRESSED'])

export const SAFETY_LOCKED_REASON = '工作线处于软件急停冻结，已禁止发送 Event、ACK 和 Result。'

export const SAFETY_EVIDENCE_STALE_MS = 15_000

export const ALLOWED_RUNTIME_EVENT_DOMAINS = new Set([
  'workline_trace',
  'workline',
  'device',
  'outbox',
  'command',
  'workline_safety',
  'safety'
])
