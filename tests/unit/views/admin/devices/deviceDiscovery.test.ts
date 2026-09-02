import { describe, expect, it, vi } from 'vitest'
import type { DebugPreflightResult } from '@/api/modules/device'
import type { DevicesItem } from '@/api/modules/devices'
import type { PaginationData, QueryOptionsInput } from '@/api/base/crud-request-adapter'
import {
  fetchWesDeviceSnapshot,
  reconcileDeviceDiscovery
} from '@/views/admin/devices/deviceDiscovery'

const ENDPOINT = 'http://10.24.209.26:8080'

function ecsDevice(
  deviceCode: string,
  deviceName: string | null,
  options: {
    commands?: string[] | null
    events?: string[] | null
    online?: boolean
    admissible?: boolean
  } = {}
): DebugPreflightResult['devices'][number] {
  return {
    device: {
      device_code: deviceCode,
      device_name: deviceName,
      device_type: 'CONVEYOR',
      role: 'TRANSPORT',
      supported_commands: 'commands' in options ? (options.commands ?? null) : ['START'],
      supported_events: 'events' in options ? (options.events ?? null) : ['ARRIVED']
    },
    state: {
      device_code: deviceCode,
      mode: 'AUTO',
      status: 'IDLE',
      is_online: options.online ?? true,
      current_command_code: null,
      scenario: null,
      updated_at: 1
    },
    admissible: options.admissible ?? true,
    rejection_code: options.admissible === false ? 'DEVICE_OFFLINE' : null
  }
}

function wesDevice(
  id: number,
  deviceCode: string,
  deviceName: string,
  endpointBaseUrl: string | null = ENDPOINT
): DevicesItem {
  return {
    id,
    version: 1,
    device_code: deviceCode,
    device_name: deviceName,
    device_role: 'CONVEYOR',
    endpoint_base_url: endpointBaseUrl,
    is_active: true,
    role_index: 1,
    sort_order: 0,
    work_line_id: null,
    upstream_device_id: null,
    description: null,
    diagnostic_profile: {}
  }
}

describe('reconcileDeviceDiscovery', () => {
  it('classifies current ECS and active WES snapshots and keeps actionable rows first', () => {
    const ecs = [
      ecsDevice('MANAGED-02', null, { admissible: false }),
      ecsDevice('UNMANAGED-01', 'New device'),
      ecsDevice('DIFF-01', 'ECS name'),
      ecsDevice('CONFLICT-01', 'Conflict device'),
      ecsDevice('MANAGED-01', 'Managed device')
    ]
    const wes = [
      wesDevice(1, 'MANAGED-01', 'Managed device'),
      wesDevice(2, 'MANAGED-02', 'WES-only name'),
      wesDevice(3, 'DIFF-01', 'WES name'),
      wesDevice(4, 'CONFLICT-01', 'Conflict device', 'http://other-ecs:8080'),
      wesDevice(5, 'WES-ONLY-01', 'Missing from ECS')
    ]

    const result = reconcileDeviceDiscovery(ENDPOINT, ecs, wes)

    expect(result.map(item => [item.status, item.deviceCode])).toEqual([
      ['ENDPOINT_CONFLICT', 'CONFLICT-01'],
      ['INFORMATION_DIFFERS', 'DIFF-01'],
      ['MANAGED_NOT_DISCOVERED', 'WES-ONLY-01'],
      ['DISCOVERED_UNMANAGED', 'UNMANAGED-01'],
      ['MANAGED', 'MANAGED-01'],
      ['MANAGED', 'MANAGED-02']
    ])
    expect(result.find(item => item.deviceCode === 'MANAGED-02')).toMatchObject({
      status: 'MANAGED',
      ecs: {
        admissible: false,
        device: { device_name: null }
      }
    })
  })

  it('preserves null, empty and populated capability declarations for drawer details', () => {
    const result = reconcileDeviceDiscovery(
      ENDPOINT,
      [
        ecsDevice('NULL-CAPS', 'Null caps', { commands: null, events: null }),
        ecsDevice('EMPTY-CAPS', 'Empty caps', { commands: [], events: [] }),
        ecsDevice('FULL-CAPS', 'Full caps', { commands: ['MOVE'], events: ['DONE'] })
      ],
      []
    )

    expect(result.map(item => item.ecs?.device.supported_commands)).toEqual([
      [],
      ['MOVE'],
      null
    ])
    expect(result.map(item => item.ecs?.device.supported_events)).toEqual([[], ['DONE'], null])
  })
})

