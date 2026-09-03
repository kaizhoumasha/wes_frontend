import { getCurrentScope, onScopeDispose, ref, watch, type Ref } from 'vue'
import {
  consumeTransportDebugRunStream,
  type TransportDebugRunStreamOptions,
  type TransportDebugRunUpdatedEvent
} from '@/api/streaming/transportDebugRunStream'
import {
  createAuthenticatedSseConnection,
  type AuthenticatedSseConnectionState
} from '@/api/streaming/authenticatedSseStream'

interface Options {
  connector?: (options: TransportDebugRunStreamOptions) => Promise<void>
  visible: Ref<boolean>
  activeRunId: Ref<string | null>
  refreshRun(runId: string): Promise<void>
  loadRecentRuns?: () => Promise<void>
  pollIntervalMs?: number
}

export function useTransportDebugRunStream(options: Options) {
  const connector = options.connector ?? consumeTransportDebugRunStream
  const connectionState = ref<AuthenticatedSseConnectionState>('DISCONNECTED')
  const lastError = ref<Error | null>(null)
  const hasGap = ref(false)
  let pollTimer: number | null = null
  let manuallyDisconnected = true

  const refresh = (runId: string) => {
    void options.refreshRun(runId).catch(error => { lastError.value = toError(error) })
  }
  const connection = createAuthenticatedSseConnection({
    connector: ({ signal, onOpen }) => connector({
      signal, onOpen, onEvent: (event: TransportDebugRunUpdatedEvent) => refresh(event.payload.run_id)
    }),
    onStateChange: state => {
      connectionState.value = state
      if ((state === 'CONNECTED' || state === 'RECONNECTED') && options.loadRecentRuns) {
        void options.loadRecentRuns().catch(error => { lastError.value = toError(error) })
      }
    },
    onError: error => { lastError.value = error },
    onGap: () => { hasGap.value = true }
  })

  function syncPoller(): void {
    if (pollTimer !== null) {
      window.clearInterval(pollTimer)
      pollTimer = null
    }
    if (manuallyDisconnected || !options.visible.value) return
    if (!options.activeRunId.value && !options.loadRecentRuns) return
    pollTimer = window.setInterval(() => {
      const runId = options.activeRunId.value
      if (runId) refresh(runId)
      else if (options.loadRecentRuns) {
        void options.loadRecentRuns().catch(error => { lastError.value = toError(error) })
      }
    }, options.pollIntervalMs ?? 15_000)
  }

  const stopWatch = watch(
    [options.visible, options.activeRunId, connectionState],
    syncPoller,
    { immediate: true, flush: 'sync' }
  )

  function connect(enableSse = true): void {
    manuallyDisconnected = false
    if (enableSse) connection.connect()
    syncPoller()
  }

  function reconnect(): void {
    manuallyDisconnected = false
    connection.reconnect()
    syncPoller()
  }

  function disconnect(): void {
    manuallyDisconnected = true
    connection.disconnect()
    syncPoller()
  }

  if (getCurrentScope()) onScopeDispose(() => {
    stopWatch()
    if (pollTimer !== null) window.clearInterval(pollTimer)
    connection.disconnect()
  })

  return {
    connectionState,
    lastError,
    hasGap,
    connect,
    reconnect,
    disconnect
  }
}

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error))
}
