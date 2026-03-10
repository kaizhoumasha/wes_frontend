<!--
用户管理表格组件

包含数据表格和分页器
支持：骨架屏加载、空状态、错误状态
-->
<template>
  <div class="user-table-container">
    <!-- 错误状态 -->
    <div v-if="error" class="user-table__error">
      <el-result icon="error" title="数据加载失败" :sub-title="error">
        <template #extra>
          <el-button type="primary" @click="$emit('retry')">
            重新加载
          </el-button>
        </template>
      </el-result>
    </div>

    <!-- 数据表格 -->
    <el-table
      v-else
      :data="data"
      :loading="loading"
      stripe
      border
      style="width: 100%"
      v-bind="$attrs"
      @selection-change="handleSelectionChange"
    >
      <!-- 复选框列 -->
      <el-table-column
        type="selection"
        width="55"
        fixed="left"
      />
      <el-table-column
        prop="username"
        label="用户名"
        width="150"
        fixed="left"
      />
      <el-table-column
        prop="email"
        label="邮箱"
        width="200"
      />
      <el-table-column
        prop="full_name"
        label="姓名"
        width="150"
      />
      <el-table-column
        prop="is_superuser"
        label="超级用户"
        width="100"
        align="center"
      >
        <template #default="{ row }">
          <el-tag :type="row.is_superuser ? 'danger' : 'info'">
            {{ row.is_superuser ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="is_multi_login"
        label="多端登录"
        width="100"
        align="center"
      >
        <template #default="{ row }">
          <el-tag :type="row.is_multi_login ? 'success' : 'info'">
            {{ row.is_multi_login ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="roles"
        label="角色"
        width="200"
      >
        <template #default="{ row }">
          <el-tag
            v-for="role in row.roles"
            :key="role.id"
            size="small"
            style="margin-right: 4px"
          >
            {{ role.name }}
          </el-tag>
          <span
            v-if="!row.roles || row.roles.length === 0"
            class="text-muted"
          >
            -
          </span>
        </template>
      </el-table-column>
      <el-table-column
        prop="updated_at"
        label="更新时间"
        width="180"
      >
        <template #default="{ row }">
          {{ formatDateTime(row.updated_at) }}
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="150"
        align="center"
        fixed="right"
      >
        <template #default="{ row }">
          <el-button
            v-if="canUpdate"
            link
            type="primary"
            size="small"
            @click="$emit('edit', row.id)"
          >
            编辑
          </el-button>
          <el-button
            v-if="canDelete"
            link
            type="danger"
            size="small"
            @click="$emit('delete', row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>

      <!-- 空状态 -->
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
    </el-table>

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
import { computed } from 'vue'
import { usePermission } from '@/composables/usePermission'
import { USER_PERMISSION } from '../constants'
import type { User } from '@/api/modules/user'

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
  (e: 'selection-change', selected: User[]): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

// ==================== 工具函数 ====================

/**
 * 格式化日期时间
 */
function formatDateTime(dateStr: string): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * 处理选择变化
 */
function handleSelectionChange(selected: User[]) {
  emit('selection-change', selected)
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
.el-table--striped .el-table__body-wrapper tr.el-table__row--striped td.el-table-fixed-column--right {
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
