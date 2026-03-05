/**
 * 认证 API
 *
 * 处理用户登录、登出、Token 刷新等认证相关操作
 * 对应后端: src/app/auth/v1/auth.py
 */

import { apiClient } from '../client'
import type { ApiResponse } from '../types'

// ==================== 类型定义 ====================

/**
 * 登录请求
 */
export interface LoginRequest {
  /** 用户名（3-50字符） */
  username: string
  /** 密码（6-100字符） */
  password: string
}

/**
 * Token 响应
 */
export interface TokenResponse {
  /** 访问令牌 */
  access_token: string
  /** 刷新令牌（存储在 HttpOnly Cookie 中，不在响应中返回） */
  refresh_token?: string
  /** 令牌类型（固定为 Bearer） */
  token_type: string
  /** 过期时间（秒） */
  expires_in: number
}

/**
 * 登录响应
 */
export interface LoginResponse {
  /** 访问令牌 */
  access_token: string
  /** 刷新令牌（HttpOnly Cookie，不在响应中） */
  refresh_token?: string
  /** 令牌类型 */
  token_type: string
  /** 过期时间（秒） */
  expires_in: number
  /** 用户信息 */
  user?: UserInfo
}

/**
 * 登出响应
 */
export interface LogoutResponse {
  /** 消息 */
  message: string
  /** 撤销的令牌数量 */
  revoked_count: number
}

/**
 * 刷新令牌响应
 */
export interface RefreshTokenResponse {
  /** 新的访问令牌 */
  access_token: string
  /** 新的刷新令牌 */
  refresh_token: string
  /** 令牌类型 */
  token_type: string
  /** 过期时间（秒） */
  expires_in: number
}

/**
 * 会话信息
 */
export interface SessionInfo {
  /** 会话 UUID */
  session_uuid: string
  /** JWT ID */
  jti: string
  /** 创建时间 */
  created_at: string
  /** 最后活跃时间 */
  last_active_at: string
  /** 设备信息 */
  device_info?: {
    /** 用户代理 */
    user_agent?: string
    /** IP 地址 */
    ip_address?: string
    /** 设备类型 */
    device_type?: string
  }
}

/**
 * 活跃会话响应
 */
export interface ActiveSessionsResponse {
  /** 会话总数 */
  total: number
  /** 会话列表 */
  sessions: SessionInfo[]
}

/**
 * 撤销会话响应
 */
export interface RevokeSessionResponse {
  /** 消息 */
  message: string
  /** 会话 UUID */
  session_uuid: string
}

/**
 * API 权限信息
 */
export interface ApiPermissionInfo {
  /** 权限 ID */
  id: number
  /** 权限标识（如 admin:user:create） */
  name: string
  /** 权限描述 */
  description: string
  /** 权限类型（user_api 或 app_api） */
  type: string
  /** 权限分类 */
  category?: string
  /** 资源 */
  resource?: string
  /** 操作 */
  action?: string
  /** HTTP 方法 */
  method: string
  /** API 路径 */
  path: string
}

/**
 * 用户权限响应
 */
export interface UserPermissionsResponse {
  /** 权限总数 */
  total: number
  /** 权限列表 */
  permissions: ApiPermissionInfo[]
}

/**
 * 用户信息
 */
export interface UserInfo {
  /** 用户 ID */
  id: number
  /** 用户名 */
  username: string
  /** 邮箱 */
  email?: string
  /** 姓名 */
  full_name?: string
  /** 是否为超级用户 */
  is_superuser: boolean
  /** 用户状态 */
  status?: string
}

// ==================== API 函数 ====================

/**
 * 认证 API
 */
export const authApi = {
  /**
   * 用户登录
   *
   * @param credentials 登录凭据
   * @returns 登录响应（包含访问令牌）
   *
   * @example
   * ```ts
   * const result = await authApi.login({
   *   username: 'admin',
   *   password: 'password123'
   * })
   * // result.access_token - 访问令牌（存储到 localStorage）
   * // 刷新令牌自动存储到 HttpOnly Cookie
   * ```
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.Post<ApiResponse<LoginResponse>>(
      '/api/v1/auth/login',
      credentials
    )
    return response as unknown as LoginResponse
  },

  /**
   * 刷新访问令牌
   *
   * 使用 HttpOnly Cookie 中的刷新令牌获取新的访问令牌
   * 新的刷新令牌会自动更新到 HttpOnly Cookie
   *
   * @returns 刷新令牌响应
   */
  async refreshToken(): Promise<RefreshTokenResponse> {
    const response = await apiClient.Post<ApiResponse<RefreshTokenResponse>>(
      '/api/v1/auth/refresh',
      {}
    )
    return response as unknown as RefreshTokenResponse
  },

  /**
   * 用户登出
   *
   * 撤销当前会话的令牌并删除刷新令牌 Cookie
   *
   * @returns 登出响应
   */
  async logout(): Promise<LogoutResponse> {
    const response = await apiClient.Post<ApiResponse<LogoutResponse>>(
      '/api/v1/auth/logout',
      {}
    )
    return response as unknown as LogoutResponse
  },

  /**
   * 强制登出所有设备
   *
   * 撤销用户所有活跃会话的令牌
   *
   * @returns 登出响应
   */
  async logoutAll(): Promise<LogoutResponse> {
    const response = await apiClient.Post<ApiResponse<LogoutResponse>>(
      '/api/v1/auth/logout-all',
      {}
    )
    return response as unknown as LogoutResponse
  },

  /**
   * 获取当前用户的所有活跃会话
   *
   * @returns 活跃会话列表
   */
  async getActiveSessions(): Promise<ActiveSessionsResponse> {
    const response = await apiClient.Get<ApiResponse<ActiveSessionsResponse>>(
      '/api/v1/auth/sessions'
    )
    return response as unknown as ActiveSessionsResponse
  },

  /**
   * 撤销指定会话
   *
   * @param sessionUuid 会话 UUID
   * @returns 撤销响应
   */
  async revokeSession(sessionUuid: string): Promise<RevokeSessionResponse> {
    const response = await apiClient.Delete<ApiResponse<RevokeSessionResponse>>(
      `/api/v1/auth/sessions/${sessionUuid}`
    )
    return response as unknown as RevokeSessionResponse
  },

  /**
   * 获取当前用户的 API 权限列表
   *
   * 用于前端动态路由和权限控制
   *
   * @returns 用户权限列表
   */
  async getPermissions(): Promise<UserPermissionsResponse> {
    const response = await apiClient.Get<ApiResponse<UserPermissionsResponse>>(
      '/api/v1/auth/permissions'
    )
    return response as unknown as UserPermissionsResponse
  },
}
