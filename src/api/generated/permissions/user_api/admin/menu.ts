/**
 * 自动生成的权限常量定义
 *
 * ⚠️ 请勿手动编辑此文件
 * 此文件由 scripts/generate-permissions.ts 自动生成
 *
 * 权限分组: user_api:admin:menu
 *
 * 更新权限: pnpm generate:permissions -- --backend-root /path/to/wes_backend
 */

export const ADMIN_MENU_PERMISSION = {
  /** 页面访问权限 */
  page: 'admin:menu:list',
  /** 列表查询权限 */
  list: 'admin:menu:list',
  /** 详情查看权限 */
  detail: 'admin:menu:detail',
  /** 创建权限 */
  create: 'admin:menu:create',
  /** 更新权限 */
  update: 'admin:menu:update',
  /** 删除权限 */
  delete: 'admin:menu:delete',
  /** 恢复权限 */
  restore: 'admin:menu:restore',
  /** 回收站权限 */
  trash: 'admin:menu:trash',
  /** 批量恢复权限 */
  batchRestore: 'admin:menu:batch_restore',
  /** 批量永久删除权限 */
  batchPermanentDelete: 'admin:menu:batch_permanent_delete',
  /** get_ancestors */
  ancestors: 'admin:menu:ancestors',
  /** batch_sort */
  batchSort: 'admin:menu:batch_sort',
  /** get_children */
  children: 'admin:menu:children',
  /** move_node */
  move: 'admin:menu:move',
  /** 永久删除Menu */
  permanentDelete: 'admin:menu:permanent_delete',
  /** get_siblings */
  siblings: 'admin:menu:siblings',
  /** get_tree */
  tree: 'admin:menu:tree',
} as const
