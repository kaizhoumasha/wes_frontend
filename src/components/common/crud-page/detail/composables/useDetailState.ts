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

  // Collapse state persistence (section key -> collapsed)
  const collapseStates = ref<Map<string, boolean>>(new Map())

  function openDetail(newItem: TItem): void {
    item.value = newItem
    open.value = true
    error.value = null
  }

  /**
   * Open detail panel and fetch item by ID
   */
  async function openDetailById(
    id: number,
    fetcher: (id: number) => Promise<TItem>
  ): Promise<void> {
    loading.value = true
    error.value = null
    open.value = true

    try {
      item.value = await fetcher(id)
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      item.value = null
    } finally {
      loading.value = false
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
   */
  async function refreshDetail(
    fetcher: (id: number) => Promise<TItem>
  ): Promise<void> {
    if (!item.value?.id) {
      return
    }

    loading.value = true
    error.value = null

    try {
      item.value = await fetcher(item.value.id)
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
    } finally {
      loading.value = false
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
