import { computed } from 'vue'
import { usePermission } from '@/composables/usePermission'
import { API_AUTH_PERMISSIONS } from '@/api/generated/permissions'
import type { ApplicationsItem as APIApplication } from '@/api/modules/applications'
import type { CrudPageRowAction } from '@/components/common/crud-page/types'

/**
 * 创建 API 应用行操作配置
 * @param openResetSecretDialog 打开重置密钥对话框的回调函数
 */
export function createAPIApplicationRowActions(
  openResetSecretDialog: (app: APIApplication) => void
): CrudPageRowAction<APIApplication>[] {
  const { hasPermission } = usePermission()
  const canResetSecret = computed(() =>
    hasPermission(API_AUTH_PERMISSIONS.apiApplication.resetSecret)
  )

  return [
    {
      key: 'reset-secret',
      label: '重置密钥',
      tooltip: '重置 API 密钥（旧密钥将立即失效）',
      type: 'warning',
      icon: 'lucide:key-round',
      priority: 'secondary',
      disabled: () => !canResetSecret.value,
      popconfirm: {
        title: '确定要重置此应用的密钥吗？旧密钥将立即失效。',
        confirmButtonText: '确定重置',
        cancelButtonText: '取消',
        confirmButtonType: 'warning',
        width: 260
      },
      onClick: app => openResetSecretDialog(app)
    }
  ]
}
