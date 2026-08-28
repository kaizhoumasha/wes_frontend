import {
  consumeAuthenticatedSse,
  type AuthenticatedSseDependencies
} from '@/api/streaming/authenticatedSseStream'

type TransportTaskKind = 'RACK_MOVE' | 'RACK_ROTATE' | 'BIN_MOVE' | 'BIN_EXCHANGE'
type TransportTaskStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'RECONCILING'

export interface TransportIngressAttemptEvent {
  request_id: string
  operation_id: string | null
  operation: string | null
  transport_task_id: string | null
  kind: TransportTaskKind | null
  outcome_revision: number | null
  received_at: string
  disposition: 'RECEIVED' | 'DUPLICATE' | 'CONFLICT' | 'REJECTED' | 'UNAVAILABLE'
  status_code: number
  error_code: string | null
  observed_body_bytes: number
}

export interface TransportEvidenceUpdatedEvent {
  evidence_id: number
  operation_id: string
  operation: string
  transport_task_id: string
  outcome_revision: number | null
  status: 'APPLIED' | 'CONFLICT'
  conflict_code: string | null
  task_status: TransportTaskStatus | null
  reason_code: string | null
  processed_at: string
}

export type TransportEvidenceStreamEvent =
  | { type: 'transport_ingress.attempted'; payload: TransportIngressAttemptEvent }
  | { type: 'transport_evidence.updated'; payload: TransportEvidenceUpdatedEvent }

export interface TransportEvidenceStreamOptions {
  signal: AbortSignal
  onOpen?: () => void
  onEvent: (event: TransportEvidenceStreamEvent) => void
  baseUrl?: string
}

export async function consumeTransportEvidenceStream(
  options: TransportEvidenceStreamOptions,
  dependencies?: AuthenticatedSseDependencies
): Promise<void> {
  await consumeAuthenticatedSse(
    {
      path: '/api/v1/transport/evidences/stream',
      signal: options.signal,
      parseEvent: parseTransportEvidenceEvent,
      onOpen: options.onOpen,
      onEvent: options.onEvent,
      baseUrl: options.baseUrl
    },
    dependencies
  )
}

function parseTransportEvidenceEvent(
  eventType: string,
  payload: unknown
): TransportEvidenceStreamEvent | null {
  if (eventType === 'transport_ingress.attempted' && isIngressAttempt(payload)) {
    return { type: eventType, payload }
  }
  if (eventType === 'transport_evidence.updated' && isEvidenceUpdate(payload)) {
    return { type: eventType, payload }
  }
  return null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isIngressAttempt(value: unknown): value is TransportIngressAttemptEvent {
  return (
    isRecord(value) &&
    typeof value.request_id === 'string' &&
    typeof value.received_at === 'string' &&
    typeof value.disposition === 'string' &&
    typeof value.status_code === 'number' &&
    typeof value.observed_body_bytes === 'number'
  )
}

function isEvidenceUpdate(value: unknown): value is TransportEvidenceUpdatedEvent {
  return (
    isRecord(value) &&
    typeof value.evidence_id === 'number' &&
    typeof value.operation_id === 'string' &&
    typeof value.operation === 'string' &&
    typeof value.transport_task_id === 'string' &&
    (value.status === 'APPLIED' || value.status === 'CONFLICT') &&
    typeof value.processed_at === 'string'
  )
}
