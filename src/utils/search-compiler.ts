/**
 * 搜索条件编译器
 *
 * 将智能搜索的 SearchCondition 编译为后端的 FilterGroup。
 * 这是一个纯函数模块，不依赖 Vue，可单独测试。
 *
 * @module utils/search-compiler
 */

import type {
  SearchCondition,
  SearchConditionDraft,
  SearchDataType,
  SearchFieldDef,
} from '@/types/search'
import { OPERATOR_BACKEND_MAP } from '@/types/search'
import type { FilterCondition, FilterGroup } from '@/api/base/crud-api'

// 重新导出 generateConditionId，方便其他模块使用
export { generateConditionId, resetConditionIdCounter } from '@/types/search'

// ==================== 标签生成 ====================

/**
 * 构建条件显示标签
 *
 * 根据字段定义、操作符和值生成自然语言的条件描述。
 *
 * @param draft - 条件草稿（不含 id 和 label）
 * @param fieldDefs - 字段定义列表
 * @returns 条件显示标签
 *
 * @example
 * ```ts
 * buildConditionLabel(
 *   { field: 'username', operator: 'contains', value: 'admin' },
 *   userSearchFields
 * )  // '用户名包含 admin'
 *
 * buildConditionLabel(
 *   { field: 'is_superuser', operator: 'equals', value: true },
 *   userSearchFields
 * )  // '超级用户 = 是'
 * ```
 */
export function buildConditionLabel(
  draft: SearchConditionDraft,
  fieldDefs: SearchFieldDef[]
): string {
  const fieldDef = fieldDefs.find((f) => f.key === draft.field)
  if (!fieldDef) {
    return `${draft.field} ${draft.operator} ${String(draft.value ?? '')}`
  }

  const fieldLabel = fieldDef.label
  const value = formatValue(draft.value, fieldDef.dataType)

  // 布尔字段的特殊处理
  if (fieldDef.dataType === 'boolean') {
    if (draft.operator === 'equals') {
      return `${fieldLabel} = ${value}`
    }
    if (draft.operator === 'notEquals') {
      return `${fieldLabel} ≠ ${value}`
    }
  }

  // 文本字段操作符
  switch (draft.operator) {
    case 'contains':
      return `${fieldLabel} 包含 ${value}`
    case 'startsWith':
      return `${fieldLabel} 开头是 ${value}`
    case 'endsWith':
      return `${fieldLabel} 结尾是 ${value}`
    case 'equals':
      return `${fieldLabel} 等于 ${value}`
    case 'notEquals':
      return `${fieldLabel} 不等于 ${value}`
    case 'gt':
      return `${fieldLabel} > ${value}`
    case 'gte':
      return `${fieldLabel} ≥ ${value}`
    case 'lt':
      return `${fieldLabel} < ${value}`
    case 'lte':
      return `${fieldLabel} ≤ ${value}`
    case 'between':
      return `${fieldLabel} 介于 ${value}`
    case 'in':
      return `${fieldLabel} 在 [${value}] 中`
    case 'notIn':
      return `${fieldLabel} 不在 [${value}] 中`
    case 'isEmpty':
      return `${fieldLabel} 为空`
    case 'notEmpty':
      return `${fieldLabel} 不为空`
    default:
      return `${fieldLabel} ${draft.operator} ${value}`
  }
}

/**
 * 格式化条件值用于显示
 */
function formatValue(value: unknown, dataType: SearchDataType): string {
  if (value === null || value === undefined) {
    return ''
  }

  switch (dataType) {
    case 'boolean':
      return value === true ? '是' : '否'
    case 'date':
      return String(value)
    case 'number':
      return String(value)
    case 'enum':
      return String(value)
    case 'text':
    default:
      return String(value)
  }
}

// ==================== 条件编译 ====================

/**
 * 转义 ILIKE 模式中的特殊字符
 *
 * 将用户输入中的通配符（% _ \）转义为字面量。
 *
 * 转义策略（与后端约定）：
 * - % → \%
 * - _ → \_
 * - \ → \\
 *
 * @param input - 用户输入的原始文本
 * @returns 转义后的文本，可直接用于 ILIKE 模式
 *
 * @example
 * ```ts
 * escapeLikePattern('100%')  // '100\\%'  // 搜索 "100%" 而不是 "100" + 任意字符
 * escapeLikePattern('_test') // '\\_test' // 搜索 "_test" 而不是任意单个字符 + "test"
 * ```
 */
function escapeLikePattern(input: string): string {
  // 注意：顺序很重要，必须先转义反斜杠
  return input.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_')
}

