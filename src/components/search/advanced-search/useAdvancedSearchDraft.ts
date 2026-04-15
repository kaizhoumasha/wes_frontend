import { ref, watch, type Ref } from 'vue'

import type { FilterGroup } from '@/api/base/crud-request-adapter'
import type { SearchFieldDef, UIFilterGroup } from '@/types/search'
import {
  createEmptyCondition,
  createEmptyGroup,
  convertFilterGroupToUIFilterGroup,
  validateUIFilterGroup
} from '@/utils/advanced-search'

interface AdvancedSearchDraftSeed {
  fieldKey: string
  nonce: number
}

interface UseAdvancedSearchDraftOptions {
  modelValue: Ref<boolean>
  fields: Ref<SearchFieldDef[]>
  initialFilter: Ref<FilterGroup | undefined>
  draftSeed: Ref<AdvancedSearchDraftSeed | undefined>
}

interface UseAdvancedSearchDraftReturn {
  draftGroup: Ref<UIFilterGroup>
  favoritesCollapsed: Ref<boolean>
  validationErrors: Ref<string[]>
  clearDraftGroup: () => void
  replaceDraftGroup: (value: UIFilterGroup) => void
  resetValidationErrors: () => void
  validateDraftGroup: () => string[]
}

function buildInitialGroup(
  fields: SearchFieldDef[],
  initialFilter: FilterGroup | undefined
): UIFilterGroup {
  if (initialFilter) {
    return convertFilterGroupToUIFilterGroup(initialFilter)
  }

  return createEmptyGroup('and')
}

export function useAdvancedSearchDraft(
  options: UseAdvancedSearchDraftOptions
): UseAdvancedSearchDraftReturn {
  const draftGroup = ref<UIFilterGroup>(createEmptyGroup('and'))
  const favoritesCollapsed = ref(true)
  const validationErrors = ref<string[]>([])
  const lastSeedNonce = ref<number | undefined>(undefined)

  function resetValidationErrors(): void {
    validationErrors.value = []
  }

  function appendDraftSeedIfNeeded(): void {
    const seed = options.draftSeed.value
    if (!seed || seed.nonce === lastSeedNonce.value) {
      return
    }

    draftGroup.value = {
      ...draftGroup.value,
      conditions: [...draftGroup.value.conditions, createEmptyCondition(options.fields.value, seed.fieldKey)]
    }
    lastSeedNonce.value = seed.nonce
  }

  function initializeDraftGroup(): void {
    draftGroup.value = buildInitialGroup(options.fields.value, options.initialFilter.value)
    lastSeedNonce.value = undefined
    resetValidationErrors()
    appendDraftSeedIfNeeded()
  }

  function replaceDraftGroup(value: UIFilterGroup): void {
    draftGroup.value = value
  }

  function clearDraftGroup(): void {
    draftGroup.value = createEmptyGroup('and')
    resetValidationErrors()
  }

  function validateDraftGroup(): string[] {
    const errors = validateUIFilterGroup(draftGroup.value, options.fields.value)
    validationErrors.value = errors
    return errors
  }

  watch(options.modelValue, isOpen => {
    if (!isOpen) {
      resetValidationErrors()
      return
    }

    initializeDraftGroup()
  }, { immediate: true })

  watch(() => options.draftSeed.value?.nonce, () => {
    if (options.modelValue.value) {
      appendDraftSeedIfNeeded()
    }
  })

  return {
    draftGroup,
    favoritesCollapsed,
    validationErrors,
    clearDraftGroup,
    replaceDraftGroup,
    resetValidationErrors,
    validateDraftGroup
  }
}
