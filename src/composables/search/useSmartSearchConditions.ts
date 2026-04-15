import type { ComputedRef, Ref } from 'vue'
import type {
  QuickSearchPreset,
  SearchCondition,
  SearchConditionDraft,
  SearchFavorite,
  SearchFieldDef,
  SmartSearchState
} from '@/types/search'
import {
  buildConditionLabel,
  compileConditions,
  compileFilterGroup,
  generateConditionId
} from '@/utils/search-compiler'
import { parseKeywordValue } from '@/utils/search-value-parser'
import { validateConditionDraft } from '@/types/search'
import { appendAndFilter, type FilterGroup } from '@/api/base/crud-request-adapter'

interface UseSmartSearchConditionsOptions {
  state: Ref<SmartSearchState>
  fields: SearchFieldDef[]
  quickPresets: QuickSearchPreset[]
  activeField: ComputedRef<SearchFieldDef | undefined>
  notifyConditionsChange: () => void
  setKeyword: (keyword: string) => void
  setActiveField: (fieldKey?: string) => void
  closePopover: () => void
}

export function useSmartSearchConditions(options: UseSmartSearchConditionsOptions) {
  function createConditionFromDraft(
    draft: SearchConditionDraft,
    overrides?: {
      id?: string
      source?: SearchCondition['source']
    }
  ): SearchCondition {
    return {
      id: overrides?.id ?? generateConditionId(),
      field: draft.field,
      operator: draft.operator,
      value: draft.value,
      label: buildConditionLabel(draft, options.fields),
      source: overrides?.source ?? draft.source ?? 'manual'
    }
  }

  function findConditionIndex(id: string): number {
    return options.state.value.conditions.findIndex(condition => condition.id === id)
  }

  function hasDuplicateCondition(draft: SearchConditionDraft): boolean {
    return options.state.value.conditions.some(
      condition =>
        condition.field === draft.field &&
        condition.operator === draft.operator &&
        JSON.stringify(condition.value) === JSON.stringify(draft.value)
    )
  }

  function appendConditions(
    drafts: SearchConditionDraft[],
    appendOptions?: {
      source?: SearchCondition['source']
      deduplicate?: boolean
    }
  ): number {
    let addedCount = 0

    for (const draft of drafts) {
      if (!validateConditionDraft(draft, options.fields, { context: '[useSmartSearch]' })) {
        continue
      }

      if (appendOptions?.deduplicate && hasDuplicateCondition(draft)) {
        continue
      }

      options.state.value.conditions.push(
        createConditionFromDraft(draft, {
          source: appendOptions?.source
        })
      )
      addedCount += 1
    }

    return addedCount
  }

  function addCondition(draft: SearchConditionDraft): void {
    if (!validateConditionDraft(draft, options.fields, { context: '[useSmartSearch]' })) {
      return
    }

    options.state.value.conditions.push(createConditionFromDraft(draft))
    options.notifyConditionsChange()
  }

  function removeCondition(id: string): void {
    const index = findConditionIndex(id)
    if (index === -1) {
      return
    }

    options.state.value.conditions.splice(index, 1)
    options.notifyConditionsChange()
  }

  function replaceCondition(id: string, draft: SearchConditionDraft): void {
    const index = findConditionIndex(id)
    if (index === -1) {
      console.warn(`[useSmartSearch] 条件不存在: ${id}`)
      return
    }

    if (!validateConditionDraft(draft, options.fields, { context: '[useSmartSearch]' })) {
      return
    }

    options.state.value.conditions[index] = createConditionFromDraft(draft, { id })
    options.notifyConditionsChange()
  }

  function replaceConditions(drafts: SearchConditionDraft[]): void {
    options.state.value.conditions = drafts
      .filter(draft => validateConditionDraft(draft, options.fields, { context: '[useSmartSearch]' }))
      .map(draft => createConditionFromDraft(draft))

    options.notifyConditionsChange()
  }

  function setFavorites(favorites: SearchFavorite[]): void {
    options.state.value.favorites = favorites
  }

  function setAdvancedFilterGroup(group: FilterGroup | undefined): void {
    options.state.value.advancedFilterGroup = group
    options.notifyConditionsChange()
  }

  function clearAdvancedFilterGroup(): void {
    if (!options.state.value.advancedFilterGroup) {
      return
    }

    options.state.value.advancedFilterGroup = undefined
    options.notifyConditionsChange()
  }

  function clearConditions(): void {
    options.state.value.conditions = []
    options.notifyConditionsChange()
  }

  function clearAppliedFilters(): void {
    if (options.state.value.conditions.length === 0 && !options.state.value.advancedFilterGroup) {
      return
    }

    options.state.value.conditions = []
    options.state.value.advancedFilterGroup = undefined
    options.notifyConditionsChange()
  }

  function buildConditionFromField(fieldKey: string): boolean {
    const field = options.fields.find(candidate => candidate.key === fieldKey)
    if (!field) {
      console.warn(`[useSmartSearch] 字段不存在: ${fieldKey}`)
      return false
    }

    const keyword = options.state.value.keyword.trim()
    if (!keyword) {
      console.warn('[useSmartSearch] 关键字为空')
      return false
    }

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

    options.setKeyword('')
    options.setActiveField(undefined)
    options.closePopover()
    return true
  }

  function buildConditionFromActiveField(): void {
    const field = options.activeField.value
    if (!field) {
      console.warn('[useSmartSearch] 没有高亮字段')
      return
    }

    buildConditionFromField(field.key)
  }

  function applyFavorite(favoriteId: string): void {
    const favorite = options.state.value.favorites.find(item => item.id === favoriteId)
    if (!favorite) {
      console.warn(`[useSmartSearch] 收藏夹不存在: ${favoriteId}`)
      return
    }

    let hasChanges = false

    if (favorite.filterGroup) {
      options.state.value.advancedFilterGroup = favorite.filterGroup
      hasChanges = true
    }

    const addedCount = appendConditions(favorite.conditions, {
      source: 'favorite',
      deduplicate: true
    })

    if (addedCount > 0) {
      hasChanges = true
    }

    if (hasChanges) {
      options.notifyConditionsChange()
    }
  }

  function applyQuickPreset(
    presetId: string,
    presetOptions?: { deduplicate?: boolean }
  ): void {
    const preset = options.quickPresets.find(item => item.id === presetId)
    if (!preset) {
      console.warn(`[useSmartSearch] 预设不存在: ${presetId}`)
      return
    }

    const { deduplicate = false } = presetOptions || {}
    const presetConditions = preset.resolveConditions?.() ?? preset.conditions
    const addedCount = appendConditions(presetConditions, {
      source: 'quick',
      deduplicate
    })

    if (addedCount > 0) {
      options.notifyConditionsChange()
    }
  }

  function compileToFilterGroup(): FilterGroup | undefined {
    const compiledConditions = compileConditions(options.state.value.conditions, options.fields)
    const compiledAdvancedFilters = compileFilterGroup(
      options.state.value.advancedFilterGroup,
      options.fields
    )

    if (!compiledAdvancedFilters) {
      return compiledConditions
    }

    if (!compiledConditions) {
      return compiledAdvancedFilters
    }

    return appendAndFilter(compiledAdvancedFilters, compiledConditions)
  }

  return {
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
  }
}
