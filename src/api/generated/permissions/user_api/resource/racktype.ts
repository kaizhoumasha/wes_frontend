/**
 * 自动生成的权限常量定义
 *
 * ⚠️ 请勿手动编辑此文件
 * 此文件由 scripts/generate-permissions.ts 自动生成
 *
 * 后端目录: /Users/kaizhou/SynologyDrive/works/wes_backend
 * 权限分组: user_api:resource:racktype
 *
 * 更新权限: pnpm generate:permissions
 */

export const RESOURCE_RACKTYPE_PERMISSION = {
  /** 页面访问权限 */
  page: 'resource:racktype:list',
  /** 列表查询权限 */
  list: 'resource:racktype:list',
  /** 详情查看权限 */
  detail: 'resource:racktype:detail',
  /** 创建权限 */
  create: 'resource:racktype:create',
  /** 更新权限 */
  update: 'resource:racktype:update',
  /** 删除权限 */
  delete: 'resource:racktype:delete',
  /** 恢复权限 */
  restore: 'resource:racktype:restore',
  /** 回收站权限 */
  trash: 'resource:racktype:trash',
  /** 批量永久删除RackType */
  permanentDelete: 'resource:racktype:permanent_delete',
} as const
