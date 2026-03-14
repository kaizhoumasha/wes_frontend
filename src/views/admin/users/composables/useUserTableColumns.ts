import { computed, h } from 'vue'
import { useStorage } from '@vueuse/core'
import { ElTag } from 'element-plus'
import type { TableColumnConfig } from '@/types/table'
import { formatArrayTags, formatDateTime } from '@/components/ui/table/useTableColumns'

export type ColumnVisibleFrom = 'desktop' | 'tablet' | 'mobile'
export type ColumnBreakpoint = ColumnVisibleFrom
export type ColumnFixed = 'left' | 'right' | null

export interface ColumnConfig {
  key: string
  label: string
  visibleFrom: ColumnVisibleFrom | null
  width?: number
  fixed?: ColumnFixed
  reorderLocked?: boolean
  hideable?: boolean
}

export interface UserTableColumnDefinition extends ColumnConfig {
  column: Omit<TableColumnConfig, 'field' | 'title' | 'fixed' | 'configurable' | 'hideable' | 'reorderLocked'>
}

interface LegacyColumnConfig {
  key: string
  label?: string
  visible?: boolean
  visibleFrom?: ColumnVisibleFrom | null
  width?: number
  fixed?: ColumnFixed
  reorderLocked?: boolean
  hideable?: boolean
}

const COLUMN_VISIBILITY_RANK: Record<ColumnVisibleFrom, number> = {
  mobile: 1,
  tablet: 2,
  desktop: 3
}

function createBooleanTagFormatter(
  trueType: 'danger' | 'success' | 'warning',
  falseType: 'danger' | 'success' | 'warning' | 'info' = 'info'
) {
  return (value: unknown) =>
    h(ElTag, { type: value ? trueType : falseType }, () => (value ? '是' : '否'))
}

export const USER_TABLE_COLUMN_DEFINITIONS: UserTableColumnDefinition[] = [
  {
    key: 'username',
    label: '用户名',
    visibleFrom: 'mobile',
    fixed: 'left',
    reorderLocked: true,
    hideable: false,
    column: {
      width: 120
    }
  },
  {
    key: 'email',
    label: '邮箱',
    visibleFrom: 'mobile',
    fixed: null,
    reorderLocked: false,
    hideable: true,
    column: {
      minWidth: 180
    }
  },
  {
    key: 'full_name',
    label: '姓名',
    visibleFrom: 'tablet',
    fixed: null,
    reorderLocked: false,
    hideable: true,
    column: {
      width: 120
    }
  },
  {
    key: 'is_superuser',
    label: '超级用户',
    visibleFrom: 'desktop',
    fixed: null,
    reorderLocked: false,
    hideable: true,
    column: {
      width: 100,
      sortable: true,
      formatter: createBooleanTagFormatter('danger', 'info')
    }
  },
  {
    key: 'is_multi_login',
    label: '多端登录',
    visibleFrom: 'desktop',
    fixed: null,
    reorderLocked: false,
    hideable: true,
    column: {
      width: 100,
      formatter: createBooleanTagFormatter('success', 'info')
    }
  },
  {
    key: 'roles',
    label: '角色',
    visibleFrom: 'mobile',
    fixed: null,
    reorderLocked: false,
    hideable: true,
    column: {
      width: 150,
      slots: {
        default: formatArrayTags('name', '无角色')
      }
    }
  },
  {
    key: 'updated_at',
    label: '更新时间',
    visibleFrom: 'tablet',
    fixed: null,
    reorderLocked: false,
    hideable: true,
    column: {
      width: 160,
      sortable: true,
      formatter: formatDateTime
    }
  }
]

function toColumnConfig(definition: UserTableColumnDefinition): ColumnConfig {
  return {
    key: definition.key,
    label: definition.label,
    visibleFrom: definition.visibleFrom,
    width: typeof definition.column.width === 'number' ? definition.column.width : undefined,
    fixed: definition.fixed ?? null,
    reorderLocked: definition.reorderLocked ?? false,
    hideable: definition.hideable ?? true
  }
}

