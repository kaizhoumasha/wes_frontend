<!--
搜索 Popover 面板容器组件

三栏布局容器，协调字段、快捷条件、收藏夹面板。
-->
<template>
  <!-- 窄屏（<420px）：水平 Tabs，避免竖向堆叠 -->
  <el-tabs
    v-if="isNarrow"
    v-model="activeTab"
    class="search-popover-panel search-popover-panel--tabs"
    stretch
  >
    <el-tab-pane label="字段" name="fields">
      <SearchFieldPanel
        :fields="fields"
        :active-field="activeField"
        :keyword="keyword"
        @activate-field="handleActivateField"
      />
    </el-tab-pane>
    <el-tab-pane label="快捷" name="quick">
      <SearchQuickPanel
        :quick-presets="quickPresets"
        @apply-preset="handleApplyPreset"
      />
    </el-tab-pane>
    <el-tab-pane label="收藏" name="favorite">
      <FavoriteList
        :favorites="favorites"
        variant="panel"
        title="收藏夹"
        @apply-favorite="handleApplyFavorite"
      />
    </el-tab-pane>
  </el-tabs>

  <!-- 中屏（420-599px）：2列，右侧快速+收藏上下分区 -->
  <div v-else-if="isMedium" class="search-popover-panel search-popover-panel--two-col">
    <div class="panel-col panel-col--fields">
      <SearchFieldPanel
        :fields="fields"
        :active-field="activeField"
        :keyword="keyword"
        @activate-field="handleActivateField"
      />
    </div>
    <el-divider direction="vertical" class="panel-vdivider" />
    <div class="search-popover-panel__right panel-col panel-col--side">
      <SearchQuickPanel
        :quick-presets="quickPresets"
        @apply-preset="handleApplyPreset"
      />
      <el-divider class="panel-hdivider" />
      <FavoriteList
        :favorites="favorites"
        variant="panel"
        title="收藏夹"
        @apply-favorite="handleApplyFavorite"
      />
    </div>
  </div>

  <!-- 宽屏（≥600px）：3列 -->
  <div v-else class="search-popover-panel search-popover-panel--three-col">
    <div class="panel-col panel-col--fields">
      <SearchFieldPanel
        :fields="fields"
        :active-field="activeField"
        :keyword="keyword"
        @activate-field="handleActivateField"
      />
    </div>
    <el-divider direction="vertical" class="panel-vdivider" />
    <div class="panel-col panel-col--side">
      <SearchQuickPanel
        :quick-presets="quickPresets"
        @apply-preset="handleApplyPreset"
      />
    </div>
    <el-divider direction="vertical" class="panel-vdivider" />
    <div class="panel-col panel-col--side">
      <FavoriteList
        :favorites="favorites"
        variant="panel"
        title="收藏夹"
        @apply-favorite="handleApplyFavorite"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { QuickSearchPreset, SearchFavorite, SearchFieldDef } from '@/types/search'
import SearchFieldPanel from './panels/SearchFieldPanel.vue'
import SearchQuickPanel from './panels/SearchQuickPanel.vue'
import FavoriteList from './FavoriteList.vue'

// ==================== 类型定义 ====================

interface Props {
  /** 字段列表 */
  fields: SearchFieldDef[]
  /** 当前高亮字段 */
  activeField?: string
  /** 当前关键字 */
  keyword: string
  /** 快速搜索预设列表 */
  quickPresets: QuickSearchPreset[]
  /** 收藏夹列表 */
  favorites: SearchFavorite[]
  /** 容器宽度（由父组件传入，用于响应式布局判断） */
  containerWidth?: number
}

interface Emits {
  /** 激活字段 */
  (e: 'activate-field', fieldKey: string): void
  /** 应用快速预设（整组一次性） */
  (e: 'apply-preset', presetId: string): void
  /** 应用收藏夹 */
  (e: 'apply-favorite', favoriteId: string): void
}

// ==================== Props & Emits ====================

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const activeTab = ref('fields')
const isNarrow = computed(() => (props.containerWidth ?? 0) < 420)
const isMedium = computed(() => (props.containerWidth ?? 0) >= 420 && (props.containerWidth ?? 0) < 600)

// ==================== 事件处理 ====================

function handleActivateField(fieldKey: string) {
  emit('activate-field', fieldKey)
}

function handleApplyPreset(preset: QuickSearchPreset) {
  // 一次性应用预设（提升事件语义）
  emit('apply-preset', preset.id)
}

function handleApplyFavorite(favoriteId: string) {
  emit('apply-favorite', favoriteId)
}
</script>

<style scoped lang="scss">
.search-popover-panel {
  // 宽屏：3列
  &--three-col {
    display: flex;
    align-items: stretch;
  }

  // 中屏：2列
  &--two-col {
    display: flex;
    align-items: stretch;

    .search-popover-panel__right {
      display: flex;
      flex-direction: column;
    }
  }

  // 窄屏：Tabs
  &--tabs {
    display: block;
    width: 100%;
    overflow: hidden;

    :deep(.el-tabs__content) {
      overflow: hidden;
    }
  }
}

// 列容器：让子面板填满
.panel-col {
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;

  // 字段列：更宽，是主操作区
  &--fields {
    flex: 2;
  }

  // 辅助列（快速/收藏）
  &--side {
    flex: 1.5;
  }

  // 覆盖子面板的固定高度，让其填满列
  :deep(.search-field-panel),
  :deep(.search-quick-panel),
  :deep(.favorite-list--panel) {
    height: 100%;
    flex: 1;
  }
}

// 垂直分隔线：撑满父容器高度
.panel-vdivider {
  height: auto !important;
  align-self: stretch;
  margin: 0 !important;
}

// 水平分隔线：无外边距
.panel-hdivider {
  margin: 0 !important;
}
</style>
