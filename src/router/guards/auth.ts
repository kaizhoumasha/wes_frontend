import type { RouteLocationNormalized, RouteLocationNormalizedLoaded } from 'vue-router'
import { bootstrapAuthContext } from '@/app/bootstrap-auth-context'
import { useCurrentUser } from '@/composables/useCurrentUser'

export function createAuthGuard() {
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

      if (!currentUser.value) {
        try {
          await bootstrapAuthContext({
            forceRefresh: false,
            preserveAccessTokenOnFallback: true,
            loadMenusNonBlocking: true
          })
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
