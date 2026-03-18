/**
 * 认证 API
 *
 * 处理用户登录、登出、Token 刷新等认证相关操作
 * 对应后端: src/app/auth/v1/auth.py
 */

import { z } from 'zod'
import { apiClient, getApiPath } from '../client'
import type { ApiResponse } from '../types/response'
import { API_CACHE_DURATION } from '@/constants/cache'
import {
  ActiveSessionsResponseSchema,
  ApiPermissionInfoSchema,
  AuthMyResponseSchema,
  LoginRequestSchema,
  LoginResponseSchema,
  LogoutResponseSchema,
  MenuTreeResponseSchema,
  RefreshTokenResponseSchema,
  RevokeSessionResponseSchema,
  SessionInfoSchema,
  UserPermissionsResponseSchema,
  UserResponseSchema,
} from '../../types/zod-extensions'

// ==================== 类型定义 ====================

export type LoginRequest = z.input<typeof LoginRequestSchema>

export type LoginResponse = z.infer<typeof LoginResponseSchema>

export type TokenResponse = Pick<RefreshTokenResponse, 'access_token' | 'refresh_token' | 'expires_in'>

export type LogoutResponse = z.infer<typeof LogoutResponseSchema>

export type RefreshTokenResponse = z.infer<typeof RefreshTokenResponseSchema>

export type SessionInfo = z.infer<typeof SessionInfoSchema>

export type ActiveSessionsResponse = z.infer<typeof ActiveSessionsResponseSchema>

export type RevokeSessionResponse = z.infer<typeof RevokeSessionResponseSchema>

export type ApiPermissionInfo = z.infer<typeof ApiPermissionInfoSchema>

export type UserPermissionsResponse = z.infer<typeof UserPermissionsResponseSchema>

export type MenuTreeResponse = z.infer<typeof MenuTreeResponseSchema>

export type AuthMyResponse = z.infer<typeof AuthMyResponseSchema>

export type UserInfo = z.infer<typeof UserResponseSchema>

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
    const response = await apiClient.Post<LoginResponse>(
      getApiPath('/auth/login'),
      credentials
    )
    return response
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
    const response = await apiClient.Post<RefreshTokenResponse>(
      getApiPath('/auth/refresh'),
      {}
    )
    return response
  },

  /**
   * ⚠️ 已废弃：请使用 src/api/services/token-refresh.ts 的 logout() 函数
   *
   * ❌ 不要直接调用此方法
   * ✅ 正确做法：
   *   ```ts
   *   import { logout } from '@/api/services/token-refresh'
   *   import { apiClient } from '@/api/client'
   *   await logout(apiClient)
   *   ```
   *
   * 原因：此方法只调用后端 API，不执行本地清理（权限/token）
   *
   * 正确的退出流程：
   * 1. 调用后端 /auth/logout（携带 token 鉴权）
   * 2. 清除权限（usePermission.clearPermissions()）
   * 3. 清除本地 token（localStorage）
   * 4. 跳转到登录页
   *
   * @deprecated 使用 logout(apiClient) 代替
   * @returns 登出响应
   */
  async logout(): Promise<LogoutResponse> {
    const response = await apiClient.Post<ApiResponse<LogoutResponse>>(
      getApiPath('/auth/logout'),
      {}
    )
    return response as unknown as LogoutResponse
  },

  /**
   * ⚠️ 已废弃：logoutAll 同样需要完整的本地清理流程
   *
   * 请参考 logout() 方法的注释说明。
   *
   * @deprecated 使用完整退出流程代替
   * @returns 登出响应
   */
  async logoutAll(): Promise<LogoutResponse> {
    const response = await apiClient.Post<ApiResponse<LogoutResponse>>(
      getApiPath('/auth/logout-all'),
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
      getApiPath('/auth/sessions'),
      { cacheFor: API_CACHE_DURATION.NONE }
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
      getApiPath(`/auth/sessions/${sessionUuid}`)
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
      getApiPath('/auth/permissions'),
      { cacheFor: API_CACHE_DURATION.NONE }
    )
    return response as unknown as UserPermissionsResponse
  },

  /**
   * 获取当前用户初始化上下文（用户信息 + 权限 + 菜单）
   *
   * 用于登录后一次性加载前端所需核心数据，减少额外请求。
   */
  async getMy(): Promise<AuthMyResponse> {
    const response = await apiClient.Get<AuthMyResponse>(
      getApiPath('/auth/my'),
      { cacheFor: API_CACHE_DURATION.NONE }
    )
    return response
  },
}
