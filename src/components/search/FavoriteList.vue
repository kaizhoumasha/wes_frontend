<!--
收藏夹列表组件（统一实现）

支持不同样式变体（dialog/panel），消除 FavoriteSearchList 和 SearchFavoritePanel 的重复代码。
-->
<template>
  <div :class="['favorite-list', `favorite-list--${variant}`]">
    <div class="favorite-list__header">
      <h4>{{ title }}</h4>
    </div>

    <el-scrollbar
      class="favorite-list__list"
      :style="{ height: scrollHeight }"
    >
      <div
        v-for="favorite in favorites"
        :key="favorite.id"
        class="favorite-list__item"
        @click="handleApplyFavorite(favorite.id)"
      >
        <div class="favorite-list__item-content">
          <el-icon class="favorite-list__item-icon"><Star /></el-icon>
          <div class="favorite-list__item-info">
            <div class="favorite-list__item-name">{{ favorite.name }}</div>
            <div class="favorite-list__item-count">{{ favorite.conditions.length }} 个条件</div>
          </div>
        </div>
      </div>

      <el-empty
        v-if="favorites.length === 0"
        description="暂无收藏夹"
        :image-size="emptySize"
      />
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { Star } from '@element-plus/icons-vue'

import type { SearchFavorite } from '@/types/search'

// ==================== 类型定义 ====================

interface Props {
  /** 收藏夹列表 */
  favorites: SearchFavorite[]
  /** 样式变体 */
  variant?: 'dialog' | 'panel'
  /** 标题 */
  title?: string
  /** 滚动区域高度 */
  scrollHeight?: string
  /** 空状态图片大小 */
  emptySize?: number
}

interface Emits {
  /** 应用收藏夹 */
  (e: 'apply-favorite', favoriteId: string): void
}

// ==================== Props & Emits ====================

withDefaults(defineProps<Props>(), {
  variant: 'panel',
  title: '收藏夹',
  scrollHeight: undefined,
  emptySize: 60
})

const emit = defineEmits<Emits>()

// ==================== 事件处理 ====================

function handleApplyFavorite(favoriteId: string) {
  emit('apply-favorite', favoriteId)
}
</script>

<style scoped lang="scss">
.favorite-list {
  display: flex;
  flex-direction: column;

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
    padding: 10px 12px;
    margin-bottom: 8px;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      border-color: var(--el-color-warning);
      background-color: var(--el-color-warning-light-9);
    }
  }

  &__item-content {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__item-icon {
    font-size: 18px;
    color: var(--el-color-warning);
  }

  &__item-info {
    flex: 1;
    min-width: 0;
  }

  &__item-name {
    font-size: 14px;
    color: var(--el-text-color-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__item-count {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  // Dialog 变体样式
  &--dialog {
    height: 100%;
  }

  // Panel 变体样式
  &--panel {
    height: 300px;
  }
}
</style>
