import { nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useActivityMonitor } from '@/views/admin/worklines/composables/useActivityMonitor'
import { useTimezoneStore } from '@/stores/timezone'
import type { PlaneSnapshotV2 } from '@/api/types/plane-v2'

const apiMocks = vi.hoisted(() => ({
  scene: vi.fn(),
  snapshot: vi.fn(),
  activeObjects: vi.fn(),
  currentTask: vi.fn()
}))

vi.mock('@/api/modules/workLines', () => ({
  workLinesApiMethods: {
    planeSceneV2: apiMocks.scene,
    planeSnapshotV2: apiMocks.snapshot,
    activeObjectsV2: apiMocks.activeObjects,
    planeCurrentTaskV2: apiMocks.currentTask
  }
}))

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>(resolvePromise => {
    resolve = resolvePromise
  })
  return { promise, resolve }
}

function createMonitor(id = 7) {
  const workLineId = ref<number | null>(id)
  let monitor!: ReturnType<typeof useActivityMonitor>
  const wrapper = mount({
    setup() {
      monitor = useActivityMonitor(() => workLineId.value)
      return {}
    },
    template: '<span />'
  })
  return { monitor, workLineId, wrapper }
}

describe('useActivityMonitor current task sampling', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
    vi.clearAllMocks()
    apiMocks.scene.mockReturnValue({ send: vi.fn().mockResolvedValue({}) })
    apiMocks.snapshot.mockReturnValue({
      send: vi.fn().mockResolvedValue({ source_status: 'COMPLETE', resource_states: [] })
    })
    apiMocks.activeObjects.mockReturnValue({
      send: vi.fn().mockResolvedValue({ objects: [], total_count: 0 })
    })
  })

  it('does not request current task during initial resource loading', async () => {
    apiMocks.currentTask.mockReturnValue({
      send: vi.fn().mockResolvedValue({ current_task: null, generated_at: '2026-01-01T00:00:00Z' })
    })
    const { monitor, wrapper } = createMonitor()
    await vi.runAllTicks()

    expect(apiMocks.currentTask).not.toHaveBeenCalled()
    expect(monitor.currentTaskLoaded.value).toBe(false)
    wrapper.unmount()
    vi.useRealTimers()
  })

  it('loads an explicit current task without changing dynamic poll state', async () => {
    apiMocks.currentTask.mockReturnValue({
      send: vi.fn().mockResolvedValue({
        current_task: {
          task_id: 'PT-7',
          status: 'EXECUTING',
          target_rack_id: 'R-01',
          target_rack_face: 'A',
          last_applied_plan_revision: 2
        },
        generated_at: '2026-01-01T00:00:00Z'
      })
    })
    const { monitor, wrapper } = createMonitor()
    await vi.runAllTicks()
    await monitor.loadCurrentTask()

    expect(apiMocks.currentTask).toHaveBeenCalledExactlyOnceWith({ id: 7 })
    expect(monitor.currentTask.value?.task_id).toBe('PT-7')
    expect(monitor.currentTaskLoaded.value).toBe(true)
    expect(monitor.dynamicError.value).toBe('')
    wrapper.unmount()
    vi.useRealTimers()
  })

  it('ignores a delayed response after the WorkLine changes', async () => {
    const delayed = deferred<{ current_task: null; generated_at: string }>()
    apiMocks.currentTask.mockReturnValueOnce({ send: vi.fn().mockReturnValue(delayed.promise) })
    const { monitor, workLineId, wrapper } = createMonitor()
    await vi.runAllTicks()
    const pending = monitor.loadCurrentTask()
    workLineId.value = 8
    await nextTick()
    delayed.resolve({ current_task: null, generated_at: '2026-01-01T00:00:00Z' })
    await pending

    expect(monitor.currentTaskLoaded.value).toBe(false)
    expect(monitor.currentTask.value).toBeNull()
    wrapper.unmount()
    vi.useRealTimers()
  })

  it('formats generated timestamps with the configured display timezone', () => {
    useTimezoneStore().setUserTimezone('America/Chicago')
    const { monitor, wrapper } = createMonitor()

    monitor.snapshot.value = {
      generated_at: '2026-01-01T00:00:00Z'
    } as PlaneSnapshotV2

    expect(monitor.generatedAtLabel.value).toBe('18:00:00')
    wrapper.unmount()
  })
})
