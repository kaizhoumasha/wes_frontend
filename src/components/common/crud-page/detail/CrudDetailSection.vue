<script setup lang="ts" generic="TItem extends CrudPageEntity">
/**
 * CRUD Detail Section Renderer
 *
 * Renders a section in the detail panel with fields or relation data.
 * Supports collapse and visual weight variants.
 */
import { computed, ref, watch } from 'vue'
import { ElCollapseTransition, ElTag, ElTable, ElEmpty } from 'element-plus'
import AppIcon from '@/components/ui/AppIcon.vue'
import type { CrudPageEntity } from '../types'
import type { CrudPageDetailSection, CrudPageDetailField } from './types'
import CrudDetailField from './CrudDetailField.vue'

interface Props {
  /** Section configuration */
  section: CrudPageDetailSection<TItem>
  /** Entity data */
  item: TItem
  /** Whether section is collapsed */
  collapsed?: boolean
  /** Empty value display config */
  emptyValue?: {
    text?: string
    icon?: string
    dash?: boolean
  }
}

const props = withDefaults(defineProps<Props>(), {
  collapsed: false,
  emptyValue: undefined
})

const emit = defineEmits<{
  (e: 'toggle-collapse'): void
}>()

// ==================== Section Visibility ====================

/**
 * Check if section should be shown
 */
const shouldShow = computed(() => {
  if (!props.section.showWhen) {
    return true
  }
  return props.section.showWhen(props.item)
})

// ==================== Visual Styling ====================

/**
 * Section weight class
 */
const weightClass = computed(() => {
  const weight = props.section.weight ?? 'primary'
  return `detail-section--${weight}`
})

/**
 * Section variant class
 */
const variantClass = computed(() => {
  const variant = props.section.variant ?? 'card'
  return `detail-section--${variant}`
})

/**
 * Container classes
 */
const containerClasses = computed(() => [
  'detail-section',
  weightClass.value,
  variantClass.value,
  {
    'detail-section--headless': !props.section.title && !props.section.icon,
    'detail-section--collapsible': props.section.collapsible,
    'detail-section--collapsed': props.collapsed
  }
])

// ==================== Collapse State ====================

/**
 * Handle collapse toggle
 */
function handleToggleCollapse() {
  if (props.section.collapsible) {
    emit('toggle-collapse')
  }
}

// ==================== Relation Data ====================

const relationLoading = ref(false)
const relationError = ref<Error | null>(null)
const relationData = ref<unknown[]>([])
let relationRequestToken = 0

/**
 * Load relation data if configured
 */
async function loadRelationData() {
  if (!props.section.relation) {
    return
  }

  relationLoading.value = true
  relationError.value = null
  const requestToken = ++relationRequestToken

  try {
    const data = await props.section.relation!.data(props.item)
    if (requestToken !== relationRequestToken) {
      return
    }
    relationData.value = Array.isArray(data) ? data : []
  } catch (err) {
    if (requestToken !== relationRequestToken) {
      return
    }
    relationError.value = err instanceof Error ? err : new Error(String(err))
    relationData.value = []
    props.section.relation?.onError?.(relationError.value)
  } finally {
    if (requestToken === relationRequestToken) {
      relationLoading.value = false
    }
  }
}

// Load relation data when item changes
watch(
  () => props.item,
  () => {
    if (props.section.relation && shouldShow.value) {
      void loadRelationData()
    }
  },
  { immediate: true }
)

// ==================== Field Rendering ====================

/**
 * Fields to render
 */
const fields = computed<CrudPageDetailField<TItem>[]>(() => {
  return (props.section.fields ?? []) as CrudPageDetailField<TItem>[]
})

/**
 * Empty value config
 */
const emptyText = computed(() => props.emptyValue?.text ?? '—')
const emptyDash = computed(() => props.emptyValue?.dash ?? true)

