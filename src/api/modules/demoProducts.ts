// ==================== AUTO GENERATED START ====================
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 自动生成的 API 模块
 *
 * ⚠️  请勿手动编辑 AUTO GENERATED 区域
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 资源: /api/v1/demo/demo-products
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

const DEMO_PRODUCTS_COLLECTION_PATH = '/api/v1/demo/demo-products' as const

type EnsureEntityId<TItem> = TItem extends { id?: infer TId }
  ? Omit<TItem, 'id'> & { id: Exclude<TId, null | undefined> }
  : TItem

export type DemoProductsItem = EnsureEntityId<CrudItem<typeof DEMO_PRODUCTS_COLLECTION_PATH>>
export type CreateDemoProductsInput = CrudCreateInput<typeof DEMO_PRODUCTS_COLLECTION_PATH>
export type UpdateDemoProductsInput = CrudUpdateInput<typeof DEMO_PRODUCTS_COLLECTION_PATH>

const baseDemoProductsApiMethods = createSoftDeleteCrudRequestAdapterMethods({
  collection: DEMO_PRODUCTS_COLLECTION_PATH as unknown as SoftDeleteCrudResourceCollectionPath,
  item: `${DEMO_PRODUCTS_COLLECTION_PATH}/{id}` as const,
  query: `${DEMO_PRODUCTS_COLLECTION_PATH}/query` as const,
  restore: `${DEMO_PRODUCTS_COLLECTION_PATH}/{id}/restore` as const,
  trash: `${DEMO_PRODUCTS_COLLECTION_PATH}/trash` as const,
  trashRestore: `${DEMO_PRODUCTS_COLLECTION_PATH}/trash/restore` as const,
  trashPermanentDelete: `${DEMO_PRODUCTS_COLLECTION_PATH}/trash/permanent` as const,
}) as unknown as SoftDeleteCrudApiMethods<DemoProductsItem, CreateDemoProductsInput, UpdateDemoProductsInput>

export const demoProductsApiMethods = {
  ...baseDemoProductsApiMethods,
}
// ==================== AUTO GENERATED END ====================

// ==================== CUSTOM METHODS START ====================

// ==================== CUSTOM METHODS END ====================

// ==================== CUSTOM CONFIG START ====================

// ==================== CUSTOM CONFIG END ====================
