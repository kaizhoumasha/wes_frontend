import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { RouteLocationNormalized, RouteLocationNormalizedLoaded, Router } from 'vue-router'
import { setPermissionsState, clearPermissionState } from '@/composables/permission-state'
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

  it('retries bootstrap on the next navigation after a failed request', async () => {
    const bootstrapError = new Error('temporary bootstrap failure')
    authContext.bootstrapAuthContext
      .mockRejectedValueOnce(bootstrapError)
      .mockImplementationOnce(async () => {
        setPermissionsState([])
      })
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const guard = createAuthGuard()
    const to = {
      path: '/dashboard',
      fullPath: '/dashboard',
      meta: { requiresAuth: true }
    } as RouteLocationNormalized
    const from = { path: '/login' } as RouteLocationNormalizedLoaded

    try {
      await guard(to, from)
      await guard(to, from)
    } finally {
      warn.mockRestore()
    }

    expect(authContext.bootstrapAuthContext).toHaveBeenCalledTimes(2)
  })
})
