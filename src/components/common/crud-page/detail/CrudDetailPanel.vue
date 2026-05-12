<script setup lang="ts" generic="TItem extends CrudPageEntity">
/**
 * CRUD Detail Panel
 *
 * Main component for displaying entity details in a drawer/dialog.
 * Supports responsive behavior, sections, and custom actions.
 */
import { computed, watch, ref, nextTick } from 'vue'
import { ElDialog } from 'element-plus'
import { StandardDrawer } from '@/components/ui/StandardDrawer'
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
const drawerPanelClass = computed(() => ({
  'detail-panel': true,
  'detail-panel--drawer': true,
  'detail-panel--fullscreen': responsive.isFullscreen.value
}))
const detailEyebrow = computed(() => {
  const entityTypeLabel = props.config?.entityTypeLabel

  if (!internalItem.value?.id) {
    return entityTypeLabel ?? '详情'
  }

  return `#${internalItem.value.id}${entityTypeLabel ? ` · ${entityTypeLabel}` : ''}`
})

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

// ==================== Focus Management & Keyboard Navigation ====================

const panelRef = ref<HTMLElement | null>(null)
const titleId = computed(() => `detail-panel-title-${Date.now()}`)

// Store the element that triggered the panel open
let triggerElement: HTMLElement | null = null

// Watch for open state to manage focus
watch(internalOpen, isOpen => {
  if (isOpen) {
    // Store the currently focused element before opening
    triggerElement = document.activeElement as HTMLElement
  } else {
    // Return focus to the trigger element when closing
    nextTick(() => {
      triggerElement?.focus()
      triggerElement = null
    })
  }
})

/**
 * Handle keyboard events for accessibility
 */
function handleKeydown(event: KeyboardEvent): void {
  // Escape is handled by ElDrawer/ElDialog natively

  // Tab key - ensure focus stays within the panel
  if (event.key === 'Tab' && panelRef.value) {
    const focusableElements = panelRef.value.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault()
      lastElement?.focus()
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault()
      firstElement?.focus()
    }
  }
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
  <StandardDrawer
    v-if="responsive.resolvedMode.value === 'drawer'"
    ref="panelRef"
    v-model="internalOpen"
    :size="responsive.resolvedDrawerSize.value"
    :width="responsive.resolvedDrawerWidth.value"
    body-padding="none"
    direction="rtl"
    :close-on-click-modal="true"
    :close-on-press-escape="true"
    role="dialog"
    :aria-labelledby="titleId"
    :custom-class="drawerPanelClass"
    @close="handleClose"
    @keydown="handleKeydown"
  >
    <template #header>
      <div class="detail-panel__hero">
        <span class="detail-panel__eyebrow">{{ detailEyebrow }}</span>
        <div class="detail-panel__title-row">
          <h2
            :id="titleId"
            class="detail-panel__title"
          >
            {{ title }}
          </h2>
        </div>
      </div>
    </template>

    <CrudDetailBody
      :loading="internalLoading"
      :error="internalError"
      :item="internalItem"
      :sections="sections"
      :empty-value="emptyValue"
      :is-section-collapsed="isSectionCollapsed"
      :on-toggle-collapse="handleToggleCollapse"
      :on-refresh="handleRefresh"
      @close="handleClose"
    />

    <template #footer>
      <CrudDetailActions
        v-if="showActions && internalItem && !internalLoading && !internalError"
        :actions="actions"
        :item="internalItem"
        @action-complete="handleRefresh"
        @close="handleClose"
      />
    </template>
  </StandardDrawer>

  <!-- Dialog Mode (Mobile Fullscreen) -->
  <ElDialog
    v-else
    ref="panelRef"
    v-model="internalOpen"
    :width="responsive.resolvedWidth.value"
    :fullscreen="responsive.isFullscreen.value"
    :close-on-click-modal="true"
    :close-on-press-escape="true"
    role="dialog"
    :aria-labelledby="titleId"
    class="detail-panel detail-panel--dialog"
    :class="{
      'detail-panel--fullscreen': responsive.isFullscreen.value
    }"
    @close="handleClose"
    @keydown="handleKeydown"
  >
    <template #header>
      <div class="detail-panel__hero detail-panel__hero--dialog">
        <span class="detail-panel__eyebrow">{{ detailEyebrow }}</span>
        <div class="detail-panel__title-row">
          <h2
            :id="titleId"
            class="detail-panel__title"
          >
            {{ title }}
          </h2>
        </div>
      </div>
    </template>

    <CrudDetailBody
      :loading="internalLoading"
      :error="internalError"
      :item="internalItem"
      :sections="sections"
      :empty-value="emptyValue"
      :is-section-collapsed="isSectionCollapsed"
      :on-toggle-collapse="handleToggleCollapse"
      :on-refresh="handleRefresh"
      @close="handleClose"
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
/* ============================================
   Editorial Detail Panel
   使用项目 CSS 变量，保持主题一致性
   ============================================ */

.detail-panel__hero {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}

.detail-panel__hero--dialog {
  padding-right: 28px;
}

/* Eyebrow */
.detail-panel__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: 'SF Mono', 'Fira Code', ui-monospace, monospace;
  font-size: 12px;
  line-height: 1.4;
  color: var(--el-text-color-secondary);
  font-weight: 500;
  letter-spacing: 0.01em;
}

.detail-panel__eyebrow::before {
  content: '';
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--el-color-primary);
}

.detail-panel__title-row {
  display: flex;
  align-items: flex-start;
}

/* Title */
.detail-panel__title {
  margin: 0;
  font-size: clamp(22px, 2.6vw, 28px);
  line-height: 1.2;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--el-text-color-primary);
}

/* Dialog mode styling */
.detail-panel--dialog :deep(.el-dialog__header) {
  margin-right: 0;
  padding: 24px 24px 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
}

.detail-panel--dialog :deep(.el-dialog__body) {
  padding: 0;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
  background: var(--el-bg-color-page);
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
  animation: fadeSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) backwards;
}

.detail-panel :deep(.detail-section:nth-child(1)) {
  animation-delay: 0ms;
}

.detail-panel :deep(.detail-section:nth-child(2)) {
  animation-delay: 80ms;
}

.detail-panel :deep(.detail-section:nth-child(3)) {
  animation-delay: 160ms;
}

.detail-panel :deep(.detail-section:nth-child(4)) {
  animation-delay: 220ms;
}

.detail-panel :deep(.detail-section:nth-child(5)) {
  animation-delay: 280ms;
}

@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Mobile optimization */
@media (width <= 767px) {
  .detail-panel__title {
    font-size: 24px;
  }

  .detail-panel--dialog :deep(.el-dialog__header) {
    padding: 20px 16px 16px;
  }
}
</style>
