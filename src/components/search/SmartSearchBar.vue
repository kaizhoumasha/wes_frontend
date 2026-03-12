<!--
智能搜索框组件

高频搜索入口，支持条件标签显示、输入、Popover 打开、高级搜索等功能。
-->
<template>
  <!-- Popover 面板 - 包裹整个搜索框，正确定位 -->
  <el-popover
    :visible="popoverVisible"
    trigger="contextmenu"
    :show-arrow="true"
    placement="bottom-start"
    popper-class="smart-search-popover"
    :width="searchBarWidth"
    @update:visible="handlePopoverVisibleChange"
  >
    <template #reference>
      <div
        ref="searchBarRef"
        class="smart-search-bar"
        :class="{ 'smart-search-bar--focused': isFocused }"
        @click="handleContainerClick"
      >
        <!-- 条件标签区域 -->
        <div class="smart-search-bar__tags">
          <SearchConditionTag
            v-for="condition in conditions"
            :key="condition.id"
            :condition="condition"
            :selected="condition.id === selectedConditionId"
            @remove="handleRemoveCondition"
          />
        </div>

        <!-- 输入区域 -->
        <div class="smart-search-bar__input-wrapper">
          <input
            ref="inputRef"
            v-model="keywordValue"
            type="text"
            class="smart-search-bar__input"
            :placeholder="placeholder"
            @focus="handleFocus"
            @blur="handleBlur"
            @keydown.stop="handleKeyDown"
            @compositionstart="handleCompositionStart"
            @compositionend="handleCompositionEnd"
          />
        </div>

        <el-button
          class="smart-search-bar__toggle"
          text
          @click.stop="handleTogglePopover"
        >
          <el-icon><ArrowDown /></el-icon>
        </el-button>

        <!-- 清空按钮 -->
        <el-button
          v-if="hasConditions || keyword"
          class="smart-search-bar__clear"
          text
          @click.stop="handleClear"
        >
          <el-icon><CircleClose /></el-icon>
        </el-button>

        <!-- 高级搜索按钮 -->
        <el-button
          class="smart-search-bar__advanced"
          @click.stop="handleOpenAdvanced"
        >
          <el-icon><Setting /></el-icon>
          <span>高级搜索</span>
        </el-button>
      </div>
    </template>

    <SearchPopoverPanel
      :fields="fields"
      :active-field="activeField"
      :keyword="keyword"
      :quick-presets="quickPresets"
      :favorites="favorites"
      :container-width="searchBarWidth"
      @activate-field="handleActivateField"
      @apply-preset="handleApplyPreset"
      @apply-favorite="handleApplyFavorite"
    />
  </el-popover>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useElementSize } from '@vueuse/core'

import { ArrowDown, CircleClose, Setting } from '@element-plus/icons-vue'

import type { SearchCondition, SearchFavorite, SearchFieldDef } from '@/types/search'
import type { QuickSearchPreset } from '@/types/search'
import SearchConditionTag from './SearchConditionTag.vue'
import SearchPopoverPanel from './SearchPopoverPanel.vue'

// ==================== 类型定义 ====================

interface Props {
  /** 搜索条件列表 */
  conditions: SearchCondition[]
  /** 关键字 */
  keyword: string
  /** 当前高亮字段 */
  activeField?: string
  /** 可搜索字段列表 */
  fields: SearchFieldDef[]
  /** 收藏夹列表 */
  favorites: SearchFavorite[]
  /** 快速搜索预设 */
  quickPresets: QuickSearchPreset[]
  /** 占位符 */
  placeholder?: string
  /** 是否加载中 */
  loading?: boolean
  /** Popover 是否打开（外部控制） */
  popoverOpen?: boolean
}

