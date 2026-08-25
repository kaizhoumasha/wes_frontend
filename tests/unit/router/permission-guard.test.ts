import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { RouteLocationNormalized, Router } from 'vue-router'
import { ClientErrorCode } from '@/api/constants/response-codes'
import type { ApiPermissionInfo } from '@/api/modules/auth'
import {
  clearPermissionState,
  permissionInitializedState,
  setPermissionsState
} from '@/composables/permission-state'
import { usePermission } from '@/composables/usePermission'
import { createPermissionGuard } from '@/router/guards/permission'
import { hasRouteAccess } from '@/router/route-access'
import { withGuardErrorHandling } from '@/utils/guard-error-handler'

const authContext = vi.hoisted(() => ({
  bootstrapAuthContext: vi.fn()
}))

vi.mock('@/app/bootstrap-auth-context', () => authContext)

vi.mock('@/router/route-access', async importOriginal => {
  const actual = await importOriginal<typeof import('@/router/route-access')>()
  return {
    ...actual,
    hasRouteAccess: vi.fn(actual.hasRouteAccess)
  }
})

const routeAccess = vi.mocked(hasRouteAccess)

function permission(name: string): ApiPermissionInfo {
  return { name } as ApiPermissionInfo
}

function protectedRoute(meta: RouteLocationNormalized['meta']): RouteLocationNormalized {
  return {
    path: '/admin/users',
    fullPath: '/admin/users?tab=active',
    meta
  } as RouteLocationNormalized
}

describe('permission initialization and guard result handling', () => {
  beforeEach(() => {
    clearPermissionState()
    authContext.bootstrapAuthContext.mockReset()
    routeAccess.mockClear()
  })

  afterEach(() => {
    clearPermissionState()
  })

  it('marks an empty hydrated permission list initialized and clears that state on logout', () => {
    usePermission().hydratePermissions([])

    expect(permissionInitializedState.value).toBe(true)

    usePermission().clearPermissions()
    expect(permissionInitializedState.value).toBe(false)
  })

  it('does not reload a legitimately initialized empty permission list', async () => {
    setPermissionsState([])
    const guard = createPermissionGuard({} as Router)

    await expect(
      guard(protectedRoute({ requiresAuth: true, permission: 'admin:user:page' }))
    ).resolves.toMatchObject({
      path: '/403'
    })

    expect(authContext.bootstrapAuthContext).not.toHaveBeenCalled()
  })

  it('classifies successful, authentication, and unavailable guard actions explicitly', async () => {
    const authError = Object.assign(new Error('token expired'), {
      code: ClientErrorCode.TOKEN_EXPIRED
    })

    await expect(withGuardErrorHandling(async () => undefined, 'test')).resolves.toBe('success')
    await expect(
      withGuardErrorHandling(async () => {
        throw authError
      }, 'test')
    ).resolves.toBe('auth-redirected')
    await expect(
      withGuardErrorHandling(async () => {
        throw new Error('offline')
      }, 'test')
    ).resolves.toBe('unavailable')
  })

  it('redirects an uninitialized protected route to the unavailable page without evaluating route access', async () => {
    authContext.bootstrapAuthContext.mockRejectedValueOnce(new Error('offline'))
    const guard = createPermissionGuard({} as Router)

    await expect(
      guard(protectedRoute({ requiresAuth: true, permission: 'admin:user:page' }))
    ).resolves.toEqual({
      path: '/auth-context-unavailable',
      query: { redirect: '/admin/users?tab=active' }
    })

    expect(routeAccess).not.toHaveBeenCalled()
  })

  it('uses the shared predicate for a single permission after initialization', async () => {
    authContext.bootstrapAuthContext.mockImplementationOnce(async () => {
      setPermissionsState([permission('admin:user:page')])
    })
    const guard = createPermissionGuard({} as Router)

    await expect(
      guard(protectedRoute({ requiresAuth: true, permission: 'admin:user:page' }))
    ).resolves.toBeUndefined()

    expect(routeAccess).toHaveBeenCalledWith(
      { requiresAuth: true, permission: 'admin:user:page' },
      new Set(['admin:user:page']),
      false
    )
  })

  it('uses the shared predicate for any-of permissions after initialization', async () => {
    authContext.bootstrapAuthContext.mockImplementationOnce(async () => {
      setPermissionsState([permission('admin:user:read')])
    })
    const guard = createPermissionGuard({} as Router)

    await expect(
      guard(
        protectedRoute({ requiresAuth: true, permissions: ['admin:user:write', 'admin:user:read'] })
      )
    ).resolves.toBeUndefined()

    expect(routeAccess).toHaveBeenCalledWith(
      { requiresAuth: true, permissions: ['admin:user:write', 'admin:user:read'] },
      new Set(['admin:user:read']),
      false
    )
  })
})
