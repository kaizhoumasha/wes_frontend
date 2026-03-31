// ==================== AUTO GENERATED START ====================
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 自动生成的 API 模块
 *
 * ⚠️  请勿手动编辑 AUTO GENERATED 区域
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 资源: /api/v1/admin/users
 */
import { contractClient } from '@/api/contract/client'
import type {
  ContractPathParams,
  ContractQueryParams,
  ContractRequestBody,
  ContractRequestConfig,
  ContractResponseData,
} from '@/api/contract/types'
import type { components, paths } from '@/api/generated/openapi-types'
import {
  type SoftDeleteCrudApi,
  createSoftDeleteCrudApi,
  type CrudCreateInput,
  type CrudItem,
  type CrudResourceCollectionPath,
  type CrudUpdateInput,
  type SoftDeleteCrudResourceCollectionPath,
} from '@/api/base/crud-api'

const USERS_COLLECTION_PATH = '/api/v1/admin/users' as const
const USERS_BULK_DELETE_PATH = '/api/v1/admin/users/bulk' as const

type EnsureEntityId<TItem> = TItem extends { id?: infer TId }
  ? Omit<TItem, 'id'> & { id: Exclude<TId, null | undefined> }
  : TItem

export type UsersItem = EnsureEntityId<CrudItem<typeof USERS_COLLECTION_PATH>>
export type CreateUsersInput = CrudCreateInput<typeof USERS_COLLECTION_PATH>
export type UpdateUsersInput = CrudUpdateInput<typeof USERS_COLLECTION_PATH>

export type StatsCacheResult = ContractResponseData<'/api/v1/admin/users/stats/cache', 'get'>

export type ResetPasswordResult = ContractResponseData<'/api/v1/admin/users/{id}/reset-password', 'put'>
export type ResetPasswordPathParams = ContractPathParams<'/api/v1/admin/users/{id}/reset-password', 'put'>
export type ResetPasswordInput = ContractRequestBody<'/api/v1/admin/users/{id}/reset-password', 'put'>

export type AssignRolesResult = ContractResponseData<'/api/v1/admin/users/{id}/assign-roles', 'put'>
export type AssignRolesPathParams = ContractPathParams<'/api/v1/admin/users/{id}/assign-roles', 'put'>
export type AssignRolesInput = ContractRequestBody<'/api/v1/admin/users/{id}/assign-roles', 'put'>

const baseUsersApi = createSoftDeleteCrudApi({
  collection: USERS_COLLECTION_PATH as unknown as SoftDeleteCrudResourceCollectionPath,
  item: `${USERS_COLLECTION_PATH}/{id}` as const,
  query: `${USERS_COLLECTION_PATH}/query` as const,
  restore: `${USERS_COLLECTION_PATH}/{id}/restore` as const,
  trash: `${USERS_COLLECTION_PATH}/trash` as const,
  trashRestore: `${USERS_COLLECTION_PATH}/trash/restore` as const,
  trashPermanentDelete: `${USERS_COLLECTION_PATH}/trash/permanent` as const,
  bulkDelete: USERS_BULK_DELETE_PATH,
}) as unknown as SoftDeleteCrudApi<UsersItem, CreateUsersInput, UpdateUsersInput>

export const usersApi = {
  ...baseUsersApi,

  /**
   * [admin:user:stats] 获取缓存统计
   * @description 获取缓存统计信息

返回：
- total_users: 总用户数
- cache_status: 缓存服务状态
- cache_keys_count: 缓存键数量（如果 Redis 可用）
   * @endpoint GET /api/v1/admin/users/stats/cache
   */
  async statsCache(config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/admin/users/stats/cache', 'get'>> {
    return await contractClient.get('/api/v1/admin/users/stats/cache', { config })
  },

  /**
   * [admin:user:reset-password] 重置用户密码
   * @description 管理员重置用户密码

重置密码后，用户需要重新登录。

**权限要求**：`admin:user:reset-password`

**安全措施**：
- 重置后自动撤销所有活跃会话
- 清除权限缓存

Args:
    id: 用户 ID
    data: 重置密码请求数据
    db: 数据库会话
    cache: 缓存服务

Returns:
    更新后的用户信息
   * @endpoint PUT /api/v1/admin/users/{id}/reset-password
   */
  async resetPassword(params: ContractPathParams<'/api/v1/admin/users/{id}/reset-password', 'put'>, body: ContractRequestBody<'/api/v1/admin/users/{id}/reset-password', 'put'>, config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/admin/users/{id}/reset-password', 'put'>> {
    return await contractClient.put('/api/v1/admin/users/{id}/reset-password', { params, body, config })
  },

  /**
   * [admin:user:assign-roles] 为用户分配角色
   * @description 为用户分配角色

分配角色后：
- 用户的权限会立即更新
- 如果用户当前已登录，权限变更会在下次请求时生效

**权限要求**：`admin:user:assign-roles`

Args:
    id: 用户 ID
    data: 角色分配请求数据
    db: 数据库会话
    cache: 缓存服务

Returns:
    更新后的用户信息（包含角色列表）
   * @endpoint PUT /api/v1/admin/users/{id}/assign-roles
   */
  async assignRoles(params: ContractPathParams<'/api/v1/admin/users/{id}/assign-roles', 'put'>, body: ContractRequestBody<'/api/v1/admin/users/{id}/assign-roles', 'put'>, config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/admin/users/{id}/assign-roles', 'put'>> {
    return await contractClient.put('/api/v1/admin/users/{id}/assign-roles', { params, body, config })
  }
}
// ==================== AUTO GENERATED END ====================

// ==================== CUSTOM METHODS START ====================

// ==================== CUSTOM METHODS END ====================

// ==================== CUSTOM CONFIG START ====================

// ==================== CUSTOM CONFIG END ====================
