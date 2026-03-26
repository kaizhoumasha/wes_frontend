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
import type {
  ContractSchema,
} from '@/api/contract/types'

const DEVICE_COLLECTION_PATH = '/api/v1/devices' satisfies CrudResourceCollectionPath

export type DeviceType = ContractSchema<'DeviceType'>

export type DeviceProtocol = ContractSchema<'DeviceProtocol'>

export type DeviceStatus = ContractSchema<'DeviceStatus'>

export type Device = CrudItem<typeof DEVICE_COLLECTION_PATH>

export type CreateDeviceInput = CrudCreateInput<typeof DEVICE_COLLECTION_PATH>

export type UpdateDeviceInput = CrudUpdateInput<typeof DEVICE_COLLECTION_PATH>

export const deviceApi = createCrudResourceApi(DEVICE_COLLECTION_PATH)
