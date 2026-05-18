/**
 * 自动生成的权限常量定义
 *
 * ⚠️ 请勿手动编辑此文件
 * 此文件由 scripts/generate-permissions.ts 自动生成
 *
 * 后端目录: /Users/kaizhou/SynologyDrive/works/wes_backend
 * 权限分组: user_api:resource:executionzone
 *
 * 更新权限: pnpm generate:permissions
 */

export const RESOURCE_EXECUTIONZONE_PERMISSION = {
  /** 页面访问权限 */
  page: 'resource:executionzone:list',
  /** 列表查询权限 */
  list: 'resource:executionzone:list',
  /** 详情查看权限 */
  detail: 'resource:executionzone:detail',
  /** 创建权限 */
  create: 'resource:executionzone:create',
  /** 更新权限 */
  update: 'resource:executionzone:update',
  /** 删除权限 */
  delete: 'resource:executionzone:delete',
  /** 恢复权限 */
  restore: 'resource:executionzone:restore',
  /** 回收站权限 */
  trash: 'resource:executionzone:trash',
  /** 批量永久删除ExecutionZone */
  permanentDelete: 'resource:executionzone:permanent_delete',
} as const
