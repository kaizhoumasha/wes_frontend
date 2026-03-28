/**
 * 权限管理 API
 */

import {
  createSoftDeleteCrudApi,
  type CrudCreateInput,
  type CrudItem,
  type SoftDeleteCrudResourceCollectionPath,
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

/**
 * 权限管理 API
 */
export const permissionApi = {
  ...basePermissionApi,
  tree: permissionGeneratedApi.tree,
  getSiblings: permissionGeneratedApi.getSiblingsApiV1PermissionsSiblings_nodeId_,
  getAncestors: permissionGeneratedApi.getAncestorsApiV1PermissionsAncestors_nodeId_,
  move: permissionGeneratedApi.move,
}