function getTagDisplayText(tag: unknown): string {
  if (tag && typeof tag === 'object') {
    const name = (tag as { name?: unknown }).name
    if (name !== null && name !== undefined && name !== '') {
      return String(name)
    }
    return JSON.stringify(tag)
  }

  return String(tag ?? '')
}
</script>

<template>
  <div
    v-if="shouldShow"
    :class="containerClasses"
  >
    <!-- Section Header -->
    <div
      v-if="section.title || section.icon"
      class="detail-section__header"
      :class="{ 'detail-section__header--clickable': section.collapsible }"
      @click="handleToggleCollapse"
    >
      <!-- Icon -->
      <AppIcon
        v-if="section.icon"
        :icon="section.icon"
        :size="16"
        class="detail-section__icon"
      />

      <!-- Title -->
      <span class="detail-section__title">
        {{ section.title }}
      </span>

      <!-- Collapse Toggle -->
      <AppIcon
        v-if="section.collapsible"
        :icon="collapsed ? 'ep:arrow-right' : 'ep:arrow-down'"
        :size="12"
        class="detail-section__toggle"
      />
    </div>

    <!-- Section Content -->
    <ElCollapseTransition>
      <div
        v-show="!collapsed"
        class="detail-section__content"
      >
        <!-- Relation Data Mode -->
        <template v-if="section.relation">
          <!-- Loading State -->
          <div
            v-if="relationLoading"
            class="detail-section__loading"
          >
            <AppIcon
              icon="ep:loading"
              :size="20"
              class="is-loading"
            />
            <span>加载中...</span>
          </div>

          <!-- Error State -->
          <div
            v-else-if="relationError"
            class="detail-section__error"
          >
            <span>加载失败: {{ relationError.message }}</span>
          </div>

          <!-- Empty State -->
          <ElEmpty
            v-else-if="relationData.length === 0"
            :description="section.relation.emptyText ?? '暂无数据'"
            :image-size="60"
          />

          <!-- Data Display -->
          <template v-else>
            <!-- Tags Display -->
            <div
              v-if="section.relation.type === 'tags'"
              class="detail-section__tags"
            >
              <ElTag
                v-for="(tag, index) in relationData"
                :key="index"
                class="detail-section__tag"
              >
                {{ getTagDisplayText(tag) }}
              </ElTag>
            </div>

            <!-- Table Display -->
            <ElTable
              v-else-if="section.relation.type === 'table'"
              :data="relationData"
              size="small"
              border
            >
              <ElTable.Column
                v-for="col in section.relation.columns"
                :key="col.key"
                :prop="col.key"
                :label="col.label"
              />
            </ElTable>

            <!-- List Display (default) -->
            <div
              v-else
              class="detail-section__list"
            >
              <div
                v-for="(relationItem, index) in relationData"
                :key="index"
                class="detail-section__list-item"
              >
                {{ typeof relationItem === 'object' ? JSON.stringify(relationItem) : relationItem }}
              </div>
            </div>
          </template>
        </template>

        <!-- Fields Mode (default) -->
        <template v-else-if="fields.length > 0">
          <div class="detail-section__fields">
            <CrudDetailField
              v-for="field in fields"
              :key="field.key"
              :field="field"
              :item="item"
              :appearance="section.weight === 'tertiary' ? 'meta' : 'default'"
              :empty-text="emptyText"
              :empty-dash="emptyDash"
            />
          </div>
        </template>
      </div>
    </ElCollapseTransition>
  </div>
</template>

<style scoped>
/* ============================================
   Editorial Detail Section
   使用项目 CSS 变量，保持主题一致性
   ============================================ */

.detail-section {
  position: relative;
  margin-bottom: 0;
  border-radius: 0;
  overflow: hidden;
  border: none;
  background: transparent;
  box-shadow: none;
}

/* Weight variants */
.detail-section--primary {
  position: relative;
}

/* Primary section 左侧强调线 */
.detail-section--primary::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--el-color-primary);
  border-radius: 2px;
}

