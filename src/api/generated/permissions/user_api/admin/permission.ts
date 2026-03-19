/**
 * 自动生成的权限常量定义
 *
 * ⚠️ 请勿手动编辑此文件
 * 此文件由 scripts/generate-permissions.ts 自动生成
 * 生成时间: 2026-03-19T06:59:20.770Z
 *
 * 后端目录: /Users/kaizhou/SynologyDrive/works/wes_backend
 * 权限分组: user_api:admin:permission
 *
 * 更新权限: pnpm permission:generate
 */

export const ADMIN_PERMISSION = {
  /** 页面访问权限 */
  page: 'admin:permission:list',
  /** 列表查询权限 */
  list: 'admin:permission:list',
  /** 视图访问权限 */
  view: 'admin:permission:view',
  /** 详情查看权限 */
  detail: 'admin:permission:detail',
  /** 创建权限 */
  create: 'admin:permission:create',
  /** 更新权限 */
  update: 'admin:permission:update',
  /** 删除权限 */
  delete: 'admin:permission:delete',
  /** 恢复权限 */
  restore: 'admin:permission:restore',
  /** 回收站权限 */
  trash: 'admin:permission:trash',
} as const
