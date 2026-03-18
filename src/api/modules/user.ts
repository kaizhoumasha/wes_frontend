/**
 * 用户管理 API
 *
 * 基于 CrudApi 的用户管理模块
 * 对应后端: src/app/admin/v1/user.py
 */

import { z } from 'zod'
import { createCrudApi, type CrudApi } from '../base/crud-api'
import { apiClient, getApiPath } from '../client'
import {
  ResetPasswordRequestSchema,
  RoleResponseSchema,
  UserCreateSchema,
  UserResponseSchema,
  UserUpdateSchema,
} from '../../types/zod-extensions'

// ==================== 类型定义 ====================

export type Role = z.infer<typeof RoleResponseSchema>

export type User = z.infer<typeof UserResponseSchema>

export type CreateUserInput = z.input<typeof UserCreateSchema>

export type UpdateUserInput = z.input<typeof UserUpdateSchema>

export type ResetUserPasswordInput = z.input<typeof ResetPasswordRequestSchema>

export interface UserApi extends CrudApi<User, CreateUserInput, UpdateUserInput> {
  resetPassword: (id: number, data: ResetUserPasswordInput) => Promise<User>
}

// ==================== API 实例 ====================

/**
 * 用户管理 API
 */
export const userApi: UserApi = Object.assign(
  createCrudApi<User, CreateUserInput, UpdateUserInput>({
    prefix: getApiPath('/users')
  }),
  {
    /**
     * 管理员重置用户密码
     *
     * 对应后端:
     * PUT /users/{id}/reset-password
     * 权限: `ADMIN_PERMISSIONS.user.resetPassword`
     */
    async resetPassword(id: number, data: ResetUserPasswordInput): Promise<User> {
      const response = await apiClient.Put<User>(
        getApiPath(`/users/${id}/reset-password`),
        data
      )

      return response
    }
  }
)

// ==================== 使用示例 ====================

/**
 * 推荐的查询方式：使用标准的 query 方法
 *
 * @example
 * ```ts
 * // 按用户名搜索（使用 ilike 模糊匹配）
 * const { items } = await userApi.query({
 *   filters: {
 *     couple: 'and',
 *     conditions: [
 *       { field: 'username', op: 'ilike', value: '%admin%' }
 *     ]
 *   }
 * })
 *
 * // 获取超级用户
 * const { items } = await userApi.query({
 *   filters: {
 *     couple: 'and',
 *     conditions: [
 *       { field: 'is_superuser', op: 'eq', value: true }
 *     ]
 *   }
 * })
 *
 * // 组合查询：超级用户且用户名包含 admin
 * const { items } = await userApi.query({
 *   filters: {
 *     couple: 'and',
 *     conditions: [
 *       { field: 'is_superuser', op: 'eq', value: true },
 *       { field: 'username', op: 'ilike', value: '%admin%' }
 *     ]
 *   }
 * })
 * ```
 */
