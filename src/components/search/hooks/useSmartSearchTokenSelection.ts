import { computed, ref, type ComputedRef, type Ref } from 'vue'
import type { SearchCondition } from '@/types/search'

export const ADVANCED_TAG_TOKEN = '__advanced__'

export interface UseSmartSearchTokenSelectionOptions {
  conditions: Ref<SearchCondition[]>
  advancedActive: Ref<boolean>
  inputRef: Ref<HTMLInputElement | undefined>
  onRemoveCondition: (id: string) => void
  onClearAdvanced: () => void
}

export interface SmartSearchTokenSelectionState {
  selectedTokenId: Ref<string | undefined>
  selectionTokens: ComputedRef<string[]>
  selectedAdvancedTag: ComputedRef<boolean>
  clearSelectedCondition: () => void
  getSelectedTokenIndex: () => number
  selectTokenAt: (index: number) => void
  selectLastToken: () => void
  isCaretAtStart: () => boolean
  removeSelectedToken: () => void
}

export function useSmartSearchTokenSelection(
  options: UseSmartSearchTokenSelectionOptions
): SmartSearchTokenSelectionState {
  const selectedTokenId = ref<string>()

  const selectionTokens = computed(() => [
    ...(options.advancedActive.value ? [ADVANCED_TAG_TOKEN] : []),
    ...options.conditions.value.map(condition => condition.id)
  ])

  const selectedAdvancedTag = computed(() => selectedTokenId.value === ADVANCED_TAG_TOKEN)

  function clearSelectedCondition(): void {
    selectedTokenId.value = undefined
  }

  function getSelectedTokenIndex(): number {
    if (!selectedTokenId.value) {
      return -1
    }

    return selectionTokens.value.findIndex(token => token === selectedTokenId.value)
  }

  function selectTokenAt(index: number): void {
    if (index < 0 || index >= selectionTokens.value.length) {
      clearSelectedCondition()
      return
    }

    selectedTokenId.value = selectionTokens.value[index]
  }

  function selectLastToken(): void {
    if (selectionTokens.value.length === 0) {
      clearSelectedCondition()
      return
    }

    selectTokenAt(selectionTokens.value.length - 1)
  }

  function isCaretAtStart(): boolean {
    const input = options.inputRef.value
    if (!input) {
      return false
    }

    return input.selectionStart === 0 && input.selectionEnd === 0
  }

  function removeSelectedToken(): void {
    const currentIndex = getSelectedTokenIndex()
    if (currentIndex === -1) {
      clearSelectedCondition()
      return
    }

    const currentToken = selectionTokens.value[currentIndex]
    const previousToken = selectionTokens.value[currentIndex - 1]
    const nextToken = selectionTokens.value[currentIndex + 1]

    selectedTokenId.value = previousToken || nextToken

    if (currentToken === ADVANCED_TAG_TOKEN) {
      options.onClearAdvanced()
      return
    }

    options.onRemoveCondition(currentToken)
  }

  return {
    selectedTokenId,
    selectionTokens,
    selectedAdvancedTag,
    clearSelectedCondition,
    getSelectedTokenIndex,
    selectTokenAt,
    selectLastToken,
    isCaretAtStart,
    removeSelectedToken
  }
}
