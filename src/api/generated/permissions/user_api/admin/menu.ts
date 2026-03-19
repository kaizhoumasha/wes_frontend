/**
 * 自动生成的权限常量定义
 *
 * ⚠️ 请勿手动编辑此文件
 * 此文件由 scripts/generate-permissions.ts 自动生成
 * 生成时间: 2026-03-19T06:59:20.770Z
 *
 * 后端目录: /Users/kaizhou/SynologyDrive/works/wes_backend
 * 权限分组: user_api:admin:menu
 *
 * 更新权限: pnpm permission:generate
 */

export const ADMIN_MENU_PERMISSION = {
  /** 页面访问权限 */
  page: 'admin:menu:list',
  /** 列表查询权限 */
  list: 'admin:menu:list',
  /** 视图访问权限 */
  view: 'admin:menu:view',
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
} as const
