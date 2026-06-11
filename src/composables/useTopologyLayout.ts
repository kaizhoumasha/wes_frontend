/**
 * useTopologyLayout — Vue composable wrapping the pure layout engine.
 *
 * Usage:
 *   const { layout } = useTopologyLayout(devicesRef, { compact: true })
 */

import { computed, type ComputedRef, type Ref } from 'vue'
import {
  computeLayout,
  computeLinearLayout,
  DEFAULT_LAYOUT_CONFIG,
  COMPACT_LAYOUT_CONFIG,
  type LayoutConfig,
  type LayoutResult,
  type RoleColumnRule,
  DEFAULT_ROLE_COLUMN_RULES,
} from '@/utils/runtime-topology'
import type { RuntimeSceneDeviceNode } from '@/utils/runtime-scene'

export interface UseTopologyLayoutOptions {
  compact?: boolean
  linear?: boolean
  config?: Partial<LayoutConfig>
  rules?: RoleColumnRule[]
}

export interface UseTopologyLayoutReturn {
  layout: ComputedRef<LayoutResult>
}

export function useTopologyLayout(
  devices: Ref<RuntimeSceneDeviceNode[]>,
  options: UseTopologyLayoutOptions = {}
): UseTopologyLayoutReturn {
  const baseConfig = options.compact ? COMPACT_LAYOUT_CONFIG : DEFAULT_LAYOUT_CONFIG
  const mergedConfig: LayoutConfig = { ...baseConfig, ...options.config }
  const rules = options.rules ?? DEFAULT_ROLE_COLUMN_RULES

  const layout = computed(() => {
    if (options.linear) {
      return computeLinearLayout(devices.value, mergedConfig)
    }
    return computeLayout(devices.value, mergedConfig, rules)
  })

  return { layout }
}
