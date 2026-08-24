import type { RouteLocationNormalized, RouteLocationNormalizedLoaded } from 'vue-router'
import { bootstrapAuthContext } from '@/app/bootstrap-auth-context'
import { useCurrentUser } from '@/composables/useCurrentUser'
import { permissionInitializedState } from '@/composables/permission-state'

export function createAuthGuard() {
  let authContextPromise: Promise<unknown> | null = null

  const restoreAuthContext = async (): Promise<void> => {
    authContextPromise ??= bootstrapAuthContext({
      forceRefresh: false,
      preserveAccessTokenOnFallback: true,
      loadMenusNonBlocking: true
    })

    try {
      await authContextPromise
    } finally {
      authContextPromise = null
    }
  }

  return async (to: RouteLocationNormalized, from: RouteLocationNormalizedLoaded) => {
    const token = localStorage.getItem('access_token')

    if (to.meta.requiresAuth !== false && !token) {
      if (to.path !== '/login') {
        sessionStorage.setItem('redirect_after_login', to.fullPath)
      }
      return '/login'
    }

    if (token) {
      const { currentUser } = useCurrentUser()

      if (!currentUser.value || !permissionInitializedState.value) {
        try {
          await restoreAuthContext()
        } catch (error) {
          console.warn('[认证守卫] 恢复用户上下文失败:', error)
        }
      }
    }

    if (to.path === '/login' && token && from.path !== '/login') {
      return '/dashboard'
    }

    return
  }
}

export default createAuthGuard
