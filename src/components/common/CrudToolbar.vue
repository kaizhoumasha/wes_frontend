<script setup lang="ts">
import { computed, type Component } from 'vue'
import {
  Refresh,
  Delete,
  FullScreen,
  ScaleToOriginal,
  Grid,
  Setting
} from '@element-plus/icons-vue'
import SmartSearchBar from '@/components/search/SmartSearchBar.vue'
import type { useSmartSearch } from '@/composables/useSmartSearch'
import { DENSITY_CONFIG, type TableDensity } from '@/types/table'
import type { SearchFieldDef, SearchFavorite, QuickSearchPreset } from '@/types/search'

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
  /** 图标组件（Element Plus 图标） */
  icon?: Component
  /** 是否在有选中项时显示选中数量和取消选中按钮 */
  showSelectedCount?: boolean
}

export interface ToolbarAction {
  /** 按钮唯一标识 */
  key: string
  /** 按钮文本 */
  label: string
  /** 按钮图标（Element Plus 图标组件） */
  icon?: Component
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
   * 搜索栏的占位文本
   */
  searchPlaceholder?: string
}

// ============================================================================
// Props 和 Emits
// ============================================================================

const props = withDefaults(defineProps<CrudToolbarProps>(), {
  favorites: () => [],
  quickPresets: () => [],
  title: undefined,
  actions: undefined,
  searchPlaceholder: '搜索...'
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
  /** 创建事件（向后兼容保留） */
  (e: 'create'): void
}>()

// ============================================================================
// 计算属性
// ============================================================================

/** 是否显示批量操作区 */
const showBatchActions = computed(
  () => (props.title?.showSelectedCount ?? false) && props.toolbarState.selectedCount > 0
)

/** 当前使用的操作按钮（有选中项时使用批量操作按钮） */
const currentActions = computed(() => {
  if (showBatchActions.value) {
    return [
      {
        key: 'batch-delete',
        label: '批量删除',
        icon: Delete,
        type: 'danger' as const,
        handler: () => emit('batch-delete'),
        loading: props.toolbarState.batchDeleteLoading
      }
    ]
  }

  return props.actions || []
})

// ============================================================================
// 事件处理
// ============================================================================

function handleClear() {
  props.smartSearch.clearKeyword()
  props.smartSearch.clearConditions()
}

function handleActivateField(fieldKey: string) {
  props.smartSearch.buildConditionFromField(fieldKey)
}

function handleOpenAdvancedForField(fieldKey: string) {
  props.smartSearch.openAdvancedDialog(fieldKey)
}
</script>

<template>
  <div class="crud-toolbar">
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
            <span class="crud-toolbar__selection-count"
              >已选中 {{ toolbarState.selectedCount }} 项</span
            >
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
            <el-icon
              v-if="title.icon"
              class="crud-toolbar__title-icon"
            >
              <component :is="title.icon" />
            </el-icon>
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
            <el-button
              v-for="action in currentActions"
              :key="action.key"
              :type="action.type || 'default'"
              :icon="action.icon"
              :loading="action.loading"
              @click="action.handler()"
            >
              {{ action.label }}
            </el-button>
          </template>
        </slot>
      </div>
    </div>

    <div class="crud-toolbar__search">
      <SmartSearchBar
        :conditions="smartSearch.conditions.value"
        :keyword="smartSearch.state.value.keyword"
        :active-field="smartSearch.state.value.activeField"
        :fields="searchFields"
        :favorites="favorites"
        :quick-presets="quickPresets"
        :loading="toolbarState.loading"
        :popover-open="smartSearch.state.value.popoverOpen"
        :placeholder="searchPlaceholder"
        @update:keyword="smartSearch.setKeyword"
        @remove-condition="smartSearch.removeCondition"
        @clear="handleClear"
        @search="emit('search')"
        @open-popover="smartSearch.openPopover"
        @close-popover="smartSearch.closePopover"
        @toggle-popover="smartSearch.togglePopover"
        @open-advanced="smartSearch.openAdvancedDialog"
        @keydown-next="smartSearch.getNextActiveField('next')"
        @keydown-prev="smartSearch.getNextActiveField('prev')"
        @activate-field="handleActivateField"
        @open-advanced-for-field="handleOpenAdvancedForField"
      />
    </div>

    <div class="crud-toolbar__controls-wrapper">
      <div class="crud-toolbar__controls">
        <slot name="controls">
          <el-tooltip
            content="刷新数据"
            placement="bottom"
          >
            <el-button
              size="small"
              :icon="Refresh"
              :loading="toolbarState.loading"
              @click="emit('refresh')"
            />
          </el-tooltip>

          <el-tooltip
            :content="toolbarState.isFullscreen ? '退出全屏' : '全屏显示'"
            placement="bottom"
          >
            <el-button
              size="small"
              :icon="toolbarState.isFullscreen ? ScaleToOriginal : FullScreen"
              @click="emit('toggle-fullscreen')"
            />
          </el-tooltip>

          <el-tooltip
            content="调整行高"
            placement="bottom"
          >
            <el-dropdown
              trigger="click"
              @command="density => emit('change-density', density)"
            >
              <el-button
                size="small"
                :icon="Grid"
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
          </el-tooltip>

          <el-tooltip
            content="配置显示列"
            placement="bottom"
          >
            <el-button
              size="small"
              :icon="Setting"
              @click="emit('open-column-config')"
            />
          </el-tooltip>
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

.crud-toolbar__left {
  display: flex;
  align-items: center;
  gap: 16px;
  justify-self: start;
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
    flex-wrap: nowrap;
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
