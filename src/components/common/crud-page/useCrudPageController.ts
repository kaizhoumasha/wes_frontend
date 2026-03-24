import { computed, onMounted, provide, ref } from 'vue'
import { ElMessageBox } from 'element-plus'
import { buildActionsColumn } from '@/components/common/table/formatters'
import type { ColumnBreakpoint } from '@/composables/useTableColumns'
import { useCrudListPage } from '@/composables/useCrudListPage'
import { useCrudToolbar } from '@/composables/useCrudToolbar'
import { useResponsiveLayout } from '@/composables/useResponsiveLayout'
import {
  buildCrudPermissionConfig,
  buildDefaultRowActions,
  buildDefaultToolbarActions,
  toActionButtonConfig
} from './helpers/actions'
import { resolveCrudPageFeatures } from './helpers/features'
import { CRUD_PAGE_REFRESH_KEY, type CrudPageConfig, type CrudPageEntity, type CrudPageViewMode } from './types'
import type { TableSortOrder } from '@/components/ui/table/table.types'
import type { SortField } from '@/api/base/crud-api'

type CrudTableDefaultSort = {
  field: string
  order: Exclude<TableSortOrder, null>
}

function resolveTrashAwareColumn<
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

function resolveBreakpoint(isMobile: boolean, isTablet: boolean): ColumnBreakpoint {
  if (isMobile) {
    return 'mobile'
  }

  if (isTablet) {
    return 'tablet'
  }

  return 'desktop'
}

function resolveTableDefaultSort(defaultSort: SortField[] | undefined): CrudTableDefaultSort | undefined {
  const firstSort = defaultSort?.[0]

  if (!firstSort) {
    return undefined
  }

  return {
    field: firstSort.field,
    order: firstSort.order === 'desc' ? 'descending' : 'ascending'
  }
}

function createModeSwitcher<
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

function resolveFormTitle<TItem extends CrudPageEntity, TCreate extends object, TUpdate extends object>(
  config: CrudPageConfig<TItem, TCreate, TUpdate>,
  features: ReturnType<typeof resolveCrudPageFeatures>,
  editingId: number | null
): string {
  if (!config.form) {
    return ''
  }

  if (editingId) {
    return features.edit.dialogTitle ?? config.form.title?.edit ?? `编辑${config.resource.title.text}`
  }

  return features.create.dialogTitle ?? config.form.title?.create ?? `创建${config.resource.title.text}`
}

export function useCrudPageController<
  TItem extends CrudPageEntity,
  TCreate extends object,
  TUpdate extends object
