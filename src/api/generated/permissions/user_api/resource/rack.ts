/**
 * 自动生成的权限常量定义
 *
 * ⚠️ 请勿手动编辑此文件
 * 此文件由 scripts/generate-permissions.ts 自动生成
 *
 * 后端目录: /Users/kaizhou/SynologyDrive/works/wes_backend
 * 权限分组: user_api:resource:rack
 *
 * 更新权限: pnpm generate:permissions
 */

export const RESOURCE_RACK_PERMISSION = {
  /** 页面访问权限 */
  page: 'resource:rack:list',
  /** 列表查询权限 */
  list: 'resource:rack:list',
  /** 详情查看权限 */
  detail: 'resource:rack:detail',
  /** 创建权限 */
  create: 'resource:rack:create',
  /** 更新权限 */
  update: 'resource:rack:update',
  /** 删除权限 */
  delete: 'resource:rack:delete',
  /** 恢复权限 */
  restore: 'resource:rack:restore',
  /** 回收站权限 */
  trash: 'resource:rack:trash',
  /** 批量永久删除Rack */
  permanentDelete: 'resource:rack:permanent_delete',
} as const
