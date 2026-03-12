<!--
用户管理页 V2 - 使用通用 CRUD 组件

架构：
- 布局：CrudPageLayout（三段式布局）
- 工具栏：CrudToolbar（通用工具栏）
- 表格：CrudTable（集成表格 + 分页 + 状态管理）
- 逻辑：useCrudListPage（核心逻辑引擎）+ useCrudToolbar（工具栏状态）
-->
<template>
  <CrudPageLayout :gap="16">
    <!-- 上：工具栏 -->
    <template #toolbar>
      <CrudToolbar
        :smart-search="state.search.instance"
        :search-fields="userSearchFields"
        :favorites="userSearchFavorites"
        :quick-presets="userQuickPresets"
        :toolbar-state="toolbarState"
        :title="titleConfig"
        :actions="filteredActions"
        search-placeholder="搜索用户名、邮箱、姓名..."
        @refresh="state.search.handleRefresh"
        @batch-delete="handleBatchDelete"
        @cancel-selection="handleCancelSelectionWithClear"
        @search="handleSearch"
        @toggle-fullscreen="toggleFullscreen"
        @change-density="setDensity"
        @open-column-config="openColumnConfig"
        @create="state.dialogs.openCreate"
      />
    </template>

    <!-- 中：表格 -->
    <template #table>
      <CrudTable
        ref="tableRef"
        :data="state.state.data.value ?? []"
        :columns="tableColumns"
        :loading="state.state.loading.value"
        :error="state.state.error.value"
        :pagination="state.state.pagination"
        :density="toolbarState.density"
        :show-selection="true"
        @selection-change="
          (selected: unknown[]) => state.selection.handleSelectionChange(selected as User[])
        "
        @page-change="handlePageChange"
        @size-change="handleSizeChange"
        @retry="state.search.handleRefresh"
        @create="state.dialogs.openCreate"
      >
        <!-- 自定义操作列插槽 -->
        <template #operations="{ row }">
          <el-button
            v-if="state.permissions.update.value"
            type="primary"
            size="small"
            link
            @click="state.dialogs.openEdit((row as User).id)"
          >
            编辑
          </el-button>
          <el-button
            v-if="state.permissions.delete.value"
            type="danger"
            size="small"
            link
            @click="handleDelete((row as User).id)"
          >
            删除
          </el-button>
        </template>
      </CrudTable>
    </template>

    <!-- 弹窗组 -->
    <!-- 创建/编辑弹窗 -->
    <UserFormDialog
      v-if="state.dialogs.formOpen.value"
      :key="state.dialogs.key.value"
      :open="state.dialogs.formOpen.value"
      :user-id="state.dialogs.editingId.value"
      :cached-user-data="
        state.dialogs.editingId.value
          ? (state.state.getCachedData(state.dialogs.editingId.value) ?? undefined)
          : undefined
      "
      @update:open="state.dialogs.close"
      @submit="handleSubmit"
    />

    <!-- 高级搜索弹窗 -->
    <AdvancedSearchDialog
      v-model="state.search.instance.state.value.advancedDialogOpen"
      :conditions="state.search.instance.conditions.value"
      :fields="userSearchFields"
      :favorites="userSearchFavorites"
      :draft-seed="state.search.instance.state.value.advancedDialogDraftSeed"
      @replace-conditions="state.search.instance.replaceConditions"
    />

    <!-- 列配置对话框 -->
    <TableColumnConfigDialog v-model="columnConfigDialogOpen" />
  </CrudPageLayout>
</template>

<script setup lang="ts">
import { ref, computed, h, onMounted } from 'vue'
import { ElTag, ElButton } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import CrudPageLayout from '@/components/common/CrudPageLayout.vue'
import CrudToolbar from '@/components/common/CrudToolbar.vue'
import CrudTable from '@/components/common/CrudTable.vue'
import { useCrudListPage } from '@/composables/useCrudListPage'
import { useCrudToolbar } from '@/composables/useCrudToolbar'
import { useToolbarActions } from '@/composables/useToolbarActions'
import type { User, CreateUserInput, UpdateUserInput } from '@/api/modules/user'
import { userApi } from '@/api/modules/user'
import { userSearchFields, userQuickPresets, userSearchFavorites } from './search-config'
import { USER_PERMISSION } from './constants'
import UserFormDialog from './components/UserFormDialog.vue'
import AdvancedSearchDialog from '@/components/search/AdvancedSearchDialog.vue'
import TableColumnConfigDialog from './components/TableColumnConfigDialog.vue'
import type { TableColumnConfig } from '@/types/table'
import { formatDateTime } from '@/components/ui/table/useTableColumns'

// ==================== 核心逻辑引擎 ====================

const state = useCrudListPage<User, CreateUserInput, UpdateUserInput>({
  api: userApi,
  searchFields: userSearchFields,
  quickPresets: userQuickPresets,
  favorites: userSearchFavorites,
  permissions: USER_PERMISSION,
  pageSize: 20,
  optimisticUpdate: true
})

// ==================== 工具栏状态管理 ====================

const { isFullscreen, toggleFullscreen, density, setDensity, columnConfigDialogOpen } =
  useCrudToolbar({
    externalState: {
      loading: state.state.loading,
      selectedCount: state.state.selectedCount,
      batchDeleteLoading: state.state.batchDeleteLoading
    }
  })

