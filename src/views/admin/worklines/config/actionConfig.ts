import { BIZ_PERMISSIONS } from '@/api/generated/permissions'
import type { WorkLinesItem as Workline } from '@/api/modules/workLines'
import type { CrudPageRowAction } from '@/components/common/crud-page/types'

export function createWorkLineRowActions(
  openConfig: (workline: Workline) => void,
  openStart: (workline: Workline) => void,
  openBaseConfig: (workline: Workline) => void
): CrudPageRowAction<Workline>[] {
  return [
    {
      key: 'workline-base-configuration',
      label: '基础配置',
      tooltip: '定义工作位并关联物理设备',
      icon: 'lucide:layout-grid',
      type: 'primary',
      priority: 'secondary',
      permission: BIZ_PERMISSIONS.workline.baseConfiguration,
      onClick: openBaseConfig
    },
    {
      key: 'workline-configuration',
      label: '业务装配',
      tooltip: '选择业务插件并绑定本线工作位和设备',
      icon: 'lucide:settings-2',
      type: 'primary',
      priority: 'secondary',
      permission: BIZ_PERMISSIONS.workline.configurationStatus,
      onClick: openConfig
    },
    {
      key: 'workline-start',
      label: '启动',
      tooltip: '按当前业务装配启动工作线',
      icon: 'lucide:play',
      type: 'primary',
      priority: 'primary',
      permission: BIZ_PERMISSIONS.workline.start,
      show: workline => workline.is_active === false,
      onClick: openStart
    }
  ]
}
