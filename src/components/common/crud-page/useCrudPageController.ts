import { computed, onMounted, ref } from 'vue'
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
import type { CrudPageConfig, CrudPageEntity } from './types'
import type { TableSortOrder } from '@/components/ui/table/table.types'
import type { SortField } from '@/api/base/crud-api'

type CrudTableDefaultSort = {
  field: string
  order: Exclude<TableSortOrder, null>
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
        batchDeleteLoading: state.state.batchDeleteLoading
      }
    })

  const columnsManager = config.table.columns.createManager()
  const tableRef = ref<{ clearSelection: () => void } | null>(null)
  const { isMobile, isTablet } = useResponsiveLayout()

  const currentBreakpoint = computed<ColumnBreakpoint>(() =>
    resolveBreakpoint(isMobile.value, isTablet.value)
  )

  const title = computed(() => ({
    ...config.resource.title,
    showSelectedCount: features.batchDelete.enabled
  }))

  const tableDefaultSort = computed<CrudTableDefaultSort | undefined>(() =>
    resolveTableDefaultSort(config.resource.defaultSort)
  )

  const toolbarActions = computed(() =>
    buildDefaultToolbarActions({
      config,
      features,
      state,
      onBatchDelete: () => void handleBatchDelete()
    })
  )

  const rowActions = computed(() =>
    buildDefaultRowActions({
      config,
      features,
      state,
      onDelete: row => void handleDelete(row)
    })
  )

  const tableColumns = computed(() => {
    const baseColumns = columnsManager.buildTableColumns(currentBreakpoint.value)

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
    if (!config.form) {
      return ''
    }

    if (state.dialogs.editingId.value) {
      return features.edit.dialogTitle ?? config.form.title?.edit ?? `编辑${config.resource.title.text}`
    }

    return features.create.dialogTitle ?? config.form.title?.create ?? `创建${config.resource.title.text}`
  })

  function handleSearch() {
    return state.search.handleSearch(state.state.pagination.page)
  }

  function handlePageChange(page: number) {
    return state.search.handleSearch(page)
  }

  function handleSizeChange() {
    console.warn('Dynamic pageSize change not yet implemented')
  }

  function handleColumnResize(resize: { field: string; width: number }) {
    columnsManager.updateColumnWidth(resize.field, resize.width)
  }

  async function handleDelete(row: TItem) {
    await state.apiActions.handleDelete(row.id)
  }

  async function loadFormData(id: number | string): Promise<Record<string, unknown>> {
    const numericId = typeof id === 'number' ? id : Number(id)

    if (!Number.isFinite(numericId)) {
      throw new Error(`Invalid entity id: ${String(id)}`)
    }

    return await config.resource.api.getById(numericId) as unknown as Record<string, unknown>
  }

  async function handleBatchDelete() {
    await state.selection.handleBatchDelete()
    tableRef.value?.clearSelection()
  }

  function handleCancelSelection() {
    state.selection.clearSelectionState()
    tableRef.value?.clearSelection()
  }

  function handleSelectionChange(selected: unknown[]) {
    state.selection.handleSelectionChange(selected as TItem[])
  }

  function resolveSubmitPayload<TPayload extends object>(
    formData: Record<string, unknown>,
    transform?: (formData: Record<string, unknown>) => TPayload
  ): TPayload {
    return transform ? transform(formData) : (formData as unknown as TPayload)
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

  return {
    config,
    features,
    state,
    tableRef,
    title,
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
    handleSubmit,
    formTitle,
    loadFormData
  }
}