function toTableColumnConfig(
  definition: UserTableColumnDefinition,
  config?: ColumnConfig
): TableColumnConfig {
  const overrideWidth = config?.width

  return {
    field: definition.key,
    title: definition.label,
    fixed: definition.fixed ?? undefined,
    configurable: true,
    hideable: definition.hideable,
    reorderLocked: definition.reorderLocked,
    ...definition.column,
    width: typeof overrideWidth === 'number' ? overrideWidth : definition.column.width,
    minWidth: typeof overrideWidth === 'number' ? undefined : definition.column.minWidth
  }
}

const USER_TABLE_COLUMN_DEFINITION_MAP = new Map(
  USER_TABLE_COLUMN_DEFINITIONS.map(definition => [definition.key, definition])
)

export const DEFAULT_COLUMN_CONFIG: ColumnConfig[] = USER_TABLE_COLUMN_DEFINITIONS.map(toColumnConfig)

/**
 * 预创建的默认列配置 Map，避免在 normalizeColumnConfig 中重复创建
 */
const DEFAULT_COLUMN_CONFIG_MAP = new Map(DEFAULT_COLUMN_CONFIG.map(column => [column.key, column]))

function sortColumnsByFixedPosition(columns: ColumnConfig[]): ColumnConfig[] {
  const leftFixed = columns.filter(column => column.fixed === 'left')
  const middle = columns.filter(column => column.fixed === null || column.fixed === undefined)
  const rightFixed = columns.filter(column => column.fixed === 'right')
  return [...leftFixed, ...middle, ...rightFixed]
}

function isColumnVisibleAtBreakpoint(
  visibleFrom: ColumnVisibleFrom | null,
  breakpoint: ColumnBreakpoint
): boolean {
  if (!visibleFrom) {
    return false
  }

  return COLUMN_VISIBILITY_RANK[breakpoint] >= COLUMN_VISIBILITY_RANK[visibleFrom]
}

export function buildConfigurableUserTableColumns(
  config: ColumnConfig[],
  breakpoint: ColumnBreakpoint
): TableColumnConfig[] {
  return config
    .filter(column => isColumnVisibleAtBreakpoint(column.visibleFrom, breakpoint))
    .map(column => {
      const definition = USER_TABLE_COLUMN_DEFINITION_MAP.get(column.key)
      if (!definition) {
        return null
      }

      return toTableColumnConfig(definition, column)
    })
    .filter((column): column is TableColumnConfig => Boolean(column))
}

function normalizeColumnConfig(config: LegacyColumnConfig[] | null | undefined): ColumnConfig[] {
  const defaultsMap = DEFAULT_COLUMN_CONFIG_MAP
  const normalized: ColumnConfig[] = []

  for (const item of config ?? []) {
    const defaultConfig = defaultsMap.get(item.key)
    if (!defaultConfig) {
      continue
    }

    let visibleFrom = defaultConfig.visibleFrom
    if (item.visibleFrom === 'desktop' || item.visibleFrom === 'tablet' || item.visibleFrom === 'mobile') {
      visibleFrom = item.visibleFrom
    } else if (item.visible === false) {
      visibleFrom = null
    }

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

  for (const defaultConfig of DEFAULT_COLUMN_CONFIG) {
    if (!normalized.some(column => column.key === defaultConfig.key)) {
      normalized.push({ ...defaultConfig })
    }
  }

  return sortColumnsByFixedPosition(normalized)
}

/**
 * 用户表格列配置 composable
 *
 * 管理列的显示断点和排列顺序，持久化到 localStorage
 */
export function useUserTableColumns() {
  const columnConfig = useStorage<ColumnConfig[]>(
    'wes-user-table-columns',
    DEFAULT_COLUMN_CONFIG.map(column => ({ ...column }))
  )

  columnConfig.value = normalizeColumnConfig(columnConfig.value as LegacyColumnConfig[])

  const visibleColumnKeys = computed(() =>
    columnConfig.value.filter(column => column.visibleFrom !== null).map(column => column.key)
  )

  function updateConfig(newConfig: ColumnConfig[]) {
    columnConfig.value = normalizeColumnConfig(newConfig)
  }

  function updateColumnWidth(key: string, width: number) {
    if (!Number.isFinite(width) || width <= 0) {
      return
    }

    columnConfig.value = normalizeColumnConfig(
      columnConfig.value.map(column =>
        column.key === key
          ? { ...column, width }
          : column
      )
    )
  }

  function resetConfig() {
    columnConfig.value = DEFAULT_COLUMN_CONFIG.map(column => ({ ...column }))
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
