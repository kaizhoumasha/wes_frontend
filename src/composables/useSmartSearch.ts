/**
 * 智能搜索 Composable
 *
 * 提供统一的搜索状态管理和操作方法。
 * 这是整个搜索能力的核心状态源，主搜索框、Popover、高级搜索弹窗都依赖此状态。
 *
 * @module composables/useSmartSearch
 */

import { computed, ref, type ComputedRef, type Ref } from 'vue'

import type {
  SearchCondition,
  SearchConditionDraft,
  SearchFavorite,
  SearchFieldDef,
  SmartSearchState,
  QuickSearchPreset
} from '@/types/search'
import type { FilterGroup } from '@/api/base/crud-request-adapter'
import { useSmartSearchConditions } from '@/composables/search/useSmartSearchConditions'
import { useSmartSearchUi } from '@/composables/search/useSmartSearchUi'

// ==================== 类型定义 ====================

/**
 * useSmartSearch 配置选项
 */
export interface UseSmartSearchOptions {
  /** 可搜索字段列表 */
  fields: SearchFieldDef[]
  /** 收藏夹列表（可选） */
  favorites?: SearchFavorite[]
  /** 快速搜索预设列表（可选） */
  quickPresets?: QuickSearchPreset[]
  /** 条件变化时的回调函数（用于自动触发搜索） */
  onConditionsChange?: (conditions: SearchCondition[]) => void
}

/**
 * useSmartSearch 返回值
 */
export interface UseSmartSearchReturn {
  /** 搜索状态 */
  state: Ref<SmartSearchState>
  /** 条件列表（计算属性） */
  conditions: ComputedRef<SearchCondition[]>
  /** 高级过滤组（计算属性） */
  advancedFilterGroup: ComputedRef<FilterGroup | undefined>
  /** 是否有条件（计算属性） */
  hasConditions: ComputedRef<boolean>
  /** 当前高亮字段（计算属性） */
  activeField: ComputedRef<SearchFieldDef | undefined>
  /** 与当前关键字兼容的字段列表（计算属性） */
  compatibleFields: ComputedRef<SearchFieldDef[]>

  // Keyword 操作
  /** 设置关键字 */
  setKeyword: (keyword: string) => void
  /** 清空关键字 */
  clearKeyword: () => void

  // 字段操作
  /** 设置当前高亮字段 */
  setActiveField: (fieldKey?: string) => void
  /** 获取下一个可选中字段（用于键盘导航） */
  getNextActiveField: (direction: 'next' | 'prev') => SearchFieldDef | undefined

  // 条件操作
  /** 添加条件 */
  addCondition: (draft: SearchConditionDraft) => void
  /** 删除条件 */
  removeCondition: (id: string) => void
  /** 替换条件 */
  replaceCondition: (id: string, draft: SearchConditionDraft) => void
  /** 用新条件集整体替换现有条件 */
  replaceConditions: (drafts: SearchConditionDraft[]) => void
  /** 设置收藏夹列表 */
  setFavorites: (favorites: SearchFavorite[]) => void
  /** 设置高级过滤组 */
  setAdvancedFilterGroup: (group: FilterGroup | undefined) => void
  /** 清空高级过滤组 */
  clearAdvancedFilterGroup: () => void
  /** 清空所有已应用筛选 */
  clearAppliedFilters: () => void
  /** 清空所有条件 */
  clearConditions: () => void

  // 收藏夹与预设
  /** 应用收藏夹 */
  applyFavorite: (favoriteId: string) => void
  /** 应用快速预设 */
  applyQuickPreset: (presetId: string, options?: { deduplicate?: boolean }) => void
  /** 根据当前高亮字段和关键字生成条件 */
  buildConditionFromActiveField: () => void
  /** 根据指定字段和当前关键字生成条件 */
  buildConditionFromField: (fieldKey: string) => boolean

  // UI 状态
  /** 打开 Popover */
  openPopover: () => void
  /** 关闭 Popover */
  closePopover: () => void
  /** 切换 Popover 状态 */
  togglePopover: () => void
  /** 打开高级搜索弹窗 */
  openAdvancedDialog: (fieldKey?: string) => void
  /** 关闭高级搜索弹窗 */
  closeAdvancedDialog: () => void

  // 编译
  /** 编译为 FilterGroup */
  compileToFilterGroup: () => FilterGroup | undefined
}

// ==================== 主函数 ====================

/**
 * 智能搜索 Composable
 *
 * @param options - 配置选项
 * @returns 搜索状态和操作方法
 *
 * @example
 * ```ts
 * const smartSearch = useSmartSearch({
 *   fields: userSearchFields,
 *   favorites: userSearchFavorites,
 *   quickPresets: userQuickPresets,
 * })
 *
 * // 使用
 * smartSearch.setKeyword('admin')
 * smartSearch.setActiveField('username')
 * smartSearch.buildConditionFromActiveField()
 * const filters = smartSearch.compileToFilterGroup()
 * ```
 */
export function useSmartSearch(options: UseSmartSearchOptions): UseSmartSearchReturn {
  const { fields, favorites: initialFavorites = [], quickPresets = [], onConditionsChange } = options

  // ==================== 状态初始化 ====================

  const state = ref<SmartSearchState>({
    keyword: '',
    activeField: undefined,
    conditions: [],
    advancedFilterGroup: undefined,
    favorites: initialFavorites,
    popoverOpen: false,
    advancedDialogOpen: false,
    advancedDialogDraftSeed: undefined,
  })

  // ==================== 计算属性 ====================

  const conditions: ComputedRef<SearchCondition[]> = computed(() => state.value.conditions)

  const advancedFilterGroup: ComputedRef<FilterGroup | undefined> = computed(
    () => state.value.advancedFilterGroup
  )

  const hasConditions: ComputedRef<boolean> = computed(
    () => state.value.conditions.length > 0 || state.value.advancedFilterGroup !== undefined
  )

  function notifyConditionsChange(): void {
    if (onConditionsChange) {
      onConditionsChange(conditions.value)
    }
  }

  const {
    activeField,
    compatibleFields,
    setKeyword,
    clearKeyword,
    setActiveField,
    getNextActiveField,
    openPopover,
    closePopover,
    togglePopover,
    openAdvancedDialog,
    closeAdvancedDialog
  } = useSmartSearchUi({
    state,
    fields
  })

  const {
    addCondition,
    removeCondition,
    replaceCondition,
    replaceConditions,
    setFavorites,
    setAdvancedFilterGroup,
    clearAdvancedFilterGroup,
    clearAppliedFilters,
    clearConditions,
    applyFavorite,
    applyQuickPreset,
    buildConditionFromActiveField,
    buildConditionFromField,
    compileToFilterGroup
  } = useSmartSearchConditions({
    state,
    fields,
    quickPresets,
    activeField,
    notifyConditionsChange,
    setKeyword,
    setActiveField,
    closePopover
  })

  // ==================== 返回 API ====================

  return {
    state,
    conditions,
    advancedFilterGroup,
    hasConditions,
    activeField,
    compatibleFields,

    setKeyword,
    clearKeyword,

    setActiveField,
    getNextActiveField,

    addCondition,
    removeCondition,
    replaceCondition,
    replaceConditions,
    setFavorites,
    setAdvancedFilterGroup,
    clearAdvancedFilterGroup,
    clearAppliedFilters,
    clearConditions,

    applyFavorite,
    applyQuickPreset,
    buildConditionFromActiveField,
    buildConditionFromField,

    openPopover,
    closePopover,
    togglePopover,
    openAdvancedDialog,
    closeAdvancedDialog,

    compileToFilterGroup,
  }
}
