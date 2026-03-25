<script setup lang="ts" generic="TItem extends CrudPageEntity">
/**
 * CRUD Detail Panel
 *
 * Main component for displaying entity details in a drawer/dialog.
 * Supports responsive behavior, sections, and custom actions.
 */
import { computed, watch } from 'vue'
import { ElDrawer, ElDialog } from 'element-plus'
import type { CrudPageEntity } from '../types'
import { DEFAULT_EMPTY_VALUE, type CrudPageDetailConfig, type CrudPageDetailSection } from './types'
import { useDetailState } from './composables/useDetailState'
import { useDetailResponsive } from './composables/useDetailResponsive'
import CrudDetailBody from './CrudDetailBody.vue'
import CrudDetailActions from './CrudDetailActions.vue'

// ==================== Props & Emits ====================

interface Props {
  /** Detail panel configuration */
  config?: CrudPageDetailConfig<TItem>
  /** API fetcher for loading item by ID */
  fetcher?: (id: number) => Promise<TItem>
  /** External control: open state */
  open?: boolean
  /** External control: current item */
  item?: TItem | null
  /** External control: loading state */
  loading?: boolean
  /** External control: error state */
  error?: Error | null
}

const props = withDefaults(defineProps<Props>(), {
  config: undefined,
  fetcher: undefined,
  open: undefined,
  item: undefined,
  loading: undefined,
  error: undefined
})

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'close'): void
  (e: 'refresh'): void
}>()

// ==================== State Management ====================

const detailState = useDetailState<TItem>()
const responsive = useDetailResponsive(props.config)

// Determine control mode (controlled vs uncontrolled)
const isControlled = computed(() => props.open !== undefined)

// Internal state
const internalOpen = computed({
  get: () => (isControlled.value ? props.open! : detailState.open.value),
  set: value => {
    if (isControlled.value) {
      emit('update:open', value)
    } else {
      detailState.open.value = value
    }
  }
})

const internalItem = computed(() => {
  if (isControlled.value) {
    return props.item ?? null
  }
  return detailState.item.value
})

const internalLoading = computed(() => {
  if (isControlled.value && props.loading !== undefined) {
    return props.loading
  }
  return detailState.loading.value
})

const internalError = computed(() => {
  if (isControlled.value) {
    return props.error ?? null
  }
  return detailState.error.value
})

// ==================== Configuration ====================

const emptyValue = computed(() => ({
  ...DEFAULT_EMPTY_VALUE,
  ...props.config?.emptyValue
}))

const usePrimarySectionsOnlyOnMobile = computed(() => {
  return responsive.isMobile.value && props.config?.responsive?.mobile?.sections === 'primaryOnly'
})

// ==================== Title Resolution ====================

const title = computed(() => {
  if (!internalItem.value) {
    return '详情'
  }

  if (typeof props.config?.title === 'function') {
    return props.config.title(internalItem.value)
  }

  return props.config?.title ?? '详情'
})

// ==================== Sections ====================

const sections = computed<CrudPageDetailSection<TItem>[]>(() => {
  const allSections = props.config?.sections ?? []

  if (usePrimarySectionsOnlyOnMobile.value) {
    return allSections.filter(s => s.weight === 'primary' || s.weight === undefined)
  }

  return allSections
})

// ==================== Actions ====================

const actions = computed(() => props.config?.actions ?? [])
const showActions = computed(() => props.config?.showActions ?? false)

// ==================== Collapse State ====================

watch(
  () => sections.value,
  newSections => {
    detailState.initCollapseStates(newSections)
  },
  { immediate: true }
)

function handleToggleCollapse(section: CrudPageDetailSection<TItem>): void {
  detailState.toggleSectionCollapse(section)
}

function isSectionCollapsed(section: CrudPageDetailSection<TItem>): boolean {
  return detailState.isSectionCollapsed(section)
}

// ==================== Panel Control ====================

function handleClose(): void {
  internalOpen.value = false
  emit('close')
}

function handleRefresh(): void {
  if (!isControlled.value && props.fetcher && internalItem.value?.id) {
    void detailState.refreshDetail(props.fetcher)
  }
  emit('refresh')
}

// ==================== Public Methods ====================

/**
 * Open panel with item (for uncontrolled mode)
 */
function openWithItem(item: TItem): void {
  detailState.openDetail(item)
}

/**
 * Open panel and fetch by ID (for uncontrolled mode)
 */
async function openWithId(id: number): Promise<void> {
  if (props.fetcher) {
    await detailState.openDetailById(id, props.fetcher)
  }
}

/**
 * Close panel
 */
