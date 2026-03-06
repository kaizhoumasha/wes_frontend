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

/**
 * 解析 Iconify 图标名称
 *
 * 优先级：
 * 1. 已包含 ':' → 直接使用（如 "mdi:home"）
 * 2. 仅组件名 → 尝试作为 Element Plus 图标（如 "Grid" → "ep:grid"）
 */
const iconifyName = computed(() => {
  if (!props.icon) {
    return null
  }

  // 已包含图标集前缀（如 ep:, mdi:, ph:, lucide: 等）
  if (props.icon.includes(':')) {
    return props.icon.toLowerCase()
  }

  // Element Plus 降级：自动添加 ep: 前缀
  const epName = `ep:${props.icon.toLowerCase()}`

  // 检查是否是有效的 Element Plus 图标
  if (isValidElementPlusIcon(props.icon)) {
    return epName
  }

  // 如果不是 Element Plus 图标，尝试直接作为 Iconify 图标名
  // Iconify 会尝试在多个集合中查找
  return props.icon.toLowerCase()
})

/**
 * 获取 Element Plus 图标组件（降级方案）
 */
const elementPlusIcon = computed<Component | undefined>(() => {
  if (!props.icon) {
    // 使用默认图标
    return (EpIcons as Record<string, Component>)[props.fallback]
  }

  // 直接使用 Element Plus 组件名（PascalCase）
  return (EpIcons as Record<string, Component>)[props.icon]
})

/**
 * 使用 Element Plus 原生组件（当 Iconify 不可用时）
 */
const shouldUseElementPlus = computed(() => {
  // 如果明确指定了 Element Plus 图标集（ep:）或原始组件名
  if (!props.icon || !props.icon.includes(':')) {
    return true
  }
  return false
})

// ==================== 辅助函数 ====================

/**
 * 验证是否是有效的 Element Plus 图标名称
 */
const isValidElementPlusIcon = (name: string): boolean => {
  return Object.prototype.hasOwnProperty.call(EpIcons, name)
}

// ==================== 样式计算 ====================

const iconStyle = computed(() => {
  const sizeValue = typeof props.size === 'number' ? `${props.size}px` : props.size
  return {
    width: sizeValue,
    height: sizeValue,
    color: props.color
  }
})
</script>

<template>
  <!-- 使用 Iconify 图标 -->
  <IconifyIcon
    v-if="!shouldUseElementPlus && iconifyName"
    :icon="iconifyName"
    :width="size"
    :height="size"
    :color="color"
  />

  <!-- 使用 Element Plus 图标（降级/兼容） -->
  <component
    :is="elementPlusIcon"
    v-else-if="elementPlusIcon"
    :style="iconStyle"
  />

  <!-- 完全降级：使用默认图标 -->
  <component
    :is="(EpIcons as Record<string, Component>)[fallback]"
    v-else
    :style="iconStyle"
  />
</template>

<style scoped>
/* Iconify 图标默认样式 */
:deep(.iconify) {
  display: inline-block;
  vertical-align: middle;
}
</style>