interface Emits {
  /** 更新关键字 */
  (e: 'update:keyword', value: string): void
  /** 删除条件 */
  (e: 'remove-condition', id: string): void
  /** 打开 Popover */
  (e: 'open-popover'): void
  /** 关闭 Popover */
  (e: 'close-popover'): void
  /** 打开高级搜索 */
  (e: 'open-advanced'): void
  /** 清空 */
  (e: 'clear'): void
  /** 选择字段 */
  (e: 'select-field', fieldKey: string): void
  /** 应用快速预设 */
  (e: 'apply-preset', presetId: string): void
  /** 应用收藏夹 */
  (e: 'apply-favorite', favoriteId: string): void
  /** 键盘导航 - 下一个字段 */
  (e: 'keydown-next'): void
  /** 键盘导航 - 上一个字段 */
  (e: 'keydown-prev'): void
  /** 触发搜索 */
  (e: 'search'): void
  /** 根据字段点击执行搜索或打开高级搜索 */
  (e: 'activate-field', fieldKey: string): void
  /** 请求按字段打开高级搜索 */
  (e: 'open-advanced-for-field', fieldKey: string): void
  /** 切换 Popover */
  (e: 'toggle-popover'): void
}

// ==================== Props & Emits ====================

const props = withDefaults(defineProps<Props>(), {
  placeholder: '搜索...',
  loading: false,
  activeField: undefined,
  popoverOpen: false
})

const emit = defineEmits<Emits>()

// ==================== 状态 ====================

const inputRef = ref<HTMLInputElement>()
const searchBarRef = ref<HTMLDivElement>()
const isFocused = ref(false)
const isComposing = ref(false)
const selectedConditionId = ref<string>()
const manualToggle = ref(false) // 标记用户是否手动切换过 popover
const expectedPopoverOpen = ref(false) // 跟踪 popover 的期望状态，避免重复触发
const { width: searchBarWidth } = useElementSize(searchBarRef)
const keywordValue = computed({
  get: () => props.keyword,
  set: val => emit('update:keyword', val)
})

function syncPopoverWithKeyword(keyword: string) {
  // 如果用户手动切换过 popover，则不自动控制
  if (manualToggle.value) {
    return
  }

  const shouldOpen = keyword.trim().length > 0

  // 只在期望状态与当前状态不同时才触发事件
  if (shouldOpen !== expectedPopoverOpen.value) {
    expectedPopoverOpen.value = shouldOpen
    if (shouldOpen) {
      emit('open-popover')
    } else {
      emit('close-popover')
    }
  }
}

// Popover 可见性：完全受控于 popoverOpen 状态
// 移除空态限制，允许用户在无数据时也能查看字段、预设、收藏夹
const popoverVisible = computed(() => props.popoverOpen === true)

// 监听输入框的值变化，自动控制 popover 的打开/关闭
watch(
  () => props.keyword,
  newKeyword => {
    if (newKeyword.length > 0) {
      clearSelectedCondition()
    }

    // 中文输入法合成期间会频繁触发 input / visible 回调，
    // 这里延迟到 compositionend 后再统一同步，避免 popover 闪烁。
    if (isComposing.value) {
      return
    }

    syncPopoverWithKeyword(newKeyword)
  }
)

watch(
  () => props.conditions,
  conditions => {
    if (!conditions.some(condition => condition.id === selectedConditionId.value)) {
      clearSelectedCondition()
    }
  },
  { deep: true }
)

// 同步 expectedPopoverOpen 与实际的 popoverOpen 状态
watch(
  () => props.popoverOpen,
  newValue => {
    if (!manualToggle.value) {
      expectedPopoverOpen.value = newValue
    }
  }
)

// ==================== 计算属性 ====================

const hasConditions = computed(() => props.conditions.length > 0)
const keyword = computed(() => props.keyword)

function clearSelectedCondition() {
  selectedConditionId.value = undefined
}

function getSelectedConditionIndex(): number {
  if (!selectedConditionId.value) {
    return -1
  }

  return props.conditions.findIndex(condition => condition.id === selectedConditionId.value)
}

