import { describe, expect, it } from 'vitest'
import { createEmptyFormValues } from '@/components/common/crud-form/form-helpers'
import { bizRoutes } from '@/router/routes/biz'
import { WorkLineCreateSchema } from '@/types/zod-extensions'
import {
  WORKLINE_FIELDS,
  workLinePageFieldConfig
} from '@/views/admin/worklines/config/fieldConfig'
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

  it('initializes run mode with the contract default', () => {
    const values = createEmptyFormValues({
      fieldConfig: workLinePageFieldConfig.form.fieldConfig,
      createInitialValues: null,
      enableOptimisticLock: false,
      versionField: 'version',
      isTreeSelectField: () => false,
    })

    expect(values.run_mode).toBe('AUTO')
    expect(WorkLineCreateSchema.safeParse({
      ...values,
      line_code: 'LINE-001',
      line_name: '一号作业线',
      line_type: 'AUTO',
    }).success).toBe(true)
  })
})
