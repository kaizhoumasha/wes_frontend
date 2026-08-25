/**
 * 路由权限守卫
 *
 * 检查路由访问权限，处理无权限情况
 *
 * ## 路由元信息配置
 *
 * ```ts
 * import { ADMIN_PERMISSIONS } from '@/api/generated/permissions'
 *
 * {
 *   path: '/admin/users',
 *   meta: {
 *     requiresAuth: true,
 *     permission: ADMIN_PERMISSIONS.user.page
 *   }
 * }
 * ```
 *
 * ## 权限检查流程
 *
 * 1. 检查路由是否需要权限
 * 2. 检查用户是否已登录
 * 3. 检查用户是否拥有所需权限
 * 4. 无权限时跳转到 403 页面或显示提示
 */

import type { RouteLocationNormalized, Router } from 'vue-router'
import { bootstrapAuthContext } from '@/app/bootstrap-auth-context'
import { permissionInitializedState, permissionNamesState } from '@/composables/permission-state'
import { usePermission } from '@/composables/usePermission'
import { hasRouteAccess } from '@/router/route-access'
import { withGuardErrorHandling } from '@/utils/guard-error-handler'

// ==================== 常量定义 ====================

/** 无权限跳转路径 */
const UNAUTHORIZED_PATH = '/403'
const AUTH_CONTEXT_UNAVAILABLE_PATH = '/auth-context-unavailable'

function unauthorizedRedirect(to: RouteLocationNormalized, permission: string) {
  if (to.path === UNAUTHORIZED_PATH) return
  return {
    path: UNAUTHORIZED_PATH,
    query: { redirect: to.fullPath, permission }
  }
}

function unavailableRedirect(to: RouteLocationNormalized) {
  if (to.path === AUTH_CONTEXT_UNAVAILABLE_PATH) return false
  return {
    path: AUTH_CONTEXT_UNAVAILABLE_PATH,
    query: { redirect: to.fullPath }
  }
}

function requiredPermissionLabel(to: RouteLocationNormalized): string {
  if (typeof to.meta.permission === 'string') return to.meta.permission
  if (Array.isArray(to.meta.permissions) && typeof to.meta.permissions[0] === 'string') {
    return to.meta.permissions[0]
  }
  return ''
}

// ==================== 权限守卫 ====================

/**
 * 创建权限守卫
 *
 * @param router Vue Router 实例
 * @returns 路由守卫函数
 *
 * @example
 * ```ts
 * // 在 router/index.ts 中使用
 * import { createPermissionGuard } from '@/router/guards/permission'
 *
 * router.beforeEach(createPermissionGuard(router))
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function createPermissionGuard(_router: Router) {
  return async (to: RouteLocationNormalized) => {
    // 跳过不需要权限的路由
    if (to.meta.requiresAuth === false) {
      return
    }

    if (to.meta.permission === undefined && to.meta.permissions === undefined) return

    const { isSuperuser, isLoading } = usePermission()

    // 权限预加载：刷新页面时恢复完整用户上下文，确保超级用户通配权限也被补齐。
    if (!permissionInitializedState.value && !isLoading.value) {
      const result = await withGuardErrorHandling(async () => {
    await bootstrapAuthContext({
      forceRefresh: false,
      preserveAccessTokenOnFallback: true
        })
      }, '权限守卫')
      if (result === 'auth-redirected') return false
      if (result === 'unavailable' || !permissionInitializedState.value) {
        return unavailableRedirect(to)
      }
    }

    if (!permissionInitializedState.value) {
      return unavailableRedirect(to)
    }

    if (hasRouteAccess(to.meta, permissionNamesState.value, isSuperuser.value)) {
      return
    }

    const requiredPermission = requiredPermissionLabel(to)
    console.warn(`[权限守卫] 无访问权限: ${to.path}, 需要权限: ${requiredPermission}`)

    return unauthorizedRedirect(to, requiredPermission)
  }
}

// ==================== 导出 ====================

export default createPermissionGuard
