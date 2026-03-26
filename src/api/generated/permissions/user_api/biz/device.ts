/**
 * 自动生成的权限常量定义
 *
 * ⚠️ 请勿手动编辑此文件
 * 此文件由 scripts/generate-permissions.ts 自动生成
 *
 * 后端目录: /Users/kaizhou/SynologyDrive/works/wes_backend
 * 权限分组: user_api:biz:device
 *
 * 更新权限: pnpm permission:generate
 */

export const BIZ_DEVICE_PERMISSION = {
  /** 页面访问权限 */
  page: 'biz:device:list',
  /** 列表查询权限 */
  list: 'biz:device:list',
  /** 详情查看权限 */
  detail: 'biz:device:detail',
  /** 创建权限 */
  create: 'biz:device:create',
  /** 更新权限 */
  update: 'biz:device:update',
  /** 删除权限 */
  delete: 'biz:device:delete',
  /** 恢复权限 */
  restore: 'biz:device:restore',
  /** 回收站权限 */
  trash: 'biz:device:trash',
} as const
