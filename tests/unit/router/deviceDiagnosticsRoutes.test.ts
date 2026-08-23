import { afterEach, describe, expect, it } from 'vitest'
import { createMemoryHistory, createRouter, type RouteLocationNormalized } from 'vue-router'
import type { ApiPermissionInfo } from '@/api/modules/auth'
import { clearPermissionState, setPermissionsState } from '@/composables/permission-state'
import { createPermissionGuard } from '@/router/guards/permission'
import { createRoutes } from '@/router/routes'
import { opsRoutes } from '@/router/routes/ops'

afterEach(() => {
  clearPermissionState()
})

describe('device diagnostics route', () => {
  it('uses the superuser permission on both ops parent and diagnostics child', () => {
    expect(opsRoutes.meta?.permission).toBe('*')
    expect(opsRoutes.children?.[0]?.meta?.permission).toBe('*')
    expect(opsRoutes.children?.[0]).toMatchObject({
      path: 'device-diagnostics',
      name: 'DeviceDiagnostics'
    })
  })

  it('allows superusers and sends an authenticated ordinary user to 403', async () => {
    const router = createRouter({ history: createMemoryHistory(), routes: createRoutes() })
    const to = router.resolve('/ops/device-diagnostics') as unknown as RouteLocationNormalized
    const guard = createPermissionGuard(router)

    setPermissionsState([{ name: '*' } as ApiPermissionInfo])
    await expect(guard(to)).resolves.toBeUndefined()

    setPermissionsState([{ name: 'biz:device:list' } as ApiPermissionInfo])
    await expect(guard(to)).resolves.toMatchObject({ path: '/403' })
  })
})
