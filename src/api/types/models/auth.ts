/**
 * 认证相关业务模型类型
 * 与后端 src/app/auth/models/auth.py 对齐
 */

import type { ApiResponse } from '../response'

// ==================== 登录相关 ====================

/**
 * 登录凭证
 */
export interface LoginCredentials {
  /** 用户名 */
  username: string
  /** 密码 */
  password: string
  /** 验证码（可选） */
  captcha?: string
  /** 记住我 */
  remember?: boolean
}

/**
 * Token响应
 */
export interface TokenResponse {
  /** 访问令牌（用于API认证） */
  access_token: string
  /** 刷新令牌（用于获取新的访问令牌） */
  refresh_token?: string
  /** 访问令牌过期时间（秒） */
  expires_in: number
  /** 刷新令牌过期时间（秒） */
  refresh_expires_in: number
}

/**
 * 登录响应
 */
export interface LoginResponse {
  /** 访问令牌 */
  access_token: string
  /** 刷新令牌 */
  refresh_token: string
  /** 过期时间（秒） */
  expires_in: number
  /** 用户信息 */
  user?: UserInfo
}

/**
 * 刷新Token请求
 */
export interface RefreshTokenRequest {
  /** 刷新令牌 */
  refreshToken: string
}

// ==================== 用户信息 ====================

/**
 * 用户信息（与后端 UserResponse 对齐）
 */
export interface UserInfo {
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
}

/**
 * 角色信息
 */
export interface Role {
  /** 角色 ID */
  id: number
  /** 角色名称 */
  name: string
  /** 角色代码 */
  code: string
  /** 角色描述 */
  description?: string
}

// ==================== 登出 ====================

/**
 * 登出请求
 */
export interface LogoutRequest {
  /** 刷新令牌（用于服务端失效） */
  refreshToken?: string
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

// ==================== 密码管理 ====================

/**
 * 修改密码请求
 */
export interface ChangePasswordRequest {
  /** 旧密码 */
  oldPassword: string
  /** 新密码 */
  newPassword: string
  /** 确认新密码 */
  confirmPassword: string
}

/**
 * 重置密码请求（管理员操作）
 */
export interface ResetPasswordRequest {
  /** 用户ID */
  userId: number
  /** 新密码 */
  newPassword: string
}

// ==================== API响应类型包装 ====================

/** 登录API响应 */
export type LoginApiResponse = ApiResponse<LoginResponse>

/** 用户信息API响应 */
export type UserInfoApiResponse = ApiResponse<UserInfo>

/** 刷新Token API响应 */
export type RefreshTokenApiResponse = ApiResponse<TokenResponse>

/** 登出API响应 */
export type LogoutApiResponse = ApiResponse<LogoutResponse>
