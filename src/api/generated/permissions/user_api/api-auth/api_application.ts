/**
 * 自动生成的权限常量定义
 *
 * ⚠️ 请勿手动编辑此文件
 * 此文件由 scripts/generate-permissions.ts 自动生成
 * 生成时间: 2026-03-17T06:32:10.719Z
 *
 * 后端目录: /Users/kaizhou/SynologyDrive/works/wes_backend
 * 权限分组: user_api:api-auth:api_application
 *
 * 更新权限: pnpm permission:generate
 */

export const API_AUTH_API_APPLICATION_PERMISSION = {
  /** 详情查看权限 */
  detail: 'api-auth:api_application:detail',
  /** 创建权限 */
  create: 'api-auth:api_application:create',
  /** 分配权限 */
  assignPermission: 'api-auth:api_application:assign_permission',
  /** 重置应用密钥 */
  resetSecret: 'api-auth:api_application:reset_secret',
  /** 重置应用有效期 */
  resetValidity: 'api-auth:api_application:reset_validity',
  /** 撤销 API 应用 */
  revoke: 'api-auth:api_application:revoke',
} as const
