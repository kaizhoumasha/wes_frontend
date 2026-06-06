import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearRuntimeSceneManifestCache,
  useRuntimeSceneManifest
} from '@/composables/useRuntimeSceneManifest'
import type { RuntimeScenePluginManifestSummary } from '@/types/runtime'

const mocks = vi.hoisted(() => ({
  worklinePluginManifest: vi.fn()
}))

vi.mock('@/api/modules/runtime', () => ({
  runtimeApiMethods: {
    worklinePluginManifest: mocks.worklinePluginManifest
  }
}))

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((next, fail) => {
    resolve = next
    reject = fail
  })
  return { promise, resolve, reject }
}

function createManifest(pluginKey: string): RuntimeScenePluginManifestSummary {
  return {
    plugin_key: pluginKey,
    contract_version: 'v1',
    required_device_roles: [{ role: 'scanner', min_count: 1 }],
    event_source_roles: { SCAN_DONE: ['scanner'] },
    command_target_roles: { MOVE_ARM: ['arm'] },
    supported_events: ['SCAN_DONE'],
    supported_commands: ['MOVE_ARM']
  }
}

describe('useRuntimeSceneManifest', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    clearRuntimeSceneManifestCache()
  })

  it('dedupes concurrent loads and reuses the plugin_key cache', async () => {
    const request = deferred<RuntimeScenePluginManifestSummary>()
    mocks.worklinePluginManifest.mockReturnValue({ send: () => request.promise })
    const first = useRuntimeSceneManifest()
    const second = useRuntimeSceneManifest()

    const firstLoad = first.load('rough_sorter')
    const secondLoad = second.load('rough_sorter')
    request.resolve(createManifest('rough_sorter'))
    await Promise.all([firstLoad, secondLoad])

    expect(mocks.worklinePluginManifest).toHaveBeenCalledTimes(1)
    expect(first.manifest.value?.plugin_key).toBe('rough_sorter')
    expect(second.manifest.value?.plugin_key).toBe('rough_sorter')

    const third = useRuntimeSceneManifest()
    await third.load('rough_sorter')
    expect(mocks.worklinePluginManifest).toHaveBeenCalledTimes(1)
    expect(third.manifest.value?.plugin_key).toBe('rough_sorter')
  })

  it('ignores stale responses after a newer plugin manifest request starts', async () => {
    const first = deferred<RuntimeScenePluginManifestSummary>()
    const second = deferred<RuntimeScenePluginManifestSummary>()
    const third = deferred<RuntimeScenePluginManifestSummary>()
    mocks.worklinePluginManifest.mockImplementation((pluginKey: string) => ({
      send: () => {
        if (pluginKey === 'old_plugin') return first.promise
        if (pluginKey === 'new_plugin') return second.promise
        return third.promise
      }
    }))
    const state = useRuntimeSceneManifest()

    const oldLoad = state.load('old_plugin')
    const newLoad = state.load('new_plugin')
    second.resolve(createManifest('new_plugin'))
    await newLoad
    expect(state.manifest.value?.plugin_key).toBe('new_plugin')

    first.resolve(createManifest('old_plugin'))
    await oldLoad
    expect(state.manifest.value?.plugin_key).toBe('new_plugin')

    const latestLoad = state.load('latest_plugin')
    expect(state.manifest.value).toBeNull()
    third.resolve(createManifest('latest_plugin'))
    await latestLoad
    expect(state.manifest.value?.plugin_key).toBe('latest_plugin')
  })

  it('keeps the current state on a stale failure', async () => {
    const first = deferred<RuntimeScenePluginManifestSummary>()
    const second = deferred<RuntimeScenePluginManifestSummary>()
    mocks.worklinePluginManifest.mockImplementation((pluginKey: string) => ({
      send: () => (pluginKey === 'old_plugin' ? first.promise : second.promise)
    }))
    const state = useRuntimeSceneManifest()

    const oldLoad = state.load('old_plugin')
    const newLoad = state.load('new_plugin')
    second.resolve(createManifest('new_plugin'))
    await newLoad

    first.reject(new Error('old failed'))
    await oldLoad
    expect(state.manifest.value?.plugin_key).toBe('new_plugin')
    expect(state.error.value).toBeNull()
  })

  it('exposes fallback state when the current manifest request fails', async () => {
    const request = deferred<RuntimeScenePluginManifestSummary>()
    const failure = new Error('manifest unavailable')
    mocks.worklinePluginManifest.mockReturnValue({ send: () => request.promise })
    const state = useRuntimeSceneManifest()

    const load = state.load('rough_sorter')
    expect(state.loading.value).toBe(true)
    request.reject(failure)

    await expect(load).resolves.toBeNull()
    expect(state.manifest.value).toBeNull()
    expect(state.error.value).toBe(failure)
    expect(state.hasError.value).toBe(true)
    expect(state.loading.value).toBe(false)
  })

  it('resets manifest state without fetching when plugin key is blank', async () => {
    mocks.worklinePluginManifest.mockReturnValue({
      send: () => Promise.resolve(createManifest('rough_sorter'))
    })
    const state = useRuntimeSceneManifest()

    await state.load('rough_sorter')
    expect(state.manifest.value?.plugin_key).toBe('rough_sorter')

    await expect(state.load('   ')).resolves.toBeNull()
    expect(state.manifest.value).toBeNull()
    expect(state.error.value).toBeNull()
    expect(state.loading.value).toBe(false)
    expect(mocks.worklinePluginManifest).toHaveBeenCalledTimes(1)
  })

  it('does not repopulate the cache from requests that resolve after clear', async () => {
    const first = deferred<RuntimeScenePluginManifestSummary>()
    const second = deferred<RuntimeScenePluginManifestSummary>()
    mocks.worklinePluginManifest
      .mockReturnValueOnce({ send: () => first.promise })
      .mockReturnValueOnce({ send: () => second.promise })

    const state = useRuntimeSceneManifest()
    const firstLoad = state.load('rough_sorter')
    clearRuntimeSceneManifestCache()
    first.resolve(createManifest('rough_sorter'))
    await firstLoad

    const secondLoad = state.load('rough_sorter')
    second.resolve(createManifest('rough_sorter'))
    await secondLoad

    expect(mocks.worklinePluginManifest).toHaveBeenCalledTimes(2)
    expect(state.manifest.value?.plugin_key).toBe('rough_sorter')
  })

  it('keeps newer in-flight requests after an older cleared request settles', async () => {
    const first = deferred<RuntimeScenePluginManifestSummary>()
    const second = deferred<RuntimeScenePluginManifestSummary>()
    mocks.worklinePluginManifest
      .mockReturnValueOnce({ send: () => first.promise })
      .mockReturnValueOnce({ send: () => second.promise })

    const state = useRuntimeSceneManifest()
    const firstLoad = state.load('rough_sorter')
    clearRuntimeSceneManifestCache()
    const secondLoad = state.load('rough_sorter')

    first.resolve(createManifest('rough_sorter'))
    await firstLoad
    const dedupedSecondLoad = state.load('rough_sorter')

    expect(mocks.worklinePluginManifest).toHaveBeenCalledTimes(2)
    second.resolve(createManifest('rough_sorter'))
    await Promise.all([secondLoad, dedupedSecondLoad])
    expect(state.manifest.value?.plugin_key).toBe('rough_sorter')
    expect(mocks.worklinePluginManifest).toHaveBeenCalledTimes(2)
  })
})
