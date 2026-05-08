<script setup lang="ts">
import AppButton from '@/components/ui/AppButton.vue'

type AppButtonType = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default'
type AppButtonSize = 'large' | 'default' | 'small'
type TooltipPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'right'

interface Props {
  icon: string
  loading?: boolean
  loadingIcon?: string
  tooltip?: string
  tooltipPlacement?: TooltipPlacement
  iconSize?: number | string
  type?: AppButtonType
  size?: AppButtonSize
  disabled?: boolean
  nativeType?: 'button' | 'submit' | 'reset'
  plain?: boolean
}

withDefaults(defineProps<Props>(), {
  loading: false,
  loadingIcon: 'ep:loading',
  tooltip: undefined,
  tooltipPlacement: 'bottom',
  iconSize: 16,
  type: 'default',
  size: 'default',
  disabled: false,
  nativeType: 'button',
  plain: false
})
</script>

<template>
  <AppButton
    :icon="icon"
    :loading="loading"
    :loading-icon="loadingIcon"
    :tooltip="tooltip"
    :tooltip-placement="tooltipPlacement"
    :icon-size="iconSize"
    :type="type"
    :size="size"
    :disabled="disabled"
    :native-type="nativeType"
    :plain="plain"
    preserve-icon-space
  >
    <slot />
  </AppButton>
</template>
