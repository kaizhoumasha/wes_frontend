import type { DebugPreflightResult } from '@/api/modules/device'
import type { DevicesItem } from '@/api/modules/devices'
import type { PaginationData, QueryOptionsInput } from '@/api/base/crud-request-adapter'

export type DeviceDiscoveryStatus =
  | 'ENDPOINT_CONFLICT'
  | 'INFORMATION_DIFFERS'
  | 'MANAGED_NOT_DISCOVERED'
  | 'DISCOVERED_UNMANAGED'
  | 'MANAGED'

export interface DeviceDiscoveryItem {
  deviceCode: string
  status: DeviceDiscoveryStatus
  rank: 0 | 1 | 2
  ecs: DebugPreflightResult['devices'][number] | null
  wes: DevicesItem | null
}

export type DeviceQuery = (
  options: QueryOptionsInput
) => Promise<PaginationData<DevicesItem>>

const QUERY_PAGE_SIZE = 100

export function reconcileDeviceDiscovery(
  endpointBaseUrl: string,
  ecsDevices: DebugPreflightResult['devices'],
  wesDevices: DevicesItem[]
): DeviceDiscoveryItem[] {
  const wesByCode = new Map(wesDevices.map(device => [device.device_code, device]))
  const ecsCodes = new Set(ecsDevices.map(item => item.device.device_code))
  const items: DeviceDiscoveryItem[] = ecsDevices.map(ecs => {
    const deviceCode = ecs.device.device_code
    const wes = wesByCode.get(deviceCode) ?? null

    if (!wes) {
      return discoveryItem(deviceCode, 'DISCOVERED_UNMANAGED', 1, ecs, null)
    }
    if (wes.endpoint_base_url !== endpointBaseUrl) {
      return discoveryItem(deviceCode, 'ENDPOINT_CONFLICT', 0, ecs, wes)
    }
    if (ecs.device.device_name !== null && ecs.device.device_name !== wes.device_name) {
      return discoveryItem(deviceCode, 'INFORMATION_DIFFERS', 0, ecs, wes)
    }
    return discoveryItem(deviceCode, 'MANAGED', 2, ecs, wes)
  })

  for (const wes of wesDevices) {
    if (wes.endpoint_base_url === endpointBaseUrl && !ecsCodes.has(wes.device_code)) {
      items.push(
        discoveryItem(wes.device_code, 'MANAGED_NOT_DISCOVERED', 0, null, wes)
      )
    }
  }

  return items.sort(compareDiscoveryItems)
}

export async function fetchWesDeviceSnapshot(
  endpointBaseUrl: string,
  ecsDeviceCodes: string[],
  query: DeviceQuery
): Promise<DevicesItem[]> {
  const conditions: NonNullable<QueryOptionsInput['filters']>['conditions'] = []
  const uniqueCodes = [...new Set(ecsDeviceCodes)]
  if (uniqueCodes.length > 0) {
    conditions.push({ field: 'device_code', op: 'in', value: uniqueCodes })
  }
  conditions.push({ field: 'endpoint_base_url', op: 'eq', value: endpointBaseUrl })

  const items: DevicesItem[] = []
  let offset = 0
  let total: number
  do {
    const page = await query({
      filters: { couple: 'or', conditions },
      include_deleted: false,
      limit: QUERY_PAGE_SIZE,
      offset,
      sort: [{ field: 'id', order: 'asc' }]
    })
    items.push(...page.items)
    total = page.total
    if (items.length < total && page.items.length === 0) {
      throw new Error('WES Device 分页未返回剩余数据')
    }
    offset += page.items.length
  } while (items.length < total)

  return items
}

function discoveryItem(
  deviceCode: string,
  status: DeviceDiscoveryStatus,
  rank: 0 | 1 | 2,
  ecs: DebugPreflightResult['devices'][number] | null,
  wes: DevicesItem | null
): DeviceDiscoveryItem {
  return { deviceCode, status, rank, ecs, wes }
}

function compareDiscoveryItems(left: DeviceDiscoveryItem, right: DeviceDiscoveryItem): number {
  if (left.rank !== right.rank) {
    return left.rank - right.rank
  }
  if (left.deviceCode === right.deviceCode) {
    return 0
  }
  return left.deviceCode < right.deviceCode ? -1 : 1
}
