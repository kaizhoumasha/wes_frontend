<template>
  <section
    class="favorites-panel"
    :class="{ 'favorites-panel--collapsed': collapsed }"
  >
    <header class="favorites-panel__header">
      <div>
        <div class="favorites-panel__title">收藏夹</div>
        <div class="favorites-panel__subtitle">快速套用常用过滤模板</div>
      </div>

      <el-button
        text
        @click="emit('toggle-collapse')"
      >
        {{ collapsed ? '展开' : '折叠' }}
      </el-button>
    </header>

    <div
      v-if="!collapsed"
      class="favorites-panel__content"
    >
      <el-empty
        v-if="favorites.length === 0"
        description="暂无收藏夹"
        :image-size="56"
      />

      <button
        v-for="favorite in favorites"
        :key="favorite.id"
        type="button"
        class="favorites-panel__item"
        @click="emit('apply', favorite.id)"
      >
        <span class="favorites-panel__name">{{ favorite.name }}</span>
        <span class="favorites-panel__count">{{ countFavorite(favorite) }} 条</span>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { SearchFavorite } from '@/types/search'
import { countSearchFavoriteRules } from '@/utils/advanced-search'

interface Props {
  favorites: SearchFavorite[]
  collapsed?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'apply', favoriteId: string): void
  (e: 'toggle-collapse'): void
}>()

function countFavorite(favorite: SearchFavorite): number {
  return countSearchFavoriteRules(favorite)
}
</script>

<style scoped lang="scss">
.favorites-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px 16px;
  background:
    radial-gradient(
      circle at top left,
      color-mix(in srgb, var(--el-color-warning-light-8) 60%, transparent),
      transparent 58%
    ),
    color-mix(in srgb, var(--el-fill-color-light) 78%, transparent);
  border: 1px solid color-mix(in srgb, var(--el-color-warning) 18%, var(--el-border-color));
  border-radius: 18px;

  &--collapsed {
    padding-bottom: 10px;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: center;
  }

  &__title {
    font-size: 14px;
    font-weight: 700;
    color: var(--el-text-color-primary);
  }

  &__subtitle {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  &__content {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  &__item {
    display: inline-flex;
    flex-direction: column;
    gap: 2px;
    min-width: 132px;
    padding: 12px 14px;
    text-align: left;
    cursor: pointer;
    background: var(--el-bg-color);
    border: 1px solid color-mix(in srgb, var(--el-color-warning) 20%, var(--el-border-color));
    border-radius: 14px;
    transition:
      transform 0.16s ease,
      border-color 0.16s ease,
      box-shadow 0.16s ease;

    &:hover {
      transform: translateY(-1px);
      border-color: color-mix(in srgb, var(--el-color-warning) 42%, var(--el-border-color));
      box-shadow: 0 14px 28px rgba(120, 53, 15, 0.08);
    }
  }

  &__name {
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  &__count {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}
</style>
