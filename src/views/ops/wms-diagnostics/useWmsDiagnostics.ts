import { onScopeDispose, ref, shallowRef, triggerRef, watch } from 'vue'
import {
  wmsDiagnosticsApiMethods,
  type ConfirmationsResult,
  type ExchangesQuery,
  type ExchangesResult,
  type EvidencesResult,
  type GetByExchangeIdResult,
  type StreamQuery
} from '@/api/modules/wmsDiagnostics'
import {
  createAuthenticatedSseConnection,
  type AuthenticatedSseConnectionState
} from '@/api/streaming/authenticatedSseStream'
import {
  consumeWmsDiagnosticsStream,
  type WmsDiagnosticsEvent,
  type WmsObservation
} from '@/api/streaming/wmsDiagnosticsStream'

export interface WmsConsoleRow {
  phase: 'started' | 'completed' | 'recorded'
  exchange: WmsObservation | ExchangesResult['items'][number]
}
interface Options {
  api?: {
    listExchanges(query: ExchangesQuery): Promise<ExchangesResult>
    getExchange(id: string): Promise<GetByExchangeIdResult>
    getConfirmation(operation: string, operationId: string): Promise<ConfirmationsResult>
    getEvidence(operation: string, operationId: string): Promise<EvidencesResult>
  }
  connectStream?: typeof consumeWmsDiagnosticsStream
}