.detail-section--secondary {
  /* Secondary: 更轻量的样式，使用灰色左边框 */
  position: relative;
}

.detail-section--secondary::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--el-border-color);
  border-radius: 1px;
}

.detail-section--tertiary {
  border-top: 1px solid var(--el-border-color-lighter);
  padding-top: 16px;
}

/* Variant styles */
.detail-section--card {
  border-radius: 12px;
  border: 1px solid var(--el-border-color-light);
  background: var(--el-bg-color);
  box-shadow: var(--el-box-shadow-lighter);
}

.detail-section--flat {
  box-shadow: none;
  border: none;
  background: transparent;
}

.detail-section--outlined {
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
}

.detail-section--filled {
  background: var(--el-fill-color);
  border-radius: 8px;
}

/* Header */
.detail-section__header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px 14px;
  font-weight: 600;
  font-size: 15px;
  letter-spacing: 0;
  color: var(--el-text-color-primary);
}

/* Primary header: 更醒目 */
.detail-section--primary .detail-section__header {
  padding-left: 20px;
}

.detail-section__header--clickable {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s ease;

  /* 性能优化: 预告浏览器背景色变化 */
  will-change: background-color;
}

.detail-section__header--clickable:hover {
  background: var(--el-fill-color-extra-light);
}

/* Icon - minimal style without colored circle */
.detail-section__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  color: var(--el-text-color-secondary);
}

.detail-section__title {
  flex: 1;
  letter-spacing: -0.01em;
}

.detail-section__toggle {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.detail-section--collapsed .detail-section__toggle {
  transform: rotate(0deg);
}

/* Content */
.detail-section__content {
  padding: 0 20px 20px;
}

/* Primary section 内边距调整 */
.detail-section--primary .detail-section__content {
  padding-left: 20px;
}

.detail-section--headless .detail-section__content {
  padding-top: 16px;
}

/* Tertiary - 更紧凑的元数据展示 */
.detail-section--tertiary .detail-section__header {
  padding: 0 0 10px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(--el-text-color-secondary);
}

.detail-section--tertiary .detail-section__icon {
  width: 16px;
  height: 16px;
  color: var(--el-text-color-placeholder);
}

.detail-section--tertiary .detail-section__content,
.detail-section--tertiary.detail-section--primary .detail-section__content {
  padding: 0 0 4px;
}

/* Fields grid */
.detail-section__fields {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 24px;
}

/* Tags */
.detail-section__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 4px 0 0;
}

.detail-section__tag {
  margin: 0;
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  background: var(--el-fill-color-blank);
  font-weight: 500;
}

/* List */
.detail-section__list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 4px 0 0;
}

.detail-section__list-item {
  padding: 10px 14px;
  border-left: 2px solid var(--el-border-color);
  border-radius: 0;
  background: var(--el-fill-color-lighter);
  font-size: 13px;
  color: var(--el-text-color-regular);
}

/* Loading & Error */
.detail-section__loading,
.detail-section__error {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 80px;
  padding: 20px;
  color: var(--el-text-color-secondary);
}

.detail-section__error {
  color: var(--el-color-danger);
}

/* Loading animation */
.detail-section__loading .is-loading {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Mobile optimization */
@media (width <= 767px) {
  .detail-section__header {
    min-height: 44px;
    padding: 14px 16px 12px;
  }

  .detail-section--primary .detail-section__header {
    padding-left: 16px;
  }

  .detail-section__header--clickable {
    padding: 14px 16px;
  }

  .detail-section__content,
  .detail-section--primary .detail-section__content {
    padding: 0 16px 16px;
  }

  .detail-section--headless .detail-section__content {
    padding-top: 14px;
  }

  .detail-section--tertiary {
    padding-left: 16px;
    padding-right: 16px;
  }

  .detail-section--tertiary .detail-section__header {
    padding: 0 0 10px;
  }

  .detail-section--tertiary .detail-section__content {
    padding: 0;
  }
}
</style>