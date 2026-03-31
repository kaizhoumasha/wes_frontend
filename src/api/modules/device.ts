/**
 * device 管理 API
 *
 * ⚠️  此文件由 scripts/generate-api-types.ts 自动生成
 * 自动生成时间: 2026-03-30T06:42:06.048Z
 *
 * 如需添加自定义方法，请在以下占位符区域添加：
 * // ==================== CUSTOM METHODS ====================
 */

import {
  createSoftDeleteCrudApi,
  type SoftDeleteCrudResourceCollectionPath,
  type CrudCreateInput,
  type CrudItem,
  type CrudUpdateInput,
} from '@/api/base/crud-api'

const DEVICE_COLLECTION_PATH = '/api/v1/devices' satisfies SoftDeleteCrudResourceCollectionPath

export type Device = CrudItem<typeof DEVICE_COLLECTION_PATH>

export type CreateDeviceInput = CrudCreateInput<typeof DEVICE_COLLECTION_PATH>

export type UpdateDeviceInput = CrudUpdateInput<typeof DEVICE_COLLECTION_PATH>

const baseDeviceApi = createSoftDeleteCrudApi({
  collection: DEVICE_COLLECTION_PATH,
  item: `${DEVICE_COLLECTION_PATH}/{id}` as const,
  query: `${DEVICE_COLLECTION_PATH}/query` as const,
  restore: `${DEVICE_COLLECTION_PATH}/{id}/restore` as const,
  trash: `${DEVICE_COLLECTION_PATH}/trash` as const,
  trashRestore: `${DEVICE_COLLECTION_PATH}/trash/restore` as const,
  trashPermanentDelete: `${DEVICE_COLLECTION_PATH}/trash/permanent` as const,
})

export const deviceApi = {
  ...baseDeviceApi,

  // ==================== CUSTOM METHODS ====================
  // 在此区域添加自定义方法（仅追加，不覆盖）
  // 可使用的导入项: ContractResponseData, contractClient
  // ======================================================
}

// ==================== CUSTOM CONFIG START ====================
// 在此区域添加自定义配置（如缓存策略、超时设置等）
// ===========================================================
// ==================== CUSTOM CONFIG END ====================
