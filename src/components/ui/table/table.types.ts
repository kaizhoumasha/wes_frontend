/**
 * 表格列配置类型定义
 *
 * 使用语义化的 field/title API，内部自动映射到 Element Plus 的 prop/label
 */

import type { VNode } from 'vue'

// ==================== 基础类型 ====================

/**
 * 列对齐方式
 */
export type ColumnAlign = 'left' | 'center' | 'right'

/**
 * 固定列方向
 */
export type ColumnFixed = 'left' | 'right'

/**
 * 列类型
 */
export type ColumnType = 'selection' | 'index' | 'expand'

// ==================== 插槽类型 ====================

/**
 * 列插槽渲染函数
 */
export type ColumnSlotRender = (scope: {
  row: Record<string, unknown>
  column: { property?: string; [key: string]: unknown }
  $index: number
}) => VNode | string | number

/**
 * 列插槽配置
 */
export interface ColumnSlots {
  /** 默认内容插槽 */
  default?: ColumnSlotRender
  /** 表头插槽 */
  header?: ColumnSlotRender
}

// ==================== 格式化器 ====================

/**
 * 值格式化函数
 *
 * @param value - 字段值
 * @param row - 行数据
 * @param column - 列信息
 * @returns 格式化后的值（字符串、数字或 VNode）
 */
export type ColumnFormatter = (
  value: unknown,
  row: Record<string, unknown>,
  column: { property?: string; [key: string]: unknown }
) => string | number | VNode

/**
 * 表格排序顺序（Element Plus 标准值）
 */
export type TableSortOrder = 'ascending' | 'descending' | null

// ==================== 列配置 ====================

/**
 * 表格列配置项
 *
 * 使用语义化的 field/title 命名，内部自动映射到 Element Plus 的 prop/label
 */
export interface TableColumnConfig {
  // ==================== 基础属性 ====================

  /** 字段名（对应数据对象的 key，映射到 Element Plus 的 prop）
   * type 类型的列不需要此属性
   */
  field?: string
  /** 列标题（显示名称，映射到 Element Plus 的 label） */
  title?: string
  /** 列宽度 */
  width?: number
  /** 最小列宽 */
  minWidth?: number
  /** 对齐方式 */
  align?: ColumnAlign
  /** 固定列 */
  fixed?: ColumnFixed | boolean
  /** 该列对应的排序字段，默认回退到 field/prop */
  sortKey?: string

  // ==================== 列类型 ====================

  /** 列类型（selection/index/expand）
   * 设置后，field 和 title 变为可选
   */
  type?: ColumnType

  // ==================== 自定义渲染 ====================

  /** 格式化函数 */
  formatter?: ColumnFormatter
  /** 插槽渲染函数 */
  slots?: ColumnSlots

  // ==================== 交互属性 ====================

  /** 是否可排序 */
  sortable?: boolean | 'custom'
  /** 是否允许拖拽调整列宽 */
  resizable?: boolean
  /** 单列内容溢出时是否显示 tooltip，默认继承表格级配置 */
  showOverflowTooltip?: boolean

  // ==================== 显示控制 ====================

  /** 是否隐藏列 */
  visible?: boolean
  /** 是否禁用列 */
  disabled?: boolean
  /** 是否出现在列配置系统中 */
  configurable?: boolean
  /** 是否允许在列配置系统中隐藏 */
  hideable?: boolean
  /** 是否锁定列顺序，禁止在列配置系统中拖动 */
  reorderLocked?: boolean

  // ==================== Element Plus 原生属性扩展 ====================

  /** class 名称 */
  className?: string
  /** label class 名称 */
  labelClassName?: string
  /** 列是否固定（Element Plus 原生） */
  prop?: string // 保留用于高级场景（如需要直接使用 Element Plus 的 prop）
}

// ==================== 表格配置 ====================

/**
 * 表格配置项
 */
