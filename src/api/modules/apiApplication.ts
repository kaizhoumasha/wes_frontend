/**
 * API 应用管理 API
 */

import {
  createSoftDeleteCrudApi,
} from '@/api/base/crud-api'
import { apiAuthGeneratedApi } from '@/api/generated/api-clients'
import type { components } from '@/api/generated/openapi-types'

const API_APPLICATION_COLLECTION_PATH = '/api/v1/api-auth/applications'

// 手动定义类型（因为 APIApplicationResponse 的 id 是可选的）
export type APIApplication = Omit<components['schemas']['APIApplicationResponse'], 'id'> & { id: number }
export type CreateAPIApplicationInput = components['schemas']['APIApplicationCreate']
export type UpdateAPIApplicationInput = components['schemas']['APIApplicationUpdate']
export type ResetSecretResult = Awaited<ReturnType<typeof apiAuthGeneratedApi.secret>>
export type ResetValidityResult = Awaited<ReturnType<typeof apiAuthGeneratedApi.validity>>
export type AssignPermissionsResult = Awaited<ReturnType<typeof apiAuthGeneratedApi.permissions2>>
export type RevokeResult = Awaited<ReturnType<typeof apiAuthGeneratedApi.revoke>>

// 基础 CRUD API
const baseApiApplicationApi = createSoftDeleteCrudApi({
  collection: `${API_APPLICATION_COLLECTION_PATH}` as const,
  item: `${API_APPLICATION_COLLECTION_PATH}/{id}` as const,
  query: `${API_APPLICATION_COLLECTION_PATH}/query` as const,
  restore: `${API_APPLICATION_COLLECTION_PATH}/{id}/restore` as const,
  trash: `${API_APPLICATION_COLLECTION_PATH}/trash` as const,
  trashRestore: `${API_APPLICATION_COLLECTION_PATH}/trash/restore` as const,
  trashPermanentDelete: `${API_APPLICATION_COLLECTION_PATH}/trash/permanent` as const
})

/**
 * API 应用管理 API
 */
export const apiApplicationApi = {
  ...baseApiApplicationApi,

  // 生成客户端方法的友好别名
  /** 重置应用密钥 */
  resetSecret: apiAuthGeneratedApi.secret,

  /** 重置应用有效期 */
  resetValidity: apiAuthGeneratedApi.validity,

  /** 分配权限 */
  assignPermissions: apiAuthGeneratedApi.permissions2,

  /** 撤销应用 */
  revoke: apiAuthGeneratedApi.revoke
}
