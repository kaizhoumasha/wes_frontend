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
import { usePermission } from '@/composables/usePermission'
import { withGuardErrorHandling } from '@/utils/guard-error-handler'

/** 扩展的路由元信息类型 */
interface ExtendedRouteMeta {
  permission?: string
  permissions?: string[]
  resource?: string
  action?: string
  module?: string
  [key: string]: unknown
}

// ==================== 常量定义 ====================

/** 无权限跳转路径 */
const UNAUTHORIZED_PATH = '/403'

function unauthorizedRedirect(to: RouteLocationNormalized, permission: string) {
  if (to.path === UNAUTHORIZED_PATH) return
  return {
    path: UNAUTHORIZED_PATH,
    query: { redirect: to.fullPath, permission }
  }
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

    const requiredPermission = to.meta.permission as string | undefined
    if (!requiredPermission) return

    // 获取权限检查函数
    const { hasPermission, isSuperuser, permissions, isLoading, loadPermissions } = usePermission()

    // 权限预加载：如果内存中没有权限数据，先从缓存或后端加载
    // 解决刷新页面时因内存为空被误判 403
    if (permissions.value.length === 0 && !isLoading.value) {
      const result = await withGuardErrorHandling(async () => {
        await loadPermissions()
        return true
      }, '权限守卫')
      if (result === undefined) {
        return unauthorizedRedirect(to, requiredPermission)
      }
    }

    // 超级用户拥有所有权限
    if (isSuperuser.value) {
      return
    }

    // 检查用户是否拥有所需权限
    if (hasPermission(requiredPermission)) {
      return
    }

    // 无权限处理
    console.warn(`[权限守卫] 无访问权限: ${to.path}, 需要权限: ${requiredPermission}`)

    return unauthorizedRedirect(to, requiredPermission)
  }
}

/**
 * 批量权限守卫（检查路由是否满足任一权限要求）
 *
 * 用于路由需要多个权限中任意一个的场景
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
 *     permissions: [ADMIN_PERMISSIONS.user.page, ADMIN_PERMISSIONS.user.detail]
 *   }
 * }
 * ```
 *
 * @param router Vue Router 实例
 * @returns 路由守卫函数
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function createPermissionsGuard(_router: Router) {
  return async (to: RouteLocationNormalized) => {
    // 跳过不需要权限的路由
    if (to.meta.requiresAuth === false) {
      return
    }

    const requiredPermissions = to.meta.permissions as string[] | undefined
    if (!requiredPermissions || requiredPermissions.length === 0) return

    // 获取权限检查函数
    const { hasAnyPermission, isSuperuser, permissions, isLoading, loadPermissions } = usePermission()

    // 权限预加载：如果内存中没有权限数据，先从缓存或后端加载
    if (permissions.value.length === 0 && !isLoading.value) {
      const result = await withGuardErrorHandling(async () => {
        await loadPermissions()
        return true
      }, '权限守卫')
      if (result === undefined) {
        return unauthorizedRedirect(to, requiredPermissions[0]!)
      }
    }

    // 超级用户拥有所有权限
    if (isSuperuser.value) {
      return
    }

    // 检查用户是否拥有所需权限中的任意一个
    if (hasAnyPermission(requiredPermissions)) {
      return
    }

    // 无权限处理
    console.warn(`[权限守卫] 无访问权限: ${to.path}, 需要权限之一: ${requiredPermissions.join(', ')}`)

    return unauthorizedRedirect(to, requiredPermissions[0]!)
  }
}

/**
 * 资源权限守卫（根据资源和操作检查权限）
 *
 * 用于路由元信息中指定资源和操作的场景
 *
 * ## 路由元信息配置
 *
 * ```ts
 * {
 *   path: '/admin/users/create',
 *   meta: {
 *     requiresAuth: true,
 *     resource: 'user',      // 资源类型
 *     action: 'create',      // 操作类型
 *     module: 'admin'        // 模块名称（可选，默认 admin）
 *   }
 * }
 * ```
 *
 * @param router Vue Router 实例
 * @returns 路由守卫函数
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function createResourcePermissionGuard(_router: Router) {
  return async (to: RouteLocationNormalized) => {
    // 跳过不需要权限的路由
    if (to.meta.requiresAuth === false) {
      return
    }

    const resource = to.meta.resource as string | undefined
    const action = to.meta.action as string | undefined
    const module = (to.meta.module as string | undefined) || 'admin'
    if (!resource || !action) return
    const permissionName = `${module}:${resource}:${action}`

    // 获取权限检查函数
    const { hasResourcePermission, isSuperuser, permissions, isLoading, loadPermissions } = usePermission()

    // 权限预加载：如果内存中没有权限数据，先从缓存或后端加载
    if (permissions.value.length === 0 && !isLoading.value) {
      const result = await withGuardErrorHandling(async () => {
        await loadPermissions()
        return true
      }, '权限守卫')
      if (result === undefined) {
        return unauthorizedRedirect(to, permissionName)
      }
    }

    // 超级用户拥有所有权限
    if (isSuperuser.value) {
      return
    }

    // 检查用户是否拥有资源和操作对应的权限
    if (hasResourcePermission(resource, action, module)) {
      return
    }

    // 无权限处理
    console.warn(`[权限守卫] 无访问权限: ${to.path}, 需要权限: ${permissionName}`)
    return unauthorizedRedirect(to, permissionName)
  }
}

// ==================== 辅助函数 ====================

/**
 * 检查路由是否需要权限验证
 *
 * @param to 路由对象
 * @returns 是否需要权限验证
 */
export function requiresPermission(to: RouteLocationNormalized): boolean {
  return !!(to.meta.permission || to.meta.permissions || to.meta.resource)
}

/**
 * 获取路由所需权限列表
 *
 * @param to 路由对象
 * @returns 权限标识数组
 */
export function getRequiredPermissions(to: RouteLocationNormalized): string[] {
  const perms: string[] = []
  const meta = to.meta as ExtendedRouteMeta

  if (meta.permission) {
    perms.push(meta.permission)
  }

  if (meta.permissions) {
    perms.push(...meta.permissions)
  }

  if (meta.resource && meta.action) {
    const module = meta.module || 'admin'
    perms.push(`${module}:${meta.resource}:${meta.action}`)
  }

  return perms
}

// ==================== 导出 ====================

export default createPermissionGuard
