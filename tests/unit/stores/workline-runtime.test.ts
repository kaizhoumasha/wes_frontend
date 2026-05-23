import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useWorklineRuntimeStore } from '@/stores/workline-runtime'
import type { RuntimeWorklineDetailResponse } from '@/types/runtime'

const mocks = vi.hoisted(() => ({
  worklineDetail: vi.fn()
}))

vi.mock('@/api/modules/runtime', () => ({
  runtimeApiMethods: {
    worklineDetail: mocks.worklineDetail,
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

function createDetail(worklineId: number): RuntimeWorklineDetailResponse {
  return {
    summary: {
      id: worklineId,
      line_name: `Line ${worklineId}`,
      line_code: `WL-${worklineId}`,
      runtime_status: 'READY'
    },
    devices: [],
    active_sessions: [],
    recent_failed_traces: []
  } as unknown as RuntimeWorklineDetailResponse
}

describe('useWorklineRuntimeStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('ignores stale detail responses after a newer workline detail request starts', async () => {
    const first = deferred<RuntimeWorklineDetailResponse>()
    const second = deferred<RuntimeWorklineDetailResponse>()
    mocks.worklineDetail.mockImplementation((worklineId: number) => ({
      send: () => (worklineId === 45 ? first.promise : second.promise)
    }))

    const store = useWorklineRuntimeStore()
    const firstLoad = store.loadDetail(45)
    const secondLoad = store.loadDetail(46)

    second.resolve(createDetail(46))
    await secondLoad
    expect(store.detail?.summary.id).toBe(46)

    first.resolve(createDetail(45))
    await firstLoad
    expect(store.detail?.summary.id).toBe(46)
  })
})
