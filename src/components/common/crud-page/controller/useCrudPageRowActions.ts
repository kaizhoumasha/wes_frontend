import { computed, type ComputedRef } from 'vue'
import { buildDefaultRowActions } from '@/components/common/crud-page/helpers/actions'
import { resolveCrudPageFeatures } from '@/components/common/crud-page/helpers/features'
import { createViewDetailRowAction } from '@/components/common/crud-page/controller/helpers/presentation'
import type {
  CrudPageConfig,
  CrudPageEntity,
  CrudPageRowAction,
  CrudPageViewMode
} from '@/components/common/crud-page/types'

interface RowActionHandlers<TItem extends CrudPageEntity> {
  onDelete: (row: TItem) => Promise<void>
  onRestore: (row: TItem) => Promise<void>
  onPermanentDelete: (row: TItem) => Promise<void>
  onMove: (row: TItem) => void
  onCreateChild: (row: TItem) => void
  onViewDetail: (row: TItem) => void
}

interface RowActionStateLike {
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
  tree?: {
    isTreeMode: { value: boolean }
    move?: (id: number, targetId: number, position: 'before' | 'after' | 'inner') => Promise<boolean>
  }
}

export function useCrudPageRowActions<
  TItem extends CrudPageEntity,
  TCreate extends object,
  TUpdate extends object
>(options: {
  config: CrudPageConfig<TItem, TCreate, TUpdate>
  features: ReturnType<typeof resolveCrudPageFeatures>
  state: RowActionStateLike
  handlers: RowActionHandlers<TItem>
}): ComputedRef<CrudPageRowAction<TItem>[]> {
  const { config, features, state, handlers } = options

  return computed(() => {
    const defaultRowActions = buildDefaultRowActions({
      config,
      features,
      state,
      onDelete: row => void handlers.onDelete(row),
      onRestore: row => void handlers.onRestore(row),
      onPermanentDelete: row => void handlers.onPermanentDelete(row)
    })

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
        onClick: row => handlers.onMove(row)
      })
    }

    if (
      features.createChild.enabled &&
      state.tree &&
      state.tree.isTreeMode.value
    ) {
      const createChildLabel = features.createChild.label ?? '添加下级'
      const createChildTooltip = features.createChild.tooltip ?? createChildLabel
      const createChildIcon = features.createChild.icon ?? 'lucide:plus'
      const createChildPermission = features.createChild.permission ?? config.resource.permissions?.create

      actions.push({
        key: `${config.resource.key}-create-child`,
        label: createChildLabel,
        type: 'primary',
        tooltip: createChildTooltip,
        icon: createChildIcon,
        priority: 'secondary',
        permission: createChildPermission,
        show: () => true,
        onClick: row => handlers.onCreateChild(row)
      })
    }

    if (state.state.viewMode.value !== 'active' || !config.detail) {
      return actions
    }

    return [createViewDetailRowAction(config.resource.key, handlers.onViewDetail), ...actions]
  })
}
