<script setup lang="ts" generic="TItem extends CrudPageEntity">
import { ElSkeleton, ElEmpty, ElButton, ElAlert } from 'element-plus'
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

defineProps<Props>()
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
    <ElEmpty description="暂无数据" />
  </template>

  <template v-else>
    <div class="detail-panel__content">
      <CrudDetailSection
        v-for="(section, index) in sections"
        :key="section.title ?? `section-${index}`"
        :section="section"
        :item="item"
        :collapsed="isSectionCollapsed(section)"
        :empty-value="emptyValue"
        @toggle-collapse="onToggleCollapse(section)"
      />
    </div>
  </template>
</template>
