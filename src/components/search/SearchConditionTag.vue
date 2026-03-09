<!--
搜索条件标签组件

用于显示单个搜索条件，支持删除操作。
-->
<template>
  <el-tag
    class="search-condition-tag"
    :class="{ 'search-condition-tag--selected': selected }"
    :closable="true"
    :type="displayTagType"
    :effect="tagEffect"
    :disable-transitions="false"
    @close="handleClose"
  >
    <span
      class="search-condition-tag__label"
      :title="condition.label"
    >
      {{ condition.label }}
    </span>
  </el-tag>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import type { SearchCondition } from '@/types/search'

// ==================== 类型定义 ====================

interface Props {
  /** 搜索条件 */
  condition: SearchCondition
  /** 是否处于键盘选中高亮状态 */
  selected?: boolean
}

interface Emits {
  /** 删除条件 */
  (e: 'remove', id: string): void
}

// ==================== Props & Emits ====================

const props = withDefaults(defineProps<Props>(), {
  selected: false
})
const emit = defineEmits<Emits>()

// ==================== 计算属性 ====================
const tagType = computed(() => {
  switch (props.condition.source) {
    case 'quick':
      return 'success'
    case 'favorite':
      return 'warning'
    case 'manual':
    default:
      return 'info'
  }
})

const displayTagType = computed(() => (props.selected ? 'primary' : tagType.value))
const tagEffect = computed(() => (props.selected ? 'dark' : 'light'))

// ==================== 事件处理 ====================

function handleClose() {
  emit('remove', props.condition.id)
}
</script>

<style scoped lang="scss">
.search-condition-tag {
  &--selected {
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--el-color-primary) 22%, transparent);

    :deep(.el-tag__close) {
      color: inherit;
    }
  }

  &__label {
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: inline-block;
    vertical-align: middle;
  }
}
</style>
