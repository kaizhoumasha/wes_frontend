import type { ColumnBreakpoint } from '@/composables/useTableColumns'
import type { TableSortOrder } from '@/components/ui/table/table.types'
import type { SortField } from '@/api/base/crud-request-adapter'
import type {
  CrudPageConfig,
  CrudPageEntity,
  CrudPageRowAction,
  CrudPageViewMode
} from '@/components/common/crud-page/types'
import { resolveCrudPageFeatures } from '@/components/common/crud-page/helpers/features'

type CrudTableDefaultSort = {
  field: string
  order: Exclude<TableSortOrder, null>
}

export function resolveTrashAwareColumn<
  TColumn extends { field?: string; title?: string; sortable?: boolean | 'custom' }
>(
  column: TColumn,
  isTrashMode: boolean
): TColumn {
  if (!isTrashMode) {
    return column
  }

  if (column.field !== 'updated_at') {
    return {
      ...column,
      sortable: false
    }
  }

  return {
    ...column,
    field: 'deleted_at',
    title: '删除时间',
    sortable: false
  }
}

export function resolveBreakpoint(isMobile: boolean, isTablet: boolean): ColumnBreakpoint {
  if (isMobile) {
    return 'mobile'
  }

  if (isTablet) {
    return 'tablet'
  }

  return 'desktop'
}

export function resolveTableDefaultSort(defaultSort: SortField[] | undefined): CrudTableDefaultSort | undefined {
  const firstSort = defaultSort?.[0]

  if (!firstSort) {
    return undefined
  }

  return {
    field: firstSort.field,
    order: firstSort.order === 'desc' ? 'descending' : 'ascending'
  }
}

export function createModeSwitcher<
  TItem extends CrudPageEntity,
  TCreate extends object,
  TUpdate extends object
>(
  config: CrudPageConfig<TItem, TCreate, TUpdate>,
  features: ReturnType<typeof resolveCrudPageFeatures>,
  viewMode: CrudPageViewMode
) {
  if (!features.trash.enabled) {
    return undefined
  }

  return {
    value: viewMode,
    options: [
      {
        key: 'active',
        label: '列表',
        icon: 'ep:list'
      },
      {
        key: 'trash',
        label: features.trash.label ?? '回收站',
        icon: features.trash.icon ?? 'ep:delete'
      }
    ].map(option => ({
      ...option,
      permission: option.key === 'trash'
        ? features.trash.permission ?? config.resource.permissions?.trash
        : undefined
    }))
  }
}


export function resolveModeSwitcher<
  TItem extends CrudPageEntity,
  TCreate extends object,
  TUpdate extends object
>(
  supportsTrash: boolean,
  config: CrudPageConfig<TItem, TCreate, TUpdate>,
  features: ReturnType<typeof resolveCrudPageFeatures>,
  viewMode: CrudPageViewMode
) {
  if (!supportsTrash) {
    return undefined
  }

  return createModeSwitcher(config, features, viewMode)
}

export function resolveFormTitle<
  TItem extends CrudPageEntity,
  TCreate extends object,
  TUpdate extends object
>(
  config: CrudPageConfig<TItem, TCreate, TUpdate>,
  features: ReturnType<typeof resolveCrudPageFeatures>,
  editingId: number | null,
  createChildInfo?: { parentName: string } | null
): string {
  if (!config.form) {
    return ''
  }

  if (editingId) {
    return features.edit.dialogTitle ?? config.form.title?.edit ?? `编辑${config.resource.title.text}`
  }

  if (createChildInfo) {
    const resourceText = config.resource.title.text
    return `在 '${createChildInfo.parentName}' 下添加${resourceText}`
  }

  return features.create.dialogTitle ?? config.form.title?.create ?? `创建${config.resource.title.text}`
}

export function createViewDetailRowAction<TItem extends CrudPageEntity>(
  resourceKey: string,
  onClick: (item: TItem) => void
): CrudPageRowAction<TItem> {
  return {
    key: `${resourceKey}-view-detail`,
    label: '详情',
    type: 'info',
    tooltip: '查看详情',
    icon: 'ep:view',
    priority: 'primary',
    onClick
  }
}
