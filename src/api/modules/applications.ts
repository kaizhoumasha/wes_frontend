// ==================== AUTO GENERATED START ====================
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 自动生成的 API 模块
 *
 * ⚠️  请勿手动编辑 AUTO GENERATED 区域
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 资源: /api/v1/api_auth/applications
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

const APPLICATIONS_COLLECTION_PATH = '/api/v1/api_auth/applications' as const

type EnsureEntityId<TItem> = TItem extends { id?: infer TId }
  ? Omit<TItem, 'id'> & { id: Exclude<TId, null | undefined> }
  : TItem

export type ApplicationsItem = EnsureEntityId<CrudItem<typeof APPLICATIONS_COLLECTION_PATH>>
export type CreateApplicationsInput = CrudCreateInput<typeof APPLICATIONS_COLLECTION_PATH>
export type UpdateApplicationsInput = CrudUpdateInput<typeof APPLICATIONS_COLLECTION_PATH>

export type AvailablePermissionsResult = ContractResponseData<'/api/v1/api_auth/applications/available-permissions', 'get'>
export type AvailablePermissionsQuery = ContractQueryParams<'/api/v1/api_auth/applications/available-permissions', 'get'>

export type RevokeResult = ContractResponseData<'/api/v1/api_auth/applications/{id}/revoke', 'post'>
export type RevokePathParams = ContractPathParams<'/api/v1/api_auth/applications/{id}/revoke', 'post'>

export type ResetValidityResult = ContractResponseData<'/api/v1/api_auth/applications/{id}/reset-validity', 'post'>
export type ResetValidityPathParams = ContractPathParams<'/api/v1/api_auth/applications/{id}/reset-validity', 'post'>
export type ResetValidityInput = ContractRequestBody<'/api/v1/api_auth/applications/{id}/reset-validity', 'post'>

export type TryInvokeResult = ContractResponseData<'/api/v1/api_auth/applications/try/invoke', 'post'>
export type TryInvokeInput = ContractRequestBody<'/api/v1/api_auth/applications/try/invoke', 'post'>

export type PermissionsResult = ContractResponseData<'/api/v1/api_auth/applications/{id}/permissions', 'post'>
export type PermissionsPathParams = ContractPathParams<'/api/v1/api_auth/applications/{id}/permissions', 'post'>
export type PermissionsInput = ContractRequestBody<'/api/v1/api_auth/applications/{id}/permissions', 'post'>

export type ResetSecretResult = ContractResponseData<'/api/v1/api_auth/applications/{id}/reset-secret', 'post'>
export type ResetSecretPathParams = ContractPathParams<'/api/v1/api_auth/applications/{id}/reset-secret', 'post'>

const baseApplicationsApiMethods = createSoftDeleteCrudRequestAdapterMethods({
  collection: APPLICATIONS_COLLECTION_PATH as unknown as SoftDeleteCrudResourceCollectionPath,
  item: `${APPLICATIONS_COLLECTION_PATH}/{id}` as const,
  query: `${APPLICATIONS_COLLECTION_PATH}/query` as const,
  restore: `${APPLICATIONS_COLLECTION_PATH}/{id}/restore` as const,
  trash: `${APPLICATIONS_COLLECTION_PATH}/trash` as const,
  trashRestore: `${APPLICATIONS_COLLECTION_PATH}/trash/restore` as const,
  trashPermanentDelete: `${APPLICATIONS_COLLECTION_PATH}/trash/permanent` as const,
}) as unknown as SoftDeleteCrudApiMethods<ApplicationsItem, CreateApplicationsInput, UpdateApplicationsInput>

export const applicationsApiMethods = {
  ...baseApplicationsApiMethods,

  /**
   * [api-auth:api_application:list_permissions] 获取系统支持的 API 权限列表
   * @description 返回可供分配给 API 应用的权限列表。
   * @endpoint GET /api/v1/api_auth/applications/available-permissions
   * @returns alova method instance
   */
  availablePermissions(query?: ContractQueryParams<'/api/v1/api_auth/applications/available-permissions', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/api_auth/applications/available-permissions', { query, config })
  },

  /**
   * [api-auth:api_application:revoke] 撤销 API 应用
   * @endpoint POST /api/v1/api_auth/applications/{id}/revoke
   * @returns alova method instance
   */
  revoke(params: ContractPathParams<'/api/v1/api_auth/applications/{id}/revoke', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/api_auth/applications/{id}/revoke', { params, config })
  },

  /**
   * 重置应用有效期
   * @description 重置应用有效期

基于 created_at 重新计算 expires_at，而不是从当前时间计算。
这样可以保证"延期"是基于原始创建时间，而不是当前时间。

例如：
- 应用创建于 2024-01-01，设置有效期 1年，过期时间为 2025-01-01
- 2024-06-01 重置有效期为 2年，新的过期时间为 2026-01-01（而不是 2026-06-01）

Args:
    id: 应用 ID
    data: 包含新的有效期时长和修改原因
    db: 数据库会话
   * @endpoint POST /api/v1/api_auth/applications/{id}/reset-validity
   * @returns alova method instance
   */
  resetValidity(params: ContractPathParams<'/api/v1/api_auth/applications/{id}/reset-validity', 'post'>, body: ContractRequestBody<'/api/v1/api_auth/applications/{id}/reset-validity', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/api_auth/applications/{id}/reset-validity', { params, body, config })
  },

  /**
   * [api:try:invoke] 测试 API 调用
   * @description 测试 API 调用

请求格式：{"data": {...}}
   * @endpoint POST /api/v1/api_auth/applications/try/invoke
   * @returns alova method instance
   */
  tryInvoke(body: ContractRequestBody<'/api/v1/api_auth/applications/try/invoke', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/api_auth/applications/try/invoke', { body, config })
  },

  /**
   * [api-auth:api_application:assign_permission] 分配权限
   * @description 为应用分配权限
   * @endpoint POST /api/v1/api_auth/applications/{id}/permissions
   * @returns alova method instance
   */
  permissions(params: ContractPathParams<'/api/v1/api_auth/applications/{id}/permissions', 'post'>, body: ContractRequestBody<'/api/v1/api_auth/applications/{id}/permissions', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/api_auth/applications/{id}/permissions', { params, body, config })
  },

  /**
   * [api-auth:api_application:reset_secret] 重置应用密钥
   * @description 重置应用密钥

⚠️ 注意: 旧密钥将立即失效，新密钥仅返回一次。
   * @endpoint POST /api/v1/api_auth/applications/{id}/reset-secret
   * @returns alova method instance
   */
  resetSecret(params: ContractPathParams<'/api/v1/api_auth/applications/{id}/reset-secret', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/api_auth/applications/{id}/reset-secret', { params, config })
  }
}
// ==================== AUTO GENERATED END ====================

// ==================== CUSTOM METHODS START ====================

// ==================== CUSTOM METHODS END ====================

// ==================== CUSTOM CONFIG START ====================

// ==================== CUSTOM CONFIG END ====================
