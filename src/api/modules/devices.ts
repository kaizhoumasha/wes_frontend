// ==================== AUTO GENERATED START ====================
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 自动生成的 API 模块
 *
 * ⚠️  请勿手动编辑 AUTO GENERATED 区域
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 资源: /api/v1/device/devices
 */
import { contractClient } from '@/api/contract/client'
import type {
  ContractPathParams,
  ContractQueryParams,
  ContractRequestBody,
  ContractRequestConfig,
  ContractResponseData,
} from '@/api/contract/types'
import type { components, paths } from '@/api/generated/openapi-types'
import {
  type SoftDeleteCrudApi,
  createSoftDeleteCrudApi,
  type CrudCreateInput,
  type CrudItem,
  type CrudResourceCollectionPath,
  type CrudUpdateInput,
  type SoftDeleteCrudResourceCollectionPath,
} from '@/api/base/crud-api'

const DEVICES_COLLECTION_PATH = '/api/v1/device/devices' as const

type EnsureEntityId<TItem> = TItem extends { id?: infer TId }
  ? Omit<TItem, 'id'> & { id: Exclude<TId, null | undefined> }
  : TItem

export type DevicesItem = EnsureEntityId<CrudItem<typeof DEVICES_COLLECTION_PATH>>
export type CreateDevicesInput = CrudCreateInput<typeof DEVICES_COLLECTION_PATH>
export type UpdateDevicesInput = CrudUpdateInput<typeof DEVICES_COLLECTION_PATH>

const baseDevicesApi = createSoftDeleteCrudApi({
  collection: DEVICES_COLLECTION_PATH as unknown as SoftDeleteCrudResourceCollectionPath,
  item: `${DEVICES_COLLECTION_PATH}/{id}` as const,
  query: `${DEVICES_COLLECTION_PATH}/query` as const,
  restore: `${DEVICES_COLLECTION_PATH}/{id}/restore` as const,
  trash: `${DEVICES_COLLECTION_PATH}/trash` as const,
  trashRestore: `${DEVICES_COLLECTION_PATH}/trash/restore` as const,
  trashPermanentDelete: `${DEVICES_COLLECTION_PATH}/trash/permanent` as const,
}) as unknown as SoftDeleteCrudApi<DevicesItem, CreateDevicesInput, UpdateDevicesInput>

export const devicesApi = {
  ...baseDevicesApi,

}
// ==================== AUTO GENERATED END ====================

// ==================== CUSTOM METHODS START ====================

// ==================== CUSTOM METHODS END ====================

// ==================== CUSTOM CONFIG START ====================

// ==================== CUSTOM CONFIG END ====================
