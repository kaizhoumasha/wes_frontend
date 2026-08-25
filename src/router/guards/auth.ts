import type { RouteLocationNormalized, RouteLocationNormalizedLoaded } from 'vue-router'
import { bootstrapAuthContext } from '@/app/bootstrap-auth-context'
import { useCurrentUser } from '@/composables/useCurrentUser'
import { clearPermissionState, permissionInitializedState } from '@/composables/permission-state'
import { withGuardErrorHandling, type GuardActionResult } from '@/utils/guard-error-handler'

const AUTH_CONTEXT_UNAVAILABLE_PATH = '/auth-context-unavailable'

export function createAuthGuard() {
  let authContextPromise: Promise<GuardActionResult> | null = null

  const restoreAuthContext = async (): Promise<GuardActionResult> => {
    authContextPromise ??= withGuardErrorHandling(
      () =>
        bootstrapAuthContext({
          forceRefresh: true,
          preserveAccessTokenOnFallback: true
        }),
      '认证守卫'
    )

    try {
      return await authContextPromise
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

    if (to.meta.requiresAuth === false) {
      if (to.path === '/login' && token && from.path !== '/login') {
        return '/dashboard'
      }
      return
    }

    if (token) {
      const { currentUser } = useCurrentUser()

      if (!currentUser.value || !permissionInitializedState.value) {
        const result = await restoreAuthContext()
        if (result === 'auth-redirected') return false
        if (result === 'unavailable' || !permissionInitializedState.value) {
          clearPermissionState()
          return {
            path: AUTH_CONTEXT_UNAVAILABLE_PATH,
            query: { redirect: to.fullPath }
          }
        }
      }
    }

    return
  }
}

export default createAuthGuard
