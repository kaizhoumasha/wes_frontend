import { describe, expect, it, vi } from 'vitest'
import { useCrudListPage } from '@/composables/useCrudListPage'
import type { CrudApi, PaginationData } from '@/api/base/crud-api'
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

function createApiStub(): CrudApi<TestItem, Record<string, never>, Record<string, never>> {
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

describe('useCrudListPage', () => {
  it('refetches first page when page size changes', async () => {
    const api = createApiStub()
    const page = useCrudListPage({
      api,
      searchFields: SEARCH_FIELDS,
      pageSize: 20
    })

    await page.search.handleSearch(3)
    await page.search.handlePageSizeChange(50)

    expect(api.query).toHaveBeenNthCalledWith(1, {
      filters: undefined,
      sort: null,
      offset: 40,
      limit: 20
    })
    expect(api.query).toHaveBeenNthCalledWith(2, {
      filters: undefined,
      sort: null,
      offset: 0,
      limit: 50
    })
    expect(page.state.pagination.page).toBe(1)
    expect(page.state.pagination.pageSize).toBe(50)
  })

  it('uses dynamic quick preset conditions at apply time', () => {
    const page = useCrudListPage({
      api: createApiStub(),
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