describe('fetchWesDeviceSnapshot', () => {
  it('uses one targeted OR filter and follows pagination until all active matches are loaded', async () => {
    const firstPage = Array.from({ length: 100 }, (_, index) =>
      wesDevice(index + 1, `DEVICE-${String(index + 1).padStart(3, '0')}`, `Device ${index + 1}`)
    )
    const last = wesDevice(101, 'DEVICE-101', 'Device 101')
    const query = vi.fn(
      async (options: QueryOptionsInput): Promise<PaginationData<DevicesItem>> => ({
        items: options.offset === 0 ? firstPage : [last],
        total: 101,
        page: options.offset === 0 ? 1 : 2,
        size: 100,
        pages: 2
      })
    )

    const result = await fetchWesDeviceSnapshot(
      ENDPOINT,
      ['DEVICE-001', 'DEVICE-101'],
      query
    )

    expect(query).toHaveBeenNthCalledWith(1, {
      filters: {
        couple: 'or',
        conditions: [
          { field: 'device_code', op: 'in', value: ['DEVICE-001', 'DEVICE-101'] },
          { field: 'endpoint_base_url', op: 'eq', value: ENDPOINT }
        ]
      },
      include_deleted: false,
      limit: 100,
      offset: 0,
      sort: [{ field: 'id', order: 'asc' }]
    })
    expect(query).toHaveBeenNthCalledWith(2, expect.objectContaining({ offset: 100 }))
    expect(result).toHaveLength(101)
    expect(result.at(-1)?.device_code).toBe('DEVICE-101')
  })

  it('omits an empty IN condition when ECS returns no devices', async () => {
    const query = vi.fn(
      async (): Promise<PaginationData<DevicesItem>> => ({
        items: [],
        total: 0,
        page: 1,
        size: 100,
        pages: 0
      })
    )

    await fetchWesDeviceSnapshot(ENDPOINT, [], query)

    expect(query).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: {
          couple: 'or',
          conditions: [{ field: 'endpoint_base_url', op: 'eq', value: ENDPOINT }]
        }
      })
    )
  })

  it('deduplicates ECS device codes before querying WES', async () => {
    const query = vi.fn(
      async (): Promise<PaginationData<DevicesItem>> => ({
        items: [],
        total: 0,
        page: 1,
        size: 100,
        pages: 0
      })
    )

    await fetchWesDeviceSnapshot(ENDPOINT, ['DEVICE-01', 'DEVICE-01'], query)

    expect(query).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: {
          couple: 'or',
          conditions: [
            { field: 'device_code', op: 'in', value: ['DEVICE-01'] },
            { field: 'endpoint_base_url', op: 'eq', value: ENDPOINT }
          ]
        }
      })
    )
  })

  it('rejects the whole snapshot when a later WES page fails', async () => {
    const firstPage = Array.from({ length: 100 }, (_, index) =>
      wesDevice(index + 1, `DEVICE-${index + 1}`, `Device ${index + 1}`)
    )
    const query = vi
      .fn<(options: QueryOptionsInput) => Promise<PaginationData<DevicesItem>>>()
      .mockResolvedValueOnce({
        items: firstPage,
        total: 101,
        page: 1,
        size: 100,
        pages: 2
      })
      .mockRejectedValueOnce(new Error('page two unavailable'))

    await expect(fetchWesDeviceSnapshot(ENDPOINT, ['DEVICE-101'], query)).rejects.toThrow(
      'page two unavailable'
    )
    expect(query).toHaveBeenCalledTimes(2)
  })

  it('fails instead of looping when WES reports remaining rows but returns an empty page', async () => {
    const firstPage = Array.from({ length: 100 }, (_, index) =>
      wesDevice(index + 1, `DEVICE-${index + 1}`, `Device ${index + 1}`)
    )
    const query = vi
      .fn<(options: QueryOptionsInput) => Promise<PaginationData<DevicesItem>>>()
      .mockResolvedValueOnce({
        items: firstPage,
        total: 101,
        page: 1,
        size: 100,
        pages: 2
      })
      .mockResolvedValueOnce({ items: [], total: 101, page: 2, size: 100, pages: 2 })

    await expect(fetchWesDeviceSnapshot(ENDPOINT, ['DEVICE-101'], query)).rejects.toThrow(
      'WES Device 分页未返回剩余数据'
    )
  })
})
