import { describe, expect, it, vi } from 'vitest'
import { createCrudPageConfigFromResource } from '@/components/common/crud-page/createCrudPageConfigFromResource'
import type { CrudPageColumnManager } from '@/components/common/crud-page/types'
import { createAPIApplicationPageConfig } from '@/views/admin/api-applications/config/pageConfig'
import { createDevicePageConfig } from '@/views/admin/devices/config/pageConfig'
import { createMenuPageConfig } from '@/views/admin/menus/config/pageConfig'
import { createPermissionPageConfig } from '@/views/admin/permissions/config/pageConfig'
import { createRolePageConfig } from '@/views/admin/roles/config/pageConfig'
import { createUserPageConfig } from '@/views/admin/users/config/pageConfig'
import { createWorkLinePageConfig } from '@/views/admin/worklines/config/pageConfig'

type TestItem = {
  id: number
  name: string
}

function createColumnManager(): CrudPageColumnManager {
  return {
    columnConfig: { value: [] },
    updateConfig: vi.fn(),
    updateColumnWidth: vi.fn(),
    buildTableColumns: vi.fn(() => [])
  }
}

function createFieldConfig() {
  return {
    fields: [{ key: 'name', label: '名称' }],
    table: {
      defaultColumns: [],
      createManager: () => createColumnManager()
    },
    form: {
      fieldConfig: []
    },
    search: {
      fields: []
    }
  }
}

