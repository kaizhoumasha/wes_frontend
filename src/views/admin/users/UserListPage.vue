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
        :title="{
          text: '用户管理',
          subtitle: '管理系统用户',
          icon: UserIcon,
          showSelectedCount: true
        }"
        search-placeholder="搜索用户名、邮箱..."
        @refresh="state.search.handleRefresh"
        @batch-delete="handleBatchDelete"
        @cancel-selection="handleCancelSelectionWithClear"
        @search="handleSearch"
        @toggle-fullscreen="toggleFullscreen"
        @change-density="setDensity"
        @open-column-config="openColumnConfig"
      >
        <template #title="{ selectedCount }">
          <h2
            v-if="selectedCount === 0"
            class="user-toolbar-title"
          >
            <el-icon><UserIcon /></el-icon>
            <span>用户管理</span>
          </h2>

          <div
            v-else
            class="user-toolbar-selection"
          >
            <span class="user-toolbar-selection__count">已选中 {{ selectedCount }} 项</span>
            <el-button
              link
              @click="handleCancelSelectionWithClear"
            >
              取消选择
            </el-button>
          </div>
        </template>

        <template #actions="{ selectedCount }">
          <el-tooltip
            v-if="selectedCount === 0 && state.permissions.create.value"
            content="创建新用户"
            placement="bottom"
          >
            <el-button
              type="primary"
              @click="state.dialogs.openCreate"
            >
              <el-icon><Plus /></el-icon>
              新增用户
            </el-button>
          </el-tooltip>

          <el-tooltip
            v-else-if="selectedCount > 0 && state.permissions.delete.value"
            content="删除选中的用户"
            placement="bottom"
          >
            <el-button
              type="danger"
              :loading="state.state.batchDeleteLoading.value"
              @click="handleBatchDelete"
            >
              <el-icon><Delete /></el-icon>
              批量删除
            </el-button>
          </el-tooltip>
        </template>
      </CrudToolbar>
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
        :default-sort="{ field: 'updated_at', order: 'descending' }"
        :column-resizable="true"
        @selection-change="
          (selected: unknown[]) => state.selection.handleSelectionChange(selected as User[])
        "
        @page-change="handlePageChange"
        @size-change="handleSizeChange"
        @sort-change="state.search.handleSortChange"
        @column-resize="handleColumnResize"
        @retry="state.search.handleRefresh"
        @create="state.dialogs.openCreate"
      />
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
import { computed, ref, onMounted } from 'vue'
import { ElButton, ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Plus, User as UserIcon } from '@element-plus/icons-vue'
import CrudPageLayout from '@/components/common/CrudPageLayout.vue'
import CrudToolbar from '@/components/common/CrudToolbar.vue'
import CrudTable from '@/components/common/CrudTable.vue'
import { useCrudListPage } from '@/composables/useCrudListPage'
import { useCrudToolbar } from '@/composables/useCrudToolbar'
import { usePermission } from '@/composables/usePermission'
import { useResponsiveLayout } from '@/composables/useResponsiveLayout'
import type {
  User,
  CreateUserInput,
  ResetUserPasswordInput,
  UpdateUserInput
} from '@/api/modules/user'
import { userApi } from '@/api/modules/user'
import { userSearchFields, userQuickPresets, userSearchFavorites } from './search-config'
import { USER_PERMISSION } from './constants'
import {
  useUserTableColumns,
  buildConfigurableUserTableColumns,
  type ColumnBreakpoint
} from './composables/useUserTableColumns'
import UserFormDialog from './components/UserFormDialog.vue'
import AdvancedSearchDialog from '@/components/search/AdvancedSearchDialog.vue'
import TableColumnConfigDialog from './components/TableColumnConfigDialog.vue'
import type { TableColumnConfig } from '@/types/table'
import { buildUserActionsColumn } from './tableColumns'

// ==================== 核心逻辑引擎 ====================

const state = useCrudListPage<User, CreateUserInput, UpdateUserInput>({
  api: userApi,
  searchFields: userSearchFields,
  quickPresets: userQuickPresets,
  favorites: userSearchFavorites,
  permissions: USER_PERMISSION,
  pageSize: 20,
  optimisticUpdate: true,
  defaultSort: [{ field: 'updated_at', order: 'desc' }]
})

// ==================== 工具栏状态管理 ====================

const { toggleFullscreen, setDensity, columnConfigDialogOpen, toolbarState } = useCrudToolbar({
  externalState: {
    loading: state.state.loading,
    selectedCount: state.state.selectedCount,
    batchDeleteLoading: state.state.batchDeleteLoading
  }
})

const { hasPermission } = usePermission()
const canResetPassword = computed(() => hasPermission(USER_PERMISSION.resetPassword))
const resettingPasswordUserId = ref<number | null>(null)

/**
 * 打开列配置对话框
 */
function openColumnConfig() {
  columnConfigDialogOpen.value = true
}

// ==================== 表格列定义 ====================

const { isMobile, isTablet } = useResponsiveLayout()
const { columnConfig, updateColumnWidth } = useUserTableColumns()

const tableColumns = computed<TableColumnConfig[]>(() => {
  const currentBreakpoint: ColumnBreakpoint = isMobile.value
    ? 'mobile'
    : isTablet.value
      ? 'tablet'
      : 'desktop'

  const configurableCols = buildConfigurableUserTableColumns(columnConfig.value, currentBreakpoint)

  const actionsColumn: TableColumnConfig = buildUserActionsColumn({
    canEdit: state.permissions.update.value,
    canResetPassword: canResetPassword.value,
    canDelete: state.permissions.delete.value,
    onEdit: user => state.dialogs.openEdit(user.id),
    onResetPassword: user => void handleResetPassword(user),
    resetPasswordLoadingUserId: resettingPasswordUserId.value,
    onDelete: user => void handleDelete(user.id)
  })

  return [...configurableCols, actionsColumn]
})

// ==================== 表格引用 ====================

const tableRef = ref<InstanceType<typeof CrudTable> | null>(null)

// ==================== 事件处理 ====================

/**
 * 搜索处理
 */
function handleSearch() {
  state.search.handleSearch(state.state.pagination.page)
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

function handleColumnResize(resize: { field: string; width: number }) {
  updateColumnWidth(resize.field, resize.width)
}

/**
 * 删除用户
 */
async function handleDelete(userId: number) {
  await state.apiActions.handleDelete(userId)
}

/**
 * 重置用户密码
 */
async function handleResetPassword(user: User) {
  try {
    const { value } = await ElMessageBox.prompt(
      `请输入用户「${user.username}」的新密码`,
      '重置密码',
      {
        confirmButtonText: '确认重置',
        cancelButtonText: '取消',
        inputType: 'password',
        inputPlaceholder: '请输入 6-100 位新密码',
        closeOnClickModal: false,
        inputValidator: inputValue => {
          if (!inputValue) {
            return '请输入新密码'
          }

          if (inputValue.length < 6 || inputValue.length > 100) {
            return '密码长度需为 6-100 位'
          }

          return true
        }
      }
    )

    const payload: ResetUserPasswordInput = {
      new_password: value
    }

    resettingPasswordUserId.value = user.id

    await userApi.resetPassword(user.id, payload)

    ElMessage.success(`已重置用户「${user.username}」的密码`)
  } catch (error) {
    if (error === 'cancel' || error === 'close') {
      return
    }

    throw error
  } finally {
    resettingPasswordUserId.value = null
  }
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
.user-toolbar-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.user-toolbar-selection {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-toolbar-selection__count {
  font-weight: 500;
  color: var(--el-color-primary);
}
</style>
