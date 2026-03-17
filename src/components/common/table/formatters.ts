/**
 * 表格通用格式化器工厂
 *
 * 提供常用的表格列格式化器，支持：
 * - 布尔值标签（是/否 + Element Plus Tag）
 * - 日期时间格式化（多时区支持）
 * - 数组标签（多对多关系显示）
 * - 状态标签（枚举映射）
 * - 操作按钮组
 *
 * @example
 * ```typescript
 * import {
 *   createBooleanTagFormatter,
 *   createDateTimeFormatter,
 *   createArrayTagFormatter,
 *   createStatusTagFormatter,
 *   createActionsFormatter
 * } from '@/components/common/table/formatters'
 *
 * // 布尔值标签
 * const isSuperUserCol = {
 *   field: 'is_superuser',
 *   title: '超级用户',
 *   formatter: createBooleanTagFormatter({ trueType: 'danger' })
 * }
 *
 * // 日期时间
 * const updatedAtCol = {
 *   field: 'updated_at',
 *   title: '更新时间',
 *   formatter: createDateTimeFormatter()
 * }
 *
 * // 数组标签
 * const rolesCol = {
 *   field: 'roles',
 *   title: '角色',
 *   slots: { default: createArrayTagFormatter({ labelField: 'name', emptyLabel: '无角色' }) }
 * }
 *
 * // 状态标签
 * const statusCol = {
 *   field: 'status',
 *   title: '状态',
 *   formatter: createStatusTagFormatter({
 *     active: { type: 'success', label: '启用' },
 *     inactive: { type: 'info', label: '禁用' }
 *   })
 * }
 * ```
 */

import { h } from 'vue'
import { ElTag, ElPopconfirm } from 'element-plus'
import AppButton from '@/components/ui/AppButton.vue'
import { parseApiTime } from '@/utils/timezone'
import { useTimezoneStore } from '@/stores/timezone'
import { usePermission } from '@/composables/usePermission'
import type { ColumnFormatter, ColumnSlotRender, TableColumnConfig } from '@/components/ui/table/table.types'

// ============================================================================
// 布尔值格式化器
// ============================================================================

export interface BooleanTagFormatterOptions {
  /** 是标签文本 */
  trueLabel?: string
  /** 否标签文本 */
  falseLabel?: string
  /** true 时 Tag 类型 */
  trueType?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  /** false 时 Tag 类型 */
  falseType?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  /** Tag 尺寸 */
  size?: 'small' | 'default' | 'large'
}

/**
 * 创建布尔值标签格式化器
 *
 * @example
 * ```ts
 * // 简单用法
 * formatter: createBooleanTagFormatter()
 *
 * // 自定义
 * formatter: createBooleanTagFormatter({
 *   trueLabel: '启用',
 *   falseLabel: '禁用',
 *   trueType: 'success',
 *   falseType: 'info'
 * })
 * ```
 */
export function createBooleanTagFormatter(
  options: BooleanTagFormatterOptions = {}
): ColumnFormatter {
  const {
    trueLabel = '是',
    falseLabel = '否',
    trueType = 'success',
    falseType = 'info',
    size = 'small'
  } = options

  return (value: unknown) => {
    const isTrue = Boolean(value)
    return h(
      ElTag,
      {
        type: isTrue ? trueType : falseType,
        size
      },
      { default: () => isTrue ? trueLabel : falseLabel }
    )
  }
}

// ============================================================================
// 日期时间格式化器
// ============================================================================

export interface DateTimeFormatterOptions {
  /** 日期时间格式（默认 'yyyy-MM-dd HH:mm:ss'） */
  format?: string
  /** 是否显示为相对时间（如 "3 小时前"） */
  relative?: boolean
  /** 空值显示文本 */
  emptyLabel?: string
}

/**
 * 创建日期时间格式化器（多时区支持）
 *
 * @example
 * ```ts
 * // 默认用法
 * formatter: createDateTimeFormatter()
 *
 * // 自定义格式
 * formatter: createDateTimeFormatter({ format: 'yyyy/MM/dd HH:mm' })
 *
 * // 相对时间
 * formatter: createDateTimeFormatter({ relative: true })
 * ```
 */
