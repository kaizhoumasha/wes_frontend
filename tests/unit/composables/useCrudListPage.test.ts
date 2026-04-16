import { describe, expect, it, vi } from 'vitest'
import { useCrudListPage } from '@/composables/useCrudListPage'
import type { CrudRequestAdapter, PaginationData } from '@/api/base/crud-request-adapter'
import type { SearchFieldDef } from '@/types/search'

interface TestItem {
  id: number
  name: string
}

const SEARCH_FIELDS: SearchFieldDef[] = [
  {
    key: 'name',
    label: '名称',
    dataType: 'text',
    defaultOperator: 'contains'
  }
]

function createPaginationData(size: number, page = 1): PaginationData<TestItem> {
  return {
    items: [{ id: page, name: `row-${page}` }],
    total: 100,
    page,
    size,
    pages: Math.ceil(100 / size)
  }
}

function createRequestAdapterStub(): CrudRequestAdapter<TestItem, Record<string, never>, Record<string, never>> {
  return {
    getById: vi.fn(),
    query: vi
      .fn()
      .mockImplementation(({ limit = 20, offset = 0 }: { limit?: number; offset?: number }) => {
        const page = Math.floor(offset / limit) + 1
        return Promise.resolve(createPaginationData(limit, page))
      }),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  }
}


function createSoftDeleteRequestAdapterStub() {
  const getTrash = vi
    .fn()
    .mockImplementation(({ limit = 20, offset = 0 }: { limit?: number; offset?: number }) => {
      const page = Math.floor(offset / limit) + 1
      return Promise.resolve(createPaginationData(limit, page))
    })

  return {
    getById: vi.fn(),
    query: vi
      .fn()
      .mockImplementation(({ limit = 20, offset = 0 }: { limit?: number; offset?: number }) => {
        const page = Math.floor(offset / limit) + 1
        return Promise.resolve(createPaginationData(limit, page))
      }),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getTrash,
    restore: vi.fn(),
    permanentDelete: vi.fn(),
    batchDelete: vi.fn(),
    batchRestore: vi.fn(),
    batchPermanentDelete: vi.fn()
  }
}


function createTreeSoftDeleteRequestAdapterStub() {
  const tree = vi.fn().mockResolvedValue([{ id: 100, name: 'tree-root', children: [] }])
  const children = vi.fn().mockResolvedValue([])
  const getTrash = vi
    .fn()
    .mockImplementation(({ limit = 20, offset = 0 }: { limit?: number; offset?: number }) => {
      const page = Math.floor(offset / limit) + 1
      return Promise.resolve(createPaginationData(limit, page))
    })
  const query = vi
    .fn()
    .mockImplementation(({ limit = 20, offset = 0 }: { limit?: number; offset?: number }) => {
      const page = Math.floor(offset / limit) + 1
      return Promise.resolve(createPaginationData(limit, page))
    })

  return {
    getById: vi.fn(),
    query,
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getTrash,
    restore: vi.fn(),
    permanentDelete: vi.fn(),
    batchDelete: vi.fn(),
    batchRestore: vi.fn(),
    batchPermanentDelete: vi.fn(),
    tree,
    children,
    move: vi.fn(),
    batchSort: vi.fn()
  }
}

