/**
 * 用户管理页编排逻辑
 *
 * 整合所有可复用 composables，提供统一的页面状态管理
 */

import { ref, computed, onMounted } from 'vue'
import { userApi, type CreateUserInput, type UpdateUserInput } from '@/api/modules/user'
import { useCrudApi } from '@/composables/useCrudApi'
import { useSmartSearch } from '@/composables/useSmartSearch'
import { usePermission } from '@/composables/usePermission'
import { ElMessage, ElMessageBox } from 'element-plus'
import { userSearchFields, userQuickPresets, userSearchFavorites } from '../search-config'
import { USER_PERMISSION } from '../constants'
import type { User } from '@/api/modules/user'

// ==================== 类型定义 ====================

/**
 * 用户管理页状态
 */
export interface UserListPageState {
  /** 创建/编辑弹窗是否打开 */
  formDialogOpen: boolean
  /** 当前编辑的用户 ID（null = 创建模式） */
  editingUserId: number | null
}

// ==================== 主函数 ====================

/**
 * 用户管理页编排逻辑
 *
 * @returns 页面状态和操作方法
 *
 * @example
 * ```ts
 * const {
 *   // CRUD 状态
 *   data, loading, error, pagination,
 *   // CRUD 操作
 *   fetchList, create, update, delete: deleteItem, refresh,
 *   // 搜索状态
 *   smartSearch,
 *   // 页面状态
 *   formDialogOpen, editingUserId,
 *   // 操作方法
 *   handleSearch, handleCreate, handleEdit, handleDelete,
 *   openCreateDialog, openEditDialog, closeFormDialog,
 *   // 权限
 *   permissions,
 * } = useUserListPage()
 * ```
 */
export function useUserListPage() {
  // ==================== CRUD 状态 ====================

  const {
    data,
    loading,
    error,
    pagination,
    fetchList,
    create,
    update,
    delete: deleteItem,
    refresh,
  } = useCrudApi(userApi, { limit: 20 })

  // ==================== 搜索状态 ====================

  const smartSearch = useSmartSearch({
    fields: userSearchFields,
    quickPresets: userQuickPresets,
    favorites: userSearchFavorites,
    onConditionsChange: () => handleSearch(1),
  })

  // ==================== 权限控制 ====================

  const permissions = usePermission()

  // ==================== 页面状态 ====================

  const formDialogOpen = ref(false)
  const editingUserId = ref<number | null>(null)

  // 批量选择状态
  const selectedRows = ref<User[]>([])
  const batchDeleteLoading = ref(false)

  // 计算属性
  const selectedCount = computed(() => selectedRows.value.length)
  const hasSelection = computed(() => selectedCount.value > 0)

  // ==================== 操作方法 ====================

  /**
   * 搜索处理
   *
   * @param page 页码（默认 1）
   */
  async function handleSearch(page = 1) {
    const filters = smartSearch.compileToFilterGroup()
    const offset = (page - 1) * pagination.pageSize
    await fetchList({
      offset,
      limit: pagination.pageSize,
      filters,
      sort: [{ field: 'updated_at', order: 'desc' }],
    })
  }

  /**
   * 打开创建弹窗
   */
  function openCreateDialog() {
    if (!permissions.hasPermission(USER_PERMISSION.create)) {
      return
    }
    editingUserId.value = null
    formDialogOpen.value = true
  }

  /**
   * 打开编辑弹窗
   *
   * @param userId 用户 ID
   */
  function openEditDialog(userId: number) {
    if (!permissions.hasPermission(USER_PERMISSION.update)) {
      return
    }
    editingUserId.value = userId
    formDialogOpen.value = true
  }

  /**
   * 关闭表单弹窗
   */
  function closeFormDialog() {
    formDialogOpen.value = false
    editingUserId.value = null
  }

  /**
   * 创建用户
   *
   * @param formData 表单数据
   */
  async function handleCreate(formData: CreateUserInput) {
    const result = await create(formData)
    if (result) {
      closeFormDialog()
    }
    return result
  }

  /**
   * 编辑用户
   *
   * @param userId 用户 ID
   * @param formData 表单数据
   */
  async function handleEdit(userId: number, formData: UpdateUserInput) {
    const result = await update(userId, formData)
    if (result) {
      closeFormDialog()
    }
    return result
  }

  /**
   * 删除用户
   *
   * @param userId 用户 ID
   */
  async function handleDelete(userId: number) {
    if (!permissions.hasPermission(USER_PERMISSION.delete)) {
      return false
    }
    return await deleteItem(userId, false) // 软删除
  }

  /**
   * 刷新列表
   */
  async function handleRefresh() {
    await refresh()
  }

  /**
   * 激活字段处理（回车键确认字段选择）
   * 调用 smartSearch.buildConditionFromField() 生成查询条件
   */
  function handleActivateField(fieldKey: string) {
    smartSearch.buildConditionFromField(fieldKey)
  }

  /**
   * 处理选择变化
   */
  function handleSelectionChange(selected: User[]) {
    selectedRows.value = selected
  }

  /**
   * 取消选择
   */
  function handleCancelSelection() {
    selectedRows.value = []
  }

  /**
   * 批量删除
   */
  async function handleBatchDelete() {
    if (!permissions.hasPermission(USER_PERMISSION.delete)) {
      return
    }

    if (selectedRows.value.length === 0) {
      return
    }

    try {
      await ElMessageBox.confirm(
        `确定要删除选中的 ${selectedRows.value.length} 个用户吗？`,
        '批量删除',
        {
          type: 'warning',
          confirmButtonText: '确定',
          cancelButtonText: '取消',
        }
      )

      batchDeleteLoading.value = true
      const ids = selectedRows.value.map(u => u.id)

      // 并发删除所有选中的用户
      await Promise.all(ids.map(id => deleteItem(id, false)))

      ElMessage.success('批量删除成功')
      selectedRows.value = []
      await refresh()
    } catch (error) {
      // 用户取消操作
      if (error !== 'cancel') {
        ElMessage.error('批量删除失败')
      }
    } finally {
      batchDeleteLoading.value = false
    }
  }

  // ==================== 生命周期 ====================

  onMounted(() => {
    handleSearch(1)
  })

  // ==================== 导出 ====================

  return {
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

    // 批量选择状态
    selectedCount,
    batchDeleteLoading,
    hasSelection,

    // 权限
    permissions,

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
    handleBatchDelete,
  }
}
