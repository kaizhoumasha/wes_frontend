import type { CrudPageEntity } from '../types'
import type { CrudPageDetailField } from './types'

export type DetailFieldResolvedLayout = 'auto' | 'half' | 'full' | 'third'

const fullWidthFieldPattern =
  /(?:^|\.)(?:description|desc|remark|remarks|note|notes|comment|comments|content|summary|detail|details|reason|message|payload|metadata|json|body|text)$/i
const compactThirdWidthFieldPattern =
  /(?:^|\.)(?:id|code|no|sn|type|kind|level|priority|sort|order|index|count|total|version)$/i
const compactHalfWidthFieldPattern =
  /(?:^|\.)(?:status|state|category|mode|source|gender|email|phone|mobile|tel|username|name|title|created_at|updated_at|deleted_at|start_at|end_at|date|time|is_[a-z0-9_]+|has_[a-z0-9_]+|can_[a-z0-9_]+|should_[a-z0-9_]+)$/i

function getScalarTextLength(value: unknown): number {
  if (value === null || value === undefined) {
    return 0
  }

  if (typeof value === 'string') {
    return value.trim().length
  }

  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return String(value).length
  }

  return 0
}

export function resolveDetailFieldLayout<TItem extends CrudPageEntity>(
  field: CrudPageDetailField<TItem>,
  value: unknown
): DetailFieldResolvedLayout {
  if (field.layout && field.layout !== 'auto') {
    return field.layout
  }

  const formatter = field.formatter
  const scalarTextLength = getScalarTextLength(value)

  if (formatter === 'json') {
    return 'full'
  }

  if (fullWidthFieldPattern.test(field.key)) {
    return 'full'
  }

  if (Array.isArray(value) || (value !== null && typeof value === 'object')) {
    return 'full'
  }

  if (typeof value === 'string') {
    if (value.includes('\n') || value.length >= 60) {
      return 'full'
    }
  }

  if (formatter === 'date' || formatter === 'datetime' || formatter === 'boolean') {
    return 'half'
  }

  if (formatter === 'status') {
    return scalarTextLength <= 12 ? 'third' : 'half'
  }

  if (typeof value === 'boolean') {
    return 'half'
  }

  if (compactThirdWidthFieldPattern.test(field.key) && scalarTextLength > 0 && scalarTextLength <= 18) {
    return 'third'
  }

  if (compactHalfWidthFieldPattern.test(field.key)) {
    return 'half'
  }

  if (typeof value === 'number' || typeof value === 'bigint') {
    return scalarTextLength <= 12 ? 'third' : 'half'
  }

  if (typeof value === 'string' && scalarTextLength > 0) {
    return scalarTextLength <= 32 ? 'half' : 'full'
  }

  return 'half'
}

export function getDetailFieldTruncationLimit(layout: DetailFieldResolvedLayout): number {
  if (layout === 'full') {
    return 140
  }

  if (layout === 'third') {
    return 28
  }

  return 50
}
