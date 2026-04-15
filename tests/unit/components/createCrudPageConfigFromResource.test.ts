import { describe, expect, it, vi } from 'vitest'
import { createCrudPageConfigFromResource } from '@/components/common/crud-page/createCrudPageConfigFromResource'
import type { CrudPageColumnManager } from '@/components/common/crud-page/types'

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
  it('preserves tree-capable methods on the generated requestAdapter', async () => {
    const treeSend = vi.fn().mockResolvedValue([{ id: 1, name: 'root' } satisfies TestItem])
    const childrenSend = vi.fn().mockResolvedValue([{ id: 2, name: 'child' } satisfies TestItem])
    const moveSend = vi.fn().mockResolvedValue({ success: true })
    const batchSortSend = vi.fn().mockResolvedValue({ success: true })

    const methods = {
      getById: vi.fn().mockReturnValue({ send: vi.fn().mockResolvedValue({ id: 1, name: 'root' } satisfies TestItem) }),
      query: vi.fn().mockReturnValue({
        send: vi.fn().mockResolvedValue({ items: [], total: 0, limit: 10, offset: 0 })
      }),
      create: vi.fn().mockReturnValue({ send: vi.fn().mockResolvedValue({ id: 3, name: 'new' } satisfies TestItem) }),
      update: vi.fn().mockReturnValue({ send: vi.fn().mockResolvedValue({ id: 1, name: 'updated' } satisfies TestItem) }),
      delete: vi.fn().mockReturnValue({ send: vi.fn().mockResolvedValue(undefined) }),
      getTrash: vi.fn().mockReturnValue({
        send: vi.fn().mockResolvedValue({ items: [], total: 0, limit: 10, offset: 0 })
      }),
      restore: vi.fn().mockReturnValue({ send: vi.fn().mockResolvedValue({ id: 1, name: 'restored' } satisfies TestItem) }),
      permanentDelete: vi.fn().mockReturnValue({ send: vi.fn().mockResolvedValue(undefined) }),
      batchDelete: vi.fn().mockReturnValue({ send: vi.fn().mockResolvedValue({ success: 1, failed: 0, total: 1 }) }),
      batchRestore: vi.fn().mockReturnValue({ send: vi.fn().mockResolvedValue({ success: 1, failed: 0, total: 1 }) }),
      batchPermanentDelete: vi.fn().mockReturnValue({ send: vi.fn().mockResolvedValue({ success: 1, failed: 0, total: 1 }) }),
      tree: vi.fn().mockReturnValue({ send: treeSend }),
      children: vi.fn().mockReturnValue({ send: childrenSend }),
      move: vi.fn().mockReturnValue({ send: moveSend }),
      batchSort: vi.fn().mockReturnValue({ send: batchSortSend })
    }

    const pageConfig = createCrudPageConfigFromResource<TestItem, Record<string, never>, Record<string, never>>({
      resource: {
        key: 'menus',
        title: { text: '菜单管理' },
        methods,
        treeMode: { enabled: true }
      },
      fieldConfig: createFieldConfig()
    })

    const requestAdapter = pageConfig.resource.requestAdapter as typeof pageConfig.resource.requestAdapter & {
      tree?: (query?: unknown, config?: unknown) => Promise<unknown>
      children?: (params: unknown, config?: unknown) => Promise<unknown>
      move?: (body: unknown, config?: unknown) => Promise<unknown>
      batchSort?: (body: unknown, config?: unknown) => Promise<unknown>
    }

    expect(typeof requestAdapter.tree).toBe('function')
    expect(typeof requestAdapter.children).toBe('function')
    expect(typeof requestAdapter.move).toBe('function')
    expect(typeof requestAdapter.batchSort).toBe('function')

    await expect(requestAdapter.tree?.({ tree_depth: 0 })).resolves.toEqual([{ id: 1, name: 'root' }])
    await expect(requestAdapter.children?.({ node_id: 1 })).resolves.toEqual([{ id: 2, name: 'child' }])
    await expect(requestAdapter.move?.({ id: 2, target_id: 1, position: 'inner' })).resolves.toEqual({ success: true })
    await expect(requestAdapter.batchSort?.({ items: [] })).resolves.toEqual({ success: true })

    expect(methods.tree).toHaveBeenCalledWith({ tree_depth: 0 }, undefined)
    expect(methods.children).toHaveBeenCalledWith({ node_id: 1 }, undefined)
    expect(methods.move).toHaveBeenCalledWith({ id: 2, target_id: 1, position: 'inner' }, undefined)
    expect(methods.batchSort).toHaveBeenCalledWith({ items: [] }, undefined)
  })
})
