import type { Component } from 'vue'
import RoughSorterPluginConfigForm from '../components/RoughSorterPluginConfigForm.vue'
import {
  RoughSorterConfigSchema,
  mergeRoughSorterConfig,
  readRoughSorterConfig
} from './roughSorterConfig'

export interface WorkLinePluginConfigDefinition {
  displayName: string
  component: Component
  read: (config: Record<string, unknown>) => unknown
  write: (config: Record<string, unknown>, value: unknown) => Record<string, unknown>
  validate: (value: unknown) => string[]
}

export const WORKLINE_PLUGIN_CONFIG_CATALOG = {
  rough_sorter: {
    displayName: '粗分业务',
    component: RoughSorterPluginConfigForm,
    read: readRoughSorterConfig,
    write: (config, value) => mergeRoughSorterConfig(config, RoughSorterConfigSchema.parse(value)),
    validate: value => {
      const parsed = RoughSorterConfigSchema.safeParse(value)
      return parsed.success ? [] : parsed.error.issues.map(issue => issue.message)
    }
  }
} satisfies Record<string, WorkLinePluginConfigDefinition>

export function getWorkLinePluginConfigDefinition(
  pluginKey: string | null
): WorkLinePluginConfigDefinition | null {
  if (!pluginKey) return null
  return (
    WORKLINE_PLUGIN_CONFIG_CATALOG[pluginKey as keyof typeof WORKLINE_PLUGIN_CONFIG_CATALOG] ?? null
  )
}
