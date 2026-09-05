import { BIZ_PERMISSIONS } from '@/api/generated/permissions'
import type { WorkLinesItem as Workline } from '@/api/modules/workLines'
import type { CrudPageRowAction } from '@/components/common/crud-page/types'

export function createWorkLineRowActions(
  openConfig: (workline: Workline) => void,
  openStart: (workline: Workline) => void
): CrudPageRowAction<Workline>[] {
  return [
    {
      key: 'workline-configuration',
      label: '业务装配',
      tooltip: '选择业务插件并装配设备',
      icon: 'lucide:settings-2',
      type: 'primary',
      priority: 'secondary',
      permission: BIZ_PERMISSIONS.workline.configurationStatus,
      onClick: openConfig
    },
    {
      key: 'workline-start',
      label: '启动',
      tooltip: '创建或重放 WorkLine 运行代际',
      icon: 'lucide:play',
      type: 'primary',
      priority: 'primary',
      permission: BIZ_PERMISSIONS.workline.start,
      show: workline => workline.is_active === true,
      onClick: openStart
    }
  ]
}
