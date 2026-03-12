<!--
数据表格骨架屏组件

模拟表格结构，在数据加载时提供视觉反馈
-->
<template>
  <div class="data-table-skeleton">
    <!-- 模拟表头 -->
    <div class="data-table-skeleton__header">
      <div
        v-for="n in skeletonRowCount"
        :key="`header-${n}`"
        class="data-table-skeleton__header-cell"
      >
        <el-skeleton animated />
      </div>
    </div>

    <!-- 模拟表格行 -->
    <div class="data-table-skeleton__body">
      <div
        v-for="row in SKELETON_ROW_COUNT"
        :key="`row-${row}`"
        class="data-table-skeleton__row"
      >
        <div
          v-for="n in skeletonRowCount"
          :key="`cell-${row}-${n}`"
          class="data-table-skeleton__cell"
          :style="{ height: `${rowHeight}px` }"
        >
          <el-skeleton animated />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TableColumnConfig } from './table.types'
import type { TableDensity } from '@/types/table'

interface Props {
  columns: TableColumnConfig[]
  density?: TableDensity
}

const props = withDefaults(defineProps<Props>(), {
  density: 'compact'
})

/**
 * 骨架屏列数（基于实际列数）
 */
const skeletonRowCount = computed(() => {
  // 加上 selection 列
  return Math.min(props.columns.length + 1, 8) // 最多显示 8 列
})

/**
 * 骨架屏行数（模拟显示的行数）
 */
const SKELETON_ROW_COUNT = 5

/**
 * 根据密度获取行高
 */
const rowHeightMap: Record<TableDensity, number> = {
  comfortable: 60,
  compact: 48,
  small: 40
}

const rowHeight = computed(() => rowHeightMap[props.density] || 48)
</script>

<style scoped>
.data-table-skeleton {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px;
  background: var(--el-bg-color);
}

/* 模拟表头 */
.data-table-skeleton__header {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--el-table-border-color);
}

.data-table-skeleton__header-cell {
  flex-shrink: 0;
  height: 32px;
}

.data-table-skeleton__header-cell:first-child {
  width: 55px; /* selection 列宽度 */
}

.data-table-skeleton__header-cell:not(:first-child) {
  flex: 1;
  min-width: 120px;
}

/* 模拟表格行 */
.data-table-skeleton__body {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.data-table-skeleton__row {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--el-table-border-color);
}

.data-table-skeleton__row:last-child {
  border-bottom: none;
}

.data-table-skeleton__cell {
  flex-shrink: 0;
  height: 44px; /* 与表格行高一致 */
}

.data-table-skeleton__cell:first-child {
  width: 55px; /* selection 列宽度 */
}

.data-table-skeleton__cell:not(:first-child) {
  flex: 1;
  min-width: 120px;
}

/* 暗黑模式适配 */
html.dark .data-table-skeleton__row {
  border-bottom-color: rgb(255 255 255 / 10%);
}

html.dark .data-table-skeleton__header {
  border-bottom-color: rgb(255 255 255 / 10%);
}
</style>
