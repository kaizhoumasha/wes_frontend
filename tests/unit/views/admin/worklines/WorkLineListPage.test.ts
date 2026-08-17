import { describe, expect, it } from 'vitest'
import { bizRoutes } from '@/router/routes/biz'
import { WORKLINE_FIELDS } from '@/views/admin/worklines/config/fieldConfig'
import { createWorkLinePageConfig } from '@/views/admin/worklines/config/pageConfig'

describe('WorkLine static master-data page', () => {
  it('contains only current static fields and no legacy runtime actions', () => {
    const keys = WORKLINE_FIELDS.map(field => field.key)
    const config = createWorkLinePageConfig()

    expect(keys).not.toContain('plugin_key')
    expect(keys).not.toContain('contract_version')
    expect(config.extensions?.rowActions ?? []).toEqual([])
    expect(config.detail?.actions ?? []).toEqual([])
  })

  it('does not expose the retired WorkLine configuration route', () => {
    expect(bizRoutes.children?.some(route => route.name === 'WorkLineConfig')).toBe(false)
  })
})
