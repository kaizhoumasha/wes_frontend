<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElPagination } from 'element-plus'
import DataTable from '@/components/ui/table/DataTable.vue'
import DataTableSkeleton from '@/components/ui/table/DataTableSkeleton.vue'
import type { TableColumnConfig, TableDensity } from '@/types/table'
import type { TableSortOrder } from '@/components/ui/table/table.types'

/**
 * CrudTable 组件
 *
 * 集成 DataTable + 分页器 + 状态管理
 *
 * 特性：
 * - 表格数据展示
 * - 分页控制
 * - Loading/Empty/Error 状态处理
 * - 选择列支持
 * - 密度切换
 * - 全屏模式
 */

// ============================================================================
// 类型定义
// ============================================================================

export interface PaginationState {
  /** 当前页码 */
  page: number
  /** 每页条数 */
  pageSize: number
  /** 总条数 */
  total: number
}

// ============================================================================
// Props 和 Emits
// ============================================================================

export interface CrudTableProps<T = unknown> {
  /** 表格数据 */
  data: T[]
  /** 表格列定义 */
  columns: TableColumnConfig[]
  /** 是否加载中 */
  loading?: boolean
  /**
   * 错误信息或 Error 对象
   * 可接收 Error 对象以获取更丰富的错误上下文.
   */
  error?: Error | string | null
  /** 分页配置 */
  pagination: PaginationState
  /** 密度 */
  density?: TableDensity
  /** 是否显示选择列 */
  showSelection?: boolean
  /** 空状态文本 */
  emptyText?: string
  /** 空状态操作文本 */
  emptyActionText?: string
  /** 默认排序状态 */
  defaultSort?: { field: string; order: Exclude<TableSortOrder, null> }
  /** 是否启用列宽拖拽 */
  columnResizable?: boolean
}

const props = withDefaults(defineProps<CrudTableProps>(), {
  loading: false,
  error: null,
  density: 'comfortable',
  showSelection: false,
  emptyText: '暂无数据',
  emptyActionText: '创建数据',
  defaultSort: undefined,
  columnResizable: false
})

const emit = defineEmits<{
  /** 选择变化事件 */
  (e: 'selection-change', selected: unknown[]): void
  /** 页码变化事件 */
  (e: 'page-change', page: number): void
  /** 每页条数变化事件 */
  (e: 'size-change', size: number): void
  /** 重试事件 */
  (e: 'retry'): void
  /** 创建事件（空状态） */
  (e: 'create'): void
  /** 排序变化事件 */
  (e: 'sort-change', sort: { field: string; sortKey?: string; order: TableSortOrder }): void
  /** 列宽变化事件 */
  (e: 'column-resize', resize: {
    field: string
    width: number
    oldWidth: number
    column: {
      property?: string
      label?: string
      id?: string
      resizable?: boolean
    }
    event: MouseEvent
  }): void
}>()

// ============================================================================
// Refs
// ============================================================================

const tableRef = ref<InstanceType<typeof DataTable>>()

// ============================================================================
// 计算属性
// ============================================================================

/** 是否显示空状态 */
const showEmpty = computed(() => {
  return !props.loading && props.data.length === 0 && !props.error
})

/** 是否显示错误状态 */
const showError = computed(() => {
  return !props.loading && !!props.error
})

/** 是否显示骨架屏 */
const showSkeleton = computed(() => {
  return props.loading && props.data.length === 0
})

/** 错误文本 */
const errorText = computed(() => {
  if (typeof props.error === 'string') {
    return props.error
  }
  if (props.error instanceof Error) {
    return props.error.message
  }
  return '加载失败'
})

// ============================================================================
// 暴露的方法
// ============================================================================

/**
 * 清空选中状态
 */
function clearSelection() {
  tableRef.value?.clearSelection()
}

/**
 * 获取选中的行
 */
function getSelectionRows() {
  // DataTable 不暴露 getSelectionRows，需要通过 emit 获取
  // 这里返回空数组，实际数据通过 selection-change emit 管理
  return []
}

defineExpose({
  clearSelection,
  getSelectionRows
})

// ============================================================================
// 事件处理
// ============================================================================

function handleSelectionChange(selected: unknown[]) {
  emit('selection-change', selected)
}

function handlePageChange(page: number) {
  emit('page-change', page)
}

function handleSizeChange(size: number) {
  emit('size-change', size)
}

function handleRetry() {
  emit('retry')
}

function handleCreate() {
  emit('create')
}

function handleSortChange(sort: { field: string; sortKey?: string; order: TableSortOrder }) {
  emit('sort-change', sort)
}

function handleColumnResize(resize: {
  field: string
  width: number
  oldWidth: number
  column: {
    property?: string
    label?: string
    id?: string
    resizable?: boolean
  }
  event: MouseEvent
}) {
  emit('column-resize', resize)
}
</script>

<template>
  <div class="crud-table">
    <!-- 骨架屏 -->
    <DataTableSkeleton
      v-if="showSkeleton"
      :columns="columns"
      :rows="pagination.pageSize"
    />

    <!-- 错误状态 -->
    <div
      v-else-if="showError"
      class="crud-table__error"
    >
      <el-empty :description="errorText">
        <el-button
          type="primary"
          @click="handleRetry"
        >
          重新加载
        </el-button>
      </el-empty>
    </div>

    <!-- 空状态 -->
    <div
      v-else-if="showEmpty"
      class="crud-table__empty"
    >
      <el-empty :description="emptyText">
        <el-button
          type="primary"
          @click="handleCreate"
        >
          {{ emptyActionText }}
        </el-button>
      </el-empty>
    </div>

    <!-- 数据表格 -->
    <div
      v-else
      class="crud-table__table-content"
    >
      <DataTable
        ref="tableRef"
        :data="data"
        :columns="columns"
        :density="density"
        :show-selection="showSelection"
        :height="'100%'"
        :default-sort="defaultSort"
        :column-resizable="columnResizable"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
        @column-resize="handleColumnResize"
      >
        <!-- 错误状态插槽（可选） -->
        <template
          v-if="$slots.error"
          #error
        >
          <slot
            name="error"
            :error="error"
          />
        </template>

        <!-- 空状态插槽（可选） -->
        <template
          v-if="$slots.empty"
          #empty
        >
          <slot name="empty" />
        </template>
      </DataTable>
    </div>

    <!-- 分页器 -->
    <div
      v-if="!showEmpty && !showError && pagination.total > 0"
      class="crud-table__pagination"
    >
      <el-pagination
        :current-page="pagination.page"
        :page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>
  </div>
</template>

<style scoped>
.crud-table {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  background: var(--el-bg-color);
  border-radius: 4px;
  border: 1px solid var(--el-border-color-lighter);
}

.crud-table__table-content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.crud-table__error,
.crud-table__empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.crud-table__pagination {
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
  padding: 16px 0;
  border-top: 1px solid var(--el-border-color-lighter);
}

/* 响应式：移动端 */
@media (width < 768px) {
  .crud-table__pagination {
    padding: 12px 0;
  }

  :deep(.el-pagination) {
    flex-wrap: wrap;
    justify-content: center;
  }

  :deep(.el-pagination__sizes),
  :deep(.el-pagination__jump) {
    display: none;
  }
}
</style>
