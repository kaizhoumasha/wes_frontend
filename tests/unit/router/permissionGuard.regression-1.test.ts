import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { RouteLocationNormalized, Router } from 'vue-router'
import { createPermissionGuard } from '@/router/guards/permission'

const permissionContext = vi.hoisted(() => ({
  hasPermission: vi.fn(() => false),
  isSuperuser: { value: false },
  permissions: { value: [] as unknown[] },
  isLoading: { value: false },
  loadPermissions: vi.fn(async () => undefined)
}))

vi.mock('@/composables/usePermission', () => ({
  usePermission: () => permissionContext
}))

describe('permission guard with an empty permission list', () => {
  beforeEach(() => {
    permissionContext.hasPermission.mockReturnValue(false)
    permissionContext.permissions.value = []
    permissionContext.isLoading.value = false
    permissionContext.loadPermissions.mockReset().mockResolvedValue(undefined)
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
    expect(permissionContext.loadPermissions).toHaveBeenCalledOnce()
  })

  it('fails closed when protected-route permissions cannot be loaded', async () => {
    permissionContext.loadPermissions.mockRejectedValueOnce(new Error('permission service unavailable'))
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
  })
})
