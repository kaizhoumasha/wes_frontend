<!--
搜索字段面板组件

Popover 左栏：展示可搜索字段列表，支持高亮和选择。
-->
<template>
  <div class="search-field-panel">
    <div class="search-field-panel__header">
      <div>
        <h4>字段</h4>
        <p class="search-field-panel__hint">
          {{ panelHint }}
        </p>
      </div>
    </div>

    <el-scrollbar class="search-field-panel__list">
      <div
        v-for="field in filteredFields"
        :key="field.key"
        class="search-field-panel__item"
        :class="{
          'search-field-panel__item--active': field.key === activeField,
          'search-field-panel__item--disabled': !isFieldCompatible(field)
        }"
        @click="handleSelectField(field)"
      >
        <div class="search-field-panel__item-content">
          <div
            class="search-field-panel__item-main"
            :class="{ 'search-field-panel__item-main--text-only': !getFieldIcon(field) }"
          >
            <el-icon
              v-if="getFieldIcon(field)"
              class="search-field-panel__item-icon"
            >
              <component :is="getFieldIcon(field)" />
            </el-icon>
            <span class="search-field-panel__item-label">{{ field.label }}</span>
          </div>
        </div>
      </div>

      <el-empty
        v-if="filteredFields.length === 0"
        description="无可用字段"
        :image-size="60"
      />
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import type { SearchFieldDef } from '@/types/search'
import { getCompatibleFields } from '@/utils/search-compiler'

interface Props {
  fields: SearchFieldDef[]
  activeField?: string
  keyword: string
}

interface Emits {
  (e: 'activate-field', fieldKey: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const compatibleFields = computed(() => getCompatibleFields(props.keyword, props.fields))
const hasKeyword = computed(() => props.keyword.trim().length > 0)
const panelHint = computed(() => {
  return hasKeyword.value
    ? '输入中，点击字段会直接追加一个普通条件'
    : '未输入内容时，点击字段会进入该字段的高级搜索'
})
const filteredFields = computed(() => props.fields.filter(field => field.searchable !== false))

function isFieldCompatible(field: SearchFieldDef): boolean {
  return compatibleFields.value.some(candidate => candidate.key === field.key)
}

function getFieldIcon(field: SearchFieldDef) {
  return field.icon
}

function handleSelectField(field: SearchFieldDef) {
  if (!isFieldCompatible(field)) return
  emit('activate-field', field.key)
}
</script>

<style scoped lang="scss">
.search-field-panel {
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

  &__hint {
    margin: 4px 0 0;
    font-size: 12px;
    line-height: 1.4;
    color: var(--el-text-color-secondary);
  }

  &__list {
    flex: 1;
    padding: 8px;
  }

  &__item {
    display: flex;
    align-items: center;
    padding: 9px 12px;
    margin-bottom: 4px;
    border-radius: 8px;
    cursor: pointer;
    transition:
      background-color 0.2s,
      color 0.2s;

    &:hover {
      background-color: var(--el-fill-color-light);
    }

    &--active {
      background-color: var(--el-color-primary-light-9);
      color: var(--el-color-primary);
    }

    &--disabled {
      opacity: 0.4;
      cursor: not-allowed;

      &:hover {
        background-color: transparent;
      }
    }
  }

  &__item-content {
    display: flex;
    align-items: center;
    width: 100%;
  }

  &__item-main {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    flex: 1;

    &--text-only {
      gap: 0;
    }
  }

  &__item-label {
    font-size: 14px;
    min-width: 0;
  }

  &__item-icon {
    font-size: 16px;
    color: var(--el-text-color-secondary);
  }
}
</style>
