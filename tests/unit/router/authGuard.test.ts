import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { RouteLocationNormalized, RouteLocationNormalizedLoaded, Router } from 'vue-router'
import { ClientErrorCode } from '@/api/constants/response-codes'
import {
  clearPermissionState,
  permissionInitializedState,
  setPermissionsState
} from '@/composables/permission-state'
import { createAuthGuard } from '@/router/guards/auth'
import { createPermissionGuard } from '@/router/guards/permission'

const authContext = vi.hoisted(() => ({
  bootstrapAuthContext: vi.fn(async () => undefined)
}))

const currentUserContext = vi.hoisted(() => ({
  currentUser: {
    value: null as { id: number; username: string } | null
  }
}))

vi.mock('@/app/bootstrap-auth-context', () => authContext)

vi.mock('@/composables/useCurrentUser', () => ({
  useCurrentUser: () => currentUserContext
}))

describe('auth guard context restoration', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('access_token', 'test-token')
    clearPermissionState()
    currentUserContext.currentUser.value = { id: 1, username: 'admin' }
    authContext.bootstrapAuthContext.mockReset().mockImplementation(async () => {
      setPermissionsState([])
    })
  })

  it('restores permissions once when the cached user exists but permission state is uninitialized', async () => {
    const guard = createAuthGuard()
    const to = {
      path: '/dashboard',
      fullPath: '/dashboard',
      meta: { requiresAuth: true }
    } as RouteLocationNormalized
    const from = { path: '/login' } as RouteLocationNormalizedLoaded

    await expect(guard(to, from)).resolves.toBeUndefined()
    await expect(guard(to, from)).resolves.toBeUndefined()

    expect(authContext.bootstrapAuthContext).toHaveBeenCalledOnce()
  })

  it('restores permissions again after the permission state is cleared', async () => {
    const guard = createAuthGuard()
    const to = {
      path: '/dashboard',
      fullPath: '/dashboard',
      meta: { requiresAuth: true }
    } as RouteLocationNormalized
    const from = { path: '/login' } as RouteLocationNormalizedLoaded

    await guard(to, from)
    clearPermissionState()
    await guard(to, from)

    expect(authContext.bootstrapAuthContext).toHaveBeenCalledTimes(2)
  })

  it('does not reload a legitimate empty permission set in the permission guard', async () => {
    const authGuard = createAuthGuard()
    const permissionGuard = createPermissionGuard({} as Router)
    const to = {
      path: '/admin/users',
      fullPath: '/admin/users',
      meta: { requiresAuth: true, permission: 'admin:user:page' }
    } as RouteLocationNormalized
    const from = { path: '/dashboard' } as RouteLocationNormalizedLoaded

    await authGuard(to, from)
    await expect(permissionGuard(to)).resolves.toMatchObject({ path: '/403' })

    expect(authContext.bootstrapAuthContext).toHaveBeenCalledOnce()
  })

  it('shares one bootstrap request between overlapping navigations', async () => {
    let releaseBootstrap!: () => void
    const bootstrapPending = new Promise<void>(resolve => {
      releaseBootstrap = () => {
        setPermissionsState([])
        resolve()
      }
    })
    authContext.bootstrapAuthContext.mockImplementation(() => bootstrapPending)
    const guard = createAuthGuard()
    const to = {
      path: '/dashboard',
      fullPath: '/dashboard',
      meta: { requiresAuth: true }
    } as RouteLocationNormalized
    const from = { path: '/login' } as RouteLocationNormalizedLoaded

    const firstNavigation = guard(to, from)
    const secondNavigation = guard(to, from)
    await Promise.resolve()

    expect(authContext.bootstrapAuthContext).toHaveBeenCalledOnce()

    releaseBootstrap()
    await Promise.all([firstNavigation, secondNavigation])
  })

  it('restores the user when permissions are initialized but the cached user is missing', async () => {
    setPermissionsState([])
    currentUserContext.currentUser.value = null
    const guard = createAuthGuard()
    const to = {
      path: '/dashboard',
      fullPath: '/dashboard',
      meta: { requiresAuth: true }
    } as RouteLocationNormalized
    const from = { path: '/login' } as RouteLocationNormalizedLoaded

    await guard(to, from)

    expect(authContext.bootstrapAuthContext).toHaveBeenCalledOnce()
  })

  it('redirects a stale privileged context to the unavailable page before an auth-only route can render', async () => {
    const bootstrapError = new Error('temporary bootstrap failure')
    setPermissionsState([{ name: '*' }])
    currentUserContext.currentUser.value = null
    authContext.bootstrapAuthContext.mockRejectedValueOnce(bootstrapError)
    const guard = createAuthGuard()
    const to = {
      path: '/dashboard',
      fullPath: '/dashboard?view=operations',
      meta: { requiresAuth: true }
    } as RouteLocationNormalized
    const from = { path: '/login' } as RouteLocationNormalizedLoaded

    await expect(guard(to, from)).resolves.toEqual({
      path: '/auth-context-unavailable',
      query: { redirect: '/dashboard?view=operations' }
    })

    expect(authContext.bootstrapAuthContext).toHaveBeenCalledWith({
      forceRefresh: true,
      preserveAccessTokenOnFallback: true
    })
    expect(permissionInitializedState.value).toBe(false)
  })

  it('cancels protected navigation after an authentication restoration failure', async () => {
    currentUserContext.currentUser.value = null
    authContext.bootstrapAuthContext.mockRejectedValueOnce(
      Object.assign(new Error('token expired'), { code: ClientErrorCode.TOKEN_EXPIRED })
    )
    const guard = createAuthGuard()
    const to = {
      path: '/dashboard',
      fullPath: '/dashboard',
      meta: { requiresAuth: true }
    } as RouteLocationNormalized
    const from = { path: '/login' } as RouteLocationNormalizedLoaded

    await expect(guard(to, from)).resolves.toBe(false)
  })

  it('does not restore context while navigating to public unavailable or login routes', async () => {
    currentUserContext.currentUser.value = null
    const guard = createAuthGuard()
    const from = { path: '/dashboard' } as RouteLocationNormalizedLoaded
    const unavailable = {
      path: '/auth-context-unavailable',
      fullPath: '/auth-context-unavailable?redirect=%2Fdashboard',
      meta: { requiresAuth: false }
    } as RouteLocationNormalized
    const login = {
      path: '/login',
      fullPath: '/login',
      meta: { requiresAuth: false }
    } as RouteLocationNormalized

    await expect(guard(unavailable, from)).resolves.toBeUndefined()
    await expect(guard(login, from)).resolves.toBe('/dashboard')
    expect(authContext.bootstrapAuthContext).not.toHaveBeenCalled()
  })
})
