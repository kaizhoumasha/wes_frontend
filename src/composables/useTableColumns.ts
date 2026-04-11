/**
 * useTableColumns Composable
 *
 * 通用表格列配置管理，支持：
 * - 断点可见性控制（mobile/tablet/desktop）
 * - 列宽持久化（localStorage）
 * - 列顺序拖拽（可锁定某些列）
 * - 列配置重置
 *
 * @example
 * ```typescript
 * const { columns, visibleColumns, updateConfig, resetConfig } = useTableColumns({
 *   storageKey: 'my-table-columns',
 *   defaultColumns: DEFAULT_COLUMNS,
 *   reorderLockedKeys: ['id', 'operations'] // 锁定的列
 * })
 * ```
 */

import { computed, type Ref } from 'vue'
import { useStorage } from '@vueuse/core'
import type {
  ColumnFormatter,
  ColumnSlots,
  TableColumnConfig,
  ColumnFixed as TableColumnFixed
} from '@/components/ui/table/table.types'
import type { SearchDataType, SearchFieldDef, SearchOperator } from '@/types/search'

// ============================================================================
// 类型定义
// ============================================================================

/**
 * 列可见性断点
 */
export type ColumnVisibleFrom = 'desktop' | 'tablet' | 'mobile'

export type ColumnFixed = TableColumnFixed | null

/**
 * 列配置项（带断点可见性）
 */
export interface ColumnConfig {
  /** 列唯一标识 */
  key: string
  /** 列标题 */
  label: string
  /** 在哪些断点可见（null 表示完全隐藏） */
  visibleFrom: ColumnVisibleFrom | null
  /** 列宽 */
  width?: number
  /** 固定位置 */
  fixed?: ColumnFixed
  /** 是否锁定顺序（不可拖拽） */
  reorderLocked?: boolean
  /** 是否允许隐藏 */
  hideable?: boolean
  /** 格式化函数 */
  formatter?: ColumnFormatter
}

// ============================================================================
// 统一字段配置（表格 + 表单）
// ============================================================================

/**
 * 表单字段类型（与 CrudFormDialog 的 FieldConfig 类型兼容）
 */
export type FormFieldType =
  | 'input'
  | 'password'
  | 'number'
  | 'textarea'
  | 'select'
  | 'switch'
  | 'checkbox'
  | 'date'
  | 'datetime'
  | 'remote-select'
  | 'icon'

export type FormFieldOptionValue = string | number | boolean | Record<string, unknown>

export interface FormFieldOption {
  label: string
  value: FormFieldOptionValue
}

export type FormMode = 'create' | 'edit'

/**
 * 表单字段配置
 */
export interface FormFieldConfig {
  /** 字段唯一标识（与表格 key 一致） */
  key: string
  /** 字段标签（与表格 label 一致） */
  label: string
  /** 字段类型 */
  type: FormFieldType
  /** 输入类型（用于 input 类型） */
  inputType?: 'text' | 'email' | 'tel' | 'url'
  /** 占位符 */
  placeholder?: string
  /** 是否必填 */
  required?: boolean
  /** 是否只读（编辑模式下） */
  readonly?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 自动完成属性 */
  autocomplete?: string
  /** 选项列表（用于 select/radio） */
  options?: FormFieldOption[]
  /** 文本域行数 */
  rows?: number
  /** 数字输入最小值 */
  min?: number
  /** 数字输入最大值 */
  max?: number
  /** 数字输入步长 */
  step?: number
  /** 远程搜索方法 */
  remoteMethod?: (query: string) => Promise<FormFieldOption[]>
  /** 远程选项列表 */
  remoteOptions?: FormFieldOption[]
  /** 远程加载状态 */
  loading?: boolean
  /** 字段显示模式，默认创建/编辑都显示 */
  modes?: FormMode[]
  /** 默认值（用于新建表单初始值） */
  defaultValue?: unknown
  /** 其他配置 */
  [key: string]: unknown
}

/**
 * 统一字段基础信息
 */
interface UnifiedFieldConfigBase {
  /** 字段唯一标识 */
  key: string
  /** 字段标题/标签 */
  label: string
}

/**
 * 表格列配置片段
 */
export interface UnifiedTableConfig {
  /** 在哪些断点可见（null 表示完全隐藏，表单场景下忽略） */
  visibleFrom?: ColumnVisibleFrom | null
  /** 表格列宽 */
  width?: number
  /** 表格最小列宽 */
  minWidth?: number
  /** 固定位置 */
  fixed?: ColumnFixed
  /** 是否锁定顺序（不可拖拽） */
  reorderLocked?: boolean
  /** 是否允许隐藏 */
  hideable?: boolean
  /** 是否可排序 */
  sortable?: boolean
  /** 格式化器（表格专用） */
  formatter?: ColumnFormatter
  /** 插槽渲染（表格专用） */
  slots?: ColumnSlots
}

