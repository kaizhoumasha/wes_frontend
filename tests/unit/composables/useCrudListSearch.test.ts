import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { createCrudListSearchHandlers } from '@/composables/crud/useCrudListSearch'

describe('createCrudListSearchHandlers', () => {
  function createBaseOptions() {
    return {
      isTreeMode: false,
      isTrashMode: () => false,
      isSearchMode: ref(false),
      compileFilters: vi.fn(() => undefined),
      buildQueryOptions: vi.fn((page?: number) => ({ offset: page ? (page - 1) * 20 : 0, limit: 20 })),
      fetchTree: vi.fn().mockResolvedValue(undefined),
      fetchTrash: vi.fn().mockResolvedValue(undefined),
      crud: {
        fetchList: vi.fn().mockResolvedValue(undefined),
        pagination: {
          page: 1,
          pageSize: 20,
          total: 0
        }
      },
      trash: {
        trashPagination: {
          page: 1,
          pageSize: 20,
          total: 0
        }
      },
      currentPagination: {
        page: 1,
        pageSize: 20,
        total: 0
      },
      sorting: {
        sortState: ref(null),
        handleSortChange: vi.fn().mockResolvedValue(undefined)
      }
    }
  }

  it('prioritizes trash fetching over tree fetching when both trash mode and tree mode are enabled', async () => {
    const options = createBaseOptions()
    options.isTreeMode = true
    options.isTrashMode = () => true

    const handlers = createCrudListSearchHandlers(options)
    await handlers.handleSearch(1)

    expect(options.fetchTrash).toHaveBeenCalledWith(1)
    expect(options.fetchTree).not.toHaveBeenCalled()
    expect(options.crud.fetchList).not.toHaveBeenCalled()
    expect(options.isSearchMode.value).toBe(false)
  })

  it('fetches tree data in tree mode when there are no filters', async () => {
    const options = createBaseOptions()
    options.isTreeMode = true
    options.compileFilters = vi.fn(() => ({ couple: 'and', conditions: [] }))

    const handlers = createCrudListSearchHandlers(options)
    await handlers.handleSearch(1)

    expect(options.fetchTree).toHaveBeenCalledTimes(1)
    expect(options.fetchTrash).not.toHaveBeenCalled()
    expect(options.crud.fetchList).not.toHaveBeenCalled()
    expect(options.isSearchMode.value).toBe(false)
  })

  it('fetches flat list data in tree mode when filters exist', async () => {
    const options = createBaseOptions()
    options.isTreeMode = true
    options.compileFilters = vi.fn(() => ({
      couple: 'and',
      conditions: [{ field: 'name', operator: 'contains', value: 'admin' }]
    }))

    const handlers = createCrudListSearchHandlers(options)
    await handlers.handleSearch(2)

    expect(options.crud.fetchList).toHaveBeenCalledWith({ offset: 20, limit: 20 })
    expect(options.fetchTree).not.toHaveBeenCalled()
    expect(options.fetchTrash).not.toHaveBeenCalled()
    expect(options.isSearchMode.value).toBe(true)
  })

  it('fetches trash data in non-tree trash mode', async () => {
    const options = createBaseOptions()
    options.isTrashMode = () => true

    const handlers = createCrudListSearchHandlers(options)
    await handlers.handleSearch(3)

    expect(options.fetchTrash).toHaveBeenCalledWith(3)
    expect(options.crud.fetchList).not.toHaveBeenCalled()
    expect(options.fetchTree).not.toHaveBeenCalled()
  })
})
