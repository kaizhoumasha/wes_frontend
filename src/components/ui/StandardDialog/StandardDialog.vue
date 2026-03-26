<!--
StandardDialog - 标准对话框组件

设计理念：
- 精致极简：企业级应用标准，视觉清晰专业
- 尺寸系统：6 级预设尺寸，覆盖所有业务场景
- 响应式：自动适配桌面/平板/移动端
- 动画：优雅的入场/退场动画，方向可配置

使用示例：
```vue
<StandardDialog
  v-model="showDialog"
  size="md"
  title="创建用户"
  :confirm-loading="submitting"
  @confirm="handleSubmit"
>
  <UserForm v-model="formData" />
</StandardDialog>
```
-->

<script setup lang="ts">
import { computed, ref, watch, nextTick, useId } from 'vue'
import { useWindowSize } from '@vueuse/core'
import AppIcon from '@/components/ui/AppIcon.vue'
import AppButton from '@/components/ui/AppButton.vue'
import { cn } from '@/utils/cn'
import type {
  DialogSize,
  ConfirmButtonType,
  DialogDirection,
  StandardDialogExpose,
  TitleIconType
} from './types'
import { SIZE_CONFIG, BREAKPOINTS, DIALOG_DIMENSIONS, TITLE_ICON_CONFIG } from './constants'

// ==================== Props ====================

interface Props {
  /** 控制显示状态 */
  modelValue: boolean
  /** 对话框标题 */
  title?: string
  /** 标题图标类型 */
  titleIcon?: TitleIconType
  /** 尺寸预设 */
  size?: DialogSize
  /** 自定义宽度（覆盖 size 预设） */
  width?: string | number
  /** 是否显示关闭按钮 */
  closable?: boolean
  /** 点击遮罩是否关闭 */
  closeOnClickModal?: boolean
  /** 关闭时销毁内容 */
  destroyOnClose?: boolean
  /** 内容区滚动模式 */
  scrollable?: boolean
  /** 是否显示底部区域 */
  showFooter?: boolean
  /** 确认按钮文本 */
  confirmText?: string
  /** 确认按钮图标 */
  confirmIcon?: string
  /** 取消按钮文本 */
  cancelText?: string
  /** 确认按钮类型 */
  confirmType?: ConfirmButtonType
  /** 确认按钮加载状态 */
  confirmLoading?: boolean
  /** 确认按钮禁用状态 */
  confirmDisabled?: boolean
  /** 是否隐藏取消按钮 */
  hideCancel?: boolean
  /** 自定义类名 */
  customClass?: string
  /** 是否居中显示 */
  center?: boolean
  /** 打开时的动画方向 */
  direction?: DialogDirection
  /** 内容区最小高度（防止内容切换时高度闪烁） */
  minHeight?: string | number
  /** 自动记忆内容区最大高度（切换内容时保持稳定） */
  autoHeight?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  titleIcon: undefined,
  size: 'md',
  width: undefined,
  closable: true,
  closeOnClickModal: false,
  destroyOnClose: true,
  scrollable: true,
  showFooter: true,
  confirmText: '确定',
  confirmIcon: undefined,
  cancelText: '取消',
  confirmType: 'primary',
  confirmLoading: false,
  confirmDisabled: false,
  hideCancel: false,
  customClass: '',
  center: false,
  direction: 'rtl',
  minHeight: undefined,
  autoHeight: false
})

// ==================== Emits ====================

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
  (e: 'close'): void
  (e: 'open'): void
}>()

// ==================== 响应式尺寸计算 ====================

const { width: windowWidth } = useWindowSize()

/**
 * 计算实际宽度
 * 优先级：自定义 width > size 预设
 */
const computedWidth = computed(() => {
  // 自定义宽度优先
  if (props.width) {
    if (typeof props.width === 'number') {
      return `${props.width}px`
    }
    return props.width
  }

  // full 尺寸使用 vw
  if (props.size === 'full') {
    return `${SIZE_CONFIG.full.maxWidth}vw`
  }

  const config = SIZE_CONFIG[props.size]
  const maxWindowWidth = (windowWidth.value * config.maxWidth) / 100

  // 如果窗口宽度小于预设宽度，使用最大宽度上限
  if (windowWidth.value < BREAKPOINTS.MOBILE) {
    return '100vw'
  }

  // 使用预设宽度或最大宽度上限
  const actualWidth = Math.min(config.width, maxWindowWidth)
  return `${actualWidth}px`
})

