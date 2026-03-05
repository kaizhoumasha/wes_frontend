/**
 * 用户管理 API
 *
 * 基于 CrudApi 的用户管理模块
 * 对应后端: src/app/admin/v1/user.py
 */

import { createCrudApi, CrudApi, type QueryOptions, type PaginationData } from '../base/crud-api'
import { getApiPath } from '../client'

// ==================== 类型定义 ====================

/**
 * 角色信息（与后端 RoleResponse 对齐）
 */
export interface Role {
  /** 角色 ID */
  id: number
  /** 角色名称 */
  name: string
  /** 角色代码 */
  code: string
  /** 是否为内置角色 */
  is_builtin: boolean
  /** 角色描述 */
  description?: string
}

/**
 * 用户实体（与后端 UserResponse 对齐）
 */
export interface User {
  /** 用户 ID */
  id: number
  /** 用户名（3-50字符） */
  username: string
  /** 邮箱（最大100字符） */
  email: string
  /** 全名（最大100字符，可选） */
  full_name?: string
  /** 是否为超级用户 */
  is_superuser: boolean
  /** 是否允许多端登录 */
  is_multi_login: boolean
  /** 用户角色列表 */
  roles: Role[]
  /** 创建时间 */
  created_at: string
  /** 更新时间 */
  updated_at: string
}

/**
 * 创建用户输入（与后端 UserCreate 对齐）
 */
export interface CreateUserInput {
  /** 用户名（3-50字符） */
  username: string
  /** 密码（6-100字符） */
  password: string
  /** 邮箱（最大100字符） */
  email: string
  /** 全名（最大100字符，可选） */
  full_name?: string
}

/**
 * 更新用户输入（与后端 UserUpdate 对齐）
 */
export interface UpdateUserInput {
  /** 邮箱（最大100字符） */
  email?: string
  /** 全名（最大100字符） */
  full_name?: string
}

// ==================== API 实例 ====================

/**
 * 用户管理 API
 */
export const userApi = createCrudApi<User, CreateUserInput, UpdateUserInput>({
  prefix: getApiPath('/users'),
})

// ==================== 自定义查询方法 ====================

/**
 * 用户查询扩展
 */
export class UserQuery extends CrudApi<User, CreateUserInput, UpdateUserInput> {
  /**
   * 按用户名搜索
   */
  async searchByUsername(keyword: string, options: QueryOptions = {}): Promise<PaginationData<User>> {
    return this.query({
      ...options,
      filters: {
        ...options.filters,
        keyword,
      },
    })
  }

  /**
   * 获取超级用户
   */
  async getSuperUsers(options: QueryOptions = {}): Promise<PaginationData<User>> {
    return this.query({
      ...options,
      filters: {
        ...options.filters,
        is_superuser: true,
      },
    })
  }
}

/**
 * 带扩展查询的用户 API
 */
export const userApiExtended = new UserQuery({
  prefix: getApiPath('/users'),
})
