<script setup lang="ts">
import { computed, inject } from 'vue'
import { ElTag } from 'element-plus'
import type { SearchConditionDraft } from '@/types/search'
import { CRUD_PAGE_SEARCH_ACTIONS_KEY } from './types'

type TagType = 'primary' | 'success' | 'warning' | 'danger' | 'info'

interface Props {
  field: string
  value: unknown
  text: string
  operator?: SearchConditionDraft['operator']
  tagType?: TagType
}

const props = withDefaults(defineProps<Props>(), {
  operator: 'equals',
  tagType: undefined
})

const searchActions = inject(CRUD_PAGE_SEARCH_ACTIONS_KEY, null)

const clickable = computed(() => {
  return Boolean(
    searchActions && props.value !== undefined && props.value !== null && props.value !== ''
  )
})

function handleClick(): void {
  if (!clickable.value) {
    return
  }

  searchActions?.applyQuickFilter({
    field: props.field,
    operator: props.operator,
    value: props.value
  })
}
</script>

<template>
  <button
    v-if="clickable"
    type="button"
    class="crud-quick-filter-link"
    @click.stop="handleClick"
  >
    <ElTag
      v-if="tagType"
      :type="tagType"
      size="small"
      effect="light"
    >
      {{ text }}
    </ElTag>
    <span
      v-else
      class="crud-quick-filter-link__text"
    >
      {{ text }}
    </span>
  </button>

  <span
    v-else
    class="crud-quick-filter-link__static"
  >
    <ElTag
      v-if="tagType"
      :type="tagType"
      size="small"
      effect="light"
    >
      {{ text }}
    </ElTag>
    <span v-else>{{ text }}</span>
  </span>
</template>

<style scoped>
.crud-quick-filter-link {
  display: inline-flex;
  align-items: center;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.crud-quick-filter-link__text {
  color: var(--el-color-primary);
}

.crud-quick-filter-link__static {
  display: inline-flex;
  align-items: center;
}
</style>
