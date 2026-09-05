import { describe, expect, it } from 'vitest'
import {
  getWorkLinePluginConfigDefinition,
  WORKLINE_PLUGIN_CONFIG_CATALOG
} from '@/views/admin/worklines/config/pluginConfigCatalog'
import { createEmptyRoughSorterConfig } from '@/views/admin/worklines/config/roughSorterConfig'

describe('WorkLine plugin config catalog', () => {
  it('registers the installed rough sorter editor explicitly', () => {
    const definition = getWorkLinePluginConfigDefinition('rough_sorter')

    expect(Object.keys(WORKLINE_PLUGIN_CONFIG_CATALOG)).toEqual(['rough_sorter'])
    expect(definition?.displayName).toBe('粗分业务')
    expect(definition?.read({})).toEqual(createEmptyRoughSorterConfig())
  })

  it('fails closed for a deployed plugin without a frontend editor', () => {
    expect(getWorkLinePluginConfigDefinition('future_plugin')).toBeNull()
  })
})