describe('useCrudListPage', () => {
  it('refetches first page when page size changes', async () => {
    const adapter = createRequestAdapterStub()
    const page = useCrudListPage({
      adapter,
      searchFields: SEARCH_FIELDS,
      pageSize: 20
    })

    await page.search.handleSearch(3)
    await page.search.handlePageSizeChange(50)

    expect(adapter.query).toHaveBeenNthCalledWith(1, {
      filters: undefined,
      sort: null,
      offset: 40,
      limit: 20
    })
    expect(adapter.query).toHaveBeenNthCalledWith(2, {
      filters: undefined,
      sort: null,
      offset: 0,
      limit: 50
    })
    expect(page.state.pagination.page).toBe(1)
    expect(page.state.pagination.pageSize).toBe(50)
  })



  it('uses trash fetching for trash-mode search, refresh, and page-size changes', async () => {
    const adapter = createSoftDeleteRequestAdapterStub()
    const page = useCrudListPage({
      adapter,
      searchFields: SEARCH_FIELDS,
      pageSize: 20
    })

    page.view.setViewMode('trash')

    await page.search.handleSearch(3)
    await page.search.handleRefresh()
    await page.search.handlePageSizeChange(50)

    expect(adapter.getTrash).toHaveBeenNthCalledWith(1, {
      offset: 40,
      limit: 20
    })
    expect(adapter.getTrash).toHaveBeenNthCalledWith(2, {
      offset: 40,
      limit: 20
    })
    expect(adapter.getTrash).toHaveBeenNthCalledWith(3, {
      offset: 0,
      limit: 50
    })
    expect(adapter.query).not.toHaveBeenCalled()
    expect(page.state.isTrashMode.value).toBe(true)
    expect(page.state.pagination.page).toBe(1)
    expect(page.state.pagination.pageSize).toBe(50)
  })



  it('uses tree fetching for active tree mode without filters', async () => {
    const adapter = createTreeSoftDeleteRequestAdapterStub()
    const page = useCrudListPage({
      adapter,
      searchFields: SEARCH_FIELDS,
      pageSize: 20,
      treeMode: {
        enabled: true,
        childrenKey: 'children',
        hasChildrenKey: 'has_children',
        lazyLoad: true,
        initialExpandLevel: 1
      }
    })

    await page.search.handleSearch(1)

    expect(adapter.tree).toHaveBeenCalledWith({ tree_depth: 0 })
    expect(adapter.query).not.toHaveBeenCalled()
    expect(adapter.getTrash).not.toHaveBeenCalled()
    expect(page.tree?.isSearchMode.value).toBe(false)
  })

  it('uses flat query fetching for active tree mode with filters', async () => {
    const adapter = createTreeSoftDeleteRequestAdapterStub()
    const page = useCrudListPage({
      adapter,
      searchFields: SEARCH_FIELDS,
      pageSize: 20,
      treeMode: {
        enabled: true,
        childrenKey: 'children',
        hasChildrenKey: 'has_children',
        lazyLoad: true,
        initialExpandLevel: 1
      }
    })

    page.search.instance.replaceConditions([
      { field: 'name', operator: 'contains', value: 'admin' }
    ])

    expect(adapter.query).toHaveBeenCalledWith({
      filters: {
        couple: 'and',
        conditions: [
          {
            field: 'name',
            op: 'ilike',
            value: '%admin%'
          }
        ]
      },
      sort: null,
      offset: 0,
      limit: 20
    })
    expect(adapter.tree).not.toHaveBeenCalled()
    expect(page.tree?.isSearchMode.value).toBe(true)
  })

  it('uses trash fetching for tree pages when switched to trash mode', async () => {
    const adapter = createTreeSoftDeleteRequestAdapterStub()
    const page = useCrudListPage({
      adapter,
      searchFields: SEARCH_FIELDS,
      pageSize: 20,
      treeMode: {
        enabled: true,
        childrenKey: 'children',
        hasChildrenKey: 'has_children',
        lazyLoad: true,
        initialExpandLevel: 1
      }
    })

    page.view.setViewMode('trash')
    await page.search.handleSearch(2)

    expect(adapter.getTrash).toHaveBeenCalledWith({
      offset: 20,
      limit: 20
    })
    expect(adapter.tree).not.toHaveBeenCalled()
    expect(adapter.query).not.toHaveBeenCalled()
    expect(page.state.isTrashMode.value).toBe(true)
  })

  it('uses dynamic quick preset conditions at apply time', () => {
    const page = useCrudListPage({
      adapter: createRequestAdapterStub(),
      searchFields: SEARCH_FIELDS,
      quickPresets: [
        {
          id: 'recent-name',
          label: '最近一次',
          conditions: [{ field: 'name', operator: 'contains', value: 'stale' }],
          resolveConditions: () => [{ field: 'name', operator: 'contains', value: 'fresh' }]
        }
      ]
    })

    page.search.instance.applyQuickPreset('recent-name')

    expect(page.search.instance.conditions.value).toHaveLength(1)
    expect(page.search.instance.conditions.value[0]?.value).toBe('fresh')
  })
})
