import { computed } from 'vue'
import { ADMIN_PERMISSIONS } from '@/api/generated/permissions'
import type { UsersItem as User } from '@/api/modules/users'
import type { CrudPageRowAction } from '@/components/common/crud-page/types'
import { usePermission } from '@/composables/usePermission'

/**
 * 创建用户行操作配置
 * @param openAssignRolesDialog 打开分配角色对话框的回调函数
 * @param openResetPasswordDialog 打开重置密码对话框的回调函数
 */
export function createUserRowActions(
  openAssignRolesDialog: (user: User) => void,
  openResetPasswordDialog: (user: User) => void
): CrudPageRowAction<User>[] {
  const { hasPermission } = usePermission()
  const canResetPassword = computed(() => hasPermission(ADMIN_PERMISSIONS.user.resetPassword))
  const canAssignRoles = computed(() => hasPermission(ADMIN_PERMISSIONS.user.assignRoles))

  return [
    {
      key: 'assign-roles',
      label: '分配角色',
      type: 'primary',
      icon: 'lucide:user-plus',
      priority: 'secondary',
      disabled: () => !canAssignRoles.value,
      onClick: user => openAssignRolesDialog(user)
    },
    {
      key: 'reset-password',
      label: '重置密码',
      type: 'warning',
      icon: 'lucide:key-round',
      priority: 'secondary',
      disabled: () => !canResetPassword.value,
      onClick: user => openResetPasswordDialog(user)
    }
  ]
}
