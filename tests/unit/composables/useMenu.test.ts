import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BIZ_PERMISSIONS } from '@/api/generated/permissions'
import type { ApiPermissionInfo } from '@/api/modules/auth'

describe('useMenu', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(async () => {
    const { clearPermissionState } = await import('@/composables/permission-state')
    clearPermissionState()
  })

  it('projects authorized routes immediately and removes them when permissions are cleared', async () => {
    const { useMenu } = await import('@/composables/useMenu')
    const { clearPermissionState, setPermissionsState } = await import(
      '@/composables/permission-state'
    )
    const menu = useMenu()

    setPermissionsState([{ name: BIZ_PERMISSIONS.device.page } as ApiPermissionInfo])

    expect(menu.findMenuItem('/biz/devices')?.name).toBe('biz:device:menu')

    menu.selectMenu('/biz/devices')
    expect(menu.selectedPath.value).toBe('/biz/devices')
    expect(menu.openedPaths.value).toContain('/biz')
    expect(menu.getBreadcrumb('/biz/devices').map(item => item.path)).toEqual([
      '/biz',
      '/biz/devices'
    ])

    clearPermissionState()

    expect(menu.menuTree.value).toEqual([])
    expect(menu.findMenuItem('/biz/devices')).toBeUndefined()
    expect(menu.getBreadcrumb('/biz/devices')).toEqual([])
  })

  it('returns only local navigation state and minimal projected menu fields', async () => {
    const { useMenu } = await import('@/composables/useMenu')
    const { setPermissionsState } = await import('@/composables/permission-state')
    const menu = useMenu()

    setPermissionsState([{ name: BIZ_PERMISSIONS.device.page } as ApiPermissionInfo])

    const forbiddenApi = [
      'flatMenuItems',
      'loadMenus',
      'hydrateMenus',
      'clearMenus',
      'isLoading',
      'loadError',
      'isMenuLoaded'
    ]

    expect(Object.keys(menu)).toEqual(expect.not.arrayContaining(forbiddenApi))

    const deviceMenu = menu.findMenuItem('/biz/devices')
    expect(deviceMenu).toEqual({
      name: 'biz:device:menu',
      title: '设备管理',
      path: '/biz/devices',
      icon: 'ep:cpu',
      children: []
    })
  })
})
