import {
  consumeAuthenticatedSse,
  type AuthenticatedSseDependencies
} from '@/api/streaming/authenticatedSseStream'

const STATUSES = new Set(['RUNNING', 'NEEDS_ATTENTION', 'COMPLETED', 'FAILED', 'ABORTED'])

export interface TransportDebugRunUpdatedEvent {
  type: 'transport_debug_run.updated'
  payload: {
    run_id: string
    version: number
    status: 'RUNNING' | 'NEEDS_ATTENTION' | 'COMPLETED' | 'FAILED' | 'ABORTED'
    updated_at: string
  }
}

export interface TransportDebugRunStreamOptions {
  signal: AbortSignal
  onOpen?: () => void
  onEvent: (event: TransportDebugRunUpdatedEvent) => void
  baseUrl?: string
}

export async function consumeTransportDebugRunStream(
  options: TransportDebugRunStreamOptions,
  dependencies?: AuthenticatedSseDependencies
): Promise<void> {
  await consumeAuthenticatedSse({
    path: '/api/v1/transport/debug-runs/stream', signal: options.signal,
    parseEvent: parseTransportDebugRunEvent, onOpen: options.onOpen,
    onEvent: options.onEvent, baseUrl: options.baseUrl
  }, dependencies)
}

function parseTransportDebugRunEvent(eventType: string, value: unknown): TransportDebugRunUpdatedEvent | null {
  if (eventType !== 'transport_debug_run.updated' || !isRecord(value)) return null
  if (typeof value.run_id !== 'string' || !value.run_id) return null
  if (!Number.isInteger(value.version) || (value.version as number) < 1) return null
  if (typeof value.status !== 'string' || !STATUSES.has(value.status)) return null
  if (typeof value.updated_at !== 'string') return null
  return { type: eventType, payload: value as TransportDebugRunUpdatedEvent['payload'] }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
