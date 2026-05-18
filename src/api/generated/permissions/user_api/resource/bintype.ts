/**
 * 自动生成的权限常量定义
 *
 * ⚠️ 请勿手动编辑此文件
 * 此文件由 scripts/generate-permissions.ts 自动生成
 *
 * 后端目录: /Users/kaizhou/SynologyDrive/works/wes_backend
 * 权限分组: user_api:resource:bintype
 *
 * 更新权限: pnpm generate:permissions
 */

export const RESOURCE_BINTYPE_PERMISSION = {
  /** 页面访问权限 */
  page: 'resource:bintype:list',
  /** 列表查询权限 */
  list: 'resource:bintype:list',
  /** 详情查看权限 */
  detail: 'resource:bintype:detail',
  /** 创建权限 */
  create: 'resource:bintype:create',
  /** 更新权限 */
  update: 'resource:bintype:update',
  /** 删除权限 */
  delete: 'resource:bintype:delete',
  /** 恢复权限 */
  restore: 'resource:bintype:restore',
  /** 回收站权限 */
  trash: 'resource:bintype:trash',
  /** 批量永久删除BinType */
  permanentDelete: 'resource:bintype:permanent_delete',
} as const
