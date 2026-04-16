// ==================== AUTO GENERATED START ====================
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 自动生成的 API 模块
 *
 * ⚠️  请勿手动编辑 AUTO GENERATED 区域
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 资源: /api/v1/auth/login, /api/v1/auth/logout, /api/v1/auth/logout-all, /api/v1/auth/my, /api/v1/auth/permissions, /api/v1/auth/refresh, /api/v1/auth/sessions
 */
import { contractMethods } from '@/api/contract/client'
import type {
  ContractPathParams,
  ContractQueryParams,
  ContractRequestBody,
  ContractRequestConfig,
  ContractResponseData,
} from '@/api/contract/types'
import type { components, paths } from '@/api/generated/openapi-types'

export type LoginResult = ContractResponseData<'/api/v1/auth/login', 'post'>
export type LoginInput = ContractRequestBody<'/api/v1/auth/login', 'post'>

export type LogoutResult = ContractResponseData<'/api/v1/auth/logout', 'post'>

export type LogoutAllResult = ContractResponseData<'/api/v1/auth/logout-all', 'post'>

export type MyResult = ContractResponseData<'/api/v1/auth/my', 'get'>

export type PermissionsResult = ContractResponseData<'/api/v1/auth/permissions', 'get'>

export type RefreshResult = ContractResponseData<'/api/v1/auth/refresh', 'post'>

export type SessionsResult = ContractResponseData<'/api/v1/auth/sessions', 'get'>

export type DeleteBySessionUuidResult = ContractResponseData<'/api/v1/auth/sessions/{session_uuid}', 'delete'>
export type DeleteBySessionUuidPathParams = ContractPathParams<'/api/v1/auth/sessions/{session_uuid}', 'delete'>

export const authApiMethods = {
  /**
   * 用户登录
   * @description 用户登录

返回访问令牌和刷新令牌元数据。刷新令牌仅存储在 HttpOnly Cookie 中。

- **username**: 用户名（3-50字符）
- **password**: 密码（6-100字符）

**安全特性**：
- 使用 Argon2 密码哈希
- JWT 包含标准声明（iss, sub, jti, iat, nbf, exp）
- Refresh Token 存储在 HttpOnly Cookie 中
- 支持 JTI（JWT ID）用于精确撤销
   * @endpoint POST /api/v1/auth/login
   * @returns alova method instance
   */
  login(body: ContractRequestBody<'/api/v1/auth/login', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/auth/login', { body, config })
  },

  /**
   * 用户登出
   * @description 用户登出（撤销当前会话）

撤销当前会话的令牌并删除刷新令牌 Cookie。

**安全特性**：
- 优先撤销当前 Access Token（添加到黑名单）
- 当 Access Token 不可用时，回退使用 Refresh Token Cookie 撤销当前会话
- 始终删除 Refresh Token Cookie（幂等）
   * @endpoint POST /api/v1/auth/logout
   * @returns alova method instance
   */
  logout(config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/auth/logout', { config })
  },

  /**
   * 强制登出所有设备
   * @description 强制登出所有设备（撤销所有会话）

撤销用户所有活跃会话的令牌。用于：
- 用户主动清空所有会话
- 发现安全问题时强制登出
- 管理员重置用户会话

**安全特性**：
- 撤销所有 Access Token（添加到黑名单）
- 撤销所有 Refresh Token
- 删除所有会话信息
- 返回撤销的令牌数量
   * @endpoint POST /api/v1/auth/logout-all
   * @returns alova method instance
   */
  logoutAll(config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/auth/logout-all', { config })
  },

  /**
   * 获取当前用户初始化上下文
   * @description 一次性返回用户信息、API 权限列表和菜单树，用于前端登录后初始化
   * @endpoint GET /api/v1/auth/my
   * @returns alova method instance
   */
  my(config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/auth/my', { config })
  },

  /**
   * 获取当前用户的 API 权限列表
   * @description 获取当前用户有权限访问的内部管理 API（用于前端动态路由和权限控制）
   * @endpoint GET /api/v1/auth/permissions
   * @returns alova method instance
   */
  permissions(config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/auth/permissions', { config })
  },

  /**
   * 刷新访问令牌
   * @description 刷新访问令牌

使用刷新令牌（从 Cookie 中获取）获取新的访问令牌和刷新令牌元数据。
新的刷新令牌会自动更新到 HttpOnly Cookie 中。

**安全特性**：
- 验证 Refresh Token 类型和有效性
- 检查用户状态（是否被禁用）
- 生成新的 JTI（JWT ID）
- 自动撤销旧令牌
   * @endpoint POST /api/v1/auth/refresh
   * @returns alova method instance
   */
  refresh(config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/auth/refresh', { config })
  },

  /**
   * 获取当前用户的所有活跃会话
   * @description 获取当前用户的所有活跃会话

返回用户所有活跃的登录会话，包括：
- 会话 UUID
- JWT ID (JTI)
- 创建时间
- 设备信息
- 最后活跃时间

**使用场景**：
- 用户查看和管理自己的登录设备
- 安全审计
- 检测异常登录
   * @endpoint GET /api/v1/auth/sessions
   * @returns alova method instance
   */
  sessions(config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/auth/sessions', { config })
  },

  /**
   * 撤销指定会话
   * @description 撤销指定会话

撤销用户指定会话的令牌（强制登出特定设备）。

**使用场景**：
- 用户发现异常登录时撤销该会话
- 管理员撤销用户特定会话
- 用户管理自己的多设备登录

**安全特性**：
- 验证会话属于当前用户
- 撤销 Access Token（添加到黑名单）
- 撤销关联的 Refresh Token
- 删除会话信息
   * @endpoint DELETE /api/v1/auth/sessions/{session_uuid}
   * @returns alova method instance
   */
  deleteBySessionUuid(params: ContractPathParams<'/api/v1/auth/sessions/{session_uuid}', 'delete'>, config?: ContractRequestConfig) {
    return contractMethods.delete('/api/v1/auth/sessions/{session_uuid}', { params, config })
  }
}
// ==================== AUTO GENERATED END ====================

// ==================== CUSTOM METHODS START ====================
export type UserInfo = MyResult['user']
export type ApiPermissionInfo = PermissionsResult['permissions'][number]
// ==================== CUSTOM METHODS END ====================

// ==================== CUSTOM CONFIG START ====================

// ==================== CUSTOM CONFIG END ====================
