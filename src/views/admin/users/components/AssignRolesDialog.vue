<script setup lang="ts">
/**
 * AssignRolesDialog - 用户分配角色对话框
 *
 * 设计理念：
 * - 双栏穿梭框布局：左侧可选角色，右侧已选角色
 * - 支持搜索快速定位
 * - 清晰的已选/未选状态分离
 * - 优雅的入场动画
 */
import { inject, ref, watch, computed, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import type { User } from '@/api/modules/user'
import type { Role } from '@/api/modules/role'
import { roleApi } from '@/api/modules/role'
import { userApi } from '@/api/modules/user'
import StandardDialog from '@/components/ui/StandardDialog/StandardDialog.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { CRUD_PAGE_REFRESH_KEY } from '@/components/common/crud-page/types'

// ==================== Props & Emits ====================

const props = defineProps<{
  user: User | null
}>()

const visible = defineModel<boolean>({ default: false })

const emit = defineEmits<{
  success: []
}>()

// ==================== Inject ====================

const refresh = inject(CRUD_PAGE_REFRESH_KEY)

// ==================== State ====================

const allRoles = ref<Role[]>([])
const selectedRoleIds = ref<number[]>([])
const loading = ref(false)
const submitting = ref(false)

// 搜索关键词
const leftSearchKeyword = ref('')
const rightSearchKeyword = ref('')

// ==================== Computed ====================

/** 用户名显示 */
const userName = computed(() => props.user?.username ?? '')

/** 已选角色列表 */
const selectedRoles = computed(() => {
  return allRoles.value.filter(role => selectedRoleIds.value.includes(role.id))
})

/** 待选角色列表（排除已选） */
const availableRoles = computed(() => {
  return allRoles.value.filter(role => !selectedRoleIds.value.includes(role.id))
})

/** 搜索过滤后的待选角色 */
const filteredAvailableRoles = computed(() => {
  if (!leftSearchKeyword.value) return availableRoles.value
  const keyword = leftSearchKeyword.value.toLowerCase()
  return availableRoles.value.filter(
    role =>
      role.name.toLowerCase().includes(keyword) ||
      (role.description?.toLowerCase().includes(keyword) ?? false)
  )
})

/** 搜索过滤后的已选角色 */
const filteredSelectedRoles = computed(() => {
  if (!rightSearchKeyword.value) return selectedRoles.value
  const keyword = rightSearchKeyword.value.toLowerCase()
  return selectedRoles.value.filter(
    role =>
      role.name.toLowerCase().includes(keyword) ||
      (role.description?.toLowerCase().includes(keyword) ?? false)
  )
})

/** 待选角色数量 */
const availableCount = computed(() => availableRoles.value.length)

/** 已选角色数量 */
const selectedCount = computed(() => selectedRoles.value.length)

// ==================== Methods ====================

/**
 * 初始化选中角色
 */
function initSelectedRoles(user: User | null) {
  if (user?.roles) {
    selectedRoleIds.value = user.roles.map(r => r.id)
  } else {
    selectedRoleIds.value = []
  }
  // 清空搜索
  leftSearchKeyword.value = ''
  rightSearchKeyword.value = ''
}

/**
 * 加载可选角色列表
 */
async function loadRoles() {
  loading.value = true

  try {
    let lastError: Error | null = null
    const maxRetries = 2

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        allRoles.value = await roleApi.query()
        return
      } catch (e) {
        lastError = e instanceof Error ? e : new Error(String(e))
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }
    }

    ElMessage.error('加载角色列表失败，请稍后重试')
    console.error('Failed to load roles after retries:', lastError)
  } finally {
    loading.value = false
  }
}

/**
 * 添加角色到已选
 */
function addRole(role: Role) {
  if (!selectedRoleIds.value.includes(role.id)) {
    selectedRoleIds.value.push(role.id)
  }
}

/**
 * 从已选移除角色
 */
function removeRole(role: Role) {
  const index = selectedRoleIds.value.indexOf(role.id)
  if (index > -1) {
    selectedRoleIds.value.splice(index, 1)
  }
}

/**
 * 清空已选角色
 */
function clearSelected() {
  selectedRoleIds.value = []
}

/**
 * 全选
 */
function selectAll() {
  selectedRoleIds.value = allRoles.value.map(r => r.id)
}

/**
 * 提交角色分配
 */
