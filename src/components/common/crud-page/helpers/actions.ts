import type { ActionButtonConfig } from '@/components/common/table/formatters'
import type {
  CrudPageConfig,
  CrudPageEntity,
  CrudPagePermissionConfig,
  CrudPageRowAction,
  CrudPageRowActionValue,
  CrudPageToolbarAction,
  ResolvedCrudPageFeatures
} from '../types'

type CrudPageControllerStateLike = {
  state: {
    selectedCount: { value: number }
    batchDeleteLoading: { value: boolean }
  }
  dialogs: {
    openCreate: () => void
    openEdit: (id: number) => void
  }
  permissions: {
    update: { value: boolean }
    delete: { value: boolean }
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

export function buildCrudPermissionConfig(permissions?: CrudPagePermissionConfig): {
  create: string
  update: string
  delete: string
} | undefined {
  if (!permissions?.create || !permissions.update || !permissions.delete) {
    return undefined
  }

  return {
    create: permissions.create,
    update: permissions.update,
    delete: permissions.delete
  }
}

export function buildDefaultToolbarActions<
  TItem extends CrudPageEntity,
  TCreate extends object,
  TUpdate extends object
>(options: ToolbarActionsOptions<TItem, TCreate, TUpdate>): CrudPageToolbarAction[] {
  const { config, features, state, onBatchDelete } = options
  const actions = [...(config.extensions?.toolbarActions ?? [])]
  const createLabel = features.create.label ?? '新增'
  const createTooltip = features.create.tooltip ?? createLabel
  const createIcon = features.create.icon ?? 'Plus'
  const createPermission = features.create.permission ?? config.resource.permissions?.create
  const batchDeleteLabel = features.batchDelete.label ?? '批量删除'
  const batchDeleteTooltip = features.batchDelete.tooltip ?? '删除选中的数据'
  const batchDeleteIcon = features.batchDelete.icon ?? 'Delete'
  const batchDeletePermission =
    features.batchDelete.permission ?? config.resource.permissions?.delete

  if (features.create.enabled && config.form) {
    actions.unshift({
      key: `${config.resource.key}-create`,
      label: createLabel,
      icon: createIcon,
      type: 'primary',
      handler: state.dialogs.openCreate,
      permission: createPermission,
      showWhen: () => state.state.selectedCount.value === 0,
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
      showWhen: () => state.state.selectedCount.value > 0,
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
  const { config, features, state, onDelete } = options
  const actions: CrudPageRowAction<TItem>[] = []
  const editLabel = features.edit.label ?? '编辑'
  const editTooltip = features.edit.tooltip ?? editLabel
  const deleteLabel = features.delete.label ?? '删除'
  const deleteTooltip = features.delete.tooltip ?? deleteLabel
  const deleteIcon = features.delete.icon
  const deletePermission = features.delete.permission ?? config.resource.permissions?.delete

  if (features.edit.enabled && config.form) {
    actions.push({
      key: `${config.resource.key}-edit`,
      label: editLabel,
      type: 'primary',
      tooltip: editTooltip,
      icon: features.edit.icon,
      show: () => state.permissions.update.value,
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
      permission: deletePermission,
      show: () => state.permissions.delete.value,
      onClick: onDelete,
      popconfirm: {
        title: '确认删除这条记录吗？',
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        confirmButtonType: 'danger',
        width: 240
      }
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
