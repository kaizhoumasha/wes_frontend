import { describe, expect, it } from 'vitest'
import { DEVICE_FIELDS, devicePageFieldConfig } from '@/views/admin/devices/config/fieldConfig'
import { createDevicePageConfig } from '@/views/admin/devices/config/pageConfig'

describe('Device static master-data page', () => {
  it('keeps static topology fields and removes runtime/integration fields', () => {
    const keys = DEVICE_FIELDS.map(field => field.key)
    const config = createDevicePageConfig()

    expect(keys).toEqual(
      expect.arrayContaining([
        'device_code',
        'device_name',
        'work_line_id',
        'description',
        'is_active',
        'sort_order',
        'device_role',
        'role_index',
        'upstream_device_id'
      ])
    )
    const retiredKeys = [
      'host',
      'port',
      'protocol',
      'callback_path',
      'auth_token',
      'capabilities_json',
      'vendor_type',
      'device_status',
      'maintenance_mode'
    ]
    for (const retiredKey of retiredKeys) {
      expect(keys).not.toContain(retiredKey)
    }
    expect(config.resource.defaultSort).toEqual([{ field: 'id', order: 'asc' }])
    expect(config.extensions?.rowActions ?? []).toEqual([])
    expect(config.detail?.actions ?? []).toEqual([])
  })

  it('publishes writable topology fields in the actual form config', () => {
    const formFieldKeys = devicePageFieldConfig.form.fieldConfig.map(field => field.key)

    expect(formFieldKeys).toEqual(expect.arrayContaining(['work_line_id', 'upstream_device_id']))
  })
})
