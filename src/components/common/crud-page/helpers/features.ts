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
  create: { enabled: true },
  edit: { enabled: true },
  delete: { enabled: true },
  batchDelete: { enabled: true }
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
    batchDelete: resolveActionFeature(features?.batchDelete, DEFAULT_FEATURES.batchDelete)
  }
}
