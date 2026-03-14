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
        :border="resolvedBorder"
        :stripe="stripe"
        :row-key="rowKey"
        :height="height"
        :max-height="maxHeight"
        :highlight-current-row="highlightCurrentRow"
        :size="tableSize"
        :tree-props="treeProps"
        :default-expand-all="defaultExpandAll"
        :default-expand-row-keys="defaultExpandRowKeys"
        :default-sort="resolvedDefaultSort"
        v-bind="$attrs"
        :class="{ 'data-table--loading': loading }"
        @selection-change="handleSelectionChange"
        @current-change="handleCurrentChange"
        @cell-click="handleCellClick"
        @row-click="handleRowClick"
        @sort-change="handleSortChange"
        @header-dragend="handleHeaderDragEnd"
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
            :resizable="resolveColumnResizable(column)"
          />

          <!-- index 类型列 -->
          <el-table-column
            v-else-if="column.type === 'index'"
            type="index"
            :width="column.width || 60"
            :fixed="column.fixed"
            :label="column.title"
            :resizable="resolveColumnResizable(column)"
          />

          <!-- expand 类型列 -->
          <el-table-column
            v-else-if="column.type === 'expand'"
            type="expand"
            :width="column.width"
            :fixed="column.fixed"
            :label="column.title"
            :resizable="resolveColumnResizable(column)"
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
            :sortable="resolveColumnSortable(column)"
            :resizable="resolveColumnResizable(column)"
            :class-name="column.className"
            :label-class-name="column.labelClassName"
            :show-overflow-tooltip="column.showOverflowTooltip ?? showOverflowTooltip"
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
              <component
                :is="renderFormatterVNode(scope.row, scope.column, scope.$index, column)"
                v-else-if="
                  column.formatter &&
                  renderFormatterVNode(scope.row, scope.column, scope.$index, column)
                "
              />
              <span v-else-if="column.formatter">
                {{ renderFormatterText(scope.row, scope.column, scope.$index, column) }}
              </span>
              <!-- 默认显示字段值 -->
              <span v-else>
                {{ getFieldDisplayValue(scope.row, column.field ?? '') }}
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
import { computed, isVNode, ref } from 'vue'
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
  showOverflowTooltip: true,
  showSelection: false
})

// ==================== Computed ====================

/**
 * 将表格密度转换为 Element Plus Table size
 */
const tableSize = computed(() => {
  if (!props.density) return undefined
  return DENSITY_CONFIG[props.density].size
})

const resolvedDefaultSort = computed(() => {
  if (!props.defaultSort?.field || !props.defaultSort.order) {
    return undefined
  }

  return {
    prop: props.defaultSort.field,
    order: props.defaultSort.order
  }
})

const resolvedBorder = computed(() => {
  return props.border || props.columnResizable === true
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
const visibleColumns = computed(() => {
  const columns = props.columns.filter(col => col.visible !== false && col.disabled !== true)

  // 如果启用了选择列，在列数组开头添加选择列
  if (props.showSelection) {
    return [
      {
        type: 'selection' as const,
        width: 50
      },
      ...columns
    ]
  }

  return columns
})

// ==================== 工具函数 ====================

/**
 * 获取列的唯一 key
 */
function getColumnKey(column: TableColumnConfig, index: number): string {
  if (column.type) return `type_${column.type}_${index}`
  if (column.field) return `field_${column.field}_${index}`
  return `column_${index}`
}

function resolveColumnSortable(column: TableColumnConfig): boolean | 'custom' {
  if (!column.sortable) {
    return false
  }

  return 'custom'
}

function resolveColumnResizable(column: TableColumnConfig): boolean {
  if (!props.columnResizable) {
    return false
  }

  if (column.type === 'selection' || column.type === 'index' || column.type === 'expand') {
    return false
  }

  return column.resizable !== false
}

/**
 * 获取字段值（支持嵌套路径）
 *
 * 使用 utils/object.ts 的 getNestedValue 工具函数
 */
function getFieldRawValue(row: Record<string, unknown>, path: string): unknown {
  if (!path) return ''
  return getNestedValue(row, path, '')
}

function getFieldDisplayValue(row: Record<string, unknown>, path: string): string {
  const value = getFieldRawValue(row, path)

  if (value === null || value === undefined) {
    return ''
  }

  return String(value)
}

/**
 * 渲染格式化器的值
 *
 * 安全地调用格式化函数，捕获错误并返回默认值
 */
function getFormatterResult(
  row: Record<string, unknown>,
  column: { property?: string },
  _index: number,
  config: TableColumnConfig
): ReturnType<ColumnFormatter> | '-' {
  const fieldPath = config.field
  if (!fieldPath || !config.formatter) return '-'

  try {
    const value = getFieldRawValue(row, fieldPath)
    const formatter: ColumnFormatter = config.formatter
    return formatter(value, row, column)
  } catch (error) {
    console.error('DataTable formatter error:', error)
    return '-'
  }
}

function renderFormatterVNode(
  row: Record<string, unknown>,
  column: { property?: string },
  index: number,
  config: TableColumnConfig
) {
  const result = getFormatterResult(row, column, index, config)
  return isVNode(result) ? result : null
}

function renderFormatterText(
  row: Record<string, unknown>,
  column: { property?: string },
  index: number,
  config: TableColumnConfig
): string | number {
  const result = getFormatterResult(row, column, index, config)

  if (isVNode(result)) {
    return ''
  }

  return result ?? ''
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

function handleSortChange(sort: {
  column: unknown
  prop: string
  order: 'ascending' | 'descending' | null
}) {
  const matchedColumn = visibleColumns.value.find(
    column => (column.prop || column.field) === sort.prop
  )
  const field = sort.prop
  emit('sort-change', {
    column: sort.column as { property?: string },
    field,
    sortKey: matchedColumn?.sortKey ?? matchedColumn?.field ?? matchedColumn?.prop,
    order: sort.order
  })
}

function handleFilterChange(filters: unknown) {
  emit('filter-change', filters)
}

function handleHeaderDragEnd(
  newWidth: number,
  oldWidth: number,
  column: {
    property?: string
    label?: string
    id?: string
    resizable?: boolean
  },
  event: MouseEvent
) {
  const field = column.property

  if (!props.columnResizable || !field) {
    return
  }

  const matchedColumn = visibleColumns.value.find(
    item => (item.prop || item.field) === field
  )

  if (!matchedColumn || matchedColumn.resizable === false) {
    return
  }

  emit('column-resize', {
    field,
    width: newWidth,
    oldWidth,
    column,
    event
  })
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
  min-height: 0;
  overflow: hidden;
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
