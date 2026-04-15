import { nextTick, type Ref } from 'vue'
import { ADVANCED_TAG_TOKEN } from './useSmartSearchTokenSelection'

export interface UseSmartSearchInteractionsOptions {
  keyword: Ref<string>
  activeField: Ref<string | undefined>
  hasConditions: Ref<boolean>
  isComposing: Ref<boolean>
  selectionTokens: Ref<string[]>
  selectedTokenId: Ref<string | undefined>
  clearSelectedCondition: () => void
  getSelectedTokenIndex: () => number
  selectTokenAt: (index: number) => void
  selectLastToken: () => void
  isCaretAtStart: () => boolean
  removeSelectedToken: () => void
  requestPopoverOpen: () => void
  syncPopoverWithKeyword: (keyword: string) => void
  onKeydownNext: () => void
  onKeydownPrev: () => void
  onSearch: () => void
  onClosePopover: () => void
  onOpenAdvanced: () => void
  onSelectField: (fieldKey: string) => void
  onActivateField: (fieldKey: string) => void
  onOpenAdvancedForField: (fieldKey: string) => void
}

export interface SmartSearchInteractionsState {
  handleKeyDown: (event: KeyboardEvent) => void
  handleCompositionStart: () => void
  handleCompositionEnd: () => void
  handleActivateField: (fieldKey: string) => void
}

export function useSmartSearchInteractions(
  options: UseSmartSearchInteractionsOptions
): SmartSearchInteractionsState {
  function emitSearch(): void {
    options.onSearch()
  }

  function handleActivateField(fieldKey: string): void {
    options.clearSelectedCondition()
    options.onSelectField(fieldKey)

    if (options.keyword.value.trim()) {
      options.onActivateField(fieldKey)
    } else {
      options.onOpenAdvancedForField(fieldKey)
    }
  }

  function handleKeyDown(event: KeyboardEvent): void {
    if (options.isComposing.value || event.isComposing) {
      return
    }

    switch (event.key) {
      case 'ArrowDown':
        options.clearSelectedCondition()
        event.preventDefault()
        options.requestPopoverOpen()
        options.onKeydownNext()
        break
      case 'ArrowUp':
        options.clearSelectedCondition()
        event.preventDefault()
        options.requestPopoverOpen()
        options.onKeydownPrev()
        break
      case 'ArrowLeft': {
        if (options.keyword.value || !options.hasConditions.value) {
          break
        }

        const selectedIndex = options.getSelectedTokenIndex()
        if (selectedIndex === -1 && !options.isCaretAtStart()) {
          break
        }

        event.preventDefault()
        if (selectedIndex === -1) {
          options.selectLastToken()
          break
        }

        options.selectTokenAt(Math.max(0, selectedIndex - 1))
        break
      }
      case 'ArrowRight': {
        if (options.keyword.value || !options.hasConditions.value) {
          break
        }

        const selectedIndex = options.getSelectedTokenIndex()
        if (selectedIndex === -1) {
          break
        }

        event.preventDefault()
        if (selectedIndex >= options.selectionTokens.value.length - 1) {
          options.clearSelectedCondition()
          break
        }

        options.selectTokenAt(selectedIndex + 1)
        break
      }
      case 'Enter': {
        if (options.selectedTokenId.value === ADVANCED_TAG_TOKEN) {
          event.preventDefault()
          options.onOpenAdvanced()
          break
        }

        if (options.selectedTokenId.value) {
          event.preventDefault()
          break
        }

        event.preventDefault()
        const activeFieldKey = options.activeField.value
        if (activeFieldKey) {
          handleActivateField(activeFieldKey)
          break
        }

        emitSearch()
        break
      }
      case 'Escape':
        options.clearSelectedCondition()
        options.onClosePopover()
        break
      case 'Delete':
      case 'Backspace':
        if (options.selectedTokenId.value) {
          event.preventDefault()
          options.removeSelectedToken()
          break
        }

        if (!options.keyword.value && options.hasConditions.value) {
          event.preventDefault()
          options.selectLastToken()
        }
        break
    }
  }

  function handleCompositionStart(): void {
    options.isComposing.value = true
  }

  function handleCompositionEnd(): void {
    options.isComposing.value = false
    void nextTick(() => {
      options.syncPopoverWithKeyword(options.keyword.value)
    })
  }

  return {
    handleKeyDown,
    handleCompositionStart,
    handleCompositionEnd,
    handleActivateField
  }
}
