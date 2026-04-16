import type { FilterGroup } from '@/api/base/crud-request-adapter'
import type { QuickSearchPreset, SearchConditionDraft } from '@/types/search'

function getRelativeTimePresetMeta(hours: number): {
  id: string
  label: string
  descriptionLabel: string
} {
  if (hours < 1) {
    const minutes = Math.round(hours * 60)
    return {
      id: `recent-${minutes}-minutes`,
      label: `最近 ${minutes} 分钟`,
      descriptionLabel: `最近 ${minutes} 分钟`
    }
  }

  const normalizedHours = Number.isInteger(hours) ? String(hours) : String(hours)
  return {
    id: `recent-${normalizedHours}-hours`,
    label: `最近 ${normalizedHours} 小时`,
    descriptionLabel: `最近 ${normalizedHours} 小时`
  }
}

function buildRecentHoursConditionDrafts(
  field: string,
  hours: number,
  now = new Date()
): SearchConditionDraft[] {
  const filterGroup = buildRecentHoursFilterGroup(field, hours, now)
  const [condition] = filterGroup.conditions

  return [
    {
      field,
      operator: 'gte',
      value: condition?.value,
      source: 'quick'
    }
  ]
}

export function buildRecentHoursFilterGroup(
  field: string,
  hours: number,
  now = new Date()
): FilterGroup {
  const threshold = new Date(now.getTime() - hours * 60 * 60 * 1000)

  return {
    couple: 'and',
    conditions: [
      {
        field,
        op: 'ge',
        value: threshold.toISOString()
      }
    ]
  }
}

export function createRecentHoursQuickPreset(
  field: string,
  label: string,
  hours: number,
  now = new Date()
): QuickSearchPreset {
  const meta = getRelativeTimePresetMeta(hours)

  return {
    id: meta.id,
    label: meta.label,
    description: `按${label}筛选${meta.descriptionLabel}日志`,
    conditions: buildRecentHoursConditionDrafts(field, hours, now),
    resolveConditions: runtimeNow => buildRecentHoursConditionDrafts(field, hours, runtimeNow)
  }
}

export function createEqualsQuickPreset(
  id: string,
  field: string,
  label: string,
  value: unknown,
  description?: string
): QuickSearchPreset {
  return {
    id,
    label,
    description,
    conditions: [
      {
        field,
        operator: 'equals',
        value,
        source: 'quick'
      }
    ]
  }
}

export function createThresholdQuickPreset(
  id: string,
  field: string,
  label: string,
  operator: 'gt' | 'gte' | 'lt' | 'lte',
  value: number,
  description?: string
): QuickSearchPreset {
  return {
    id,
    label,
    description,
    conditions: [
      {
        field,
        operator,
        value,
        source: 'quick'
      }
    ]
  }
}
