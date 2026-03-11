<!--
数据表格组件

使用语义化的 field/title columns API，内部映射到 Element Plus el-table
支持动态列配置、插槽渲染、格式化器、树形数据等功能
-->
<template>
  <el-table
    ref="tableRef"
    :data="data"
    :loading="loading"
    :border="border"
    :stripe="stripe"
    :row-key="rowKey"
    :height="height"
    :max-height="maxHeight"
    :highlight-current-row="highlightCurrentRow"
    :tree-props="treeProps"
    :default-expand-all="defaultExpandAll"
    :default-expand-row-keys="defaultExpandRowKeys"
    v-bind="$attrs"
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
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElTable } from 'element-plus'
import { getNestedValue } from '@/utils/object'
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
  $index: number,
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
  emit(
    'cell-click',
    row,
    column as { property?: string },
    cell,
    event
  )
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
