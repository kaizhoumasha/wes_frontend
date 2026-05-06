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
import { DeviceCreateSchema, DeviceUpdateSchema } from '@/types/zod-extensions'
import {
  defineCrudResourceFieldBundle
} from '@/components/common/crud-page/resourceFieldBuilder'

const DEVICE_FIELD_LABEL_OVERRIDES = {
  device_code: '设备编码',
  device_name: '设备名称',
  device_status: '设备状态',
  device_role: '设备角色',
  role_index: '角色序号',
  description: '描述',
  is_active: '是否激活',
  work_line_id: '作业线',
  upstream_device_id: '上游设备',
  host: '主机地址',
  port: '端口',
  protocol: '通信协议',
  timeout: '超时时间(ms)',
  auth_token: '认证Token',
  vendor_type: '厂商类型',
  max_concurrent_tasks: '最大并发任务',
  current_command_id: '当前指令',
  last_heartbeat_at: '最后心跳时间',
  error_code: '错误码',
  capabilities_json: '设备能力',
  sort_order: '排序号',
  version: '版本'
} as const

export const DEVICE_TABLE_STORAGE_KEY = 'wes-device-table-columns'

export const deviceSearchConfig = {
  placeholder: '搜索设备编码或名称...',
  quickPresets: [],
  favorites: []
}

export const deviceFormConfig = {
  createSchema: DeviceCreateSchema,
  updateSchema: DeviceUpdateSchema
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
    readSchema: 'DeviceResponse',
    createSchema: 'DeviceCreate',
    updateSchema: 'DeviceUpdate',
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
      key: 'device_status',
      table: {
        visibleFrom: 'mobile',
        width: 100
      },
      form: {
        type: 'select'
      },
      search: {
        dataType: 'enum'
      }
    },
    {
      key: 'is_active',
      table: {
        visibleFrom: 'mobile',
        width: 90
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
        type: 'number'
      }
    },
    {
      key: 'host',
      table: {
        visibleFrom: 'desktop',
        width: 140
      },
      form: {}
    },
    {
      key: 'port',
      table: {
        visibleFrom: 'desktop',
        width: 80
      },
      form: {
        type: 'number'
      }
    },
    {
      key: 'protocol',
      table: {
        visibleFrom: 'desktop',
        width: 100
      },
      form: {
        type: 'select'
      },
      search: {
        dataType: 'enum'
      }
    },
    {
      key: 'vendor_type',
      table: {
        visibleFrom: 'desktop',
        width: 120
      },
      form: {}
    },
    {
      key: 'description',
      table: {
        visibleFrom: 'desktop',
        minWidth: 200
      },
      form: {
        type: 'textarea'
      }
    },
    {
      key: 'timeout',
      table: {
        visibleFrom: 'desktop',
        width: 120
      },
      form: {
        type: 'number'
      }
    },
    {
      key: 'max_concurrent_tasks',
      table: {
        visibleFrom: 'desktop',
        width: 130
      },
      form: {
        type: 'number'
      }
    },
    {
      key: 'last_heartbeat_at',
      table: {
        visibleFrom: 'desktop',
        width: 180
      }
    },
    {
      key: 'auth_token'
    },
    {
      key: 'capabilities_json'
    },
    {
      key: 'current_command_id'
    },
    {
      key: 'error_code'
    },
    {
      key: 'work_line_id'
    },
    {
      key: 'upstream_device_id'
    }
  ],
  storageKey: DEVICE_TABLE_STORAGE_KEY,
  reorderLockedKeys: ['device_code', 'device_name'],
  search: deviceSearchConfig,
  form: deviceFormConfig
})
