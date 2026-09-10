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
  it.each([
    'ops:wms-diagnostics:query',
    'ops:wms-diagnostics:stream',
    'ops:wms-confirmation:read',
    'ops:wms-evidence:read'
  ])('任一 WMS 诊断能力 %s 可见菜单并可直接访问', async name => {
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

  it('exchange 入口权限仍不授予可靠事实读取权限', () => {
    const route = opsRoutes.children?.find(child => child.name === 'WmsDiagnostics')
    expect(route?.meta?.permissions).toEqual([
      'ops:wms-diagnostics:query',
      'ops:wms-diagnostics:stream',
      'ops:wms-confirmation:read',
      'ops:wms-evidence:read'
    ])
  })
})
