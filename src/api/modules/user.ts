/**
 * 用户管理 API
 */

import {
  createSoftDeleteCrudApi,
  type CrudCreateInput,
  type CrudItem,
  type SoftDeleteCrudResourceCollectionPath,
  type CrudUpdateInput,
} from '@/api/base/crud-api'
import { contractClient } from '@/api/contract/client'
import type {
  ContractPath,
  ContractRequestBody,
  ContractResponseData,
  ContractSchema,
} from '@/api/contract/types'

const USER_COLLECTION_PATH = '/api/v1/users' satisfies SoftDeleteCrudResourceCollectionPath
const USER_RESET_PASSWORD_PATH = '/api/v1/users/{id}/reset-password' satisfies ContractPath
const USER_BULK_DELETE_PATH = '/api/v1/users/bulk' satisfies ContractPath
const USER_ASSIGN_ROLES_PATH = '/api/v1/users/{id}/assign-roles' satisfies ContractPath

export type Role = ContractSchema<'RoleResponse'>

export type User = CrudItem<typeof USER_COLLECTION_PATH>

export type CreateUserInput = CrudCreateInput<typeof USER_COLLECTION_PATH>

export type UpdateUserInput = CrudUpdateInput<typeof USER_COLLECTION_PATH>

export type ResetUserPasswordInput = ContractRequestBody<typeof USER_RESET_PASSWORD_PATH, 'put'>

export type AssignRolesRequest = ContractRequestBody<typeof USER_ASSIGN_ROLES_PATH, 'put'>

type ResetPasswordResult = ContractResponseData<typeof USER_RESET_PASSWORD_PATH, 'put'>

type AssignRolesResult = ContractResponseData<typeof USER_ASSIGN_ROLES_PATH, 'put'>

const baseUserApi = createSoftDeleteCrudApi({
  collection: USER_COLLECTION_PATH,
  item: `${USER_COLLECTION_PATH}/{id}` as const,
  query: `${USER_COLLECTION_PATH}/query` as const,
  restore: `${USER_COLLECTION_PATH}/{id}/restore` as const,
  trash: `${USER_COLLECTION_PATH}/trash` as const,
  trashRestore: `${USER_COLLECTION_PATH}/trash/restore` as const,
  trashPermanentDelete: `${USER_COLLECTION_PATH}/trash/permanent` as const,
  bulkDelete: USER_BULK_DELETE_PATH
})

export const userApi = {
  ...baseUserApi,

  async resetPassword(id: number, data: ResetUserPasswordInput): Promise<ResetPasswordResult> {
    return await contractClient.put(USER_RESET_PASSWORD_PATH, {
      params: { id },
      body: data
    })
  },

  /**
   * 为用户分配角色
   * @param id 用户 ID
   * @param roleIds 角色ID列表
   */
  async assignRoles(id: number, roleIds: number[]): Promise<AssignRolesResult> {
    return await contractClient.put(USER_ASSIGN_ROLES_PATH, {
      params: { id },
      body: { role_ids: roleIds } as AssignRolesRequest
    })
  }
}