/**
 * 编译前校验：检查条件值是否合法
 *
 * 校验规则：
 * - isEmpty / notEmpty：允许无值（value 可以为 undefined）
 * - between：value 必须是 [min, max] 数组且有两个有效元素
 * - in / notIn：value 必须是非空数组
 * - 其他操作符：value 不能是 undefined 或空字符串
 *
 * @param condition - 待校验的条件
 * @param fieldDef - 字段定义
 * @returns 是否通过校验
 */
function validateConditionValue(
  condition: SearchCondition,
  fieldDef: SearchFieldDef
): boolean {
  const { operator, value } = condition

  // isEmpty / notEmpty 不需要值
  if (operator === 'isEmpty' || operator === 'notEmpty') {
    return true
  }

  // between 必须是两个元素的数组
  if (operator === 'between') {
    if (!Array.isArray(value) || value.length !== 2) {
      console.warn(`[search-compiler] between 操作符值必须是 [min, max] 数组:`, condition)
      return false
    }
    const [min, max] = value
    if (min === undefined || max === undefined || min === null || max === null) {
      console.warn(`[search-compiler] between 操作符值不能包含 null/undefined:`, condition)
      return false
    }
    // 数值类型：验证 min < max（日期/字符串也适用语义检查）
    if (min >= max) {
      console.warn(`[search-compiler] between 操作符值必须满足 min < max: [${min}, ${max}]`, condition)
      return false
    }
    return true
  }

  // in / notIn 必须是非空数组
  if (operator === 'in' || operator === 'notIn') {
    if (!Array.isArray(value) || value.length === 0) {
      console.warn(`[search-compiler] ${operator} 操作符值必须是非空数组:`, condition)
      return false
    }
    return true
  }

  // 其他操作符必须有非空值
  if (value === undefined || value === null || value === '') {
    console.warn(`[search-compiler] ${operator} 操作符值不能为空:`, condition)
    return false
  }

  // 枚举类型：值必须在选项中
  if (fieldDef.dataType === 'enum' && fieldDef.options) {
    const validValues = fieldDef.options.map(opt => opt.value)
    if (Array.isArray(value)) {
      const hasInvalid = value.some(v => !validValues.includes(v))
      if (hasInvalid) {
        console.warn(`[search-compiler] 枚举值不在有效选项中:`, condition)
        return false
      }
    } else if (!validValues.includes(value)) {
      console.warn(`[search-compiler] 枚举值不在有效选项中:`, condition)
      return false
    }
  }

  return true
}

/**
 * 编译单个搜索条件
 *
 * 将 SearchCondition 转换为 FilterCondition。
 *
 * @param condition - 搜索条件
 * @param fieldDefs - 字段定义列表
 * @returns 过滤条件，如果字段不存在、值不合法或操作符不支持则返回 null
 *
 * @example
 * ```ts
 * compileCondition(
 *   { field: 'username', operator: 'contains', value: 'admin', ... },
 *   userSearchFields
 * )  // { field: 'username', op: 'ilike', value: '%admin%' }
 * ```
 */
export function compileCondition(
  condition: SearchCondition,
  fieldDefs: SearchFieldDef[]
): FilterCondition | null {
  const fieldDef = fieldDefs.find((f) => f.key === condition.field)
  if (!fieldDef) {
    console.warn(`[search-compiler] 字段不存在: ${condition.field}`)
    return null
  }

  // 编译前校验：禁止非法条件进入后端
  if (!validateConditionValue(condition, fieldDef)) {
    return null
  }

  const op = OPERATOR_BACKEND_MAP[condition.operator] as FilterCondition['op']
  let value: unknown = condition.value

  // 特殊处理 ilike 操作符的通配符（带转义）
  if (op === 'ilike') {
    // 文本类型需要转义通配符
    let textValue = typeof value === 'string' ? value : String(value)

    // 先转义用户输入中的特殊字符（确保字面量匹配）
    textValue = escapeLikePattern(textValue)

    // 再添加模式通配符（这些通配符是 SQL 语法，不是用户输入）
    switch (condition.operator) {
      case 'contains':
        value = `%${textValue}%`
        break
      case 'startsWith':
        value = `${textValue}%`
        break
      case 'endsWith':
        value = `%${textValue}`
        break
      case 'equals':
      case 'notEquals':
        // 这些操作符虽然映射到 ilike，但不需要通配符
        // 使用转义后的值确保精确匹配
        value = textValue
        break
    }
  }

  // isEmpty / notEmpty 不需要 value
  if (op === 'is_null' || op === 'not_null') {
    value = undefined
  }

  return {
    field: condition.field,
    op,
    value,
  }
}

