/**
 * 表格列配置 Composable
 *
 * 提供语义化的 columns API 配置方式
 * 内置常用格式化器和工厂函数
 *
 * 多时区支持: 所有日期时间格式化器自动使用用户选择的时区
 */

import { h, type Component } from 'vue'
import type { TableColumnConfig, ColumnFormatter, ColumnSlotRender } from './table.types'
import { ElTag, ElButton, ElPopconfirm } from 'element-plus'
import { parseApiTime } from '@/utils/timezone'
import { useTimezoneStore } from '@/stores/timezone'

// ==================== 常用格式化器 ====================

/**
 * 日期时间格式化器（使用用户选择的时区）
 *
 * 自动适配用户的时区偏好:
 * - 用户选择时区 → 使用用户时区
 * - 浏览器检测模式 → 使用浏览器时区
 * - 默认 → 应用时区 (Asia/Shanghai)
 */
export const formatDateTime: ColumnFormatter = (value: unknown) => {
  if (!value) return '-'
  try {
    const date = parseApiTime(String(value))
    const timezoneStore = useTimezoneStore()
    return timezoneStore.formatInCurrentTimezone(date)
  } catch {
    return '-'
  }
}

/**
 * 日期格式化器（使用用户选择的时区）
 *
 * 自动适配用户的时区偏好
 */
export const formatDate: ColumnFormatter = (value: unknown) => {
  if (!value) return '-'
  try {
    const date = parseApiTime(String(value))
    const timezoneStore = useTimezoneStore()
    return timezoneStore.formatInCurrentTimezone(date, 'yyyy-MM-dd')
  } catch {
    return '-'
  }
}

/**
 * 布尔值格式化器（是/否）
 */
export const formatBoolean = (trueLabel = '是', falseLabel = '否'): ColumnFormatter => {
  return (value: unknown) => (value ? trueLabel : falseLabel)
}

/**
 * 标签格式化器
 *
 * @param typeMap - 类型映射，支持字符串或对象配置
 * @example
 * // 简单形式
 * formatTag({ active: '启用', inactive: '禁用' })
 * // 对象形式
 * formatTag({ active: { type: 'success', label: '启用' } })
 */
export const formatTag = (
  typeMap: Record<string, string | { type: string; label: string }>
): ColumnFormatter => {
  return (value: unknown) => {
    const config = typeMap[String(value)]
    if (!config) return '-'

    if (typeof config === 'string') {
      return h(ElTag, { type: 'info' as const }, { default: () => config })
    }

    return h(ElTag, { type: config.type as 'primary' | 'success' | 'warning' | 'danger' | 'info' }, { default: () => config.label })
  }
}

/**
 * 数组标签格式化器
 *
 * @param labelField - 标签字段名
 * @param emptyLabel - 空值显示文本
 */
export const formatArrayTags = (
  labelField: string,
  emptyLabel = '-'
): ColumnSlotRender => {
  return ({ row, column }) => {
    const propertyKey = (column.property ?? column.field) as string | undefined
    const value = propertyKey ? row[propertyKey] : undefined
    if (!value || !Array.isArray(value) || value.length === 0) {
      return h('span', { class: 'text-muted' }, emptyLabel)
    }

    return h('div', { class: 'flex gap-1 flex-wrap' },
      value.map((item: Record<string, unknown>) =>
        h(ElTag, {
          key: String(item.id ?? item),
          size: 'small',
        }, {
          default: () => String(item[labelField] ?? item)
        })
      )
    )
  }
}

/**
 * 操作列格式化器
 */
type ActionResolver<T> = T | ((row: Record<string, unknown>, index: number) => T)

export interface ActionPopconfirm {
  title: ActionResolver<string>
  confirmButtonText?: string
  cancelButtonText?: string
  confirmButtonType?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  width?: number
}

export interface ActionButton {
  label: ActionResolver<string>
  type?: ActionResolver<'primary' | 'success' | 'warning' | 'danger' | 'info'>
  icon?: Component
  link?: boolean
  size?: 'small' | 'default' | 'large'
  show?: ActionResolver<boolean>
  disabled?: ActionResolver<boolean>
  loading?: ActionResolver<boolean>
  popconfirm?: ActionPopconfirm
  onClick: (row: Record<string, unknown>, index: number) => void | Promise<void>
}

function resolveActionValue<T>(
  value: ActionResolver<T> | undefined,
  row: Record<string, unknown>,
  index: number
): T | undefined {
  if (typeof value === 'function') {
    return (value as (row: Record<string, unknown>, index: number) => T)(row, index)
  }

  return value
}