/**
 * 表单字段配置片段
 */
export interface UnifiedFormConfig {
  /** 表单字段类型 */
  type: FormFieldType
  /** 输入类型（用于 input 类型） */
  inputType?: 'text' | 'email' | 'tel' | 'url'
  /** 占位符 */
  placeholder?: string
  /** 是否必填（表单验证） */
  required?: boolean
  /** 是否只读（编辑模式下） */
  readonly?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 自动完成属性 */
  autocomplete?: string
  /** 选项列表（用于 select/radio） */
  options?: FormFieldOption[]
  /** 文本域行数 */
  rows?: number
  /** 数字输入最小值 */
  min?: number
  /** 数字输入最大值 */
  max?: number
  /** 数字输入步长 */
  step?: number
  /** 远程搜索方法 */
  remoteMethod?: (query: string) => Promise<FormFieldOption[]>
  /** 远程选项列表 */
  remoteOptions?: FormFieldOption[]
  /** 远程加载状态 */
  loading?: boolean
  /** 字段显示模式，默认创建/编辑都显示 */
  modes?: FormMode[]
  /** 其他配置 */
  [key: string]: unknown
}

/**
 * 搜索字段配置片段
 */
export interface UnifiedSearchConfig {
  /** 搜索数据类型 */
  dataType: SearchDataType
  /** 是否参与搜索 */
  searchable?: boolean
  /** 默认操作符 */
  defaultOperator?: SearchOperator
  /** 快捷操作符列表 */
  quickOps?: SearchOperator[]
  /** 枚举/布尔选项 */
  options?: SearchFieldDef['options']
  /** 搜索输入占位符 */
  placeholder?: string
  /** 字段图标 */
  icon?: SearchFieldDef['icon']
}

/**
 * 统一字段配置
 *
 * 设计原则：
 * - table / form / search 各自表达独立能力，避免一个字段承担多重语义
 * - form/search 可存在而 table 不存在，适配“仅表单字段”“仅搜索字段”等场景
 */
export interface UnifiedFieldConfig extends UnifiedFieldConfigBase {
  table?: UnifiedTableConfig
  form?: UnifiedFormConfig
  search?: UnifiedSearchConfig
}

export type UnifiedFieldConfigWithTable = UnifiedFieldConfig & {
  table: UnifiedTableConfig
}

export type UnifiedFieldConfigWithForm = UnifiedFieldConfig & {
  form: UnifiedFormConfig
}

export type UnifiedFieldConfigWithSearch = UnifiedFieldConfig & {
  search: UnifiedSearchConfig
}

/**
 * useTableColumns 参数
 */
export interface UseTableColumnsOptions {
  /** localStorage 存储键 */
  storageKey: string
  /** 默认列配置 */
  defaultColumns: ColumnConfig[]
  /** 始终锁定的列 key 数组（可选，会在初始化时设置 reorderLocked） */
  reorderLockedKeys?: string[]
}

/**
 * useTableColumns 返回值
 */
export interface UseTableColumnsReturn {
  /** 完整的列配置（响应式） */
  columnConfig: Ref<ColumnConfig[]>
  /** 当前可见的列 key 数组（computed） */
  visibleColumnKeys: Ref<string[]>
  /** 更新配置（拖拽排序后可调用） */
  updateConfig: (newConfig: ColumnConfig[]) => void
  /** 更新列宽 */
  updateColumnWidth: (key: string, width: number) => void
  /** 重置为默认配置 */
  resetConfig: () => void
  /** 检查列在指定断点是否可见 */
  isColumnVisibleAtBreakpoint: (column: ColumnConfig, breakpoint: ColumnBreakpoint) => boolean
}

export type ColumnBreakpoint = ColumnVisibleFrom

// ============================================================================
// 常量
// ============================================================================

const COLUMN_VISIBILITY_RANK: Record<ColumnVisibleFrom, number> = {
  mobile: 1,
  tablet: 2,
  desktop: 3
}

// ============================================================================
// 工具函数
// ============================================================================

/**
 * 检查列在指定断点是否可见
 */
export function isColumnVisibleAtBreakpoint(
  column: ColumnConfig,
  breakpoint: ColumnBreakpoint
): boolean {
  if (!column.visibleFrom) {
    return false
  }

  return COLUMN_VISIBILITY_RANK[breakpoint] >= COLUMN_VISIBILITY_RANK[column.visibleFrom]
}

