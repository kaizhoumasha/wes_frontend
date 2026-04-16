import type {
  CreateDevicesInput as CreateDeviceInput,
  UpdateDevicesInput as UpdateDeviceInput,
  DevicesItem as Device
} from '@/api/modules/devices'
import { BIZ_PERMISSIONS } from '@/api/generated/permissions'
import { devicesApiMethods } from '@/api/modules/devices'
import { createCrudPageConfigFromResource } from '@/components/common/crud-page/createCrudPageConfigFromResource'
import type { CrudPageConfig, CrudPageFeatures } from '@/components/common/crud-page/types'
import type { CrudPageDetailConfig } from '@/components/common/crud-page/detail/types'
import { devicePageFieldConfig } from './fieldConfig'

type DevicePageConfig = CrudPageConfig<Device, CreateDeviceInput, UpdateDeviceInput>

const DEVICE_PAGE_RESOURCE = {
  key: 'devices',
  title: {
    text: '设备管理',
    subtitle: '管理仓储设备（PDA、AGV、堆垛机等）',
    icon: 'ep:cpu'
  },
  trashTitle: {
    text: '设备回收站',
    subtitle: '查看并恢复已删除设备',
    icon: 'ep:delete'
  },
  methods: devicesApiMethods,
  permissions: BIZ_PERMISSIONS.device,
  optimisticUpdate: true,
  defaultSort: [{ field: 'updated_at', order: 'desc' as const }]
}

const DEVICE_PAGE_TABLE: Partial<DevicePageConfig['table']> = {
  actionsColumn: {
    width: 200
  }
}

const DEVICE_PAGE_FEATURES: CrudPageFeatures = {
  trash: {
    enabled: true,
    label: '回收站'
  },
  create: {
    label: '新增设备',
    dialogTitle: '创建设备'
  },
  edit: {
    dialogTitle: '编辑设备'
  },
  restore: {
    label: '恢复设备'
  },
  batchRestore: {
    label: '批量恢复'
  },
  permanentDelete: {
    label: '彻底删除'
  },
  batchPermanentDelete: {
    label: '批量彻底删除'
  }
}

const DEVICE_PAGE_DETAIL: CrudPageDetailConfig<Device> = {
  mode: 'drawer',
  width: 700,
  title: device => device.device_name,
  sections: [
    {
      title: '基本信息',
      weight: 'primary',
      fields: [
        { key: 'device_code', layout: 'half' },
        { key: 'device_name', layout: 'half' },
        { key: 'device_type', layout: 'half' },
        { key: 'device_role', layout: 'half' },
        { key: 'role_index', layout: 'half' },
        { key: 'is_active', layout: 'half' },
        { key: 'description', layout: 'full' }
      ]
    },
    {
      title: '连接配置',
      weight: 'secondary',
      fields: [
        { key: 'host', layout: 'half' },
        { key: 'port', layout: 'half' },
        { key: 'protocol', layout: 'half' },
        { key: 'timeout', layout: 'half' },
        { key: 'auth_token', layout: 'full' }
      ]
    },
    {
      title: '能力配置',
      weight: 'secondary',
      fields: [
        { key: 'capabilities', layout: 'full' },
        { key: 'supported_commands', layout: 'full' },
        { key: 'max_concurrent_tasks', layout: 'half' },
        { key: 'vendor_type', layout: 'half' }
      ]
    },
    {
      title: '状态信息',
      weight: 'tertiary',
      fields: [
        { key: 'device_status', layout: 'half' },
        { key: 'current_command_id', layout: 'half' },
        { key: 'error_code', layout: 'half' },
        { key: 'last_heartbeat_at', layout: 'half' }
      ]
    },
    {
      title: '元数据',
      weight: 'tertiary',
      fields: [
        { key: 'work_line_id', layout: 'half' },
        { key: 'upstream_device_id', layout: 'half' },
        { key: 'created_at', layout: 'half' },
        { key: 'updated_at', layout: 'half' }
      ]
    }
  ]
}

export function createDevicePageConfig(): DevicePageConfig {
  return createCrudPageConfigFromResource<Device, CreateDeviceInput, UpdateDeviceInput>({
    resource: DEVICE_PAGE_RESOURCE,
    fieldConfig: devicePageFieldConfig,
    table: DEVICE_PAGE_TABLE,
    detail: DEVICE_PAGE_DETAIL,
    features: DEVICE_PAGE_FEATURES
  })
}
