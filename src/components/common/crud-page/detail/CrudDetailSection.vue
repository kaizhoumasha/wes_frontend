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
.detail-section {
  margin-bottom: 16px;
  border-radius: 8px;
  overflow: hidden;
}

/* Weight variants */
.detail-section--primary {
  background-color: var(--el-fill-color-light);
}

.detail-section--secondary {
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
}

.detail-section--tertiary {
  background-color: transparent;
}

/* Variant styles */
.detail-section--card {
  box-shadow: 0 1px 3px rgb(0 0 0 / 5%);
}

.detail-section--flat {
  box-shadow: none;
}

.detail-section--outlined {
  border: 1px solid var(--el-border-color);
}

.detail-section--filled {
  background-color: var(--el-fill-color);
}

/* Header */
.detail-section__header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  font-weight: 600;
  font-size: 14px;
  color: var(--el-text-color-primary);
}

.detail-section__header--clickable {
  cursor: pointer;
  user-select: none;
}

.detail-section__header--clickable:hover {
  background-color: var(--el-fill-color);
}

.detail-section__icon {
  font-size: 16px;
  color: var(--el-color-primary);
}

.detail-section__title {
  flex: 1;
}

.detail-section__toggle {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  transition: transform 0.2s ease;
}

.detail-section--collapsed .detail-section__toggle {
  transform: rotate(0deg);
}

/* Content */
.detail-section__content {
  padding: 8px 0;
}

.detail-section--primary .detail-section__content {
  padding: 12px 8px;
}

/* Fields grid */
.detail-section__fields {
  display: flex;
  flex-wrap: wrap;
  gap: 0;
}

/* Tags */
.detail-section__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 16px;
}

.detail-section__tag {
  margin: 0;
}

/* List */
.detail-section__list {
  padding: 0 16px;
}

.detail-section__list-item {
  padding: 8px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
  font-size: 14px;
}

.detail-section__list-item:last-child {
  border-bottom: none;
}

/* Loading & Error */
.detail-section__loading,
.detail-section__error {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px;
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
    padding: 12px 16px;
  }

  .detail-section__header--clickable {
    /* Increase touch target */
    padding: 14px 16px;
  }
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .detail-section--primary {
    background-color: var(--el-fill-color-dark);
  }

  .detail-section--secondary {
    border-color: var(--el-border-color);
  }
}
</style>
