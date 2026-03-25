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
import { getDetailFieldTruncationLimit, resolveDetailFieldLayout } from './detailFieldLayout'
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
  /** Visual appearance */
  appearance?: 'default' | 'meta'
  /** Empty value display */
  emptyText?: string
  /** Show dash for empty values */
  emptyDash?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  appearance: 'default',
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

/**
 * Safe JSON stringify with depth and length limits
 */
function safeJsonStringify(value: unknown, maxDepth = 3, maxLength = 500): string {
  function stringify(val: unknown, depth: number): string {
    if (depth > maxDepth) {
      return '[...]'
    }

    if (val === null) return 'null'
    if (val === undefined) return 'undefined'
    if (typeof val !== 'object') {
      const str = String(val)
      return str.length > maxLength ? str.slice(0, maxLength) + '...' : str
    }

    if (Array.isArray(val)) {
      if (val.length === 0) return '[]'
      if (val.length > 10) {
        const items = val.slice(0, 10).map(item => stringify(item, depth + 1))
        return `[${items.join(', ')}, ... (${val.length} items)]`
      }
      const items = val.map(item => stringify(item, depth + 1))
      return `[${items.join(', ')}]`
    }

    const keys = Object.keys(val as Record<string, unknown>)
    if (keys.length === 0) return '{}'
    if (keys.length > 10) {
      const entries = keys.slice(0, 10).map(key => {
        const v = (val as Record<string, unknown>)[key]
        return `${key}: ${stringify(v, depth + 1)}`
      })
      return `{${entries.join(', ')}, ... (${keys.length} keys)}`
    }

    const entries = keys.map(key => {
      const v = (val as Record<string, unknown>)[key]
      return `${key}: ${stringify(v, depth + 1)}`
    })
    return `{${entries.join(', ')}}`
  }

  const result = stringify(value, 0)
  return result.length > maxLength ? result.slice(0, maxLength) + '...' : result
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
      return safeJsonStringify(value)
    }

    return String(value ?? '')
  }

  // Custom formatter function
  try {
    const result = formatter(value, props.item)
    return result
  } catch {
    // Formatter failed, return fallback display
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
    return safeJsonStringify(v)
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
const resolvedLayout = computed(() => {
  return resolveDetailFieldLayout(props.field, rawValue.value)
})

const layoutClass = computed(() => {
  switch (resolvedLayout.value) {
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

const appearanceClass = computed(() => {
  return props.appearance === 'meta' ? 'detail-field--meta' : 'detail-field--default'
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
  const truncationLimit = getDetailFieldTruncationLimit(resolvedLayout.value)

  if (typeof v === 'string' && v.length > truncationLimit) {
    return true
  }
  return false
})
</script>

<template>
  <div
    v-if="shouldShow"
    class="detail-field"
    :class="[layoutClass, labelPositionClass, appearanceClass]"
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
/* ============================================
   Editorial Detail Field
   使用项目 CSS 变量，保持主题一致性
   ============================================ */

.detail-field {
  position: relative;
  display: flex;
  align-items: flex-start;
  min-height: 44px;
  padding: 12px 0;
  background: transparent;
  transition: background-color 0.2s ease;
}

.detail-field:hover {
  background: var(--el-fill-color-extra-light);
}

/* Meta 外观: 更轻量的元数据展示 */
.detail-field--meta {
  min-height: auto;
  padding: 8px 0;
  background: transparent;
}

.detail-field--meta:hover {
  background: transparent;
}

/* Layout variants */
.detail-field--auto {
  flex: 1 1 calc(50% - 12px);
  min-width: 200px;
}

.detail-field--half {
  flex: 1 1 calc(50% - 12px);
  min-width: 200px;
}

.detail-field--full {
  flex: 1 1 100%;
}

.detail-field--third {
  flex: 1 1 calc(33.333% - 16px);
  min-width: 160px;
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
  gap: 6px;
}

.detail-field--label-top .detail-field__label {
  font-size: 11px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

/* Label styling */
.detail-field__label {
  flex-shrink: 0;
  min-width: 88px;
  font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', ui-monospace, monospace;
  font-size: 13px;
  line-height: 1.5;
  color: var(--el-text-color-secondary);
  font-weight: 500;
  letter-spacing: 0.01em;
}

.detail-field--meta .detail-field__label {
  min-width: 72px;
  font-size: 12px;
}

/* Value styling */
.detail-field__value {
  flex: 1;
  min-width: 0;
  font-size: 15px;
  line-height: 1.6;
  color: var(--el-text-color-primary);
  font-weight: 600;
  overflow-wrap: anywhere;
}

.detail-field--meta .detail-field__value {
  font-size: 13px;
  color: var(--el-text-color-regular);
  font-weight: 500;
}

.detail-field__empty {
  color: var(--el-text-color-placeholder);
  font-weight: 400;
  font-style: italic;
}

.detail-field__truncated {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: help;
}

/* Mobile optimization */
@media (width <= 767px) {
  .detail-field {
    min-height: 44px;
    padding: 12px 0;
  }

  .detail-field--meta {
    min-height: auto;
    padding: 8px 0;
  }

  .detail-field__label {
    min-width: 72px;
    font-size: 13px;
  }

  .detail-field__value {
    font-size: 15px;
  }

  .detail-field--auto,
  .detail-field--half,
  .detail-field--third,
  .detail-field--full {
    flex-basis: 100%;
    min-width: 100%;
  }
}
</style>
