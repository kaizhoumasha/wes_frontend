<script setup lang="ts">
import { computed, useAttrs, useSlots } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'

defineOptions({
  inheritAttrs: false
})

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
  icon?: string | null
  loading?: boolean
  loadingIcon?: string
  iconSize?: number | string
  tooltip?: string
  tooltipPlacement?: TooltipPlacement
  preserveIconSpace?: boolean
  type?: AppButtonType
  size?: AppButtonSize
  disabled?: boolean
  nativeType?: 'button' | 'submit' | 'reset'
  link?: boolean
  text?: boolean
  plain?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  icon: null,
  loading: false,
  loadingIcon: 'Loading',
  iconSize: 16,
  tooltip: undefined,
  tooltipPlacement: 'bottom',
  preserveIconSpace: false,
  type: 'default',
  size: 'default',
  disabled: false,
  nativeType: 'button',
  link: false,
  text: false,
  plain: false
})

const attrs = useAttrs()
const slots = useSlots()

const hasLabel = computed(() => Boolean(slots.default))
const isIconOnly = computed(() => !hasLabel.value)
const showIconSlot = computed(() => props.preserveIconSpace || props.loading || Boolean(props.icon))
const resolvedIcon = computed(() => (props.loading ? props.loadingIcon : props.icon))
const buttonDisabled = computed(() => props.disabled || props.loading)
const buttonClass = computed(() => ({
  'app-button--icon-only': isIconOnly.value,
  'app-button--icon-only-small': isIconOnly.value && props.size === 'small',
  'app-button--icon-only-default': isIconOnly.value && props.size === 'default',
  'app-button--icon-only-large': isIconOnly.value && props.size === 'large'
}))
const iconSlotSize = computed(() => {
  return typeof props.iconSize === 'number' ? `${props.iconSize}px` : props.iconSize
})
const ariaLabel = computed(() => {
  const attrLabel = attrs['aria-label']
  if (typeof attrLabel === 'string') {
    return attrLabel
  }

  if (typeof props.tooltip === 'string') {
    return props.tooltip
  }

  return undefined
})
</script>

<template>
  <span class="app-button__root">
    <el-tooltip
      :disabled="!tooltip"
      :content="tooltip"
      :placement="tooltipPlacement"
    >
      <el-button
        v-bind="attrs"
        :type="type"
        :size="size"
        :disabled="buttonDisabled"
        :native-type="nativeType"
        :link="link"
        :text="text"
        :plain="plain"
        :aria-label="ariaLabel"
        class="app-button"
        :class="buttonClass"
      >
        <span
          v-if="showIconSlot"
          class="app-button__icon-slot"
          :style="{ width: iconSlotSize, height: iconSlotSize }"
        >
          <AppIcon
            v-if="resolvedIcon"
            :icon="resolvedIcon"
            :size="iconSize"
            class="app-button__icon"
            :class="{ 'is-spinning': loading }"
          />
        </span>
        <span
          v-if="hasLabel"
          class="app-button__label"
        >
          <slot />
        </span>
      </el-button>
    </el-tooltip>
  </span>
</template>

<style scoped>
.app-button__root {
  display: inline-flex;
}

.app-button__icon-slot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.app-button__label {
  display: inline-flex;
  align-items: center;
}

.app-button:not(.app-button--icon-only) {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.app-button--icon-only {
  padding: 0;
}

.app-button--icon-only-small {
  width: 32px;
  min-width: 32px;
  height: 32px;
}

.app-button--icon-only-default {
  width: 36px;
  min-width: 36px;
  height: 36px;
}

.app-button--icon-only-large {
  width: 40px;
  min-width: 40px;
  height: 40px;
}

.app-button__icon.is-spinning {
  animation: app-button-spin 1s linear infinite;
}

@keyframes app-button-spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
