import {
  createSoftDeleteCrudRequestAdapterFromMethods,
  type PaginationData,
  type QueryOptionsInput
} from '@/api/base/crud-request-adapter'
import {
  devicesApiMethods,
  type CreateDevicesInput,
  type DevicesItem,
  type UpdateDevicesInput
} from '@/api/modules/devices'

const deviceAdapter = createSoftDeleteCrudRequestAdapterFromMethods<
  DevicesItem,
  CreateDevicesInput,
  UpdateDevicesInput
>(devicesApiMethods)

export async function queryWorkLineDevices(
  options: QueryOptionsInput
): Promise<PaginationData<DevicesItem>> {
  return deviceAdapter.query({
    ...options,
    sort: [
      { field: 'sort_order', order: 'asc' },
      { field: 'id', order: 'asc' }
    ]
  })
}

export async function fetchWorkLineDevices(worklineId: number): Promise<DevicesItem[]> {
  const items: DevicesItem[] = []
  const limit = 100
  let offset = 0
  let total: number
  do {
    const options: QueryOptionsInput = {
      filters: {
        couple: 'and',
        conditions: [{ field: 'work_line_id', op: 'eq', value: worklineId }]
      },
      offset,
      limit,
      sort: [
        { field: 'sort_order', order: 'asc' },
        { field: 'id', order: 'asc' }
      ]
    }
    const page: PaginationData<DevicesItem> = await deviceAdapter.query(options)
    items.push(...page.items)
    total = page.total
    if (page.items.length === 0 && items.length < total) {
      throw new Error('设备列表分页未返回剩余数据')
    }
    offset += page.items.length
  } while (items.length < total)
  return items
}
