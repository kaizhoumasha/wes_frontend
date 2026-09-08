import { afterEach, describe, expect, it } from 'vitest'
import { createMemoryHistory, createRouter, type RouteLocationNormalized } from 'vue-router'
import type { ApiPermissionInfo } from '@/api/modules/auth'
import { clearPermissionState, setPermissionsState } from '@/composables/permission-state'
import { createPermissionGuard } from '@/router/guards/permission'
import { buildAuthorizedMenuTree } from '@/router/menu-tree'
import { createRoutes } from '@/router/routes'
import { opsRoutes } from '@/router/routes/ops'

afterEach(clearPermissionState)
describe('WMS 诊断独立只读入口', () => {
  it.each(['query', 'stream'])('普通 %s 身份可见菜单并可直接访问', async action => {
    const name = `ops:wms-diagnostics:${action}`
    const router = createRouter({ history: createMemoryHistory(), routes: createRoutes() })
    const target = router.resolve('/ops/wms-diagnostics') as unknown as RouteLocationNormalized
    setPermissionsState([{ name } as ApiPermissionInfo])
    expect(target.name).toBe('WmsDiagnostics')
    await expect(createPermissionGuard(router)(target)).resolves.toBeUndefined()
    const menus = buildAuthorizedMenuTree([opsRoutes], new Set([name]), false)
    expect(menus[0]?.children.map(item => item.name)).toEqual(['ops:wms-diagnostics:menu'])
  })
  it('详情读取权限不能单独获得列表或实时入口', async () => {
    const name = 'ops:wms-diagnostics:read'
    setPermissionsState([{ name } as ApiPermissionInfo])
    const router = createRouter({ history: createMemoryHistory(), routes: createRoutes() })
    const target = router.resolve('/ops/wms-diagnostics') as unknown as RouteLocationNormalized
    await expect(createPermissionGuard(router)(target)).resolves.toMatchObject({ path: '/403' })
    expect(buildAuthorizedMenuTree([opsRoutes], new Set([name]), false)).toEqual([])
  })
})
