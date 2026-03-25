<script setup lang="ts" generic="TItem extends CrudPageEntity">
/**
 * CRUD Detail Field Renderer
 *
 * Renders a single field in a detail panel section.
 * Supports multiple formatter types and layout options.
 */
import { computed } from 'vue'
import { ElTooltip } from 'element-plus'
import type { VNode } from 'vue'
import type { CrudPageEntity } from '../types'
import type { CrudPageDetailField, FormatterFunction } from './types'
import {
  createBooleanTagFormatter,
  createDateFormatter,
  createDateTimeFormatter
} from '@/components/common/table/formatters'

interface Props {
  /** Field configuration */
  field: CrudPageDetailField<TItem>
  /** Entity data */
  item: TItem
  /** Empty value display */
  emptyText?: string
  /** Show dash for empty values */
  emptyDash?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  emptyText: '—',
  emptyDash: true
})

const datetimeFormatter = createDateTimeFormatter()
const dateFormatter = createDateFormatter()
const booleanFormatter = createBooleanTagFormatter()
const formatterColumn = {
  property: ''
} satisfies { property?: string; [key: string]: unknown }

function getEmptyDisplayValue(): string {
  return props.emptyDash ? '—' : props.emptyText
}

function normalizeFormatter(result: string | number | VNode): string | VNode {
  return typeof result === 'number' ? String(result) : result
}

function applySharedFormatter(
  formatter: (
    value: unknown,
    row: Record<string, unknown>,
    column: { property?: string; [key: string]: unknown }
  ) => string | number | VNode,
  value: unknown
): VNode | string {
  return normalizeFormatter(
    formatter(value, props.item as Record<string, unknown>, formatterColumn)
  )
}

const rawValue = computed(() => {
  const keys = props.field.key.split('.')
  let value: unknown = props.item

  for (const key of keys) {
    if (value === null || value === undefined) {
      return undefined
    }
    value = (value as Record<string, unknown>)[key]
  }

  return value
})

/**
 * Check if value is empty (null, undefined, empty string, empty array)
 */
const isEmpty = computed(() => {
  const v = rawValue.value
  if (v === null || v === undefined || v === '') {
    return true
  }
  if (Array.isArray(v) && v.length === 0) {
    return true
  }
  return false
})

/**
 * Check if field should be shown
 */
const shouldShow = computed(() => {
  if (!props.field.showWhen) {
    return true
  }
  return props.field.showWhen(rawValue.value, props.item)
})

// ==================== Formatter Implementation ====================

/**
 * Apply formatter to value
 */
function applyFormatter(value: unknown, formatter: FormatterFunction<TItem>): VNode | string {
  // Built-in formatters
  if (typeof formatter === 'string') {
    const builtInFormatters: Record<string, (value: unknown) => VNode | string> = {
      datetime: currentValue => applySharedFormatter(datetimeFormatter, currentValue),
      date: currentValue => applySharedFormatter(dateFormatter, currentValue),
      boolean: currentValue => applySharedFormatter(booleanFormatter, currentValue)
    }

    if (formatter in builtInFormatters) {
      return builtInFormatters[formatter](value)
    }

    if (formatter === 'status') {
      return String(value ?? '')
    }

    if (formatter === 'json') {
      if (!value) {
        return getEmptyDisplayValue()
      }
      return JSON.stringify(value, null, 2)
    }

    return String(value ?? '')
  }

  // Custom formatter function
  try {
    const result = formatter(value, props.item)
    return result
  } catch (error) {
    console.error(`Formatter error for field ${props.field.key}:`, error)
    return String(value ?? '[格式化错误]')
  }
}

/**
 * Formatted display value
 */
const displayValue = computed(() => {
  if (isEmpty.value) {
    return getEmptyDisplayValue()
  }

  if (props.field.formatter) {
    const result = applyFormatter(rawValue.value, props.field.formatter)
    // If result is a VNode, we'll handle it in the template
    return result
  }

  // Default: convert to string
  const v = rawValue.value
  if (v === null || v === undefined) {
    return getEmptyDisplayValue()
  }

  if (typeof v === 'object') {
    return JSON.stringify(v)
  }

  return String(v)
})

