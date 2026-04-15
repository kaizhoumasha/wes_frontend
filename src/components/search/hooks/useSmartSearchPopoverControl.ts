import { computed, ref, watch, type Ref } from 'vue'

export interface UseSmartSearchPopoverControlOptions {
  keyword: Ref<string>
  popoverOpen: Ref<boolean>
  isComposing: Ref<boolean>
  isFocused: Ref<boolean>
  onOpen: () => void
  onClose: () => void
}

export interface SmartSearchPopoverControlState {
  manualToggle: Ref<boolean>
  expectedPopoverOpen: Ref<boolean>
  popoverVisible: Ref<boolean>
  syncPopoverWithKeyword: (keyword: string) => void
  resetPopoverAutoControl: () => void
  requestPopoverOpen: () => void
  handlePopoverVisibleChange: (visible: boolean) => void
}

export function useSmartSearchPopoverControl(
  options: UseSmartSearchPopoverControlOptions
): SmartSearchPopoverControlState {
  const manualToggle = ref(false)
  const expectedPopoverOpen = ref(false)

  function syncPopoverWithKeyword(keyword: string): void {
    if (manualToggle.value) {
      return
    }

    const shouldOpen = keyword.trim().length > 0
    if (shouldOpen !== expectedPopoverOpen.value) {
      expectedPopoverOpen.value = shouldOpen
      if (shouldOpen) {
        options.onOpen()
      } else {
        options.onClose()
      }
    }
  }

  const popoverVisible = computed(() => options.popoverOpen.value === true)

  watch(options.popoverOpen, newValue => {
    if (!manualToggle.value) {
      expectedPopoverOpen.value = newValue
    }
  })

  function resetPopoverAutoControl(): void {
    manualToggle.value = false
    expectedPopoverOpen.value = options.popoverOpen.value
  }

  function requestPopoverOpen(): void {
    manualToggle.value = false
    expectedPopoverOpen.value = true
    options.onOpen()
  }

  function handlePopoverVisibleChange(visible: boolean): void {
    if (!visible && (options.isComposing.value || (options.isFocused.value && options.keyword.value.trim().length > 0))) {
      return
    }

    if (!visible) {
      options.onClose()
    }
  }

  return {
    manualToggle,
    expectedPopoverOpen,
    popoverVisible,
    syncPopoverWithKeyword,
    resetPopoverAutoControl,
    requestPopoverOpen,
    handlePopoverVisibleChange
  }
}