describe('createCrudPageConfigFromResource', () => {
  it('keeps only the explicit permission leaves used by each current CRUD page', () => {
    const noop = () => undefined
    const configs = {
      applications: createAPIApplicationPageConfig(noop, noop),
      devices: createDevicePageConfig(),
      menus: createMenuPageConfig(),
      permissions: createPermissionPageConfig(),
      roles: createRolePageConfig(),
      users: createUserPageConfig(noop, noop),
      worklines: createWorkLinePageConfig(noop, noop)
    }

    expect(configs.applications.resource.permissions).toEqual({
      page: 'api-auth:api_application:list',
      list: 'api-auth:api_application:list',
      detail: 'api-auth:api_application:detail',
      create: 'api-auth:api_application:create',
      update: 'api-auth:api_application:update',
      delete: 'api-auth:api_application:delete',
      restore: 'api-auth:api_application:restore',
      trash: 'api-auth:api_application:trash',
      batchRestore: 'api-auth:api_application:batch_restore',
      permanentDelete: 'api-auth:api_application:permanent_delete',
      batchPermanentDelete: 'api-auth:api_application:batch_permanent_delete'
    })
    expect(configs.devices.resource.permissions).toEqual({
      page: 'biz:device:list',
      list: 'biz:device:list',
      detail: 'biz:device:detail',
      create: 'biz:device:create',
      update: 'biz:device:update',
      delete: 'biz:device:delete',
      restore: 'biz:device:restore',
      trash: 'biz:device:trash',
      batchRestore: 'biz:device:batch_restore',
      permanentDelete: 'biz:device:permanent_delete',
      batchPermanentDelete: 'biz:device:batch_permanent_delete'
    })
    expect(configs.menus.resource.permissions).toEqual({
      page: 'admin:menu:list',
      list: 'admin:menu:list',
      detail: 'admin:menu:detail',
      create: 'admin:menu:create',
      update: 'admin:menu:update',
      delete: 'admin:menu:delete',
      restore: 'admin:menu:restore',
      trash: 'admin:menu:trash',
      batchRestore: 'admin:menu:batch_restore',
      permanentDelete: 'admin:menu:permanent_delete',
      batchPermanentDelete: 'admin:menu:batch_permanent_delete',
      tree: 'admin:menu:tree',
      move: 'admin:menu:move',
      batchSort: 'admin:menu:batch_sort'
    })
    expect(configs.permissions.resource.permissions).toEqual({
      page: 'admin:permission:list',
      list: 'admin:permission:list',
      detail: 'admin:permission:detail',
      tree: 'admin:permission:tree'
    })
    expect(configs.roles.resource.permissions).toEqual({
      page: 'admin:role:list',
      list: 'admin:role:list',
      detail: 'admin:role:detail',
      create: 'admin:role:create',
      update: 'admin:role:update',
      delete: 'admin:role:delete',
      restore: 'admin:role:restore',
      trash: 'admin:role:trash',
      batchRestore: 'admin:role:batch_restore',
      permanentDelete: 'admin:role:permanent_delete',
      batchPermanentDelete: 'admin:role:batch_permanent_delete'
    })
    expect(configs.users.resource.permissions).toEqual({
      page: 'admin:user:list',
      list: 'admin:user:list',
      detail: 'admin:user:detail',
      create: 'admin:user:create',
      update: 'admin:user:update',
      delete: 'admin:user:delete',
      bulkDelete: 'admin:user:bulk_delete',
      restore: 'admin:user:restore',
      trash: 'admin:user:trash',
      batchRestore: 'admin:user:batch_restore',
      permanentDelete: 'admin:user:permanent_delete',
      batchPermanentDelete: 'admin:user:batch_permanent_delete'
    })
    expect(configs.worklines.resource.permissions).toEqual({
      page: 'biz:workline:list',
      list: 'biz:workline:list',
      detail: 'biz:workline:detail',
      create: 'biz:workline:create',
      update: 'biz:workline:update',
      delete: 'biz:workline:delete',
      restore: 'biz:workline:restore',
      trash: 'biz:workline:trash',
      batchRestore: 'biz:workline:batch_restore',
      permanentDelete: 'biz:workline:permanent_delete',
      batchPermanentDelete: 'biz:workline:batch_permanent_delete'
    })
  })

  it('rejects detail fields that are not declared in the resource field catalog', () => {
    const methods = {
      getById: vi.fn(),
      query: vi.fn()
    }

    expect(() =>
      createCrudPageConfigFromResource<TestItem, Record<string, never>, Record<string, never>>({
        resource: {
          key: 'test',
          title: { text: '测试资源' },
          methods
        },
        fieldConfig: createFieldConfig(),
        detail: {
          sections: [
            {
              title: '基本信息',
              fields: [{ key: 'name' }, { key: 'undeclared_field' }]
            }
          ]
        }
      })
    ).toThrow('Crud detail field "undeclared_field" is not declared in fieldConfig.fields')
  })

  it('resolves detail labels from declared resource fields only', () => {
    const methods = {
      getById: vi.fn(),
      query: vi.fn()
    }

    const pageConfig = createCrudPageConfigFromResource<
      TestItem,
      Record<string, never>,
      Record<string, never>
    >({
      resource: {
        key: 'test',
        title: { text: '测试资源' },
        methods
      },
      fieldConfig: createFieldConfig(),
      detail: {
        sections: [
          {
            title: '基本信息',
            fields: [{ key: 'name' }]
          }
        ]
      }
    })

    expect(pageConfig.detail?.sections?.[0]?.fields?.[0]).toMatchObject({
      key: 'name',
      label: '名称'
    })
  })

  it('preserves tree-capable methods on the generated requestAdapter', async () => {
    const treeSend = vi.fn().mockResolvedValue([{ id: 1, name: 'root' } satisfies TestItem])
    const childrenSend = vi.fn().mockResolvedValue([{ id: 2, name: 'child' } satisfies TestItem])
    const moveSend = vi.fn().mockResolvedValue({ success: true })
    const batchSortSend = vi.fn().mockResolvedValue({ success: true })

    const methods = {
      getById: vi.fn().mockReturnValue({
        send: vi.fn().mockResolvedValue({ id: 1, name: 'root' } satisfies TestItem)
      }),
      query: vi.fn().mockReturnValue({
        send: vi.fn().mockResolvedValue({ items: [], total: 0, limit: 10, offset: 0 })
      }),
      create: vi.fn().mockReturnValue({
        send: vi.fn().mockResolvedValue({ id: 3, name: 'new' } satisfies TestItem)
      }),
      update: vi.fn().mockReturnValue({
        send: vi.fn().mockResolvedValue({ id: 1, name: 'updated' } satisfies TestItem)
      }),
      delete: vi.fn().mockReturnValue({ send: vi.fn().mockResolvedValue(undefined) }),
      getTrash: vi.fn().mockReturnValue({
        send: vi.fn().mockResolvedValue({ items: [], total: 0, limit: 10, offset: 0 })
      }),
      restore: vi.fn().mockReturnValue({
        send: vi.fn().mockResolvedValue({ id: 1, name: 'restored' } satisfies TestItem)
      }),
      permanentDelete: vi.fn().mockReturnValue({ send: vi.fn().mockResolvedValue(undefined) }),
      batchDelete: vi
        .fn()
        .mockReturnValue({ send: vi.fn().mockResolvedValue({ success: 1, failed: 0, total: 1 }) }),
      batchRestore: vi
        .fn()
        .mockReturnValue({ send: vi.fn().mockResolvedValue({ success: 1, failed: 0, total: 1 }) }),
      batchPermanentDelete: vi
        .fn()
        .mockReturnValue({ send: vi.fn().mockResolvedValue({ success: 1, failed: 0, total: 1 }) }),
      tree: vi.fn().mockReturnValue({ send: treeSend }),
      children: vi.fn().mockReturnValue({ send: childrenSend }),
      move: vi.fn().mockReturnValue({ send: moveSend }),
      batchSort: vi.fn().mockReturnValue({ send: batchSortSend })
    }

    const pageConfig = createCrudPageConfigFromResource<
      TestItem,
      Record<string, never>,
      Record<string, never>
    >({
      resource: {
        key: 'menus',
        title: { text: '菜单管理' },
        methods,
        treeMode: { enabled: true }
      },
      fieldConfig: createFieldConfig()
    })

    const requestAdapter = pageConfig.resource
      .requestAdapter as typeof pageConfig.resource.requestAdapter & {
      tree?: (query?: unknown, config?: unknown) => Promise<unknown>
      children?: (params: unknown, config?: unknown) => Promise<unknown>
      move?: (body: unknown, config?: unknown) => Promise<unknown>
      batchSort?: (body: unknown, config?: unknown) => Promise<unknown>
    }

    expect(typeof requestAdapter.tree).toBe('function')
    expect(typeof requestAdapter.children).toBe('function')
    expect(typeof requestAdapter.move).toBe('function')
    expect(typeof requestAdapter.batchSort).toBe('function')

    await expect(requestAdapter.tree?.({ tree_depth: 0 })).resolves.toEqual([
      { id: 1, name: 'root' }
    ])
    await expect(requestAdapter.children?.({ node_id: 1 })).resolves.toEqual([
      { id: 2, name: 'child' }
    ])
    await expect(
      requestAdapter.move?.({ id: 2, target_id: 1, position: 'inner' })
    ).resolves.toEqual({ success: true })
    await expect(requestAdapter.batchSort?.({ items: [] })).resolves.toEqual({ success: true })

    expect(methods.tree).toHaveBeenCalledWith({ tree_depth: 0 }, undefined)
    expect(methods.children).toHaveBeenCalledWith({ node_id: 1 }, undefined)
    expect(methods.move).toHaveBeenCalledWith({ id: 2, target_id: 1, position: 'inner' }, undefined)
    expect(methods.batchSort).toHaveBeenCalledWith({ items: [] }, undefined)
  })
})
