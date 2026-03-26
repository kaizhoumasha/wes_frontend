<script setup lang="ts">
import { computed } from 'vue'
import SmartSearchBar from '@/components/search/SmartSearchBar.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppIconButton from '@/components/ui/AppIconButton.vue'
import type { useSmartSearch } from '@/composables/useSmartSearch'
import { usePermission } from '@/composables/usePermission'
import { DENSITY_CONFIG, type TableDensity } from '@/types/table'
import type { SearchFieldDef, SearchFavorite, QuickSearchPreset } from '@/types/search'
import { countFilterNodes, summarizeUIFilterGroup } from '@/utils/advanced-search'
import { convertFilterGroupToUIFilterGroup } from '@/utils/advanced-search'

/**
 * CrudToolbar 组件
 *
 * 4段式工具栏布局：[标题区] [操作区] [搜索区] [控制区]
 *
 * 特性：
 * - 配置优先，插槽兜底
 * - 响应式布局
 * - 自动处理搜索逻辑
 * - 权限过滤（通过 actions 配置）
 */

// ============================================================================
// 类型定义
// ============================================================================

export interface ToolbarTitleConfig {
  /** 主标题文本 */
  text: string
  /** 副标题（可选） */
  subtitle?: string
  /** 图标名称（优先使用 AppIcon） */
  icon?: string
  /** 是否在有选中项时显示选中数量和取消选中按钮 */
  showSelectedCount?: boolean
}

export interface ToolbarAction {
  /** 按钮唯一标识 */
  key: string
  /** 按钮文本 */
  label: string
  /** 按钮图标名称（优先使用 AppIcon） */
  icon?: string
  /** 按钮类型 */
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  /** 点击处理函数 */
  handler: () => void | Promise<void>
  /** 权限代码（可选，如果提供则自动进行权限检查） */
  permission?: string
  /** 条件显示函数（可选，返回 false 则隐藏按钮） */
  showWhen?: () => boolean
  /** 是否加载中 */
  loading?: boolean
  /** 按钮提示文案 */
  tooltip?: string
}

export interface ToolbarModeOption {
  key: string
  label: string
  icon?: string
  permission?: string
}

export interface CrudToolbarProps {
  /**
   * useSmartSearch composable 的完整返回对象.
   * 组件内部将直接调用此对象的属性和方法, 无需在父组件手动绑定.
   */
  smartSearch: ReturnType<typeof useSmartSearch>

  /**
   * 搜索字段定义（用于 SmartSearchBar）
   */
  searchFields: SearchFieldDef[]

  /**
   * 收藏夹列表（用于 SmartSearchBar）
   */
  favorites?: SearchFavorite[]

  /**
   * 快速搜索预设（用于 SmartSearchBar）
   */
  quickPresets?: QuickSearchPreset[]

  /**
   * 工具栏状态对象，由 useCrudToolbar 返回.
   * 聚合了工具栏所需的所有状态（UI 状态 + 批量操作状态）.
   */
  toolbarState: {
    /** 是否加载中 (用于刷新按钮) */
    loading: boolean
    /** 选中的数量 */
    selectedCount: number
    /** 批量删除是否加载中 */
    batchDeleteLoading: boolean
    /** 批量恢复是否加载中 */
    batchRestoreLoading: boolean
    /** 批量永久删除是否加载中 */
    batchPermanentDeleteLoading: boolean
    /** 是否全屏 */
    isFullscreen: boolean
    /** 当前密度 */
    density: TableDensity
  }

  /**
   * 标题配置对象（可选）.
   * 组件内部自动渲染标准标题布局（图标 + 主标题 + 副标题）.
   * 如果不传此 prop，则必须使用 #title 插槽自定义标题区.
   */
  title?: ToolbarTitleConfig

  /**
   * 操作按钮配置数组（可选）.
   * 由 useToolbarActions 返回的 filteredActions，组件内部自动渲染标准按钮.
   * 如果不传此 prop，则必须使用 #actions 插槽自定义操作区.
   */
  actions?: ToolbarAction[]

  /**
   * 列表模式切换配置
   */
  modeSwitcher?: {
    value: string
    options: ToolbarModeOption[]
  }

  /**
   * 搜索栏的占位文本
   */
  searchPlaceholder?: string

