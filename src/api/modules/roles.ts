// ==================== AUTO GENERATED START ====================
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 自动生成的 API 模块
 *
 * ⚠️  请勿手动编辑 AUTO GENERATED 区域
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 资源: /api/v1/admin/roles
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

const ROLES_COLLECTION_PATH = '/api/v1/admin/roles' as const

type EnsureEntityId<TItem> = TItem extends { id?: infer TId }
  ? Omit<TItem, 'id'> & { id: Exclude<TId, null | undefined> }
  : TItem

export type RolesItem = EnsureEntityId<CrudItem<typeof ROLES_COLLECTION_PATH>>
export type CreateRolesInput = CrudCreateInput<typeof ROLES_COLLECTION_PATH>
export type UpdateRolesInput = CrudUpdateInput<typeof ROLES_COLLECTION_PATH>

const baseRolesApiMethods = createSoftDeleteCrudRequestAdapterMethods({
  collection: ROLES_COLLECTION_PATH as unknown as SoftDeleteCrudResourceCollectionPath,
  item: `${ROLES_COLLECTION_PATH}/{id}` as const,
  query: `${ROLES_COLLECTION_PATH}/query` as const,
  restore: `${ROLES_COLLECTION_PATH}/{id}/restore` as const,
  trash: `${ROLES_COLLECTION_PATH}/trash` as const,
  trashRestore: `${ROLES_COLLECTION_PATH}/trash/restore` as const,
  trashPermanentDelete: `${ROLES_COLLECTION_PATH}/trash/permanent` as const,
}) as unknown as SoftDeleteCrudApiMethods<RolesItem, CreateRolesInput, UpdateRolesInput>

export const rolesApiMethods = {
  ...baseRolesApiMethods,
}
// ==================== AUTO GENERATED END ====================

// ==================== CUSTOM METHODS START ====================

// ==================== CUSTOM METHODS END ====================

// ==================== CUSTOM CONFIG START ====================

// ==================== CUSTOM CONFIG END ====================
