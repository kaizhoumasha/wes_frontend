import { describe, expect, it } from 'vitest'
import {
  buildFormValuesFromData,
  createEmptyFormValues
} from '@/components/common/crud-form/form-helpers'
import { DeviceCreateSchema, DeviceUpdateSchema } from '@/types/zod-extensions'
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

  it('initializes optional create fields with contract-valid values', () => {
    const values = createEmptyFormValues({
      fieldConfig: devicePageFieldConfig.form.fieldConfig,
      createInitialValues: null,
      enableOptimisticLock: false,
      versionField: 'version',
      isTreeSelectField: () => false,
    })

    expect(values).toMatchObject({
      is_active: true,
      sort_order: 0,
      role_index: 1,
      work_line_id: null,
      upstream_device_id: null,
      description: null,
    })
    expect(DeviceCreateSchema.safeParse({
      ...values,
      device_code: 'DEVICE-001',
      device_name: '一号设备',
      device_role: 'CONVEYOR',
    }).success).toBe(true)
  })

  it('preserves nullable topology fields when building edit values', () => {
    const values = buildFormValuesFromData({
      data: {
        work_line_id: null,
        upstream_device_id: null,
        description: null,
      },
      fieldConfig: devicePageFieldConfig.form.fieldConfig,
      createInitialValues: null,
      enableOptimisticLock: false,
      versionField: 'version',
      isTreeSelectField: () => false,
    })

    expect(values).toMatchObject({
      work_line_id: null,
      upstream_device_id: null,
      description: null,
    })
    expect(DeviceUpdateSchema.safeParse({
      work_line_id: values.work_line_id,
      upstream_device_id: values.upstream_device_id,
      description: values.description,
      version: 1,
    }).success).toBe(true)
  })

  it('keeps omitted optional response fields undefined in edit mode', () => {
    const values = buildFormValuesFromData({
      data: {
        device_code: 'DEVICE-001',
        device_name: '一号设备',
        device_role: 'CONVEYOR',
        version: 1,
      },
      fieldConfig: devicePageFieldConfig.form.fieldConfig,
      createInitialValues: null,
      enableOptimisticLock: true,
      versionField: 'version',
      isTreeSelectField: () => false,
    })

    expect(values.is_active).toBeUndefined()
    expect(values.role_index).toBeUndefined()
    expect(values.work_line_id).toBeUndefined()
    expect(DeviceUpdateSchema.safeParse(values).success).toBe(true)
  })
})
