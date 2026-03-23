/**
 * 用户管理 API
 */

import {
  createCrudResourceApi,
  type CrudCreateInput,
  type CrudItem,
  type CrudResourceCollectionPath,
  type CrudUpdateInput,
} from '@/api/base/crud-api'
import { contractClient } from '@/api/contract/client'
import type {
  ContractPath,
  ContractRequestBody,
  ContractResponseData,
  ContractSchema,
} from '@/api/contract/types'

const USER_COLLECTION_PATH = '/api/v1/users' satisfies CrudResourceCollectionPath
const USER_RESET_PASSWORD_PATH = '/api/v1/users/{id}/reset-password' satisfies ContractPath

export type Role = ContractSchema<'RoleResponse'>

export type User = CrudItem<typeof USER_COLLECTION_PATH>

export type CreateUserInput = CrudCreateInput<typeof USER_COLLECTION_PATH>

export type UpdateUserInput = CrudUpdateInput<typeof USER_COLLECTION_PATH>

export type ResetUserPasswordInput = ContractRequestBody<typeof USER_RESET_PASSWORD_PATH, 'put'>

type ResetPasswordResult = ContractResponseData<typeof USER_RESET_PASSWORD_PATH, 'put'>

const baseUserApi = createCrudResourceApi(USER_COLLECTION_PATH)

export const userApi = {
  ...baseUserApi,

  async resetPassword(id: number, data: ResetUserPasswordInput): Promise<ResetPasswordResult> {
    return await contractClient.put(USER_RESET_PASSWORD_PATH, {
      params: { id },
      body: data
    })
  }
}
