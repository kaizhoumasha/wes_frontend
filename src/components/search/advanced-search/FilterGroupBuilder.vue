<template>
  <section class="filter-group-builder" :class="depthClass">
    <header class="filter-group-builder__header">
      <div class="filter-group-builder__headline">
        <CoupleSelector :model-value="group.couple" @update:model-value="handleCoupleChange" />
        <span v-if="!root" class="filter-group-builder__meta">
          {{ group.conditions.length }} 项规则
        </span>
      </div>

      <div class="filter-group-builder__actions">
        <el-button size="small" @click="handleAddCondition">+ 条件</el-button>
        <el-button size="small" :disabled="disableAddGroup" @click="handleAddGroup">+ 组</el-button>
        <el-button
          v-if="root && group.conditions.length > 0"
          size="small"
          text
          @click="emit('clear-root')"
        >
          清空全部
        </el-button>
        <el-dropdown v-else trigger="click">
          <el-button size="small" text>更多</el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                v-if="group.conditions.length > 0"
                @click="handleClearGroup"
              >
                清空本组
              </el-dropdown-item>
              <el-dropdown-item
                class="filter-group-builder__danger-action"
                @click="emit('remove')"
              >
                删除本组
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </header>

    <div v-if="disableAddGroup" class="filter-group-builder__depth-hint">
      已达到最大嵌套深度（{{ maxDepth }} 层）
    </div>

    <div v-if="group.conditions.length === 0" class="filter-group-builder__empty">
      <p>暂无条件</p>
      <span>点击上方按钮添加条件或子组</span>
    </div>

    <div v-else class="filter-group-builder__body">
      <template v-for="item in group.conditions" :key="item.id">
        <FilterConditionRow
          v-if="!isUIFilterGroup(item)"
          :condition="item"
          :fields="fields"
          @update="value => updateItem(item.id, value)"
          @remove="() => removeItem(item.id)"
        />

        <FilterGroupBuilder
          v-else
          :group="item"
          :fields="fields"
          :depth="depth + 1"
          :max-depth="maxDepth"
          :root="false"
          @update="value => updateItem(item.id, value)"
          @remove="() => removeItem(item.id)"
          @clear-root="emit('clear-root')"
        />
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import type { SearchFieldDef, UIFilterCondition, UIFilterGroup } from '@/types/search'
import {
  createEmptyCondition,
  createEmptyGroup,
  isUIFilterGroup,
  MAX_ADVANCED_SEARCH_DEPTH
} from '@/utils/advanced-search'
import CoupleSelector from './CoupleSelector.vue'
import FilterConditionRow from './FilterConditionRow.vue'

interface Props {
  group: UIFilterGroup
  fields: SearchFieldDef[]
  depth?: number
  maxDepth?: number
  root?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  depth: 0,
  maxDepth: MAX_ADVANCED_SEARCH_DEPTH,
  root: false
})

const emit = defineEmits<{
  (e: 'update', value: UIFilterGroup): void
  (e: 'remove'): void
  (e: 'clear-root'): void
}>()

const disableAddGroup = computed(() => props.depth >= props.maxDepth - 1)
const depthClass = computed(() => `filter-group-builder--depth-${Math.min(props.depth, 2)}`)

function emitNextConditions(
  conditions: Array<UIFilterCondition | UIFilterGroup>,
  patch?: Partial<UIFilterGroup>
) {
  emit('update', {
    ...props.group,
    ...patch,
    conditions
  })
}

function handleCoupleChange(value: UIFilterGroup['couple']) {
  emit('update', {
    ...props.group,
    couple: value
  })
}

function handleAddCondition() {
  emitNextConditions([...props.group.conditions, createEmptyCondition(props.fields)])
}

function handleAddGroup() {
  if (disableAddGroup.value) {
    return
  }

  emitNextConditions([
    ...props.group.conditions,
    {
      ...createEmptyGroup('and'),
      conditions: [createEmptyCondition(props.fields)]
    }
  ])
}

function handleClearGroup() {
  emitNextConditions([])
}

function updateItem(itemId: string, value: UIFilterCondition | UIFilterGroup) {
  emitNextConditions(props.group.conditions.map(item => (item.id === itemId ? value : item)))
}

function removeItem(itemId: string) {
  emitNextConditions(props.group.conditions.filter(item => item.id !== itemId))
}
</script>

<style scoped lang="scss">
.filter-group-builder {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
  border-radius: 22px;

  &--depth-0 {
    background:
      linear-gradient(180deg, color-mix(in srgb, var(--el-color-primary-light-9) 72%, transparent), transparent 42%),
      var(--el-bg-color);
    border: 1px solid color-mix(in srgb, var(--el-color-primary) 24%, var(--el-border-color));
    box-shadow: 0 18px 44px rgba(15, 23, 42, 0.06);
  }

  &--depth-1 {
    margin-left: 12px;
    background: color-mix(in srgb, var(--el-fill-color-light) 84%, transparent);
    border: 1px dashed color-mix(in srgb, var(--el-color-primary) 35%, var(--el-border-color));
  }

  &--depth-2 {
    margin-left: 24px;
    background: color-mix(in srgb, var(--el-fill-color) 88%, transparent);
    border: 1px dotted color-mix(in srgb, var(--el-color-success) 30%, var(--el-border-color));
  }

  &__header,
  &__headline,
  &__actions {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
  }

  &__meta,
  &__depth-hint {
    color: var(--el-text-color-secondary);
    font-size: 12px;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__danger-action {
    color: var(--el-color-danger);
  }

  &__empty {
    display: grid;
    place-items: center;
    min-height: 120px;
    text-align: center;
    border: 1px dashed var(--el-border-color);
    border-radius: 16px;
    color: var(--el-text-color-secondary);

    p {
      margin: 0;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    span {
      font-size: 12px;
    }
  }
}

@media (max-width: 768px) {
  .filter-group-builder {
    padding: 14px;

    &--depth-1,
    &--depth-2 {
      margin-left: 0;
    }
  }
}
</style>
