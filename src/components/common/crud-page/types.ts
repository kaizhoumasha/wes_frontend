import type { Ref } from 'vue'
import type { ZodType } from 'zod'
import type { CrudApi, SortField } from '@/api/base/crud-api'
import type {
  ColumnBreakpoint,
  ColumnConfig,
  FormFieldConfig
} from '@/composables/useTableColumns'
import type { TableColumnConfig } from '@/types/table'
import type { SearchFavorite, SearchFieldDef, QuickSearchPreset } from '@/types/search'

export interface CrudPageEntity {
  id: number
}

export type CrudPageViewMode = 'active' | 'trash'

export interface CrudPageFeatures {
  refresh?: boolean
  density?: boolean
  fullscreen?: boolean
  columnConfig?: boolean
  create?: CrudPageActionFeature
  edit?: CrudPageActionFeature
  delete?: CrudPageActionFeature
  batchDelete?: CrudPageActionFeature
  trash?: CrudPageActionFeature
  restore?: CrudPageActionFeature
  batchRestore?: CrudPageActionFeature
  permanentDelete?: CrudPageActionFeature
  batchPermanentDelete?: CrudPageActionFeature
}

export interface CrudPageStandardActionConfig {
  enabled?: boolean
  label?: string
  tooltip?: string
  icon?: string
  permission?: string
  dialogTitle?: string
}

export type CrudPageActionFeature = boolean | CrudPageStandardActionConfig

export interface ResolvedCrudPageStandardActionConfig {
  enabled: boolean
  label?: string
  tooltip?: string
  icon?: string
  permission?: string
  dialogTitle?: string
}

export interface ResolvedCrudPageFeatures {
  refresh: boolean
  density: boolean
  fullscreen: boolean
  columnConfig: boolean
  create: ResolvedCrudPageStandardActionConfig
  edit: ResolvedCrudPageStandardActionConfig
  delete: ResolvedCrudPageStandardActionConfig
  batchDelete: ResolvedCrudPageStandardActionConfig
  trash: ResolvedCrudPageStandardActionConfig
  restore: ResolvedCrudPageStandardActionConfig
  batchRestore: ResolvedCrudPageStandardActionConfig
  permanentDelete: ResolvedCrudPageStandardActionConfig
  batchPermanentDelete: ResolvedCrudPageStandardActionConfig
}

export interface CrudPageTitleConfig {
  text: string
  subtitle?: string
  icon?: string
}

export interface CrudPagePermissionConfig {
  create?: string
  update?: string
  delete?: string
  restore?: string
  trash?: string
}

export interface CrudPageColumnManager {
  columnConfig: Ref<ColumnConfig[]>
  updateConfig: (newConfig: ColumnConfig[]) => void
  updateColumnWidth: (key: string, width: number) => void
  buildTableColumns: (breakpoint: ColumnBreakpoint) => TableColumnConfig[]
}

export type CrudPageRowActionValue<TItem extends CrudPageEntity, TValue> =
  | TValue
  | ((row: TItem) => TValue)

export interface CrudPageRowAction<TItem extends CrudPageEntity> {
  key: string
  label: CrudPageRowActionValue<TItem, string>
  type?: CrudPageRowActionValue<TItem, 'primary' | 'success' | 'warning' | 'danger' | 'info'>
  icon?: string
  tooltip?: CrudPageRowActionValue<TItem, string>
  link?: boolean
  size?: 'small' | 'default' | 'large'
  permission?: string
  show?: CrudPageRowActionValue<TItem, boolean>
  disabled?: CrudPageRowActionValue<TItem, boolean>
  loading?: CrudPageRowActionValue<TItem, boolean>
  onClick: (row: TItem) => void | Promise<void>
  popconfirm?: {
    title: CrudPageRowActionValue<TItem, string>
    confirmButtonText?: string
    cancelButtonText?: string
    confirmButtonType?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
    width?: number
  }
}

export interface CrudPageToolbarAction {
  key: string
  label: string
  icon?: string
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  handler: () => void | Promise<void>
  permission?: string
  showWhen?: () => boolean
  loading?: boolean
  tooltip?: string
}

export interface CrudPageFormSubmitConfig<
  TCreate extends object,
  TUpdate extends object
> {
  create?: (formData: Record<string, unknown>) => TCreate
  update?: (formData: Record<string, unknown>) => TUpdate
}

export interface CrudPageFormConfig<
  TCreate extends object,
  TUpdate extends object
> {
  createSchema: ZodType
  updateSchema?: ZodType
  fieldConfig: FormFieldConfig[]
  title?: {
    create?: string
    edit?: string
  }
  width?: string
  submit?: CrudPageFormSubmitConfig<TCreate, TUpdate>
}

export interface CrudPageConfig<
  TItem extends CrudPageEntity,
  TCreate extends object,
  TUpdate extends object
> {
  resource: {
    key: string
    title: CrudPageTitleConfig
    trashTitle?: CrudPageTitleConfig
    api: CrudApi<TItem, TCreate, TUpdate>
    permissions?: CrudPagePermissionConfig
    pageSize?: number
    optimisticUpdate?: boolean
    autoRefresh?: boolean
    defaultSort?: SortField[]
  }
  search: {
    fields: SearchFieldDef[]
    quickPresets?: QuickSearchPreset[]
    favorites?: SearchFavorite[]
    placeholder?: string
  }
  table: {
    selectable?: boolean
    columnResizable?: boolean
    emptyText?: string
    columns: {
      defaultColumns: ColumnConfig[]
      createManager: () => CrudPageColumnManager
    }
    actionsColumn?: {
      field?: string
      title?: string
      width?: number
      minWidth?: number
      fixed?: 'left' | 'right'
      reorderLocked?: boolean
      hideable?: boolean
    }
  }
  form?: CrudPageFormConfig<TCreate, TUpdate>
  features?: CrudPageFeatures
  extensions?: {
    toolbarActions?: CrudPageToolbarAction[]
    rowActions?: CrudPageRowAction<TItem>[]
  }
}
