import { computed, onMounted, provide, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
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
import {
  CRUD_PAGE_REFRESH_KEY,
  type CrudPageConfig,
  type CrudPageEntity,
  type CrudPageRowAction,
  type CrudPageViewMode
} from './types'
import { useDetailState } from './detail/composables/useDetailState'
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

function createViewDetailRowAction<TItem extends CrudPageEntity>(
  resourceKey: string,
  onClick: (item: TItem) => void
): CrudPageRowAction<TItem> {
  return {
    key: `${resourceKey}-view-detail`,
    label: '',
    type: 'primary',
    tooltip: '查看详情',
    icon: 'ep:view',
    priority: 'primary',
    onClick
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

  const toolbarActions = computed(() => {
    const actions = buildDefaultToolbarActions({
      config,
      features,
      state,
      onBatchDelete: () => void handleBatchDelete(),
      onBatchRestore: () => void handleBatchRestore(),
      onBatchPermanentDelete: () => void handleBatchPermanentDelete()
    })

    // 添加排序按钮（仅在树形模式下）
    if (
      features.sort.enabled &&
      state.tree &&
      state.tree.isTreeMode.value &&
      typeof state.tree.fetchTree === 'function'
    ) {
      const sortLabel = features.sort.label ?? '排序'
      const sortTooltip = features.sort.tooltip ?? '拖拽调整菜单顺序和层级'
      const sortIcon = features.sort.icon ?? 'lucide:arrow-down-up'
      const sortPermission = features.sort.permission ?? config.resource.permissions?.update

      actions.push({
        key: `${config.resource.key}-sort`,
        label: sortLabel,
        icon: sortIcon,
        type: 'primary' as const,
        handler: handleSort,
        permission: sortPermission,
        tooltip: sortTooltip
      })
    }

    return actions
  })

  // ==================== Detail Panel Integration ====================
  // Must be defined before rowActions to inject view-detail action

  const detailState = useDetailState<TItem>()
  const detailFetcher = config.resource.api.getById.bind(config.resource.api)

  function handleViewDetail(item: TItem): void {
    void detailState.openDetailById(item.id, detailFetcher)
  }

  const rowActions = computed(() => {
    const defaultRowActions = buildDefaultRowActions({
      config,
      features,
      state,
      onDelete: row => void handleDelete(row),
      onRestore: row => void handleRestore(row),
      onPermanentDelete: row => void handlePermanentDelete(row)
    })

    // 添加移动操作（仅在树形模式下可用）
    const actions: CrudPageRowAction<TItem>[] = [...defaultRowActions]
    if (
      features.move.enabled &&
      state.tree &&
      state.tree.isTreeMode.value &&
      typeof state.tree.move === 'function'
    ) {
      const moveLabel = features.move.label ?? '移动'
      const moveTooltip = features.move.tooltip ?? moveLabel
      const moveIcon = features.move.icon ?? 'lucide:arrow-up-down'
      const movePermission = features.move.permission ?? config.resource.permissions?.update

      actions.push({
        key: `${config.resource.key}-move`,
        label: moveLabel,
        type: 'info',
        tooltip: moveTooltip,
        icon: moveIcon,
        priority: 'secondary',
        permission: movePermission,
        show: () => true,
        onClick: row => handleMove(row)
      })
    }

    if (state.state.viewMode.value !== 'active' || !config.detail) {
      return actions
    }

    return [createViewDetailRowAction(config.resource.key, handleViewDetail), ...actions]
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

  /** 移动对话框状态 */
  const moveDialog = reactive({
    open: false,
    movingId: null as number | null,
    loading: false
  })

  function handleMove(row: TItem): void {
    moveDialog.open = true
    moveDialog.movingId = row.id
  }

  async function handleMoveConfirm(
    targetId: number,
    position: 'before' | 'after' | 'inner'
  ): Promise<void> {
    if (!moveDialog.movingId || !state.tree?.move) return

    moveDialog.loading = true
    try {
      const success = await state.tree.move(moveDialog.movingId, targetId, position)
      if (success) {
        ElMessage.success('移动成功')
        moveDialog.open = false
        moveDialog.movingId = null
      } else {
        ElMessage.error('移动失败')
      }
    } catch {
      ElMessage.error('移动失败')
    } finally {
      moveDialog.loading = false
    }
  }

  function handleMoveCancel(): void {
    moveDialog.open = false
    moveDialog.movingId = null
  }

  /** 排序对话框状态 */
  const sortDialog = reactive({
    open: false,
    loading: false
  })

  async function handleSort(): Promise<void> {
    // 排序时加载完整树（forceFullTree=true），以便显示所有节点供拖拽排序
    if (state.tree?.fetchTree) {
      await (state.tree.fetchTree as (forceFullTree: boolean) => Promise<void>)(true)
    }
    sortDialog.open = true
  }

  async function handleSortConfirm(items: { id: number; parent_id: number | null; sort_order: number }[]): Promise<void> {
    if (!state.tree?.batchSort || items.length === 0) {
      sortDialog.open = false
      // 恢复懒加载模式
      ;(state.tree?.fetchTree as ((forceFullTree: boolean) => Promise<void>) | undefined)?.(false)
      return
    }

    sortDialog.loading = true
    try {
      const success = await state.tree.batchSort(items)
      if (success) {
        ElMessage.success('排序已保存')
        sortDialog.open = false
        // 恢复懒加载模式
        await (state.tree?.fetchTree as ((forceFullTree: boolean) => Promise<void>) | undefined)?.(false)
      } else {
        ElMessage.error('保存排序失败')
      }
    } catch {
      ElMessage.error('保存排序失败')
    } finally {
      sortDialog.loading = false
    }
  }

  function handleSortCancel(): void {
    sortDialog.open = false
    // 恢复懒加载模式
    ;(state.tree?.fetchTree as ((forceFullTree: boolean) => Promise<void>) | undefined)?.(false)
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

  // 提取 tree 属性（当启用 treeMode 时存在）
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tree = (state as any).tree

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
    loadFormData,
    tree,

    // 移动操作
    moveDialog,
    handleMove,
    handleMoveConfirm,
    handleMoveCancel,

    // 排序操作
    sortDialog,
    handleSort,
    handleSortConfirm,
    handleSortCancel,

    // Detail panel
    detailState
  }
}
