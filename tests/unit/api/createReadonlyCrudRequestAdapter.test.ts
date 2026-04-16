import { describe, expect, it, vi } from 'vitest'
import { createReadonlyCrudRequestAdapter, createReadonlyCrudRequestAdapterFromMethods } from '@/api/base/createReadonlyCrudRequestAdapter'

interface TestItem {
  id: number
  name: string
}

describe('createReadonlyCrudRequestAdapter', () => {
  it('adapts getById with path params object', async () => {
    const getById = vi.fn().mockResolvedValue({ id: 7, name: 'audit-log' } satisfies TestItem)
    const query = vi.fn()

    const requestAdapter = createReadonlyCrudRequestAdapter<TestItem, { verbose?: boolean }>({
      getById,
      query
    })

    const result = await requestAdapter.getById(7, {
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

    const requestAdapter = createReadonlyCrudRequestAdapter<TestItem>({
      getById,
      query
    })

    const result = await requestAdapter.query({
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

    const requestAdapter = createReadonlyCrudRequestAdapter<TestItem>({
      getById,
      query
    })

    await requestAdapter.query()

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

    const requestAdapter = createReadonlyCrudRequestAdapter<TestItem>({
      getById,
      query
    })

    await requestAdapter.query({
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
    const requestAdapter = createReadonlyCrudRequestAdapter<TestItem>({
      getById: vi.fn(),
      query: vi.fn()
    })

    await expect(requestAdapter.create({})).rejects.toThrow('Readonly CRUD request adapter does not support create')
    await expect(requestAdapter.update(1, {})).rejects.toThrow('Readonly CRUD request adapter does not support update')
    await expect(requestAdapter.delete(1)).rejects.toThrow('Readonly CRUD request adapter does not support delete')
  })
})


describe('createReadonlyCrudRequestAdapterFromMethods', () => {
  it('adapts getById from method factories', async () => {
    const getById = vi.fn().mockReturnValue({
      send: vi.fn().mockResolvedValue({ id: 8, name: 'audit-log-method' } satisfies TestItem)
    })
    const query = vi.fn()

    const requestAdapter = createReadonlyCrudRequestAdapterFromMethods<TestItem, { verbose?: boolean }>({
      getById,
      query
    })

    const result = await requestAdapter.getById(8, {
      query: { verbose: true },
      config: { headers: { 'x-test': '2' } }
    })

    expect(result).toEqual({ id: 8, name: 'audit-log-method' })
    expect(getById).toHaveBeenCalledWith(
      { id: 8 },
      { verbose: true },
      { headers: { 'x-test': '2' } }
    )
  })

  it('normalizes list response from method factories to PaginationData', async () => {
    const getById = vi.fn()
    const querySend = vi.fn().mockResolvedValue({
      items: [
        { id: 21, name: 'one' },
        { id: 22, name: 'two' }
      ],
      total: 12,
      limit: 4,
      offset: 4
    })
    const query = vi.fn().mockReturnValue({ send: querySend })

    const requestAdapter = createReadonlyCrudRequestAdapterFromMethods<TestItem>({
      getById,
      query
    })

    const result = await requestAdapter.query({ offset: 4, limit: 4 })

    expect(query).toHaveBeenCalledWith({
      offset: 4,
      limit: 4,
      max_depth: 1,
      include_deleted: false
    }, undefined)
    expect(result).toEqual({
      items: [
        { id: 21, name: 'one' },
        { id: 22, name: 'two' }
      ],
      total: 12,
      page: 2,
      size: 4,
      pages: 3
    })
  })
})
