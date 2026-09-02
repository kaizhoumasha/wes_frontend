import { computed, getCurrentScope, onScopeDispose, ref, watch } from 'vue'
import {
  deviceApiMethods,
  type DebugPreflightInput,
  type DebugPreflightResult
} from '@/api/modules/device'
import {
  devicesApiMethods,
  type CreateDevicesInput,
  type DevicesItem,
  type UpdateDevicesInput
} from '@/api/modules/devices'
import {
  createSoftDeleteCrudRequestAdapterFromMethods,
  type PaginationData,
  type QueryOptionsInput
} from '@/api/base/crud-request-adapter'
import {
  fetchWesDeviceSnapshot,
  reconcileDeviceDiscovery,
  type DeviceDiscoveryItem
} from './deviceDiscovery'

export interface DeviceDiscoveryApiPort {
  preflight(input: DebugPreflightInput): Promise<DebugPreflightResult>
  queryDevices(options: QueryOptionsInput): Promise<PaginationData<DevicesItem>>
}

interface UseDeviceDiscoveryOptions {
  api?: DeviceDiscoveryApiPort
}

const devicesRequestAdapter = createSoftDeleteCrudRequestAdapterFromMethods<
  DevicesItem,
  CreateDevicesInput,
  UpdateDevicesInput
>(devicesApiMethods)

const defaultApi: DeviceDiscoveryApiPort = {
  async preflight(input) {
    return await deviceApiMethods.debugPreflight(input).send()
  },
  async queryDevices(options) {
    return await devicesRequestAdapter.query(options)
  }
}

export function useDeviceDiscovery(options: UseDeviceDiscoveryOptions = {}) {
  const api = options.api ?? defaultApi
  const isOpen = ref(false)
  const endpointBaseUrl = ref('')
  const isLoading = ref(false)
  const items = ref<DeviceDiscoveryItem[]>([])
  const hasSnapshot = ref(false)
  const snapshotEndpoint = ref<string | null>(null)
  const lastError = ref<Error | null>(null)
  const comparedAt = ref<Date | null>(null)
  let sessionGeneration = 0
  let refreshGeneration = 0
  let activeRequestEndpoint: string | null = null
  let isResetting = false

  const isStale = computed(() => hasSnapshot.value && lastError.value !== null)

  watch(
    endpointBaseUrl,
    endpoint => {
      if (isResetting) return
      const normalized = endpoint.trim()
      if (normalized === snapshotEndpoint.value || normalized === activeRequestEndpoint) return
      refreshGeneration += 1
      isLoading.value = false
      clearSnapshot()
      lastError.value = null
    },
    { flush: 'sync' }
  )

  function open(): void {
    resetSession()
    isOpen.value = true
  }

  function close(): void {
    resetSession()
    isOpen.value = false
  }

  async function refresh(): Promise<void> {
    const requestedEndpoint = endpointBaseUrl.value.trim()
    if (!requestedEndpoint) {
      throw new Error('ECS Endpoint 必填')
    }

    isLoading.value = true
    lastError.value = null
    activeRequestEndpoint = requestedEndpoint
    const generation = sessionGeneration
    const requestGeneration = ++refreshGeneration

    try {
      const preflight = await api.preflight({ endpoint_base_url: requestedEndpoint })
      if (!isCurrentRequest(generation, requestGeneration, requestedEndpoint)) return

      const canonicalEndpoint = preflight.endpoint_base_url.trim()
      activeRequestEndpoint = canonicalEndpoint
      const wesDevices = await fetchWesDeviceSnapshot(
        canonicalEndpoint,
        preflight.devices.map(item => item.device.device_code),
        options => api.queryDevices(options)
      )
      if (!isCurrentRequest(generation, requestGeneration, requestedEndpoint)) return

      snapshotEndpoint.value = canonicalEndpoint
      endpointBaseUrl.value = canonicalEndpoint
      items.value = reconcileDeviceDiscovery(canonicalEndpoint, preflight.devices, wesDevices)
      hasSnapshot.value = true
      comparedAt.value = new Date()
    } catch (error) {
      if (!isCurrentGeneration(generation, requestGeneration)) return
      lastError.value = toError(error)
      throw error
    } finally {
      if (isCurrentGeneration(generation, requestGeneration)) {
        isLoading.value = false
        activeRequestEndpoint = null
      }
    }
  }

  function canOnboard(item: DeviceDiscoveryItem): boolean {
    return (
      item.status === 'DISCOVERED_UNMANAGED' &&
      hasSnapshot.value &&
      !isStale.value &&
      !isLoading.value
    )
  }

  function isCurrentRequest(
    generation: number,
    requestGeneration: number,
    requestedEndpoint: string
  ): boolean {
    return (
      isCurrentGeneration(generation, requestGeneration) &&
      endpointBaseUrl.value.trim() === requestedEndpoint
    )
  }

  function isCurrentGeneration(generation: number, requestGeneration: number): boolean {
    return generation === sessionGeneration && requestGeneration === refreshGeneration
  }

  function clearSnapshot(): void {
    items.value = []
    hasSnapshot.value = false
    snapshotEndpoint.value = null
    comparedAt.value = null
  }

  function resetSession(): void {
    sessionGeneration += 1
    refreshGeneration += 1
    activeRequestEndpoint = null
    isResetting = true
    endpointBaseUrl.value = ''
    isResetting = false
    isLoading.value = false
    clearSnapshot()
    lastError.value = null
  }

  if (getCurrentScope()) {
    onScopeDispose(() => {
      sessionGeneration += 1
      refreshGeneration += 1
    })
  }

  return {
    isOpen,
    endpointBaseUrl,
    isLoading,
    items,
    hasSnapshot,
    snapshotEndpoint,
    lastError,
    comparedAt,
    isStale,
    open,
    close,
    refresh,
    canOnboard
  }
}

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error))
}
