/**
 * 认证 API
 *
 * 基于 OpenAPI 契约的认证模块。
 */

import { API_CACHE_DURATION } from '@/constants/cache'
import { contractClient } from '@/api/contract/client'
import type {
  ArrayItem,
  ContractPath,
  ContractRequestBody,
  ContractResponseData,
  ContractSchema,
} from '@/api/contract/types'

const AUTH_LOGIN_PATH = '/api/v1/auth/login' satisfies ContractPath
const AUTH_MY_PATH = '/api/v1/auth/my' satisfies ContractPath
const AUTH_PERMISSIONS_PATH = '/api/v1/auth/permissions' satisfies ContractPath

type LoginEndpoint = typeof AUTH_LOGIN_PATH
type MyEndpoint = typeof AUTH_MY_PATH
type PermissionsEndpoint = typeof AUTH_PERMISSIONS_PATH

type LoginResponse = ContractResponseData<LoginEndpoint, 'post'>
type AuthMyResponse = ContractResponseData<MyEndpoint, 'get'>
type UserPermissionsResponse = ContractResponseData<PermissionsEndpoint, 'get'>

export type LoginRequest = ContractRequestBody<LoginEndpoint, 'post'>

export type ApiPermissionInfo = ContractSchema<'ApiPermissionInfo'>

export type UserInfo = ContractSchema<'UserResponse'>

export type MenuTreeResponse = ArrayItem<AuthMyResponse['menus']>

export const authApi = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return await contractClient.post(AUTH_LOGIN_PATH, {
      body: credentials
    })
  },

  async getPermissions(): Promise<UserPermissionsResponse> {
    return await contractClient.get(AUTH_PERMISSIONS_PATH, {
      config: { cacheFor: API_CACHE_DURATION.NONE }
    })
  },

  async getMy(): Promise<AuthMyResponse> {
    return await contractClient.get(AUTH_MY_PATH, {
      config: { cacheFor: API_CACHE_DURATION.NONE }
    })
  }
}
