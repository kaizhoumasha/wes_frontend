import { describe, expect, it } from 'vitest'
import { deviceFormConfig } from '@/views/admin/devices/config/fieldConfig'
import { roleFormConfig } from '@/views/admin/roles/config/fieldConfig'
import { workLineFormConfig } from '@/views/admin/worklines/config/fieldConfig'

function validationMessages(schema: { safeParse: (value: unknown) => unknown }, value: unknown) {
  const result = schema.safeParse(value) as {
    success: boolean
    error?: { issues: Array<{ message: string }> }
  }

  expect(result.success).toBe(false)
  return result.error?.issues.map(issue => issue.message) ?? []
}

describe('QA regression: CRUD create form validation', () => {
  it('rejects an empty role name with a localized message', () => {
    expect(validationMessages(roleFormConfig.createSchema, { name: '' })).toContain('请输入角色名称')
  })

  it('uses localized required messages for device fields', () => {
    expect(
      validationMessages(deviceFormConfig.createSchema, {
        device_code: '',
        device_name: '',
        device_role: ''
      })
    ).toEqual(expect.arrayContaining(['请输入设备编码', '请输入设备名称', '请输入设备角色']))
  })

  it('uses localized required messages for workline fields', () => {
    expect(
      validationMessages(workLineFormConfig.createSchema, {
        line_code: '',
        line_name: '',
        line_type: ''
      })
    ).toEqual(expect.arrayContaining(['请输入作业线编码', '请输入作业线名称', '请选择作业线类型']))
  })
})
