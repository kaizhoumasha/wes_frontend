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

interface DevicePageActions {
  openRuntime: (device: Device) => void
  openTrace: (device: Device) => void
  enterMaintenance: (device: Device) => Promise<void>
  exitMaintenance: (device: Device) => Promise<void>
  clearFault: (device: Device) => Promise<void>
  canOpenTrace: () => boolean
}

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
    width: 280
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

function createDeviceDetailConfig(actions: DevicePageActions): CrudPageDetailConfig<Device> {
  return {
    mode: 'drawer',
    size: 'lg',
    title: device => device.device_name,
    showActions: true,
    actions: [
      {
        key: 'open-runtime',
        label: '设备运行态',
        type: 'primary',
        icon: 'ep:monitor',
        onClick: device => actions.openRuntime(device),
      },
      {
        key: 'open-trace',
        label: '最近 TRACE',
        type: 'warning',
        icon: 'ep:connection',
        showWhen: () => actions.canOpenTrace(),
        onClick: device => actions.openTrace(device),
      },
    ],
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
          { key: 'capabilities_json', layout: 'full' },
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
          { key: 'maintenance_mode', layout: 'half' },
          { key: 'last_heartbeat_at', layout: 'half' }
        ]
      },
      {
        title: '元数据',
        weight: 'tertiary',
        fields: [
          { key: 'work_line_id', layout: 'half' },
          { key: 'upstream_device_id', layout: 'half' }
        ]
      }
    ]
  }
}

export function createDevicePageConfig(actions: DevicePageActions): DevicePageConfig {
  return createCrudPageConfigFromResource<Device, CreateDeviceInput, UpdateDeviceInput>({
    resource: DEVICE_PAGE_RESOURCE,
    fieldConfig: devicePageFieldConfig,
    table: DEVICE_PAGE_TABLE,
    detail: createDeviceDetailConfig(actions),
    features: DEVICE_PAGE_FEATURES,
    extensions: {
      rowActions: [
        {
          key: 'open-runtime',
          label: '设备运行态',
          tooltip: '设备运行态',
          type: 'primary',
          icon: 'lucide:layout-dashboard',
          permission: BIZ_PERMISSIONS.device.page,
          onClick: row => actions.openRuntime(row),
        },
        {
          key: 'open-trace',
          label: '最近 TRACE',
          tooltip: '最近 TRACE',
          type: 'warning',
          icon: 'lucide:search',
          permission: BIZ_PERMISSIONS.workline.page,
          onClick: row => actions.openTrace(row),
        },
        {
          key: 'enter-maintenance',
          label: '进入维护',
          tooltip: '进入维护',
          type: 'warning',
          icon: 'ep:tools',
          permission: BIZ_PERMISSIONS.device.update,
          show: row => !row.maintenance_mode && row.device_status !== 'MAINTENANCE',
          onClick: row => actions.enterMaintenance(row),
          popconfirm: {
            title: row => `确认将 ${row.device_name} 切换为维护态？`,
            confirmButtonText: '进入维护',
            confirmButtonType: 'warning'
          }
        },
        {
          key: 'exit-maintenance',
          label: '退出维护',
          tooltip: '退出维护',
          type: 'success',
          icon: 'ep:circle-check',
          permission: BIZ_PERMISSIONS.device.update,
          show: row => row.maintenance_mode || row.device_status === 'MAINTENANCE',
          onClick: row => actions.exitMaintenance(row),
          popconfirm: {
            title: row => `确认将 ${row.device_name} 恢复为空闲态？`,
            confirmButtonText: '退出维护',
            confirmButtonType: 'success'
          }
        },
        {
          key: 'clear-fault',
          label: '清除故障',
          tooltip: '清除故障',
          type: 'danger',
          icon: 'ep:warning',
          permission: BIZ_PERMISSIONS.device.update,
          show: row => row.device_status === 'ERROR',
          onClick: row => actions.clearFault(row),
          popconfirm: {
            title: row => `确认清除 ${row.device_name} 的故障投影？`,
            confirmButtonText: '清除故障',
            confirmButtonType: 'danger'
          }
        },
      ]
    }
  })
}
