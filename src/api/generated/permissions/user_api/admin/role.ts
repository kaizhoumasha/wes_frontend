/**
 * 自动生成的权限常量定义
 *
 * ⚠️ 请勿手动编辑此文件
 * 此文件由 scripts/generate-permissions.ts 自动生成
 *
 * 后端目录: /Users/kaizhou/SynologyDrive/works/wes_backend
 * 权限分组: user_api:admin:role
 *
 * 更新权限: pnpm generate:permissions
 */

export const ADMIN_ROLE_PERMISSION = {
  /** 页面访问权限 */
  page: 'admin:role:list',
  /** 列表查询权限 */
  list: 'admin:role:list',
  /** 详情查看权限 */
  detail: 'admin:role:detail',
  /** 创建权限 */
  create: 'admin:role:create',
  /** 更新权限 */
  update: 'admin:role:update',
  /** 删除权限 */
  delete: 'admin:role:delete',
  /** 恢复权限 */
  restore: 'admin:role:restore',
  /** 回收站权限 */
  trash: 'admin:role:trash',
  /** 批量永久删除Role */
  permanentDelete: 'admin:role:permanent_delete',
} as const
