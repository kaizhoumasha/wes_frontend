<!--
搜索字段面板组件

Popover 左栏：展示可搜索字段列表，支持高亮和选择。
-->
<template>
  <div class="search-field-panel">
    <div class="search-field-panel__header">
      <h4>字段</h4>
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
          <span class="search-field-panel__item-label">{{ field.label }}</span>
          <el-icon
            v-if="getFieldIcon(field)"
            class="search-field-panel__item-icon"
          >
            <component :is="getFieldIcon(field)" />
          </el-icon>
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

// ==================== 类型定义 ====================

interface Props {
  /** 字段列表 */
  fields: SearchFieldDef[]
  /** 当前高亮字段 */
  activeField?: string
  /** 当前关键字 */
  keyword: string
}

interface Emits {
  /** 激活字段（点击字段项） */
  (e: 'activate-field', fieldKey: string): void
}

// ==================== Props & Emits ====================

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// ==================== 计算属性 ====================

/**
 * 兼容当前关键字的字段列表
 */
const compatibleFields = computed(() => getCompatibleFields(props.keyword, props.fields))

/**
 * 过滤后的字段列表（只显示可搜索字段）
 */
const filteredFields = computed(() => props.fields.filter(f => f.searchable !== false))

// ==================== 辅助函数 ====================

/**
 * 判断字段是否与当前关键字兼容
 */
function isFieldCompatible(field: SearchFieldDef): boolean {
  return compatibleFields.value.some(f => f.key === field.key)
}

/**
 * 获取字段图标（从字段定义配置中读取）
 */
function getFieldIcon(field: SearchFieldDef) {
  return field.icon
}

// ==================== 事件处理 ====================

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

  &__list {
    flex: 1;
    padding: 8px;
  }

  &__item {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    margin-bottom: 4px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;

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
    justify-content: space-between;
    width: 100%;
  }

  &__item-label {
    font-size: 14px;
  }

  &__item-icon {
    font-size: 16px;
  }
}
</style>
