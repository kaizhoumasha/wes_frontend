import { BIZ_PERMISSIONS } from '@/api/generated/permissions'
import type { WorkLinesItem as Workline } from '@/api/modules/workLines'
import type { CrudPageRowAction } from '@/components/common/crud-page/types'

export function createWorkLineRowActions(
  openConfig: (workline: Workline) => void,
  openStart: (workline: Workline) => void,
  archiveOpenWork: (workline: Workline) => void | Promise<void>,
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
    },
    {
      key: 'workline-archive-open-work',
      label: '归档/清线',
      tooltip: '归档当前及全部未闭合任务，立即释放新任务准入',
      icon: 'lucide:archive-x',
      type: 'danger',
      priority: 'secondary',
      permission: BIZ_PERMISSIONS.workline.archiveOpenWork,
      onClick: archiveOpenWork,
      popconfirm: {
        title: workline => `确认清空作业线“${workline.line_name}”的当前及未闭合任务？`,
        confirmButtonText: '确认清线',
        cancelButtonText: '取消',
        confirmButtonType: 'danger',
        width: 320
      }
    }
  ]
}
