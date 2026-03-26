<script setup lang="ts">
import { computed, type Component } from 'vue'
import { Icon } from '@iconify/vue/dist/offline'
import * as EpIcons from '@element-plus/icons-vue'
import { ensureIconifyCollections } from './iconify'

// ==================== Props ====================

interface Props {
  /**
   * Iconify 图标名称
   * 例如：ep:menu、lucide:circle-alert
   */
  icon?: string | null

  /**
   * 图标大小（像素）
   * @default 20
   */
  size?: number | string

  /**
   * 默认图标（当 icon 为空时使用）
   * @default 'ep:menu'
   */
  fallback?: string
}

const props = withDefaults(defineProps<Props>(), {
  icon: null,
  size: 20,
  fallback: 'ep:menu'
})

ensureIconifyCollections()

const resolvedIcon = computed(() => props.icon || props.fallback)
const sizeValue = computed(() => (typeof props.size === 'number' ? `${props.size}px` : props.size))
const iconifyName = computed(() => {
  return resolvedIcon.value?.includes(':') ? resolvedIcon.value : null
})
const elementPlusIcon = computed(() => {
  if (iconifyName.value) {
    return null
  }

  return (EpIcons as Record<string, Component | undefined>)[resolvedIcon.value ?? '']
})
</script>

<template>
  <span
    v-if="resolvedIcon"
    class="inline-flex items-center justify-center"
  >
    <Icon
      v-if="iconifyName"
      :icon="iconifyName"
      :width="size"
      :height="size"
    />
    <component
      :is="elementPlusIcon"
      v-else-if="elementPlusIcon"
      :style="{ width: sizeValue, height: sizeValue }"
    />
  </span>
</template>
