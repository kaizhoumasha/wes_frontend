/**
 * 自动生成的权限常量定义
 *
 * ⚠️ 请勿手动编辑此文件
 * 此文件由 scripts/generate-permissions.ts 自动生成
 *
 * 后端目录: /Users/kaizhou/SynologyDrive/works/wes_backend
 * 权限分组: user_api:resource:rackbinmount
 *
 * 更新权限: pnpm generate:permissions
 */

export const RESOURCE_RACKBINMOUNT_PERMISSION = {
  /** 页面访问权限 */
  page: 'resource:rackbinmount:list',
  /** 列表查询权限 */
  list: 'resource:rackbinmount:list',
  /** 详情查看权限 */
  detail: 'resource:rackbinmount:detail',
  /** 恢复权限 */
  restore: 'resource:rackbinmount:restore',
  /** 回收站权限 */
  trash: 'resource:rackbinmount:trash',
  /** 批量永久删除RackBinMount */
  permanentDelete: 'resource:rackbinmount:permanent_delete',
} as const