function resolveActionBoolean(
  value: ActionResolver<boolean> | undefined,
  row: Record<string, unknown>,
  index: number,
  fallback: boolean
): boolean {
  const resolvedValue = resolveActionValue(value, row, index)
  return typeof resolvedValue === 'boolean' ? resolvedValue : fallback
}

export const formatActions = (buttons: ActionButton[]): ColumnSlotRender => {
  return ({ row, $index }) => {
    return h(
      'div',
      { class: 'flex gap-2' },
      buttons
        .filter(button => resolveActionBoolean(button.show, row, $index, true))
        .map((button, buttonIndex) => {
          const label = resolveActionValue(button.label, row, $index) ?? ''
          const disabled = resolveActionBoolean(button.disabled, row, $index, false)
          const loading = resolveActionBoolean(button.loading, row, $index, false)
          const type = resolveActionValue(button.type, row, $index) ?? 'primary'

          const buttonNode = h(
            ElButton,
            {
              key: `${label}-${buttonIndex}`,
              link: button.link ?? true,
              type,
              size: button.size ?? 'small',
              icon: button.icon,
              disabled,
              loading,
              onClick: button.popconfirm ? undefined : () => button.onClick(row, $index),
            },
            {
              default: () => label
            }
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
    )
  }
}

// ==================== 工厂函数 ====================

/**
 * 创建文本列配置
 */
export function buildTextColumn(
  field: string,
  title: string,
  options: Partial<TableColumnConfig> = {}
): TableColumnConfig {
  return { field, title, ...options }
}

/**
 * 创建标签列配置
 */
export function buildTagColumn(
  field: string,
  title: string,
  typeMap: Record<string, string | { type: string; label: string }>,
  options: Partial<TableColumnConfig> = {}
): TableColumnConfig {
  return {
    field,
    title,
    formatter: formatTag(typeMap),
    align: 'center',
    ...options,
  }
}

/**
 * 创建数组标签列配置
 */
export function buildArrayTagsColumn(
  field: string,
  title: string,
  labelField: string,
  options: Partial<TableColumnConfig> = {}
): TableColumnConfig {
  return {
    field,
    title,
    slots: { default: formatArrayTags(labelField) },
    ...options,
  }
}

/**
 * 创建日期时间列配置
 */
export function buildDateTimeColumn(
  field: string,
  title: string,
  options: Partial<TableColumnConfig> = {}
): TableColumnConfig {
  return {
    field,
    title,
    formatter: formatDateTime,
    width: 180,
    ...options,
  }
}

/**
 * 创建操作列配置
 */
export function buildActionsColumn(
  buttons: ActionButton[],
  options: Partial<TableColumnConfig> = {}
): TableColumnConfig {
  return {
    field: '__actions__', // 伪字段，不会实际使用
    title: '操作',
    slots: { default: formatActions(buttons) },
    align: 'center',
    width: 150,
    fixed: 'right',
    ...options,
  }
}

// ==================== 主 Composable ====================

/**
 * 表格列配置 Hook
 *
 * 验证并处理列配置
 *
 * @param columns 列配置数组
 * @returns 列配置（只读）
 *
 * @example
 * ```ts
 * const { columns } = useTableColumns([
 *   { field: 'name', title: '姓名', width: 150 },
 *   { field: 'email', title: '邮箱', width: 200 },
 *   { field: 'is_active', title: '状态', width: 100, align: 'center',
 *     formatter: formatBoolean('启用', '禁用')
 *   },
 *   {
 *     field: 'actions',
 *     title: '操作',
 *     slots: {
 *       default: ({ row }) => h(ElButton, { onClick: () => edit(row) }, '编辑')
 *     }
 *   }
 * ])
 * ```
 */
export function useTableColumns(columns: TableColumnConfig[]) {
  // 验证列配置
  const validatedColumns = columns.map((col, index) => {
    // type 类型列不需要 field
    if (col.type) {
      return col
    }
    // 普通列必须有 field
    if (!col.field) {
      console.warn(`Column at index ${index} is missing required "field" property`, col)
    }
    return col
  })

  return {
    columns: validatedColumns,
  }
}

// 导出类型（ActionButton 已在文件开头导出）
export type { TableColumnConfig, ColumnFormatter, ColumnSlotRender }

// 向后兼容：保留旧的 create* 函数别名
export const createTextColumn = buildTextColumn
export const createTagColumn = buildTagColumn
export const createArrayTagsColumn = buildArrayTagsColumn
export const createDateTimeColumn = buildDateTimeColumn
export const createActionsColumn = buildActionsColumn
