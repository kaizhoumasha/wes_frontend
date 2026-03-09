/**
 * 智能搜索类型定义
 *
 * 定义智能搜索能力的所有核心类型，包括：
 * - 搜索操作符
 * - 字段定义
 * - 搜索条件
 * - 收藏夹
 * - 搜索状态
 *
 * @module types/search
 */

// ==================== 操作符定义 ====================

/**
 * 搜索操作符（UI 层，业务化命名）
 *
 * 映射到后端 FilterOperator 的规则：
 * - contains → ilike + '%value%'
 * - equals → eq
 * - notEquals → ne
 * - startsWith → ilike + 'value%'
 * - endsWith → ilike + '%value'
 * - gt/gte/lt/lte → 直接映射
 * - between → between
 * - in/notIn → in/nin
 * - isEmpty/notEmpty → is_null/not_null
 *
 * @example
 * ```ts
 * const op: SearchOperator = 'contains'  // 用户名包含 "admin"
 * const op2: SearchOperator = 'equals'  // 超级用户 = 是
 * ```
 */
export type SearchOperator =
  // 文本类（共用 ilike）
  | 'contains'      // 包含 → ilike + '%value%'
  | 'startsWith'    // 开头是 → ilike + 'value%'
  | 'endsWith'      // 结尾是 → ilike + '%value'
  // 等值类
  | 'equals'        // 等于 → eq
  | 'notEquals'     // 不等于 → ne
  // 数值/日期类
  | 'gt'            // 大于 → gt
  | 'gte'           // 大于等于 → ge
  | 'lt'            // 小于 → lt
  | 'lte'           // 小于等于 → le
  | 'between'       // 在...之间 → between
  // 集合类
  | 'in'            // 在列表中 → in
  | 'notIn'         // 不在列表中 → nin
  // 空值类
  | 'isEmpty'       // 为空 → is_null
  | 'notEmpty'      // 不为空 → not_null

/**
 * SearchOperator 到后端 FilterOperator 的映射表
 *
 * @example
 * ```ts
 * OPERATOR_BACKEND_MAP['contains']  // 'ilike'
 * OPERATOR_BACKEND_MAP['equals']    // 'eq'
 * ```
 */
export const OPERATOR_BACKEND_MAP: Record<SearchOperator, string> = {
  contains: 'ilike',
  equals: 'eq',
  notEquals: 'ne',
  startsWith: 'ilike',
  endsWith: 'ilike',
  gt: 'gt',
  gte: 'ge',
  lt: 'lt',
  lte: 'le',
  between: 'between',
  in: 'in',
  notIn: 'nin',
  isEmpty: 'is_null',
  notEmpty: 'not_null',
} as const

/**
 * 文本字段支持的操作符
 */
export const TEXT_OPERATORS: SearchOperator[] = [
  'contains',
  'equals',
  'notEquals',
  'startsWith',
  'endsWith',
  'isEmpty',
  'notEmpty',
]

/**
 * 数值字段支持的操作符
 */
export const NUMBER_OPERATORS: SearchOperator[] = [
  'equals',
  'notEquals',
  'gt',
  'gte',
  'lt',
  'lte',
  'between',
  'isEmpty',
  'notEmpty',
]

/**
 * 布尔字段支持的操作符
 */
export const BOOLEAN_OPERATORS: SearchOperator[] = [
  'equals',
  'notEquals',
]

/**
 * 枚举字段支持的操作符
 */
export const ENUM_OPERATORS: SearchOperator[] = [
  'equals',
  'notEquals',
  'in',
  'notIn',
  'isEmpty',
  'notEmpty',
]

/**
 * 日期字段支持的操作符
 */
export const DATE_OPERATORS: SearchOperator[] = [
  'equals',
  'notEquals',
  'gt',
  'gte',
  'lt',
  'lte',
  'between',
  'isEmpty',
  'notEmpty',
]

/**
 * 根据数据类型获取可用操作符
 *
 * @param dataType - 数据类型
 * @returns 该数据类型支持的操作符列表
 *
 * @example
 * ```ts
 * getOperatorsForDataType('text')  // ['contains', 'equals', 'notEquals', ...]
 * getOperatorsForDataType('boolean')  // ['equals', 'notEquals']
 * ```
 */
