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
import {
  deviceApiMethods,
  type HistoryQuery,
  type HistoryResult,
  type StreamQuery
} from '@/api/modules/device'

export type DeviceEvidenceConnectionState = AuthenticatedSseConnectionState

export interface DeviceEvidenceRow {
  rowKey: string
  requestId: string | null
  evidenceId: number | null
  recordedAt?: string
  gap: boolean
  payloadBytes: number
  attempt: DeviceIngressAttemptEvent | null
  latestUpdate: DeviceEvidenceUpdatedEvent | null
}

interface UseDeviceEvidenceStreamOptions {
  connector?: (options: DeviceEvidenceStreamOptions) => Promise<void>
  loadHistory?: (query: HistoryQuery) => Promise<HistoryResult>
  initialRetryDelayMs?: number
}

const HISTORY_QUERY_CONFIG = { cacheFor: 0, shareRequest: false } as const
const MAX_ROWS = 200
const MAX_PAYLOAD_BYTES = 16 * 1024 * 1024
const PAYLOAD_ENCODER = new TextEncoder()

export function useDeviceEvidenceStream(options: UseDeviceEvidenceStreamOptions = {}) {
  const connector = options.connector ?? consumeDeviceEvidenceStream
  const loadHistory =
    options.loadHistory ?? (query => deviceApiMethods.history(query, HISTORY_QUERY_CONFIG).send())
  const records = ref<DeviceEvidenceRow[]>([])
  const filters = ref<StreamQuery>({})
  const connectionState = ref<DeviceEvidenceConnectionState>('DISCONNECTED')
  const lastError = ref<Error | null>(null)
  const historyError = ref<Error | null>(null)
  const loadingHistory = ref(false)
  const nextCursor = ref<string | null>(null)
  const truncated = ref(false)
  let rowSequence = 0
  let historyGeneration = 0
  let liveRevision = 0
  const liveChanges = new Map<string, number>()
  const inFlightUpdates = new Map<number, DeviceEvidenceUpdatedEvent>()
  const recentUpdates = new Map<number, DeviceEvidenceUpdatedEvent>()

  const rows = computed(() => records.value.filter(row => row.gap || matchesStatus(row)))
  const totalPayloadBytes = computed(() =>
    records.value.reduce((total, row) => total + row.payloadBytes, 0)
  )
  const historyLimitReached = computed(
    () =>
      truncated.value ||
      records.value.length >= MAX_ROWS ||
      totalPayloadBytes.value >= MAX_PAYLOAD_BYTES
  )

  const connection = createAuthenticatedSseConnection({
    connector: ({ signal, onOpen }) => {
      // Receive status changes out of the selected status too, so stale rows can leave the table.
      const streamFilters = { ...filters.value }
      delete streamFilters.apply_status
      return connector({
        filters: streamFilters,
        signal,
        onOpen: () => {
          if (!signal.aborted) {
            onOpen()
            void loadRecent()
          }
        },
        onEvent: event => {
          if (!signal.aborted) applyEvent(event)
        }
      })
    },
    initialRetryDelayMs: options.initialRetryDelayMs ?? 500,
    onStateChange: state => {
      connectionState.value = state
    },
    onError: error => {
      lastError.value = error
    },
    onGap: () => {
      mergeRow({
        rowKey: `gap-${++rowSequence}`,
        requestId: null,
        evidenceId: null,
        recordedAt: new Date().toISOString(),
        gap: true,
        payloadBytes: 0,
        attempt: null,
        latestUpdate: null
      })
      trimRows()
    }
  })

  function matchesStatus(row: DeviceEvidenceRow): boolean {
    return (
      !filters.value.apply_status ||
      (row.latestUpdate?.apply_status ?? row.attempt?.apply_status) === filters.value.apply_status
    )
  }

  function connect(): void {
    connection.connect()
    void loadRecent()
  }

  function disconnect(): void {
    historyGeneration += 1
    loadingHistory.value = false
    connection.disconnect()
  }

  function setFilters(nextFilters: StreamQuery): void {
    clear()
    filters.value = { ...nextFilters }
    connect()
  }

  function clear(): void {
    historyGeneration += 1
    loadingHistory.value = false
    historyError.value = null
    records.value = []
    liveChanges.clear()
    inFlightUpdates.clear()
    recentUpdates.clear()
    truncated.value = false
    nextCursor.value = null
  }

  async function loadRecent(): Promise<void> {
    await loadPage(false)
  }
  async function loadMore(): Promise<void> {
    if (loadingHistory.value || !nextCursor.value || historyLimitReached.value) return
    await loadPage(true)
  }

  async function loadPage(append: boolean): Promise<void> {
    const generation = ++historyGeneration
    const revision = liveRevision
    inFlightUpdates.clear()
    loadingHistory.value = true
    historyError.value = null
    try {
      const page = await loadHistory({
        ...filters.value,
        limit: 20,
        ...(append && nextCursor.value ? { cursor: nextCursor.value } : {})
      })
      if (generation !== historyGeneration) return
      const duringRequest = records.value.filter(
        row => (liveChanges.get(row.rowKey) ?? 0) > revision
      )
      if (!append) {
        records.value = []
        truncated.value = false
      }
      for (const item of page.items) {
        mergeRow({
          rowKey: item.row_key,
          recordedAt: item.recorded_at,
          requestId: item.attempt?.request_id ?? null,
          evidenceId: item.attempt?.evidence_id ?? item.latest_update?.evidence_id ?? null,
          gap: false,
          payloadBytes: serializedPayloadBytes(item.attempt?.raw_payload ?? null),
          attempt: item.attempt,
          latestUpdate: item.latest_update
        })
      }
      // Events received while the HTTP snapshot was being read are authoritative for this view.
      for (const row of duringRequest) mergeRow(row)
      nextCursor.value = page.next_cursor
      trimRows()
    } catch (error) {
      if (generation === historyGeneration)
        historyError.value = error instanceof Error ? error : new Error(String(error))
    } finally {
      if (generation === historyGeneration) {
        loadingHistory.value = false
        inFlightUpdates.clear()
      }
    }
  }

  function applyEvent(event: DeviceEvidenceStreamEvent): void {
    liveRevision += 1
    if (event.type === 'device_ingress.attempted') {
      const update =
        records.value.find(row => row.evidenceId === event.payload.evidence_id)?.latestUpdate ??
        null
      const rowKey = `attempt:${event.payload.request_id}`
      liveChanges.set(rowKey, liveRevision)
      mergeRow({
        rowKey,
        requestId: event.payload.request_id,
        evidenceId: event.payload.evidence_id ?? null,
        recordedAt: event.payload.received_at,
        gap: false,
        payloadBytes: serializedPayloadBytes(event.payload.raw_payload),
        attempt: event.payload,
        latestUpdate: update
      })
    } else {
      // A status can arrive before its receipt even outside an HTTP history request.
      const evidenceId = event.payload.evidence_id
      const latest = newerUpdate(recentUpdates.get(evidenceId) ?? null, event.payload)!
      recentUpdates.delete(evidenceId)
      recentUpdates.set(evidenceId, latest)
      if (recentUpdates.size > MAX_ROWS) recentUpdates.delete(recentUpdates.keys().next().value!)
      if (loadingHistory.value) {
        inFlightUpdates.set(
          event.payload.evidence_id,
          newerUpdate(inFlightUpdates.get(event.payload.evidence_id) ?? null, event.payload)!
        )
        if (inFlightUpdates.size > MAX_ROWS) {
          // Never accept a snapshot whose concurrent status changes exceeded the bounded buffer.
          historyGeneration += 1
          loadingHistory.value = false
          inFlightUpdates.clear()
          historyError.value = new Error('实时状态更新较多，请刷新历史以获取最新记录。')
        }
      }
      const matching = records.value.filter(
        row => !row.gap && row.evidenceId === event.payload.evidence_id
      )
      if (matching.length) {
        for (const row of matching) {
          liveChanges.set(row.rowKey, liveRevision)
          mergeRow({ ...row, latestUpdate: event.payload })
        }
      } else {
        const rowKey = `evidence:${event.payload.evidence_id}`
        liveChanges.set(rowKey, liveRevision)
        mergeRow({
          rowKey,
          requestId: null,
          evidenceId: event.payload.evidence_id ?? null,
          recordedAt: event.payload.processed_at ?? event.payload.observed_at ?? undefined,
          gap: false,
          payloadBytes: 0,
          attempt: null,
          latestUpdate: event.payload
        })
      }
    }
    trimRows()
  }

  function mergeRow(row: DeviceEvidenceRow): void {
    if (row.evidenceId !== null) {
      row.latestUpdate = newerUpdate(row.latestUpdate, recentUpdates.get(row.evidenceId) ?? null)
      row.latestUpdate = newerUpdate(row.latestUpdate, inFlightUpdates.get(row.evidenceId) ?? null)
      if (!row.attempt && row.latestUpdate) {
        row.recordedAt =
          row.latestUpdate.processed_at ?? row.latestUpdate.observed_at ?? row.recordedAt
      }
      if (!row.attempt && !row.gap) {
        const attempts = records.value.filter(
          item => item.attempt && item.evidenceId === row.evidenceId
        )
        if (attempts.length) {
          for (const attempt of attempts)
            attempt.latestUpdate = newerUpdate(attempt.latestUpdate, row.latestUpdate)
          return
        }
      }
    }
    if (row.attempt && row.evidenceId !== null) {
      const orphan = records.value.find(
        item => !item.attempt && !item.gap && item.evidenceId === row.evidenceId
      )
      row.latestUpdate = newerUpdate(row.latestUpdate, orphan?.latestUpdate ?? null)
      records.value = records.value.filter(item => item !== orphan)
    }
    const index = records.value.findIndex(item => item.rowKey === row.rowKey)
    if (index >= 0) {
      row.latestUpdate = newerUpdate(records.value[index]?.latestUpdate ?? null, row.latestUpdate)
      records.value[index] = row
    } else records.value.push(row)
  }

  function trimRows(): void {
    records.value = records.value.filter(row => row.gap || matchesStatus(row))
    records.value.sort(
      (a, b) =>
        Date.parse(b.recordedAt ?? '1970-01-01') - Date.parse(a.recordedAt ?? '1970-01-01') ||
        b.rowKey.localeCompare(a.rowKey)
    )
    let bytes = 0
    records.value = records.value.filter((row, index) => {
      bytes += row.payloadBytes
      const keep = index < MAX_ROWS && bytes <= MAX_PAYLOAD_BYTES
      if (!keep) truncated.value = true
      return keep
    })
    const retained = new Set(records.value.map(row => row.rowKey))
    for (const key of liveChanges.keys()) if (!retained.has(key)) liveChanges.delete(key)
  }

  if (getCurrentScope()) onScopeDispose(disconnect)

  return {
    rows,
    filters,
    connectionState,
    lastError,
    historyError,
    loadingHistory,
    nextCursor,
    historyLimitReached,
    totalPayloadBytes,
    connect,
    reconnect: connect,
    disconnect,
    setFilters,
    clear,
    loadRecent,
    loadMore
  }
}

function newerUpdate(
  left: DeviceEvidenceUpdatedEvent | null,
  right: DeviceEvidenceUpdatedEvent | null
): DeviceEvidenceUpdatedEvent | null {
  if (!left) return right
  if (!right) return left
  return Date.parse(updateTimestamp(left)) > Date.parse(updateTimestamp(right))
    ? left
    : right
}

function updateTimestamp(update: DeviceEvidenceUpdatedEvent): string {
  return update.processed_at ?? update.observed_at ?? '1970-01-01'
}

function serializedPayloadBytes(payload: Record<string, unknown> | null | undefined): number {
  return payload == null ? 0 : PAYLOAD_ENCODER.encode(JSON.stringify(payload)).byteLength
}