function selectConditionAt(index: number) {
  if (index < 0 || index >= props.conditions.length) {
    clearSelectedCondition()
    return
  }

  selectedConditionId.value = props.conditions[index].id
}

function selectLastCondition() {
  if (!hasConditions.value) {
    clearSelectedCondition()
    return
  }

  selectConditionAt(props.conditions.length - 1)
}

function isCaretAtStart(): boolean {
  const input = inputRef.value
  if (!input) {
    return false
  }

  return input.selectionStart === 0 && input.selectionEnd === 0
}

function removeSelectedCondition() {
  const currentIndex = getSelectedConditionIndex()
  if (currentIndex === -1) {
    clearSelectedCondition()
    return
  }

  const currentCondition = props.conditions[currentIndex]
  const previousCondition = props.conditions[currentIndex - 1]
  const nextCondition = props.conditions[currentIndex + 1]

  selectedConditionId.value = previousCondition?.id || nextCondition?.id
  emit('remove-condition', currentCondition.id)
}

// ==================== 事件处理 ====================

function handleContainerClick() {
  clearSelectedCondition()
  inputRef.value?.focus()
}

function handleBlur() {
  // 延迟关闭，让点击事件先执行
  setTimeout(() => {
    isFocused.value = false
    clearSelectedCondition()
  }, 100)
}

function handleFocus() {
  isFocused.value = true
  clearSelectedCondition()
  // 聚焦时重置手动切换标志，允许自动控制
  manualToggle.value = false
  // 同步期望状态与实际状态
  expectedPopoverOpen.value = props.popoverOpen
}

function handleKeyDown(event: KeyboardEvent) {
  if (isComposing.value || event.isComposing) {
    return
  }

  switch (event.key) {
    case 'ArrowDown':
      clearSelectedCondition()
      event.preventDefault()
      manualToggle.value = false
      expectedPopoverOpen.value = true
      emit('open-popover')
      emit('keydown-next')
      break
    case 'ArrowUp':
      clearSelectedCondition()
      event.preventDefault()
      manualToggle.value = false
      expectedPopoverOpen.value = true
      emit('open-popover')
      emit('keydown-prev')
      break
    case 'ArrowLeft': {
      if (keyword.value || !hasConditions.value) {
        break
      }

      const selectedIndex = getSelectedConditionIndex()
      if (selectedIndex === -1 && !isCaretAtStart()) {
        break
      }

      event.preventDefault()
      if (selectedIndex === -1) {
        selectLastCondition()
        break
      }

      selectConditionAt(Math.max(0, selectedIndex - 1))
      break
    }
    case 'ArrowRight': {
      if (keyword.value || !hasConditions.value) {
        break
      }

      const selectedIndex = getSelectedConditionIndex()
      if (selectedIndex === -1) {
        break
      }

      event.preventDefault()
      if (selectedIndex >= props.conditions.length - 1) {
        clearSelectedCondition()
        break
      }

      selectConditionAt(selectedIndex + 1)
      break
    }
    case 'Enter': {
      if (selectedConditionId.value) {
        event.preventDefault()
        break
      }

      event.preventDefault()
      const activeFieldKey = props.activeField

      if (activeFieldKey) {
        handleActivateField(activeFieldKey)
        break
      }

      // 没有高亮字段时，直接触发搜索
      emit('search')
      break
    }
    case 'Escape':
      clearSelectedCondition()
      emit('close-popover')
      break
    case 'Delete':
    case 'Backspace':
      if (selectedConditionId.value) {
        event.preventDefault()
        removeSelectedCondition()
        break
      }

      if (!keyword.value && hasConditions.value) {
        event.preventDefault()
        selectLastCondition()
      }
      break
  }
}

function handleCompositionStart() {
  isComposing.value = true
}

function handleCompositionEnd() {
  isComposing.value = false
  void nextTick(() => {
    syncPopoverWithKeyword(props.keyword)
  })
}

function handleRemoveCondition(id: string) {
  if (selectedConditionId.value === id) {
    clearSelectedCondition()
  }

  emit('remove-condition', id)
}