// 聚合工具栏状态（传给 CrudToolbar）
const toolbarState = computed(() => ({
  loading: state.state.loading.value,
  selectedCount: state.state.selectedCount.value,
  batchDeleteLoading: state.state.batchDeleteLoading.value,
  isFullscreen: isFullscreen.value,
  density: density.value
}))

/**
 * 打开列配置对话框
 */
function openColumnConfig() {
  columnConfigDialogOpen.value = true
}

// ==================== 操作按钮配置 ====================

const { filteredActions } = useToolbarActions({
  actions: [
    {
      key: 'create',
      label: '新增用户',
      icon: Plus,
      type: 'primary',
      handler: () => state.dialogs.openCreate(),
      permission: USER_PERMISSION.create
    }
  ]
})

// 标题配置
const titleConfig = computed(() => ({
  text: '用户管理',
  subtitle: `共 ${state.state.pagination.total} 个用户`,
  showSelectedCount: true
}))

// ==================== 表格列定义 ====================

/**
 * 创建布尔值 Tag 格式化器
 */
function createBooleanTagFormatter(
  field: 'is_superuser' | 'is_multi_login',
  trueType: 'danger' | 'success' | 'warning',
  falseType: 'danger' | 'success' | 'warning' | 'info' = 'info'
) {
  return (value: unknown) => {
    return h(ElTag, { type: value ? trueType : falseType }, () => (value ? '是' : '否'))
  }
}

/**
 * 角色格式化器
 */
function formatRoles(value: unknown) {
  const roles = (value as { name: string }[]) ?? []
  if (roles.length === 0) {
    return h(ElTag, { type: 'info' }, () => '无角色')
  }
  return h('span', { class: 'inline-flex gap-1' }, [
    ...roles.map((role: { name: string }) =>
      h(ElTag, { key: role.name, type: 'success', size: 'small' }, () => role.name)
    )
  ])
}

/**
 * 表格列配置
 */
const tableColumns: TableColumnConfig[] = [
  {
    field: 'username',
    title: '用户名',
    width: 120,
    fixed: 'left'
  },
  {
    field: 'email',
    title: '邮箱',
    minWidth: 180
  },
  {
    field: 'full_name',
    title: '姓名',
    width: 120
  },
  {
    field: 'roles',
    title: '角色',
    width: 150,
    formatter: formatRoles
  },
  {
    field: 'is_superuser',
    title: '超级用户',
    width: 100,
    formatter: createBooleanTagFormatter('is_superuser', 'danger', 'info')
  },
  {
    field: 'is_multi_login',
    title: '多端登录',
    width: 100,
    formatter: createBooleanTagFormatter('is_multi_login', 'success', 'info')
  },
  {
    field: 'updated_at',
    title: '更新时间',
    width: 160,
    formatter: formatDateTime as () => string | number
  },
  {
    field: 'operations',
    title: '操作',
    width: 150,
    fixed: 'right',
    slots: {
      default: scope => {
        const row = scope.row as unknown as User
        return h('span', { class: 'inline-flex gap-2' }, [
          state.permissions.update.value
            ? h(
                ElButton,
                {
                  type: 'primary',
                  size: 'small',
                  link: true,
                  onClick: () => state.dialogs.openEdit(row.id)
                },
                () => '编辑'
              )
            : null,
          state.permissions.delete.value
            ? h(
                ElButton,
                {
                  type: 'danger',
                  size: 'small',
                  link: true,
                  onClick: () => handleDelete(row.id)
                },
                () => '删除'
              )
            : null
        ])
      }
    }
  }
]

// ==================== 表格引用 ====================

const tableRef = ref<InstanceType<typeof CrudTable> | null>(null)

// ==================== 事件处理 ====================

/**
 * 搜索处理
 */
function handleSearch() {
  state.search.handleSearch(1)
}

/**
 * 分页变化
 */
function handlePageChange(page: number) {
  state.search.handleSearch(page)
}

/**
 * 每页数量变化
 */
function handleSizeChange() {
  // 当前 useCrudListPage 不支持动态修改 pageSize
  // 需要在后续版本中添加此功能
  console.warn('Dynamic pageSize change not yet implemented')
}

/**
 * 删除用户
 */
async function handleDelete(userId: number) {
  await state.apiActions.handleDelete(userId)
}

/**
 * 表单提交
 */
async function handleSubmit(formData: CreateUserInput | UpdateUserInput) {
  if (state.dialogs.editingId.value) {
    await state.apiActions.handleEdit(state.dialogs.editingId.value, formData as UpdateUserInput)
  } else {
    await state.apiActions.handleCreate(formData as CreateUserInput)
  }
}

/**
 * 批量删除
 */
async function handleBatchDelete() {
  await state.selection.handleBatchDelete()
  // 清空表格选中状态
  tableRef.value?.clearSelection()
}

/**
 * 取消选择（清空表格选中状态）
 */
function handleCancelSelectionWithClear() {
  state.selection.clearSelectionState()
  tableRef.value?.clearSelection()
}

// ==================== 生命周期 ====================

onMounted(() => {
  // 初始加载
  state.search.handleSearch(1)
})
</script>

<style scoped>
/* 布局高度计算 */
:deep(.crud-page-layout) {
  height: calc(100vh - var(--layout-header-height) - var(--layout-page-padding) * 2);
}
</style>