>(config: CrudPageConfig<TItem, TCreate, TUpdate>) {
  const features = resolveCrudPageFeatures(config.features)

  const state = useCrudListPage<TItem, TCreate, TUpdate>({
    api: config.resource.api,
    searchFields: config.search.fields,
    quickPresets: config.search.quickPresets ?? [],
    favorites: config.search.favorites ?? [],
    permissions: buildCrudPermissionConfig(config.resource.permissions),
    pageSize: config.resource.pageSize,
    optimisticUpdate: config.resource.optimisticUpdate,
    autoRefresh: config.resource.autoRefresh,
    defaultSort: config.resource.defaultSort ?? []
  })

  const { toggleFullscreen, setDensity, columnConfigDialogOpen, openColumnConfig, toolbarState } =
    useCrudToolbar({
      externalState: {
        loading: state.state.loading,
        selectedCount: state.state.selectedCount,
        batchDeleteLoading: state.state.batchDeleteLoading,
        batchRestoreLoading: state.state.batchRestoreLoading,
        batchPermanentDeleteLoading: state.state.batchPermanentDeleteLoading
      }
    })

  const columnsManager = config.table.columns.createManager()
  const tableRef = ref<{ clearSelection: () => void } | null>(null)
  const { isMobile, isTablet } = useResponsiveLayout()

  const currentBreakpoint = computed<ColumnBreakpoint>(() =>
    resolveBreakpoint(isMobile.value, isTablet.value)
  )

  const title = computed(() => {
    const isTrashMode = state.state.isTrashMode.value
    const baseTitle = isTrashMode
      ? (
          config.resource.trashTitle ?? {
            text: `${config.resource.title.text}回收站`,
            subtitle: `查看已删除的${config.resource.title.text}`
          }
        )
      : config.resource.title

    return {
      ...baseTitle,
      showSelectedCount: isTrashMode
        ? features.batchRestore.enabled || features.batchPermanentDelete.enabled
        : features.batchDelete.enabled
    }
  })

  const tableDefaultSort = computed<CrudTableDefaultSort | undefined>(() => {
    if (state.state.isTrashMode.value) {
      return undefined
    }

    return resolveTableDefaultSort(config.resource.defaultSort)
  })

  const modeSwitcher = computed(() =>
    state.state.supportsTrash.value
      ? createModeSwitcher(config, features, state.state.viewMode.value)
      : undefined
  )

  const showSearch = computed(() => !state.state.isTrashMode.value)

  const emptyText = computed(() =>
    state.state.isTrashMode.value
      ? '回收站暂无数据'
      : config.table.emptyText ?? '暂无数据'
  )

  const toolbarActions = computed(() =>
    buildDefaultToolbarActions({
      config,
      features,
      state,
      onBatchDelete: () => void handleBatchDelete(),
      onBatchRestore: () => void handleBatchRestore(),
      onBatchPermanentDelete: () => void handleBatchPermanentDelete()
    })
  )

  const rowActions = computed(() =>
    buildDefaultRowActions({
      config,
      features,
      state,
      onDelete: row => void handleDelete(row),
      onRestore: row => void handleRestore(row),
      onPermanentDelete: row => void handlePermanentDelete(row)
    })
  )

  const tableColumns = computed(() => {
    const baseColumns = columnsManager
      .buildTableColumns(currentBreakpoint.value)
      .map(column => resolveTrashAwareColumn(column, state.state.isTrashMode.value))

    if (rowActions.value.length === 0) {
      return baseColumns
    }

    const actionsColumn = buildActionsColumn(
      rowActions.value.map(toActionButtonConfig),
      config.table.actionsColumn
    )

    return [...baseColumns, actionsColumn]
  })

  const formTitle = computed(() => {
    return resolveFormTitle(config, features, state.dialogs.editingId.value)
  })

  function clearTableSelection(): void {
    tableRef.value?.clearSelection()
  }

  function resolveEntityId(id: number | string): number {
    const numericId = typeof id === 'number' ? id : Number(id)

    if (!Number.isFinite(numericId)) {
      throw new Error(`Invalid entity id: ${String(id)}`)
    }

    return numericId
  }

  function handleSearch(): Promise<void> {
    return state.search.handleSearch(state.state.pagination.page)
  }

  function handlePageChange(page: number): Promise<void> {
    return state.search.handleSearch(page)
  }

  function handleSizeChange(): void {
    console.warn('Dynamic pageSize change not yet implemented')
  }

  function handleColumnResize(resize: { field: string; width: number }): void {
    columnsManager.updateColumnWidth(resize.field, resize.width)
  }

  async function handleDelete(row: TItem): Promise<void> {
    await state.apiActions.handleDelete(row.id)
  }

  async function handleRestore(row: TItem): Promise<void> {
    await state.apiActions.handleRestore(row.id)
  }

  async function handlePermanentDelete(row: TItem): Promise<void> {
    await state.apiActions.handlePermanentDelete(row.id)
  }

  async function loadFormData(id: number | string): Promise<Record<string, unknown>> {
    const numericId = resolveEntityId(id)
    return await config.resource.api.getById(numericId) as unknown as Record<string, unknown>
  }

  async function handleBatchDelete(): Promise<void> {
    await state.selection.handleBatchDelete()
    clearTableSelection()
  }

  async function handleBatchRestore(): Promise<void> {
    await state.selection.handleBatchRestore()
    clearTableSelection()
  }

  async function handleBatchPermanentDelete(): Promise<void> {
    try {
      await ElMessageBox.confirm(
        '确认彻底删除选中的记录吗？此操作不可恢复。',
        '批量彻底删除',
        {
          confirmButtonText: '确认彻底删除',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )

      await state.selection.handleBatchPermanentDelete()
      clearTableSelection()
    } catch (error) {
      if (error === 'cancel' || error === 'close') {
        return
      }

      throw error
    }
  }

  function handleCancelSelection(): void {
    state.selection.clearSelectionState()
    clearTableSelection()
  }

  function handleSelectionChange(selected: unknown[]): void {
    state.selection.handleSelectionChange(selected as TItem[])
  }

  function resolveSubmitPayload<TPayload extends object>(
    formData: Record<string, unknown>,
    transform?: (formData: Record<string, unknown>) => TPayload
  ): TPayload {
    return transform ? transform(formData) : (formData as unknown as TPayload)
  }

  async function handleViewModeChange(mode: string): Promise<void> {
    const nextMode = mode as CrudPageViewMode

    if (state.state.viewMode.value === nextMode) {
      return
    }

    state.dialogs.close()
    handleCancelSelection()
    state.view.setViewMode(nextMode)
    await state.search.handleSearch(1)
  }

  async function handleSubmit(formData: Record<string, unknown>) {
    if (!config.form) {
      return
    }

    if (state.dialogs.editingId.value) {
      await state.apiActions.handleEdit(
        state.dialogs.editingId.value,
        resolveSubmitPayload(formData, config.form.submit?.update)
      )
      return
    }

    await state.apiActions.handleCreate(resolveSubmitPayload(formData, config.form.submit?.create))
  }

  onMounted(() => {
    void state.search.handleSearch(1)
  })

  // 提供刷新函数供子组件（如对话框）使用
  provide(CRUD_PAGE_REFRESH_KEY, () => state.search.handleSearch(state.state.pagination.page))

  return {
    config,
    features,
    state,
    tableRef,
    title,
    modeSwitcher,
    showSearch,
    emptyText,
    toolbarActions,
    toolbarState,
    tableColumns,
    tableDefaultSort,
    columnConfigDialogOpen,
    columnsManager,
    openColumnConfig,
    toggleFullscreen,
    setDensity,
    handleSearch,
    handlePageChange,
    handleSizeChange,
    handleColumnResize,
    handleBatchDelete,
    handleCancelSelection,
    handleSelectionChange,
    handleViewModeChange,
    handleSubmit,
    formTitle,
    loadFormData
  }
}
