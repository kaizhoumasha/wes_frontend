import { ref, computed, type Ref, type ComputedRef } from 'vue'
import type { TableDensity } from '@/types/table'

/**
 * useCrudToolbar Composable
 *
 * 管理工具栏相关 UI 状态（全屏、密度、列配置），并将外部传入的批量操作状态聚合为 `toolbarState` 对象，供 `CrudToolbar` 组件直接消费.
 *
 * @example
 * ```typescript
 * const {
 *   isFullscreen,
 *   toggleFullscreen,
 *   density,
 *   setDensity,
 *   columnConfigDialogOpen,
 *   openColumnConfig,
 *   closeColumnConfig,
 *   toolbarState // ← 直接传给 CrudToolbar
 * } = useCrudToolbar({
 *   externalState: {
 *     loading,
 *     selectedCount,
 *     batchDeleteLoading
 *   }
 * })
 * ```
 */

// ============================================================================
// 类型定义
// ============================================================================

export interface UseCrudToolbarOptions {
  /**
   * 来自 useCrudListPage 的外部状态引用.
   * useCrudToolbar 不拥有这些状态，只是将它们聚合进 toolbarState.
   */
  externalState: {
    loading: Ref<boolean>
    selectedCount: Ref<number>
    batchDeleteLoading: Ref<boolean>
  }
}

export interface UseCrudToolbarReturn {
  // 全屏状态
  isFullscreen: Ref<boolean>
  toggleFullscreen: () => void

  // 密度状态
  density: Ref<TableDensity>
  setDensity: (density: TableDensity) => void

  // 列配置对话框状态
  columnConfigDialogOpen: Ref<boolean>
  openColumnConfig: () => void
  closeColumnConfig: () => void

  /**
   * 聚合后的工具栏状态对象，直接传给 CrudToolbar 的 :toolbar-state.
   * 内部是一个 computed，自动响应所有状态变化.
   */
  toolbarState: ComputedRef<{
    loading: boolean
    selectedCount: number
    batchDeleteLoading: boolean
    isFullscreen: boolean
    density: TableDensity
  }>
}

// ============================================================================
// Composable 实现
// ============================================================================

export function useCrudToolbar(options: UseCrudToolbarOptions): UseCrudToolbarReturn {
  const { externalState } = options

  // ==================== 全屏状态 ====================
  const isFullscreen = ref(false)

  function toggleFullscreen() {
    isFullscreen.value = !isFullscreen.value
  }

  // ==================== 密度状态 ====================
  const density = ref<TableDensity>('comfortable')

  function setDensity(newDensity: TableDensity) {
    density.value = newDensity
  }

  // ==================== 列配置对话框状态 ====================
  const columnConfigDialogOpen = ref(false)

  function openColumnConfig() {
    columnConfigDialogOpen.value = true
  }

  function closeColumnConfig() {
    columnConfigDialogOpen.value = false
  }

  // ==================== 聚合工具栏状态 ====================
  const toolbarState = computed(() => ({
    loading: externalState.loading.value,
    selectedCount: externalState.selectedCount.value,
    batchDeleteLoading: externalState.batchDeleteLoading.value,
    isFullscreen: isFullscreen.value,
    density: density.value
  }))

  return {
    isFullscreen,
    toggleFullscreen,
    density,
    setDensity,
    columnConfigDialogOpen,
    openColumnConfig,
    closeColumnConfig,
    toolbarState
  }
}
