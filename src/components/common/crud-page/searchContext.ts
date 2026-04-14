import type { SearchCondition, SearchConditionDraft } from '@/types/search'

export function mergeQuickFilterConditions(
  existing: Pick<SearchCondition, 'field' | 'operator' | 'value'>[],
  next: SearchConditionDraft
): SearchConditionDraft[] {
  const preserved = existing
    .filter(condition => condition.field !== next.field)
    .map(condition => ({
      field: condition.field,
      operator: condition.operator,
      value: condition.value
    }))

  return [...preserved, next]
}
