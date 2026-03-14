import type { User } from '@/api/modules/user'
import type { TableColumnConfig } from '@/types/table'
import { buildActionsColumn, type ActionButton } from '@/components/ui/table/useTableColumns'

/**
 * 将表格行数据转换为用户类型
 * 注意：这是类型断言函数，调用方需确保传入的 row 实际上是 User 类型
 */
function toUser(row: Record<string, unknown>): User {
  return row as unknown as User
}

/**
 * 构建用户管理表格的操作列
 *
 * @example
 * ```ts
 * const actionsColumn = buildUserActionsColumn({
 *   canEdit: true,
 *   canResetPassword: true,
 *   canDelete: true,
 *   onEdit: (user) => handleEdit(user),
 *   onResetPassword: (user) => handleReset(user),
 *   onDelete: (user) => handleDelete(user),
 *   resetPasswordLoadingUserId: loadingId
 * })
 * ```
 */
export function buildUserActionsColumn(options: {
  canEdit?: boolean
  canResetPassword?: boolean
  canDelete?: boolean
  onEdit?: (user: User) => void
  onResetPassword?: (user: User) => void | Promise<void>
  onDelete?: (user: User) => void
  resetPasswordLoadingUserId?: number | null
}): TableColumnConfig {
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
