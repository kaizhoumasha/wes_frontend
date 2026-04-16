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
                <span
                  v-if="advancedCountLabel"
                  class="smart-search-bar__advanced-tag-count"
                >
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
import { computed, ref, watch } from 'vue'
import { useElementSize } from '@vueuse/core'

import { ArrowDown, CircleClose, Setting } from '@element-plus/icons-vue'

import type { SearchCondition, SearchFavorite, SearchFieldDef } from '@/types/search'
import type { QuickSearchPreset } from '@/types/search'
import SearchConditionTag from './SearchConditionTag.vue'
import SearchPopoverPanel from './SearchPopoverPanel.vue'
import { useSmartSearchPopoverControl } from './hooks/useSmartSearchPopoverControl'
import { useSmartSearchTokenSelection } from './hooks/useSmartSearchTokenSelection'
import { useSmartSearchInteractions } from './hooks/useSmartSearchInteractions'

interface Props {
  conditions: SearchCondition[]
  keyword: string
  activeField?: string
  fields: SearchFieldDef[]
  favorites: SearchFavorite[]
  quickPresets: QuickSearchPreset[]
  placeholder?: string
  loading?: boolean
  popoverOpen?: boolean
  advancedActive?: boolean
  advancedCount?: number
  advancedSummary?: string
}

interface Emits {
  (e: 'update:keyword', value: string): void
  (e: 'remove-condition', id: string): void
  (e: 'open-popover'): void
  (e: 'close-popover'): void
  (e: 'open-advanced'): void
  (e: 'clear'): void
  (e: 'clear-advanced'): void
  (e: 'select-field', fieldKey: string): void
  (e: 'apply-preset', presetId: string): void
  (e: 'apply-favorite', favoriteId: string): void
  (e: 'keydown-next'): void
  (e: 'keydown-prev'): void
  (e: 'search'): void
  (e: 'activate-field', fieldKey: string): void
  (e: 'open-advanced-for-field', fieldKey: string): void
  (e: 'toggle-popover'): void
}

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

const inputRef = ref<HTMLInputElement>()
const searchBarRef = ref<HTMLDivElement>()
const isFocused = ref(false)
const isComposing = ref(false)
const { width: searchBarWidth } = useElementSize(searchBarRef)

const keywordValue = computed({
  get: () => props.keyword,
  set: val => emit('update:keyword', val)
})

const keyword = computed(() => props.keyword)
const advancedActive = computed(() => props.advancedActive)
const popoverOpen = computed(() => props.popoverOpen === true)
const hasConditions = computed(() => props.conditions.length > 0 || props.advancedActive)
const showsCombinedModeHint = computed(() => props.advancedActive && props.conditions.length > 0)
const advancedCountLabel = computed(() => {
  if (!props.advancedCount || props.advancedCount <= 0) {
    return ''
  }

  return `${props.advancedCount}项`
})

const tokenSelection = useSmartSearchTokenSelection({
  conditions: computed(() => props.conditions),
  advancedActive: computed(() => props.advancedActive),
  inputRef,
  onRemoveCondition: id => emit('remove-condition', id),
  onClearAdvanced: () => emit('clear-advanced')
})

const {
  selectedTokenId,
  selectionTokens,
  selectedAdvancedTag,
  clearSelectedCondition,
  getSelectedTokenIndex,
  selectTokenAt,
  selectLastToken,
  isCaretAtStart,
  removeSelectedToken
} = tokenSelection

const popoverControl = useSmartSearchPopoverControl({
  keyword,
  popoverOpen,
  isComposing,
  isFocused,
  onOpen: () => emit('open-popover'),
  onClose: () => emit('close-popover')
})

const {
  manualToggle,
  popoverVisible,
  syncPopoverWithKeyword,
  resetPopoverAutoControl,
  requestPopoverOpen,
  handlePopoverVisibleChange
} = popoverControl

const { handleKeyDown, handleCompositionStart, handleCompositionEnd, handleActivateField } =
  useSmartSearchInteractions({
    keyword,
    activeField: computed(() => props.activeField),
    hasConditions,
    isComposing,
    selectionTokens,
    selectedTokenId,
    clearSelectedCondition,
    getSelectedTokenIndex,
    selectTokenAt,
    selectLastToken,
    isCaretAtStart,
    removeSelectedToken,
    requestPopoverOpen,
    syncPopoverWithKeyword,
    onKeydownNext: () => emit('keydown-next'),
    onKeydownPrev: () => emit('keydown-prev'),
    onSearch: () => emit('search'),
    onClosePopover: () => emit('close-popover'),
    onOpenAdvanced: () => handleOpenAdvanced(),
    onSelectField: fieldKey => emit('select-field', fieldKey),
    onActivateField: fieldKey => emit('activate-field', fieldKey),
    onOpenAdvancedForField: fieldKey => emit('open-advanced-for-field', fieldKey)
  })

watch(
  () => props.keyword,
  newKeyword => {
    if (newKeyword.length > 0) {
      clearSelectedCondition()
    }

    if (isComposing.value) {
      return
    }

    syncPopoverWithKeyword(newKeyword)
  }
)

watch(
  () => props.conditions,
  conditions => {
    if (selectedTokenId.value && !selectionTokens.value.includes(selectedTokenId.value)) {
      clearSelectedCondition()
      return
    }

    if (!conditions.some(condition => condition.id === selectedTokenId.value)) {
      if (!props.advancedActive || selectedTokenId.value !== '__advanced__') {
        clearSelectedCondition()
      }
    }
  },
  { deep: true }
)

watch(
  () => props.advancedActive,
  active => {
    if (!active && selectedTokenId.value === '__advanced__') {
      clearSelectedCondition()
    }
  }
)

function handleContainerClick(): void {
  clearSelectedCondition()
  inputRef.value?.focus()
}

function handleBlur(): void {
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

function handleRemoveCondition(id: string): void {
  if (selectedTokenId.value === id) {
    clearSelectedCondition()
  }

  emit('remove-condition', id)
}

function handleClearKeyword(): void {
  clearSelectedCondition()
  emit('update:keyword', '')
  emit('search')
}

function handleClearAll(): void {
  clearSelectedCondition()
  emit('clear')
}

function handleOpenAdvanced(): void {
  clearSelectedCondition()
  emit('open-advanced')
}

function handleApplyPreset(presetId: string): void {
  emit('apply-preset', presetId)
  emit('close-popover')
}

function handleApplyFavorite(favoriteId: string): void {
  emit('apply-favorite', favoriteId)
  emit('close-popover')
}

function handleTogglePopover(): void {
  clearSelectedCondition()
  manualToggle.value = true
  emit('toggle-popover')
}

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
      outline: none;
      outline-offset: 2px;
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