export function getOperatorsForDataType(dataType: SearchDataType): SearchOperator[] {
  if (dataType === 'text') return TEXT_OPERATORS
  if (dataType === 'number') return NUMBER_OPERATORS
  if (dataType === 'boolean') return BOOLEAN_OPERATORS
  if (dataType === 'enum') return ENUM_OPERATORS
  if (dataType === 'date') return DATE_OPERATORS
  return []
}

// ==================== 数据类型定义 ====================

/**
 * 搜索字段数据类型
 */
export type SearchDataType = 'text' | 'number' | 'date' | 'boolean' | 'enum'

/**
 * 关键字类型（用于解析用户输入的 keyword）
 */
export type SearchKeywordKind = 'empty' | 'text' | 'number' | 'boolean' | 'date'

// ==================== 字段定义 ====================

/**
 * 搜索字段定义
 *
 * 定义一个可搜索字段的元数据，用于生成搜索 UI 和编译查询条件。
 *
 * @example
 * ```ts
 * const userField: SearchFieldDef = {
 *   key: 'username',
 *   label: '用户名',
 *   dataType: 'text',
 *   defaultOperator: 'contains',
 *   quickOps: ['contains', 'equals', 'startsWith'],
 *   placeholder: '请输入用户名',
 * }
 * ```
 */
export interface SearchFieldDef {
  /** 字段键名（对应后端字段） */
  key: string
  /** 字段显示名称 */
  label: string
  /** 字段数据类型 */
  dataType: SearchDataType
  /** 是否可搜索（默认 true） */
  searchable?: boolean
  /** 默认操作符（用于快速搜索） */
  defaultOperator?: SearchOperator
  /** 快速操作符列表（用于 Popover 中栏） */
  quickOps?: SearchOperator[]
  /** 枚举选项（仅 enum 类型需要） */
  options?: Array<{ label: string; value: unknown }>
  /** 输入占位符 */
  placeholder?: string
  /** 字段图标（可选，用于 UI 展示） */
  icon?: string | object
}

// ==================== 条件定义 ====================

/**
 * 搜索条件
 *
 * 表示一个完整的搜索条件，包括字段、操作符、值和显示标签。
 *
 * @example
 * ```ts
 * const condition: SearchCondition = {
 *   id: 'cond_1_1234567890_abc123',
 *   field: 'username',
 *   operator: 'contains',
 *   value: 'admin',
 *   label: '用户名包含 admin',
 *   source: 'manual',
 * }
 * ```
 */
export interface SearchCondition {
  /** 条件唯一标识 */
  id: string
  /** 字段键名 */
  field: string
  /** 操作符 */
  operator: SearchOperator
  /** 条件值 */
  value?: unknown
  /** 条件显示标签（自动生成） */
  label: string
  /** 条件来源（用于埋点和调试） */
  source?: 'manual' | 'quick' | 'favorite'
}

/**
 * 搜索条件草稿（不含 id 和 label）
 *
 * 用于创建新条件时的输入类型。
 */
export type SearchConditionDraft = Omit<SearchCondition, 'id' | 'label'>

// ==================== 收藏夹定义 ====================

/**
 * 搜索收藏夹
 *
 * 用于保存常用的搜索条件组合，方便快速应用。
 *
 * @example
 * ```ts
 * const favorite: SearchFavorite = {
 *   id: 'fav_admin_accounts',
 *   name: '管理员账号',
 *   conditions: [
 *     {
 *       id: 'preset_1',
 *       field: 'username',
 *       operator: 'contains',
 *       value: 'admin',
 *       label: '用户名包含 admin',
 *       source: 'favorite',
 *     },
 *   ],
 *   scope: 'user-management',
 * }
 * ```
 */
export interface SearchFavorite {
  /** 收藏夹唯一标识 */
  id: string
  /** 收藏夹名称 */
  name: string
  /** 收藏的条件模板列表（运行时将生成 id 和 label） */
  conditions: SearchConditionDraft[]
  /** 收藏夹作用域（可选，用于区分不同页面） */
  scope?: string
}

