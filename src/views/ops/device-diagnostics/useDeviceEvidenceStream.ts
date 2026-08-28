import { computed, getCurrentScope, onScopeDispose, ref } from 'vue'
import {
  consumeDeviceEvidenceStream,
  type DeviceEvidenceStreamEvent,
  type DeviceEvidenceStreamOptions,
  type DeviceEvidenceUpdatedEvent,
  type DeviceIngressAttemptEvent
} from '@/api/streaming/deviceEvidenceStream'
import {
  createAuthenticatedSseConnection,
  type AuthenticatedSseConnectionState
} from '@/api/streaming/authenticatedSseStream'
import type { StreamQuery } from '@/api/modules/device'

export type DeviceEvidenceConnectionState = AuthenticatedSseConnectionState

export interface DeviceEvidenceRow {
  rowKey: string
  requestId: string | null
  evidenceId: number | null
  gap: boolean
  payloadBytes: number
  attempt: DeviceIngressAttemptEvent | null
  latestUpdate: DeviceEvidenceUpdatedEvent | null
}

interface UseDeviceEvidenceStreamOptions {
  connector?: (options: DeviceEvidenceStreamOptions) => Promise<void>
  initialRetryDelayMs?: number
}

const MAX_ROWS = 200
const MAX_PAYLOAD_BYTES = 16 * 1024 * 1024
const PAYLOAD_ENCODER = new TextEncoder()

export function useDeviceEvidenceStream(options: UseDeviceEvidenceStreamOptions = {}) {
  const connector = options.connector ?? consumeDeviceEvidenceStream
  const initialRetryDelayMs = options.initialRetryDelayMs ?? 500
  const rows = ref<DeviceEvidenceRow[]>([])
  const filters = ref<StreamQuery>({})
  const connectionState = ref<DeviceEvidenceConnectionState>('DISCONNECTED')
  const lastError = ref<Error | null>(null)
  const totalPayloadBytes = ref(0)
  let rowSequence = 0

  const connection = createAuthenticatedSseConnection({
    connector: ({ signal, onOpen }) =>
      connector({ filters: { ...filters.value }, signal, onOpen, onEvent: applyEvent }),
    initialRetryDelayMs,
    onStateChange: state => {
      connectionState.value = state
    },
    onError: error => {
      lastError.value = error
    },
    onGap: () =>
      appendRow({
        rowKey: `gap-${++rowSequence}`,
        requestId: null,
        evidenceId: null,
        gap: true,
        payloadBytes: 0,
        attempt: null,
        latestUpdate: null
      })
  })

  function setFilters(nextFilters: StreamQuery): void {
    filters.value = { ...nextFilters }
    connection.connect()
  }

  function clear(): void {
    rows.value = []
    totalPayloadBytes.value = 0
  }

  function applyEvent(event: DeviceEvidenceStreamEvent): void {
    if (event.type === 'device_ingress.attempted') {
      appendRow({
        rowKey: `attempt-${event.payload.request_id}-${++rowSequence}`,
        requestId: event.payload.request_id,
        evidenceId: event.payload.evidence_id,
        gap: false,
        payloadBytes: serializedPayloadBytes(event.payload.raw_payload),
        attempt: event.payload,
        latestUpdate: null
      })
      return
    }

    let matched = false
    rows.value = rows.value.map(row => {
      if (!row.gap && row.evidenceId === event.payload.evidence_id) {
        matched = true
        return { ...row, latestUpdate: event.payload }
      }
      return row
    })
    if (!matched) {
      appendRow({
        rowKey: `update-${event.payload.evidence_id}-${++rowSequence}`,
        requestId: null,
        evidenceId: event.payload.evidence_id,
        gap: false,
        payloadBytes: 0,
        attempt: null,
        latestUpdate: event.payload
      })
    }
  }

  function appendRow(row: DeviceEvidenceRow): void {
    rows.value.push(row)
    totalPayloadBytes.value += row.payloadBytes
    while (rows.value.length > MAX_ROWS || totalPayloadBytes.value > MAX_PAYLOAD_BYTES) {
      const removed = rows.value.shift()
      totalPayloadBytes.value -= removed?.payloadBytes ?? 0
    }
  }

  if (getCurrentScope()) {
    onScopeDispose(connection.disconnect)
  }

  return {
    rows,
    filters,
    connectionState,
    lastError,
    totalPayloadBytes: computed(() => totalPayloadBytes.value),
    connect: connection.connect,
    reconnect: connection.reconnect,
    disconnect: connection.disconnect,
    setFilters,
    clear
  }
}

function serializedPayloadBytes(payload: Record<string, unknown> | null): number {
  return payload === null ? 0 : PAYLOAD_ENCODER.encode(JSON.stringify(payload)).byteLength
}
