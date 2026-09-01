/**
 * 设备管理字段配置
 *
 * 使用统一字段配置管理表格、表单与搜索，字段能力基线与后端契约对齐。
 */

import type {
  CreateDevicesInput as CreateDeviceInput,
  UpdateDevicesInput as UpdateDeviceInput,
  DevicesItem as Device
} from '@/api/modules/devices'
import {
  DeviceCreateMetadata,
  DeviceResponseMetadata,
  DeviceUpdateMetadata
} from '@/api/generated/openapi-metadata'
import { z } from 'zod'
import {
  DeviceCreateSchema as GeneratedDeviceCreateSchema,
  DeviceUpdateSchema as GeneratedDeviceUpdateSchema
} from '@/types/zod-extensions'
import {
  defineCrudResourceFieldBundle
} from '@/components/common/crud-page/resourceFieldBuilder'

const DEVICE_FIELD_LABEL_OVERRIDES = {
  device_code: '设备编码',
  device_name: '设备名称',
  device_role: '设备角色',
  role_index: '角色序号',
  description: '描述',
  is_active: '是否激活',
  work_line_id: '作业线',
  upstream_device_id: '上游设备',
  sort_order: '排序号',
  endpoint_base_url: '设备 Endpoint'
} as const

export const DEVICE_TABLE_STORAGE_KEY = 'wes-device-table-columns'

export const deviceSearchConfig = {
  placeholder: '搜索设备编码或名称...',
  quickPresets: [],
  favorites: []
}

const createEndpointInput = z.preprocess(
  value => value === '' ? null : value,
  GeneratedDeviceCreateSchema.shape.endpoint_base_url
)
const updateEndpointInput = z.preprocess(
  value => value === '' ? null : value,
  GeneratedDeviceUpdateSchema.shape.endpoint_base_url
)

export const DeviceCreateFormSchema = GeneratedDeviceCreateSchema.extend({
  device_code: z.string().min(1, '请输入设备编码').max(100, '设备编码不能超过 100 个字符'),
  device_name: z.string().min(1, '请输入设备名称').max(100, '设备名称不能超过 100 个字符'),
  device_role: z.string().min(1, '请输入设备角色').max(50, '设备角色不能超过 50 个字符'),
  endpoint_base_url: createEndpointInput
})

export const DeviceUpdateFormSchema = GeneratedDeviceUpdateSchema.extend({
  endpoint_base_url: updateEndpointInput
})

export const deviceFormConfig = {
  createSchema: DeviceCreateFormSchema,
  updateSchema: DeviceUpdateFormSchema
}

/**
 * 设备字段定义：
 * - `backend` 描述后端字段事实来源
 * - `fields` 仅描述前端 UI 投影差异
 */
export const {
  fields: DEVICE_FIELDS,
  fieldConfig: devicePageFieldConfig
} = defineCrudResourceFieldBundle<Device, CreateDeviceInput, UpdateDeviceInput>({
  backend: {
    readSchema: DeviceResponseMetadata,
    createSchema: DeviceCreateMetadata,
    updateSchema: DeviceUpdateMetadata,
    labelOverrides: DEVICE_FIELD_LABEL_OVERRIDES
  },
  fields: [
    {
      key: 'device_code',
      table: {
        visibleFrom: 'mobile',
        fixed: 'left',
        reorderLocked: true,
        hideable: false,
        width: 120
      },
      form: {
        required: true
      },
      search: {}
    },
    {
      key: 'device_name',
      table: {
        visibleFrom: 'mobile',
        fixed: 'left',
        reorderLocked: true,
        hideable: false,
        width: 150
      },
      form: {
        required: true
      },
      search: {}
    },
    {
      key: 'is_active',
      table: {
        visibleFrom: 'mobile',
        width: 90
      },
      form: {
        type: 'switch',
        defaultValue: true
      },
      search: {
        dataType: 'boolean'
      }
    },
    {
      key: 'device_role',
      table: {
        visibleFrom: 'tablet',
        width: 120
      },
      form: {
        required: true
      },
      search: {}
    },
    {
      key: 'role_index',
      table: {
        visibleFrom: 'tablet',
        width: 90
      },
      form: {
        type: 'number',
        defaultValue: 1
      }
    },
    {
      key: 'description',
      table: {
        visibleFrom: 'desktop',
        minWidth: 200
      },
      form: {
        type: 'textarea',
        defaultValue: null
      }
    },
    {
      key: 'endpoint_base_url',
      form: {
        type: 'input',
        defaultValue: null,
        placeholder: '例如 http://192.168.10.20:8000'
      }
    },
    {
      key: 'work_line_id',
      form: {
        defaultValue: null
      }
    },
    {
      key: 'upstream_device_id',
      form: {
        defaultValue: null
      }
    },
    {
      key: 'sort_order',
      table: {
        visibleFrom: 'tablet',
        width: 90
      },
      form: {
        type: 'number',
        defaultValue: 0
      }
    }
  ],
  storageKey: DEVICE_TABLE_STORAGE_KEY,
  reorderLockedKeys: ['device_code', 'device_name'],
  search: deviceSearchConfig,
  form: deviceFormConfig
})
