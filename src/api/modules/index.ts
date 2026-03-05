/**
 * API 模块统一导出
 *
 * 集中导出所有业务 API 模块
 */

// ==================== 认证相关 ====================
export { authApi } from './auth'
export type {
  LoginRequest,
  TokenResponse,
  LoginResponse,
  LogoutResponse,
  RefreshTokenResponse,
  SessionInfo,
  ActiveSessionsResponse,
  RevokeSessionResponse,
  ApiPermissionInfo,
  UserPermissionsResponse,
  UserInfo,
} from './auth'

// ==================== 业务模块 ====================
export { userApi, userApiExtended, UserQuery } from './user'
export type {
  User,
  CreateUserInput,
  UpdateUserInput,
} from './user'

export { deviceApi, deviceApiExtended, DeviceQuery } from './device'
export type {
  Device,
  DeviceStatus,
  DeviceType,
  CreateDeviceInput,
  UpdateDeviceInput,
} from './device'

// ==================== 基础模块 ====================
export * from '../base'
