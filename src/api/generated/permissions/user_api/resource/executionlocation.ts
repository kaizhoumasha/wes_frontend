/**
 * 自动生成的权限常量定义
 *
 * ⚠️ 请勿手动编辑此文件
 * 此文件由 scripts/generate-permissions.ts 自动生成
 *
 * 后端目录: /Users/kaizhou/SynologyDrive/works/wes_backend
 * 权限分组: user_api:resource:executionlocation
 *
 * 更新权限: pnpm generate:permissions
 */

export const RESOURCE_EXECUTIONLOCATION_PERMISSION = {
  /** 页面访问权限 */
  page: 'resource:executionlocation:list',
  /** 列表查询权限 */
  list: 'resource:executionlocation:list',
  /** 详情查看权限 */
  detail: 'resource:executionlocation:detail',
  /** 创建权限 */
  create: 'resource:executionlocation:create',
  /** 更新权限 */
  update: 'resource:executionlocation:update',
  /** 删除权限 */
  delete: 'resource:executionlocation:delete',
  /** 恢复权限 */
  restore: 'resource:executionlocation:restore',
  /** 回收站权限 */
  trash: 'resource:executionlocation:trash',
  /** 批量永久删除ExecutionLocation */
  permanentDelete: 'resource:executionlocation:permanent_delete',
} as const
