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
 * - 示例: `admin:user:create`, `admin:role:update`, `device:device:read`
 * - 超级用户拥有 `*` 权限（表示拥有所有权限）
 *
 * ## 使用示例
 *
 * ```ts
 * const { hasPermission, loadPermissions, clearPermissions } = usePermission()
 *
 * // 检查单个权限
 * if (hasPermission('admin:user:create')) {
 *   // 显示创建用户按钮
 * }
 *
 * // 检查多个权限（任意一个）
 * if (hasAnyPermission(['admin:user:create', 'admin:user:update'])) {
 *   // 显示用户管理操作
 * }
 *
 * // 加载用户权限
 * await loadPermissions()
 * ```
 */

import { computed, ref } from 'vue'
import { authApi } from '@/api/modules/auth'
import type { ApiPermissionInfo } from '@/api/modules/auth'

// ==================== 常量定义 ====================

/** 超级用户权限标识 */
const SUPERUSER_PERMISSION = '*'

/** SessionStorage 权限缓存键 */
const PERMISSIONS_CACHE_KEY = 'user_permissions'

/** SessionStorage 权限缓存时间戳键 */
const PERMISSIONS_CACHE_TIME_KEY = 'user_permissions_time'

/** 权限缓存过期时间（5 分钟） */
const PERMISSIONS_CACHE_TTL = 5 * 60 * 1000

// ==================== 全局状态 ====================

/** 用户权限列表（内存缓存） */
const permissions = ref<ApiPermissionInfo[]>([])

/** 权限标识集合（用于快速查找） */
const permissionNames = ref<Set<string>>(new Set())

/** 是否正在加载权限 */
const isLoading = ref(false)

/** 权限加载错误 */
const loadError = ref<Error | null>(null)

/** 是否为超级用户 */
const isSuperuser = computed(() => permissionNames.value.has(SUPERUSER_PERMISSION))

// ==================== 权限检查函数 ====================

/**
 * 检查是否拥有指定权限
 *
 * @param permissionName 权限标识（如 `admin:user:create`）
 * @returns 是否拥有权限
 *
 * @example
 * ```ts
 * const { hasPermission } = usePermission()
 *
 * if (hasPermission('admin:user:create')) {
 *   // 显示创建按钮
 * }
 * ```
 */
export function usePermission() {
  /**
   * 检查是否拥有指定权限
   */
  const hasPermission = (permissionName: string): boolean => {
    // 超级用户拥有所有权限
    if (isSuperuser.value) {
      return true
    }
    return permissionNames.value.has(permissionName)
  }

  /**
   * 检查是否拥有指定权限中的任意一个
   *
   * @param permissionNames 权限标识数组
   * @returns 是否拥有至少一个权限
   *
   * @example
   * ```ts
   * const { hasAnyPermission } = usePermission()
   *
   * if (hasAnyPermission(['admin:user:create', 'admin:user:update'])) {
   *   // 显示用户管理操作
   * }
   * ```
   */
  const hasAnyPermission = (permissionNameList: string[]): boolean => {
    // 超级用户拥有所有权限
    if (isSuperuser.value) {
      return true
    }
    return permissionNameList.some((name) => permissionNames.value.has(name))
  }

  /**
   * 检查是否拥有指定权限的全部
   *
   * @param permissionNames 权限标识数组
   * @returns 是否拥有所有权限
   *
   * @example
   * ```ts
   * const { hasAllPermissions } = usePermission()
   *
   * if (hasAllPermissions(['admin:user:create', 'admin:user:delete'])) {
   *   // 显示完整用户管理操作
   * }
   * ```
   */
  const hasAllPermissions = (permissionNameList: string[]): boolean => {
    // 超级用户拥有所有权限
    if (isSuperuser.value) {
      return true
    }
    return permissionNameList.every((name) => permissionNames.value.has(name))
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
    return permissions.value.find((p) => p.name === permissionName)
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

    isLoading.value = true
    loadError.value = null

    try {
      const response = await authApi.getPermissions()
      setPermissionsState(response.permissions)
      setPermissionsToCache(response.permissions)
    } catch (error) {
      loadError.value = error as Error
      // 抛出错误，让调用者能够捕获并处理
      throw error
    } finally {
      isLoading.value = false
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
    permissions.value = []
    permissionNames.value = new Set()
    loadError.value = null
    sessionStorage.removeItem(PERMISSIONS_CACHE_KEY)
    sessionStorage.removeItem(PERMISSIONS_CACHE_TIME_KEY)
  }

  // ==================== 辅助函数 ====================

  /** 设置权限状态 */
  const setPermissionsState = (perms: ApiPermissionInfo[]): void => {
    permissions.value = perms
    permissionNames.value = new Set(perms.map((p) => p.name))
  }

  /** 从缓存获取权限 */
  const getPermissionsFromCache = (): ApiPermissionInfo[] | null => {
    try {
      const cachedData = sessionStorage.getItem(PERMISSIONS_CACHE_KEY)
      const cachedTime = sessionStorage.getItem(PERMISSIONS_CACHE_TIME_KEY)

      if (!cachedData || !cachedTime) {
        return null
      }

      const cacheAge = Date.now() - Number.parseInt(cachedTime, 10)
      if (cacheAge > PERMISSIONS_CACHE_TTL) {
        // 缓存过期
        sessionStorage.removeItem(PERMISSIONS_CACHE_KEY)
        sessionStorage.removeItem(PERMISSIONS_CACHE_TIME_KEY)
        return null
      }

      return JSON.parse(cachedData) as ApiPermissionInfo[]
    } catch {
      return null
    }
  }

  /** 将权限写入缓存 */
  const setPermissionsToCache = (perms: ApiPermissionInfo[]): void => {
    try {
      sessionStorage.setItem(PERMISSIONS_CACHE_KEY, JSON.stringify(perms))
      sessionStorage.setItem(PERMISSIONS_CACHE_TIME_KEY, Date.now().toString())
    } catch (error) {
      console.error('写入权限缓存失败:', error)
    }
  }

  // ==================== 导出 ====================

  return {
    // 状态
    permissions: computed(() => permissions.value),
    isSuperuser,
    isLoading: computed(() => isLoading.value),
    loadError: computed(() => loadError.value),

    // 权限检查
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasResourcePermission,
    getPermission,

    // 权限管理
    loadPermissions,
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
