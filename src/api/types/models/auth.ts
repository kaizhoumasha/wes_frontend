/**
 * 认证相关业务模型类型
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
  accessToken: string
  /** 刷新令牌（用于获取新的访问令牌） */
  refreshToken: string
  /** Token类型（通常为 Bearer） */
  tokenType: string
  /** 访问令牌过期时间（秒） */
  expiresIn: number
  /** 刷新令牌过期时间（秒） */
  refreshExpiresIn: number
}

/**
 * 登录响应
 */
export interface LoginResponse {
  /** 用户信息 */
  user: UserInfo
  /** Token信息 */
  tokens: TokenResponse
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
 * 用户状态
 */
export enum UserStatus {
  /** 正常 */
  ACTIVE = 'active',
  /** 禁用 */
  DISABLED = 'disabled',
  /** 锁定 */
  LOCKED = 'locked',
  /** 待激活 */
  PENDING = 'pending'
}

/**
 * 用户性别
 */
export enum UserGender {
  /** 男 */
  MALE = 'male',
  /** 女 */
  FEMALE = 'female',
  /** 未知 */
  UNKNOWN = 'unknown'
}

/**
 * 用户信息
 */
export interface UserInfo {
  /** 用户ID */
  id: string
  /** 用户名 */
  username: string
  /** 显示名称 */
  displayName: string
  /** 邮箱 */
  email?: string
  /** 手机号 */
  phone?: string
  /** 头像URL */
  avatar?: string
  /** 状态 */
  status: UserStatus
  /** 性别 */
  gender?: UserGender
  /** 部门ID */
  departmentId?: string
  /** 部门名称 */
  departmentName?: string
  /** 职位 */
  position?: string
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
}

/**
 * 当前用户信息（包含权限相关信息）
 */
export interface CurrentUser extends UserInfo {
  /** 角色列表 */
  roles: string[]
  /** 权限列表 */
  permissions: string[]
  /** 菜单列表 */
  menus: MenuItem[]
}

// ==================== 权限与角色 ====================

/**
 * 权限类型
 */
export enum PermissionType {
  /** 菜单 */
  MENU = 'menu',
  /** 按钮 */
  BUTTON = 'button',
  /** API */
  API = 'api',
  /** 数据 */
  DATA = 'data'
}

/**
 * 权限信息
 */
export interface Permission {
  /** 权限ID */
  id: string
  /** 权限代码（唯一标识） */
  code: string
  /** 权限名称 */
  name: string
  /** 权限类型 */
  type: PermissionType
  /** 资源路径 */
  resource?: string
  /** 操作类型（如：read, write, delete） */
  action?: string
  /** 父权限ID */
  parentId?: string
  /** 描述 */
  description?: string
}

/**
 * 角色信息
 */
export interface Role {
  /** 角色ID */
  id: string
  /** 角色代码 */
  code: string
  /** 角色名称 */
  name: string
  /** 是否为系统角色 */
  isSystem: boolean
  /** 权限ID列表 */
  permissionIds: string[]
  /** 描述 */
  description?: string
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
}

// ==================== 菜单 ====================

/**
 * 菜单类型
 */
export enum MenuType {
  /** 目录 */
  DIRECTORY = 'directory',
  /** 菜单 */
  MENU = 'menu',
  /** 按钮 */
  BUTTON = 'button'
}

/**
 * 菜单项
 */
export interface MenuItem {
  /** 菜单ID */
  id: string
  /** 父菜单ID */
  parentId?: string
  /** 菜单类型 */
  type: MenuType
  /** 菜单名称 */
  name: string
  /** 菜单图标 */
  icon?: string
  /** 路由路径 */
  path?: string
  /** 组件路径 */
  component?: string
  /** 权限代码（访问该菜单需要的权限） */
  permission?: string
  /** 重定向路径 */
  redirect?: string
  /** 是否隐藏 */
  hidden?: boolean
  /** 是否缓存 */
  keepAlive?: boolean
  /** 是否始终显示 */
  alwaysShow?: boolean
  /** 排序号 */
  sortOrder: number
  /** 子菜单 */
  children?: MenuItem[]
  /** 元数据 */
  meta?: MenuMeta
}

/**
 * 菜单元数据
 */
export interface MenuMeta {
  /** 标题 */
  title: string
  /** 图标 */
  icon?: string
  /** 是否隐藏 */
  hidden?: boolean
  /** 是否不缓存 */
  noCache?: boolean
  /** 链接 */
  link?: string
  /** 徽标 */
  badge?: string | number
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
  userId: string
  /** 新密码 */
  newPassword: string
}

/**
 * 忘记密码请求
 */
export interface ForgotPasswordRequest {
  /** 邮箱或手机号 */
  account: string
  /** 验证码 */
  captcha: string
}

/**
 * 验证重置密码Token
 */
export interface VerifyResetTokenRequest {
  /** Token */
  token: string
}

/**
 * 设置新密码请求
 */
export interface SetNewPasswordRequest {
  /** Token */
  token: string
  /** 新密码 */
  newPassword: string
}

// ==================== 验证码 ====================

/**
 * 验证码响应
 */
export interface CaptchaResponse {
  /** 验证码图片（Base64） */
  image: string
  /** 验证码ID */
  captchaId: string
}

/**
 * 验证码验证请求
 */
export interface VerifyCaptchaRequest {
  /** 验证码ID */
  captchaId: string
  /** 验证码值 */
  code: string
}

// ==================== API响应类型包装 ====================

/** 登录API响应 */
export type LoginApiResponse = ApiResponse<LoginResponse>

/** 获取当前用户API响应 */
export type GetCurrentUserApiResponse = ApiResponse<CurrentUser>

/** 刷新Token API响应 */
export type RefreshTokenApiResponse = ApiResponse<TokenResponse>

/** 登出API响应 */
export type LogoutApiResponse = ApiResponse<LogoutResponse>

/** 修改密码API响应 */
export type ChangePasswordApiResponse = ApiResponse<void>

/** 角色列表API响应 */
export type RoleListApiResponse = ApiResponse<Role[]>

/** 权限列表API响应 */
export type PermissionListApiResponse = ApiResponse<Permission[]>

/** 菜单列表API响应 */
export type MenuListApiResponse = ApiResponse<MenuItem[]>

/** 验证码API响应 */
export type CaptchaApiResponse = ApiResponse<CaptchaResponse>
