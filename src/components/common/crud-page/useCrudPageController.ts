import { computed, onMounted, provide, ref } from 'vue'
import { buildActionsColumn } from '@/components/common/table/formatters'
import type { ColumnBreakpoint } from '@/composables/useTableColumns'
import { useCrudListPage } from '@/composables/useCrudListPage'
import { useCrudToolbar } from '@/composables/useCrudToolbar'
import { useResponsiveLayout } from '@/composables/useResponsiveLayout'
import {
  buildCrudPermissionConfig,
  toActionButtonConfig
} from './helpers/actions'
import { resolveCrudPageFeatures } from './helpers/features'
import {
  resolveModeSwitcher,
  resolveBreakpoint,
  resolveFormTitle,
  resolveTableDefaultSort,
  resolveTrashAwareColumn
} from './controller/helpers/presentation'
import {
  CRUD_PAGE_SEARCH_ACTIONS_KEY,
  CRUD_PAGE_REFRESH_KEY,
  type CrudPageConfig,
  type CrudPageEntity,
  type CrudPageToolbarActionContext
} from './types'
import { useDetailState } from './detail/composables/useDetailState'
import { mergeQuickFilterConditions } from './searchContext'
import { useCrudPageToolbarActions } from './controller/useCrudPageToolbarActions'
import { useCrudPageTreeActions } from './controller/useCrudPageTreeActions'
import { useCrudPageRowActions } from './controller/useCrudPageRowActions'
import { useCrudPageActions } from './controller/useCrudPageActions'

export function useCrudPageController<
  TItem extends CrudPageEntity,
  TCreate extends object,
  TUpdate extends object
>(config: CrudPageConfig<TItem, TCreate, TUpdate>) {
  const features = resolveCrudPageFeatures(config.features)

  const state = useCrudListPage<TItem, TCreate, TUpdate>({
    adapter: config.resource.requestAdapter,
    searchFields: config.search.fields,
    quickPresets: config.search.quickPresets ?? [],
    favorites: config.search.favorites ?? [],
    permissions: buildCrudPermissionConfig(config.resource.permissions),
    pageSize: config.resource.pageSize,
    optimisticUpdate: config.resource.optimisticUpdate,
    autoRefresh: config.resource.autoRefresh,
    defaultSort: config.resource.defaultSort ?? [],
    treeMode: config.resource.treeMode
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

  const tableDefaultSort = computed(() => {
    if (state.state.isTrashMode.value) {
      return undefined
    }

    return resolveTableDefaultSort(config.resource.defaultSort)
  })

  const modeSwitcher = computed(() =>
    resolveModeSwitcher(state.state.supportsTrash.value, config, features, state.state.viewMode.value)
  )

  const toolbarActionContext: CrudPageToolbarActionContext = {
    applyQuickPreset: (presetId, options) => {
      if (options?.replace) {
        state.search.instance.clearKeyword()
        state.search.instance.clearAppliedFilters()
      }

      state.search.instance.applyQuickPreset(presetId, { deduplicate: options?.deduplicate })
    },
    clearFilters: () => {
      state.search.instance.clearKeyword()
      state.search.instance.clearAppliedFilters()
    },
    refresh: state.search.handleRefresh
  }

  const showSearch = computed(() => !state.state.isTrashMode.value)

  const emptyText = computed(() =>
    state.state.isTrashMode.value
      ? '回收站暂无数据'
      : config.table.emptyText ?? '暂无数据'
  )

  const treeActionState = useCrudPageTreeActions({
    config,
    state: {
      tree: state.tree,
      dialogs: state.dialogs
    }
  })

  // ==================== Detail Panel Integration ====================
  // Must be defined before rowActions to inject view-detail action

  const detailState = useDetailState<TItem>()
  const detailFetcher = config.resource.requestAdapter.getById.bind(config.resource.requestAdapter)

  function handleViewDetail(item: TItem): void {
    void detailState.openDetailById(item.id, detailFetcher)
  }

  const rowActions = useCrudPageRowActions({
    config,
    features,
    state,
    handlers: {
      onDelete: handleDelete,
      onRestore: handleRestore,
      onPermanentDelete: handlePermanentDelete,
      onMove: treeActionState.handleMove,
      onCreateChild: treeActionState.handleCreateChild,
      onViewDetail: handleViewDetail
    }
  })

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
    return resolveFormTitle(config, features, state.dialogs.editingId.value, treeActionState.createChildInfo.value)
  })

  function clearTableSelection(): void {
    tableRef.value?.clearSelection()
  }

  async function handleSearch(): Promise<void> {
    return state.search.handleSearch(state.state.pagination.page)
  }

  function handlePageChange(page: number): Promise<void> {
    return state.search.handleSearch(page)
  }

  function handleSizeChange(size: number): Promise<void> {
    return state.search.handlePageSizeChange(size)
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

  const pageActions = useCrudPageActions({
    config,
    state,
    clearTableSelection
  })

  const toolbarActions = useCrudPageToolbarActions({
    config,
    features,
    state,
    toolbarActionContext,
    handlers: {
      handleBatchDelete: pageActions.handleBatchDelete,
      handleBatchRestore: pageActions.handleBatchRestore,
      handleBatchPermanentDelete: pageActions.handleBatchPermanentDelete,
      handleCreate: treeActionState.handleCreate,
      handleSort: treeActionState.handleSort
    }
  })

  if (config.search.defaultFilterGroup) {
    // 初始化默认筛选时跳过 notify，避免首屏重复请求。
    state.search.instance.state.value.advancedFilterGroup = config.search.defaultFilterGroup
  }

  onMounted(() => {
    void state.search.handleSearch(1)
  })

  // 提供刷新函数供子组件（如对话框）使用
  provide(CRUD_PAGE_REFRESH_KEY, () => state.search.handleSearch(state.state.pagination.page))
  provide(CRUD_PAGE_SEARCH_ACTIONS_KEY, {
    applyQuickFilter: draft => {
      const nextConditions = mergeQuickFilterConditions(
        state.search.instance.state.value.conditions,
        draft
      )
      state.search.instance.replaceConditions(nextConditions)
    }
  })

  // 提取 tree 属性（当启用 treeMode 时存在）
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tree = (state as any).tree

  const readonlyDisplayFields = treeActionState.readonlyDisplayFields

  const treeSelectConfig = treeActionState.treeSelectConfig

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
    handleBatchDelete: pageActions.handleBatchDelete,
    handleCancelSelection: pageActions.handleCancelSelection,
    handleSelectionChange: pageActions.handleSelectionChange,
    handleViewModeChange: pageActions.handleViewModeChange,
    handleSubmit: pageActions.handleSubmit,
    formTitle,
    loadFormData: pageActions.loadFormData,
    tree,
    createChildInfo: treeActionState.createChildInfo,
    readonlyDisplayFields,
    treeSelectConfig,
    handleFormDialogClose: treeActionState.handleFormDialogClose,

    // 移动操作
    moveDialog: treeActionState.moveDialog,
    handleMove: treeActionState.handleMove,
    handleMoveConfirm: treeActionState.handleMoveConfirm,
    handleMoveCancel: treeActionState.handleMoveCancel,

    // 排序操作
    sortDialog: treeActionState.sortDialog,
    handleSort: treeActionState.handleSort,
    handleSortConfirm: treeActionState.handleSortConfirm,
    handleSortCancel: treeActionState.handleSortCancel,

    // Detail panel
    detailState
  }
}
