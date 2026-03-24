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
          <el-tooltip
            v-if="advancedActive"
            placement="top"
            :show-after="200"
            :max-width="420"
          >
            <template #content>
              <div class="smart-search-bar__advanced-tooltip">
                <div class="smart-search-bar__advanced-tooltip-title">高级筛选摘要</div>
                <div class="smart-search-bar__advanced-tooltip-text">
                  {{ advancedSummary || '当前已启用高级筛选' }}
                </div>
                <div
                  v-if="showsCombinedModeHint"
                  class="smart-search-bar__advanced-tooltip-meta"
                >
                  另有 {{ conditions.length }} 个普通条件，会与高级筛选同时生效
                </div>
              </div>
            </template>

            <el-tag
              closable
              type="warning"
              effect="light"
              class="smart-search-bar__advanced-tag"
              :class="{ 'smart-search-bar__advanced-tag--selected': selectedAdvancedTag }"
              @click.stop="handleOpenAdvanced"
              @close.stop="emit('clear-advanced')"
            >
              <span class="smart-search-bar__advanced-tag-label">
                高级筛选
                <span v-if="advancedCountLabel" class="smart-search-bar__advanced-tag-count">
                  · {{ advancedCountLabel }}
                </span>
              </span>
            </el-tag>
          </el-tooltip>

          <SearchConditionTag
            v-for="condition in conditions"
            :key="condition.id"
            :condition="condition"
            :selected="condition.id === selectedTokenId"
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
        <el-tooltip
          v-if="keyword"
          content="清空输入内容"
          placement="top"
        >
          <el-button
            class="smart-search-bar__clear"
            text
            @click.stop="handleClearKeyword"
          >
            <el-icon><CircleClose /></el-icon>
          </el-button>
        </el-tooltip>

        <el-popconfirm
          v-else-if="hasConditions"
          title="清空当前所有已应用的搜索条件？"
          confirm-button-text="清空"
          cancel-button-text="取消"
          @confirm="handleClearAll"
        >
          <template #reference>
            <el-button
              class="smart-search-bar__reset"
              text
              @click.stop
            >
              重置
            </el-button>
          </template>
        </el-popconfirm>

        <!-- 高级搜索按钮 -->
        <el-button
          class="smart-search-bar__advanced"
          :class="{ 'smart-search-bar__advanced--active': advancedActive }"
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
  /** 是否启用了高级搜索规则 */
  advancedActive?: boolean
  /** 高级搜索条件数量 */
  advancedCount?: number
  /** 高级搜索摘要 */
  advancedSummary?: string
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
  /** 清空高级搜索 */
  (e: 'clear-advanced'): void
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
  popoverOpen: false,
  advancedActive: false,
  advancedCount: 0,
  advancedSummary: ''
})

const emit = defineEmits<Emits>()

// ==================== 状态 ====================

const ADVANCED_TAG_TOKEN = '__advanced__'

const inputRef = ref<HTMLInputElement>()
const searchBarRef = ref<HTMLDivElement>()
const isFocused = ref(false)
const isComposing = ref(false)
const selectedTokenId = ref<string>()
const manualToggle = ref(false) // 标记用户是否手动切换过 popover
const expectedPopoverOpen = ref(false) // 跟踪 popover 的期望状态，避免重复触发
const { width: searchBarWidth } = useElementSize(searchBarRef)
const keywordValue = computed({
  get: () => props.keyword,
  set: val => emit('update:keyword', val)
})

function syncPopoverWithKeyword(keyword: string): void {
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
    if (selectedTokenId.value === ADVANCED_TAG_TOKEN) {
      return
    }

    if (!conditions.some(condition => condition.id === selectedTokenId.value)) {
      clearSelectedCondition()
    }
  },
  { deep: true }
)

