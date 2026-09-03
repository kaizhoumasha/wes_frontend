import { ref } from 'vue'
import {
  transportDebugRunApi,
  type DebugRunAbortInput,
  type DebugRunCreateInput,
  type DebugRunPage,
  type DebugRunResult
} from '@/api/modules/transport'

export interface TransportDebugRunApiPort {
  list(query?: { limit?: number; cursor?: string }): Promise<DebugRunPage>
  get(runId: string): Promise<DebugRunResult>
  create(input: DebugRunCreateInput): Promise<DebugRunResult>
  abort(runId: string, input: DebugRunAbortInput): Promise<DebugRunResult>
}

export function useTransportDebugRun(options: { api?: TransportDebugRunApiPort } = {}) {
  const api = options.api ?? transportDebugRunApi
  const recentRuns = ref<DebugRunResult[]>([])
  const currentRun = ref<DebugRunResult | null>(null)
  const activeRun = ref<DebugRunResult | null>(null)
  const loading = ref(false)
  const starting = ref(false)
  const aborting = ref(false)
  const lastError = ref<Error | null>(null)
  let refreshGeneration = 0

  function accept(snapshot: DebugRunResult): void {
    const knownSnapshot = currentRun.value?.run_id === snapshot.run_id
      ? currentRun.value
      : recentRuns.value.find(item => item.run_id === snapshot.run_id)
    if (knownSnapshot && knownSnapshot.version > snapshot.version) return
    const index = recentRuns.value.findIndex(item => item.run_id === snapshot.run_id)
    if (index >= 0) recentRuns.value.splice(index, 1, snapshot)
    else recentRuns.value.unshift(snapshot)
    if (isActive(snapshot)) {
      activeRun.value = snapshot
      currentRun.value = snapshot
      return
    }
    if (activeRun.value?.run_id === snapshot.run_id) activeRun.value = null
    currentRun.value = activeRun.value ?? snapshot
  }

  async function loadRecentRuns(): Promise<void> {
    loading.value = true
    lastError.value = null
    try {
      const page = await api.list({ limit: 20 })
      const knownSnapshots = new Map<string, DebugRunResult>()
      for (const item of [...recentRuns.value, currentRun.value, activeRun.value]) {
        if (!item) continue
        const known = knownSnapshots.get(item.run_id)
        if (!known || item.version > known.version) knownSnapshots.set(item.run_id, item)
      }
      const items = page.items.map(item => {
        const known = knownSnapshots.get(item.run_id)
        return known && known.version > item.version ? known : item
      })
      const knownCurrent = currentRun.value
      if (knownCurrent && !items.some(item => item.run_id === knownCurrent.run_id)) {
        items.unshift(knownCurrent)
      }
      recentRuns.value = items
      const active = items.find(isActive) ?? null
      activeRun.value = active
      currentRun.value = active ?? items[0] ?? null
    } catch (error) {
      lastError.value = toError(error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function refreshRun(runId: string): Promise<void> {
    const generation = ++refreshGeneration
    try {
      const snapshot = await api.get(runId)
      accept(snapshot)
      if (generation === refreshGeneration) lastError.value = null
    } catch (error) {
      if (generation === refreshGeneration) lastError.value = toError(error)
      throw error
    }
  }

  async function startRun(input: DebugRunCreateInput): Promise<DebugRunResult> {
    if (starting.value) throw new Error('自动联调正在启动')
    starting.value = true
    lastError.value = null
    try {
      const snapshot = await api.create(input)
      accept(snapshot)
      return snapshot
    } catch (error) {
      lastError.value = toError(error)
      throw error
    } finally {
      starting.value = false
    }
  }

  async function abortRun(runId: string, reason: string): Promise<DebugRunResult> {
    if (aborting.value) throw new Error('自动联调正在终止')
    if (!reason.trim()) throw new Error('必须填写现场核验说明')
    aborting.value = true
    lastError.value = null
    try {
      const snapshot = await api.abort(runId, { assertion: 'PHYSICAL_STATE_VERIFIED', reason })
      accept(snapshot)
      return snapshot
    } catch (error) {
      lastError.value = toError(error)
      throw error
    } finally {
      aborting.value = false
    }
  }

  return {
    recentRuns,
    currentRun,
    activeRun,
    loading,
    starting,
    aborting,
    lastError,
    loadRecentRuns,
    refreshRun,
    startRun,
    abortRun
  }
}

function isActive(run: DebugRunResult): boolean {
  return run.status === 'RUNNING' || run.status === 'NEEDS_ATTENTION'
}

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error))
}
