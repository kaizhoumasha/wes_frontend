import type { User } from '@/api/modules/user'
import type { TableColumnConfig } from '@/types/table'
import {
  buildActionsColumn,
  type ActionButton
} from '@/components/ui/table/useTableColumns'

interface BuildUserActionsColumnOptions {
  canEdit?: boolean
  canResetPassword?: boolean
  canDelete?: boolean
  onEdit?: (user: User) => void
  onResetPassword?: (user: User) => void | Promise<void>
  onDelete?: (user: User) => void
  resetPasswordLoadingUserId?: number | null
}

function toUser(row: Record<string, unknown>): User {
  return row as unknown as User
}

export function buildUserActionsColumn(
  options: BuildUserActionsColumnOptions
): TableColumnConfig {
  const buttons: ActionButton[] = [
    {
      label: '编辑',
      type: 'primary',
      show: () => Boolean(options.canEdit && options.onEdit),
      onClick: row => options.onEdit?.(toUser(row))
    },
    {
      label: '重置密码',
      type: 'warning',
      show: () => Boolean(options.onResetPassword),
      disabled: () => !options.canResetPassword,
      loading: row => options.resetPasswordLoadingUserId === toUser(row).id,
      onClick: row => options.onResetPassword?.(toUser(row))
    },
    {
      label: '删除',
      type: 'danger',
      show: () => Boolean(options.canDelete && options.onDelete),
      onClick: row => options.onDelete?.(toUser(row))
    }
  ]

  return buildActionsColumn(buttons, {
    field: 'operations',
    width: 220,
    configurable: false,
    hideable: false,
    reorderLocked: true,
    resizable: false
  })
}