export function createDateTimeFormatter(
  options: DateTimeFormatterOptions = {}
): ColumnFormatter {
  const {
    format = 'yyyy-MM-dd HH:mm:ss',
    relative = false,
    emptyLabel = '-'
  } = options

  return (value: unknown) => {
    if (!value) return emptyLabel

    try {
      const date = parseApiTime(String(value))
      const timezoneStore = useTimezoneStore()

      if (relative) {
        // 相对时间格式化：使用简单的相对时间逻辑
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMins / 60)
        const diffDays = Math.floor(diffHours / 24)

        if (diffMins < 1) return '刚刚'
        if (diffMins < 60) return `${diffMins}分钟前`
        if (diffHours < 24) return `${diffHours}小时前`
        if (diffDays < 30) return `${diffDays}天前`
        if (diffDays < 365) return `${Math.floor(diffDays / 30)}个月前`
        return `${Math.floor(diffDays / 365)}年前`
      }

      return timezoneStore.formatInCurrentTimezone(date, format)
    } catch {
      return emptyLabel
    }
  }
}

/**
 * 创建纯日期格式化器（不含时间）
 */
export function createDateFormatter(
  options: Omit<DateTimeFormatterOptions, 'format'> = {}
): ColumnFormatter {
  return createDateTimeFormatter({ ...options, format: 'yyyy-MM-dd' })
}

// ============================================================================
// 数组标签格式化器
// ============================================================================

export interface ArrayTagFormatterOptions<T = unknown> {
  /** 标签字段名 */
  labelField: string
  /** 空值显示文本 */
  emptyLabel?: string
  /** Tag 尺寸 */
  size?: 'small' | 'default' | 'large'
  /** Tag 类型（统一或按 item 映射） */
  tagType?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | ((item: T) => 'primary' | 'success' | 'warning' | 'danger' | 'info')
  /** 是否显示数量（超过 N 个后显示 "+N"） */
  maxVisible?: number
}

/**
 * 创建数组标签格式化器
 *
 * @example
 * ```ts
 * // 简单用法
 * slots: { default: createArrayTagFormatter({ labelField: 'name' }) }
 *
 * // 自定义
 * slots: { default: createArrayTagFormatter({
 *   labelField: 'name',
 *   emptyLabel: '无角色',
 *   size: 'small',
 *   maxVisible: 3
 * }) }
 * ```
 */
export function createArrayTagFormatter<T = unknown>(
  options: ArrayTagFormatterOptions<T>
): ColumnSlotRender {
  const {
    labelField,
    emptyLabel = '-',
    size = 'small',
    tagType = 'info',
    maxVisible
  } = options

  return ({ row, column }) => {
    const propertyKey = (column.property ?? column.field) as string | undefined
    const value = propertyKey ? row[propertyKey] : undefined

    if (!value || !Array.isArray(value) || value.length === 0) {
      return h('span', { class: 'text-muted' }, emptyLabel)
    }

    // 处理 maxVisible
    let displayItems = value
    let overflowCount = 0

    if (maxVisible && value.length > maxVisible) {
      displayItems = value.slice(0, maxVisible)
      overflowCount = value.length - maxVisible
    }

    const tagNodes = displayItems.map((item: T) => {
      const resolvedType = typeof tagType === 'function' ? tagType(item) : tagType
      const label = (item as Record<string, unknown>)[labelField] ?? item

      return h(
        ElTag,
        {
          key: String((item as Record<string, unknown>).id ?? item),
          type: resolvedType,
          size
        },
        { default: () => String(label) }
      )
    })

    // 添加溢出计数
    if (overflowCount > 0) {
      tagNodes.push(
        h(
          ElTag,
          {
            key: 'overflow',
            type: 'info',
            size
          },
          { default: () => `+${overflowCount}` }
        )
      )
    }

    return h('div', { class: 'flex gap-1 flex-wrap' }, tagNodes)
  }
}

