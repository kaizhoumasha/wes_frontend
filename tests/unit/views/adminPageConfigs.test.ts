import { describe, expect, it, vi } from 'vitest'
import { createAPIApplicationPageConfig } from '@/views/admin/api-applications/config/pageConfig'
import { createDevicePageConfig } from '@/views/admin/devices/config/pageConfig'
import { createMenuPageConfig } from '@/views/admin/menus/config/pageConfig'
import { createPermissionPageConfig } from '@/views/admin/permissions/config/pageConfig'
import { createRolePageConfig } from '@/views/admin/roles/config/pageConfig'
import { createUserPageConfig } from '@/views/admin/users/config/pageConfig'
import { createWorkLinePageConfig } from '@/views/admin/worklines/config/pageConfig'

describe('admin page field configuration', () => {
  it('creates every admin CRUD page config without undeclared detail fields', () => {
    const open = vi.fn()

    expect(() => createAPIApplicationPageConfig()).not.toThrow()
    expect(() =>
      createDevicePageConfig({
        openRuntime: open,
        openTrace: open,
        canOpenTrace: () => true
      })
    ).not.toThrow()
    expect(() => createMenuPageConfig()).not.toThrow()
    expect(() => createPermissionPageConfig()).not.toThrow()
    expect(() => createRolePageConfig()).not.toThrow()
    expect(() => createUserPageConfig(open, open)).not.toThrow()
    expect(() =>
      createWorkLinePageConfig({
        openRuntime: open,
        openTrace: open
      })
    ).not.toThrow()
  })

  it('does not expose the Trace explorer entry from workline management', () => {
    const open = vi.fn()
    const config = createWorkLinePageConfig({
      openRuntime: open
    })

    expect(config.detail?.actions?.map(action => action.key)).not.toContain('open-trace')
    expect(config.extensions?.rowActions?.map(action => action.key)).not.toContain('open-trace')
  })
})