  /**
   * 是否显示搜索栏
   */
  showSearch?: boolean
}

// ============================================================================
// Props 和 Emits
// ============================================================================

const props = withDefaults(defineProps<CrudToolbarProps>(), {
  favorites: () => [],
  quickPresets: () => [],
  title: undefined,
  actions: undefined,
  modeSwitcher: undefined,
  searchPlaceholder: '搜索...',
  showSearch: true
})

const emit = defineEmits<{
  /** 刷新事件 */
  (e: 'refresh'): void
  /** 批量删除事件 */
  (e: 'batch-delete'): void
  /** 取消选择事件 */
  (e: 'cancel-selection'): void
  /** 搜索事件 */
  (e: 'search'): void
  /** 切换全屏事件 */
  (e: 'toggle-fullscreen'): void
  /** 改变密度事件 */
  (e: 'change-density', density: TableDensity): void
  /** 打开列配置事件 */
  (e: 'open-column-config'): void
  /** 切换列表模式 */
  (e: 'change-mode', mode: string): void
}>()

const { hasPermission } = usePermission()

// ============================================================================
// 计算属性
// ============================================================================

function canShowAction(action: ToolbarAction): boolean {
  if (action.permission && !hasPermission(action.permission)) {
    return false
  }

  if (action.showWhen && !action.showWhen()) {
    return false
  }

  return true
}

function canShowMode(option: ToolbarModeOption): boolean {
  if (option.permission && !hasPermission(option.permission)) {
    return false
  }

  return true
}

function createBatchDeleteAction(): ToolbarAction {
  return {
    key: 'batch-delete',
    label: '批量删除',
    icon: 'ep:delete',
    type: 'danger',
    handler: () => emit('batch-delete'),
    loading: props.toolbarState.batchDeleteLoading,
    tooltip: '删除选中的数据'
  }
}

/** 是否显示批量操作区 */
const showBatchActions = computed(
  () => (props.title?.showSelectedCount ?? false) && props.toolbarState.selectedCount > 0
)

/** 过滤后的配置按钮 */
const filteredActions = computed(() => (props.actions ?? []).filter(canShowAction))

/** 可见的模式切换项 */
const visibleModeOptions = computed(() => (props.modeSwitcher?.options ?? []).filter(canShowMode))

const currentModeOption = computed(() => {
  const activeKey = props.modeSwitcher?.value

  return (
    visibleModeOptions.value.find(option => option.key === activeKey) ?? visibleModeOptions.value[0]
  )
})

/** 当前使用的操作按钮 */
const currentActions = computed(() => {
  if (filteredActions.value.length > 0 || props.actions) {
    return filteredActions.value
  }

  if (showBatchActions.value) {
    return [createBatchDeleteAction()]
  }

  return []
})

const advancedFilterSummary = computed(() => {
  const group = props.smartSearch.advancedFilterGroup.value
  if (!group) {
    return ''
  }

  return summarizeUIFilterGroup(convertFilterGroupToUIFilterGroup(group), props.searchFields)
})

const advancedFilterCount = computed(() => {
  const group = props.smartSearch.advancedFilterGroup.value
  return group ? countFilterNodes(group) : 0
})

// ============================================================================
// 事件处理
// ============================================================================

function handleClear(): void {
  props.smartSearch.clearKeyword()
  props.smartSearch.clearAppliedFilters()
}

function handleActivateField(fieldKey: string): void {
  props.smartSearch.buildConditionFromField(fieldKey)
}

function handleOpenAdvancedForField(fieldKey: string): void {
  props.smartSearch.closePopover()
  props.smartSearch.openAdvancedDialog(fieldKey)
}

function handleOpenAdvanced(): void {
  props.smartSearch.closePopover()
  props.smartSearch.openAdvancedDialog()
}
</script>

