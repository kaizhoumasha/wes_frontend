import { BIZ_PERMISSIONS } from '@/api/generated/permissions'
import type { WorkLinesItem as Workline } from '@/api/modules/workLines'
import type { CrudPageRowAction } from '@/components/common/crud-page/types'

export function createWorkLineRowActions(
  openConfig: (workline: Workline) => void,
  openStart: (workline: Workline) => void,
  hasPermission: (permission: string) => boolean
): CrudPageRowAction<Workline>[] {
  return [
    {
      key: 'workline-configuration',
      label: '配置',
      tooltip: '管理基础资源与业务插件配置',
      icon: 'lucide:settings-2',
      type: 'primary',
      priority: 'secondary',
      permission: BIZ_PERMISSIONS.workline.baseConfiguration,
      show: () => hasPermission(BIZ_PERMISSIONS.device.list),
      onClick: openConfig
    },
    {
      key: 'workline-start',
      label: '启动',
      tooltip: '按已保存配置启用工作线',
      icon: 'lucide:play',
      type: 'primary',
      priority: 'primary',
      permission: BIZ_PERMISSIONS.workline.start,
      show: workline => workline.is_active === false,
      onClick: openStart
    }
  ]
}
