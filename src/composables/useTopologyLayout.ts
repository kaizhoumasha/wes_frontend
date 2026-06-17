/**
 * useTopologyLayout — Vue composable wrapping the pure layout engine.
 *
 * All inputs accept `MaybeRefOrGetter` so layout recomputes when manifest /
 * config inputs arrive after the initial render. The internal `computed()`
 * reads each option via `toValue()`, which keeps the dependency graph
 * reactive without losing responsiveness on late-arriving manifests.
 *
 * Usage:
 *   const { layout } = useTopologyLayout(
 *     () => props.devices,
 *     {
 *       compact: () => props.compact,
 *       explicitNodes: () => props.explicitNodes,
 *       explicitEdges: () => props.explicitEdges
 *     }
 *   )
 */

import { computed, toValue, type ComputedRef, type MaybeRefOrGetter } from 'vue'
import {
  computeLayout,
  computeLinearLayout,
  DEFAULT_LAYOUT_CONFIG,
  COMPACT_LAYOUT_CONFIG,
  type ExplicitLayoutEdge,
  type LayoutConfig,
  type LayoutNodeInput,
  type LayoutResult,
  type RoleColumnRule,
  DEFAULT_ROLE_COLUMN_RULES,
} from '@/utils/runtime-topology'
import type { RuntimeSceneDeviceNode } from '@/utils/runtime-scene'

export interface UseTopologyLayoutOptions {
  compact?: MaybeRefOrGetter<boolean | undefined>
  linear?: MaybeRefOrGetter<boolean | undefined>
  config?: MaybeRefOrGetter<Partial<LayoutConfig> | undefined>
  rules?: MaybeRefOrGetter<RoleColumnRule[] | undefined>
  explicitNodes?: MaybeRefOrGetter<LayoutNodeInput[] | undefined>
  explicitEdges?: MaybeRefOrGetter<ExplicitLayoutEdge[] | undefined>
}

export interface UseTopologyLayoutReturn {
  layout: ComputedRef<LayoutResult>
}

export function useTopologyLayout(
  devices: MaybeRefOrGetter<RuntimeSceneDeviceNode[] | undefined>,
  options: UseTopologyLayoutOptions = {}
): UseTopologyLayoutReturn {
  const layout = computed<LayoutResult>(() => {
    const devicesValue = toValue(devices) ?? []
    const compact = toValue(options.compact) ?? false
    const linear = toValue(options.linear) ?? false
    const configOverride = toValue(options.config) ?? {}
    const rules = toValue(options.rules) ?? DEFAULT_ROLE_COLUMN_RULES
    const explicitNodes = toValue(options.explicitNodes)
    const explicitEdges = toValue(options.explicitEdges)

    const baseConfig = compact ? COMPACT_LAYOUT_CONFIG : DEFAULT_LAYOUT_CONFIG
    const mergedConfig: LayoutConfig = { ...baseConfig, ...configOverride }

    if (linear) {
      return computeLinearLayout(devicesValue, mergedConfig)
    }

    return computeLayout(devicesValue, mergedConfig, rules, {
      explicitNodes,
      explicitEdges,
    })
  })

  return { layout }
}
