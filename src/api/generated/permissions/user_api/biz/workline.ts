/**
 * 自动生成的权限常量定义
 *
 * ⚠️ 请勿手动编辑此文件
 * 此文件由 scripts/generate-permissions.ts 自动生成
 * 生成时间: 2026-03-19T06:59:20.770Z
 *
 * 后端目录: /Users/kaizhou/SynologyDrive/works/wes_backend
 * 权限分组: user_api:biz:workline
 *
 * 更新权限: pnpm permission:generate
 */

export const BIZ_WORKLINE_PERMISSION = {
  /** 页面访问权限 */
  page: 'biz:workline:list',
  /** 列表查询权限 */
  list: 'biz:workline:list',
  /** 详情查看权限 */
  detail: 'biz:workline:detail',
  /** 创建权限 */
  create: 'biz:workline:create',
  /** 更新权限 */
  update: 'biz:workline:update',
  /** 删除权限 */
  delete: 'biz:workline:delete',
  /** 恢复权限 */
  restore: 'biz:workline:restore',
  /** 回收站权限 */
  trash: 'biz:workline:trash',
} as const
