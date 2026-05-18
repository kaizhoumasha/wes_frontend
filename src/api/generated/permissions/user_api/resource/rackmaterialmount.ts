/**
 * 自动生成的权限常量定义
 *
 * ⚠️ 请勿手动编辑此文件
 * 此文件由 scripts/generate-permissions.ts 自动生成
 *
 * 后端目录: /Users/kaizhou/SynologyDrive/works/wes_backend
 * 权限分组: user_api:resource:rackmaterialmount
 *
 * 更新权限: pnpm generate:permissions
 */

export const RESOURCE_RACKMATERIALMOUNT_PERMISSION = {
  /** 页面访问权限 */
  page: 'resource:rackmaterialmount:list',
  /** 列表查询权限 */
  list: 'resource:rackmaterialmount:list',
  /** 详情查看权限 */
  detail: 'resource:rackmaterialmount:detail',
  /** 恢复权限 */
  restore: 'resource:rackmaterialmount:restore',
  /** 回收站权限 */
  trash: 'resource:rackmaterialmount:trash',
  /** 批量永久删除RackMaterialMount */
  permanentDelete: 'resource:rackmaterialmount:permanent_delete',
} as const
