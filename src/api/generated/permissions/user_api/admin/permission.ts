/**
 * 自动生成的权限常量定义
 *
 * ⚠️ 请勿手动编辑此文件
 * 此文件由 scripts/generate-permissions.ts 自动生成
 *
 * 权限分组: user_api:admin:permission
 *
 * 更新权限: pnpm generate:permissions
 */

export const ADMIN_PERMISSION = {
  /** 页面访问权限 */
  page: 'admin:permission:list',
  /** 列表查询权限 */
  list: 'admin:permission:list',
  /** 详情查看权限 */
  detail: 'admin:permission:detail',
  /** get_ancestors */
  ancestors: 'admin:permission:ancestors',
  /** get_children */
  children: 'admin:permission:children',
  /** get_siblings */
  siblings: 'admin:permission:siblings',
  /** get_tree */
  tree: 'admin:permission:tree',
} as const
