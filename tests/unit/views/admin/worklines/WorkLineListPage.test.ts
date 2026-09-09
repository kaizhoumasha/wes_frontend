import { describe, expect, it, vi } from 'vitest'
import { BIZ_PERMISSIONS } from '@/api/generated/permissions'
import type { WorkLinesItem as Workline } from '@/api/modules/workLines'
import { createEmptyFormValues } from '@/components/common/crud-form/form-helpers'
import { bizRoutes } from '@/router/routes/biz'
import { WorkLineCreateSchema } from '@/types/zod-extensions'
import {
  WORKLINE_FIELDS,
  workLinePageFieldConfig
} from '@/views/admin/worklines/config/fieldConfig'
import { createWorkLinePageConfig } from '@/views/admin/worklines/config/pageConfig'

describe('WorkLine static master-data page', () => {
  it('contains only current static fields and no legacy runtime detail actions', () => {
    const keys = WORKLINE_FIELDS.map(field => field.key)
    const config = createWorkLinePageConfig(vi.fn(), vi.fn(), vi.fn(), () => true)

    expect(keys).toContain('plugin_key')
    expect(keys).toContain('plugin_version')
    expect(workLinePageFieldConfig.form.fieldConfig.map(field => field.key)).not.toContain(
      'plugin_key'
    )
    expect(keys).not.toContain('contract_version')
    expect(config.detail?.actions ?? []).toEqual([])
  })

  it('exposes independent base and plugin configuration alongside START', () => {
    const openConfig = vi.fn()
    const openStart = vi.fn()
    const openBase = vi.fn()
    const config = createWorkLinePageConfig(openConfig, openStart, openBase, () => true)
    const actions = config.extensions?.rowActions ?? []

    expect(actions.map(action => action.key)).toEqual([
      'workline-base-configuration',
      'workline-configuration',
      'workline-start'
    ])
    expect(actions[1]?.permission).toBe(BIZ_PERMISSIONS.workline.configurationStatus)
    expect(actions[2]?.permission).toBe(BIZ_PERMISSIONS.workline.start)
    expect(actions[0]?.permission).toBe(BIZ_PERMISSIONS.workline.baseConfiguration)
    const showStart = actions[2]?.show
    expect(typeof showStart).toBe('function')
    expect((showStart as (row: Workline) => boolean)({ id: 7, is_active: true } as Workline)).toBe(
      false
    )
    expect((showStart as (row: Workline) => boolean)({ id: 8, is_active: false } as Workline)).toBe(
      true
    )

    const row = { id: 7 } as Workline
    actions[0]?.onClick(row)
    actions[1]?.onClick(row)
    actions[2]?.onClick(row)
    expect(openBase).toHaveBeenCalledWith(row)
    expect(openConfig).toHaveBeenCalledWith(row)
    expect(openStart).toHaveBeenCalledWith(row)
  })

  it.each([
    [BIZ_PERMISSIONS.device.list, false, false],
    [BIZ_PERMISSIONS.workline.baseConfiguration, true, false],
    [BIZ_PERMISSIONS.workline.detail, true, false],
    [BIZ_PERMISSIONS.workline.availablePlugins, true, false],
    ['', true, true]
  ])(
    'requires all dialog read permissions when missing %s',
    (missing, baseVisible, pluginVisible) => {
      const config = createWorkLinePageConfig(
        vi.fn(),
        vi.fn(),
        vi.fn(),
        permission => permission !== missing
      )
      const actions = config.extensions?.rowActions ?? []
      const row = { id: 7 } as Workline
      expect(actions[0]?.show?.(row)).toBe(baseVisible)
      expect(actions[1]?.show?.(row)).toBe(pluginVisible)
    }
  )

  it('does not expose the retired WorkLine configuration route', () => {
    expect(bizRoutes.children?.some(route => route.name === 'WorkLineConfig')).toBe(false)
  })

  it('initializes run mode with the contract default', () => {
    const values = createEmptyFormValues({
      fieldConfig: workLinePageFieldConfig.form.fieldConfig,
      createInitialValues: null,
      enableOptimisticLock: false,
      versionField: 'version',
      isTreeSelectField: () => false
    })

    expect(values.run_mode).toBe('AUTO')
    expect(
      WorkLineCreateSchema.safeParse({
        ...values,
        line_code: 'LINE-001',
        line_name: '一号作业线',
        line_type: 'AUTO'
      }).success
    ).toBe(true)
  })
})
