/**
 * 自动生成的权限常量定义
 *
 * ⚠️ 请勿手动编辑此文件
 * 此文件由 scripts/generate-permissions.ts 自动生成
 *
 * 后端目录: /Users/kaizhou/SynologyDrive/works/wes_backend
 * 权限分组: user_api:resource:binslottemplate
 *
 * 更新权限: pnpm generate:permissions
 */

export const RESOURCE_BINSLOTTEMPLATE_PERMISSION = {
  /** 页面访问权限 */
  page: 'resource:binslottemplate:list',
  /** 列表查询权限 */
  list: 'resource:binslottemplate:list',
  /** 详情查看权限 */
  detail: 'resource:binslottemplate:detail',
  /** 创建权限 */
  create: 'resource:binslottemplate:create',
  /** 更新权限 */
  update: 'resource:binslottemplate:update',
  /** 删除权限 */
  delete: 'resource:binslottemplate:delete',
  /** 恢复权限 */
  restore: 'resource:binslottemplate:restore',
  /** 回收站权限 */
  trash: 'resource:binslottemplate:trash',
  /** 批量永久删除BinSlotTemplate */
  permanentDelete: 'resource:binslottemplate:permanent_delete',
} as const
