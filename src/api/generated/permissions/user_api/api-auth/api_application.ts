/**
 * 自动生成的权限常量定义
 *
 * ⚠️ 请勿手动编辑此文件
 * 此文件由 scripts/generate-permissions.ts 自动生成
 *
 * 后端目录: /Users/kaizhou/SynologyDrive/works/wes_backend
 * 权限分组: user_api:api-auth:api_application
 *
 * 更新权限: pnpm permission:generate
 */

export const API_AUTH_API_APPLICATION_PERMISSION = {
  /** 页面访问权限 */
  page: 'api-auth:api_application:list',
  /** 列表查询权限 */
  list: 'api-auth:api_application:list',
  /** 详情查看权限 */
  detail: 'api-auth:api_application:detail',
  /** 创建权限 */
  create: 'api-auth:api_application:create',
  /** 更新权限 */
  update: 'api-auth:api_application:update',
  /** 删除权限 */
  delete: 'api-auth:api_application:delete',
  /** 恢复权限 */
  restore: 'api-auth:api_application:restore',
  /** 回收站权限 */
  trash: 'api-auth:api_application:trash',
  /** 分配权限 */
  assignPermission: 'api-auth:api_application:assign_permission',
  /** 获取系统支持的 API 权限列表 */
  listPermissions: 'api-auth:api_application:list_permissions',
  /** 批量永久删除APIApplication */
  permanentDelete: 'api-auth:api_application:permanent_delete',
  /** 重置应用密钥 */
  resetSecret: 'api-auth:api_application:reset_secret',
  /** 重置应用有效期 */
  resetValidity: 'api-auth:api_application:reset_validity',
  /** 撤销 API 应用 */
  revoke: 'api-auth:api_application:revoke',
  /** 重新扫描并同步 API 权限 */
  syncPermissions: 'api-auth:api_application:sync_permissions',
} as const
