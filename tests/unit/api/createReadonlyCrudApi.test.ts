import { describe, expect, it, vi } from 'vitest'
import { createReadonlyCrudApi } from '@/api/base/createReadonlyCrudApi'

interface TestItem {
  id: number
  name: string
}

describe('createReadonlyCrudApi', () => {
  it('adapts getById with path params object', async () => {
    const getById = vi.fn().mockResolvedValue({ id: 7, name: 'audit-log' } satisfies TestItem)
    const query = vi.fn()

    const api = createReadonlyCrudApi<TestItem, { verbose?: boolean }>({
      getById,
      query
    })

    const result = await api.getById(7, {
      query: { verbose: true },
      config: { headers: { 'x-test': '1' } }
    })

    expect(result).toEqual({ id: 7, name: 'audit-log' })
    expect(getById).toHaveBeenCalledWith(
      { id: 7 },
      { verbose: true },
      { headers: { 'x-test': '1' } }
    )
  })

  it('normalizes list response to PaginationData', async () => {
    const getById = vi.fn()
    const query = vi.fn().mockResolvedValue({
      items: [
        { id: 11, name: 'one' },
        { id: 12, name: 'two' }
      ],
      total: 11,
      limit: 5,
      offset: 5
    })

    const api = createReadonlyCrudApi<TestItem>({
      getById,
      query
    })

    const result = await api.query({
      offset: 5,
      limit: 5,
      filters: { couple: 'and', conditions: [] }
    })

    expect(query).toHaveBeenCalledWith({
      offset: 5,
      limit: 5,
      max_depth: 1,
      include_deleted: false,
      filters: { couple: 'and', conditions: [] }
    }, undefined)
    expect(result).toEqual({
      items: [
        { id: 11, name: 'one' },
        { id: 12, name: 'two' }
      ],
      total: 11,
      page: 2,
      size: 5,
      pages: 3
    })
  })

  it('fills default query options when omitted', async () => {
    const getById = vi.fn()
    const query = vi.fn().mockResolvedValue({
      items: [],
      total: 0,
      limit: 10,
      offset: 0
    })

    const api = createReadonlyCrudApi<TestItem>({
      getById,
      query
    })

    await api.query()

    expect(query).toHaveBeenCalledWith({
      offset: 0,
      limit: 10,
      max_depth: 1,
      include_deleted: false
    }, undefined)
  })

  it('keeps default query options when caller passes explicit undefined values', async () => {
    const getById = vi.fn()
    const query = vi.fn().mockResolvedValue({
      items: [],
      total: 0,
      limit: 10,
      offset: 0
    })

    const api = createReadonlyCrudApi<TestItem>({
      getById,
      query
    })

    await api.query({
      offset: undefined,
      limit: undefined,
      max_depth: undefined,
      include_deleted: undefined,
      sort: undefined,
      filters: undefined
    })

    expect(query).toHaveBeenCalledWith({
      offset: 0,
      limit: 10,
      max_depth: 1,
      include_deleted: false,
      sort: undefined,
      filters: undefined
    }, undefined)
  })

  it('throws for unsupported write operations', async () => {
    const api = createReadonlyCrudApi<TestItem>({
      getById: vi.fn(),
      query: vi.fn()
    })

    await expect(api.create({})).rejects.toThrow('Readonly CRUD API does not support create')
    await expect(api.update(1, {})).rejects.toThrow('Readonly CRUD API does not support update')
    await expect(api.delete(1)).rejects.toThrow('Readonly CRUD API does not support delete')
  })
})
