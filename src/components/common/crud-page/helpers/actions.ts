import type { ActionButtonConfig } from '@/components/common/table/formatters'
import type {
  CrudPageConfig,
  CrudPageEntity,
  CrudPagePermissionConfig,
  CrudPageViewMode,
  CrudPageRowAction,
  CrudPageRowActionValue,
  CrudPageToolbarAction,
  ResolvedCrudPageFeatures
} from '../types'

type CrudPageControllerStateLike = {
  state: {
    viewMode: { value: CrudPageViewMode }
    selectedCount: { value: number }
    batchDeleteLoading: { value: boolean }
    batchRestoreLoading: { value: boolean }
    batchPermanentDeleteLoading: { value: boolean }
  }
  dialogs: {
    openCreate: () => void
    openEdit: (id: number) => void
  }
  permissions: {
    update: { value: boolean }
    delete: { value: boolean }
    restore: { value: boolean }
  }
}

type ToolbarActionsOptions<
  TItem extends CrudPageEntity,
  TCreate extends object,
  TUpdate extends object
> = {
  config: CrudPageConfig<TItem, TCreate, TUpdate>
  features: ResolvedCrudPageFeatures
  state: CrudPageControllerStateLike
  onBatchDelete: () => void | Promise<void>
  onBatchRestore: () => void | Promise<void>
  onBatchPermanentDelete: () => void | Promise<void>
}

type RowActionsOptions<
  TItem extends CrudPageEntity,
  TCreate extends object,
  TUpdate extends object
> = {
  config: CrudPageConfig<TItem, TCreate, TUpdate>
  features: ResolvedCrudPageFeatures
  state: CrudPageControllerStateLike
  onDelete: (row: TItem) => void | Promise<void>
  onRestore: (row: TItem) => void | Promise<void>
  onPermanentDelete: (row: TItem) => void | Promise<void>
}

function resolveRowActionValue<TItem extends CrudPageEntity, TValue>(
  value: TValue | ((row: TItem) => TValue),
  row: TItem
): TValue {
  return typeof value === 'function' ? (value as (row: TItem) => TValue)(row) : value
}

function createRowValueResolver<TItem extends CrudPageEntity, TValue>(
  value: CrudPageRowActionValue<TItem, TValue> | undefined
): ((row: Record<string, unknown>) => TValue) | undefined {
  if (value === undefined) {
    return undefined
  }

  return function resolveValue(row: Record<string, unknown>): TValue {
    return resolveRowActionValue(value, row as TItem)
  }
}

function createSelectionCountPredicate(
  expectedCount: 'none' | 'some',
  state: CrudPageControllerStateLike
) {
  return function matchesSelectionCount(): boolean {
    return expectedCount === 'none'
      ? state.state.selectedCount.value === 0
      : state.state.selectedCount.value > 0
  }
}

function createPermissionVisibility(permission: { value: boolean }) {
  return function isVisible(): boolean {
    return permission.value
  }
}

function createDeletePopconfirm<TItem extends CrudPageEntity>(): NonNullable<
  CrudPageRowAction<TItem>['popconfirm']
> {
  return {
    title: '确认删除这条记录吗？',
    confirmButtonText: '确认删除',
    cancelButtonText: '取消',
    confirmButtonType: 'danger',
    width: 240
  }
}

function createPermanentDeletePopconfirm<TItem extends CrudPageEntity>(): NonNullable<
  CrudPageRowAction<TItem>['popconfirm']
> {
  return {
    title: '确认彻底删除这条记录吗？此操作不可恢复。',
    confirmButtonText: '确认彻底删除',
    cancelButtonText: '取消',
    confirmButtonType: 'danger',
    width: 280
  }
}

export function buildCrudPermissionConfig(
  permissions?: CrudPagePermissionConfig
): CrudPagePermissionConfig | undefined {
  if (!permissions) {
    return undefined
  }

  return { ...permissions }
}

export function buildDefaultToolbarActions<
  TItem extends CrudPageEntity,
  TCreate extends object,
  TUpdate extends object
