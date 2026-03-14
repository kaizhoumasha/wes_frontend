<!--
用户管理表格组件

使用 field/title columns API 配置方式
包含数据表格和分页器
支持：骨架屏加载、空状态、错误状态
-->
<template>
  <div class="user-table-container">
    <!-- 错误状态 -->
    <div
      v-if="error"
      class="user-table__error"
    >
      <el-result
        icon="error"
        title="数据加载失败"
        :sub-title="error"
      >
        <template #extra>
          <el-button
            type="primary"
            @click="$emit('retry')"
          >
            重新加载
          </el-button>
        </template>
      </el-result>
    </div>

    <!-- 数据表格 -->
    <div class="user-table__table-wrapper">
      <DataTable
        ref="tableRef"
        :data="data"
        :columns="columns"
        :loading="loading"
        :density="props.density"
        :column-resizable="true"
        height="100%"
        border
        stripe
        row-key="id"
        @selection-change="handleSelectionChange"
        @column-resize="handleColumnResize"
      >
        <!-- 空状态插槽 -->
        <template #empty>
          <el-empty
            description="暂无用户数据"
            :image-size="120"
          >
            <el-button
              v-if="canUpdate"
              type="primary"
              @click="$emit('create')"
            >
              创建第一个用户
            </el-button>
          </el-empty>
        </template>
      </DataTable>
    </div>

    <!-- 分页器 -->
    <div class="user-table__pagination">
      <el-pagination
        :current-page="pagination.page"
        :page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @update:current-page="$emit('pageChange', $event)"
        @update:page-size="$emit('sizeChange', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElButton } from 'element-plus'
import { DataTable } from '@/components/ui/table'
import type { DataTableInstance } from '@/components/ui/table'
import { usePermission } from '@/composables/usePermission'
import { useResponsiveLayout } from '@/composables/useResponsiveLayout'
import { USER_PERMISSION } from '../constants'
import type { User } from '@/api/modules/user'
import type { TableDensity } from '@/types/table'
import {
  useUserTableColumns,
  buildConfigurableUserTableColumns,
  type ColumnBreakpoint
} from '../composables/useUserTableColumns'
import { TABLE_MIN_HEIGHT, PAGINATION_HEIGHT } from '@/constants/layout'
import { buildUserActionsColumn } from '../tableColumns'

// ==================== 响应式断点 ====================

// 使用纯响应式检测（无需 UI 状态，更轻量）
const { isMobile, isTablet } = useResponsiveLayout()

// ==================== 权限控制 ====================

const permissions = usePermission()

const canUpdate = computed(() => permissions.hasPermission(USER_PERMISSION.update))
const canDelete = computed(() => permissions.hasPermission(USER_PERMISSION.delete))

// ==================== 类型定义 ====================

interface Props {
  /** 用户列表数据 */
  data: User[]
  /** 是否加载中 */
  loading: boolean
  /** 分页信息 */
  pagination: {
    page: number
    pageSize: number
    total: number
  }
  /** 错误信息 */
  error?: string
  /** 表格密度 */
  density?: TableDensity
}

interface Emits {
  (e: 'edit', userId: number): void
  (e: 'delete', user: User): void
  (e: 'pageChange', page: number): void
  (e: 'sizeChange', size: number): void
  (e: 'retry'): void
  (e: 'create'): void
  (e: 'selection-change', selected: unknown[]): void
}

const props = withDefaults(defineProps<Props>(), {
  error: undefined,
  density: 'compact'
})
const emit = defineEmits<Emits>()

// ==================== 列配置 ====================

const { columnConfig, updateColumnWidth } = useUserTableColumns()

/**
 * 动态列配置：根据 columnConfig + 响应式断点 过滤和排序
 */
