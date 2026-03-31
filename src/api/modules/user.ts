/**
 * user 管理 API
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
import { userGeneratedApi } from '@/api/generated/api-clients'
import type { components } from '@/api/generated/openapi-types'

// 类型导出
export type ResetUserPasswordInput = components['schemas']['ResetPasswordRequest']

const USER_COLLECTION_PATH = '/api/v1/users' satisfies SoftDeleteCrudResourceCollectionPath
const USER_BULK_DELETE_PATH = '/api/v1/users/bulk' as const

export type User = CrudItem<typeof USER_COLLECTION_PATH>

export type CreateUserInput = CrudCreateInput<typeof USER_COLLECTION_PATH>

export type UpdateUserInput = CrudUpdateInput<typeof USER_COLLECTION_PATH>

const baseUserApi = createSoftDeleteCrudApi({
  collection: USER_COLLECTION_PATH,
  item: `${USER_COLLECTION_PATH}/{id}` as const,
  query: `${USER_COLLECTION_PATH}/query` as const,
  restore: `${USER_COLLECTION_PATH}/{id}/restore` as const,
  trash: `${USER_COLLECTION_PATH}/trash` as const,
  trashRestore: `${USER_COLLECTION_PATH}/trash/restore` as const,
  trashPermanentDelete: `${USER_COLLECTION_PATH}/trash/permanent` as const,
  bulkDelete: USER_BULK_DELETE_PATH,
})

export const userApi = {
  ...baseUserApi,
  statsCache: userGeneratedApi.statsCache,
  resetPassword: userGeneratedApi.resetPassword,
  assignRoles: userGeneratedApi.assignRoles,

  // ==================== CUSTOM METHODS ====================
  // 在此区域添加自定义方法（仅追加，不覆盖）
  // 可使用的导入项: ContractResponseData, contractClient
  // ======================================================
}

// ==================== CUSTOM CONFIG START ====================
// 在此区域添加自定义配置（如缓存策略、超时设置等）
// ===========================================================
// ==================== CUSTOM CONFIG END ====================
