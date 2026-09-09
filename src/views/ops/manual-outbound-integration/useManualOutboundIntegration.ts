import { getCurrentScope, onScopeDispose, ref } from 'vue'
import {
  worklineIntegrationDebugApi,
  type CreateIntegrationRunInput,
  type IntegrationRun
} from '@/api/manualOutboundIntegrationApi'
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
  let selectionRevision = 0

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
    const selectedRunId = currentRun.value?.run_id
    const selectedRevision = selectionRevision
    try {
      const snapshots = await api.list(20)
      snapshots.forEach(accept)
      if (!currentRun.value && snapshots.length) currentRun.value = snapshots[0]
      if (
        selectedRunId &&
        !snapshots.some(snapshot => snapshot.run_id === selectedRunId) &&
        selectionRevision === selectedRevision &&
        currentRun.value?.run_id === selectedRunId
      ) {
        const selectedSnapshot = await api.get(selectedRunId)
        if (selectionRevision === selectedRevision && currentRun.value?.run_id === selectedRunId) {
          accept(selectedSnapshot)
          currentRun.value =
            runs.value.find(item => item.run_id === selectedRunId) ?? currentRun.value
        }
      }
    } catch (error) {
      lastError.value = toError(error)
    } finally {
      loading.value = false
    }
  }

  async function select(runId: string): Promise<void> {
    loading.value = true
    const requestRevision = ++selectionRevision
    const known = runs.value.find(item => item.run_id === runId)
    if (known) currentRun.value = known
    try {
      const snapshot = await api.get(runId)
      accept(snapshot)
      if (selectionRevision === requestRevision)
        currentRun.value = runs.value.find(item => item.run_id === runId) ?? currentRun.value
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
    currentRun.value = runs.value.find(item => item.run_id === snapshot.run_id) ?? snapshot
    return currentRun.value
  }

  const stream = createAuthenticatedSseConnection({
    connector: attempt =>
      consumeWorklineIntegrationDebugStream({
        signal: attempt.signal,
        onOpen: () => {
          attempt.onOpen()
          void load()
        },
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
