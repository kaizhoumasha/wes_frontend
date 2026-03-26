import type { FilterCondition, FilterCouple, FilterGroup } from '@/api/base/crud-api'
import type {
  AdvancedFilterOperator,
  SearchCondition,
  SearchConditionDraft,
  SearchDataType,
  SearchFavorite,
  SearchFieldDef,
  UIFilterCondition,
  UIFilterGroup
} from '@/types/search'
import { OPERATOR_BACKEND_MAP } from '@/types/search'
import { generateConditionId } from '@/types/search'

const ADVANCED_OPERATORS: Record<SearchDataType, AdvancedFilterOperator[]> = {
  text: ['ilike', 'eq', 'ne', 'in', 'nin', 'is_null', 'not_null'],
  number: ['eq', 'ne', 'gt', 'ge', 'lt', 'le', 'between', 'in', 'nin', 'is_null', 'not_null'],
  date: ['eq', 'ne', 'gt', 'ge', 'lt', 'le', 'between', 'is_null', 'not_null'],
  boolean: ['eq', 'ne', 'is_null', 'not_null'],
  enum: ['eq', 'ne', 'in', 'nin', 'is_null', 'not_null']
}

const ADVANCED_OPERATOR_LABELS: Record<AdvancedFilterOperator, string> = {
  eq: '等于',
  ne: '不等于',
  gt: '大于',
  ge: '大于等于',
  lt: '小于',
  le: '小于等于',
  in: '属于',
  nin: '不属于',
  ilike: '包含',
  between: '介于',
  is_null: '为空',
  not_null: '不为空'
}

export const MAX_ADVANCED_SEARCH_DEPTH = 3

export function getAdvancedOperatorLabel(operator: AdvancedFilterOperator): string {
  return ADVANCED_OPERATOR_LABELS[operator]
}

export function needsAdvancedValue(operator: AdvancedFilterOperator): boolean {
  return operator !== 'is_null' && operator !== 'not_null'
}

export function isUIFilterGroup(item: UIFilterCondition | UIFilterGroup): item is UIFilterGroup {
  return 'conditions' in item
}

export function getAdvancedOperatorsForField(field?: SearchFieldDef): AdvancedFilterOperator[] {
  if (!field) {
    return ['eq']
  }

  return ADVANCED_OPERATORS[field.dataType]
}

export function resolveInitialValueForOperator(
  field: SearchFieldDef | undefined,
  operator: AdvancedFilterOperator,
  currentValue?: unknown
): unknown {
  if (!field || !needsAdvancedValue(operator)) {
    return undefined
  }

  if (operator === 'between') {
    return Array.isArray(currentValue) && currentValue.length === 2 ? currentValue : [undefined, undefined]
  }

  if (operator === 'in' || operator === 'nin') {
    return Array.isArray(currentValue) ? currentValue : []
  }

  switch (field.dataType) {
    case 'boolean':
      return typeof currentValue === 'boolean' ? currentValue : undefined
    case 'enum':
      return currentValue ?? field.options?.[0]?.value
    case 'number':
      return typeof currentValue === 'number' ? currentValue : undefined
    case 'date':
      return typeof currentValue === 'string' ? currentValue : undefined
    case 'text':
    default:
      return typeof currentValue === 'string' ? currentValue : undefined
  }
}

function getDefaultField(fields: SearchFieldDef[], fieldKey?: string): SearchFieldDef | undefined {
  return (
    fields.find(field => field.key === fieldKey && field.searchable !== false) ??
    fields.find(field => field.searchable !== false)
  )
}

export function createEmptyCondition(
  fields: SearchFieldDef[],
  fieldKey?: string
): UIFilterCondition {
  const field = getDefaultField(fields, fieldKey)
  const operators = getAdvancedOperatorsForField(field)
  const operator =
    field && field.defaultOperator
      ? (OPERATOR_BACKEND_MAP[field.defaultOperator] as AdvancedFilterOperator)
      : operators[0]

  return {
    id: generateConditionId(),
    field: field?.key ?? '',
    op: operator,
    value: resolveInitialValueForOperator(field, operator)
  }
}

export function createEmptyGroup(couple: FilterCouple = 'and'): UIFilterGroup {
  return {
    id: generateConditionId(),
    couple,
    conditions: []
  }
}

