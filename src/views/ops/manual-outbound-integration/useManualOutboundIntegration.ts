import { getCurrentScope, onScopeDispose, ref } from 'vue'
import {
  worklineIntegrationDebugApi,
  type CreateIntegrationRunInput,
  type IntegrationRun
} from '@/api/modules/worklineIntegrationDebug'
import {
  consumeWorklineIntegrationDebugStream,
  type WorklineIntegrationDebugEvent
} from '@/api/streaming/worklineIntegrationDebugStream'
import {
  createAuthenticatedSseConnection,
  type AuthenticatedSseConnectionState
} from '@/api/streaming/authenticatedSseStream'

export interface IntegrationApiPort {
  list(limit?: number): Promise<IntegrationRun[]>
  get(runId: string): Promise<IntegrationRun>
  create(body: CreateIntegrationRunInput): Promise<IntegrationRun>
}

export function useManualOutboundIntegration(options: { api?: IntegrationApiPort } = {}) {
  const api = options.api ?? worklineIntegrationDebugApi
  const runs = ref<IntegrationRun[]>([])
  const currentRun = ref<IntegrationRun | null>(null)
  const loading = ref(false)
  const lastError = ref<Error | null>(null)
  const hasGap = ref(false)
  const connectionState = ref<AuthenticatedSseConnectionState>('DISCONNECTED')

  function accept(snapshot: IntegrationRun): void {
    const known = runs.value.find(item => item.run_id === snapshot.run_id)
    if (known && known.version > snapshot.version) return
    runs.value = [snapshot, ...runs.value.filter(item => item.run_id !== snapshot.run_id)].sort(
      (a, b) => b.updated_at.localeCompare(a.updated_at)
    )
    if (!currentRun.value || currentRun.value.run_id === snapshot.run_id)
      currentRun.value = snapshot
  }

  async function load(): Promise<void> {
    loading.value = true
    lastError.value = null
    try {
      const snapshots = await api.list(20)
      snapshots.forEach(accept)
      if (!currentRun.value && snapshots.length) currentRun.value = snapshots[0]
    } catch (error) {
      lastError.value = toError(error)
    } finally {
      loading.value = false
    }
  }

  async function select(runId: string): Promise<void> {
    loading.value = true
    try {
      accept(await api.get(runId))
      currentRun.value = runs.value.find(item => item.run_id === runId) ?? null
    } catch (error) {
      lastError.value = toError(error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function create(input: CreateIntegrationRunInput): Promise<IntegrationRun> {
    const snapshot = await api.create(input)
    accept(snapshot)
    currentRun.value = snapshot
    return snapshot
  }

  const stream = createAuthenticatedSseConnection({
    connector: attempt =>
      consumeWorklineIntegrationDebugStream({
        signal: attempt.signal,
        onOpen: attempt.onOpen,
        onEvent: (event: WorklineIntegrationDebugEvent) => accept(event.payload)
      }),
    onStateChange: state => (connectionState.value = state),
    onError: error => {
      if (error) lastError.value = error
    },
    onGap: () => (hasGap.value = true)
  })

  if (getCurrentScope()) onScopeDispose(stream.disconnect)
  return {
    runs,
    currentRun,
    loading,
    lastError,
    hasGap,
    connectionState,
    accept,
    load,
    select,
    create,
    ...stream
  }
}

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error))
}
