import { computed, ref } from 'vue'
import { runtimeApiMethods } from '@/api/modules/runtime'
import type { RuntimeScenePluginManifestSummary } from '@/types/runtime'

const manifestCache = new Map<string, RuntimeScenePluginManifestSummary>()
const inFlightRequests = new Map<string, Promise<RuntimeScenePluginManifestSummary>>()
let cacheGeneration = 0

function normalizePluginKey(pluginKey?: string | null): string | null {
  const key = pluginKey?.trim()
  return key ? key : null
}

async function fetchManifest(pluginKey: string): Promise<RuntimeScenePluginManifestSummary> {
  const cached = manifestCache.get(pluginKey)
  if (cached) return cached

  const existingRequest = inFlightRequests.get(pluginKey)
  if (existingRequest) return existingRequest

  const generation = cacheGeneration
  const activeRequest = runtimeApiMethods
    .worklinePluginManifest(pluginKey)
    .send()
    .then(manifest => {
      if (generation === cacheGeneration) {
        manifestCache.set(pluginKey, manifest)
      }
      return manifest
    })

  inFlightRequests.set(pluginKey, activeRequest)
  const clearActiveRequest = () => {
    if (inFlightRequests.get(pluginKey) === activeRequest) {
      inFlightRequests.delete(pluginKey)
    }
  }
  activeRequest.then(clearActiveRequest, clearActiveRequest)

  return activeRequest
}

export function clearRuntimeSceneManifestCache() {
  cacheGeneration += 1
  manifestCache.clear()
  inFlightRequests.clear()
}

export function useRuntimeSceneManifest() {
  const manifest = ref<RuntimeScenePluginManifestSummary | null>(null)
  const loading = ref(false)
  const error = ref<unknown>(null)
  let requestToken = 0

  async function load(pluginKey?: string | null) {
    const key = normalizePluginKey(pluginKey)
    requestToken += 1
    const token = requestToken

    if (!key) {
      manifest.value = null
      error.value = null
      loading.value = false
      return null
    }

    if (manifest.value?.plugin_key !== key) {
      manifest.value = null
    }
    loading.value = true
    error.value = null

    try {
      const nextManifest = await fetchManifest(key)
      if (token === requestToken) {
        manifest.value = nextManifest
      }
      return nextManifest
    } catch (e: unknown) {
      if (token === requestToken) {
        manifest.value = null
        error.value = e
      }
      return null
    } finally {
      if (token === requestToken) {
        loading.value = false
      }
    }
  }

  return {
    manifest,
    loading,
    error,
    hasError: computed(() => error.value !== null),
    load
  }
}
