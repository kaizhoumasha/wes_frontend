export const ESTOPPED_RUNTIME_STATUS = 'ESTOPPED'
export const STOPPED_RUNTIME_STATUS = 'STOPPED'
export const READY_RUNTIME_STATUS = 'READY'
export const RECONCILING_RUNTIME_STATUS = 'RECONCILING'
export const WORKLINE_START_REQUESTED_EVENT_TYPE = 'WORKLINE_START_REQUESTED'

export const RESERVED_RUNTIME_EVENT_TYPES = new Set([
  'ESTOP_PRESSED',
  WORKLINE_START_REQUESTED_EVENT_TYPE
])

export const SAFETY_LOCKED_REASON = '工作线处于软件急停冻结，已禁止发送 Event、ACK 和 Result。'
export const WORKLINE_STOPPED_REASON = '工作线未 START，等待现场硬件 START'

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
