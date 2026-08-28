import { afterEach, describe, expect, it } from 'vitest'
import { createMemoryHistory, createRouter, type RouteLocationNormalized } from 'vue-router'
import type { ApiPermissionInfo } from '@/api/modules/auth'
import { OPS_TRANSPORT_TASK_PERMISSION } from '@/api/generated/permissions'
import { clearPermissionState, setPermissionsState } from '@/composables/permission-state'
import { createPermissionGuard } from '@/router/guards/permission'
import { createRoutes } from '@/router/routes'
import { opsRoutes } from '@/router/routes/ops'

afterEach(clearPermissionState)

describe('transport diagnostics route', () => {
  it('registers the page under ops with the generated list permission', () => {
    const route = opsRoutes.children?.find(child => child.name === 'TransportDiagnostics')
    expect(route).toMatchObject({
      path: 'transport-diagnostics',
      meta: { permission: OPS_TRANSPORT_TASK_PERMISSION.list }
    })
  })

  it('allows list readers and denies authenticated users without it', async () => {
    const router = createRouter({ history: createMemoryHistory(), routes: createRoutes() })
    const to = router.resolve('/ops/transport-diagnostics') as unknown as RouteLocationNormalized
    const guard = createPermissionGuard(router)

    setPermissionsState([{ name: OPS_TRANSPORT_TASK_PERMISSION.list } as ApiPermissionInfo])
    await expect(guard(to)).resolves.toBeUndefined()

    setPermissionsState([{ name: 'ops:transport-task:read' } as ApiPermissionInfo])
    await expect(guard(to)).resolves.toMatchObject({ path: '/403' })
  })
})