async function handleSubmit() {
  if (!props.user) return

  submitting.value = true

  try {
    await userApi.assignRoles(props.user.id, selectedRoleIds.value)
    ElMessage.success(`已为用户「${props.user.username}」分配角色`)
    visible.value = false
    emit('success')

    if (refresh) {
      try {
        await refresh()
      } catch (e) {
        console.warn('Failed to refresh user list:', e)
        ElMessage.warning('角色分配成功，但列表刷新失败，请手动刷新')
      }
    }
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : '未知错误'
    ElMessage.error(`分配角色失败：${errorMessage}`)
  } finally {
    submitting.value = false
  }
}

// ==================== Watchers ====================

watch(
  () => props.user,
  user => {
    initSelectedRoles(user)
  },
  { immediate: true }
)

watch(visible, isOpen => {
  if (isOpen) {
    void loadRoles()
  }
})

// 对话框打开后聚焦左侧搜索框
watch(visible, async isOpen => {
  if (isOpen) {
    await nextTick()
    // 搜索框会自动聚焦
  }
})
</script>

<template>
  <StandardDialog
    v-model="visible"
    :title="`为用户「${userName}」分配角色`"
    size="lg"
    :confirm-loading="submitting"
    :confirm-disabled="loading"
    confirm-text="保存"
    @confirm="handleSubmit"
  >
    <div
      v-loading="loading"
      class="role-assignment"
    >
      <!-- 双栏穿梭框 -->
      <div class="transfer-container">
        <!-- 左侧：待选角色 -->
        <div class="transfer-panel transfer-panel--left">
          <div class="transfer-panel__header">
            <span class="transfer-panel__title">
              可选角色
              <span class="transfer-panel__count">({{ availableCount }})</span>
            </span>
            <button
              v-if="availableCount > 0"
              type="button"
              class="transfer-panel__action"
              @click="selectAll"
            >
              全选
            </button>
          </div>

          <div class="transfer-panel__search">
            <el-input
              v-model="leftSearchKeyword"
              placeholder="搜索角色..."
              clearable
              :prefix-icon="AppIcon"
              size="small"
            >
              <template #prefix>
                <AppIcon
                  icon="ep:search"
                  :size="14"
                />
              </template>
            </el-input>
          </div>

          <div class="transfer-panel__body">
            <TransitionGroup
              name="role-list"
              tag="div"
              class="role-list"
            >
              <div
                v-for="role in filteredAvailableRoles"
                :key="role.id"
                class="role-item role-item--available"
                @click="addRole(role)"
              >
                <div class="role-item__content">
                  <span class="role-item__name">{{ role.name }}</span>
                  <span
                    v-if="role.description"
                    class="role-item__desc"
                  >
                    {{ role.description }}
                  </span>
                </div>
                <AppIcon
                  icon="ep:plus"
                  :size="16"
                  class="role-item__icon"
                />
              </div>
            </TransitionGroup>

            <div
              v-if="filteredAvailableRoles.length === 0 && !loading"
              class="transfer-panel__empty"
            >
              <AppIcon
                icon="ep:folder-opened"
                :size="32"
                class="transfer-panel__empty-icon"
              />
              <span>{{ leftSearchKeyword ? '无匹配结果' : '暂无可选角色' }}</span>
            </div>
          </div>
        </div>

        <!-- 中间分隔符 -->
        <div class="transfer-divider">
          <AppIcon
            icon="ep:arrow-right"
            :size="20"
          />
        </div>

        <!-- 右侧：已选角色 -->
        <div class="transfer-panel transfer-panel--right">
          <div class="transfer-panel__header">
            <span class="transfer-panel__title">
              已选角色
              <span class="transfer-panel__count">({{ selectedCount }})</span>
            </span>
            <button
              v-if="selectedCount > 0"
              type="button"
              class="transfer-panel__action transfer-panel__action--danger"
              @click="clearSelected"
            >
              清空
            </button>
          </div>

          <div class="transfer-panel__search">
            <el-input
              v-model="rightSearchKeyword"
              placeholder="搜索已选..."
              clearable
              size="small"
            >
              <template #prefix>
                <AppIcon
                  icon="ep:search"
                  :size="14"
                />
              </template>
            </el-input>
          </div>

          <div class="transfer-panel__body">
            <TransitionGroup
              name="role-list"
              tag="div"
              class="role-list"
            >
              <div
                v-for="role in filteredSelectedRoles"
                :key="role.id"
                class="role-item role-item--selected"
                @click="removeRole(role)"
              >
                <div class="role-item__content">
                  <span class="role-item__name">{{ role.name }}</span>
                  <span
                    v-if="role.description"
                    class="role-item__desc"
                  >
                    {{ role.description }}
                  </span>
                </div>
                <AppIcon
                  icon="ep:close"
                  :size="16"
                  class="role-item__icon"
                />
              </div>
            </TransitionGroup>

            <div
              v-if="selectedCount === 0 && !loading"
              class="transfer-panel__empty"
            >
              <AppIcon
                icon="ep:circle-check"
                :size="32"
                class="transfer-panel__empty-icon"
              />
              <span>请从左侧选择角色</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </StandardDialog>
