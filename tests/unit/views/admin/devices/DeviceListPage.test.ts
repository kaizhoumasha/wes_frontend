import { describe, expect, it, vi } from 'vitest'
import {
  buildFormValuesFromData,
  createEmptyFormValues
} from '@/components/common/crud-form/form-helpers'
import { DeviceCreateSchema, DeviceUpdateSchema } from '@/types/zod-extensions'
import {
  DeviceCreateFormSchema,
  DeviceUpdateFormSchema,
  DEVICE_FIELDS,
  devicePageFieldConfig
} from '@/views/admin/devices/config/fieldConfig'
import { createDevicePageConfig } from '@/views/admin/devices/config/pageConfig'
import { SUPERUSER_PERMISSION } from '@/composables/permission-state'

describe('Device static master-data page', () => {
  it('exposes ECS discovery only through the system-administrator toolbar action', async () => {
    const openDiscovery = vi.fn()
    const config = createDevicePageConfig(openDiscovery)
    const action = config.extensions?.toolbarActions?.find(
      candidate => candidate.key === 'devices-ecs-discovery'
    )

    expect(action).toMatchObject({
      label: '从 ECS 发现',
      permission: SUPERUSER_PERMISSION
    })
    await action?.handler({
      applyQuickPreset: vi.fn(),
      clearFilters: vi.fn(),
      refresh: vi.fn()
    })
    expect(openDiscovery).toHaveBeenCalledOnce()
  })

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

  it('keeps WorkLine ownership out of the device edit form', () => {
    const formFieldKeys = devicePageFieldConfig.form.fieldConfig.map(field => field.key)

    expect(formFieldKeys).toContain('upstream_device_id')
    expect(formFieldKeys).not.toContain('work_line_id')
  })

  it('publishes the optional Device Endpoint in form and detail metadata', () => {
    const config = createDevicePageConfig()
    const formKeys = devicePageFieldConfig.form.fieldConfig.map(field => field.key)
    const detailKeys = config.detail?.sections.flatMap(section => section.fields.map(field => field.key))

    expect(DEVICE_FIELDS.map(field => field.key)).toContain('endpoint_base_url')
    expect(formKeys).toContain('endpoint_base_url')
    expect(detailKeys).toContain('endpoint_base_url')
  })

  it('shows WorkLine ownership as read-only device information', () => {
    const ownership = devicePageFieldConfig.table.defaultColumns.find(
      field => field.key === 'work_line_id'
    )
    const createOwnership = devicePageFieldConfig.form.fieldConfig.find(
      field => field.key === 'work_line_id'
    )

    expect(ownership).toBeDefined()
    expect(createOwnership).toBeUndefined()
  })

  it('normalizes a cleared Endpoint to null before Device create or update', () => {
    const create = DeviceCreateFormSchema.parse({
      device_code: 'MEASURE-01',
      device_name: '测量设备 01',
      device_role: 'MEASUREMENT_DEVICE',
      endpoint_base_url: ''
    })
    const update = DeviceUpdateFormSchema.parse({ version: 3, endpoint_base_url: '' })

    expect(create.endpoint_base_url).toBeNull()
    expect(update.endpoint_base_url).toBeNull()
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
      upstream_device_id: null,
      description: null,
    })
    expect(DeviceUpdateSchema.safeParse({
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
