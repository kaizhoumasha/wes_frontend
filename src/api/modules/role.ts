/**
 * 角色管理 API
 */

import {
  createSoftDeleteCrudApi,
  type CrudCreateInput,
  type CrudItem,
  type SoftDeleteCrudResourceCollectionPath,
  type CrudUpdateInput,
} from '@/api/base/crud-api'

const ROLE_COLLECTION_PATH = '/api/v1/roles' satisfies SoftDeleteCrudResourceCollectionPath

export type Role = CrudItem<typeof ROLE_COLLECTION_PATH>

export type CreateRoleInput = CrudCreateInput<typeof ROLE_COLLECTION_PATH>

export type UpdateRoleInput = CrudUpdateInput<typeof ROLE_COLLECTION_PATH>

export const roleApi = createSoftDeleteCrudApi({
  collection: ROLE_COLLECTION_PATH,
  item: `${ROLE_COLLECTION_PATH}/{id}` as const,
  query: `${ROLE_COLLECTION_PATH}/query` as const,
  restore: `${ROLE_COLLECTION_PATH}/{id}/restore` as const,
  trash: `${ROLE_COLLECTION_PATH}/trash` as const,
  trashRestore: `${ROLE_COLLECTION_PATH}/trash/restore` as const,
  trashPermanentDelete: `${ROLE_COLLECTION_PATH}/trash/permanent` as const
})