// ============================================================================
// 状态标签格式化器
// ============================================================================

export interface StatusTagConfig {
  /** 标签文本 */
  label: string
  /** Tag 类型 */
  type: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  /** 是否显示圆点 */
  dot?: boolean
}

export type StatusTagMap = Record<string, string | StatusTagConfig>

export interface StatusTagFormatterOptions {
  /** 空值/未知状态显示文本 */
  emptyLabel?: string
  /** Tag 尺寸 */
  size?: 'small' | 'default' | 'large'
}

/**
 * 创建状态标签格式化器
 *
 * @example
 * ```ts
 * formatter: createStatusTagFormatter({
 *   active: { type: 'success', label: '启用' },
 *   inactive: { type: 'info', label: '禁用' },
 *   pending: { type: 'warning', label: '待审核' }
 * })
 *
 * // 简单形式（统一 type）
 * formatter: createStatusTagFormatter({
 *   active: '启用',
 *   inactive: '禁用'
 * })
 * ```
 */
export function createStatusTagFormatter(
  statusMap: StatusTagMap,
  options: StatusTagFormatterOptions = {}
): ColumnFormatter {
  const {
    emptyLabel = '-',
    size = 'small'
  } = options

  return (value: unknown) => {
    const config = statusMap[String(value)]
    if (!config) {
      return h('span', { class: 'text-muted' }, emptyLabel)
    }

    if (typeof config === 'string') {
      return h(ElTag, { type: 'info', size }, { default: () => config })
    }

    const { label, type, dot = false } = config

    if (dot) {
      return h('div', { class: 'flex items-center gap-1' }, [
        h('span', {
          class: 'inline-block w-2 h-2 rounded-full',
          style: {
            backgroundColor: `var(--el-color-${type}-light-3)`
          }
        }),
        h(ElTag, { type, size }, { default: () => label })
      ])
    }

    return h(ElTag, { type, size }, { default: () => label })
  }
}

// ============================================================================
// 操作按钮格式化器
// ============================================================================

/**
 * 操作按钮配置
 */
export interface ActionButtonConfig {
  /** 按钮文本（支持函数） */
  label: ActionValue<string>
  /** 按钮类型 */
  type?: ActionValue<'primary' | 'success' | 'warning' | 'danger' | 'info'>
  /** 按钮图标 */
  icon?: string
  /** 按钮提示文案 */
  tooltip?: ActionValue<string>
  /** 是否链接样式 */
  link?: boolean
  /** 按钮尺寸 */
  size?: 'small' | 'default' | 'large'
  /** 显示条件 */
  show?: ActionValue<boolean>
  /** 禁用条件 */
  disabled?: ActionValue<boolean>
  /** 加载中条件 */
  loading?: ActionValue<boolean>
  /** 权限码（如果提供则自动进行权限检查） */
  permission?: string
  /** 点击回调 */
  onClick: (row: Record<string, unknown>, index: number) => void | Promise<void>
  /** 确认框配置（如果提供则显示确认框） */
  popconfirm?: {
    title: ActionValue<string>
    confirmButtonText?: string
    cancelButtonText?: string
    confirmButtonType?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
    width?: number
  }
}

export interface ActionsFormatterOptions {
  /** 按钮间距 */
  gap?: number
  /** 是否显示为块级 */
  block?: boolean
}

/**
 * 解析可能为函数的配置值
 */
type ActionValue<T> = T | ((row: Record<string, unknown>, index: number) => T)

function resolveActionValue<T>(
  value: ActionValue<T> | undefined,
  row: Record<string, unknown>,
  index: number
): T | undefined {
  if (typeof value === 'function') {
    return (value as (row: Record<string, unknown>, index: number) => T)(row, index)
  }
  return value
}

/**
 * 解析布尔值配置
 */
function resolveActionBoolean(
  value: ActionValue<boolean> | undefined,
  row: Record<string, unknown>,
  index: number,
  fallback: boolean
): boolean {
  const resolved = resolveActionValue(value, row, index)
  return typeof resolved === 'boolean' ? resolved : fallback
}