>(options: ToolbarActionsOptions<TItem, TCreate, TUpdate>): CrudPageToolbarAction[] {
  const { config, features, state, onBatchDelete, onBatchRestore, onBatchPermanentDelete } = options
  const actions =
    state.state.viewMode.value === 'active' ? [...(config.extensions?.toolbarActions ?? [])] : []
  const createLabel = features.create.label ?? '新增'
  const createTooltip = features.create.tooltip ?? createLabel
  const createIcon = features.create.icon ?? 'ep:plus'
  const createPermission = features.create.permission ?? config.resource.permissions?.create
  const batchDeleteLabel = features.batchDelete.label ?? '批量删除'
  const batchDeleteTooltip = features.batchDelete.tooltip ?? '删除选中的数据'
  const batchDeleteIcon = features.batchDelete.icon ?? 'ep:delete'
  const batchDeletePermission =
    features.batchDelete.permission ?? config.resource.permissions?.delete
  const batchRestoreLabel = features.batchRestore.label ?? '批量恢复'
  const batchRestoreTooltip = features.batchRestore.tooltip ?? '恢复选中的数据'
  const batchRestoreIcon = features.batchRestore.icon ?? 'ep:refresh-left'
  const batchRestorePermission =
    features.batchRestore.permission ?? config.resource.permissions?.restore
  const batchPermanentDeleteLabel = features.batchPermanentDelete.label ?? '批量彻底删除'
  const batchPermanentDeleteTooltip = features.batchPermanentDelete.tooltip ?? '彻底删除选中的数据'
  const batchPermanentDeleteIcon = features.batchPermanentDelete.icon ?? 'ep:delete-filled'
  const batchPermanentDeletePermission =
    features.batchPermanentDelete.permission ?? config.resource.permissions?.delete

  if (state.state.viewMode.value === 'trash') {
    if (features.batchRestore.enabled) {
      actions.push({
        key: `${config.resource.key}-batch-restore`,
        label: batchRestoreLabel,
        icon: batchRestoreIcon,
        type: 'success',
        handler: onBatchRestore,
        permission: batchRestorePermission,
        showWhen: createSelectionCountPredicate('some', state),
        loading: state.state.batchRestoreLoading.value,
        tooltip: batchRestoreTooltip
      })
    }

    if (features.batchPermanentDelete.enabled) {
      actions.push({
        key: `${config.resource.key}-batch-permanent-delete`,
        label: batchPermanentDeleteLabel,
        icon: batchPermanentDeleteIcon,
        type: 'danger',
        handler: onBatchPermanentDelete,
        permission: batchPermanentDeletePermission,
        showWhen: createSelectionCountPredicate('some', state),
        loading: state.state.batchPermanentDeleteLoading.value,
        tooltip: batchPermanentDeleteTooltip
      })
    }

    return actions
  }

  if (features.create.enabled && config.form) {
    actions.unshift({
      key: `${config.resource.key}-create`,
      label: createLabel,
      icon: createIcon,
      type: 'primary',
      handler: state.dialogs.openCreate,
      permission: createPermission,
      showWhen: createSelectionCountPredicate('none', state),
      tooltip: createTooltip
    })
  }

  if (features.batchDelete.enabled) {
    actions.push({
      key: `${config.resource.key}-batch-delete`,
      label: batchDeleteLabel,
      icon: batchDeleteIcon,
      type: 'danger',
      handler: onBatchDelete,
      permission: batchDeletePermission,
      showWhen: createSelectionCountPredicate('some', state),
      loading: state.state.batchDeleteLoading.value,
      tooltip: batchDeleteTooltip
    })
  }

  return actions
}

export function buildDefaultRowActions<
  TItem extends CrudPageEntity,
  TCreate extends object,
  TUpdate extends object
