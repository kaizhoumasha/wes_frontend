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
import { contractMethods } from '@/api/contract/client'
import type {
  ContractPathParams,
  ContractQueryParams,
  ContractRequestBody,
  ContractRequestConfig,
  ContractResponseData,
} from '@/api/contract/types'
import type { components, paths } from '@/api/generated/openapi-types'
import {
  type SoftDeleteCrudApiMethods,
  createSoftDeleteCrudRequestAdapterMethods,
  type CrudCreateInput,
  type CrudItem,
  type CrudResourceCollectionPath,
  type CrudUpdateInput,
  type SoftDeleteCrudResourceCollectionPath,
} from '@/api/base/crud-request-adapter'

const DEVICES_COLLECTION_PATH = '/api/v1/device/devices' as const

type EnsureEntityId<TItem> = TItem extends { id?: infer TId }
  ? Omit<TItem, 'id'> & { id: Exclude<TId, null | undefined> }
  : TItem

export type DevicesItem = EnsureEntityId<CrudItem<typeof DEVICES_COLLECTION_PATH>>
export type CreateDevicesInput = CrudCreateInput<typeof DEVICES_COLLECTION_PATH>
export type UpdateDevicesInput = CrudUpdateInput<typeof DEVICES_COLLECTION_PATH>

export type RuntimeEnterMaintenanceResult = ContractResponseData<'/api/v1/device/devices/{id}/runtime/enter-maintenance', 'post'>
export type RuntimeEnterMaintenancePathParams = ContractPathParams<'/api/v1/device/devices/{id}/runtime/enter-maintenance', 'post'>
export type RuntimeEnterMaintenanceInput = ContractRequestBody<'/api/v1/device/devices/{id}/runtime/enter-maintenance', 'post'>

export type RuntimeExitMaintenanceResult = ContractResponseData<'/api/v1/device/devices/{id}/runtime/exit-maintenance', 'post'>
export type RuntimeExitMaintenancePathParams = ContractPathParams<'/api/v1/device/devices/{id}/runtime/exit-maintenance', 'post'>
export type RuntimeExitMaintenanceInput = ContractRequestBody<'/api/v1/device/devices/{id}/runtime/exit-maintenance', 'post'>

export type RuntimeClearFaultResult = ContractResponseData<'/api/v1/device/devices/{id}/runtime/clear-fault', 'post'>
export type RuntimeClearFaultPathParams = ContractPathParams<'/api/v1/device/devices/{id}/runtime/clear-fault', 'post'>
export type RuntimeClearFaultInput = ContractRequestBody<'/api/v1/device/devices/{id}/runtime/clear-fault', 'post'>

export type PermanentResult = ContractResponseData<'/api/v1/device/devices/{id}/permanent', 'delete'>
export type PermanentPathParams = ContractPathParams<'/api/v1/device/devices/{id}/permanent', 'delete'>

const baseDevicesApiMethods = createSoftDeleteCrudRequestAdapterMethods({
  collection: DEVICES_COLLECTION_PATH as unknown as SoftDeleteCrudResourceCollectionPath,
  item: `${DEVICES_COLLECTION_PATH}/{id}` as const,
  query: `${DEVICES_COLLECTION_PATH}/query` as const,
  restore: `${DEVICES_COLLECTION_PATH}/{id}/restore` as const,
  trash: `${DEVICES_COLLECTION_PATH}/trash` as const,
  trashRestore: `${DEVICES_COLLECTION_PATH}/trash/restore` as const,
  trashPermanentDelete: `${DEVICES_COLLECTION_PATH}/trash/permanent` as const,
}) as unknown as SoftDeleteCrudApiMethods<DevicesItem, CreateDevicesInput, UpdateDevicesInput>

export const devicesApiMethods = {
  ...baseDevicesApiMethods,

  /**
   * [biz:device:update] 设备进入维护
   * @endpoint POST /api/v1/device/devices/{id}/runtime/enter-maintenance
   * @returns alova method instance
   */
  runtimeEnterMaintenance(params: ContractPathParams<'/api/v1/device/devices/{id}/runtime/enter-maintenance', 'post'>, body: ContractRequestBody<'/api/v1/device/devices/{id}/runtime/enter-maintenance', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/device/devices/{id}/runtime/enter-maintenance', { params, body, config })
  },

  /**
   * [biz:device:update] 设备退出维护
   * @endpoint POST /api/v1/device/devices/{id}/runtime/exit-maintenance
   * @returns alova method instance
   */
  runtimeExitMaintenance(params: ContractPathParams<'/api/v1/device/devices/{id}/runtime/exit-maintenance', 'post'>, body: ContractRequestBody<'/api/v1/device/devices/{id}/runtime/exit-maintenance', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/device/devices/{id}/runtime/exit-maintenance', { params, body, config })
  },

  /**
   * [biz:device:update] 清除设备故障
   * @endpoint POST /api/v1/device/devices/{id}/runtime/clear-fault
   * @returns alova method instance
   */
  runtimeClearFault(params: ContractPathParams<'/api/v1/device/devices/{id}/runtime/clear-fault', 'post'>, body: ContractRequestBody<'/api/v1/device/devices/{id}/runtime/clear-fault', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/device/devices/{id}/runtime/clear-fault', { params, body, config })
  },

  /**
   * [biz:device:permanent_delete] 永久删除Device
   * @endpoint DELETE /api/v1/device/devices/{id}/permanent
   * @returns alova method instance
   */
  permanent(params: ContractPathParams<'/api/v1/device/devices/{id}/permanent', 'delete'>, config?: ContractRequestConfig) {
    return contractMethods.delete('/api/v1/device/devices/{id}/permanent', { params, config })
  }
}
// ==================== AUTO GENERATED END ====================

// ==================== CUSTOM METHODS START ====================

// ==================== CUSTOM METHODS END ====================

// ==================== CUSTOM CONFIG START ====================

// ==================== CUSTOM CONFIG END ====================
