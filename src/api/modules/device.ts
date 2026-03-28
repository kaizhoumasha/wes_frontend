/**
 * 设备管理 API
 */

import {
  createCrudResourceApi,
  type CrudCreateInput,
  type CrudItem,
  type CrudResourceCollectionPath,
  type CrudUpdateInput,
} from '@/api/base/crud-api'
import type { components } from '@/api/generated/openapi-types'

const DEVICE_COLLECTION_PATH = '/api/v1/devices' satisfies CrudResourceCollectionPath

export type Device = CrudItem<typeof DEVICE_COLLECTION_PATH>
export type CreateDeviceInput = CrudCreateInput<typeof DEVICE_COLLECTION_PATH>
export type UpdateDeviceInput = CrudUpdateInput<typeof DEVICE_COLLECTION_PATH>
export type DeviceType = components['schemas']['DeviceType']
export type DeviceProtocol = components['schemas']['DeviceProtocol']
export type DeviceStatus = components['schemas']['DeviceStatus']

/**
 * 设备管理 API
 */
export const deviceApi = createCrudResourceApi(DEVICE_COLLECTION_PATH)
