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
  defaultSort: [{ field: 'id', order: 'asc' as const }]
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

function createDeviceDetailConfig(): CrudPageDetailConfig<Device> {
  return {
    mode: 'drawer',
    size: 'lg',
    title: device => device.device_name,
    showActions: false,
    actions: [],
    sections: [
      {
        title: '基本信息',
        weight: 'primary',
        fields: [
          { key: 'device_code', layout: 'half' },
          { key: 'device_name', layout: 'half' },
          { key: 'device_role', layout: 'half' },
          { key: 'role_index', layout: 'half' },
          { key: 'is_active', layout: 'half' },
          { key: 'description', layout: 'full' }
        ]
      },
      {
        title: '拓扑信息',
        weight: 'secondary',
        fields: [
          { key: 'work_line_id', layout: 'half' },
          { key: 'upstream_device_id', layout: 'half' },
          { key: 'sort_order', layout: 'half' },
          { key: 'endpoint_base_url', layout: 'full' }
        ]
      }
    ]
  }
}

export function createDevicePageConfig(): DevicePageConfig {
  return createCrudPageConfigFromResource<Device, CreateDeviceInput, UpdateDeviceInput>({
    resource: DEVICE_PAGE_RESOURCE,
    fieldConfig: devicePageFieldConfig,
    detail: createDeviceDetailConfig(),
    features: DEVICE_PAGE_FEATURES,
    extensions: {
      rowActions: []
    }
  })
}
