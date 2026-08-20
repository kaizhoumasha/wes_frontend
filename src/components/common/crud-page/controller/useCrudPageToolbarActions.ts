import { computed, type ComputedRef } from 'vue'
import { buildDefaultToolbarActions } from '@/components/common/crud-page/helpers/actions'
import { resolveCrudPageFeatures } from '@/components/common/crud-page/helpers/features'
import type {
  CrudPageConfig,
  CrudPageEntity,
  CrudPageResolvedToolbarAction,
  CrudPageToolbarActionContext,
  CrudPageViewMode
} from '@/components/common/crud-page/types'

interface ToolbarActionHandlers {
  handleBatchDelete: () => Promise<void>
  handleBatchRestore: () => Promise<void>
  handleBatchPermanentDelete: () => Promise<void>
  handleCreate: () => Promise<void>
  handleSort: () => Promise<void>
}

export function useCrudPageToolbarActions<
  TItem extends CrudPageEntity,
  TCreate extends object,
  TUpdate extends object
>(options: {
  config: CrudPageConfig<TItem, TCreate, TUpdate>
  features: ReturnType<typeof resolveCrudPageFeatures>
  state: {
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
      permanentDelete: { value: boolean }
    }
    tree?: {
      isTreeMode: { value: boolean }
      fetchTree?: ((forceFullTree: boolean) => Promise<void>) | (() => Promise<void>)
    }
  }
  toolbarActionContext: CrudPageToolbarActionContext
  handlers: ToolbarActionHandlers
}): ComputedRef<CrudPageResolvedToolbarAction[]> {
  const { config, features, state, toolbarActionContext, handlers } = options

  return computed<CrudPageResolvedToolbarAction[]>(() => {
    const actions = buildDefaultToolbarActions({
      config,
      features,
      state,
      onBatchDelete: () => void handlers.handleBatchDelete(),
      onBatchRestore: () => void handlers.handleBatchRestore(),
      onBatchPermanentDelete: () => void handlers.handleBatchPermanentDelete()
    })

    if (
      state.tree &&
      state.tree.isTreeMode.value &&
      typeof state.tree.fetchTree === 'function'
    ) {
      const createActionIndex = actions.findIndex(
        action => action.key === `${config.resource.key}-create`
      )
      if (createActionIndex !== -1) {
        actions[createActionIndex] = {
          ...actions[createActionIndex],
          handler: () => handlers.handleCreate()
        }
      }
    }

    if (
      features.sort.enabled &&
      state.tree &&
      state.tree.isTreeMode.value &&
      typeof state.tree.fetchTree === 'function'
    ) {
      const sortLabel = features.sort.label ?? '排序'
      const sortTooltip = features.sort.tooltip ?? '拖拽调整菜单顺序和层级'
      const sortIcon = features.sort.icon ?? 'lucide:arrow-down-up'
      const sortPermission = features.sort.permission ?? config.resource.permissions?.batchSort

      actions.push({
        key: `${config.resource.key}-sort`,
        label: sortLabel,
        icon: sortIcon,
        type: 'primary' as const,
        handler: () => handlers.handleSort(),
        permission: sortPermission,
        tooltip: sortTooltip
      })
    }

    return actions.map(action => ({
      ...action,
      handler: () => action.handler(toolbarActionContext)
    }))
  })
}
