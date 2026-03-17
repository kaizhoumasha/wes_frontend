/**
 * 自动生成的权限常量定义
 *
 * ⚠️ 请勿手动编辑此文件
 * 此文件由 scripts/generate-permissions.ts 自动生成
 * 生成时间: 2026-03-17T06:32:10.719Z
 *
 * 后端目录: /Users/kaizhou/SynologyDrive/works/wes_backend
 * 权限分组: user_api:admin:role
 *
 * 更新权限: pnpm permission:generate
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
} as const
