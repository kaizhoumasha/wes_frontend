/**
 * 自动生成的权限常量定义
 *
 * ⚠️ 请勿手动编辑此文件
 * 此文件由 scripts/generate-permissions.ts 自动生成
 *
 * 后端目录: /Users/kaizhou/SynologyDrive/works/wes_backend
 * 权限分组: user_api:demo:demoproduct
 *
 * 更新权限: pnpm permission:generate
 */

export const DEMO_DEMOPRODUCT_PERMISSION = {
  /** 页面访问权限 */
  page: 'demo:demoproduct:list',
  /** 列表查询权限 */
  list: 'demo:demoproduct:list',
  /** 详情查看权限 */
  detail: 'demo:demoproduct:detail',
  /** 创建权限 */
  create: 'demo:demoproduct:create',
  /** 更新权限 */
  update: 'demo:demoproduct:update',
  /** 删除权限 */
  delete: 'demo:demoproduct:delete',
  /** 恢复权限 */
  restore: 'demo:demoproduct:restore',
  /** 回收站权限 */
  trash: 'demo:demoproduct:trash',
} as const
