import { authApiMethods } from '@/api/modules/auth'
import type { ApiPermissionInfo } from '@/api/modules/auth'
import { getAccessToken, setAccessToken } from '@/api/services/token-refresh'
import { useCurrentUser } from '@/composables/useCurrentUser'
import { useMenu } from '@/composables/useMenu'
import { usePermission } from '@/composables/usePermission'
import { SUPERUSER_PERMISSION } from '@/composables/permission-state'

export interface BootstrapAuthContextOptions {
  forceRefresh?: boolean
  preserveAccessTokenOnFallback?: boolean
  loadMenusNonBlocking?: boolean
}

export interface BootstrapAuthContextResult {
  initializedFromMy: boolean
}

const SUPERUSER_PERMISSION_INFO: ApiPermissionInfo = {
  id: 0,
  name: SUPERUSER_PERMISSION,
  type: 'user_api',
  description: '超级用户通配权限',
  category: 'system',
  resource: '*',
  action: '*',
  method: null,
  path: null
}

function normalizeContextPermissions(
  permissions: ApiPermissionInfo[],
  isSuperuser: boolean
): ApiPermissionInfo[] {
  if (!isSuperuser || permissions.some(permission => permission.name === SUPERUSER_PERMISSION)) {
    return permissions
  }

  return [SUPERUSER_PERMISSION_INFO, ...permissions]
}

/**
 * 统一加载当前登录用户上下文。
 *
 * 优先使用 /auth/my 聚合接口；失败时回退为权限/菜单分步加载。
 * 注意：分步加载无法补齐 currentUser，因此该场景依赖登录响应或 session 缓存中的用户数据。
 */
export async function bootstrapAuthContext(
  options: BootstrapAuthContextOptions = {}
): Promise<BootstrapAuthContextResult> {
  const {
    forceRefresh = true,
    preserveAccessTokenOnFallback = true,
    loadMenusNonBlocking = true
  } = options

  const { currentUser, hydrateCurrentUser } = useCurrentUser()
  const { loadPermissions, hydratePermissions } = usePermission()
  const { loadMenus, hydrateMenus } = useMenu()

  const savedToken = getAccessToken()
  let initializedFromMy = false

  try {
    const myContext = await authApiMethods.my().send()

    hydrateCurrentUser(myContext.user)

    const contextPermissions = normalizeContextPermissions(
      Array.isArray(myContext.permissions) ? myContext.permissions : [],
      myContext.user.is_superuser
    )

    if (contextPermissions.length > 0) {
      hydratePermissions(contextPermissions)
    } else {
      await loadPermissions(forceRefresh)
    }

    if (Array.isArray(myContext.menus) && myContext.menus.length > 0) {
      hydrateMenus(myContext.menus)
    } else {
      await loadMenus(forceRefresh)
    }

    initializedFromMy = true
    return { initializedFromMy }
  } catch (error) {
    console.warn('[auth bootstrap] 加载 /auth/my 失败，回退到分步加载:', error)
  }

  if (preserveAccessTokenOnFallback && savedToken && !getAccessToken()) {
    setAccessToken(savedToken)
  }

  await loadPermissions(forceRefresh)

  if (loadMenusNonBlocking) {
    try {
      await loadMenus(forceRefresh)
    } catch (error) {
      console.warn('[auth bootstrap] 菜单加载失败（非阻塞）:', error)
    }
  } else {
    await loadMenus(forceRefresh)
  }

  if (!currentUser.value) {
    console.warn('[auth bootstrap] 当前用户信息未恢复，将依赖登录响应或缓存中的用户数据')
  }

  return { initializedFromMy }
}