/**
 * 按固定位置排序列（固定左 → 中间 → 固定右）
 */
export function sortColumnsByFixedPosition(columns: ColumnConfig[]): ColumnConfig[] {
  const leftFixed = columns.filter(column => column.fixed === 'left')
  const middle = columns.filter(column => column.fixed === null || column.fixed === undefined)
  const rightFixed = columns.filter(column => column.fixed === 'right')
  return [...leftFixed, ...middle, ...rightFixed]
}

/**
 * 标准化列配置（合并默认配置和用户配置）
 */
function normalizeColumnConfig(
  config: ColumnConfig[] | null | undefined,
  defaultColumns: ColumnConfig[],
  reorderLockedKeys?: string[]
): ColumnConfig[] {
  const defaultsMap = new Map(defaultColumns.map(col => [col.key, col]))
  const normalized: ColumnConfig[] = []

  for (const item of config ?? []) {
    const defaultConfig = defaultsMap.get(item.key)
    if (!defaultConfig) {
      continue
    }

    // 可见性处理
    let visibleFrom = defaultConfig.visibleFrom
    if (item.visibleFrom === null) {
      visibleFrom = null
    } else if (
      item.visibleFrom === 'desktop' ||
      item.visibleFrom === 'tablet' ||
      item.visibleFrom === 'mobile'
    ) {
      visibleFrom = item.visibleFrom
    }

    // 固定列不能被隐藏（强制恢复默认可见性）
    const fixed = item.fixed ?? defaultConfig.fixed ?? null
    const width = typeof item.width === 'number' && item.width > 0 ? item.width : defaultConfig.width
    const hideable = item.hideable ?? defaultConfig.hideable ?? true

    if (fixed && hideable === false) {
      visibleFrom = defaultConfig.visibleFrom
    }

    normalized.push({
      key: defaultConfig.key,
      label: item.label ?? defaultConfig.label,
      visibleFrom,
      width,
      fixed,
      reorderLocked: item.reorderLocked ?? defaultConfig.reorderLocked ?? false,
      hideable
    })
  }

  // 补充缺失的列
  for (const defaultConfig of defaultColumns) {
    if (!normalized.some(column => column.key === defaultConfig.key)) {
      normalized.push({ ...defaultConfig })
    }
  }

  // 应用 reorderLockedKeys
  if (reorderLockedKeys?.length) {
    for (const col of normalized) {
      if (reorderLockedKeys.includes(col.key)) {
        col.reorderLocked = true
      }
    }
  }

  return sortColumnsByFixedPosition(normalized)
}

function cloneDefaultColumns(defaultColumns: ColumnConfig[]): ColumnConfig[] {
  return defaultColumns.map(column => ({ ...column }))
}

// ============================================================================
// Composable 实现
// ============================================================================

export function useTableColumns(options: UseTableColumnsOptions): UseTableColumnsReturn {
  const { storageKey, defaultColumns, reorderLockedKeys = [] } = options

  // 初始化 localStorage 存储
  const columnConfig = useStorage<ColumnConfig[]>(
    storageKey,
    cloneDefaultColumns(defaultColumns)
  )

  // 标准化配置（合并默认值）
  columnConfig.value = normalizeColumnConfig(columnConfig.value, defaultColumns, reorderLockedKeys)

  /** 当前可见的列 key 数组 */
  const visibleColumnKeys = computed(() =>
    columnConfig.value
      .filter(column => column.visibleFrom !== null)
      .map(column => column.key)
  )

  /**
   * 更新配置（用于拖拽排序后）
   */
  function updateConfig(newConfig: ColumnConfig[]) {
    columnConfig.value = normalizeColumnConfig(newConfig, defaultColumns, reorderLockedKeys)
  }

  /**
   * 更新列宽
   */
  function updateColumnWidth(key: string, width: number) {
    if (!Number.isFinite(width) || width <= 0) {
      return
    }

    columnConfig.value = normalizeColumnConfig(
      columnConfig.value.map(column =>
        column.key === key
          ? { ...column, width }
          : column
      ),
      defaultColumns,
      reorderLockedKeys
    )
  }

  /**
   * 重置为默认配置
   */
  function resetConfig() {
    columnConfig.value = normalizeColumnConfig(
      cloneDefaultColumns(defaultColumns),
      defaultColumns,
      reorderLockedKeys
    )
  }

  return {
    columnConfig,
    visibleColumnKeys,
    updateConfig,
    updateColumnWidth,
    resetConfig,
    isColumnVisibleAtBreakpoint
  }
}

// ============================================================================
// 辅助函数：构建表格列配置
// ============================================================================

