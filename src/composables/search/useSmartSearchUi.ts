import { computed, type ComputedRef, type Ref } from 'vue'
import type { SearchFieldDef, SmartSearchState } from '@/types/search'
import { getCompatibleFields } from '@/utils/search-compiler'

interface UseSmartSearchUiOptions {
  state: Ref<SmartSearchState>
  fields: SearchFieldDef[]
}

export function useSmartSearchUi(options: UseSmartSearchUiOptions) {
  function getSearchableCompatibleFields(keyword: string): SearchFieldDef[] {
    return getCompatibleFields(keyword, options.fields).filter(field => field.searchable !== false)
  }

  const activeField: ComputedRef<SearchFieldDef | undefined> = computed(() => {
    if (!options.state.value.activeField) {
      return undefined
    }

    return options.fields.find(field => field.key === options.state.value.activeField)
  })

  const compatibleFields: ComputedRef<SearchFieldDef[]> = computed(() =>
    getSearchableCompatibleFields(options.state.value.keyword)
  )

  function setKeyword(keyword: string): void {
    options.state.value.keyword = keyword

    if (!keyword) {
      options.state.value.activeField = undefined
      return
    }

    const nextCompatibleFields = getSearchableCompatibleFields(keyword)
    if (nextCompatibleFields.length === 0) {
      options.state.value.activeField = undefined
      return
    }

    const activeFieldStillCompatible = nextCompatibleFields.some(
      field => field.key === options.state.value.activeField
    )

    if (!activeFieldStillCompatible) {
      options.state.value.activeField = nextCompatibleFields[0].key
    }
  }

  function clearKeyword(): void {
    setKeyword('')
  }

  function setActiveField(fieldKey?: string): void {
    options.state.value.activeField = fieldKey
  }

  function getNextActiveField(direction: 'next' | 'prev'): SearchFieldDef | undefined {
    const compatible = compatibleFields.value
    if (compatible.length === 0) {
      return undefined
    }

    const currentKey = options.state.value.activeField
    const currentIndex = compatible.findIndex(field => field.key === currentKey)

    if (direction === 'next') {
      const nextIndex = (currentIndex + 1) % compatible.length
      const nextField = compatible[nextIndex]
      setActiveField(nextField.key)
      return nextField
    }

    const prevIndex = currentIndex <= 0 ? compatible.length - 1 : currentIndex - 1
    const prevField = compatible[prevIndex]
    setActiveField(prevField.key)
    return prevField
  }

  function openPopover(): void {
    options.state.value.popoverOpen = true
  }

  function closePopover(): void {
    options.state.value.popoverOpen = false
  }

  function togglePopover(): void {
    options.state.value.popoverOpen = !options.state.value.popoverOpen
  }

  function openAdvancedDialog(fieldKey?: string): void {
    options.state.value.advancedDialogOpen = true
    if (fieldKey) {
      options.state.value.advancedDialogDraftSeed = {
        fieldKey,
        nonce: Date.now()
      }
      return
    }

    options.state.value.advancedDialogDraftSeed = undefined
  }

  function closeAdvancedDialog(): void {
    options.state.value.advancedDialogOpen = false
  }

  return {
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
  }
}
