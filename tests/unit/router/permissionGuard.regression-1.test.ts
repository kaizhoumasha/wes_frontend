import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { RouteLocationNormalized, Router } from 'vue-router'
import { clearPermissionState, setPermissionsState } from '@/composables/permission-state'
import { createPermissionGuard } from '@/router/guards/permission'

const permissionContext = vi.hoisted(() => ({
  hasPermission: vi.fn(() => false),
  isSuperuser: { value: false },
  permissions: { value: [] as unknown[] },
  isLoading: { value: false }
}))

const authContext = vi.hoisted(() => ({
  bootstrapAuthContext: vi.fn(async () => undefined)
}))

vi.mock('@/app/bootstrap-auth-context', () => authContext)

vi.mock('@/composables/usePermission', () => ({
  usePermission: () => permissionContext
}))

describe('permission guard with an empty permission list', () => {
  beforeEach(() => {
    clearPermissionState()
    permissionContext.hasPermission.mockReturnValue(false)
    permissionContext.isSuperuser.value = false
    permissionContext.permissions.value = []
    permissionContext.isLoading.value = false
    authContext.bootstrapAuthContext.mockReset().mockImplementation(async () => {
      setPermissionsState([])
    })
  })

  it('restores the superuser context before evaluating a protected route after refresh', async () => {
    authContext.bootstrapAuthContext.mockImplementationOnce(async () => {
      permissionContext.isSuperuser.value = true
      permissionContext.permissions.value = [{ name: '*' }]
      setPermissionsState([])
    })
    const guard = createPermissionGuard({} as Router)
    const to = {
      path: '/ops/device-diagnostics',
      fullPath: '/ops/device-diagnostics',
      meta: { requiresAuth: true, permission: '*' }
    } as RouteLocationNormalized

    await expect(guard(to)).resolves.toBeUndefined()
    expect(authContext.bootstrapAuthContext).toHaveBeenCalledOnce()
  })

  // Regression: ISSUE-001 — an ordinary user could open the administrator diagnostics page
  // Found by /qa on 2026-08-23
  // Report: .gstack/qa-reports/qa-report-127-0-0-1-2026-08-23-rerun.md
  it('denies a protected route after permissions load successfully', async () => {
    const guard = createPermissionGuard({} as Router)
    const to = {
      path: '/ops/device-diagnostics',
      fullPath: '/ops/device-diagnostics',
      meta: { requiresAuth: true, permission: '*' }
    } as RouteLocationNormalized

    await expect(guard(to)).resolves.toMatchObject({
      path: '/403',
      query: {
        redirect: '/ops/device-diagnostics',
        permission: '*'
      }
    })
    expect(authContext.bootstrapAuthContext).toHaveBeenCalledOnce()
  })

  it('redirects to the unavailable page when protected-route permissions cannot be loaded', async () => {
    authContext.bootstrapAuthContext.mockRejectedValueOnce(
      new Error('permission service unavailable')
    )
    const guard = createPermissionGuard({} as Router)
    const to = {
      path: '/ops/device-diagnostics',
      fullPath: '/ops/device-diagnostics',
      meta: { requiresAuth: true, permission: '*' }
    } as RouteLocationNormalized

    await expect(guard(to)).resolves.toMatchObject({
      path: '/auth-context-unavailable',
      query: {
        redirect: '/ops/device-diagnostics'
      }
    })
  })
})