<template>
  <div
    class="crud-toolbar"
    :class="{ 'crud-toolbar--without-search': !showSearch }"
  >
    <div class="crud-toolbar__left">
      <div class="crud-toolbar__title-section">
        <slot
          name="title"
          :selected-count="toolbarState.selectedCount"
          :show-batch-actions="showBatchActions"
        >
          <div
            v-if="showBatchActions"
            class="crud-toolbar__selection"
          >
            <span class="crud-toolbar__selection-count">
              已选中 {{ toolbarState.selectedCount }} 项
            </span>
            <el-button
              link
              @click="emit('cancel-selection')"
            >
              取消选择
            </el-button>
          </div>

          <div
            v-else-if="title"
            class="crud-toolbar__title"
          >
            <AppIcon
              v-if="title.icon"
              :icon="title.icon"
              :size="20"
              class="crud-toolbar__title-icon"
            />
            <div class="crud-toolbar__title-text">
              <div class="crud-toolbar__title-main">{{ title.text }}</div>
              <div
                v-if="title.subtitle"
                class="crud-toolbar__title-sub"
              >
                {{ title.subtitle }}
              </div>
            </div>
          </div>
        </slot>
      </div>

      <div class="crud-toolbar__actions-inline">
        <slot
          name="actions"
          :selected-count="toolbarState.selectedCount"
          :show-batch-actions="showBatchActions"
        >
          <template v-if="currentActions.length > 0">
            <template
              v-for="action in currentActions"
              :key="action.key"
            >
              <el-tooltip
                v-if="action.tooltip"
                :content="action.tooltip"
                placement="bottom"
              >
                <AppButton
                  :type="action.type || 'default'"
                  :loading="action.loading"
                  :icon="action.icon"
                  @click="action.handler()"
                >
                  {{ action.label }}
                </AppButton>
              </el-tooltip>

              <AppButton
                v-else
                :type="action.type || 'default'"
                :loading="action.loading"
                :icon="action.icon"
                @click="action.handler()"
              >
                {{ action.label }}
              </AppButton>
            </template>
          </template>
        </slot>
      </div>
    </div>

    <div
      v-if="showSearch"
      class="crud-toolbar__search"
    >
      <SmartSearchBar
        :conditions="smartSearch.conditions.value"
        :keyword="smartSearch.state.value.keyword"
        :active-field="smartSearch.state.value.activeField"
        :fields="searchFields"
        :favorites="favorites"
        :quick-presets="quickPresets"
        :loading="toolbarState.loading"
        :popover-open="smartSearch.state.value.popoverOpen"
        :advanced-active="smartSearch.advancedFilterGroup.value !== undefined"
        :advanced-count="advancedFilterCount"
        :advanced-summary="advancedFilterSummary"
        :placeholder="searchPlaceholder"
        @update:keyword="smartSearch.setKeyword"
        @remove-condition="smartSearch.removeCondition"
        @clear="handleClear"
        @clear-advanced="smartSearch.clearAdvancedFilterGroup"
        @search="emit('search')"
        @open-popover="smartSearch.openPopover"
        @close-popover="smartSearch.closePopover"
        @toggle-popover="smartSearch.togglePopover"
        @open-advanced="handleOpenAdvanced"
        @keydown-next="smartSearch.getNextActiveField('next')"
        @keydown-prev="smartSearch.getNextActiveField('prev')"
        @apply-preset="smartSearch.applyQuickPreset"
        @apply-favorite="smartSearch.applyFavorite"
        @activate-field="handleActivateField"
        @open-advanced-for-field="handleOpenAdvancedForField"
      />
    </div>

    <div class="crud-toolbar__controls-wrapper">
      <div class="crud-toolbar__controls">
        <el-dropdown
          v-if="visibleModeOptions.length > 1 && currentModeOption"
          trigger="click"
          placement="bottom-end"
          @command="mode => emit('change-mode', String(mode))"
        >
          <AppIconButton
            :icon="currentModeOption.icon ?? 'ep:switch-button'"
            size="small"
            :tooltip="`当前视图：${currentModeOption.label}`"
          />
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                v-for="option in visibleModeOptions"
                :key="option.key"
                :command="option.key"
                :class="{ 'is-active': option.key === modeSwitcher?.value }"
              >
                <div class="crud-toolbar__dropdown-option">
                  <div class="crud-toolbar__dropdown-option-main">
                    <AppIcon
                      v-if="option.icon"
                      :icon="option.icon"
                      :size="14"
                    />
                    <span>{{ option.label }}</span>
                  </div>
                  <AppIcon
                    v-if="option.key === modeSwitcher?.value"
                    icon="ep:check"
                    :size="14"
                    class="crud-toolbar__dropdown-option-check"
                  />
                </div>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <slot name="controls">
          <AppIconButton
            icon="ep:refresh"
            size="small"
            :loading="toolbarState.loading"
            tooltip="刷新数据"
            @click="emit('refresh')"
          />

          <AppIconButton
            :icon="toolbarState.isFullscreen ? 'ep:scale-to-original' : 'ep:full-screen'"
            size="small"
            :tooltip="toolbarState.isFullscreen ? '退出全屏' : '全屏显示'"
            @click="emit('toggle-fullscreen')"
          />

          <el-dropdown
            trigger="click"
            @command="density => emit('change-density', density)"
          >
            <AppIconButton
              icon="ep:grid"
              size="small"
              tooltip="调整行高"
            />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  v-for="(config, key) in DENSITY_CONFIG"
                  :key="key"
                  :command="key"
                  :class="{ 'is-active': toolbarState.density === key }"
                >
                  {{ config.label }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <AppIconButton
            icon="ep:setting"
            size="small"
            tooltip="配置显示列"
            @click="emit('open-column-config')"
          />
        </slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.crud-toolbar {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  padding: 16px;
  background: var(--el-bg-color);
  border-radius: 8px;
  gap: 16px;
  border: 1px solid var(--el-border-color-lighter);
}

.crud-toolbar--without-search {
  grid-template-columns: 1fr auto;
}

.crud-toolbar__left {
  display: flex;
  align-items: center;
  gap: 16px;
  justify-self: start;
  flex-wrap: wrap;
}

.crud-toolbar__title-section {
  display: flex;
  align-items: center;
}

.crud-toolbar__title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.crud-toolbar__title-icon {
  font-size: 18px;
  color: var(--el-text-color-primary);
}

.crud-toolbar__title-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.crud-toolbar__title-main {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.crud-toolbar__title-sub {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.crud-toolbar__actions-inline {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.crud-toolbar__selection {
  display: flex;
  align-items: center;
  gap: 8px;
}

.crud-toolbar__selection-count {
  font-weight: 500;
  color: var(--el-color-primary);
}

.crud-toolbar__search {
  width: 100%;
  min-width: var(--search-min-width);
  max-width: var(--search-max-width);
  justify-self: center;
  display: flex;
  justify-content: center;
}

.crud-toolbar__search :deep(.smart-search-bar) {
  width: 100%;
}

.crud-toolbar__controls-wrapper {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.crud-toolbar__controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.crud-toolbar__controls :deep(.el-dropdown) {
  display: flex;
  align-items: center;
  line-height: 1;
}

.crud-toolbar__dropdown-option {
  min-width: 104px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.crud-toolbar__dropdown-option-main {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.crud-toolbar__dropdown-option-check {
  color: var(--el-color-primary);
}

/* 覆盖 Element Plus 的 .el-button + .el-button { margin-left: 12px } 全局规则 */
.crud-toolbar__controls :deep(.el-button + .el-button) {
  margin-left: 0;
}

/* ==================== 响应式断点 ==================== */

/* 注意：@media 查询不支持 CSS 变量，必须使用固定值 */

/* 参考：src/constants/breakpoints.ts, tailwind.config.js */

/* 平板端（768px - 1279px）：搜索框单独一行 */
@media (width >= 768px) and (width < 1280px) {
  .crud-toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  .crud-toolbar__search {
    width: 100%;
    max-width: 100%;
    order: -1;
    margin-bottom: 12px;
  }

  .crud-toolbar__left {
    width: auto;
  }

  .crud-toolbar__controls-wrapper {
    width: auto;
    margin-left: auto;
    justify-content: flex-end;
  }
}

/* 移动端（< 768px）：搜索框、标题区、控制区各占一行 */
@media (width <= 767px) {
  .crud-toolbar {
    padding: 12px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .crud-toolbar__search {
    width: 100%;
    max-width: 100%;
    order: -1;
  }

  .crud-toolbar__left {
    width: 100%;
    align-items: center;
    justify-content: flex-start;
    align-self: stretch;
    order: 2;
  }

  .crud-toolbar__title-section {
    width: auto;
  }

  .crud-toolbar__actions-inline {
    width: auto;
    justify-content: flex-start;
    flex-wrap: wrap;
  }

  .crud-toolbar__controls-wrapper {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    align-self: stretch;
    order: 3;
  }
}
</style>
