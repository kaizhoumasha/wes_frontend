<script setup lang="ts">
/**
 * ApiPermissionConfigDialog - API 应用权限配置对话框
 *
 * 用于维护第三方应用可调用的 app_api 权限。
 */
import { computed, inject, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { applicationsApiMethods } from '@/api/modules/applications'
import type { ApplicationsItem as APIApplication } from '@/api/modules/applications'
import type { components } from '@/api/generated/openapi-types'
import { CRUD_PAGE_REFRESH_KEY } from '@/components/common/crud-page/types'
import AppIcon from '@/components/ui/AppIcon.vue'
import StandardDialog from '@/components/ui/StandardDialog/StandardDialog.vue'
import { getSafeErrorMessage } from '@/utils/string'

type PermissionItem = components['schemas']['PermissionResponse']

const props = defineProps<{
  app: APIApplication | null
}>()

const visible = defineModel<boolean>({ default: false })

const emit = defineEmits<{
  success: []
}>()

const refresh = inject(CRUD_PAGE_REFRESH_KEY)

const allPermissions = ref<PermissionItem[]>([])
const selectedPermissionIds = ref<number[]>([])
const currentApplication = ref<APIApplication | null>(null)
const loading = ref(false)
const submitting = ref(false)
const leftSearchKeyword = ref('')
const rightSearchKeyword = ref('')

const activeApplication = computed(() => currentApplication.value ?? props.app)
const appName = computed(() => activeApplication.value?.app_name ?? '')
const appId = computed(() => activeApplication.value?.app_id ?? '')

const assignedPermissionSnapshot = computed(() => {
  return Array.isArray(activeApplication.value?.permissions)
    ? activeApplication.value.permissions
    : null
})

const hasAssignedSnapshot = computed(() => assignedPermissionSnapshot.value !== null)

const selectedPermissionIdSet = computed(() => new Set(selectedPermissionIds.value))

const selectedPermissions = computed(() =>
  allPermissions.value.filter(permission => selectedPermissionIdSet.value.has(permission.id))
)

const availablePermissions = computed(() =>
  allPermissions.value.filter(permission => !selectedPermissionIdSet.value.has(permission.id))
)

const filteredAvailablePermissions = computed(() =>
  filterPermissions(availablePermissions.value, leftSearchKeyword.value)
)

const filteredSelectedPermissions = computed(() =>
  filterPermissions(selectedPermissions.value, rightSearchKeyword.value)
)

const selectedCount = computed(() => selectedPermissionIds.value.length)
const availableCount = computed(() => availablePermissions.value.length)

function resetSearch() {
  leftSearchKeyword.value = ''
  rightSearchKeyword.value = ''
}

function initSelectedPermissions() {
  const assignedPermissions = assignedPermissionSnapshot.value
  selectedPermissionIds.value = assignedPermissions?.map(permission => permission.id) ?? []
  resetSearch()
}

function filterPermissions(permissions: PermissionItem[], keyword: string) {
  const normalizedKeyword = keyword.trim().toLowerCase()
  if (!normalizedKeyword) return permissions

  return permissions.filter(permission => {
    const searchableText = [
      permission.name,
      permission.description,
      permission.category,
      permission.resource,
      permission.action,
      permission.method,
      permission.path
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return searchableText.includes(normalizedKeyword)
  })
}

function permissionMeta(permission: PermissionItem) {
  return [permission.method, permission.path].filter(Boolean).join(' ')
}

function addPermission(permission: PermissionItem) {
  if (!selectedPermissionIdSet.value.has(permission.id)) {
    selectedPermissionIds.value.push(permission.id)
  }
}

function removePermission(permission: PermissionItem) {
  selectedPermissionIds.value = selectedPermissionIds.value.filter(id => id !== permission.id)
}

function clearSelected() {
  selectedPermissionIds.value = []
}

function selectAll() {
  selectedPermissionIds.value = allPermissions.value.map(permission => permission.id)
}

async function loadDialogData() {
  if (!props.app) return

  loading.value = true
  currentApplication.value = props.app
  selectedPermissionIds.value = []
  resetSearch()

  try {
    const [application, permissions] = await Promise.all([
      applicationsApiMethods.getById(props.app.id).send(),
      applicationsApiMethods.availablePermissions().send()
    ])
    currentApplication.value = application as APIApplication
    allPermissions.value = permissions as PermissionItem[]
    initSelectedPermissions()
  } catch (e: unknown) {
    ElMessage.error(`加载应用权限失败：${getSafeErrorMessage(e)}`)
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  if (!activeApplication.value) return

  if (!hasAssignedSnapshot.value && selectedPermissionIds.value.length === 0) {
    ElMessage.warning('请先选择权限，避免将应用权限覆盖为空')
    return
  }

  if (!hasAssignedSnapshot.value) {
    try {
      await ElMessageBox.confirm(
        '当前接口未返回该应用已授权权限，保存会以当前已选权限覆盖应用权限。确认继续吗？',
        '确认保存权限',
        {
          confirmButtonText: '确认保存',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
    } catch {
      return
    }
  }

  submitting.value = true

  try {
    await applicationsApiMethods
      .permissions(
        { id: activeApplication.value.id },
        { permission_ids: selectedPermissionIds.value }
      )
      .send()
    ElMessage.success(`已更新应用「${activeApplication.value.app_name}」的权限`)
    visible.value = false
    emit('success')

    if (refresh) {
      try {
        await refresh()
      } catch (e) {
        console.warn('Failed to refresh API application list:', e)
        ElMessage.warning('权限保存成功，但列表刷新失败，请手动刷新')
      }
    }
  } catch (e: unknown) {
    ElMessage.error(`保存权限失败：${getSafeErrorMessage(e)}`)
  } finally {
    submitting.value = false
  }
}

watch(
  () => props.app,
  app => {
    currentApplication.value = app
    initSelectedPermissions()
  },
  { immediate: true }
)

watch(visible, async isOpen => {
  if (!isOpen) return
  await loadDialogData()
})
</script>

<template>
  <StandardDialog
    v-model="visible"
    :title="`配置应用权限${appName ? `：${appName}` : ''}`"
    size="lg"
    :confirm-loading="submitting"
    :confirm-disabled="loading || !app"
    confirm-text="保存权限"
    confirm-icon="lucide:save"
    @confirm="handleSubmit"
  >
    <div
      v-loading="loading"
      class="permission-config"
    >
      <div class="app-summary">
        <div class="app-summary__identity">
          <AppIcon
            icon="lucide:shield-check"
            :size="18"
          />
          <div class="app-summary__text">
            <span class="app-summary__name">{{ appName || '未选择应用' }}</span>
            <code class="app-summary__id">{{ appId || '—' }}</code>
          </div>
        </div>
      </div>

      <div
        v-if="!hasAssignedSnapshot"
        class="permission-warning"
      >
        <AppIcon
          icon="ep:warning-filled"
          :size="16"
        />
        <span>当前接口未返回已授权权限快照，保存时会以右侧已选权限覆盖该应用权限。</span>
      </div>

      <div class="transfer-container">
        <div class="transfer-panel">
          <div class="transfer-panel__header">
            <span class="transfer-panel__title">
              可选权限
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
              placeholder="搜索权限标识、路径或描述"
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
              name="permission-list"
              tag="div"
              class="permission-list"
            >
              <div
                v-for="permission in filteredAvailablePermissions"
                :key="permission.id"
                class="permission-item permission-item--available"
                @click="addPermission(permission)"
              >
                <div class="permission-item__content">
                  <div class="permission-item__title-row">
                    <span class="permission-item__name">{{ permission.name }}</span>
                    <span
                      v-if="permission.method"
                      class="permission-item__method"
                    >
                      {{ permission.method }}
                    </span>
                  </div>
                  <span
                    v-if="permission.description"
                    class="permission-item__desc"
                  >
                    {{ permission.description }}
                  </span>
                  <span
                    v-if="permissionMeta(permission)"
                    class="permission-item__path"
                  >
                    {{ permissionMeta(permission) }}
                  </span>
                </div>
                <AppIcon
                  icon="ep:plus"
                  :size="16"
                  class="permission-item__icon"
                />
              </div>
            </TransitionGroup>

            <div
              v-if="filteredAvailablePermissions.length === 0 && !loading"
              class="transfer-panel__empty"
            >
              <AppIcon
                icon="ep:folder-opened"
                :size="32"
                class="transfer-panel__empty-icon"
              />
              <span>{{ leftSearchKeyword ? '无匹配权限' : '暂无可选权限' }}</span>
            </div>
          </div>
        </div>

        <div class="transfer-divider">
          <AppIcon
            icon="ep:arrow-right"
            :size="20"
          />
        </div>

        <div class="transfer-panel transfer-panel--selected">
          <div class="transfer-panel__header">
            <span class="transfer-panel__title">
              已选权限
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
              placeholder="搜索已选权限"
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
              name="permission-list"
              tag="div"
              class="permission-list"
            >
              <div
                v-for="permission in filteredSelectedPermissions"
                :key="permission.id"
                class="permission-item permission-item--selected"
                @click="removePermission(permission)"
              >
                <div class="permission-item__content">
                  <div class="permission-item__title-row">
                    <span class="permission-item__name">{{ permission.name }}</span>
                    <span
                      v-if="permission.method"
                      class="permission-item__method"
                    >
                      {{ permission.method }}
                    </span>
                  </div>
                  <span
                    v-if="permission.description"
                    class="permission-item__desc"
                  >
                    {{ permission.description }}
                  </span>
                  <span
                    v-if="permissionMeta(permission)"
                    class="permission-item__path"
                  >
                    {{ permissionMeta(permission) }}
                  </span>
                </div>
                <AppIcon
                  icon="ep:close"
                  :size="16"
                  class="permission-item__icon"
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
              <span>请从左侧选择权限</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </StandardDialog>
</template>

<style scoped>
.permission-config {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 430px;
}

.app-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
}

.app-summary__identity {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  color: var(--el-color-primary);
}

.app-summary__text {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 3px;
}

.app-summary__name {
  overflow: hidden;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-summary__id {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  word-break: break-all;
}

.permission-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--el-color-warning-dark-2);
  background: var(--el-color-warning-light-9);
  border: 1px solid var(--el-color-warning-light-7);
  border-radius: 6px;
}

.transfer-container {
  display: flex;
  gap: 0;
  height: 430px;
}

.transfer-panel {
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
  overflow: hidden;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
}

.transfer-panel--selected {
  border-color: var(--el-color-primary-light-5);
  background: linear-gradient(135deg, var(--el-color-primary-light-9) 0%, var(--el-bg-color) 100%);
}

.transfer-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--el-fill-color-light);
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.transfer-panel--selected .transfer-panel__header {
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

.transfer-panel__search {
  padding: 8px 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.transfer-panel__body {
  flex: 1;
  padding: 8px;
  overflow-y: auto;
  scrollbar-color: var(--el-border-color) transparent;
  scrollbar-width: thin;
}

.permission-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.permission-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 9px 10px;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.15s ease;
}

.permission-item--available {
  background: var(--el-fill-color-blank);
  border: 1px solid transparent;
}

.permission-item--available:hover {
  background: var(--el-fill-color-light);
  border-color: var(--el-color-primary-light-5);
}

.permission-item--selected {
  background: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary-light-7);
}

.permission-item--selected:hover {
  background: var(--el-color-primary-light-8);
  border-color: var(--el-color-primary-light-5);
}

.permission-item--available:hover .permission-item__icon {
  color: var(--el-color-primary);
  transform: scale(1.1);
}

.permission-item--selected:hover .permission-item__icon {
  color: var(--el-color-danger);
  transform: scale(1.1);
}

.permission-item__content {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 3px;
}

.permission-item__title-row {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.permission-item__name {
  overflow: hidden;
  font-family: var(--el-font-family);
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.permission-item__method {
  flex-shrink: 0;
  padding: 1px 5px;
  font-size: 11px;
  font-weight: 600;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary-light-7);
  border-radius: 4px;
}

.permission-item__desc,
.permission-item__path {
  overflow: hidden;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.permission-item__path {
  color: var(--el-text-color-placeholder);
}

.permission-item__icon {
  flex-shrink: 0;
  color: var(--el-text-color-placeholder);
  transition: all 0.15s ease;
}

.transfer-panel__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 8px;
  font-size: 13px;
  color: var(--el-text-color-placeholder);
}

.transfer-panel__empty-icon {
  opacity: 0.5;
}

.transfer-divider {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 48px;
  color: var(--el-text-color-placeholder);
}

.permission-list-enter-active,
.permission-list-leave-active {
  transition: all 0.2s ease;
}

.permission-list-enter-from {
  opacity: 0;
  transform: translateX(-10px);
}

.permission-list-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

.permission-list-move {
  transition: transform 0.2s ease;
}

@media (width < 720px) {
  .app-summary {
    align-items: stretch;
    flex-direction: column;
  }

  .transfer-container {
    flex-direction: column;
    height: auto;
  }

  .transfer-panel {
    height: 260px;
  }

  .transfer-divider {
    width: auto;
    height: 32px;
    transform: rotate(90deg);
  }
}
</style>
