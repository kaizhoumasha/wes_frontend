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
    <DataTable
      v-else
      ref="tableRef"
      :data="data"
      :columns="columns"
      :loading="loading"
      border
      stripe
      row-key="id"
      @selection-change="handleSelectionChange"
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
import { computed, h, ref } from 'vue'
import { ElTag, ElButton } from 'element-plus'
import { DataTable } from '@/components/ui/table'
import type { DataTableInstance } from '@/components/ui/table'
import { formatDateTime } from '@/components/ui/table/useTableColumns'
import { usePermission } from '@/composables/usePermission'
import { USER_PERMISSION } from '../constants'
import type { User, Role } from '@/api/modules/user'

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

defineProps<Props>()
const emit = defineEmits<Emits>()

// ==================== 表格列配置 ====================

/**
 * 用户管理表格列配置
 *
 * 使用语义化的 field/title API
 */
const columns = computed(() => [
  // 复选框列
  {
    type: 'selection' as const,
    width: 55,
    fixed: 'left' as const
  },
  // 用户名列
  {
    field: 'username',
    title: '用户名',
    width: 150,
    fixed: 'left' as const
  },
  // 邮箱列
  {
    field: 'email',
    title: '邮箱',
    width: 200
  },
  // 姓名列
  {
    field: 'full_name',
    title: '姓名',
    width: 150
  },
  // 超级用户列（使用插槽渲染）
  {
    field: 'is_superuser',
    title: '超级用户',
    width: 100,
    align: 'center' as const,
    slots: {
      default: ({ row }: { row: Record<string, unknown> }) =>
        h(
          ElTag,
          {
            type: (row as unknown as User).is_superuser ? 'danger' : 'info'
          },
          () => ((row as unknown as User).is_superuser ? '是' : '否')
        )
    }
  },
  // 多端登录列（使用插槽渲染）
  {
    field: 'is_multi_login',
    title: '多端登录',
    width: 100,
    align: 'center' as const,
    slots: {
      default: ({ row }: { row: Record<string, unknown> }) =>
        h(
          ElTag,
          {
            type: (row as unknown as User).is_multi_login ? 'success' : 'info'
          },
          () => ((row as unknown as User).is_multi_login ? '是' : '否')
        )
    }
  },
  // 角色列（数组标签）
  {
    field: 'roles',
    title: '角色',
    width: 200,
    slots: {
      default: ({ row }: { row: Record<string, unknown> }) => {
        const user = row as unknown as User
        if (!user.roles || user.roles.length === 0) {
          return h('span', { class: 'text-muted' }, '-')
        }
        return h(
          'div',
          { class: 'flex gap-1 flex-wrap' },
          user.roles.map((role: Role) =>
            h(
              ElTag,
              {
                key: role.id,
                size: 'small'
              },
              () => role.name
            )
          )
        )
      }
    }
  },
  // 更新时间列（使用内置格式化器）
  {
    field: 'updated_at',
    title: '更新时间',
    width: 180,
    formatter: formatDateTime
  },
  // 操作列
  {
    field: '__actions__',
    title: '操作',
    width: 150,
    align: 'center' as const,
    fixed: 'right' as const,
    slots: {
      default: ({ row }: { row: Record<string, unknown> }) => {
        const user = row as unknown as User
        const buttons = []

        if (canUpdate.value) {
          buttons.push(
            h(
              ElButton,
              {
                link: true,
                type: 'primary',
                size: 'small',
                onClick: () => emit('edit' as const, user.id)
              },
              () => '编辑'
            )
          )
        }

        if (canDelete.value) {
          buttons.push(
            h(
              ElButton,
              {
                link: true,
                type: 'danger',
                size: 'small',
                onClick: () => emit('delete' as const, user)
              },
              () => '删除'
            )
          )
        }

        return h('div', { class: 'flex gap-2' }, buttons)
      }
    }
  }
])

// ==================== 事件处理 ====================

/**
 * 处理选择变化
 */
function handleSelectionChange(selected: unknown[]) {
  emit('selection-change', selected)
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
  overflow: hidden;
  background: var(--el-bg-color);
  border-radius: 8px;
  padding: 16px;
  border: 1px solid var(--el-border-color-lighter);
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
  margin-top: 16px;
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
</style>
