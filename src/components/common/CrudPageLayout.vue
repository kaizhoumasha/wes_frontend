<script setup lang="ts">
import { provideBreakpointContext } from '@/composables/useBreakpointContext'

/**
 * CrudPageLayout 组件
 *
 * 提供 CRUD 页面的标准布局结构：
 * - 上：工具栏区
 * - 中：表格区（弹性高度）
 * - 下：分页区（可选）
 *
 * 特性：
 * - 上-中-下三段式布局
 * - 垂直弹性设计（表格区占据剩余空间）
 * - 响应式支持
 * - 提供断点上下文供子组件使用
 * - 支持渲染弹窗等不参与布局的额外内容
 *
 * @example
 * ```vue
 * <CrudPageLayout :gap="16">
 *   <template #toolbar>
 *     <CrudToolbar ... />
 *   </template>
 *   <template #table>
 *     <CrudTable ... />
 *   </template>
 * </CrudPageLayout>
 * ```
 */

export interface CrudPageLayoutProps {
  /** 工具栏和表格之间的间距（px），默认 16 */
  gap?: number
  /** 是否自动适配视口可用高度，默认 true */
  fitViewport?: boolean
}

const props = withDefaults(defineProps<CrudPageLayoutProps>(), {
  gap: 16,
  fitViewport: true
})

// 提供断点上下文供子组件使用
provideBreakpointContext()
</script>

<template>
  <div
    class="crud-page-layout"
    :class="{ 'crud-page-layout--fit-viewport': props.fitViewport }"
  >
    <!-- 工具栏插槽 -->
    <div
      v-if="$slots.toolbar"
      class="crud-page-layout__toolbar"
      :style="{ marginBottom: `${gap}px` }"
    >
      <slot name="toolbar" />
    </div>

    <!-- 表格插槽（弹性高度） -->
    <div class="crud-page-layout__table">
      <slot name="table" />
    </div>

    <!-- 分页插槽（可选） -->
    <div
      v-if="$slots.pagination"
      class="crud-page-layout__pagination"
    >
      <slot name="pagination" />
    </div>

    <!-- 额外内容插槽：对话框、抽屉等不参与布局的节点 -->
    <slot />
  </div>
</template>

<style scoped>
.crud-page-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  padding: 16px;
  box-sizing: border-box;
}

.crud-page-layout--fit-viewport {
  height: calc(100vh - var(--layout-header-height) - var(--layout-page-padding) * 2);
}

.crud-page-layout__toolbar {
  flex-shrink: 0;
}

.crud-page-layout__table {
  flex: 1;
  min-height: 0; /* 重要：允许 flex 子项缩小 */
  display: flex;
  flex-direction: column;
}

.crud-page-layout__pagination {
  flex-shrink: 0;
  margin-top: 16px;
}

/* 响应式：移动端减少内边距 */
@media (width < 768px) {
  .crud-page-layout {
    padding: 8px;
  }
}

/* 响应式：桌面端维持与页面主容器一致的内边距 */
@media (width >= 1280px) {
  .crud-page-layout {
    padding: 16px;
  }
}
</style>