/**
 * 创建操作按钮组格式化器
 *
 * @example
 * ```ts
 * slots: { default: createActionsFormatter([
 *   {
 *     label: '编辑',
 *     type: 'primary',
 *     onClick: (row) => handleEdit(row)
 *   },
 *   {
 *     label: '删除',
 *     type: 'danger',
 *     popconfirm: { title: '确认删除？' },
 *     onClick: (row) => handleDelete(row)
 *   }
 * ]) }
 * ```
 */
export function createActionsFormatter(
  buttons: ActionButtonConfig[],
  options: ActionsFormatterOptions = {}
): ColumnSlotRender {
  const { hasPermission } = usePermission()
  const {
    gap = 8,
    block = false
  } = options

  return ({ row, $index }) => {
    const visibleButtons = buttons.filter(button =>
      (!button.permission || hasPermission(button.permission)) &&
      resolveActionBoolean(button.show, row, $index, true)
    )

    if (visibleButtons.length === 0) {
      return h('span', { class: 'text-muted' }, '-')
    }

    const buttonNodes = visibleButtons.map((button, buttonIndex) => {
      const label = resolveActionValue(button.label, row, $index) ?? ''
      const disabled = resolveActionBoolean(button.disabled, row, $index, false)
      const loading = resolveActionBoolean(button.loading, row, $index, false)
      const type = resolveActionValue(button.type, row, $index) ?? 'primary'
      const tooltip = resolveActionValue(button.tooltip, row, $index)
      const isLink = button.link ?? true

      const buttonNode = h(
        AppButton,
        {
          key: `${label}-${buttonIndex}`,
          type,
          size: button.size ?? 'small',
          icon: button.icon,
          tooltip,
          link: isLink,
          disabled,
          loading,
          preserveIconSpace: true,
          onClick: button.popconfirm ? undefined : () => button.onClick(row, $index)
        },
        { default: () => String(label) }
      )

      if (!button.popconfirm) {
        return buttonNode
      }

      return h(
        ElPopconfirm,
        {
          key: `confirm-${label}-${buttonIndex}`,
          title: resolveActionValue(button.popconfirm.title, row, $index),
          confirmButtonText: button.popconfirm.confirmButtonText,
          cancelButtonText: button.popconfirm.cancelButtonText,
          confirmButtonType: button.popconfirm.confirmButtonType,
          width: button.popconfirm.width,
          onConfirm: () => button.onClick(row, $index)
        },
        {
          reference: () => buttonNode
        }
      )
    })

    return h(
      'div',
      {
        class: block ? 'flex flex-col gap-1' : 'flex gap-2',
        style: !block ? { gap: `${gap}px` } : undefined
      },
      buttonNodes
    )
  }
}

// ============================================================================
// 工具函数：构建操作列
// ============================================================================

export type BuildActionsColumnOptions = Pick<
  TableColumnConfig,
  'field' | 'title' | 'width' | 'minWidth' | 'fixed' | 'reorderLocked' | 'hideable'
>

/**
 * 构建操作列配置
 *
 * @example
 * ```ts
 * const actionsCol = buildActionsColumn([
 *   { label: '编辑', type: 'primary', onClick: handleEdit },
 *   { label: '删除', type: 'danger', popconfirm: { title: '确认？' }, onClick: handleDelete }
 * ], {
 *   width: 200,
 *   fixed: 'right'
 * })
 * ```
 */
export function buildActionsColumn(
  buttons: ActionButtonConfig[],
  options: BuildActionsColumnOptions = {}
): TableColumnConfig {
  const {
    field = '__actions__',
    title = '操作',
    width,
    minWidth,
    fixed = 'right',
    reorderLocked = true,
    hideable = false
  } = options

  return {
    field,
    title,
    slots: { default: createActionsFormatter(buttons) },
    align: 'center',
    width,
    minWidth,
    fixed,
    reorderLocked,
    hideable,
    configurable: false
  }
}