/**
 * 编译搜索条件列表为 FilterGroup
 *
 * 将多个 SearchCondition 编译为一个 FilterGroup（首版只支持 AND）。
 *
 * @param conditions - 搜索条件列表
 * @param fieldDefs - 字段定义列表
 * @returns 过滤条件组，如果条件为空或全部无效则返回 undefined
 *
 * @example
 * ```ts
 * compileConditions(
 *   [
 *     { field: 'username', operator: 'contains', value: 'admin', ... },
 *     { field: 'is_superuser', operator: 'equals', value: true, ... },
 *   ],
 *   userSearchFields
 * )
 * // {
 * //   couple: 'and',
 * //   conditions: [
 * //     { field: 'username', op: 'ilike', value: '%admin%' },
 * //     { field: 'is_superuser', op: 'eq', value: true },
 * //   ],
 * // }
 * ```
 */
export function compileConditions(
  conditions: SearchCondition[],
  fieldDefs: SearchFieldDef[]
): FilterGroup | undefined {
  // 过滤掉无效条件并编译
  const compiledConditions = conditions
    .map((c) => compileCondition(c, fieldDefs))
    .filter((c): c is FilterCondition => c !== null)

  // 空条件返回 undefined
  if (compiledConditions.length === 0) {
    return undefined
  }

  // 首版只支持 AND 组合
  return {
    couple: 'and',
    conditions: compiledConditions,
  }
}

// ==================== 关键字解析 ====================

/**
 * 解析关键字类型
 *
 * 根据 keyword 的内容推断其数据类型。
 *
 * @param keyword - 用户输入的关键字
 * @returns 关键字类型
 *
 * @example
 * ```ts
 * parseKeywordKind('admin')     // 'text'
 * parseKeywordKind('123')       // 'number'
 * parseKeywordKind('true')      // 'boolean'
 * parseKeywordKind('2024-01-01') // 'date'
 * parseKeywordKind('')          // 'empty'
 * ```
 */
export function parseKeywordKind(keyword: string): SearchDataType | 'empty' {
  if (!keyword || keyword.trim() === '') {
    return 'empty'
  }

  // 数值检查（优先于布尔值，避免 1/0 被误判为布尔）
  if (/^-?\d+(\.\d+)?$/.test(keyword)) {
    return 'number'
  }

  // 布尔值检查（排除纯数值，只匹配语义化的布尔值）
  const lowerKeyword = keyword.toLowerCase()
  if (['true', 'false', '是', '否', 'y', 'n', 'yes', 'no'].includes(lowerKeyword)) {
    return 'boolean'
  }

  // 日期检查 (ISO 格式)
  if (/^\d{4}-\d{2}-\d{2}/.test(keyword)) {
    return 'date'
  }

  // 默认为文本
  return 'text'
}

/**
 * 判断关键字是否与字段类型兼容
 *
 * @param keyword - 用户输入的关键字
 * @param dataType - 字段数据类型
 * @returns 是否兼容
 *
 * @example
 * ```ts
 * isKeywordCompatible('admin', 'text')      // true
 * isKeywordCompatible('123', 'number')      // true
 * isKeywordCompatible('true', 'boolean')    // true
 * isKeywordCompatible('admin', 'number')    // false
 * ```
 */
export function isKeywordCompatible(keyword: string, dataType: SearchDataType): boolean {
  const keywordKind = parseKeywordKind(keyword)

  // 空关键字对所有字段都兼容（用户尚未输入）
  if (keywordKind === 'empty') {
    return true
  }

  // 文本字段兼容所有关键字（用户可以输入任何内容）
  if (dataType === 'text') {
    return true
  }

  // 其他字段需要类型匹配
  return keywordKind === dataType
}

/**
 * 获取与关键字兼容的字段列表
 *
 * @param keyword - 用户输入的关键字
 * @param fieldDefs - 字段定义列表
 * @returns 兼容的字段列表
 *
 * @example
 * ```ts
 * getCompatibleFields('admin', userSearchFields)
 * // [usernameField, emailField, fullNameField]
 *
 * getCompatibleFields('true', userSearchFields)
 * // [usernameField, emailField, fullNameField, isSuperuserField, isMultiLoginField]
 * ```
 */
export function getCompatibleFields(
  keyword: string,
  fieldDefs: SearchFieldDef[]
): SearchFieldDef[] {
  return fieldDefs.filter((field) => isKeywordCompatible(keyword, field.dataType))
}
