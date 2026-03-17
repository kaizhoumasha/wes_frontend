/**
 * 自动生成的权限常量定义
 *
 * ⚠️ 请勿手动编辑此文件
 * 此文件由 scripts/generate-permissions.ts 自动生成
 * 生成时间: 2026-03-17T06:32:10.719Z
 *
 * 后端目录: /Users/kaizhou/SynologyDrive/works/wes_backend
 * 权限分组: user_api:api-auth:apiapplication
 *
 * 更新权限: pnpm permission:generate
 */

export const API_AUTH_APIAPPLICATION_PERMISSION = {
  /** 页面访问权限 */
  page: 'api-auth:apiapplication:list',
  /** 列表查询权限 */
  list: 'api-auth:apiapplication:list',
  /** 详情查看权限 */
  detail: 'api-auth:apiapplication:detail',
  /** 更新权限 */
  update: 'api-auth:apiapplication:update',
  /** 删除权限 */
  delete: 'api-auth:apiapplication:delete',
  /** 恢复权限 */
  restore: 'api-auth:apiapplication:restore',
  /** 回收站权限 */
  trash: 'api-auth:apiapplication:trash',
} as const