const columns = computed(() => {
  const currentBreakpoint: ColumnBreakpoint = isMobile.value
    ? 'mobile'
    : isTablet.value
      ? 'tablet'
      : 'desktop'

  const configurableCols = buildConfigurableUserTableColumns(columnConfig.value, currentBreakpoint)

  // 操作列（始终显示，固定右侧）
  const actionsCol = buildUserActionsColumn({
    canEdit: canUpdate.value,
    canDelete: canDelete.value,
    onEdit: user => emit('edit', user.id),
    onDelete: user => emit('delete', user)
  })

  return [
    { type: 'selection' as const, width: 55, fixed: 'left' as const },
    ...configurableCols,
    actionsCol
  ]
})

// ==================== 事件处理 ====================

/**
 * 处理选择变化
 */
function handleSelectionChange(selected: unknown[]) {
  emit('selection-change', selected)
}

function handleColumnResize(resize: { field: string; width: number }) {
  updateColumnWidth(resize.field, resize.width)
}

// ==================== 表格引用 ====================

const tableRef = ref<DataTableInstance | null>(null)

/**
 * 清除表格选中状态
 */
function clearSelection() {
  tableRef.value?.clearSelection()
}

// ==================== 暴露方法 ====================

defineExpose({
  clearSelection
})
</script>

<script lang="ts">
/**
 * UserTable 组件实例类型
 */
export interface UserTableInstance {
  clearSelection: () => void
}
</script>

<style scoped>
.user-table-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: v-bind('`${TABLE_MIN_HEIGHT}px`'); /* P0优化: 预留最小高度防止布局偏移 */
  overflow: hidden;
  background: var(--el-bg-color);
  border-radius: 8px;
  padding: 16px;
  border: 1px solid var(--el-border-color-lighter);
}

.user-table__table-wrapper {
  flex: 1;
  min-height: 0; /* 关键：允许 flex 子元素缩小 */
  overflow: hidden;
}

.user-table__error {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 300px;
}

.user-table__pagination {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  flex-shrink: 0; /* P0优化: 固定在底部，不参与 flex 压缩 */
  height: v-bind('`${PAGINATION_HEIGHT}px`'); /* P0优化: 固定分页器高度防止布局偏移 */
  padding-top: 16px;
}

.text-muted {
  color: var(--el-text-color-placeholder);
}
</style>

<!-- 全局样式：修复固定列背景色问题 -->
<style>
/* 表头固定列 */
.el-table__header-wrapper tr th.el-table-fixed-column--left,
.el-table__header-wrapper tr th.el-table-fixed-column--right {
  background-color: var(--el-fill-color-blank) !important;
}

/* 表格体固定列 - 默认状态 */
.el-table__body-wrapper tr td.el-table-fixed-column--left,
.el-table__body-wrapper tr td.el-table-fixed-column--right {
  background-color: var(--el-fill-color-blank) !important;
}

/* 表格体固定列 - 条纹行偶数行 */
.el-table--striped .el-table__body-wrapper tr.el-table__row--striped td.el-table-fixed-column--left,
.el-table--striped
  .el-table__body-wrapper
  tr.el-table__row--striped
  td.el-table-fixed-column--right {
  background-color: var(--el-fill-color-lighter) !important;
}

/* 表格体固定列 - 悬停行 */
.el-table__body-wrapper tr.hover-row td.el-table-fixed-column--left,
.el-table__body-wrapper tr.hover-row td.el-table-fixed-column--right {
  background-color: var(--el-fill-color-light) !important;
}

/* 表格体固定列 - 当前选中行 */
.el-table__body-wrapper tr.current-row td.el-table-fixed-column--left,
.el-table__body-wrapper tr.current-row td.el-table-fixed-column--right {
  background-color: var(--el-table-current-row-bg-color) !important;
}

/* 全屏模式：UserListPage 占满整个视口 */
body.table-fullscreen .user-list-page {
  position: fixed;
  inset: 0;
  z-index: 2000;
  height: 100vh !important;
  padding: 16px;
  background: var(--el-bg-color-page);
}
</style>