export function useWmsDiagnostics(options: Options = {}) {
  const api = options.api ?? {
    listExchanges: (query: ExchangesQuery) => wmsDiagnosticsApiMethods.exchanges(query).send(),
    getExchange: (id: string) =>
      wmsDiagnosticsApiMethods.getByExchangeId({ exchange_id: id }).send(),
    getConfirmation: (operation: string, operationId: string) =>
      wmsDiagnosticsApiMethods.confirmations({ operation, operation_id: operationId }).send(),
    getEvidence: (operation: string, operationId: string) =>
      wmsDiagnosticsApiMethods.evidences({ operation, operation_id: operationId }).send()
  }
  const mode = ref<'live' | 'recent'>('live')
  const filters = ref<ExchangesQuery>({})
  const exchanges = shallowRef<WmsConsoleRow[]>([])
  const detail = shallowRef<WmsObservation | GetByExchangeIdResult | null>(null)
  const paused = ref(false)
  const bufferBytes = ref(0)
  const evictedCount = ref(0)
  const pendingCount = ref(0)
  const hasGap = ref(false)
  const connectionState = ref<AuthenticatedSseConnectionState>('DISCONNECTED')
  const streamError = ref<Error | null>(null)
  const historyError = ref<Error | null>(null)
  const detailError = ref<Error | null>(null)
  const loading = ref(false)
  const loadingDetail = ref(false)
  const confirmation = shallowRef<ConfirmationsResult | null>(null)
  const evidence = shallowRef<EvidencesResult | null>(null)
  const confirmationError = ref<Error | null>(null)
  const evidenceError = ref<Error | null>(null)
  const loadingReliable = ref(false)
  const nextCursor = ref<string | null>(null)
  const scanIncomplete = ref(false)
  const retentionHours = ref<number | null>(null)
  let bytes = 0,
    evicted = 0,
    pending = 0
  let listGeneration = 0,
    detailGeneration = 0,
    reliableGeneration = 0
  let reliableIdentity: {
    operation: string
    operationId: string
    targets: { confirmation: boolean; evidence: boolean }
  } | null = null
  let enabled = false,
    connectedBefore = false,
    disposed = false
  let flushTimer: ReturnType<typeof setTimeout> | undefined
  const encoder = new TextEncoder()
  const size = (row: WmsConsoleRow) => encoder.encode(JSON.stringify(row)).byteLength

  function ingest(row: WmsConsoleRow) {
    const rows = exchanges.value
    const index = rows.findIndex(item => item.exchange.attempt_id === row.exchange.attempt_id)
    const previous = rows[index]
    if (previous?.phase === 'completed' && row.phase === 'started') return
    if (row.phase === 'completed' && detail.value?.attempt_id === row.exchange.attempt_id) {
      detail.value = row.exchange as WmsObservation
    }
    if (previous) {
      bytes -= size(previous)
      rows[index] = row
    } else rows.push(row)
    bytes += size(row)
    while (rows.length > 500 || bytes > 2 * 1024 * 1024) {
      bytes -= size(rows.shift()!)
      evicted++
    }
    if (paused.value) pending++
    // 只保留同一有界数组，避免渲染快照另外持有一份已淘汰报文。
    flushTimer ??= setTimeout(() => {
      flushTimer = undefined
      bufferBytes.value = bytes
      evictedCount.value = evicted
      pendingCount.value = pending
      triggerRef(exchanges)
    }, 50)
  }

  const connection = createAuthenticatedSseConnection({
    connector: ({ signal, onOpen }) => {
      const { direction, operation, operation_id, business_reference, only_errors } = filters.value
      const query: StreamQuery = {
        direction,
        operation,
        operation_id,
        business_reference,
        only_errors
      }
      return (options.connectStream ?? consumeWmsDiagnosticsStream)({
        signal,
        onOpen,
        query,
        onEvent: (event: WmsDiagnosticsEvent) => {
          if (!signal.aborted && !disposed) ingest(event)
        }
      })
    },
    onStateChange: state => {
      connectionState.value = state
      if (state === 'RECONNECTED' && reliableIdentity) void refreshReliableIdentity()
    },
    onError: error => {
      streamError.value = error
    },
    onGap: () => {
      hasGap.value = true
    }
  })

  function connect() {
    enabled = true
    if (disposed || mode.value !== 'live' || document.visibilityState === 'hidden') return
    if (connectedBefore) {
      hasGap.value = true
      if (reliableIdentity) void refreshReliableIdentity()
    }
    connectedBefore = true
    connection.connect()
  }
  function disconnect() {
    connection.disconnect()
  }
  function visibilityChanged() {
    if (document.visibilityState === 'hidden') disconnect()
    else if (enabled) connect()
  }
  document.addEventListener('visibilitychange', visibilityChanged)
  watch(paused, value => {
    if (!value) {
      pending = 0
      pendingCount.value = 0
    }
  })

  function clearRows() {
    clearTimeout(flushTimer)
    flushTimer = undefined
    exchanges.value = []
    bytes = evicted = pending = 0
    bufferBytes.value = evictedCount.value = pendingCount.value = 0
    detail.value = null
    detailGeneration++
    loadingDetail.value = false
    detailError.value = null
  }
  function clearView() {
    listGeneration++
    loading.value = false
    clearRows()
    clearReliableIdentity()
  }
  async function loadPage(append: boolean) {
    if (mode.value !== 'recent' || (append && loading.value)) return
    const generation = ++listGeneration
    loading.value = true
    historyError.value = null
    try {
      const page = await api.listExchanges({
        ...filters.value,
        page_size: 50,
        ...(append ? { cursor: nextCursor.value } : {})
      })
      if (disposed || generation !== listGeneration) return
      if (!append) clearRows()
      page.items.forEach(exchange => ingest({ phase: 'recorded', exchange }))
      nextCursor.value = page.next_cursor
      scanIncomplete.value = page.scan_incomplete
      retentionHours.value = page.retention_hours
    } catch (error) {
      if (generation === listGeneration)
        historyError.value = error instanceof Error ? error : new Error(String(error))
    } finally {
      if (generation === listGeneration) loading.value = false
    }
  }
  async function setMode(value: 'live' | 'recent') {
    listGeneration++
    loading.value = false
    mode.value = value
    disconnect()
    clearView()
    nextCursor.value = null
    scanIncomplete.value = false
    historyError.value = null
    if (value === 'recent') await loadPage(false)
    else connect()
  }
  async function applyFilters(query: ExchangesQuery) {
    filters.value = query
    await setMode(mode.value)
  }
  async function select(row: WmsConsoleRow) {
    if (
      !row.exchange.operation ||
      !row.exchange.operation_id ||
      reliableIdentity?.operation !== row.exchange.operation ||
      reliableIdentity.operationId !== row.exchange.operation_id
    )
      clearReliableIdentity()
    const generation = ++detailGeneration
    detail.value = null
    detailError.value = null
    loadingDetail.value = false
    if (row.phase !== 'recorded') {
      detail.value = row.exchange as WmsObservation
      return
    }
    if (!row.exchange.exchange_id) return
    loadingDetail.value = true
    try {
      const result = await api.getExchange(row.exchange.exchange_id)
      if (!disposed && generation === detailGeneration) detail.value = result
    } catch (error) {
      if (generation === detailGeneration)
        detailError.value = error instanceof Error ? error : new Error(String(error))
    } finally {
      if (generation === detailGeneration) loadingDetail.value = false
    }
  }
  function closeDetail() {
    detailGeneration++
    detail.value = null
    detailError.value = null
    loadingDetail.value = false
    clearReliableIdentity()
  }
  function clearReliableIdentity() {
    reliableGeneration++
    reliableIdentity = null
    confirmation.value = null
    evidence.value = null
    confirmationError.value = null
    evidenceError.value = null
    loadingReliable.value = false
  }
  async function queryReliableIdentity(
    operation: string,
    operationId: string,
    targets: { confirmation: boolean; evidence: boolean }
  ) {
    reliableIdentity = { operation, operationId, targets }
    const generation = ++reliableGeneration
    confirmation.value = null
    evidence.value = null
    confirmationError.value = null
    evidenceError.value = null
    loadingReliable.value = true
    const query = { operation, operation_id: operationId }
    const [confirmationResult, evidenceResult] = await Promise.allSettled([
      targets.confirmation ? api.getConfirmation(query.operation, query.operation_id) : null,
      targets.evidence ? api.getEvidence(query.operation, query.operation_id) : null
    ])
    if (disposed || generation !== reliableGeneration) return
    if (targets.confirmation) {
      if (confirmationResult.status === 'fulfilled') confirmation.value = confirmationResult.value
      else
        confirmationError.value =
          confirmationResult.reason instanceof Error
            ? confirmationResult.reason
            : new Error(String(confirmationResult.reason))
    }
    if (targets.evidence) {
      if (evidenceResult.status === 'fulfilled') evidence.value = evidenceResult.value
      else
        evidenceError.value =
          evidenceResult.reason instanceof Error
            ? evidenceResult.reason
            : new Error(String(evidenceResult.reason))
    }
    loadingReliable.value = false
  }
  function refreshReliableIdentity() {
    if (!reliableIdentity) return Promise.resolve()
    return queryReliableIdentity(
      reliableIdentity.operation,
      reliableIdentity.operationId,
      reliableIdentity.targets
    )
  }
  onScopeDispose(() => {
    disposed = true
    listGeneration++
    detailGeneration++
    reliableGeneration++
    disconnect()
    clearTimeout(flushTimer)
    document.removeEventListener('visibilitychange', visibilityChanged)
  })
  return {
    mode,
    filters,
    exchanges,
    detail,
    paused,
    bufferBytes,
    evictedCount,
    pendingCount,
    hasGap,
    connectionState,
    streamError,
    historyError,
    detailError,
    loading,
    loadingDetail,
    confirmation,
    evidence,
    confirmationError,
    evidenceError,
    loadingReliable,
    nextCursor,
    scanIncomplete,
    retentionHours,
    connect,
    disconnect,
    clearView,
    setMode,
    applyFilters,
    select,
    closeDetail,
    queryReliableIdentity,
    refreshReliableIdentity,
    loadRecent: () => loadPage(false),
    loadMore: () => (nextCursor.value ? loadPage(true) : Promise.resolve())
  }
}
