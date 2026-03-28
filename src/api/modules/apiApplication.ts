/**
 * API 应用管理 API
 */

import {
  createSoftDeleteCrudApi,
} from '@/api/base/crud-api'
import { contractClient } from '@/api/contract/client'
import type {
  ContractPath,
  ContractRequestBody,
  ContractResponseData,
} from '@/api/contract/types'
import type { components } from '@/api/generated/openapi-types'

const API_APPLICATION_COLLECTION_PATH = '/api/v1/api-auth/applications'
const API_APPLICATION_RESET_SECRET_PATH = '/api/v1/api-auth/applications/{id}/reset-secret' satisfies ContractPath
const API_APPLICATION_RESET_VALIDITY_PATH = '/api/v1/api-auth/applications/{id}/reset-validity' satisfies ContractPath
const API_APPLICATION_REVOKE_PATH = '/api/v1/api-auth/applications/{id}/revoke' satisfies ContractPath
const API_APPLICATION_ASSIGN_PERMISSIONS_PATH = '/api/v1/api-auth/applications/{id}/permissions' satisfies ContractPath

// 手动定义类型（因为 APIApplicationResponse 的 id 是可选的）
export type APIApplication = Omit<components['schemas']['APIApplicationResponse'], 'id'> & { id: number }
export type CreateAPIApplicationInput = components['schemas']['APIApplicationCreate']
export type UpdateAPIApplicationInput = components['schemas']['APIApplicationUpdate']
export type ResetSecretResult = ContractResponseData<typeof API_APPLICATION_RESET_SECRET_PATH, 'post'>
export type ResetValidityInput = ContractRequestBody<typeof API_APPLICATION_RESET_VALIDITY_PATH, 'post'>
export type ResetValidityResult = ContractResponseData<typeof API_APPLICATION_RESET_VALIDITY_PATH, 'post'>
export type AssignPermissionsInput = ContractRequestBody<typeof API_APPLICATION_ASSIGN_PERMISSIONS_PATH, 'post'>
export type AssignPermissionsResult = ContractResponseData<typeof API_APPLICATION_ASSIGN_PERMISSIONS_PATH, 'post'>
export type RevokeResult = ContractResponseData<typeof API_APPLICATION_REVOKE_PATH, 'post'>

// 使用显式端点定义创建基础 CRUD API
const baseApiApplicationApi = createSoftDeleteCrudApi({
  collection: `${API_APPLICATION_COLLECTION_PATH}` as const,
  item: `${API_APPLICATION_COLLECTION_PATH}/{id}` as const,
  query: `${API_APPLICATION_COLLECTION_PATH}/query` as const,
  restore: `${API_APPLICATION_COLLECTION_PATH}/{id}/restore` as const,
  trash: `${API_APPLICATION_COLLECTION_PATH}/trash` as const,
  trashRestore: `${API_APPLICATION_COLLECTION_PATH}/trash/restore` as const,
  trashPermanentDelete: `${API_APPLICATION_COLLECTION_PATH}/trash/permanent` as const
})

// 导出类型（兼容 CrudPage 组件）
export type APIApplicationApi = typeof apiApplicationApi

export const apiApplicationApi = {
  ...baseApiApplicationApi,

  /**
   * 重置应用密钥
   */
  async resetSecret(id: number): Promise<ResetSecretResult> {
    return await contractClient.post(API_APPLICATION_RESET_SECRET_PATH, {
      params: { id }
    })
  },

  /**
   * 重置应用有效期
   */
  async resetValidity(id: number, data: ResetValidityInput): Promise<ResetValidityResult> {
    return await contractClient.post(API_APPLICATION_RESET_VALIDITY_PATH, {
      params: { id },
      body: data
    })
  },

  /**
   * 分配权限
   */
  async assignPermissions(id: number, data: AssignPermissionsInput): Promise<AssignPermissionsResult> {
    return await contractClient.post(API_APPLICATION_ASSIGN_PERMISSIONS_PATH, {
      params: { id },
      body: data
    })
  },

  /**
   * 撤销应用
   */
  async revoke(id: number): Promise<RevokeResult> {
    return await contractClient.post(API_APPLICATION_REVOKE_PATH, {
      params: { id }
    })
  }
}