export function createRootGroup(fields: SearchFieldDef[], fieldKey?: string): UIFilterGroup {
  return {
    ...createEmptyGroup('and'),
    conditions: [createEmptyCondition(fields, fieldKey)]
  }
}

function mapDraftToFilterCondition(draft: SearchConditionDraft): FilterCondition {
  return {
    field: draft.field,
    op: OPERATOR_BACKEND_MAP[draft.operator] as AdvancedFilterOperator,
    value: draft.value
  }
}

export function convertSearchConditionsToFilterGroup(conditions: SearchCondition[]): FilterGroup | undefined {
  if (conditions.length === 0) {
    return undefined
  }

  return {
    couple: 'and',
    conditions: conditions.map(condition => mapDraftToFilterCondition(condition))
  }
}

export function convertFilterGroupToUIFilterGroup(group: FilterGroup): UIFilterGroup {
  const conditions = (group.conditions ?? []) as Array<FilterCondition | FilterGroup>

  return {
    id: generateConditionId(),
    couple: group.couple ?? 'and',
    conditions: conditions.map((item: FilterCondition | FilterGroup) =>
      'conditions' in item
        ? convertFilterGroupToUIFilterGroup(item)
        : {
            id: generateConditionId(),
            field: item.field ?? '',
            op: (item.op ?? 'eq') as AdvancedFilterOperator,
            value: item.value
          }
    )
  }
}

export function convertSearchConditionsToUIFilterGroup(
  conditions: SearchCondition[],
  fields: SearchFieldDef[]
): UIFilterGroup {
  const group = convertSearchConditionsToFilterGroup(conditions)
  return group ? convertFilterGroupToUIFilterGroup(group) : createRootGroup(fields)
}

export function getFavoriteFilterGroup(
  favorite: SearchFavorite,
  fields: SearchFieldDef[]
): UIFilterGroup {
  if (favorite.filterGroup) {
    return convertFilterGroupToUIFilterGroup(favorite.filterGroup)
  }

  const fallbackConditions = favorite.conditions.map(condition => ({
    id: generateConditionId(),
    field: condition.field,
    op: OPERATOR_BACKEND_MAP[condition.operator] as AdvancedFilterOperator,
    value: condition.value
  }))

  return {
    ...createEmptyGroup('and'),
    conditions: fallbackConditions.length > 0 ? fallbackConditions : [createEmptyCondition(fields)]
  }
}

export function stripUIFilterGroup(group: UIFilterGroup): FilterGroup {
  return {
    couple: group.couple,
    conditions: group.conditions.map(item =>
      isUIFilterGroup(item)
        ? stripUIFilterGroup(item)
        : {
            field: item.field,
            op: item.op,
            value: item.value
          }
    )
  }
}

export function countFilterNodes(group?: FilterGroup | UIFilterGroup): number {
  if (!group) {
    return 0
  }

  const conditions = (group.conditions ?? []) as Array<FilterCondition | FilterGroup | UIFilterCondition | UIFilterGroup>

  return conditions.reduce((count: number, item) => {
    if ('conditions' in item) {
      return count + countFilterNodes(item)
    }

    return count + 1
  }, 0)
}

export function countSearchFavoriteRules(favorite: SearchFavorite): number {
  if (favorite.filterGroup) {
    return countFilterNodes(favorite.filterGroup)
  }

  return favorite.conditions.length
}

function validateConditionValue(condition: UIFilterCondition, field: SearchFieldDef): string[] {
  if (!needsAdvancedValue(condition.op)) {
    return []
  }

  if (condition.op === 'between') {
    if (!Array.isArray(condition.value) || condition.value.length !== 2) {
      return ['区间值必须包含两个端点']
    }

    const [start, end] = condition.value
    if (start === undefined || start === null || end === undefined || end === null) {
      return ['区间值不能为空']
    }

    return []
  }

  if (condition.op === 'in' || condition.op === 'nin') {
    return Array.isArray(condition.value) && condition.value.length > 0 ? [] : ['多值条件不能为空']
  }

  if (condition.value === undefined || condition.value === null || condition.value === '') {
    return ['请输入条件值']
  }

  if (field.options && field.options.length > 0) {
    const validValues = field.options.map(option => option.value)
    const values = Array.isArray(condition.value) ? condition.value : [condition.value]
    return values.every(value => validValues.includes(value)) ? [] : ['条件值不在可选范围内']
  }

  return []
}