>(options: RowActionsOptions<TItem, TCreate, TUpdate>): CrudPageRowAction<TItem>[] {
  const { config, features, state, onDelete, onRestore, onPermanentDelete } = options
  const actions: CrudPageRowAction<TItem>[] = []
  const editLabel = features.edit.label ?? '编辑'
  const editTooltip = features.edit.tooltip ?? editLabel
  const editIcon = features.edit.icon ?? 'lucide:pen-line'
  const deleteLabel = features.delete.label ?? '删除'
  const deleteTooltip = features.delete.tooltip ?? deleteLabel
  const deleteIcon = features.delete.icon ?? 'lucide:trash-2'
  const deletePermission = features.delete.permission ?? config.resource.permissions?.delete
  const restoreLabel = features.restore.label ?? '恢复'
  const restoreTooltip = features.restore.tooltip ?? restoreLabel
  const restoreIcon = features.restore.icon ?? 'lucide:undo-2'
  const restorePermission = features.restore.permission ?? config.resource.permissions?.restore
  const permanentDeleteLabel = features.permanentDelete.label ?? '彻底删除'
  const permanentDeleteTooltip = features.permanentDelete.tooltip ?? permanentDeleteLabel
  const permanentDeleteIcon = features.permanentDelete.icon ?? 'lucide:file-x'
  const permanentDeletePermission =
    features.permanentDelete.permission ?? config.resource.permissions?.delete

  if (state.state.viewMode.value === 'trash') {
    if (features.restore.enabled) {
      actions.push({
        key: `${config.resource.key}-restore`,
        label: restoreLabel,
        type: 'success',
        tooltip: restoreTooltip,
        icon: restoreIcon,
        priority: 'primary',
        permission: restorePermission,
        show: createPermissionVisibility(state.permissions.restore),
        onClick: onRestore
      })
    }

    if (features.permanentDelete.enabled) {
      actions.push({
        key: `${config.resource.key}-permanent-delete`,
        label: permanentDeleteLabel,
        type: 'danger',
        tooltip: permanentDeleteTooltip,
        icon: permanentDeleteIcon,
        priority: 'secondary',
        permission: permanentDeletePermission,
        show: createPermissionVisibility(state.permissions.delete),
        onClick: onPermanentDelete,
        popconfirm: createPermanentDeletePopconfirm<TItem>()
      })
    }

    return actions
  }

  if (features.edit.enabled && config.form) {
    actions.push({
      key: `${config.resource.key}-edit`,
      label: editLabel,
      type: 'primary',
      tooltip: editTooltip,
      icon: editIcon,
      priority: 'primary',
      show: createPermissionVisibility(state.permissions.update),
      onClick: row => state.dialogs.openEdit(row.id)
    })
  }

  actions.push(...(config.extensions?.rowActions ?? []))

  if (features.delete.enabled) {
    actions.push({
      key: `${config.resource.key}-delete`,
      label: deleteLabel,
      type: 'danger',
      tooltip: deleteTooltip,
      icon: deleteIcon,
      priority: 'secondary',
      permission: deletePermission,
      show: createPermissionVisibility(state.permissions.delete),
      onClick: onDelete,
      popconfirm: createDeletePopconfirm<TItem>()
    })
  }

  return actions
}

export function toActionButtonConfig<TItem extends CrudPageEntity>(
  action: CrudPageRowAction<TItem>
): ActionButtonConfig {
  return {
    label: createRowValueResolver(action.label)!,
    type: createRowValueResolver(action.type),
    icon: action.icon,
    tooltip: createRowValueResolver(action.tooltip),
    link: action.link,
    size: action.size,
    priority: action.priority,
    permission: action.permission,
    show: createRowValueResolver(action.show),
    disabled: createRowValueResolver(action.disabled),
    loading: createRowValueResolver(action.loading),
    onClick: row => action.onClick(row as TItem),
    popconfirm: action.popconfirm
      ? {
          title: createRowValueResolver(action.popconfirm.title)!,
          confirmButtonText: action.popconfirm.confirmButtonText,
          cancelButtonText: action.popconfirm.cancelButtonText,
          confirmButtonType: action.popconfirm.confirmButtonType,
          width: action.popconfirm.width
        }
      : undefined
  }
}
