/**
 * 路由权限守卫
 *
 * 检查路由访问权限，处理无权限情况
 *
 * ## 路由元信息配置
 *
 * ```ts
 * {
 *   path: '/admin/users',
 *   meta: {
 *     requiresAuth: true,
 *     permission: 'admin:user:list'  // 所需权限
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
  return async (to: RouteLocationNormalized, _from: RouteLocationNormalized, next: (to?: string | object) => void) => {
    // 跳过不需要权限的路由
    if (to.meta.requiresAuth === false) {
      return next()
    }

    // 获取权限检查函数
    const { hasPermission, isSuperuser, permissions, isLoading, loadPermissions } = usePermission()

    // 权限预加载：如果内存中没有权限数据，先从缓存或后端加载
    // 解决刷新页面时因内存为空被误判 403
    if (permissions.value.length === 0 && !isLoading.value) {
      await loadPermissions() // 非强制加载，优先使用缓存
    }

    // 检查是否需要权限验证
    const requiredPermission = to.meta.permission as string | undefined

    if (!requiredPermission) {
      // 没有指定权限要求，只需登录验证
      return next()
    }

    // 超级用户拥有所有权限
    if (isSuperuser.value) {
      return next()
    }

    // 检查用户是否拥有所需权限
    if (hasPermission(requiredPermission)) {
      return next()
    }

    // 无权限处理
    console.warn(`[权限守卫] 无访问权限: ${to.path}, 需要权限: ${requiredPermission}`)

    // 如果目标路由是 403 页面，避免循环
    if (to.path === UNAUTHORIZED_PATH) {
      return next()
    }

    // 跳转到 403 页面，并保存原始目标路径和所需权限
    return next({
      path: UNAUTHORIZED_PATH,
      query: {
        redirect: to.fullPath,
        permission: requiredPermission
      }
    })
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
 * {
 *   path: '/admin/users',
 *   meta: {
 *     requiresAuth: true,
 *     permissions: ['admin:user:list', 'admin:user:read']  // 所需权限（任意一个）
 *   }
 * }
 * ```
 *
 * @param router Vue Router 实例
 * @returns 路由守卫函数
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function createPermissionsGuard(_router: Router) {
  return async (to: RouteLocationNormalized, _from: RouteLocationNormalized, next: (to?: string | object) => void) => {
    // 跳过不需要权限的路由
    if (to.meta.requiresAuth === false) {
      return next()
    }

    // 获取权限检查函数
    const { hasAnyPermission, isSuperuser, permissions, isLoading, loadPermissions } = usePermission()

    // 权限预加载：如果内存中没有权限数据，先从缓存或后端加载
    if (permissions.value.length === 0 && !isLoading.value) {
      await loadPermissions() // 非强制加载，优先使用缓存
    }

    // 检查是否需要权限验证
    const requiredPermissions = to.meta.permissions as string[] | undefined

    if (!requiredPermissions || requiredPermissions.length === 0) {
      // 没有指定权限要求，只需登录验证
      return next()
    }

    // 超级用户拥有所有权限
    if (isSuperuser.value) {
      return next()
    }

    // 检查用户是否拥有所需权限中的任意一个
    if (hasAnyPermission(requiredPermissions)) {
      return next()
    }

    // 无权限处理
    console.warn(`[权限守卫] 无访问权限: ${to.path}, 需要权限之一: ${requiredPermissions.join(', ')}`)

    // 如果目标路由是 403 页面，避免循环
    if (to.path === UNAUTHORIZED_PATH) {
      return next()
    }

    // 跳转到 403 页面，并保存原始目标路径和所需权限
    return next({
      path: UNAUTHORIZED_PATH,
      query: {
        redirect: to.fullPath,
        permission: requiredPermissions[0] // 显示第一个所需权限
      }
    })
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
  return async (to: RouteLocationNormalized, _from: RouteLocationNormalized, next: (to?: string | object) => void) => {
    // 跳过不需要权限的路由
    if (to.meta.requiresAuth === false) {
      return next()
    }

    // 获取权限检查函数
    const { hasResourcePermission, isSuperuser, permissions, isLoading, loadPermissions } = usePermission()

    // 权限预加载：如果内存中没有权限数据，先从缓存或后端加载
    if (permissions.value.length === 0 && !isLoading.value) {
      await loadPermissions() // 非强制加载，优先使用缓存
    }

    // 检查是否需要权限验证
    const resource = to.meta.resource as string | undefined
    const action = to.meta.action as string | undefined
    const module = (to.meta.module as string | undefined) || 'admin'

    if (!resource || !action) {
      // 没有指定资源和操作，只需登录验证
      return next()
    }

    // 超级用户拥有所有权限
    if (isSuperuser.value) {
      return next()
    }

    // 检查用户是否拥有资源和操作对应的权限
    if (hasResourcePermission(resource, action, module)) {
      return next()
    }

    // 无权限处理
    const permissionName = `${module}:${resource}:${action}`
    console.warn(`[权限守卫] 无访问权限: ${to.path}, 需要权限: ${permissionName}`)

    // 如果目标路由是 403 页面，避免循环
    if (to.path === UNAUTHORIZED_PATH) {
      return next()
    }

    // 跳转到 403 页面，并保存原始目标路径和所需权限
    return next({
      path: UNAUTHORIZED_PATH,
      query: {
        redirect: to.fullPath,
        permission: permissionName
      }
    })
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
