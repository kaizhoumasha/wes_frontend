/**
 * 自动生成的权限常量定义
 *
 * ⚠️ 请勿手动编辑此文件
 * 此文件由 scripts/generate-permissions.ts 自动生成
 *
 * 后端目录: /Users/kaizhou/SynologyDrive/works/wes_backend
 * 权限分组: user_api:resource:bin
 *
 * 更新权限: pnpm generate:permissions
 */

export const RESOURCE_BIN_PERMISSION = {
  /** 页面访问权限 */
  page: 'resource:bin:list',
  /** 列表查询权限 */
  list: 'resource:bin:list',
  /** 详情查看权限 */
  detail: 'resource:bin:detail',
  /** 创建权限 */
  create: 'resource:bin:create',
  /** 更新权限 */
  update: 'resource:bin:update',
  /** 删除权限 */
  delete: 'resource:bin:delete',
  /** 恢复权限 */
  restore: 'resource:bin:restore',
  /** 回收站权限 */
  trash: 'resource:bin:trash',
  /** 批量永久删除Bin */
  permanentDelete: 'resource:bin:permanent_delete',
} as const
