/**
 * role 管理 API
 *
 * ⚠️  此文件由 scripts/generate-api-types.ts 自动生成
 * 自动生成时间: 2026-03-30T06:42:06.046Z
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

const ROLE_COLLECTION_PATH = '/api/v1/roles' satisfies SoftDeleteCrudResourceCollectionPath

export type Role = CrudItem<typeof ROLE_COLLECTION_PATH>

export type CreateRoleInput = CrudCreateInput<typeof ROLE_COLLECTION_PATH>

export type UpdateRoleInput = CrudUpdateInput<typeof ROLE_COLLECTION_PATH>

const baseRoleApi = createSoftDeleteCrudApi({
  collection: ROLE_COLLECTION_PATH,
  item: `${ROLE_COLLECTION_PATH}/{id}` as const,
  query: `${ROLE_COLLECTION_PATH}/query` as const,
  restore: `${ROLE_COLLECTION_PATH}/{id}/restore` as const,
  trash: `${ROLE_COLLECTION_PATH}/trash` as const,
  trashRestore: `${ROLE_COLLECTION_PATH}/trash/restore` as const,
  trashPermanentDelete: `${ROLE_COLLECTION_PATH}/trash/permanent` as const,
})

export const roleApi = {
  ...baseRoleApi,

  // ==================== CUSTOM METHODS ====================
  // 在此区域添加自定义方法（仅追加，不覆盖）
  // 可使用的导入项: ContractResponseData, contractClient
  // ======================================================
}

// ==================== CUSTOM CONFIG START ====================
// 在此区域添加自定义配置（如缓存策略、超时设置等）
// ===========================================================
// ==================== CUSTOM CONFIG END ====================
