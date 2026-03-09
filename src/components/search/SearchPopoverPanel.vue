<!--
搜索 Popover 面板容器组件

三栏布局容器，协调字段、快捷条件、收藏夹面板。
-->
<template>
  <el-tabs
    v-if="isCompact"
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

  <div v-else class="search-popover-panel">
    <SearchFieldPanel
      :fields="fields"
      :active-field="activeField"
      :keyword="keyword"
      @activate-field="handleActivateField"
    />

    <SearchQuickPanel
      :quick-presets="quickPresets"
      @apply-preset="handleApplyPreset"
    />

    <FavoriteList
      :favorites="favorites"
      variant="panel"
      title="收藏夹"
      @apply-favorite="handleApplyFavorite"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useWindowSize } from '@vueuse/core'
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

defineProps<Props>()
const emit = defineEmits<Emits>()

const activeTab = ref('fields')
const { width } = useWindowSize()
const isCompact = computed(() => width.value < 768)

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
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1px;
  background-color: var(--el-border-color-lighter);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  overflow: hidden;
  &--tabs {
    display: block;
    min-width: min(400px, calc(100vw - 24px));
  }
}
</style>
