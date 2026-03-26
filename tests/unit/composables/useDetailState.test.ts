/**
 * useDetailState Composable Tests
 *
 * Tests for detail panel state management including:
 * - Open/close behavior
 * - Item loading
 * - Request cancellation
 * - Collapse state management
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useDetailState } from '@/components/common/crud-page/detail/composables/useDetailState'
import { createMockEntity, createMockFetcher } from '../../utils/mock'

interface TestEntity {
  id: number
  name: string
}

describe('useDetailState', () => {
  let state: ReturnType<typeof useDetailState<TestEntity>>
  const mockEntity = createMockEntity({ name: 'Test User' }) as TestEntity

  beforeEach(() => {
    state = useDetailState<TestEntity>()
    vi.clearAllMocks()
  })

  describe('openDetail', () => {
    it('should open panel with item', () => {
      state.openDetail(mockEntity)

      expect(state.open.value).toBe(true)
      expect(state.item.value).toEqual(mockEntity)
      expect(state.error.value).toBeNull()
    })

    it('should clear previous error when opening', () => {
      state.error.value = new Error('Previous error')
      state.openDetail(mockEntity)

      expect(state.error.value).toBeNull()
    })
  })

  describe('closeDetail', () => {
    it('should close panel', () => {
      state.openDetail(mockEntity)
      state.closeDetail()

      expect(state.open.value).toBe(false)
    })

    it('should keep item for potential re-open', () => {
      state.openDetail(mockEntity)
      state.closeDetail()

      expect(state.item.value).toEqual(mockEntity)
    })
  })

  describe('openDetailById', () => {
    it('should load item by ID', async () => {
      const fetcher = createMockFetcher(mockEntity)

      await state.openDetailById(1, fetcher)

      expect(fetcher).toHaveBeenCalledWith(1)
      expect(state.item.value).toEqual(mockEntity)
      expect(state.loading.value).toBe(false)
      expect(state.open.value).toBe(true)
    })

    it('should set error on fetch failure', async () => {
      const fetcher = createMockFetcher(mockEntity)
      fetcher.mockRejectedValueOnce(new Error('Network error'))

      await state.openDetailById(1, fetcher)

      expect(state.error.value).toBeInstanceOf(Error)
      expect(state.error.value?.message).toBe('Network error')
      expect(state.item.value).toBeNull()
      expect(state.loading.value).toBe(false)
    })

    it('should cancel previous request when called rapidly', async () => {
      const fetcher = vi.fn(async (id: number) => {
        await new Promise(r => setTimeout(r, 100))
        return { id, name: `User ${id}` }
      })

      // Start first request
      const firstPromise = state.openDetailById(1, fetcher)

      // Immediately start second request (cancels first)
      const secondPromise = state.openDetailById(2, fetcher)

      await Promise.all([firstPromise, secondPromise])

      // Should have the result from the second request
      expect(state.item.value?.id).toBe(2)
    })

    it('should set loading state during fetch', async () => {
      const fetcher = createMockFetcher(mockEntity, 50)

      const promise = state.openDetailById(1, fetcher)

      // Check loading state immediately
      expect(state.loading.value).toBe(true)

      await promise

      expect(state.loading.value).toBe(false)
    })
  })

  describe('refreshDetail', () => {
    it('should refresh current item', async () => {
      const fetcher = createMockFetcher(mockEntity)
      state.openDetail(mockEntity)

      const updatedEntity = { ...mockEntity, name: 'Updated' }
      fetcher.mockResolvedValueOnce(updatedEntity)

      await state.refreshDetail(fetcher)

      expect(state.item.value?.name).toBe('Updated')
    })

    it('should do nothing if no current item', async () => {
      const fetcher = createMockFetcher(mockEntity)

      await state.refreshDetail(fetcher)

      expect(fetcher).not.toHaveBeenCalled()
    })

    it('should cancel previous refresh request', async () => {
      const fetcher = vi.fn(async (id: number) => {
        await new Promise(r => setTimeout(r, 100))
        return { id, name: `User ${id}` }
      })

      state.openDetail({ id: 1, name: 'Original' } as TestEntity)

      // Start first refresh
      const firstPromise = state.refreshDetail(fetcher)

      // Immediately start second refresh
      const secondPromise = state.refreshDetail(fetcher)

      await Promise.all([firstPromise, secondPromise])

      // Should complete without errors
      expect(state.loading.value).toBe(false)
    })
  })

  describe('collapse state management', () => {
    const mockSection = {
      title: 'Test Section',
      collapsible: true,
      defaultCollapsed: false
    }

    it('should initialize collapse states', () => {
      state.initCollapseStates([mockSection])

      expect(state.isSectionCollapsed(mockSection)).toBe(false)
    })

    it('should toggle collapse state', () => {
      state.initCollapseStates([mockSection])

      state.toggleSectionCollapse(mockSection)
      expect(state.isSectionCollapsed(mockSection)).toBe(true)

      state.toggleSectionCollapse(mockSection)
      expect(state.isSectionCollapsed(mockSection)).toBe(false)
    })

    it('should respect defaultCollapsed', () => {
      const collapsedSection = { ...mockSection, defaultCollapsed: true }

      state.initCollapseStates([collapsedSection])

      expect(state.isSectionCollapsed(collapsedSection)).toBe(true)
    })

    it('should preserve user toggles on re-init', () => {
      state.initCollapseStates([mockSection])
      state.toggleSectionCollapse(mockSection)

      // Re-init should not override user toggle
      state.initCollapseStates([mockSection])

      expect(state.isSectionCollapsed(mockSection)).toBe(true)
    })
  })
})