watch(
  () => props.advancedActive,
  active => {
    if (!active && selectedTokenId.value === ADVANCED_TAG_TOKEN) {
      clearSelectedCondition()
    }
  },
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

const hasConditions = computed(() => props.conditions.length > 0 || props.advancedActive)
const keyword = computed(() => props.keyword)
const advancedActive = computed(() => props.advancedActive)
const showsCombinedModeHint = computed(() => props.advancedActive && props.conditions.length > 0)
const advancedCountLabel = computed(() => {
  if (!props.advancedCount || props.advancedCount <= 0) {
    return ''
  }

  return `${props.advancedCount}项`
})
const selectionTokens = computed(() => [
  ...(props.advancedActive ? [ADVANCED_TAG_TOKEN] : []),
  ...props.conditions.map(condition => condition.id)
])
const selectedAdvancedTag = computed(() => selectedTokenId.value === ADVANCED_TAG_TOKEN)

function clearSelectedCondition(): void {
  selectedTokenId.value = undefined
}

function getSelectedTokenIndex(): number {
  if (!selectedTokenId.value) {
    return -1
  }

  return selectionTokens.value.findIndex(token => token === selectedTokenId.value)
}

function selectTokenAt(index: number): void {
  if (index < 0 || index >= selectionTokens.value.length) {
    clearSelectedCondition()
    return
  }

  selectedTokenId.value = selectionTokens.value[index]
}

function selectLastToken(): void {
  if (selectionTokens.value.length === 0) {
    clearSelectedCondition()
    return
  }

  selectTokenAt(selectionTokens.value.length - 1)
}

function isCaretAtStart(): boolean {
  const input = inputRef.value
  if (!input) {
    return false
  }

  return input.selectionStart === 0 && input.selectionEnd === 0
}

function removeSelectedToken(): void {
  const currentIndex = getSelectedTokenIndex()
  if (currentIndex === -1) {
    clearSelectedCondition()
    return
  }

  const currentToken = selectionTokens.value[currentIndex]
  const previousToken = selectionTokens.value[currentIndex - 1]
  const nextToken = selectionTokens.value[currentIndex + 1]

  selectedTokenId.value = previousToken || nextToken

  if (currentToken === ADVANCED_TAG_TOKEN) {
    emit('clear-advanced')
    return
  }

  emit('remove-condition', currentToken)
}

function resetPopoverAutoControl(): void {
  manualToggle.value = false
  expectedPopoverOpen.value = props.popoverOpen
}

function requestPopoverOpen(): void {
  manualToggle.value = false
  expectedPopoverOpen.value = true
  emit('open-popover')
}

function emitSearch(): void {
  emit('search')
}

// ==================== 事件处理 ====================

function handleContainerClick(): void {
  clearSelectedCondition()
  inputRef.value?.focus()
}

function handleBlur(): void {
  // 延迟关闭，让点击事件先执行
  setTimeout(() => {
    isFocused.value = false
    clearSelectedCondition()
  }, 100)
}

function handleFocus(): void {
  isFocused.value = true
  clearSelectedCondition()
  resetPopoverAutoControl()
}

function handleKeyDown(event: KeyboardEvent): void {
  if (isComposing.value || event.isComposing) {
    return
  }

  switch (event.key) {
    case 'ArrowDown':
      clearSelectedCondition()
      event.preventDefault()
      requestPopoverOpen()
      emit('keydown-next')
      break
    case 'ArrowUp':
      clearSelectedCondition()
      event.preventDefault()
      requestPopoverOpen()
      emit('keydown-prev')
      break
    case 'ArrowLeft': {
      if (keyword.value || !hasConditions.value) {
        break
      }

      const selectedIndex = getSelectedTokenIndex()
      if (selectedIndex === -1 && !isCaretAtStart()) {
        break
      }

      event.preventDefault()
      if (selectedIndex === -1) {
        selectLastToken()
        break
      }

      selectTokenAt(Math.max(0, selectedIndex - 1))
      break
    }
    case 'ArrowRight': {
      if (keyword.value || !hasConditions.value) {
        break
      }

      const selectedIndex = getSelectedTokenIndex()
      if (selectedIndex === -1) {
        break
      }

      event.preventDefault()
      if (selectedIndex >= selectionTokens.value.length - 1) {
        clearSelectedCondition()
        break
      }

      selectTokenAt(selectedIndex + 1)
      break
    }
    case 'Enter': {
      if (selectedTokenId.value === ADVANCED_TAG_TOKEN) {
        event.preventDefault()
        handleOpenAdvanced()
        break
      }

      if (selectedTokenId.value) {
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
      emitSearch()
      break
    }
    case 'Escape':
      clearSelectedCondition()
      emit('close-popover')
      break
    case 'Delete':
    case 'Backspace':
      if (selectedTokenId.value) {
        event.preventDefault()
        removeSelectedToken()
        break
      }

      if (!keyword.value && hasConditions.value) {
        event.preventDefault()
        selectLastToken()
      }
      break
  }
}

function handleCompositionStart(): void {
  isComposing.value = true
}

function handleCompositionEnd(): void {
  isComposing.value = false
  void nextTick(() => {
    syncPopoverWithKeyword(props.keyword)
  })
}

function handleRemoveCondition(id: string): void {
  if (selectedTokenId.value === id) {
    clearSelectedCondition()
  }

  emit('remove-condition', id)
}

function handleClearKeyword(): void {
  clearSelectedCondition()
  emit('update:keyword', '')
  emitSearch()
}

function handleClearAll(): void {
  clearSelectedCondition()
  emit('clear')
}

function handleOpenAdvanced(): void {
  clearSelectedCondition()
  emit('open-advanced')
}

function handleActivateField(fieldKey: string): void {
  clearSelectedCondition()
  emit('select-field', fieldKey)

  if (keyword.value.trim()) {
    emit('activate-field', fieldKey)
  } else {
    emit('open-advanced-for-field', fieldKey)
  }
}

function handleApplyPreset(presetId: string): void {
  emit('apply-preset', presetId)
  emit('close-popover')
}

function handleApplyFavorite(favoriteId: string): void {
  emit('apply-favorite', favoriteId)
  emit('close-popover')
}

function handlePopoverVisibleChange(visible: boolean): void {
  // Popover 的打开只允许由业务事件显式控制（输入/按钮），
  // 避免内部 visible 回调把已关闭状态重新打开。
  if (!visible && (isComposing.value || (isFocused.value && props.keyword.trim().length > 0))) {
    return
  }

  if (!visible) {
    emit('close-popover')
  }
}

function handleTogglePopover(): void {
  clearSelectedCondition()
  // 标记用户手动切换了 popover
  manualToggle.value = true
  emit('toggle-popover')
}

// ==================== 暴露方法 ====================

/**
 * 聚焦输入框
 */
function focus(): void {
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

    /* 键盘可访问性：focus-visible 时在父容器上显示焦点环 */
    &:focus-visible {
      outline: 2px solid var(--el-color-primary);
      outline-offset: 2px;
      border-radius: 4px;
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

  &__reset {
    padding: 0 4px;
    color: var(--el-text-color-secondary);
    font-size: 12px;

    &:hover {
      color: var(--el-color-danger);
    }
  }

  &__advanced {
    flex-shrink: 0;

    &--active {
      color: var(--el-color-warning-dark-2);
      background: color-mix(in srgb, var(--el-color-warning-light-8) 72%, transparent);
      border-color: color-mix(in srgb, var(--el-color-warning) 34%, var(--el-border-color));
    }
  }

  &__advanced-tag {
    flex-shrink: 0;
    cursor: pointer;
    border-color: color-mix(in srgb, var(--el-color-warning) 30%, var(--el-border-color));
    transition:
      border-color 0.18s ease,
      background-color 0.18s ease,
      box-shadow 0.18s ease;

    &:hover {
      background: color-mix(in srgb, var(--el-color-warning-light-8) 74%, transparent);
      border-color: color-mix(in srgb, var(--el-color-warning) 45%, var(--el-border-color));
      box-shadow: 0 1px 2px rgba(146, 64, 14, 0.08);
    }

    &--selected {
      background: color-mix(in srgb, var(--el-color-warning-light-8) 82%, transparent);
      border-color: color-mix(in srgb, var(--el-color-warning) 52%, var(--el-border-color));
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--el-color-warning) 18%, transparent);
    }
  }

  &__advanced-tag-label {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    max-width: 220px;
  }

  &__advanced-tag-count {
    color: var(--el-text-color-secondary);
    font-weight: 500;
  }

  &__advanced-tooltip {
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-width: 360px;
  }

  &__advanced-tooltip-title {
    font-size: 12px;
    font-weight: 700;
  }

  &__advanced-tooltip-text {
    font-size: 12px;
    line-height: 1.5;
    color: var(--el-text-color-regular);
  }

  &__advanced-tooltip-meta {
    font-size: 12px;
    line-height: 1.5;
    color: var(--el-text-color-secondary);
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
