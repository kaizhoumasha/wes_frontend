/**
 * 用户管理 API
 *
 * 基于 CrudApi 的用户管理模块
 * 对应后端: src/app/admin/v1/user.py
 */

import { createCrudApi, CrudApi, type QueryOptions, type PaginationData } from '../base/crud-api'

// ==================== 类型定义 ====================

/**
 * 用户状态枚举
 */
export enum UserStatus {
  /** 活跃 */
  ACTIVE = 'active',
  /** 禁用 */
  DISABLED = 'disabled',
  /** 已删除 */
  DELETED = 'deleted',
}

/**
 * 用户实体
 */
export interface User {
  /** 用户ID */
  id: number
  /** 用户名 */
  username: string
  /** 邮箱 */
  email: string
  /** 手机号 */
  phone?: string
  /** 姓名 */
  full_name?: string
  /** 用户状态 */
  status: UserStatus
  /** 是否为超级用户 */
  is_superuser: boolean
  /** 创建时间 */
  created_at: string
  /** 更新时间 */
  updated_at: string
  /** 最后登录时间 */
  last_login_at?: string
}

/**
 * 创建用户输入
 */
export interface CreateUserInput {
  /** 用户名（3-50字符） */
  username: string
  /** 密码（6-100字符） */
  password: string
  /** 邮箱 */
  email: string
  /** 手机号 */
  phone?: string
  /** 姓名 */
  full_name?: string
  /** 是否为超级用户 */
  is_superuser?: boolean
}

/**
 * 更新用户输入
 */
export interface UpdateUserInput {
  /** 邮箱 */
  email?: string
  /** 手机号 */
  phone?: string
  /** 姓名 */
  full_name?: string
  /** 用户状态 */
  status?: UserStatus
  /** 是否为超级用户 */
  is_superuser?: boolean
}

// ==================== API 实例 ====================

/**
 * 用户管理 API
 *
 * @example
 * ```ts
 * import { userApi } from '@/api/modules/user'
 *
 * // 查询用户列表
 * const users = await userApi.query({ page: 1, pageSize: 10 })
 *
 * // 获取单个用户
 * const user = await userApi.getById(1)
 *
 * // 创建用户
 * const newUser = await userApi.create({
 *   username: 'john',
 *   password: 'password123',
 *   email: 'john@example.com'
 * })
 *
 * // 更新用户
 * await userApi.update(1, { email: 'newemail@example.com' })
 *
 * // 删除用户（软删除）
 * await userApi.delete(1)
 *
 * // 永久删除
 * await userApi.delete(1, true)
 *
 * // 批量删除
 * const result = await userApi.bulkDelete([1, 2, 3])
 *
 * // 恢复已删除的用户
 * await userApi.restore(1)
 *
 * // 获取回收站
 * const trash = await userApi.getTrash(1, 10)
 *
 * // 批量恢复
 * await userApi.bulkRestore([1, 2, 3])
 *
 * // 批量永久删除
 * await userApi.bulkPermanentDelete([1, 2, 3])
 * ```
 */
export const userApi = createCrudApi<User, CreateUserInput, UpdateUserInput>({
  prefix: '/api/v1/users',
})

// ==================== 自定义查询方法 ====================

/**
 * 用户查询扩展
 */
export class UserQuery extends CrudApi<User, CreateUserInput, UpdateUserInput> {
  /**
   * 按状态查询用户
   */
  async getByStatus(status: UserStatus, options: QueryOptions = {}): Promise<PaginationData<User>> {
    return this.query({
      ...options,
      filters: { ...options.filters, status },
    })
  }

  /**
   * 搜索用户
   */
  async search(keyword: string, options: QueryOptions = {}): Promise<PaginationData<User>> {
    return this.query({
      ...options,
      filters: {
        ...options.filters,
        // 后端支持的关键词搜索，具体字段根据后端实现调整
        keyword,
      },
    })
  }

  /**
   * 获取活跃用户
   */
  async getActiveUsers(options: QueryOptions = {}): Promise<PaginationData<User>> {
    return this.getByStatus(UserStatus.ACTIVE, options)
  }
}

/**
 * 带扩展查询的用户 API
 */
export const userApiExtended = new UserQuery({
  prefix: '/api/v1/users',
})