// ==================== 快速搜索预设 ====================

/**
 * 快速搜索预设
 *
 * 系统提供的固定快速搜索模板，用于 Popover 中栏展示。
 *
 * @example
 * ```ts
 * const preset: QuickSearchPreset = {
 *   id: 'superusers',
 *   label: '超级管理员',
 *   description: '快速筛出超级用户',
 *   conditions: [
 *     { field: 'is_superuser', operator: 'equals', value: true, source: 'quick' },
 *   ],
 * }
 * ```
 */
export interface QuickSearchPreset {
  /** 预设唯一标识 */
  id: string
  /** 预设显示名称 */
  label: string
  /** 预设描述（可选） */
  description?: string
  /** 预设包含的条件列表（不含 id 和 label） */
  conditions: SearchConditionDraft[]
}

// ==================== 搜索状态定义 ====================

/**
 * 智能搜索状态
 *
 * 管理整个搜索能力的状态，包括关键字、字段选择、条件列表等。
 *
 * @example
 * ```ts
 * const state: SmartSearchState = {
 *   keyword: 'admin',
 *   activeField: 'username',
 *   conditions: [
 *     { id: 'cond_1', field: 'username', operator: 'contains', value: 'admin', label: '用户名包含 admin' },
 *   ],
 *   favorites: [],
 *   popoverOpen: true,
 *   advancedDialogOpen: false,
 * }
 * ```
 */
export interface SmartSearchState {
  /** 当前输入的关键字 */
  keyword: string
  /** 当前选中的字段（用于 Popover 左栏高亮） */
  activeField?: string
  /** 已应用的条件列表 */
  conditions: SearchCondition[]
  /** 可用的收藏夹列表 */
  favorites: SearchFavorite[]
  /** Popover 是否打开 */
  popoverOpen: boolean
  /** 高级搜索弹窗是否打开 */
  advancedDialogOpen: boolean
}

// ==================== ID 生成策略 ====================

/**
 * 条件 ID 计数器（用于生成唯一 ID）
 *
 * 使用闭包实现简单的递增计数器，避免 UUID 库依赖。
 */
let conditionIdCounter = 0

/**
 * 生成唯一的条件 ID
 *
 * 格式：`cond_{counter}_{timestamp}`
 *
 * @returns 唯一的条件 ID
 *
 * @example
 * ```ts
 * generateConditionId()  // 'cond_1_1715123456789'
 * generateConditionId()  // 'cond_2_1715123456790'
 * ```
 */
export function generateConditionId(): string {
  return `cond_${++conditionIdCounter}_${Date.now()}`
}

/**
 * 重置条件 ID 计数器
 *
 * 用于测试或特殊场景。
 */
export function resetConditionIdCounter(): void {
  conditionIdCounter = 0
}

// ==================== 操作符标签和常量 ====================

/**
 * 操作符中文标签映射
 *
 * 用于 UI 显示，提供一致的操作符描述。
 */
export const OPERATOR_LABELS: Record<SearchOperator, string> = {
  contains: '包含',
  equals: '等于',
  notEquals: '不等于',
  startsWith: '开头是',
  endsWith: '结尾是',
  gt: '大于',
  gte: '大于等于',
  lt: '小于',
  lte: '小于等于',
  between: '介于',
  in: '在...中',
  notIn: '不在...中',
  isEmpty: '为空',
  notEmpty: '不为空',
} as const

/**
 * 获取操作符标签
 *
 * @param op - 搜索操作符
 * @returns 操作符的中文标签
 *
 * @example
 * ```ts
 * getOperatorLabel('contains')  // '包含'
 * getOperatorLabel('equals')   // '等于'
 * ```
 */
export function getOperatorLabel(op: SearchOperator): string {
  return OPERATOR_LABELS[op]
}

/**
 * 布尔值标签映射
 */
export const BOOLEAN_LABELS = {
  true: '是',
  false: '否',
} as const

/**
 * 特殊操作符常量
 */
export const BETWEEN_OPERATOR = 'between' as const

/**
 * 类型守卫：判断是否为 between 操作符
 */