/**
 * 计算内容区最大高度
 */
const bodyMaxHeight = computed(() => {
  const headerHeight = DIALOG_DIMENSIONS.HEADER_HEIGHT
  const footerHeight = props.showFooter ? DIALOG_DIMENSIONS.FOOTER_HEIGHT : 0
  return `calc(${DIALOG_DIMENSIONS.MAX_HEIGHT_VH}vh - ${headerHeight}px - ${footerHeight}px)`
})

/**
 * 计算内容区最小高度
 * 优先级：minHeight prop > autoHeight 记忆高度
 */
const bodyMinHeight = computed(() => {
  // 显式设置的 minHeight 优先
  if (props.minHeight) {
    if (typeof props.minHeight === 'number') {
      return `${props.minHeight}px`
    }
    return props.minHeight
  }

  // 自动记忆高度
  if (props.autoHeight && rememberedHeight.value > 0) {
    return `${rememberedHeight.value}px`
  }

  return undefined
})

// ==================== 内部状态 ====================

const dialogRef = ref<HTMLDivElement | null>(null)
const bodyRef = ref<HTMLDivElement | null>(null)
const overlayRef = ref<HTMLDivElement | null>(null)
const contentRendered = ref(props.modelValue || !props.destroyOnClose)

// 自动记忆高度
const rememberedHeight = ref(0)
let resizeObserver: ResizeObserver | null = null

// 生成唯一 ID 用于 ARIA
const titleId = useId()
const descriptionId = useId()

// ==================== 生命周期 ====================

watch(
  () => props.modelValue,
  async isOpen => {
    if (isOpen) {
      if (props.destroyOnClose) {
        contentRendered.value = true
      }
      await nextTick()
      emit('open')
      // 焦点管理：打开时聚焦内容区
      focusFirstElement()
      // 自动高度记忆：启动监听
      if (props.autoHeight) {
        startHeightObserver()
      }
    } else {
      emit('close')
      // 停止高度监听
      stopHeightObserver()
      // 重置记忆高度
      rememberedHeight.value = 0
      if (props.destroyOnClose) {
        // 延迟销毁，等待动画完成
        setTimeout(() => {
          contentRendered.value = false
        }, 200)
      }
    }
  }
)

// ==================== 方法 ====================

/** 打开对话框 */
function open() {
  emit('update:modelValue', true)
}

/** 关闭对话框 */
function close() {
  emit('update:modelValue', false)
}

/** 获取内容区 DOM */
function getBodyElement(): HTMLElement | null {
  return bodyRef.value
}

/** 聚焦第一个可聚焦元素 */
function focusFirstElement() {
  nextTick(() => {
    // 先聚焦 overlay 以捕获键盘事件
    overlayRef.value?.focus()

    // 然后尝试聚焦内容区的第一个可聚焦元素
    const focusable = bodyRef.value?.querySelector<HTMLElement>(
      'input, textarea, select, button, [tabindex]:not([tabindex="-1"])'
    )
    focusable?.focus()
  })
}

/** 启动高度监听器 */
function startHeightObserver() {
  if (!bodyRef.value || resizeObserver) return

  resizeObserver = new ResizeObserver(entries => {
    for (const entry of entries) {
      const height = entry.contentRect.height
      // 只记录更大的高度
      if (height > rememberedHeight.value) {
        rememberedHeight.value = height
      }
    }
  })

  resizeObserver.observe(bodyRef.value)
}

/** 停止高度监听器 */
function stopHeightObserver() {
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
}

/** 处理确认 */
function handleConfirm() {
  emit('confirm')
}

/** 处理取消 */
function handleCancel() {
  emit('cancel')
  close()
}

/** 处理遮罩点击 */
function handleOverlayClick() {
  if (props.closeOnClickModal) {
    close()
  }
}

/** 处理键盘事件 */
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.closable) {
    e.preventDefault()
    e.stopPropagation()
    close()
  }
}

// ==================== Expose ====================

defineExpose<StandardDialogExpose>({
  open,
  close,
  getBodyElement
})
</script>

