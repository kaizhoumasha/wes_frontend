import type { IntegrationRun } from '@/api/manualOutboundIntegrationApi'
import {
  consumeAuthenticatedSse,
  type AuthenticatedSseDependencies
} from '@/api/streaming/authenticatedSseStream'

export interface WorklineIntegrationDebugEvent {
  type: 'workline_integration_debug.updated'
  payload: IntegrationRun
}

export async function consumeWorklineIntegrationDebugStream(
  options: {
    signal: AbortSignal
    onOpen?: () => void
    onEvent: (event: WorklineIntegrationDebugEvent) => void
    baseUrl?: string
  },
  dependencies?: AuthenticatedSseDependencies
): Promise<void> {
  await consumeAuthenticatedSse(
    {
      path: '/api/v1/workline-integration-debug/runs/stream',
      signal: options.signal,
      onOpen: options.onOpen,
      onEvent: options.onEvent,
      baseUrl: options.baseUrl,
      parseEvent: parseWorklineIntegrationDebugEvent
    },
    dependencies
  )
}

export function parseWorklineIntegrationDebugEvent(
  eventType: string,
  value: unknown
): WorklineIntegrationDebugEvent | null {
  if (eventType !== 'workline_integration_debug.updated' || !isRecord(value)) return null
  if (typeof value.run_id !== 'string' || !Number.isInteger(value.version)) return null
  if (!Array.isArray(value.steps) || typeof value.current_phase !== 'string') return null
  return { type: eventType, payload: value as unknown as IntegrationRun }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
