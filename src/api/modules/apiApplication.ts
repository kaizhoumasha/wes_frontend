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
export type ResetSecretResult = Awaited<ReturnType<typeof apiAuthGeneratedApi.resetSecret>>
export type ResetValidityResult = Awaited<ReturnType<typeof apiAuthGeneratedApi.resetValidity>>
export type AssignPermissionsResult = Awaited<ReturnType<typeof apiAuthGeneratedApi.permissions>>
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
 * 转换加载的数据：将 ip_whitelist 从数组转换为换行符分隔的字符串
 * 用于编辑表单显示
 * 注意：Zod 的 preprocess 会在提交时自动将字符串转换为数组，所以只需处理加载
 */
function transformArrayFields(data: Record<string, unknown>): Record<string, unknown> {
  const ipWhitelist = data.ip_whitelist
  if (Array.isArray(ipWhitelist)) {
    return { ...data, ip_whitelist: ipWhitelist.join('\n') }
  }
  return data
}

/**
 * API 应用管理 API
 */
export const apiApplicationApi = {
  ...baseApiApplicationApi,

  // 包装 getById 方法，在加载数据时转换数组字段为字符串
  async getById(id: number): Promise<APIApplication> {
    const data = await baseApiApplicationApi.getById(id)
    return transformArrayFields(data as Record<string, unknown>) as APIApplication
  },

  // 生成客户端方法的友好别名
  /** 重置应用密钥 */
  resetSecret: apiAuthGeneratedApi.resetSecret,

  /** 重置应用有效期 */
  resetValidity: apiAuthGeneratedApi.resetValidity,

  /** 分配权限 */
  assignPermissions: apiAuthGeneratedApi.permissions,

  /** 撤销应用 */
  revoke: apiAuthGeneratedApi.revoke
}