<template>
  <!-- 遮罩层 + 对话框容器 -->
  <Teleport to="body">
    <Transition name="dialog-overlay">
      <div
        v-if="modelValue"
        ref="overlayRef"
        class="standard-dialog-overlay"
        tabindex="-1"
        @click.self="handleOverlayClick"
        @keydown.capture="handleKeydown"
      >
        <!-- 对话框主体 -->
        <Transition
          :name="`dialog-slide-${direction}`"
          appear
        >
          <div
            v-if="modelValue"
            ref="dialogRef"
            :class="[
              'standard-dialog',
              `standard-dialog--${size}`,
              {
                'standard-dialog--center': center,
                'standard-dialog--no-footer': !showFooter
              },
              customClass
            ]"
            role="dialog"
            aria-modal="true"
            :aria-labelledby="titleId"
            :aria-describedby="descriptionId"
            :style="{ width: computedWidth }"
            @keydown.capture="handleKeydown"
          >
            <!-- ==================== Header ==================== -->
            <header class="standard-dialog__header">
              <slot name="header">
                <h2
                  :id="titleId"
                  class="standard-dialog__header-title"
                >
                  <AppIcon
                    v-if="titleIcon"
                    :icon="TITLE_ICON_CONFIG[titleIcon].icon"
                    :size="20"
                    :class="cn(TITLE_ICON_CONFIG[titleIcon].class, 'mr-2')"
                  />
                  {{ title }}
                </h2>
              </slot>

              <button
                v-if="closable"
                type="button"
                class="standard-dialog__header-close"
                aria-label="关闭对话框"
                @click="close"
              >
                <AppIcon
                  icon="ep:close"
                  :size="18"
                />
              </button>
            </header>

            <!-- ==================== Body ==================== -->
            <div
              v-if="contentRendered"
              :id="descriptionId"
              ref="bodyRef"
              :class="[
                'standard-dialog__body',
                { 'standard-dialog__body--scrollable': scrollable }
              ]"
              :style="{ maxHeight: bodyMaxHeight, minHeight: bodyMinHeight }"
            >
              <slot />
            </div>

            <!-- ==================== Footer ==================== -->
            <footer
              v-if="showFooter"
              class="standard-dialog__footer"
            >
              <!-- 左侧插槽 -->
              <div class="standard-dialog__footer-left">
                <slot name="footer-left" />
              </div>

              <!-- 自定义 footer 插槽 -->
              <slot name="footer">
                <!-- 默认按钮组 -->
                <div class="standard-dialog__footer-actions">
                  <AppButton
                    v-if="!hideCancel"
                    @click="handleCancel"
                  >
                    {{ cancelText }}
                  </AppButton>

                  <AppButton
                    :type="confirmType"
                    :icon="confirmIcon"
                    :loading="confirmLoading"
                    :disabled="confirmDisabled"
                    preserve-icon-space
                    @click="handleConfirm"
                  >
                    {{ confirmText }}
                  </AppButton>
                </div>
              </slot>
            </footer>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ==================== 遮罩层 ==================== */
.standard-dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--dialog-overlay-bg);
  backdrop-filter: blur(2px);
}

/* ==================== 对话框主体 ==================== */
.standard-dialog {
  position: relative;
  display: flex;
  flex-direction: column;
  max-height: 85vh;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  box-shadow: var(--dialog-shadow);
  outline: none;
}

.standard-dialog--center {
  text-align: center;
}

.standard-dialog--center .standard-dialog__footer {
  justify-content: center;
}

/* ==================== Header ==================== */
.standard-dialog__header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  height: var(--dialog-header-height);
  padding: 0 20px;
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-light);
  border-radius: 12px 12px 0 0;
}

.standard-dialog__header-title {
  display: flex;
  align-items: center;
  margin: 0;
  overflow: hidden;
  font-size: var(--el-font-size-medium, 16px);
  font-weight: 600;
  color: var(--el-text-color-primary);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.standard-dialog__header-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--dialog-close-size);
  height: var(--dialog-close-size);
  padding: 0;
  color: var(--el-text-color-secondary);
  cursor: pointer;
  background: transparent;
  border: none;
  border-radius: 4px;
  transition: all 0.15s ease;
}

.standard-dialog__header-close:hover {
  background: var(--el-fill-color-light);
  color: var(--el-text-color-primary);
}

