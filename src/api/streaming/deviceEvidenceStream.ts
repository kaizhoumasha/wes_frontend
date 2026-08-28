import type { StreamQuery } from '@/api/modules/device'
import {
  consumeAuthenticatedSse,
  type AuthenticatedSseDependencies
} from '@/api/streaming/authenticatedSseStream'

export {
  AuthenticatedSseHttpError as DeviceEvidenceStreamHttpError,
  AuthenticatedSseProtocolError as DeviceEvidenceStreamProtocolError
} from '@/api/streaming/authenticatedSseStream'

export interface DeviceIngressAttemptEvent {
  request_id: string
  kind: 'DEVICE_RESULT' | 'DEVICE_EVENT'
  path: string
  received_at: string
  disposition: 'ACCEPTED' | 'DUPLICATE' | 'CONFLICT' | 'REJECTED'
  status_code: number
  evidence_id: number | null
  source_event_id: string | null
  device_code: string | null
  command_code: string | null
  event_type: string | null
  apply_status: string | null
  error_code: string | null
  observed_body_bytes: number
  raw_payload: Record<string, unknown> | null
}

export interface DeviceEvidenceUpdatedEvent {
  evidence_id: number
  kind: 'DEVICE_RESULT' | 'DEVICE_EVENT'
  source_event_id: string
  device_code: string
  command_code: string | null
  event_type: string | null
  apply_status: string
  processed_at: string
}

export type DeviceEvidenceStreamEvent =
  | { type: 'device_ingress.attempted'; payload: DeviceIngressAttemptEvent }
  | { type: 'device_evidence.updated'; payload: DeviceEvidenceUpdatedEvent }

export interface DeviceEvidenceStreamOptions {
  filters: StreamQuery
  signal: AbortSignal
  onOpen?: () => void
  onEvent: (event: DeviceEvidenceStreamEvent) => void
  baseUrl?: string
}

export async function consumeDeviceEvidenceStream(
  options: DeviceEvidenceStreamOptions,
  dependencies?: AuthenticatedSseDependencies
): Promise<void> {
  await consumeAuthenticatedSse(
    {
      path: '/api/v1/device/evidences/stream',
      query: options.filters,
      signal: options.signal,
      parseEvent: parseDeviceEvidenceEvent,
      onOpen: options.onOpen,
      onEvent: options.onEvent,
      baseUrl: options.baseUrl
    },
    dependencies
  )
}

function parseDeviceEvidenceEvent(
  eventType: string,
  payload: unknown
): DeviceEvidenceStreamEvent | null {
  if (eventType === 'device_ingress.attempted' && isAttempt(payload)) {
    return { type: eventType, payload }
  }
  if (eventType === 'device_evidence.updated' && isUpdate(payload)) {
    return { type: eventType, payload }
  }
  return null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isIngressKind(value: unknown): value is DeviceIngressAttemptEvent['kind'] {
  return value === 'DEVICE_RESULT' || value === 'DEVICE_EVENT'
}

function isAttempt(value: unknown): value is DeviceIngressAttemptEvent {
  return (
    isRecord(value) &&
    typeof value.request_id === 'string' &&
    isIngressKind(value.kind) &&
    typeof value.disposition === 'string' &&
    typeof value.status_code === 'number' &&
    typeof value.observed_body_bytes === 'number'
  )
}

function isUpdate(value: unknown): value is DeviceEvidenceUpdatedEvent {
  return (
    isRecord(value) &&
    typeof value.evidence_id === 'number' &&
    isIngressKind(value.kind) &&
    typeof value.source_event_id === 'string' &&
    typeof value.device_code === 'string' &&
    typeof value.apply_status === 'string' &&
    typeof value.processed_at === 'string'
  )
}