</template>

<style scoped>
.role-assignment {
  min-height: 320px;
}

/* ==================== 双栏穿梭框布局 ==================== */
.transfer-container {
  display: flex;
  gap: 0;
  height: 400px;
}

/* ==================== 面板样式 ==================== */
.transfer-panel {
  display: flex;
  flex: 1;
  flex-direction: column;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  background: var(--el-bg-color);
  overflow: hidden;
}

.transfer-panel--left {
  border-color: var(--el-border-color-lighter);
}

.transfer-panel--right {
  border-color: var(--el-color-primary-light-5);
  background: linear-gradient(135deg, var(--el-color-primary-light-9) 0%, var(--el-bg-color) 100%);
}

/* 面板头部 */
.transfer-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-light);
}

.transfer-panel--right .transfer-panel__header {
  background: var(--el-color-primary-light-9);
  border-bottom-color: var(--el-color-primary-light-8);
}

.transfer-panel__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.transfer-panel__count {
  margin-left: 4px;
  font-size: 12px;
  font-weight: 400;
  color: var(--el-text-color-secondary);
}

.transfer-panel__action {
  padding: 2px 8px;
  font-size: 12px;
  color: var(--el-color-primary);
  cursor: pointer;
  background: transparent;
  border: none;
  border-radius: 4px;
  transition: all 0.15s ease;
}

.transfer-panel__action:hover {
  background: var(--el-color-primary-light-9);
}

.transfer-panel__action--danger {
  color: var(--el-color-danger);
}

.transfer-panel__action--danger:hover {
  background: var(--el-color-danger-light-9);
}

/* 搜索栏 */
.transfer-panel__search {
  padding: 8px 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

/* 面板内容 */
.transfer-panel__body {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  scrollbar-width: thin;
  scrollbar-color: var(--el-border-color) transparent;
}

.transfer-panel__body::-webkit-scrollbar {
  width: 4px;
}

.transfer-panel__body::-webkit-scrollbar-track {
  background: transparent;
}

.transfer-panel__body::-webkit-scrollbar-thumb {
  background: var(--el-border-color-lighter);
  border-radius: 2px;
}

.transfer-panel__body::-webkit-scrollbar-thumb:hover {
  background: var(--el-border-color);
}

/* 角色列表 */
.role-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* 角色项 */
.role-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.15s ease;
}

.role-item--available {
  background: var(--el-fill-color-blank);
  border: 1px solid transparent;
}

.role-item--available:hover {
  background: var(--el-fill-color-light);
  border-color: var(--el-color-primary-light-5);
}

.role-item--available:hover .role-item__icon {
  color: var(--el-color-primary);
  transform: scale(1.1);
}

.role-item--selected {
  background: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary-light-7);
}

.role-item--selected:hover {
  background: var(--el-color-primary-light-8);
  border-color: var(--el-color-primary-light-5);
}

.role-item--selected:hover .role-item__icon {
  color: var(--el-color-danger);
  transform: scale(1.1);
}

.role-item__content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
}

.role-item__name {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.role-item__desc {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.role-item__icon {
  flex-shrink: 0;
  color: var(--el-text-color-placeholder);
  transition: all 0.15s ease;
}

/* 空状态 */
.transfer-panel__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 8px;
  color: var(--el-text-color-placeholder);
  font-size: 13px;
}

.transfer-panel__empty-icon {
  opacity: 0.5;
}

/* ==================== 中间分隔符 ==================== */
.transfer-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  flex-shrink: 0;
  color: var(--el-text-color-placeholder);
}

/* ==================== 列表动画 ==================== */
.role-list-enter-active,
.role-list-leave-active {
  transition: all 0.2s ease;
}

.role-list-enter-from {
  opacity: 0;
  transform: translateX(-10px);
}

.role-list-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

.role-list-move {
  transition: transform 0.2s ease;
}

/* ==================== 响应式 ==================== */
@media (width < 640px) {
  .transfer-container {
    flex-direction: column;
    height: auto;
  }

  .transfer-panel {
    height: 240px;
  }

  .transfer-divider {
    width: auto;
    height: 32px;
    transform: rotate(90deg);
  }
}
</style>