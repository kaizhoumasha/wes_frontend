<!--
用户管理页主页面

上-中-下三段式布局：
- 上：工具栏（标题+操作+搜索+控制）
- 中：数据表格
- 下：分页器
-->
<template>
  <div class="user-list-page">
    <!-- 上：工具栏 -->
    <UserToolbar
      :conditions="smartSearch.conditions.value"
      :keyword="smartSearch.state.value.keyword"
      :active-field="smartSearch.state.value.activeField"
      :fields="userSearchFields"
      :favorites="userSearchFavorites"
      :quick-presets="userQuickPresets"
      :popover-open="smartSearch.state.value.popoverOpen"
      :loading="loading"
      :selected-count="selectedCount"
      :batch-delete-loading="batchDeleteLoading"
      @create="openCreateDialog"
      @refresh="handleRefresh"
      @batch-delete="handleBatchDelete"
      @cancel-selection="handleCancelSelectionWithClear"
      @update:keyword="smartSearch.setKeyword"
      @remove-condition="smartSearch.removeCondition"
      @clear="
        () => {
          smartSearch.clearKeyword()
          smartSearch.clearConditions()
        }
      "
      @search="() => handleSearch(pagination.page)"
      @open-popover="smartSearch.openPopover"
      @close-popover="smartSearch.closePopover"
      @toggle-popover="smartSearch.togglePopover"
      @open-advanced="smartSearch.openAdvancedDialog"
      @keydown-next="smartSearch.getNextActiveField('next')"
      @keydown-prev="smartSearch.getNextActiveField('prev')"
      @activate-field="handleActivateField"
      @open-advanced-for-field="smartSearch.openAdvancedDialog"
    />

    <!-- 中：数据表格 + 分页 -->
    <UserTable
      ref="tableRef"
      :data="data?.items ?? []"
      :loading="loading"
      :error="errorMessage"
      :pagination="pagination"
      @edit="openEditDialog"
      @delete="handleDeleteUser"
      @retry="handleRefresh"
      @create="openCreateDialog"
      @selection-change="handleSelectionChange"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
    />

    <!-- 创建/编辑弹窗 -->
    <UserFormDialog
      v-if="formDialogOpen"
      :key="dialogKey"
      :open="formDialogOpen"
      :user-id="editingUserId"
      :cached-user-data="
        editingUserId ? (getCachedUserData(editingUserId) ?? undefined) : undefined
      "
      @update:open="closeFormDialog"
      @submit="handleSubmit"
    />

    <!-- 高级搜索弹窗 -->
    <AdvancedSearchDialog
      v-model="smartSearch.state.value.advancedDialogOpen"
      :conditions="smartSearch.conditions.value"
      :fields="userSearchFields"
      :favorites="userSearchFavorites"
      :draft-seed="smartSearch.state.value.advancedDialogDraftSeed"
      @replace-conditions="smartSearch.replaceConditions"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useUserListPage } from './composables/useUserListPage'
import type { CreateUserInput, UpdateUserInput } from '@/api/modules/user'
import type { UserTableInstance } from './components/UserTable.vue'
import UserToolbar from './components/UserToolbar.vue'
import UserTable from './components/UserTable.vue'
import UserFormDialog from './components/UserFormDialog.vue'
import AdvancedSearchDialog from '@/components/search/AdvancedSearchDialog.vue'
import type { User } from '@/api/modules/user'
import { userSearchFields, userQuickPresets, userSearchFavorites } from './search-config'

// ==================== 页面编排逻辑 ====================

const {
  // CRUD 状态
  data,
  loading,
  error,
  pagination,

  // 搜索状态
  smartSearch,

  // 页面状态
  formDialogOpen,
  editingUserId,
  dialogKey,
  getCachedUserData,

  // 批量选择状态
  selectedCount,
  batchDeleteLoading,

  // 操作方法
  handleSearch,
  handleCreate,
  handleEdit,
  handleDelete,
  handleRefresh,
  handleActivateField,
  openCreateDialog,
  openEditDialog,
  closeFormDialog,
  handleSelectionChange,
  handleCancelSelection,
  handleBatchDelete
} = useUserListPage()

// ==================== 计算属性 ====================

// 将 Error 对象转换为字符串用于显示
const errorMessage = computed(() => {
  if (!error.value) return undefined
  return error.value instanceof Error ? error.value.message : String(error.value)
})

// ==================== 表格引用 ====================

const tableRef = ref<UserTableInstance | null>(null)

// ==================== 事件处理 ====================

/**
 * 分页变化
 */
function handlePageChange(page: number) {
  handleSearch(page)
}

/**
 * 每页数量变化
 */
function handleSizeChange(size: number) {
  pagination.pageSize = size
  handleSearch(1)
}

/**
 * 删除用户
 */
async function handleDeleteUser(user: User) {
  await handleDelete(user.id)
}

/**
 * 表单提交
 */
async function handleSubmit(formData: CreateUserInput | UpdateUserInput) {
  if (editingUserId.value) {
    // 编辑模式：formData 已经是 UpdateUserInput 类型
    await handleEdit(editingUserId.value, formData as UpdateUserInput)
  } else {
    // 创建模式：formData 已经是 CreateUserInput 类型
    await handleCreate(formData as CreateUserInput)
  }
}

/**
 * 取消选择（覆盖 composable 中的实现以清空表格选中状态）
 */
async function handleCancelSelectionWithClear() {
  // 先调用 composable 中的取消选择逻辑（清空 selectedRows）
  await handleCancelSelection()
  // 再清空表格的选中状态
  tableRef.value?.clearSelection()
}
</script>

<style scoped>
.user-list-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 16px;
}
</style>
