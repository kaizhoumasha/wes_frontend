import { h, type VNode } from 'vue'
import type { FormatterFunction } from '@/components/common/crud-page/detail/types'
import type { CrudPageEntity } from '@/components/common/crud-page/types'
import CrudQuickFilterLink from '@/components/common/crud-page/CrudQuickFilterLink.vue'
import type { ColumnFormatter } from '@/components/ui/table/table.types'
import type { SearchConditionDraft } from '@/types/search'
import { parseApiTime } from '@/utils/timezone'
import { useTimezoneStore } from '@/stores/timezone'

type TagType = 'primary' | 'success' | 'warning' | 'danger' | 'info'

interface QuickFilterRendererOptions {
  field: string
  operator?: SearchConditionDraft['operator']
  emptyLabel?: string
  filterValue?: (value: unknown) => unknown
  label?: (value: unknown) => string
  tagType?: (value: unknown) => TagType | undefined
}

function createQuickFilterNode(
  value: unknown,
  options: QuickFilterRendererOptions
): VNode | string {
  if (value === null || value === undefined || value === '') {
    return options.emptyLabel ?? '-'
  }

  return h(CrudQuickFilterLink, {
    field: options.field,
    value: options.filterValue ? options.filterValue(value) : value,
    text: options.label ? options.label(value) : String(value),
    operator: options.operator ?? 'equals',
    tagType: options.tagType?.(value)
  })
}

export function createQuickFilterFormatter(options: QuickFilterRendererOptions): ColumnFormatter {
  return value => createQuickFilterNode(value, options)
}

export function createQuickFilterDetailFormatter<TItem extends CrudPageEntity>(
  options: QuickFilterRendererOptions
): FormatterFunction<TItem> {
  return value => createQuickFilterNode(value, options)
}

function normalizeNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const numericValue = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(numericValue) ? numericValue : null
}

function trimTrailingZeros(value: number, maximumFractionDigits = 2): string {
  const roundedValue =
    Math.round((value + Number.EPSILON) * 10 ** maximumFractionDigits) / 10 ** maximumFractionDigits

  return roundedValue.toFixed(maximumFractionDigits).replace(/\.?0+$/, '')
}

export function formatDurationFromMilliseconds(value: unknown): string {
  const numericValue = normalizeNumber(value)

  if (numericValue === null) {
    return '-'
  }

  if (numericValue >= 1000) {
    return `${trimTrailingZeros(numericValue / 1000)} s`
  }

  if (Number.isInteger(numericValue)) {
    return `${numericValue} ms`
  }

  return `${trimTrailingZeros(numericValue)} ms`
}

export function formatDurationFromSeconds(value: unknown): string {
  const numericValue = normalizeNumber(value)

  if (numericValue === null) {
    return '-'
  }

  if (numericValue < 1) {
    return `${Math.round(numericValue * 1000)} ms`
  }

  return `${trimTrailingZeros(numericValue)} s`
}

export function resolveStatusCodeTagType(value: unknown): TagType {
  const statusCode = Number(value)

  if (statusCode >= 500) {
    return 'danger'
  }

  if (statusCode >= 400) {
    return 'warning'
  }

  if (statusCode >= 200) {
    return 'success'
  }

  return 'info'
}

interface FieldChange {
  old: unknown
  new: unknown
}

type ChangesRecord = Record<string, FieldChange>

function isFieldChange(value: unknown): value is FieldChange {
  return value !== null && typeof value === 'object' && 'old' in value && 'new' in value
}

function isChangesRecord(value: unknown): value is ChangesRecord {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return false
  }

  const record = value as Record<string, unknown>
  return Object.values(record).every(v => v === null || v === undefined || isFieldChange(v))
}

function formatChangeValue(value: unknown): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

export function createChangesDiffFormatter<TItem extends CrudPageEntity>(
  getChanges: (item: TItem) => unknown
): FormatterFunction<TItem> {
  return (_value, item) => {
    const changes = getChanges(item)

    if (!isChangesRecord(changes)) return '—'

    const entries = Object.entries(changes)
    if (entries.length === 0) return '—'

    return h('table', { class: 'changes-diff-table' }, [
      h('thead', null, [
        h('tr', null, [
          h('th', null, '字段'),
          h('th', null, '变更前'),
          h('th', { class: 'changes-diff__arrow' }, ''),
          h('th', null, '变更后')
        ])
      ]),
      h(
        'tbody',
        null,
        entries.map(([field, change]) =>
          h('tr', { key: field }, [
            h('td', { class: 'changes-diff__field' }, field),
            h('td', { class: 'changes-diff__old' }, formatChangeValue(change.old)),
            h('td', { class: 'changes-diff__arrow' }, '→'),
            h('td', { class: 'changes-diff__new' }, formatChangeValue(change.new))
          ])
        )
      )
    ])
  }
}

export function createAuditSummaryCardFormatter<TItem extends CrudPageEntity>(
  getStatusLabel: (status: unknown) => string
): FormatterFunction<TItem> {
  return (_value, item) => {
    const record = item as Record<string, unknown>
    const username = String(record.username ?? '—')

    // 使用项目时区工具格式化时间（与列表保持一致）
    const timezoneStore = useTimezoneStore()
    const operaTimeRaw = record.opera_time
    let operaTimeFormatted = '—'
    if (typeof operaTimeRaw === 'string' && operaTimeRaw) {
      try {
        const date = parseApiTime(operaTimeRaw)
        operaTimeFormatted = timezoneStore.formatInCurrentTimezone(date, 'yyyy-MM-dd HH:mm:ss')
      } catch {
        operaTimeFormatted = String(operaTimeRaw)
      }
    }

    const status = record.status
    const action = String(record.action ?? record.method ?? '—')
    const objectType = String(record.object_type ?? '')
    const objectId = String(record.object_id ?? '')
    const costTime = formatDurationFromSeconds(record.cost_time)
    const traceId = String(record.trace_id ?? '—')
    const ip = String(record.ip ?? '')

    const isSuccess = String(status) === 'SUCCESS'

    return h('div', { class: 'audit-summary-card' }, [
      h('div', { class: 'audit-summary-card__header' }, [
        h('div', { class: 'audit-summary-card__user' }, [
          h('span', { class: 'audit-summary-card__avatar' }, username.charAt(0).toUpperCase()),
          h('span', { class: 'audit-summary-card__username' }, username)
        ]),
        h('span', { class: 'audit-summary-card__time' }, operaTimeFormatted)
      ]),
      h('div', { class: 'audit-summary-card__body' }, [
        h(
          'span',
          {
            class: [
              'audit-summary-card__status',
              isSuccess
                ? 'audit-summary-card__status--success'
                : 'audit-summary-card__status--danger'
            ]
          },
          getStatusLabel(status)
        ),
        h(
          'span',
          { class: 'audit-summary-card__operation' },
          [
            h('span', { class: 'audit-summary-card__action' }, action),
            objectType &&
              h('span', { class: 'audit-summary-card__object' }, [
                h('span', null, '\u00A0'),
                h('span', { class: 'audit-summary-card__object-type' }, objectType),
                objectId && h('span', { class: 'audit-summary-card__object-id' }, `#${objectId}`)
              ])
          ].filter(Boolean)
        )
      ]),
      h(
        'div',
        { class: 'audit-summary-card__meta' },
        [
          h('span', null, [`耗时: ${costTime}`]),
          h('span', { class: 'audit-summary-card__trace' }, [`链路: ${traceId}`]),
          ip && h('span', null, [`IP: ${ip}`])
        ].filter(Boolean)
      )
    ])
  }
}
