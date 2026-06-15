import { ref } from 'vue'
import { runtimeApiMethods } from '@/api/modules/runtime'
import type { WorkLinePluginManifestSummary } from '@/types/runtime'

const manifestCache = new Map<string, WorkLinePluginManifestSummary>()
const manifestInflight = new Map<string, Promise<WorkLinePluginManifestSummary>>()

export function clearRuntimeSceneManifestCache() {
  manifestCache.clear()
  manifestInflight.clear()
}

function normalizePluginKey(pluginKey?: string | null): string | null {
  const normalized = pluginKey?.trim()
  return normalized || null
}

function normalizeContractVersion(contractVersion?: string | null): string | null {
  const normalized = contractVersion?.trim()
  return normalized || null
}

function matchesContractVersion(
  manifest: WorkLinePluginManifestSummary,
  expectedContractVersion?: string | null
): boolean {
  const normalizedContractVersion = normalizeContractVersion(expectedContractVersion)
  return !normalizedContractVersion || manifest.contract_version === normalizedContractVersion
}

function matchesPluginKey(manifest: WorkLinePluginManifestSummary, pluginKey: string): boolean {
  return normalizePluginKey(manifest.plugin_key) === pluginKey
}

function getManifestCacheKey(pluginKey: string, expectedContractVersion?: string | null): string {
  return `${pluginKey}:${normalizeContractVersion(expectedContractVersion) ?? ''}`
}

function getCachedManifest(
  pluginKey: string,
  expectedContractVersion?: string | null
): WorkLinePluginManifestSummary | null {
  const cached = manifestCache.get(getManifestCacheKey(pluginKey, expectedContractVersion))
  return cached && matchesContractVersion(cached, expectedContractVersion) ? cached : null
}

function cacheManifest(
  pluginKey: string,
  manifest: WorkLinePluginManifestSummary,
  expectedContractVersion?: string | null
) {
  manifestCache.set(getManifestCacheKey(pluginKey, manifest.contract_version), manifest)
  if (!normalizeContractVersion(expectedContractVersion)) {
    manifestCache.set(getManifestCacheKey(pluginKey), manifest)
  }
}

function fetchManifest(
  pluginKey: string,
  expectedContractVersion?: string | null
): Promise<WorkLinePluginManifestSummary> {
  const cached = getCachedManifest(pluginKey, expectedContractVersion)
  if (cached) {
    return Promise.resolve(cached)
  }

  const inflightKey = getManifestCacheKey(pluginKey, expectedContractVersion)
  const pending = manifestInflight.get(inflightKey)
  if (pending) return pending

  const request = runtimeApiMethods
    .worklinePluginManifest(pluginKey, normalizeContractVersion(expectedContractVersion))
    .send()
    .then(manifest => {
      if (!matchesPluginKey(manifest, pluginKey)) {
        throw new Error(
          `Manifest plugin key mismatch: expected ${pluginKey}, got ${manifest.plugin_key}`
        )
      }
      cacheManifest(pluginKey, manifest, expectedContractVersion)
      return manifest
    })
    .finally(() => {
      manifestInflight.delete(inflightKey)
    })
  manifestInflight.set(inflightKey, request)
  return request
}

export function useRuntimeSceneManifest() {
  const manifest = ref<WorkLinePluginManifestSummary | null>(null)
  const loading = ref(false)
  const error = ref<unknown>(null)
  let requestSeq = 0

  async function loadManifest(pluginKey?: string | null, expectedContractVersion?: string | null) {
    const normalizedPluginKey = normalizePluginKey(pluginKey)
    const seq = ++requestSeq
    error.value = null

    if (!normalizedPluginKey) {
      manifest.value = null
      loading.value = false
      return null
    }

    const cached = getCachedManifest(normalizedPluginKey, expectedContractVersion)
    if (cached) {
      manifest.value = cached
      loading.value = false
      return cached
    }

    loading.value = true
    try {
      const nextManifest = await fetchManifest(normalizedPluginKey, expectedContractVersion)
      if (seq === requestSeq) {
        manifest.value = nextManifest
      }
      return nextManifest
    } catch (e: unknown) {
      if (seq === requestSeq) {
        error.value = e
        manifest.value = null
      }
      throw e
    } finally {
      if (seq === requestSeq) {
        loading.value = false
      }
    }
  }

  return {
    manifest,
    loading,
    error,
    loadManifest
  }
}
