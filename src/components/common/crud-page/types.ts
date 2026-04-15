import type { Ref, InjectionKey } from 'vue'
import type { ZodType } from 'zod'
import type { CrudRequestAdapter, FilterGroup, SortField } from '@/api/base/crud-request-adapter'
import type {
  ColumnBreakpoint,
  ColumnConfig,
  FormFieldConfig
} from '@/composables/useTableColumns'
import type { TableColumnConfig } from '@/types/table'
import type { SearchConditionDraft, SearchFavorite, SearchFieldDef, QuickSearchPreset } from '@/types/search'
import type { CrudPageDetailConfig } from './detail/types'

export interface CrudPageEntity {
  id: number
}

export type CrudPageViewMode = 'active' | 'trash'

/**
 * 树形模式配置选项
 */
export interface TreeModeOptions {
  /** 是否启用树形模式 */
  enabled?: boolean
  /** 子节点字段名，默认 'children' */
  childrenKey?: string
  /** 是否有子节点字段名，默认 'has_children' */
  hasChildrenKey?: string
  /** 是否懒加载子节点 */
  lazyLoad?: boolean
  /** 初始展开层级 */
  initialExpandLevel?: number
  /** 显示字段名，用于"添加下级"时显示父级名称，如 'title', 'name' */
  displayField?: string
}

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
  move?: CrudPageActionFeature
  sort?: CrudPageActionFeature
  /** 添加下级行操作（树形模式专用） */
  createChild?: CrudPageActionFeature
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
  move: ResolvedCrudPageStandardActionConfig
  sort: ResolvedCrudPageStandardActionConfig
  /** 添加下级行操作（树形模式专用） */
  createChild: ResolvedCrudPageStandardActionConfig
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
  /**
   * 操作优先级
   * - 'primary': 主要操作，直接显示（默认）
   * - 'secondary': 次要操作，收起到下拉菜单
   */
  priority?: 'primary' | 'secondary'
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
  handler: (context: CrudPageToolbarActionContext) => void | Promise<void>
  permission?: string
  showWhen?: () => boolean
  loading?: boolean
  tooltip?: string
}

export interface CrudPageResolvedToolbarAction extends Omit<CrudPageToolbarAction, 'handler'> {
  handler: () => void | Promise<void>
}

export interface CrudPageToolbarActionContext {
  applyQuickPreset: (presetId: string, options?: { replace?: boolean; deduplicate?: boolean }) => void
  clearFilters: () => void
  refresh: () => Promise<void>
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
    requestAdapter: CrudRequestAdapter<TItem, TCreate, TUpdate>
    permissions?: CrudPagePermissionConfig
    pageSize?: number
    optimisticUpdate?: boolean
    autoRefresh?: boolean
    defaultSort?: SortField[]
    /** 树形模式配置 */
    treeMode?: TreeModeOptions
  }
  search: {
    fields: SearchFieldDef[]
    quickPresets?: QuickSearchPreset[]
    favorites?: SearchFavorite[]
    placeholder?: string
    defaultFilterGroup?: FilterGroup
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
  /** Detail panel configuration */
  detail?: CrudPageDetailConfig<TItem>
  features?: CrudPageFeatures
  extensions?: {
    toolbarActions?: CrudPageToolbarAction[]
    rowActions?: CrudPageRowAction<TItem>[]
  }
}

/**
 * 用于在 CRUD 页面组件间共享刷新函数的 InjectionKey
 * 子组件可通过 inject(CRUD_PAGE_REFRESH_KEY) 获取刷新列表的能力
 */
export const CRUD_PAGE_REFRESH_KEY: InjectionKey<() => Promise<void>> = Symbol('crud-page-refresh')

export interface CrudPageSearchActions {
  applyQuickFilter: (draft: SearchConditionDraft) => void
}

export const CRUD_PAGE_SEARCH_ACTIONS_KEY: InjectionKey<CrudPageSearchActions> = Symbol(
  'crud-page-search-actions'
)
