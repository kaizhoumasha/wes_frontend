<script setup lang="ts" generic="TItem extends CrudPageEntity">
/**
 * CRUD Detail Actions Bar
 *
 * Renders action buttons at the bottom of the detail panel.
 * Supports popconfirm for destructive actions and loading states.
 */
import { computed, ref } from 'vue'
import { ElButton, ElPopconfirm, ElMessage } from 'element-plus'
import type { CrudPageEntity } from '../types'
import type { CrudPageDetailAction } from './types'

interface Props {
  /** Action configurations */
  actions: CrudPageDetailAction<TItem>[]
  /** Entity data */
  item: TItem
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'action-complete', actionKey: string): void
  (e: 'close'): void
}>()

const visibleActions = computed(() => {
  return props.actions.filter(action => !action.showWhen || action.showWhen(props.item))
})

// ==================== Action Execution ====================

const loadingStates = ref<Map<string, boolean>>(new Map())

/**
 * Check if action is loading
 */
function isLoading(actionKey: string): boolean {
  return loadingStates.value.get(actionKey) ?? false
}

/**
 * Execute an action
 */
async function executeAction(action: CrudPageDetailAction<TItem>): Promise<void> {
  if (isLoading(action.key)) {
    return
  }

  loadingStates.value.set(action.key, true)

  try {
    await action.onClick(props.item)

    // Show success message
    if (action.success?.message) {
      ElMessage.success(action.success.message)
    }

    // Auto close panel
    if (action.success?.autoClose) {
      setTimeout(() => {
        emit('close')
      }, action.success.autoCloseDelay ?? 500)
    }

    emit('action-complete', action.key)
  } catch (error) {
    const message = error instanceof Error ? error.message : '操作失败'
    ElMessage.error(message)
  } finally {
    loadingStates.value.delete(action.key)
  }
}

/**
 * Handle button click (non-popconfirm actions)
 */
function handleActionClick(action: CrudPageDetailAction<TItem>): void {
  if (action.popconfirm) {
    // Popconfirm will handle the action
    return
  }
  void executeAction(action)
}

/**
 * Handle popconfirm confirm
 */
function handlePopconfirmConfirm(action: CrudPageDetailAction<TItem>): void {
  void executeAction(action)
}

// ==================== Button Styling ====================

/**
 * Get button type for action
 */
function getButtonType(
  action: CrudPageDetailAction<TItem>
): 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default' {
  return action.type ?? 'default'
}

/**
 * Check if action is disabled
 */
function isActionDisabled(action: CrudPageDetailAction<TItem>): boolean {
  if (typeof action.disabled === 'function') {
    return action.disabled(props.item)
  }
  return action.disabled ?? false
}
</script>

<template>
  <div
    v-if="visibleActions.length > 0"
    class="detail-actions"
  >
    <div class="detail-actions__content">
      <!-- Actions -->
      <template
        v-for="action in visibleActions"
        :key="action.key"
      >
        <!-- Action with Popconfirm -->
        <ElPopconfirm
          v-if="action.popconfirm"
          :title="action.popconfirm.title"
          :confirm-button-text="action.popconfirm.confirmButtonText ?? '确认'"
          :cancel-button-text="action.popconfirm.cancelButtonText ?? '取消'"
          :confirm-button-type="action.popconfirm.confirmButtonType ?? 'primary'"
          :width="action.popconfirm.width ?? 260"
          @confirm="handlePopconfirmConfirm(action)"
        >
          <template #reference>
            <ElButton
              :type="getButtonType(action)"
              :loading="isLoading(action.key)"
              :disabled="isActionDisabled(action)"
              :icon="action.icon"
            >
              {{ action.label }}
            </ElButton>
          </template>
        </ElPopconfirm>

        <!-- Action without Popconfirm -->
        <ElButton
          v-else
          :type="getButtonType(action)"
          :loading="isLoading(action.key)"
          :disabled="isActionDisabled(action)"
          :icon="action.icon"
          @click="handleActionClick(action)"
        >
          {{ action.label }}
        </ElButton>
      </template>

      <!-- Close Button -->
      <ElButton @click="emit('close')">关闭</ElButton>
    </div>
  </div>
</template>

<style scoped>
/* ============================================
   Editorial Detail Actions
   使用项目 CSS 变量，保持主题一致性
   ============================================ */

.detail-actions {
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 20px 20px;
  border-top: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
  z-index: 10;
}

.detail-actions__content {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
}

.detail-actions__content :deep(.el-button) {
  min-width: 88px;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.detail-actions__content :deep(.el-button:hover) {
  transform: translateY(-1px);
}

.detail-actions__content :deep(.el-button:active) {
  transform: translateY(0);
}

/* Primary button accent */
.detail-actions__content :deep(.el-button--primary) {
  box-shadow: 0 2px 8px rgb(var(--el-color-primary-rgb) / 30%);
}

/* Danger button styling */
.detail-actions__content :deep(.el-button--danger) {
  box-shadow: 0 2px 8px rgb(var(--el-color-danger-rgb) / 20%);
}

:global(.standard-drawer__footer .detail-actions) {
  position: static;
  inset: auto;
  width: 100%;
  padding: 0;
  border-top: 0;
  background: transparent;
  z-index: auto;
}

/* Mobile optimization */
@media (width <= 767px) {
  .detail-actions {
    padding: 14px 16px 16px;
  }

  .detail-actions__content {
    justify-content: stretch;
  }

  .detail-actions__content :deep(.el-button) {
    flex: 1;
    min-height: 46px;
    font-size: 15px;
  }

  .detail-actions__content :deep(.el-button:hover) {
    transform: none;
  }
}
</style>