function close(): void {
  handleClose()
}

// Expose methods for parent component
defineExpose({
  openWithItem,
  openWithId,
  close,
  refresh: handleRefresh
})
</script>

<template>
  <!-- Drawer Mode (Desktop/Tablet) -->
  <ElDrawer
    v-if="responsive.resolvedMode.value === 'drawer'"
    v-model="internalOpen"
    :title="title"
    :size="responsive.resolvedWidth.value"
    direction="rtl"
    :close-on-click-modal="true"
    :close-on-press-escape="true"
    class="detail-panel detail-panel--drawer"
    :class="{
      'detail-panel--fullscreen': responsive.isFullscreen.value
    }"
    @close="handleClose"
  >
    <CrudDetailBody
      :loading="internalLoading"
      :error="internalError"
      :item="internalItem"
      :sections="sections"
      :empty-value="emptyValue"
      :is-section-collapsed="isSectionCollapsed"
      :on-toggle-collapse="handleToggleCollapse"
      :on-refresh="handleRefresh"
    />

    <CrudDetailActions
      v-if="showActions && internalItem && !internalLoading && !internalError"
      :actions="actions"
      :item="internalItem"
      @action-complete="handleRefresh"
      @close="handleClose"
    />
  </ElDrawer>

  <!-- Dialog Mode (Mobile Fullscreen) -->
  <ElDialog
    v-else
    v-model="internalOpen"
    :title="title"
    :width="responsive.resolvedWidth.value"
    :fullscreen="responsive.isFullscreen.value"
    :close-on-click-modal="true"
    :close-on-press-escape="true"
    class="detail-panel detail-panel--dialog"
    :class="{
      'detail-panel--fullscreen': responsive.isFullscreen.value
    }"
    @close="handleClose"
  >
    <CrudDetailBody
      :loading="internalLoading"
      :error="internalError"
      :item="internalItem"
      :sections="sections"
      :empty-value="emptyValue"
      :is-section-collapsed="isSectionCollapsed"
      :on-toggle-collapse="handleToggleCollapse"
      :on-refresh="handleRefresh"
    />

    <!-- Actions Bar -->
    <template #footer>
      <CrudDetailActions
        v-if="showActions && internalItem && !internalLoading && !internalError"
        :actions="actions"
        :item="internalItem"
        @action-complete="handleRefresh"
        @close="handleClose"
      />
    </template>
  </ElDialog>
</template>

<style scoped>
.detail-panel__content {
  padding: 0 0 80px;
  overflow-y: auto;
}

.detail-panel__loading {
  padding: 24px;
}

.detail-panel__error {
  padding: 16px;
}

/* Drawer mode styling */
.detail-panel--drawer :deep(.el-drawer__header) {
  margin-bottom: 0;
  padding: 16px 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.detail-panel--drawer :deep(.el-drawer__body) {
  padding: 0;
  overflow: visible;
}

/* Dialog mode styling */
.detail-panel--dialog :deep(.el-dialog__header) {
  margin-right: 0;
  padding: 16px 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.detail-panel--dialog :deep(.el-dialog__body) {
  padding: 0;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.detail-panel--dialog :deep(.el-dialog__footer) {
  padding: 0;
  border-top: 1px solid var(--el-border-color-lighter);
}

/* Fullscreen mode */
.detail-panel--fullscreen :deep(.el-dialog) {
  margin: 0;
  border-radius: 0;
}

.detail-panel--fullscreen :deep(.el-dialog__body) {
  max-height: calc(100vh - 120px);
}

/* Animation */
.detail-panel :deep(.detail-section) {
  animation: slideInUp 0.3s ease-out backwards;
}

.detail-panel :deep(.detail-section:nth-child(1)) {
  animation-delay: 0ms;
}

.detail-panel :deep(.detail-section:nth-child(2)) {
  animation-delay: 60ms;
}

.detail-panel :deep(.detail-section:nth-child(3)) {
  animation-delay: 120ms;
}

.detail-panel :deep(.detail-section:nth-child(4)) {
  animation-delay: 180ms;
}

.detail-panel :deep(.detail-section:nth-child(5)) {
  animation-delay: 240ms;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Mobile optimization */
@media (width <= 767px) {
  .detail-panel__content {
    padding: 0 0 100px;
  }
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .detail-panel--drawer :deep(.el-drawer__header),
  .detail-panel--dialog :deep(.el-dialog__header) {
    border-bottom-color: var(--el-border-color);
  }

  .detail-panel--dialog :deep(.el-dialog__footer) {
    border-top-color: var(--el-border-color);
  }
}
</style>