.standard-dialog__header-close:active {
  transform: scale(0.95);
}

/* ==================== Body ==================== */
.standard-dialog__body {
  flex: 1;
  padding: var(--dialog-body-padding-lg);
  overflow: auto;
  background: var(--el-bg-color);
  transition: height 0.15s ease-out;
}

/* 尺寸响应式内边距 */
.standard-dialog--md .standard-dialog__body {
  padding: var(--dialog-body-padding-md);
}

.standard-dialog--xs .standard-dialog__body,
.standard-dialog--sm .standard-dialog__body {
  padding: var(--dialog-body-padding-sm);
}

.standard-dialog__body--scrollable {
  scrollbar-width: thin;
  scrollbar-color: var(--el-border-color) transparent;
}

.standard-dialog__body--scrollable::-webkit-scrollbar {
  width: 6px;
}

.standard-dialog__body--scrollable::-webkit-scrollbar-track {
  background: transparent;
}

.standard-dialog__body--scrollable::-webkit-scrollbar-thumb {
  background: var(--el-border-color);
  border-radius: 3px;
}

.standard-dialog__body--scrollable::-webkit-scrollbar-thumb:hover {
  background: var(--el-border-color-dark);
}

/* ==================== Footer ==================== */
.standard-dialog__footer {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: flex-end;
  gap: var(--dialog-footer-gap);
  height: var(--dialog-footer-height);
  padding: 0 20px;
  background: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color-light);
  border-radius: 0 0 12px 12px;
}

.standard-dialog__footer-left {
  display: flex;
  align-items: center;
  margin-right: auto;
}

.standard-dialog__footer-actions {
  display: flex;
  gap: var(--dialog-footer-gap);
}

.standard-dialog__footer-actions :deep(.el-button) {
  min-width: var(--dialog-footer-btn-min-width);
}

/* 主按钮 hover 增强 */
.standard-dialog__footer-actions :deep(.el-button--primary:hover) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgb(64 158 255 / 30%);
}

/* 危险按钮 */
.standard-dialog__footer-actions :deep(.el-button--danger:hover) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgb(245 108 108 / 30%);
}

/* ==================== 遮罩层动画 ==================== */
.dialog-overlay-enter-active {
  animation: overlay-fade-in 150ms ease-out;
}

.dialog-overlay-leave-active {
  animation: overlay-fade-out 150ms ease-in;
}

@keyframes overlay-fade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes overlay-fade-out {
  from {
    opacity: 1;
  }

  to {
    opacity: 0;
  }
}

/* ==================== 对话框退场动画 ==================== */
.dialog-slide-rtl-leave-active,
.dialog-slide-ltr-leave-active,
.dialog-slide-ttb-leave-active,
.dialog-slide-btt-leave-active {
  animation: dialog-fade-out 200ms ease-in;
}

@keyframes dialog-fade-out {
  from {
    opacity: 1;
    transform: scale(1);
  }

  to {
    opacity: 0;
    transform: scale(0.98);
  }
}

/* ==================== 方向动画 ==================== */

/* 从右侧 */
.dialog-slide-rtl-enter-active {
  animation: dialog-slide-right 250ms cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes dialog-slide-right {
  from {
    opacity: 0;
    transform: translateX(20px) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

/* 方向动画：从左侧 */
.dialog-slide-ltr-enter-active {
  animation: dialog-slide-left 250ms cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes dialog-slide-left {
  from {
    opacity: 0;
    transform: translateX(-20px) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

/* 方向动画：从顶部 */
.dialog-slide-ttb-enter-active {
  animation: dialog-slide-top 250ms cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes dialog-slide-top {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 方向动画：从底部 */
.dialog-slide-btt-enter-active {
  animation: dialog-slide-bottom 250ms cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes dialog-slide-bottom {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* ==================== 移动端适配 ==================== */
@media (width < 768px) {
  .standard-dialog {
    max-height: 100vh;
    border-radius: 0;
  }

  .standard-dialog__header {
    border-radius: 0;
  }

  .standard-dialog__footer {
    border-radius: 0;
  }

  .standard-dialog-overlay {
    align-items: flex-end;
  }
}

/* ==================== 平板适配 ==================== */
@media (width >= 768px) and (width < 1280px) {
  .standard-dialog {
    max-width: 90vw;
  }
}
</style>
