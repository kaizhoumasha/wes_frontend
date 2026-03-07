<!--
统一图标组件

支持：
1. Iconify 图标（推荐）- 使用 "集合:图标名" 格式，如 "mdi:home", "ep:grid"
2. Element Plus 图标（兼容）- 直接使用组件名，如 "Grid", "EditPen"

特性：
- 自动降级：未指定图标集前缀时默认使用 Element Plus
- 按需加载：Iconify 图标完全按需加载
- 类型安全：完整的 TypeScript 支持
-->

<script setup lang="ts">
import { computed, type Component } from 'vue'
import { Icon as IconifyIcon } from '@iconify/vue/dist/offline'
import * as EpIcons from '@element-plus/icons-vue'

// ==================== Props ====================

interface Props {
  /**
   * 图标名称
   *
   * - Iconify 格式： "集合:图标名"，如 "mdi:home", "ep:grid", "ph:package"
   * - Element Plus 格式：组件名，如 "Grid", "EditPen"
   * - 空值：使用默认图标
   */
  icon?: string | null

  /**
   * 图标大小（像素）
   * @default 20
   */
  size?: number | string

  /**
   * 图标颜色
   * @default inherit
   */
  color?: string

  /**
   * 默认图标（当 icon 为空时使用）
   * @default 'Menu'
   */
  fallback?: string
}

const props = withDefaults(defineProps<Props>(), {
  icon: null,
  size: 20,
  color: 'inherit',
  fallback: 'Menu'
})

// ==================== 图标解析 ====================

/** 解析 Iconify 图标名称（已包含 ':' 前缀） */
const iconifyName = computed(() => {
  if (!props.icon || !props.icon.includes(':')) {
    return null
  }
  return props.icon.toLowerCase()
})

/** 获取 Element Plus 图标组件 */
const elementPlusIcon = computed(() => {
  const iconName = props.icon || props.fallback
  return (EpIcons as Record<string, Component>)[iconName]
})

/** 图标尺寸格式化 */
const sizeValue = computed(() => {
  return typeof props.size === 'number' ? `${props.size}px` : props.size
})
</script>

<template>
  <!-- 优先使用 Iconify 图标 -->
  <IconifyIcon
    v-if="iconifyName"
    :icon="iconifyName"
    :width="size"
    :height="size"
    :color="color"
  />

  <!-- 降级到 Element Plus 图标 -->
  <component
    :is="elementPlusIcon"
    v-else-if="elementPlusIcon"
    :style="{ width: sizeValue, height: sizeValue, color }"
  />
</template>

<style scoped>
/* Iconify 图标默认样式 */
:deep(.iconify) {
  display: inline-block;
  vertical-align: middle;
}
</style>
