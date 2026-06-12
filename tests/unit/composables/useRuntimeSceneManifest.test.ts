import { beforeEach, describe, expect, it, vi } from 'vitest'

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
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

describe('useRuntimeSceneManifest', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    const { clearRuntimeSceneManifestCache } = await import('@/composables/useRuntimeSceneManifest')
    clearRuntimeSceneManifestCache()
  })

  it('dedupes in-flight requests and reuses cached manifests', async () => {
    const { useRuntimeSceneManifest } = await import('@/composables/useRuntimeSceneManifest')
    const pending = deferred<{ plugin_key: string; contract_version: string }>()
    mocks.worklinePluginManifest.mockReturnValueOnce({ send: () => pending.promise })

    const state = useRuntimeSceneManifest()
    const first = state.loadManifest('rough_sorter')
    const second = state.loadManifest('rough_sorter')

    expect(mocks.worklinePluginManifest).toHaveBeenCalledTimes(1)
    pending.resolve({ plugin_key: 'rough_sorter', contract_version: 'v1' })
    await Promise.all([first, second])

    expect(state.manifest.value?.plugin_key).toBe('rough_sorter')

    await state.loadManifest('rough_sorter')
    expect(mocks.worklinePluginManifest).toHaveBeenCalledTimes(1)
  })

  it('ignores stale responses from older plugin loads', async () => {
    const { useRuntimeSceneManifest } = await import('@/composables/useRuntimeSceneManifest')
    const slow = deferred<{ plugin_key: string; contract_version: string }>()
    const fast = deferred<{ plugin_key: string; contract_version: string }>()
    mocks.worklinePluginManifest
      .mockReturnValueOnce({ send: () => slow.promise })
      .mockReturnValueOnce({ send: () => fast.promise })

    const state = useRuntimeSceneManifest()
    const slowLoad = state.loadManifest('plugin-a')
    const fastLoad = state.loadManifest('plugin-b')

    fast.resolve({ plugin_key: 'plugin-b', contract_version: 'v2' })
    await fastLoad
    slow.resolve({ plugin_key: 'plugin-a', contract_version: 'v1' })
    await slowLoad

    expect(state.manifest.value?.plugin_key).toBe('plugin-b')
    expect(state.loading.value).toBe(false)
  })

  it('records load failure, clears manifest and allows retry', async () => {
    const { useRuntimeSceneManifest } = await import('@/composables/useRuntimeSceneManifest')
    const error = new Error('manifest unavailable')
    mocks.worklinePluginManifest
      .mockReturnValueOnce({ send: () => Promise.reject(error) })
      .mockReturnValueOnce({
        send: () => Promise.resolve({ plugin_key: 'rough_sorter', contract_version: 'v1' })
      })

    const state = useRuntimeSceneManifest()
    await expect(state.loadManifest('rough_sorter')).rejects.toThrow('manifest unavailable')

    expect(state.error.value).toBe(error)
    expect(state.manifest.value).toBeNull()
    expect(state.loading.value).toBe(false)

    await state.loadManifest('rough_sorter')
    expect(state.manifest.value?.plugin_key).toBe('rough_sorter')
    expect(mocks.worklinePluginManifest).toHaveBeenCalledTimes(2)
  })

  it('refetches a cached plugin manifest when the expected contract version differs', async () => {
    const { useRuntimeSceneManifest } = await import('@/composables/useRuntimeSceneManifest')
    mocks.worklinePluginManifest
      .mockReturnValueOnce({
        send: () => Promise.resolve({ plugin_key: 'rough_sorter', contract_version: 'v1' })
      })
      .mockReturnValueOnce({
        send: () => Promise.resolve({ plugin_key: 'rough_sorter', contract_version: 'v2' })
      })

    const state = useRuntimeSceneManifest()
    await state.loadManifest('rough_sorter', 'v1')
    await state.loadManifest('rough_sorter', 'v2')

    expect(state.manifest.value?.contract_version).toBe('v2')
    expect(mocks.worklinePluginManifest).toHaveBeenCalledTimes(2)
  })

  it('isolates cached manifests by plugin key and contract version', async () => {
    const { useRuntimeSceneManifest } = await import('@/composables/useRuntimeSceneManifest')
    mocks.worklinePluginManifest
      .mockReturnValueOnce({
        send: () => Promise.resolve({ plugin_key: 'rough_sorter', contract_version: 'v1' })
      })
      .mockReturnValueOnce({
        send: () => Promise.resolve({ plugin_key: 'rough_sorter', contract_version: 'v2' })
      })
      .mockReturnValueOnce({
        send: () => Promise.resolve({ plugin_key: 'smt_inbound', contract_version: 'v1' })
      })

    const state = useRuntimeSceneManifest()
    await state.loadManifest('rough_sorter', 'v1')
    await state.loadManifest('rough_sorter', 'v2')
    await state.loadManifest('smt_inbound', 'v1')
    await state.loadManifest('rough_sorter', 'v1')
    await state.loadManifest('rough_sorter', 'v2')

    expect(state.manifest.value).toEqual({ plugin_key: 'rough_sorter', contract_version: 'v2' })
    expect(mocks.worklinePluginManifest).toHaveBeenCalledTimes(3)
    expect(mocks.worklinePluginManifest).toHaveBeenNthCalledWith(1, 'rough_sorter')
    expect(mocks.worklinePluginManifest).toHaveBeenNthCalledWith(2, 'rough_sorter')
    expect(mocks.worklinePluginManifest).toHaveBeenNthCalledWith(3, 'smt_inbound')
  })

  it('keeps versioned manifest cache entries isolated when older responses resolve later', async () => {
    const { useRuntimeSceneManifest } = await import('@/composables/useRuntimeSceneManifest')
    const slowV1 = deferred<{ plugin_key: string; contract_version: string }>()
    const fastV2 = deferred<{ plugin_key: string; contract_version: string }>()
    mocks.worklinePluginManifest
      .mockReturnValueOnce({ send: () => slowV1.promise })
      .mockReturnValueOnce({ send: () => fastV2.promise })

    const state = useRuntimeSceneManifest()
    const first = state.loadManifest('rough_sorter', 'v1')
    const second = state.loadManifest('rough_sorter', 'v2')

    fastV2.resolve({ plugin_key: 'rough_sorter', contract_version: 'v2' })
    await second
    slowV1.resolve({ plugin_key: 'rough_sorter', contract_version: 'v1' })
    await first

    await state.loadManifest('rough_sorter', 'v2')

    expect(state.manifest.value?.contract_version).toBe('v2')
    expect(mocks.worklinePluginManifest).toHaveBeenCalledTimes(2)
  })

  it('rejects and does not cache manifests returned for a different plugin key', async () => {
    const { useRuntimeSceneManifest } = await import('@/composables/useRuntimeSceneManifest')
    mocks.worklinePluginManifest
      .mockReturnValueOnce({
        send: () => Promise.resolve({ plugin_key: 'wrong_plugin', contract_version: 'v1' })
      })
      .mockReturnValueOnce({
        send: () => Promise.resolve({ plugin_key: 'rough_sorter', contract_version: 'v1' })
      })

    const state = useRuntimeSceneManifest()
    await expect(state.loadManifest('rough_sorter', 'v1')).rejects.toThrow(
      'Manifest plugin key mismatch'
    )
    expect(state.manifest.value).toBeNull()

    await state.loadManifest('rough_sorter', 'v1')

    expect(state.manifest.value?.plugin_key).toBe('rough_sorter')
    expect(mocks.worklinePluginManifest).toHaveBeenCalledTimes(2)
  })
})