export interface TableConfig {
  /** 列配置数组 */
  columns: TableColumnConfig[]
  /** 是否显示边框 */
  border?: boolean
  /** 是否显示斑马纹 */
  stripe?: boolean
  /** 表格行唯一 key 字段 */
  rowKey?: string
  /** 默认排序字段 */
  defaultSort?: { field: string; order: 'ascending' | 'descending' }
  /** 是否高亮当前行 */
  highlightCurrentRow?: boolean
  /** 内容溢出时是否省略 */
  showOverflowTooltip?: boolean
}

// ==================== 树形表格配置 ====================

/**
 * 树形表格配置
 */
export interface TreePropsConfig {
  /** 子节点数组的字段名（默认 'children'） */
  children?: string
  /** 是否有子节点的字段名（默认 'hasChildren'） */
  hasChildren?: string
}

// ==================== 数据表格组件 Props ====================

/**
 * DataTable 组件 Props
 */
export interface DataTableProps<T = unknown> {
  /** 表格数据 */
  data: T[]
  /** 列配置 */
  columns: TableColumnConfig[]
  /** 是否加载中 */
  loading?: boolean
  /** 是否显示边框 */
  border?: boolean
  /** 是否显示斑马纹 */
  stripe?: boolean
  /** 行唯一 key 字段 */
  rowKey?: string
  /** 表格高度 */
  height?: string | number
  /** 表格最大高度 */
  maxHeight?: string | number
  /** 是否高亮当前行 */
  highlightCurrentRow?: boolean
  /** 内容溢出时是否省略 */
  showOverflowTooltip?: boolean
  /** 表格密度（舒适/紧凑/迷你） */
  density?: 'comfortable' | 'compact' | 'small'
  /** 是否显示选择列 */
  showSelection?: boolean
  /** 树形表格配置 */
  treeProps?: TreePropsConfig
  /** 默认展开所有行（树形表格） */
  defaultExpandAll?: boolean
  /** 默认展开的行 key 数组（树形表格） */
  defaultExpandRowKeys?: Array<string | number>
  /** 默认排序状态 */
  defaultSort?: { field: string; order: Exclude<TableSortOrder, null> }
  /** 是否启用列宽拖拽 */
  columnResizable?: boolean
}

// ==================== 数据表格组件 Emits ====================

/**
 * DataTable 组件 Emits
 */
export interface DataTableEmits<T = unknown> {
  /** 选择变化事件 */
  (e: 'selection-change', selection: T[]): void
  /** 当前行变化事件 */
  (e: 'current-change', currentRow: T | null, oldCurrentRow: T | null): void
  /** 单元格点击事件 */
  (e: 'cell-click', row: T, column: { property?: string }, cell: HTMLTableCellElement, event: Event): void
  /** 行点击事件 */
  (e: 'row-click', row: T, column: { property?: string }, event: Event): void
  /** 排序变化事件 */
  (e: 'sort-change', sort: {
    column: { property?: string }
    field: string
    sortKey?: string
    order: TableSortOrder
  }): void
  /** 列宽变化事件 */
  (e: 'column-resize', resize: {
    field: string
    width: number
    oldWidth: number
    column: {
      property?: string
      label?: string
      id?: string
      resizable?: boolean
    }
    event: MouseEvent
  }): void
  /** 过滤变化事件 */
  (e: 'filter-change', filters: unknown): void
}

// ==================== 分页配置 ====================

/**
 * 分页配置
 */
export interface PaginationConfig {
  /** 当前页码 */
  page: number
  /** 每页条数 */
  pageSize: number
  /** 总条数 */
  total: number
  /** 可选的每页条数 */
  pageSizes?: number[]
}

// ==================== 完整表格配置（含分页） ====================

/**
 * 完整数据表格 Props（含分页）
 */
export interface DataTableWithPaginationProps<T = unknown> extends DataTableProps<T> {
  /** 分页配置 */
  pagination?: PaginationConfig
}

// ==================== 组件实例类型 ====================

/**
 * DataTable 组件实例类型
 *
 * 定义组件通过 defineExpose 暴露的方法
 */
export interface DataTableInstance {
  /** 清除选中状态 */
  clearSelection: () => void
}