export function isBetweenOperator(op: SearchOperator): op is 'between' {
  return op === BETWEEN_OPERATOR
}

/**
 * 输入占位符映射
 */
export const INPUT_PLACEHOLDERS: Record<SearchDataType, string> = {
  text: '输入值',
  number: '输入数值',
  date: '选择日期',
  boolean: '选择',
  enum: '选择',
} as const

// ==================== 条件校验 ====================

/**
 * 条件校验选项
 */
export interface ValidateConditionOptions {
  /** 日志上下文前缀（默认：'[SearchCondition]'） */
  context?: string
  /** 静默模式（不输出 console.warn） */
  silent?: boolean
}

/**
 * 校验条件草稿是否合法
 *
 * **校验规则**：
 * - 字段必须存在且可搜索
 * - 操作符必须适用于字段数据类型
 * - 值必须满足操作符的最小约束（between, in, notIn 等）
 * - 枚举值必须在选项中
 *
 * @param draft - 待校验的条件草稿
 * @param fields - 可用字段列表
 * @param options - 可选配置
 * @returns 是否通过校验
 *
 * @example
 * ```ts
 * // 基本用法
 * const isValid = validateConditionDraft(draft, fields)
 *
 * // 自定义上下文
 * const isValid = validateConditionDraft(draft, fields, { context: '[MyComponent]' })
 *
 * // 静默模式
 * const isValid = validateConditionDraft(draft, fields, { silent: true })
 * ```
 */
export function validateConditionDraft(
  draft: SearchConditionDraft,
  fields: SearchFieldDef[],
  options: ValidateConditionOptions = {}
): boolean {
  const { context = '[SearchCondition]', silent = false } = options

  const warn = (message: string) => {
    if (!silent) {
      console.warn(`${context} ${message}`)
    }
  }

  const fieldDef = fields.find((f) => f.key === draft.field)
  if (!fieldDef) {
    warn(`字段不存在: ${draft.field}`)
    return false
  }

  // 字段必须可搜索
  if (fieldDef.searchable === false) {
    warn(`字段 ${draft.field} 不可搜索`)
    return false
  }

  // 校验操作符是否适用于字段数据类型
  const validOperators = getOperatorsForDataType(fieldDef.dataType)
  if (!validOperators.includes(draft.operator)) {
    warn(
      `操作符 ${draft.operator} 不适用于字段 ${draft.field}（类型: ${fieldDef.dataType}）`
    )
    return false
  }

  // 校验值的最小合法性
  const { operator, value } = draft

  // isEmpty / notEmpty 不需要值
  if (operator !== 'isEmpty' && operator !== 'notEmpty') {
    // 其他操作符必须有值
    if (value === undefined || value === null || value === '') {
      warn(`操作符 ${operator} 需要值`)
      return false
    }

    // between 必须是两个元素的数组
    if (operator === 'between') {
      if (!Array.isArray(value) || value.length !== 2) {
        warn(`between 操作符值必须是 [min, max] 数组`)
        return false
      }
      const [min, max] = value
      if (min === undefined || max === undefined || min === null || max === null) {
        warn(`between 操作符值不能包含 null/undefined`)
        return false
      }
      // 数值类型：验证 min < max
      if (typeof min === 'number' && typeof max === 'number' && min >= max) {
        warn(`between 操作符值必须满足 min < max: [${min}, ${max}]`)
        return false
      }
    }

    // in / notIn 必须是非空数组
    if (operator === 'in' || operator === 'notIn') {
      if (!Array.isArray(value) || value.length === 0) {
        warn(`${operator} 操作符值必须是非空数组`)
        return false
      }
    }

    // 枚举值必须在选项中
    if (fieldDef.options && fieldDef.options.length > 0) {
      const validValues = fieldDef.options.map((opt) => opt.value)
      const checkValues = Array.isArray(value) ? value : [value]
      const hasInvalid = checkValues.some((v) => !validValues.includes(v))
      if (hasInvalid) {
        warn(`枚举字段 ${draft.field} 的值必须在 options 中`)
        return false
      }
    }
  }

  return true
}
