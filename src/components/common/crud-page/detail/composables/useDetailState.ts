/**
 * CRUD Detail Panel State Management
 *
 * @module crud-page/detail/composables/useDetailState
 *
 * Manages the state for detail panel including open/close, item loading,
 * collapse states, and error handling.
 */

import { ref, shallowRef } from 'vue'
import type { CrudPageEntity } from '../../types'
import type { CrudPageDetailSection } from '../types'

/**
 * Detail panel state management composable
 * @template TItem - Entity type
 */
export function useDetailState<TItem extends CrudPageEntity>() {
  // Core state
  const open = ref(false)
  const item = shallowRef<TItem | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  // Request cancellation token (increments on each new request)
  let requestId = 0

  // Collapse state persistence (section key -> collapsed)
  const collapseStates = ref<Map<string, boolean>>(new Map())

  function openDetail(newItem: TItem): void {
    item.value = newItem
    open.value = true
    error.value = null
  }

  /**
   * Open detail panel and fetch item by ID
   * Includes request cancellation to handle rapid entity switching
   */
  async function openDetailById(
    id: number,
    fetcher: (id: number) => Promise<TItem>
  ): Promise<void> {
    // Cancel any pending request by incrementing the request ID
    const currentRequestId = ++requestId

    loading.value = true
    error.value = null
    open.value = true

    try {
      const result = await fetcher(id)

      // Check if this request is still the current one
      if (currentRequestId !== requestId) {
        // Request was cancelled, discard result
        return
      }

      item.value = result
    } catch (err) {
      // Check if this request is still the current one
      if (currentRequestId !== requestId) {
        // Request was cancelled, discard error
        return
      }

      error.value = err instanceof Error ? err : new Error(String(err))
      item.value = null
    } finally {
      // Only update loading state if this is still the current request
      if (currentRequestId === requestId) {
        loading.value = false
      }
    }
  }

  /**
   * Close detail panel
   */
  function closeDetail(): void {
    open.value = false
    // Keep item for potential re-open, clear on next open
  }

  /**
   * Refresh current item
   * Includes request cancellation to handle rapid refresh calls
   */
  async function refreshDetail(
    fetcher: (id: number) => Promise<TItem>
  ): Promise<void> {
    if (!item.value?.id) {
      return
    }

    // Cancel any pending request by incrementing the request ID
    const currentRequestId = ++requestId

    loading.value = true
    error.value = null

    try {
      const result = await fetcher(item.value.id)

      // Check if this request is still the current one
      if (currentRequestId !== requestId) {
        // Request was cancelled, discard result
        return
      }

      item.value = result
    } catch (err) {
      // Check if this request is still the current one
      if (currentRequestId !== requestId) {
        // Request was cancelled, discard error
        return
      }

      error.value = err instanceof Error ? err : new Error(String(err))
    } finally {
      // Only update loading state if this is still the current request
      if (currentRequestId === requestId) {
        loading.value = false
      }
    }
  }

  function initCollapseStates(sections: CrudPageDetailSection<TItem>[] = []): void {
    sections.forEach(section => {
      if (section.collapsible && section.title) {
        const key = getSectionKey(section)
        // Only set if not already present (preserve user toggles)
        if (!collapseStates.value.has(key)) {
          collapseStates.value.set(key, section.defaultCollapsed ?? false)
        }
      }
    })
  }

  /**
   * Toggle section collapse state
   */
  function toggleSectionCollapse(section: CrudPageDetailSection<TItem>): void {
    const key = getSectionKey(section)
    const current = collapseStates.value.get(key) ?? false
    collapseStates.value.set(key, !current)
  }

  /**
   * Check if section is collapsed
   */
  function isSectionCollapsed(section: CrudPageDetailSection<TItem>): boolean {
    const key = getSectionKey(section)
    return collapseStates.value.get(key) ?? section.defaultCollapsed ?? false
  }

  function getSectionKey(section: CrudPageDetailSection<TItem>): string {
    const fieldKeys = section.fields?.map(field => field.key).join('|')

    return [section.title, section.icon, section.relation?.type, fieldKeys]
      .filter(Boolean)
      .join('::') || 'section'
  }

  return {
    open,
    item,
    loading,
    error,
    openDetail,
    openDetailById,
    closeDetail,
    refreshDetail,
    initCollapseStates,
    toggleSectionCollapse,
    isSectionCollapsed
  }
}
