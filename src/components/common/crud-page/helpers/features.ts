import type {
  CrudPageActionFeature,
  CrudPageFeatures,
  ResolvedCrudPageFeatures,
  ResolvedCrudPageStandardActionConfig
} from '../types'

const DEFAULT_FEATURES: ResolvedCrudPageFeatures = {
  refresh: true,
  density: true,
  fullscreen: true,
  columnConfig: true,
  create: { enabled: true, label: '新增', tooltip: '新增', icon: 'ep:plus' },
  edit: { enabled: true, label: '编辑', tooltip: '编辑', icon: 'lucide:pen-line' },
  delete: { enabled: true, label: '删除', tooltip: '删除', icon: 'lucide:trash-2' },
  batchDelete: { enabled: true, label: '批量删除', tooltip: '批量删除', icon: 'ep:delete' },
  trash: { enabled: false },
  restore: { enabled: true, label: '恢复', tooltip: '恢复', icon: 'lucide:undo-2' },
  batchRestore: { enabled: true, label: '批量恢复', tooltip: '批量恢复', icon: 'ep:refresh-left' },
  permanentDelete: { enabled: true, label: '彻底删除', tooltip: '彻底删除', icon: 'lucide:file-x' },
  batchPermanentDelete: { enabled: true, label: '批量彻底删除', tooltip: '批量彻底删除', icon: 'ep:delete-filled' },
  move: { enabled: false, label: '移动', tooltip: '移动', icon: 'lucide:arrow-up-down' },
  sort: { enabled: false, label: '排序', tooltip: '排序', icon: 'lucide:sort-asc' },
  createChild: { enabled: false, label: '添加下级', tooltip: '添加下级', icon: 'lucide:plus' }
}

function resolveActionFeature(
  feature: CrudPageActionFeature | undefined,
  defaultConfig: ResolvedCrudPageStandardActionConfig
): ResolvedCrudPageStandardActionConfig {
  if (feature === undefined || feature === true) {
    return { ...defaultConfig }
  }

  if (feature === false) {
    return {
      ...defaultConfig,
      enabled: false
    }
  }

  return {
    ...defaultConfig,
    ...feature,
    enabled: feature.enabled ?? defaultConfig.enabled
  }
}

export function resolveCrudPageFeatures(features?: CrudPageFeatures): ResolvedCrudPageFeatures {
  return {
    refresh: features?.refresh ?? DEFAULT_FEATURES.refresh,
    density: features?.density ?? DEFAULT_FEATURES.density,
    fullscreen: features?.fullscreen ?? DEFAULT_FEATURES.fullscreen,
    columnConfig: features?.columnConfig ?? DEFAULT_FEATURES.columnConfig,
    create: resolveActionFeature(features?.create, DEFAULT_FEATURES.create),
    edit: resolveActionFeature(features?.edit, DEFAULT_FEATURES.edit),
    delete: resolveActionFeature(features?.delete, DEFAULT_FEATURES.delete),
    batchDelete: resolveActionFeature(features?.batchDelete, DEFAULT_FEATURES.batchDelete),
    trash: resolveActionFeature(features?.trash, DEFAULT_FEATURES.trash),
    restore: resolveActionFeature(features?.restore, DEFAULT_FEATURES.restore),
    batchRestore: resolveActionFeature(features?.batchRestore, DEFAULT_FEATURES.batchRestore),
    permanentDelete: resolveActionFeature(
      features?.permanentDelete,
      DEFAULT_FEATURES.permanentDelete
    ),
    batchPermanentDelete: resolveActionFeature(
      features?.batchPermanentDelete,
      DEFAULT_FEATURES.batchPermanentDelete
    ),
    move: resolveActionFeature(features?.move, DEFAULT_FEATURES.move),
    sort: resolveActionFeature(features?.sort, DEFAULT_FEATURES.sort),
    createChild: resolveActionFeature(features?.createChild, DEFAULT_FEATURES.createChild)
  }
}
