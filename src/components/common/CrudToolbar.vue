<script setup lang="ts">
import { computed, type Component } from 'vue'
import { RefreshRight, FullScreen, Close, Operation, Setting } from '@element-plus/icons-vue'
import SmartSearchBar from '@/components/search/SmartSearchBar.vue'
import type { useSmartSearch } from '@/composables/useSmartSearch'
import type { TableDensity } from '@/types/table'
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
  /** 创建事件（来自 title 配置） */
  (e: 'create'): void
}>()

// ============================================================================
// 计算属性
// ============================================================================

/** 是否显示批量操作区 */
const showBatchActions = computed(() => props.toolbarState.selectedCount > 0)


/** 当前使用的操作按钮（有选中项时使用批量操作按钮） */
const currentActions = computed(() => {
  if (showBatchActions.value) {
    // 批量操作模式：只显示批量删除按钮
    return [
      {
        key: 'batch-delete',
        label: '批量删除',
        icon: undefined, // TODO: 添加 Delete 图标
        type: 'danger' as const,
        handler: () => emit('batch-delete'),
        loading: props.toolbarState.batchDeleteLoading
      }
    ]
  }
  // 正常模式：显示配置的按钮
  return props.actions || []
})


// ============================================================================
// 事件处理
// ============================================================================


</script>

<template>
  <div class="crud-toolbar">
    <!-- 第一行：标题区 + 批量操作区 -->
    <div class="crud-toolbar__row crud-toolbar__row--top">
      <!-- 标题区插槽优先 -->
      <slot
        v-if="!showBatchActions"
        name="title"
        :selected-count="toolbarState.selectedCount"
      >
        <!-- 标题配置（如果没有插槽） -->
        <div v-if="title" class="crud-toolbar__title">
          <component
            :is="title.icon"
            v-if="title.icon"
            class="crud-toolbar__title-icon"
          />
          <div class="crud-toolbar__title-text">
            <div class="crud-toolbar__title-main">{{ title.text }}</div>
            <div v-if="title.subtitle" class="crud-toolbar__title-sub">
              {{ title.subtitle }}
            </div>
          </div>
        </div>
      </slot>

      <!-- 批量操作区（有选中项时显示） -->
      <div v-if="showBatchActions" class="crud-toolbar__batch-actions">
        <span class="crud-toolbar__batch-count">
          已选中 {{ toolbarState.selectedCount }} 项
        </span>
        <el-button
          type="default"
          size="small"
          @click="emit('cancel-selection')"
        >
          取消选择
        </el-button>
      </div>
    </div>

    <!-- 第二行：操作区 + 搜索区 + 控制区 -->
    <div class="crud-toolbar__row crud-toolbar__row--middle">
      <!-- 操作区 -->
      <div class="crud-toolbar__actions">
        <slot
          name="actions"
          :selected-count="toolbarState.selectedCount"
        >
          <!-- 操作按钮配置（如果没有插槽） -->
          <template v-if="actions">
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

      <!-- 搜索区 -->
      <div class="crud-toolbar__search">
        <SmartSearchBar
          :conditions="smartSearch.conditions.value"
          :keyword="smartSearch.state.value.keyword"
          :fields="searchFields"
          :favorites="favorites || []"
          :quick-presets="quickPresets || []"
          :placeholder="searchPlaceholder"
          @update:keyword="smartSearch.setKeyword"
          @remove-condition="(id) => smartSearch.removeCondition(id)"
          @search="emit('search')"
          @clear="smartSearch.clearKeyword"
        />
      </div>

      <!-- 控制区 -->
      <div class="crud-toolbar__controls">
        <slot name="controls">
          <!-- 刷新按钮 -->
          <el-tooltip content="刷新" placement="top">
            <el-button
              :icon="RefreshRight"
              :loading="toolbarState.loading"
              circle
              @click="emit('refresh')"
            />
          </el-tooltip>

          <!-- 全屏按钮 -->
          <el-tooltip
            :content="toolbarState.isFullscreen ? '退出全屏' : '全屏'"
            placement="top"
          >
            <el-button
              :icon="toolbarState.isFullscreen ? Close : FullScreen"
              circle
              @click="emit('toggle-fullscreen')"
            />
          </el-tooltip>

          <!-- 密度切换 -->
          <el-dropdown @command="(density) => emit('change-density', density)">
            <el-button :icon="Operation" circle />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="compact">
                  紧凑
                </el-dropdown-item>
                <el-dropdown-item command="comfortable">
                  舒适
                </el-dropdown-item>
                <el-dropdown-item command="relaxed">
                  宽松
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <!-- 列配置 -->
          <el-tooltip content="列配置" placement="top">
            <el-button
              :icon="Setting"
              circle
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
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.crud-toolbar__row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.crud-toolbar__row--top {
  justify-content: space-between;
}

.crud-toolbar__row--middle {
  justify-content: space-between;
}

.crud-toolbar__title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.crud-toolbar__title-icon {
  font-size: 24px;
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

.crud-toolbar__batch-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.crud-toolbar__batch-count {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.crud-toolbar__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.crud-toolbar__search {
  flex: 1;
  min-width: 0;
}

.crud-toolbar__controls {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

/* 响应式：平板（标题换行） */
@media (width < 1280px) {
  .crud-toolbar__row--top {
    flex-direction: column;
    align-items: flex-start;
  }

  .crud-toolbar__row--middle {
    flex-wrap: wrap;
  }

  .crud-toolbar__search {
    order: 3;
    min-width: 100%;
    margin-top: 8px;
  }
}

/* 响应式：移动端（搜索独立一行） */
@media (width < 768px) {
  .crud-toolbar {
    gap: 8px;
  }

  .crud-toolbar__row--middle {
    flex-direction: column;
    align-items: stretch;
  }

  .crud-toolbar__actions {
    justify-content: flex-start;
  }

  .crud-toolbar__search {
    order: unset;
    margin-top: 8px;
  }

  .crud-toolbar__controls {
    justify-content: flex-end;
    margin-top: 8px;
  }
}
</style>
