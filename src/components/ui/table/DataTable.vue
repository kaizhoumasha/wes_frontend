<!--
数据表格组件

使用语义化的 field/title columns API，内部映射到 Element Plus el-table
支持动态列配置、插槽渲染、格式化器、树形数据等功能
-->
<template>
  <div class="data-table-wrapper">
    <!-- P0优化: 骨架屏淡出过渡 -->
    <transition name="skeleton-fade">
      <div
        v-if="loading"
        class="data-table__skeleton"
      >
        <DataTableSkeleton
          :columns="visibleColumns"
          :density="density"
        />
      </div>
    </transition>

    <!-- P0优化: 表格淡入过渡 -->
    <transition name="table-fade">
      <!-- 数据表格 -->
      <el-table
        v-show="!loading"
        ref="tableRef"
        :data="data"
        :border="border"
        :stripe="stripe"
        :row-key="rowKey"
        :height="height"
        :max-height="maxHeight"
        :highlight-current-row="highlightCurrentRow"
        :size="tableSize"
        :tree-props="treeProps"
        :default-expand-all="defaultExpandAll"
        :default-expand-row-keys="defaultExpandRowKeys"
        v-bind="$attrs"
        :class="{ 'data-table--loading': loading }"
        @selection-change="handleSelectionChange"
        @current-change="handleCurrentChange"
        @cell-click="handleCellClick"
        @row-click="handleRowClick"
        @sort-change="handleSortChange"
        @filter-change="handleFilterChange"
      >
        <!-- 动态渲染列 -->
        <template
          v-for="(column, index) in visibleColumns"
          :key="getColumnKey(column, index)"
        >
          <!-- selection 类型列 -->
          <el-table-column
            v-if="column.type === 'selection'"
            type="selection"
            :width="column.width"
            :fixed="column.fixed"
          />

          <!-- index 类型列 -->
          <el-table-column
            v-else-if="column.type === 'index'"
            type="index"
            :width="column.width || 60"
            :fixed="column.fixed"
            :label="column.title"
          />

          <!-- expand 类型列 -->
          <el-table-column
            v-else-if="column.type === 'expand'"
            type="expand"
            :width="column.width"
            :fixed="column.fixed"
            :label="column.title"
          >
            <template
              v-if="column.slots?.default"
              #default="scope"
            >
              <component :is="column.slots.default(scope)" />
            </template>
          </el-table-column>

          <!-- 普通数据列 -->
          <el-table-column
            v-else
            :prop="column.prop || column.field"
            :label="column.title"
            :width="column.width"
            :min-width="column.minWidth"
            :align="column.align"
            :fixed="column.fixed"
            :sortable="column.sortable"
            :filter-method="column.filterMethod"
            :filters="column.filters"
            :class-name="column.className"
            :label-class-name="column.labelClassName"
            :show-overflow-tooltip="showOverflowTooltip"
          >
            <!-- 表头插槽 -->
            <template
              v-if="column.slots?.header"
              #header="scope"
            >
              <component :is="column.slots.header(scope)" />
            </template>

            <!-- 默认内容插槽 -->
            <template #default="scope">
              <!-- 优先使用 slots.default -->
              <component
                :is="column.slots.default(scope)"
                v-if="column.slots?.default"
              />
              <!-- 其次使用 formatter -->
              <span v-else-if="column.formatter">
                {{ renderFormatterValue(scope.row, scope.column, scope.$index, column) }}
              </span>
              <!-- 默认显示字段值 -->
              <span v-else>
                {{ getFieldValue(scope.row, column.field ?? '') }}
              </span>
            </template>
          </el-table-column>
        </template>

        <!-- 空状态插槽 -->
        <template #empty>
          <slot name="empty">
            <el-empty
              description="暂无数据"
              :image-size="120"
            />
          </slot>
        </template>
      </el-table>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElTable } from 'element-plus'
import { getNestedValue } from '@/utils/object'
import { DENSITY_CONFIG } from '@/types/table'
import {
  TABLE_COMPONENT_MIN_HEIGHT,
  TABLE_BODY_MIN_HEIGHT,
  TABLE_EMPTY_MIN_HEIGHT,
  TRANSITION_DURATION
} from '@/constants/layout'
import DataTableSkeleton from './DataTableSkeleton.vue'
import type {
  DataTableProps,
  DataTableEmits,
  TableColumnConfig,
  ColumnFormatter
} from './table.types'

// ==================== Props & Emits ====================

const props = withDefaults(defineProps<DataTableProps>(), {
  border: false,
  stripe: false,
  highlightCurrentRow: false,
  showOverflowTooltip: true
})

// ==================== Computed ====================

/**
 * 将表格密度转换为 Element Plus Table size
 */
const tableSize = computed(() => {
  if (!props.density) return undefined
  return DENSITY_CONFIG[props.density].size
})

// 使用 unknown 类型而非 any，保持类型安全
const emit = defineEmits<DataTableEmits<unknown>>()

// ==================== 表格引用 ====================

const tableRef = ref<InstanceType<typeof ElTable> | null>(null)

/**
 * 清除选中状态
 */
