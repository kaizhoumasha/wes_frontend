/**
 * menu 管理 API
 *
 * ⚠️  此文件由 scripts/generate-api-types.ts 自动生成
 * 自动生成时间: 2026-03-30T06:42:06.047Z
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
import { menuGeneratedApi } from '@/api/generated/api-clients'

const MENU_COLLECTION_PATH = '/api/v1/menus' satisfies SoftDeleteCrudResourceCollectionPath

export type Menu = CrudItem<typeof MENU_COLLECTION_PATH>

export type CreateMenuInput = CrudCreateInput<typeof MENU_COLLECTION_PATH>

export type UpdateMenuInput = CrudUpdateInput<typeof MENU_COLLECTION_PATH>

const baseMenuApi = createSoftDeleteCrudApi({
  collection: MENU_COLLECTION_PATH,
  item: `${MENU_COLLECTION_PATH}/{id}` as const,
  query: `${MENU_COLLECTION_PATH}/query` as const,
  restore: `${MENU_COLLECTION_PATH}/{id}/restore` as const,
  trash: `${MENU_COLLECTION_PATH}/trash` as const,
  trashRestore: `${MENU_COLLECTION_PATH}/trash/restore` as const,
  trashPermanentDelete: `${MENU_COLLECTION_PATH}/trash/permanent` as const,
})

export const menuApi = {
  ...baseMenuApi,
  tree: menuGeneratedApi.tree,
  siblingsByNode: menuGeneratedApi.siblingsByNode,
  ancestorsByNode: menuGeneratedApi.ancestorsByNode,
  move: menuGeneratedApi.move,
  myMenu: menuGeneratedApi.myMenu,

  // ==================== CUSTOM METHODS ====================
  // 在此区域添加自定义方法（仅追加，不覆盖）
  // 可使用的导入项: ContractResponseData, contractClient
  // ======================================================
}

// ==================== CUSTOM CONFIG START ====================
// 在此区域添加自定义配置（如缓存策略、超时设置等）
// ===========================================================
// ==================== CUSTOM CONFIG END ====================
