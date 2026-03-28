/**
 * 认证 API
 */

import { API_CACHE_DURATION } from '@/constants/cache'
import { authGeneratedApi } from '@/api/generated/api-clients'
import type { components } from '@/api/generated/openapi-types'
import type { ArrayItem } from '@/api/contract/types'

// 类型导出
export type LoginRequest = components['schemas']['LoginRequest']
export type UserInfo = components['schemas']['UserResponse']
export type ApiPermissionInfo = components['schemas']['ApiPermissionInfo']
export type AuthMyResponse = Awaited<ReturnType<typeof authGeneratedApi.my>>
export type MenuTreeResponse = ArrayItem<AuthMyResponse['menus']>

/**
 * 认证 API
 *
 * 封装生成客户端，添加缓存控制
 */
export const authApi = {
  login: authGeneratedApi.login,

  async getMy() {
    return await authGeneratedApi.my({
      cacheFor: API_CACHE_DURATION.NONE
    })
  },

  async getPermissions() {
    return await authGeneratedApi.permissions({
      cacheFor: API_CACHE_DURATION.NONE
    })
  }
}
