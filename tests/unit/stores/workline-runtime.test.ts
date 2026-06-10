import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useWorklineRuntimeStore } from '@/stores/workline-runtime'
import type { RuntimeWorklineMonitorProjectionResponse } from '@/types/runtime'

const mocks = vi.hoisted(() => ({
  worklineProjection: vi.fn()
}))

vi.mock('@/api/modules/runtime', () => ({
  runtimeApiMethods: {
    worklineProjection: mocks.worklineProjection,
    worklines: vi.fn(() => ({ send: vi.fn() }))
  }
}))

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>(next => {
    resolve = next
  })
  return { promise, resolve }
}

function createProjection(worklineId: number): RuntimeWorklineMonitorProjectionResponse {
  return {
    summary: {
      id: worklineId,
      line_name: `Line ${worklineId}`,
      line_code: `WL-${worklineId}`,
      runtime_status: 'READY'
    },
    boundary: {},
    device_nodes: [],
    active_sessions: { items: [], total_count: 0, truncated: false },
    recent_failed_traces: { items: [], total_count: 0, truncated: false },
    recent_completed_traces: { items: [], total_count: 0, truncated: false },
    resource_evidence: { items: [], total_count: 0, truncated: false },
    action_candidates: { pending_reconciliation: null },
    generated_at: new Date().toISOString()
  } as unknown as RuntimeWorklineMonitorProjectionResponse
}

describe('useWorklineRuntimeStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('ignores stale projection responses after a newer workline projection request starts', async () => {
    const first = deferred<RuntimeWorklineMonitorProjectionResponse>()
    const second = deferred<RuntimeWorklineMonitorProjectionResponse>()
    mocks.worklineProjection.mockImplementation((worklineId: number) => ({
      send: () => (worklineId === 45 ? first.promise : second.promise)
    }))

    const store = useWorklineRuntimeStore()
    const firstLoad = store.loadProjection(45)
    const secondLoad = store.loadProjection(46)

    second.resolve(createProjection(46))
    await secondLoad
    expect(store.projection?.summary.id).toBe(46)

    first.resolve(createProjection(45))
    await firstLoad
    expect(store.projection?.summary.id).toBe(46)
  })
})