function clearSelection() {
  tableRef.value?.clearSelection()
}

// ==================== 暴露方法 ====================

defineExpose({
  clearSelection
})

// ==================== 计算属性 ====================

/**
 * 可见列（过滤掉隐藏的列）
 *
 * 使用 readonly 确保返回值不会被意外修改
 */
const visibleColumns = computed(() =>
  props.columns.filter(col => col.visible !== false && col.disabled !== true)
)

// ==================== 工具函数 ====================

/**
 * 获取列的唯一 key
 */
function getColumnKey(column: TableColumnConfig, index: number): string {
  if (column.type) return `type_${column.type}_${index}`
  if (column.field) return `field_${column.field}_${index}`
  return `column_${index}`
}

/**
 * 获取字段值（支持嵌套路径）
 *
 * 使用 utils/object.ts 的 getNestedValue 工具函数
 */
function getFieldValue(row: Record<string, unknown>, path: string): string {
  if (!path) return ''
  const value = getNestedValue(row, path, '')
  return String(value)
}

/**
 * 渲染格式化器的值
 *
 * 安全地调用格式化函数，捕获错误并返回默认值
 */
function renderFormatterValue(
  row: Record<string, unknown>,
  column: { property?: string },
  _index: number,
  config: TableColumnConfig
): string {
  const fieldPath = config.field
  if (!fieldPath || !config.formatter) return '-'

  try {
    const value = getFieldValue(row, fieldPath)
    // 类型守卫确保 formatter 存在
    const formatter: ColumnFormatter = config.formatter
    const result = formatter(value, row, column)
    // 如果结果是 VNode，尝试提取文本内容
    if (typeof result === 'object' && result !== null && 'type' in result) {
      // 简化处理：VNode 通常会被 slots 处理，这里只做兜底
      return String(result)
    }
    return String(result ?? '')
  } catch (error) {
    console.error('DataTable formatter error:', error)
    return '-'
  }
}

// ==================== 事件处理 ====================

function handleSelectionChange(selection: unknown[]) {
  // 保持类型安全：unknown[] 可以传递给 expects T[] 的 emit
  emit('selection-change', selection)
}

function handleCurrentChange(currentRow: unknown, oldCurrentRow: unknown) {
  // 保持类型安全：unknown 可以传递给 expects T | null 的 emit
  emit('current-change', currentRow as unknown | null, oldCurrentRow as unknown | null)
}

function handleCellClick(row: unknown, column: unknown, cell: HTMLTableCellElement, event: Event) {
  // 保持类型安全：将 unknown 断言为期望的类型结构
  emit('cell-click', row, column as { property?: string }, cell, event)
}

function handleRowClick(row: unknown, column: unknown, event: Event) {
  // 保持类型安全：将 unknown 断言为期望的类型结构
  emit('row-click', row, column as { property?: string }, event)
}

function handleSortChange(sort: { column: unknown; prop: string; order: string }) {
  // 映射 Element Plus 的 prop 回我们的 field
  const field = sort.prop
  emit('sort-change', {
    column: sort.column as { property?: string },
    field,
    order: sort.order
  })
}

function handleFilterChange(filters: unknown) {
  emit('filter-change', filters)
}
</script>

<script lang="ts">
/**
 * 组件元信息
 */
export default {
  name: 'DataTable',
  inheritAttrs: false
}
</script>

<style scoped>
.data-table-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.data-table__skeleton {
  position: absolute;
  inset: 0;
  z-index: 10;
  background: var(--el-bg-color);
}

/* P0优化: 骨架屏淡出过渡 */
.skeleton-fade-leave-active {
  transition: opacity v-bind('`${TRANSITION_DURATION.skeletonFade}ms ease`');
}

.skeleton-fade-leave-to {
  opacity: 0;
}

/* P0优化: 表格淡入过渡（延迟等待骨架屏消失） */
.table-fade-enter-active {
  transition: opacity
    v-bind('`${TRANSITION_DURATION.tableFade}ms ease ${TRANSITION_DURATION.tableFadeDelay}ms`');
}

.table-fade-enter-from {
  opacity: 0;
}

/* P0优化: 为表格添加最小高度防止内容加载时布局偏移 */
:deep(.el-table) {
  min-height: v-bind('`${TABLE_COMPONENT_MIN_HEIGHT}px`');
}

/* P0优化: 修复 el-table__body-wrapper 布局偏移 (CLS 主要贡献者) */
:deep(.el-table__body-wrapper) {
  min-height: v-bind('`${TABLE_BODY_MIN_HEIGHT}px`');
  contain: layout style; /* 隔离内部布局变化，防止影响外部 */
}

/* P0优化: 修复空状态文本布局偏移 */
:deep(.el-table__empty-block) {
  min-height: v-bind('`${TABLE_EMPTY_MIN_HEIGHT}px`');
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.el-table__empty-text) {
  min-width: 200px;
  text-align: center;
}

/* P0优化: 加载状态时隐藏表格（使用 v-show 代替 v-if，保持组件挂载） */
.data-table--loading {
  opacity: 0;
  pointer-events: none;
}
</style>
