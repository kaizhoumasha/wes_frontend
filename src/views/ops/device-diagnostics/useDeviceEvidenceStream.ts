import { computed, getCurrentScope, onScopeDispose, ref } from 'vue'
import {
  consumeDeviceEvidenceStream,
  DeviceEvidenceStreamHttpError,
  type DeviceEvidenceStreamEvent,
  type DeviceEvidenceStreamOptions,
  type DeviceEvidenceUpdatedEvent,
  type DeviceIngressAttemptEvent
} from '@/api/streaming/deviceEvidenceStream'
import type { StreamQuery } from '@/api/modules/device'

export type DeviceEvidenceConnectionState =
  | 'DISCONNECTED'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'RECONNECTED'

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
const MAX_RETRY_DELAY_MS = 10_000

export function useDeviceEvidenceStream(options: UseDeviceEvidenceStreamOptions = {}) {
  const connector = options.connector ?? consumeDeviceEvidenceStream
  const initialRetryDelayMs = options.initialRetryDelayMs ?? 500
  const rows = ref<DeviceEvidenceRow[]>([])
  const filters = ref<StreamQuery>({})
  const connectionState = ref<DeviceEvidenceConnectionState>('DISCONNECTED')
  const lastError = ref<Error | null>(null)
  const totalPayloadBytes = ref(0)
  let controller: AbortController | null = null
  let runGeneration = 0
  let rowSequence = 0

  function connect(): void {
    stopCurrentRun()
    const currentGeneration = ++runGeneration
    controller = new AbortController()
    connectionState.value = 'CONNECTING'
    lastError.value = null
    void runConnectionLoop(currentGeneration, controller, { ...filters.value })
  }

  function reconnect(): void {
    connect()
  }

  function disconnect(): void {
    stopCurrentRun()
    connectionState.value = 'DISCONNECTED'
  }

  function setFilters(nextFilters: StreamQuery): void {
    filters.value = { ...nextFilters }
    connect()
  }

  function clear(): void {
    rows.value = []
    totalPayloadBytes.value = 0
  }

  function stopCurrentRun(): void {
    runGeneration += 1
    controller?.abort()
    controller = null
  }

  async function runConnectionLoop(
    generation: number,
    activeController: AbortController,
    activeFilters: StreamQuery
  ): Promise<void> {
    let hasOpened = false
    let retryDelayMs = initialRetryDelayMs

    while (generation === runGeneration && !activeController.signal.aborted) {
      let openedThisAttempt = false
      try {
        await connector({
          filters: activeFilters,
          signal: activeController.signal,
          onOpen: () => {
            openedThisAttempt = true
            connectionState.value = hasOpened ? 'RECONNECTED' : 'CONNECTED'
            hasOpened = true
            lastError.value = null
            retryDelayMs = initialRetryDelayMs
          },
          onEvent: applyEvent
        })
      } catch (error) {
        if (activeController.signal.aborted || generation !== runGeneration) {
          return
        }
        const normalizedError = error instanceof Error ? error : new Error(String(error))
        lastError.value = normalizedError
        if (
          normalizedError instanceof DeviceEvidenceStreamHttpError &&
          (normalizedError.status === 401 || normalizedError.status === 403)
        ) {
          connectionState.value = 'DISCONNECTED'
          return
        }
      }

      if (activeController.signal.aborted || generation !== runGeneration) {
        return
      }
      if (openedThisAttempt) {
        appendRow({
          rowKey: `gap-${++rowSequence}`,
          requestId: null,
          evidenceId: null,
          gap: true,
          payloadBytes: 0,
          attempt: null,
          latestUpdate: null
        })
      }
      connectionState.value = 'CONNECTING'

      try {
        await waitForRetry(retryDelayMs, activeController.signal)
      } catch {
        return
      }
      retryDelayMs = Math.min(retryDelayMs * 2, MAX_RETRY_DELAY_MS)
    }
  }

  function applyEvent(event: DeviceEvidenceStreamEvent): void {
    if (event.type === 'device_ingress.attempted') {
      appendRow({
        rowKey: `attempt-${event.payload.request_id}-${++rowSequence}`,
        requestId: event.payload.request_id,
        evidenceId: event.payload.evidence_id,
        gap: false,
        payloadBytes: Math.max(0, event.payload.observed_body_bytes),
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
    onScopeDispose(disconnect)
  }

  return {
    rows,
    filters,
    connectionState,
    lastError,
    totalPayloadBytes: computed(() => totalPayloadBytes.value),
    connect,
    reconnect,
    disconnect,
    setFilters,
    clear
  }
}

function waitForRetry(delayMs: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      signal.removeEventListener('abort', abort)
      resolve()
    }, delayMs)
    const abort = () => {
      window.clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    }
    signal.addEventListener('abort', abort, { once: true })
  })
}
