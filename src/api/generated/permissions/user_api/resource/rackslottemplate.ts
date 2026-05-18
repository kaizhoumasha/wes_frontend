/**
 * 自动生成的权限常量定义
 *
 * ⚠️ 请勿手动编辑此文件
 * 此文件由 scripts/generate-permissions.ts 自动生成
 *
 * 后端目录: /Users/kaizhou/SynologyDrive/works/wes_backend
 * 权限分组: user_api:resource:rackslottemplate
 *
 * 更新权限: pnpm generate:permissions
 */

export const RESOURCE_RACKSLOTTEMPLATE_PERMISSION = {
  /** 页面访问权限 */
  page: 'resource:rackslottemplate:list',
  /** 列表查询权限 */
  list: 'resource:rackslottemplate:list',
  /** 详情查看权限 */
  detail: 'resource:rackslottemplate:detail',
  /** 创建权限 */
  create: 'resource:rackslottemplate:create',
  /** 更新权限 */
  update: 'resource:rackslottemplate:update',
  /** 删除权限 */
  delete: 'resource:rackslottemplate:delete',
  /** 恢复权限 */
  restore: 'resource:rackslottemplate:restore',
  /** 回收站权限 */
  trash: 'resource:rackslottemplate:trash',
  /** 批量永久删除RackSlotTemplate */
  permanentDelete: 'resource:rackslottemplate:permanent_delete',
} as const
