/**
 * permission 管理 API
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
import { permissionGeneratedApi } from '@/api/generated/api-clients'

const PERMISSION_COLLECTION_PATH = '/api/v1/permissions' satisfies SoftDeleteCrudResourceCollectionPath

export type Permission = CrudItem<typeof PERMISSION_COLLECTION_PATH>

export type CreatePermissionInput = CrudCreateInput<typeof PERMISSION_COLLECTION_PATH>

export type UpdatePermissionInput = CrudUpdateInput<typeof PERMISSION_COLLECTION_PATH>

const basePermissionApi = createSoftDeleteCrudApi({
  collection: PERMISSION_COLLECTION_PATH,
  item: `${PERMISSION_COLLECTION_PATH}/{id}` as const,
  query: `${PERMISSION_COLLECTION_PATH}/query` as const,
  restore: `${PERMISSION_COLLECTION_PATH}/{id}/restore` as const,
  trash: `${PERMISSION_COLLECTION_PATH}/trash` as const,
  trashRestore: `${PERMISSION_COLLECTION_PATH}/trash/restore` as const,
  trashPermanentDelete: `${PERMISSION_COLLECTION_PATH}/trash/permanent` as const,
})

export const permissionApi = {
  ...basePermissionApi,
  tree: permissionGeneratedApi.tree,
  siblingsByNode: permissionGeneratedApi.siblingsByNode,
  ancestorsByNode: permissionGeneratedApi.ancestorsByNode,
  move: permissionGeneratedApi.move,

  // ==================== CUSTOM METHODS ====================
  // 在此区域添加自定义方法（仅追加，不覆盖）
  // 可使用的导入项: ContractResponseData, contractClient
  // ======================================================
}

// ==================== CUSTOM CONFIG START ====================
// 在此区域添加自定义配置（如缓存策略、超时设置等）
// ===========================================================
// ==================== CUSTOM CONFIG END ====================
