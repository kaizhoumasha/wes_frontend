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
import { userGeneratedApi } from '@/api/generated/api-clients'
import type { components } from '@/api/generated/openapi-types'
import type { ResetUserPasswordInput, AssignRolesRequest } from './types'

const USER_COLLECTION_PATH = '/api/v1/users' satisfies SoftDeleteCrudResourceCollectionPath

// 类型导出
export type Role = components['schemas']['RoleResponse']
export type User = CrudItem<typeof USER_COLLECTION_PATH>
export type CreateUserInput = CrudCreateInput<typeof USER_COLLECTION_PATH>
export type UpdateUserInput = CrudUpdateInput<typeof USER_COLLECTION_PATH>
export type { ResetUserPasswordInput, AssignRolesRequest }

// 基础 CRUD API
const baseUserApi = createSoftDeleteCrudApi({
  collection: USER_COLLECTION_PATH,
  item: `${USER_COLLECTION_PATH}/{id}` as const,
  query: `${USER_COLLECTION_PATH}/query` as const,
  restore: `${USER_COLLECTION_PATH}/{id}/restore` as const,
  trash: `${USER_COLLECTION_PATH}/trash` as const,
  trashRestore: `${USER_COLLECTION_PATH}/trash/restore` as const,
  trashPermanentDelete: `${USER_COLLECTION_PATH}/trash/permanent` as const,
  bulkDelete: `${USER_COLLECTION_PATH}/bulk` as const
})

/**
 * 用户管理 API
 */
export const userApi = {
  ...baseUserApi,

  /**
   * 重置用户密码
   * @param id 用户ID
   * @param data 重置密码请求
   */
  async resetPassword(id: number, data: ResetUserPasswordInput) {
    return await userGeneratedApi.password({ id }, data)
  },

  /**
   * 为用户分配角色
   * @param id 用户ID
   * @param roleIds 角色ID列表
   */
  async assignRoles(id: number, roleIds: number[]) {
    return await userGeneratedApi.roles({ id }, { role_ids: roleIds })
  },

  /** 获取用户缓存统计 */
  getCacheStats: userGeneratedApi.cache
}
