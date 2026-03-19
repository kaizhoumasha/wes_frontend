/**
 * 权限管理 Composable
 *
 * 提供用户权限检查功能，支持：
 * - 权限状态管理（内存 + sessionStorage）
 * - 单个权限检查
 * - 批量权限检查（任意/全部）
 * - 权限加载和清除
 *
 * ## 权限标识格式
 *
 * 后端权限标识格式：`{module}:{resource}:{action}`
 * - 推荐优先使用 `@/api/generated/permissions` 中自动生成的常量
 * - 超级用户拥有 `*` 权限（表示拥有所有权限）
 *
 * ## 使用示例
 *
 * ```ts
 * import { ADMIN_PERMISSIONS } from '@/api/generated/permissions'
 *
 * const { hasPermission, loadPermissions, clearPermissions } = usePermission()
 *
 * // 检查单个权限
 * if (hasPermission(ADMIN_PERMISSIONS.user.create)) {
 *   // 显示创建用户按钮
 * }
 *
 * // 检查多个权限（任意一个）
 * if (hasAnyPermission([ADMIN_PERMISSIONS.user.create, ADMIN_PERMISSIONS.user.update])) {
 *   // 显示用户管理操作
 * }
 *
 * // 加载用户权限
 * await loadPermissions()
 * ```
 */

import { computed } from 'vue'
import { authApi } from '@/api/modules/auth'
import type { ApiPermissionInfo } from '@/api/modules/auth'
import {
  checkPermissionState,
  clearPermissionState,
  getPermissionsFromCache,
  isSuperuserState,
  permissionLoadErrorState,
  permissionLoadingState,
  permissionsState,
  setPermissionsState,
  setPermissionsToCache
} from './permission-state'

/**
 * 检查是否拥有指定权限
 *
 * @param permissionName 权限标识（建议使用 `@/api/generated/permissions` 常量）
 * @returns 是否拥有权限
 *
 * @example
 * ```ts
 * import { ADMIN_PERMISSIONS } from '@/api/generated/permissions'
 *
 * const { hasPermission } = usePermission()
 *
 * if (hasPermission(ADMIN_PERMISSIONS.user.create)) {
 *   // 显示创建按钮
 * }
 * ```
 */
export function usePermission() {
  const hasPermission = (permissionName: string): boolean => {
    return checkPermissionState(permissionName)
  }

  /**
   * 检查是否拥有指定权限中的任意一个
   *
   * @param permissionNames 权限标识数组
   * @returns 是否拥有至少一个权限
   *
   * @example
   * ```ts
   * import { ADMIN_PERMISSIONS } from '@/api/generated/permissions'
   *
   * const { hasAnyPermission } = usePermission()
   *
   * if (hasAnyPermission([ADMIN_PERMISSIONS.user.create, ADMIN_PERMISSIONS.user.update])) {
   *   // 显示用户管理操作
   * }
   * ```
   */
  const hasAnyPermission = (permissionNameList: string[]): boolean => {
    return permissionNameList.some((name) => checkPermissionState(name))
  }

  /**
   * 检查是否拥有指定权限的全部
   *
   * @param permissionNames 权限标识数组
   * @returns 是否拥有所有权限
   *
   * @example
   * ```ts
   * import { ADMIN_PERMISSIONS } from '@/api/generated/permissions'
   *
   * const { hasAllPermissions } = usePermission()
   *
   * if (hasAllPermissions([ADMIN_PERMISSIONS.user.create, ADMIN_PERMISSIONS.user.delete])) {
   *   // 显示完整用户管理操作
   * }
   * ```
   */
  const hasAllPermissions = (permissionNameList: string[]): boolean => {
    return permissionNameList.every((name) => checkPermissionState(name))
  }

  /**
   * 根据资源类型和操作检查权限
   *
   * @param resource 资源类型（如 `user`、`role`）
   * @param action 操作类型（如 `create`、`update`、`delete`）
   * @param module 模块名称（默认 `admin`）
   * @returns 是否拥有权限
   *
   * @example
   * ```ts
   * const { hasResourcePermission } = usePermission()
   *
   * if (hasResourcePermission('user', 'create')) {
   *   // 检查 admin:user:create 权限
   * }
   *
   * if (hasResourcePermission('device', 'update', 'device')) {
   *   // 检查 device:device:update 权限
   * }
   * ```
   */
  const hasResourcePermission = (
    resource: string,
    action: string,
    module: string = 'admin'
  ): boolean => {
    const permissionName = `${module}:${resource}:${action}`
    return hasPermission(permissionName)
  }

  /**
   * 获取权限详情（包含 method、path 等信息）
   *
   * @param permissionName 权限标识
   * @returns 权限详情，不存在时返回 undefined
   */
  const getPermission = (permissionName: string): ApiPermissionInfo | undefined => {
    return permissionsState.value.find((p) => p.name === permissionName)
  }

  // ==================== 权限管理函数 ====================

  /**
   * 从后端加载用户权限
   *
   * @param forceRefresh 是否强制刷新（忽略缓存）
   * @returns Promise，加载完成时 resolve
   *
   * @example
   * ```ts
   * const { loadPermissions } = usePermission()
   *
   * // 登录后加载权限
   * await loadPermissions()
   *
   * // 强制刷新权限
   * await loadPermissions(true)
   * ```
   */
  const loadPermissions = async (forceRefresh = false): Promise<void> => {
    // 检查缓存
    if (!forceRefresh) {
      const cached = getPermissionsFromCache()
      if (cached) {
        setPermissionsState(cached)
        return
      }
    }

    permissionLoadingState.value = true
    permissionLoadErrorState.value = null

    try {
      const response = await authApi.getPermissions()
      setPermissionsState(response.permissions)
      setPermissionsToCache(response.permissions)
    } catch (error) {
      permissionLoadErrorState.value = error as Error
      // 抛出错误，让调用者能够捕获并处理
      throw error
    } finally {
      permissionLoadingState.value = false
    }
  }

  /**
   * 注入权限数据（用于 /auth/my 聚合接口）
   *
   * @param perms 权限列表
   * @param persist 是否写入缓存（默认 true）
   */
  const hydratePermissions = (perms: ApiPermissionInfo[], persist = true): void => {
    setPermissionsState(perms)
    permissionLoadErrorState.value = null
    if (persist) {
      setPermissionsToCache(perms)
    }
  }

  /**
   * 清除权限状态
   *
   * @example
   * ```ts
   * const { clearPermissions } = usePermission()
   *
   * // 登出时清除权限
   * clearPermissions()
   * ```
   */
  const clearPermissions = (): void => {
    clearPermissionState()
  }

  // ==================== 导出 ====================

  return {
    // 状态
    permissions: computed(() => permissionsState.value),
    isSuperuser: isSuperuserState,
    isLoading: computed(() => permissionLoadingState.value),
    loadError: computed(() => permissionLoadErrorState.value),

    // 权限检查
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasResourcePermission,
    getPermission,

    // 权限管理
    loadPermissions,
    hydratePermissions,
    clearPermissions
  }
}

// ==================== 类型导出 ====================

/** 权限检查函数类型 */
export type HasPermissionFn = ReturnType<typeof usePermission>['hasPermission']

/** 批量权限检查函数类型（任意） */
export type HasAnyPermissionFn = ReturnType<typeof usePermission>['hasAnyPermission']

/** 批量权限检查函数类型（全部） */
export type HasAllPermissionsFn = ReturnType<typeof usePermission>['hasAllPermissions']