/**
 * 根据断点和列配置构建实际的表格列配置
 *
 * @param columnConfigs - 列配置数组
 * @param breakpoint - 当前断点
 * @param columnMap - 列定义 Map（key → TableColumnConfig）
 * @returns 过滤后的 TableColumnConfig 数组
 */
export function buildTableColumnsByBreakpoint(
  columnConfigs: ColumnConfig[],
  breakpoint: ColumnBreakpoint,
  columnMap: Map<string, TableColumnConfig>
): TableColumnConfig[] {
  return columnConfigs
    .filter(column => isColumnVisibleAtBreakpoint(column, breakpoint))
    .map(column => {
      const def = columnMap.get(column.key)
      if (!def) {
        return null
      }

      const resolvedColumn: TableColumnConfig = {
        ...def,
        width: typeof column.width === 'number' ? column.width : def.width,
        fixed: column.fixed ?? def.fixed,
        configurable: def.configurable ?? true,
        hideable: column.hideable ?? def.hideable ?? true,
        reorderLocked: column.reorderLocked ?? def.reorderLocked ?? false,
        // 优先使用 ColumnConfig 中定义的 formatter
        formatter: column.formatter ?? def.formatter
      }

      return resolvedColumn
    })
    .filter((column): column is TableColumnConfig => Boolean(column))
}

// ============================================================================
// 统一配置工具函数
// ============================================================================

/**
 * 检查是否包含表单字段配置
 */
export function hasFormConfig(unified: UnifiedFieldConfig): unified is UnifiedFieldConfigWithForm {
  return unified.form != null
}

/**
 * 检查是否包含表格列配置
 */
export function hasTableConfig(unified: UnifiedFieldConfig): unified is UnifiedFieldConfigWithTable {
  return unified.table != null
}

/**
 * 检查是否包含搜索字段配置
 */
export function hasSearchConfig(unified: UnifiedFieldConfig): unified is UnifiedFieldConfigWithSearch {
  return unified.search != null
}

/**
 * 从 UnifiedFieldConfig 提取 ColumnConfig（用于表格）
 */
export function extractColumnConfig(unified: UnifiedFieldConfigWithTable): ColumnConfig {
  return {
    key: unified.key,
    label: unified.label,
    visibleFrom: unified.table.visibleFrom ?? null,
    width: unified.table.width,
    fixed: unified.table.fixed ?? null,
    reorderLocked: unified.table.reorderLocked ?? false,
    hideable: unified.table.hideable ?? true,
    formatter: unified.table.formatter
  }
}

/**
 * 从 UnifiedFieldConfig 提取 FormFieldConfig（用于表单）
 */
export function extractFormFieldConfig(unified: UnifiedFieldConfigWithForm): FormFieldConfig {
  return {
    key: unified.key,
    label: unified.label,
    ...unified.form
  }
}

/**
 * 从 UnifiedFieldConfig 提取 SearchFieldDef（用于搜索）
 */
export function extractSearchFieldConfig(unified: UnifiedFieldConfigWithSearch): SearchFieldDef {
  return {
    key: unified.key,
    label: unified.label,
    searchable: unified.search.searchable,
    dataType: unified.search.dataType,
    defaultOperator: unified.search.defaultOperator,
    quickOps: unified.search.quickOps,
    options: unified.search.options,
    placeholder: unified.search.placeholder,
    icon: unified.search.icon
  }
}

/**
 * 从 UnifiedFieldConfig 数组批量提取 ColumnConfig
 * 自动过滤 visibleFrom: null 的字段（完全隐藏，不显示在表格也不参与列配置）
 */
export function extractColumnConfigs(unifiedConfigs: readonly UnifiedFieldConfig[]): ColumnConfig[] {
  return unifiedConfigs
    .filter(hasTableConfig)
    .filter(config => config.table.visibleFrom !== null) // 过滤完全隐藏的字段
    .map(extractColumnConfig)
}

/**
 * 从 UnifiedFieldConfig 数组批量提取 FormFieldConfig
 * 自动跳过未声明 form 配置的字段
 */
export function extractFormFieldConfigs(unifiedConfigs: readonly UnifiedFieldConfig[]): FormFieldConfig[] {
  return unifiedConfigs.filter(hasFormConfig).map(extractFormFieldConfig)
}

/**
 * 从 UnifiedFieldConfig 数组批量提取 SearchFieldDef
 * 自动跳过未声明 search 配置的字段
 */
export function extractSearchFieldConfigs(unifiedConfigs: readonly UnifiedFieldConfig[]): SearchFieldDef[] {
  return unifiedConfigs.filter(hasSearchConfig).map(extractSearchFieldConfig)
}