export function getUIFilterConditionErrors(
  condition: UIFilterCondition,
  fields: SearchFieldDef[]
): string[] {
  const field = fields.find(candidate => candidate.key === condition.field)
  if (!field) {
    return ['未选择字段']
  }

  const availableOperators = getAdvancedOperatorsForField(field)
  if (!availableOperators.includes(condition.op)) {
    return ['操作符与字段类型不匹配']
  }

  return validateConditionValue(condition, field)
}

export function validateUIFilterGroup(group: UIFilterGroup, fields: SearchFieldDef[]): string[] {
  const errors: string[] = []

  for (const [index, item] of group.conditions.entries()) {
    if (isUIFilterGroup(item)) {
      errors.push(...validateUIFilterGroup(item, fields).map(error => `第 ${index + 1} 组: ${error}`))
      continue
    }

    errors.push(...getUIFilterConditionErrors(item, fields).map(error => `第 ${index + 1} 条: ${error}`))
  }

  return errors
}

export function hasMeaningfulUIFilterGroup(group: UIFilterGroup): boolean {
  return group.conditions.some(item => {
    if (isUIFilterGroup(item)) {
      return hasMeaningfulUIFilterGroup(item)
    }

    if (!item.field) {
      return false
    }

    if (!needsAdvancedValue(item.op)) {
      return true
    }

    if (Array.isArray(item.value)) {
      return item.value.some(value => value !== undefined && value !== null && value !== '')
    }

    return item.value !== undefined && item.value !== null && item.value !== ''
  })
}

function formatSummaryValue(value: unknown, field?: SearchFieldDef): string {
  if (value === undefined || value === null || value === '') {
    return '未设置'
  }

  if (Array.isArray(value)) {
    return value.map(item => formatSummaryValue(item, field)).join('、')
  }

  if (field?.dataType === 'boolean') {
    return value === true ? '是' : '否'
  }

  if (field?.options?.length) {
    const option = field.options.find(item => item.value === value)
    if (option) {
      return option.label
    }
  }

  return String(value)
}

function summarizeCondition(condition: UIFilterCondition, fields: SearchFieldDef[]): string {
  const field = fields.find(item => item.key === condition.field)
  const fieldLabel = field?.label ?? condition.field ?? '未选择字段'
  const operatorLabel = getAdvancedOperatorLabel(condition.op)

  if (!needsAdvancedValue(condition.op)) {
    return `${fieldLabel}${operatorLabel}`
  }

  if (condition.op === 'between' && Array.isArray(condition.value)) {
    return `${fieldLabel}${operatorLabel} ${formatSummaryValue(condition.value[0], field)} 至 ${formatSummaryValue(condition.value[1], field)}`
  }

  if (condition.op === 'in' || condition.op === 'nin') {
    return `${fieldLabel}${operatorLabel} ${formatSummaryValue(condition.value, field)}`
  }

  return `${fieldLabel}${operatorLabel} ${formatSummaryValue(condition.value, field)}`
}

function needsParentheses(item: UIFilterCondition | UIFilterGroup): boolean {
  return isUIFilterGroup(item) && item.conditions.length > 1
}

export function summarizeUIFilterGroup(group: UIFilterGroup, fields: SearchFieldDef[]): string {
  if (group.conditions.length === 0) {
    return '尚未设置筛选条件'
  }

  const coupleLabelMap: Record<FilterCouple, string> = {
    and: '且',
    or: '或',
    not: '非'
  }

  if (group.couple === 'not') {
    const content = group.conditions
      .map(item => {
        const summary = isUIFilterGroup(item)
          ? summarizeUIFilterGroup(item, fields)
          : summarizeCondition(item, fields)

        return needsParentheses(item) ? `（${summary}）` : summary
      })
      .join(' 且 ')

    return `排除${content}`
  }

  return group.conditions
    .map(item => {
      const summary = isUIFilterGroup(item)
        ? summarizeUIFilterGroup(item, fields)
        : summarizeCondition(item, fields)

      return needsParentheses(item) ? `（${summary}）` : summary
    })
    .join(` ${coupleLabelMap[group.couple]} `)
}