function handleClear() {
  clearSelectedCondition()
  emit('clear')
  // 清空条件后触发搜索（重置列表）
  emit('search')
}

function handleOpenAdvanced() {
  clearSelectedCondition()
  emit('open-advanced')
}

function handleActivateField(fieldKey: string) {
  clearSelectedCondition()
  emit('select-field', fieldKey)

  if (keyword.value.trim()) {
    emit('activate-field', fieldKey)
  } else {
    emit('open-advanced-for-field', fieldKey)
  }

  // 添加条件后触发搜索
  emit('search')
}

function handleApplyPreset(presetId: string) {
  emit('apply-preset', presetId)
  // 应用预设后触发搜索
  emit('search')
}

function handleApplyFavorite(favoriteId: string) {
  emit('apply-favorite', favoriteId)
  // 应用收藏夹后触发搜索
  emit('search')
}

function handlePopoverVisibleChange(visible: boolean) {
  // Popover 的打开只允许由业务事件显式控制（输入/按钮），
  // 避免内部 visible 回调把已关闭状态重新打开。
  if (!visible && (isComposing.value || (isFocused.value && props.keyword.trim().length > 0))) {
    return
  }

  if (!visible) {
    emit('close-popover')
  }
}

function handleTogglePopover() {
  clearSelectedCondition()
  // 标记用户手动切换了 popover
  manualToggle.value = true
  emit('toggle-popover')
}

// ==================== 暴露方法 ====================

/**
 * 聚焦输入框
 */
function focus() {
  inputRef.value?.focus()
}

defineExpose({
  focus
})
</script>

<style scoped lang="scss">
.smart-search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  /* 自适应内容宽度，而非占满容器 */
  width: 100%;
  min-width: var(--smart-search-bar-min-width, 480px);
  /* 默认最大宽度，可通过 CSS 变量 --smart-search-bar-max-width 覆盖 */
  max-width: var(--smart-search-bar-max-width, 800px);
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  cursor: text;
  transition:
    border-color 0.2s,
    background-color 0.3s;

  &:hover,
  &--focused {
    border-color: var(--el-color-primary);
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    flex: 1;
  }

  &__input-wrapper {
    flex: 1;
    min-width: 100px;
  }

  &__toggle {
    padding: 4px;
    color: var(--el-text-color-secondary);
  }

  &__input {
    width: 100%;
    border: none;
    outline: none;
    background: transparent;
    font-size: 14px;
    color: var(--el-text-color-regular);

    &::placeholder {
      color: var(--el-text-color-placeholder);
    }
  }

  &__clear {
    padding: 4px;
    color: var(--el-text-color-secondary);
    transition: color 0.2s;

    &:hover {
      color: var(--el-color-danger);
    }
  }

  &__advanced {
    flex-shrink: 0;
  }

  @media (max-width: 768px) {
    min-width: 0;
    width: 100%;
  }
}
</style>

<!-- Popover 内容样式（非 scoped，因为 popper 挂载到 body） -->
<style lang="scss">
.smart-search-popover {
  // Element Plus 的 width 属性会自动设置宽度
  min-width: 300px !important;
  max-width: calc(100vw - 24px) !important;
  overflow: hidden;

  // 确保背景色适配明暗模式
  background-color: var(--el-bg-color) !important;
  border: 1px solid var(--el-border-color) !important;
  transition:
    background-color 0.3s,
    border-color 0.3s;

  // Popover 内容区域
  .el-popover__content {
    padding: 0 !important;
    overflow: hidden;
    border-radius: inherit;
  }

  // 暗色模式阴影增强
  html.dark & {
    box-shadow: 0 4px 20px rgb(0 0 0 / 40%) !important;
  }

  // 亮色模式阴影增强
  html:not(.dark) & {
    box-shadow: 0 4px 20px rgb(0 0 0 / 15%) !important;
  }
}
</style>
