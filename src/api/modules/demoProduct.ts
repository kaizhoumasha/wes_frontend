/**
 * demoProduct 管理 API
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

const DEMOPRODUCT_COLLECTION_PATH = '/api/v1/demo-products' satisfies SoftDeleteCrudResourceCollectionPath

export type DemoProduct = CrudItem<typeof DEMOPRODUCT_COLLECTION_PATH>

export type CreateDemoProductInput = CrudCreateInput<typeof DEMOPRODUCT_COLLECTION_PATH>

export type UpdateDemoProductInput = CrudUpdateInput<typeof DEMOPRODUCT_COLLECTION_PATH>

const baseDemoProductApi = createSoftDeleteCrudApi({
  collection: DEMOPRODUCT_COLLECTION_PATH,
  item: `${DEMOPRODUCT_COLLECTION_PATH}/{id}` as const,
  query: `${DEMOPRODUCT_COLLECTION_PATH}/query` as const,
  restore: `${DEMOPRODUCT_COLLECTION_PATH}/{id}/restore` as const,
  trash: `${DEMOPRODUCT_COLLECTION_PATH}/trash` as const,
  trashRestore: `${DEMOPRODUCT_COLLECTION_PATH}/trash/restore` as const,
  trashPermanentDelete: `${DEMOPRODUCT_COLLECTION_PATH}/trash/permanent` as const,
})

export const demoProductApi = {
  ...baseDemoProductApi,

  // ==================== CUSTOM METHODS ====================
  // 在此区域添加自定义方法（仅追加，不覆盖）
  // 可使用的导入项: ContractResponseData, contractClient
  // ======================================================
}

// ==================== CUSTOM CONFIG START ====================
// 在此区域添加自定义配置（如缓存策略、超时设置等）
// ===========================================================
// ==================== CUSTOM CONFIG END ====================
