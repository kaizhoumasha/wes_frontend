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
  QuickSearchPreset,
} from '@/types/search'
import {
  buildConditionLabel,
  compileConditions,
  getCompatibleFields,
  generateConditionId,
} from '@/utils/search-compiler'
import { parseKeywordValue } from '@/utils/search-value-parser'
import { validateConditionDraft } from '@/types/search'
import type { FilterGroup } from '@/api/base/crud-api'

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
  /** 清空所有条件 */
  clearConditions: () => void

  // 收藏夹与预设
  /** 应用收藏夹 */
  applyFavorite: (favoriteId: string) => void
  /** 应用快速预设 */
  applyQuickPreset: (presetId: string) => void
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
    favorites: initialFavorites,
    popoverOpen: false,
    advancedDialogOpen: false,
    advancedDialogDraftSeed: undefined,
  })

  // ==================== 计算属性 ====================

  const conditions: ComputedRef<SearchCondition[]> = computed(() => state.value.conditions)

  const hasConditions: ComputedRef<boolean> = computed(() => state.value.conditions.length > 0)

  const activeField: ComputedRef<SearchFieldDef | undefined> = computed(() => {
    if (!state.value.activeField) return undefined
    return fields.find((f) => f.key === state.value.activeField)
  })

  const compatibleFields: ComputedRef<SearchFieldDef[]> = computed(() => {
    // 先按关键字类型过滤，再过滤掉不可搜索字段
    return getCompatibleFields(state.value.keyword, fields).filter((f) => f.searchable !== false)
  })

  // ==================== 辅助函数 ====================

  /**
   * 触发条件变化回调（用于自动搜索）
   */
  function notifyConditionsChange() {
    if (onConditionsChange) {
      onConditionsChange(conditions.value)
    }
  }

  // ==================== Keyword 操作 ====================

  function setKeyword(keyword: string): void {
    state.value.keyword = keyword

    // 如果关键字为空，清除当前高亮字段
    if (!keyword) {
      state.value.activeField = undefined
      return
    }

    const nextCompatibleFields = getCompatibleFields(keyword, fields).filter(
      (field) => field.searchable !== false
    )

    if (nextCompatibleFields.length === 0) {
      state.value.activeField = undefined
      return
    }

    const activeFieldStillCompatible = nextCompatibleFields.some(
      (field) => field.key === state.value.activeField
    )

    if (!activeFieldStillCompatible) {
      state.value.activeField = nextCompatibleFields[0].key
    }
  }

  function clearKeyword(): void {
    setKeyword('')
  }

  // ==================== 字段操作 ====================

  function setActiveField(fieldKey?: string): void {
    state.value.activeField = fieldKey
  }

  function getNextActiveField(direction: 'next' | 'prev'): SearchFieldDef | undefined {
    const compatible = compatibleFields.value
    if (compatible.length === 0) return undefined

    const currentKey = state.value.activeField
    const currentIndex = compatible.findIndex((f) => f.key === currentKey)

    if (direction === 'next') {
      const nextIndex = (currentIndex + 1) % compatible.length
      const nextField = compatible[nextIndex]
      setActiveField(nextField.key)
      return nextField
    } else {
      const prevIndex = currentIndex <= 0 ? compatible.length - 1 : currentIndex - 1
      const prevField = compatible[prevIndex]
      setActiveField(prevField.key)
      return prevField
    }
  }

  // ==================== 条件操作 ====================

  /**
   * 检查条件是否已存在（用于去重）
   *
   * 去重策略：相同字段 + 相同操作符 + 相同值 = 重复条件
   */
  function hasDuplicateCondition(draft: SearchConditionDraft): boolean {
    return state.value.conditions.some(
      (c) =>
        c.field === draft.field &&
        c.operator === draft.operator &&
        JSON.stringify(c.value) === JSON.stringify(draft.value)
    )
  }

  function addCondition(draft: SearchConditionDraft): void {
    // 校验逻辑（只接受有效条件）
    if (!validateConditionDraft(draft, fields, { context: '[useSmartSearch]' })) {
      return
    }

    const condition: SearchCondition = {
      id: generateConditionId(),
      field: draft.field,
      operator: draft.operator,
      value: draft.value,
      label: buildConditionLabel(draft, fields),
      source: draft.source || 'manual',
    }

    state.value.conditions.push(condition)
    notifyConditionsChange()
  }

  function removeCondition(id: string): void {
    const index = state.value.conditions.findIndex((c) => c.id === id)
    if (index !== -1) {
      state.value.conditions.splice(index, 1)
      notifyConditionsChange()
    }
  }

  function replaceCondition(id: string, draft: SearchConditionDraft): void {
    const index = state.value.conditions.findIndex((c) => c.id === id)
    if (index === -1) {
      console.warn(`[useSmartSearch] 条件不存在: ${id}`)
      return
    }

    // 校验逻辑（只接受有效条件）
    if (!validateConditionDraft(draft, fields, { context: '[useSmartSearch]' })) {
      return
    }

    state.value.conditions[index] = {
      id,
      field: draft.field,
      operator: draft.operator,
      value: draft.value,
      label: buildConditionLabel(draft, fields),
      source: draft.source || 'manual',
    }
    notifyConditionsChange()
  }

  function replaceConditions(drafts: SearchConditionDraft[]): void {
    const nextConditions: SearchCondition[] = drafts
      .filter((draft) => validateConditionDraft(draft, fields, { context: '[useSmartSearch]' }))
      .map((draft) => ({
        id: generateConditionId(),
        field: draft.field,
        operator: draft.operator,
        value: draft.value,
        label: buildConditionLabel(draft, fields),
        source: draft.source || 'manual'
      }))

    state.value.conditions = nextConditions
    notifyConditionsChange()
  }

  function clearConditions(): void {
    state.value.conditions = []
    notifyConditionsChange()
  }

  function buildConditionFromField(fieldKey: string): boolean {
    const field = fields.find((candidate) => candidate.key === fieldKey)
    if (!field) {
      console.warn(`[useSmartSearch] 字段不存在: ${fieldKey}`)
      return false
    }

    const keyword = state.value.keyword.trim()
    if (!keyword) {
      console.warn('[useSmartSearch] 关键字为空')
      return false
    }

    // 使用值解析器
    const parsed = parseKeywordValue(keyword, field.dataType)
    if (!parsed.success) {
      console.warn(`[useSmartSearch] ${parsed.error}`)
      return false
    }

    addCondition({
      field: field.key,
      operator: field.defaultOperator || 'equals',
      value: parsed.value,
      source: 'manual'
    })

    setKeyword('')
    setActiveField(undefined)
    closePopover()

    return true
  }

  // ==================== 收藏夹与预设 ====================

  /**
   * 应用收藏夹（带去重和校验）
   *
   * 去重策略：跳过已存在的条件（相同字段 + 相同操作符 + 相同值）
   * 业务语义：收藏夹代表"状态组合"，重复应用不应产生重复谓词
   */
  function applyFavorite(favoriteId: string): void {
    const favorite = state.value.favorites.find((f) => f.id === favoriteId)
    if (!favorite) {
      console.warn(`[useSmartSearch] 收藏夹不存在: ${favoriteId}`)
      return
    }

    let addedCount = 0

    // 批量添加条件（重新生成 ID），跳过已存在的
    favorite.conditions.forEach((condition) => {
      // 校验条件（复用 validateConditionDraft 确保预设条件合法）
      if (!validateConditionDraft(condition, fields, { context: '[useSmartSearch]' })) {
        return
      }

      // 去重：跳过已存在的条件
      if (hasDuplicateCondition(condition)) {
        return
      }

      const newCondition: SearchCondition = {
        id: generateConditionId(),
        field: condition.field,
        operator: condition.operator,
        value: condition.value,
        label: buildConditionLabel(condition, fields),
        source: 'favorite',
      }

      state.value.conditions.push(newCondition)
      addedCount++
    })

    // 批量添加完成后只触发一次回调
    if (addedCount > 0) {
      notifyConditionsChange()
    }
  }

  /**
   * 应用快速预设（带校验）
   *
   * @param presetId - 预设 ID
   * @param options - 选项
   * @param options.deduplicate - 是否去重（默认 false，允许重复追加）
   *
   * 业务语义：
   * - deduplicate=false（默认）：快捷操作允许多次应用，适合"追加式"构建查询
   * - deduplicate=true：跳过已存在的条件，类似收藏夹行为
   */
  function applyQuickPreset(
    presetId: string,
    options?: { deduplicate?: boolean }
  ): void {
    const preset = quickPresets.find((p) => p.id === presetId)
    if (!preset) {
      console.warn(`[useSmartSearch] 预设不存在: ${presetId}`)
      return
    }

    const { deduplicate = false } = options || {}
    let addedCount = 0

    // 批量添加条件
    preset.conditions.forEach((draft) => {
      // 校验条件（复用 validateConditionDraft 确保预设条件合法）
      if (!validateConditionDraft(draft, fields, { context: '[useSmartSearch]' })) {
        return
      }

      // 去重检查（如果启用）
      if (deduplicate && hasDuplicateCondition(draft)) {
        return
      }

      const condition: SearchCondition = {
        id: generateConditionId(),
        field: draft.field,
        operator: draft.operator,
        value: draft.value,
        label: buildConditionLabel(draft, fields),
        source: 'quick',
      }

      state.value.conditions.push(condition)
      addedCount++
    })

    // 批量添加完成后只触发一次回调
    if (addedCount > 0) {
      notifyConditionsChange()
    }
  }

  function buildConditionFromActiveField(): void {
    const field = activeField.value
    if (!field) {
      console.warn('[useSmartSearch] 没有高亮字段')
      return
    }

    buildConditionFromField(field.key)
  }

  // ==================== UI 状态 ====================

  function openPopover(): void {
    state.value.popoverOpen = true
  }

  function closePopover(): void {
    state.value.popoverOpen = false
  }

  function togglePopover(): void {
    state.value.popoverOpen = !state.value.popoverOpen
  }

  /**
   * 打开高级搜索弹窗
   * @param fieldKey - 可选，指定要打开的字段 key，用于预填条件
   */
  function openAdvancedDialog(fieldKey?: string): void {
    state.value.advancedDialogOpen = true
    // 如果传入了 fieldKey，设置 draftSeed 触发预填
    if (fieldKey) {
      state.value.advancedDialogDraftSeed = {
        fieldKey,
        nonce: Date.now(), // 使用时间戳作为 nonce 触发 watch
      }
    } else {
      state.value.advancedDialogDraftSeed = undefined
    }
  }

  function closeAdvancedDialog(): void {
    state.value.advancedDialogOpen = false
  }

  // ==================== 编译 ====================

  function compileToFilterGroup(): FilterGroup | undefined {
    return compileConditions(state.value.conditions, fields)
  }

  // ==================== 返回 API ====================

  return {
    state,
    conditions,
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
