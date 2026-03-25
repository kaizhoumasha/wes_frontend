<script setup lang="ts" generic="TItem extends CrudPageEntity">
import { ElSkeleton, ElEmpty, ElButton, ElAlert } from 'element-plus'
import { computed } from 'vue'
import type { CrudPageEntity } from '../types'
import type { CrudPageDetailSection } from './types'
import CrudDetailSection from './CrudDetailSection.vue'

interface Props {
  loading: boolean
  error: Error | null
  item: TItem | null
  sections: CrudPageDetailSection<TItem>[]
  emptyValue?: {
    text?: string
    icon?: string
    dash?: boolean
  }
  isSectionCollapsed: (section: CrudPageDetailSection<TItem>) => boolean
  onToggleCollapse: (section: CrudPageDetailSection<TItem>) => void
  onRefresh: () => void
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const primarySections = computed(() => {
  return props.sections.filter(section => section.weight !== 'tertiary')
})

const tertiarySections = computed(() => {
  return props.sections.filter(section => section.weight === 'tertiary')
})
</script>

<template>
  <template v-if="loading">
    <div class="detail-panel__loading">
      <ElSkeleton
        :rows="5"
        animated
      />
    </div>
  </template>

  <template v-else-if="error">
    <div class="detail-panel__error">
      <ElAlert
        type="error"
        :title="`加载失败: ${error.message}`"
        show-icon
        :closable="false"
      >
        <template #default>
          <ElButton
            size="small"
            @click="onRefresh"
          >
            重试
          </ElButton>
        </template>
      </ElAlert>
    </div>
  </template>

  <template v-else-if="!item">
    <div class="detail-panel__empty">
      <ElEmpty description="暂无数据">
        <template #description>
          <p class="detail-panel__empty-text">
            未找到相关信息
          </p>
          <p class="detail-panel__empty-hint">
            请尝试刷新或选择其他条目
          </p>
        </template>
        <ElButton @click="emit('close')">
          关闭面板
        </ElButton>
      </ElEmpty>
    </div>
  </template>

  <template v-else>
    <div class="detail-panel__content">
      <CrudDetailSection
        v-for="(section, index) in primarySections"
        :key="section.title ?? `section-${index}`"
        :section="section"
        :item="item"
        :collapsed="isSectionCollapsed(section)"
        :empty-value="emptyValue"
        @toggle-collapse="onToggleCollapse(section)"
      />

      <div
        v-if="tertiarySections.length > 0"
        class="detail-panel__footer-meta"
      >
        <CrudDetailSection
          v-for="(section, index) in tertiarySections"
          :key="section.title ?? `tertiary-section-${index}`"
          :section="section"
          :item="item"
          :collapsed="isSectionCollapsed(section)"
          :empty-value="emptyValue"
          @toggle-collapse="onToggleCollapse(section)"
        />
      </div>
    </div>
  </template>
</template>

<style scoped>
/* ============================================
   Editorial Detail Body
   使用项目 CSS 变量，保持主题一致性
   ============================================ */

.detail-panel__content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
}

.detail-panel__footer-meta {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.detail-panel__loading,
.detail-panel__error,
.detail-panel__empty {
  padding: 32px;
}

.detail-panel__empty-text {
  margin: 0 0 4px;
  font-size: 15px;
  color: var(--el-text-color-secondary);
}

.detail-panel__empty-hint {
  margin: 0;
  font-size: 13px;
  color: var(--el-text-color-placeholder);
}

:deep(.el-skeleton) {
  --el-skeleton-color: var(--el-fill-color);
  --el-skeleton-to-color: var(--el-fill-color-light);
}

:deep(.el-empty) {
  padding: 48px 0;
}

@media (width <= 767px) {
  .detail-panel__content {
    gap: 14px;
    padding: 16px;
  }

  .detail-panel__footer-meta {
    gap: 10px;
    padding-top: 14px;
  }
}
</style>
