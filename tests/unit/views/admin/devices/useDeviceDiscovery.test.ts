import { nextTick } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import type { DebugPreflightResult } from '@/api/modules/device'
import type { DevicesItem } from '@/api/modules/devices'
import type { PaginationData, QueryOptionsInput } from '@/api/base/crud-request-adapter'
import {
  useDeviceDiscovery,
  type DeviceDiscoveryApiPort
} from '@/views/admin/devices/useDeviceDiscovery'

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })
  return { promise, resolve, reject }
}

function preflight(endpoint = 'http://ecs:8080'): DebugPreflightResult {
  return {
    endpoint_base_url: endpoint,
    devices: [
      {
        device: {
          device_code: 'DEVICE-01',
          device_name: 'Device 01',
          device_type: 'CONVEYOR',
          role: 'TRANSPORT',
          supported_commands: ['START'],
          supported_events: ['ARRIVED']
        },
        state: {
          device_code: 'DEVICE-01',
          mode: 'AUTO',
          status: 'IDLE',
          is_online: true,
          current_command_code: null,
          scenario: null,
          updated_at: 1
        },
        admissible: false,
        rejection_code: 'DEVICE_MODE_NOT_AUTO'
      }
    ]
  }
}

function page(items: DevicesItem[]): PaginationData<DevicesItem> {
  return { items, total: items.length, page: 1, size: 100, pages: items.length ? 1 : 0 }
}

function api(overrides: Partial<DeviceDiscoveryApiPort> = {}): DeviceDiscoveryApiPort {
  return {
    preflight: vi.fn().mockResolvedValue(preflight()),
    queryDevices: vi.fn().mockResolvedValue(page([])),
    ...overrides
  }
}

describe('useDeviceDiscovery', () => {
  it('publishes one fresh snapshot only after preflight and active Device query both succeed', async () => {
    const discoveryApi = api()
    const discovery = useDeviceDiscovery({ api: discoveryApi })
    discovery.open()
    discovery.endpointBaseUrl.value = ' http://ecs:8080/ '

    await discovery.refresh()

    expect(discoveryApi.preflight).toHaveBeenCalledWith({
      endpoint_base_url: 'http://ecs:8080/'
    })
    expect(discovery.endpointBaseUrl.value).toBe('http://ecs:8080')
    expect(discovery.items.value).toHaveLength(1)
    expect(discovery.items.value[0]?.status).toBe('DISCOVERED_UNMANAGED')
    expect(discovery.isStale.value).toBe(false)
    expect(discovery.canOnboard(discovery.items.value[0]!)).toBe(true)
  })

  it('keeps the last successful snapshot stale and non-actionable when a later WES query fails', async () => {
    const queryDevices = vi
      .fn<(options: QueryOptionsInput) => Promise<PaginationData<DevicesItem>>>()
      .mockResolvedValueOnce(page([]))
      .mockRejectedValueOnce(new Error('query unavailable'))
    const discovery = useDeviceDiscovery({ api: api({ queryDevices }) })
    discovery.open()
    discovery.endpointBaseUrl.value = 'http://ecs:8080'
    await discovery.refresh()
    const previousItems = discovery.items.value

    await expect(discovery.refresh()).rejects.toThrow('query unavailable')

    expect(discovery.items.value).toBe(previousItems)
    expect(discovery.isStale.value).toBe(true)
    expect(discovery.canOnboard(discovery.items.value[0]!)).toBe(false)
  })

  it('ignores a delayed response after the endpoint changes', async () => {
    const delayed = deferred<DebugPreflightResult>()
    const discovery = useDeviceDiscovery({
      api: api({ preflight: vi.fn(() => delayed.promise) })
    })
    discovery.open()
    discovery.endpointBaseUrl.value = 'http://old-ecs:8080'
    const refresh = discovery.refresh()

    discovery.endpointBaseUrl.value = 'http://new-ecs:8080'
    delayed.resolve(preflight('http://old-ecs:8080'))
    await refresh

    expect(discovery.endpointBaseUrl.value).toBe('http://new-ecs:8080')
    expect(discovery.items.value).toEqual([])
    expect(discovery.hasSnapshot.value).toBe(false)
    expect(discovery.isLoading.value).toBe(false)
  })

  it('ignores a delayed response after close and reopens with an empty session', async () => {
    const delayed = deferred<DebugPreflightResult>()
    const discovery = useDeviceDiscovery({
      api: api({ preflight: vi.fn(() => delayed.promise) })
    })
    discovery.open()
    discovery.endpointBaseUrl.value = 'http://ecs:8080'
    const refresh = discovery.refresh()

    discovery.close()
    discovery.open()
    delayed.resolve(preflight())
    await refresh
    await nextTick()

    expect(discovery.isOpen.value).toBe(true)
    expect(discovery.endpointBaseUrl.value).toBe('')
    expect(discovery.items.value).toEqual([])
    expect(discovery.lastError.value).toBeNull()
  })

  it('publishes only the latest result when the same endpoint is refreshed twice', async () => {
    const delayed = deferred<DebugPreflightResult>()
    const latest = preflight()
    latest.devices[0]!.device.device_code = 'LATEST-01'
    const preflightRequest = vi
      .fn<() => Promise<DebugPreflightResult>>()
      .mockImplementationOnce(() => delayed.promise)
      .mockResolvedValueOnce(latest)
    const discovery = useDeviceDiscovery({ api: api({ preflight: preflightRequest }) })
    discovery.open()
    discovery.endpointBaseUrl.value = 'http://ecs:8080'

    const firstRefresh = discovery.refresh()
    await discovery.refresh()
    delayed.resolve(preflight())
    await firstRefresh

    expect(discovery.items.value.map(item => item.deviceCode)).toEqual(['LATEST-01'])
    expect(discovery.lastError.value).toBeNull()
    expect(discovery.isLoading.value).toBe(false)
  })

  it('ignores an older rejection after a newer refresh succeeds', async () => {
    const delayed = deferred<DebugPreflightResult>()
    const preflightRequest = vi
      .fn<() => Promise<DebugPreflightResult>>()
      .mockImplementationOnce(() => delayed.promise)
      .mockResolvedValueOnce(preflight())
    const discovery = useDeviceDiscovery({ api: api({ preflight: preflightRequest }) })
    discovery.open()
    discovery.endpointBaseUrl.value = 'http://ecs:8080'

    const firstRefresh = discovery.refresh()
    await discovery.refresh()
    delayed.reject(new Error('old request failed'))
    await firstRefresh

    expect(discovery.hasSnapshot.value).toBe(true)
    expect(discovery.lastError.value).toBeNull()
    expect(discovery.isStale.value).toBe(false)
  })

  it('rejects an empty endpoint without sending a request', async () => {
    const discoveryApi = api()
    const discovery = useDeviceDiscovery({ api: discoveryApi })
    discovery.open()

    await expect(discovery.refresh()).rejects.toThrow('ECS Endpoint 必填')
    expect(discoveryApi.preflight).not.toHaveBeenCalled()
    expect(discovery.isLoading.value).toBe(false)
  })
})
