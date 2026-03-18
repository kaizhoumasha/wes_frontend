/**
 * 认证相关业务模型类型
 *
 * 统一复用 api/modules 中基于生成 schema 推导的类型，避免重复维护。
 */

import type { ApiResponse } from '../response'
import type {
  LoginRequest,
  TokenResponse as ModuleTokenResponse,
  LoginResponse as ModuleLoginResponse,
  LogoutResponse as ModuleLogoutResponse,
  RefreshTokenResponse as ModuleRefreshTokenResponse,
  UserInfo as ModuleUserInfo,
} from '../../modules/auth'
import type { Role as ModuleRole } from '../../modules/user'

export type LoginCredentials = LoginRequest

export type AuthTokenResponse = ModuleTokenResponse
export type UserLoginResponse = ModuleLoginResponse
export type UserLogoutResponse = ModuleLogoutResponse
export type UserRefreshTokenResponse = ModuleRefreshTokenResponse
export type AuthUserInfo = ModuleUserInfo
export type AuthRole = ModuleRole

export type TokenResponse = AuthTokenResponse
export type LoginResponse = UserLoginResponse
export type LogoutResponse = UserLogoutResponse
export type RefreshTokenResponse = UserRefreshTokenResponse
export type UserInfo = AuthUserInfo
export type Role = AuthRole

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface LogoutRequest {
  refreshToken?: string
}

export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

export interface ResetPasswordRequest {
  userId: number
  newPassword: string
}

export type LoginApiResponse = ApiResponse<LoginResponse>

export type UserInfoApiResponse = ApiResponse<UserInfo>

export type RefreshTokenApiResponse = ApiResponse<TokenResponse>

export type LogoutApiResponse = ApiResponse<LogoutResponse>