/**
 * Check if display value is a VNode
 */
const isVNode = computed(() => {
  return (
    typeof displayValue.value === 'object' &&
    displayValue.value !== null &&
    'type' in displayValue.value
  )
})

// ==================== Layout ====================

/**
 * Field label
 */
const label = computed(() => {
  return props.field.label ?? props.field.key
})

/**
 * Layout class based on field layout config
 */
const layoutClass = computed(() => {
  switch (props.field.layout) {
    case 'half':
      return 'detail-field--half'
    case 'full':
      return 'detail-field--full'
    case 'third':
      return 'detail-field--third'
    default:
      return 'detail-field--auto'
  }
})

/**
 * Label position class
 */
const labelPositionClass = computed(() => {
  switch (props.field.labelPosition) {
    case 'top':
      return 'detail-field--label-top'
    case 'inline':
      return 'detail-field--label-inline'
    default:
      return 'detail-field--label-left'
  }
})

/**
 * Whether value text needs truncation
 */
const needsTruncation = computed(() => {
  const v = displayValue.value
  if (typeof v === 'string' && v.length > 50) {
    return true
  }
  return false
})
</script>

<template>
  <div
    v-if="shouldShow"
    class="detail-field"
    :class="[layoutClass, labelPositionClass]"
  >
    <!-- Label -->
    <div class="detail-field__label">
      {{ label }}
    </div>

    <!-- Value -->
    <div class="detail-field__value">
      <!-- Empty state -->
      <template v-if="isEmpty">
        <span class="detail-field__empty">{{ emptyDash ? '—' : emptyText }}</span>
      </template>

      <!-- VNode rendering -->
      <template v-else-if="isVNode">
        <component :is="() => displayValue" />
      </template>

      <!-- Truncated text with tooltip -->
      <template v-else-if="needsTruncation">
        <ElTooltip
          :content="String(displayValue)"
          placement="top"
        >
          <span class="detail-field__truncated">{{ displayValue }}</span>
        </ElTooltip>
      </template>

      <!-- Normal text -->
      <template v-else>
        <span>{{ displayValue }}</span>
      </template>
    </div>
  </div>
</template>

<style scoped>
.detail-field {
  display: flex;
  align-items: flex-start;
  padding: 8px 12px;
  transition: background-color 0.15s ease;
}

.detail-field:hover {
  background-color: var(--el-fill-color-light);
  border-radius: 6px;
}

/* Layout variants */
.detail-field--auto {
  flex: 1 1 100%;
}

.detail-field--half {
  flex: 1 1 calc(50% - 8px);
  min-width: 200px;
}

.detail-field--full {
  flex: 1 1 100%;
}

.detail-field--third {
  flex: 1 1 calc(33.333% - 8px);
  min-width: 150px;
}

/* Label position variants */
.detail-field--label-left {
  flex-direction: row;
  gap: 16px;
}

.detail-field--label-top {
  flex-direction: column;
  gap: 4px;
}

.detail-field--label-inline {
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.detail-field--label-top .detail-field__label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

/* Label styling */
.detail-field__label {
  flex-shrink: 0;
  min-width: 80px;
  font-size: 13px;
  color: var(--el-text-color-regular);
  font-weight: 500;
}

/* Value styling */
.detail-field__value {
  flex: 1;
  font-size: 14px;
  color: var(--el-text-color-primary);
  overflow-wrap: anywhere;
}

.detail-field__empty {
  color: var(--el-text-color-placeholder);
}

.detail-field__truncated {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
}

/* Mobile touch optimization */
@media (width <= 767px) {
  .detail-field {
    padding: 12px 16px;
    min-height: 44px;
  }

  .detail-field__label {
    min-width: 70px;
  }
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .detail-field:hover {
    background-color: var(--el-fill-color-dark);
  }
}
</style>
