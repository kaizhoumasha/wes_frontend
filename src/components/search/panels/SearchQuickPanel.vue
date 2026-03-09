<!--
快速搜索面板组件

Popover 中栏：展示系统快捷预设，支持一键应用。
-->
<template>
  <div class="search-quick-panel">
    <div class="search-quick-panel__header">
      <h4>快速搜索</h4>
    </div>

    <el-scrollbar class="search-quick-panel__list">
      <div
        v-for="preset in quickPresets"
        :key="preset.id"
        class="search-quick-panel__item"
        @click="handleApplyPreset(preset)"
      >
        <div class="search-quick-panel__item-content">
          <div class="search-quick-panel__item-label">{{ preset.label }}</div>
          <div
            v-if="preset.description"
            class="search-quick-panel__item-desc"
          >
            {{ preset.description }}
          </div>
        </div>
      </div>

      <el-empty
        v-if="quickPresets.length === 0"
        description="暂无快速条件"
        :image-size="60"
      />
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import type { QuickSearchPreset } from '@/types/search'

// ==================== 类型定义 ====================

interface Props {
  /** 快速搜索预设列表 */
  quickPresets: QuickSearchPreset[]
}

interface Emits {
  /** 应用快速预设 */
  (e: 'apply-preset', preset: QuickSearchPreset): void
}

// ==================== Props & Emits ====================

defineProps<Props>()
const emit = defineEmits<Emits>()

// ==================== 事件处理 ====================

function handleApplyPreset(preset: QuickSearchPreset) {
  emit('apply-preset', preset)
}
</script>

<style scoped lang="scss">
.search-quick-panel {
  display: flex;
  flex-direction: column;
  height: 300px;

  &__header {
    padding: 12px 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);

    h4 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
  }

  &__list {
    flex: 1;
    padding: 8px;
  }

  &__item {
    padding: 12px;
    margin-bottom: 8px;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      border-color: var(--el-color-primary);
      background-color: var(--el-color-primary-light-9);
    }
  }

  &__item-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__item-label {
    font-size: 14px;
    font-weight: 500;
    color: var(--el-text-color-primary);
  }

  &__item-desc {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}
</style>
