/**
 * 自动生成的权限常量定义
 *
 * ⚠️ 请勿手动编辑此文件
 * 此文件由 scripts/generate-permissions.ts 自动生成
 *
 * 权限分组: user_api:ops:transport
 *
 * 更新权限: pnpm generate:permissions
 */

export const OPS_TRANSPORT_PERMISSION = {
  /** 创建 Transport 调试任务 */
  debugCreate: 'ops:transport:debug-create',
  /** 预检 Transport 联调任务清理 */
  debugPreview: 'ops:transport:debug-preview',
  /** 清理 Transport 联调任务 */
  debugReset: 'ops:transport:debug-reset',
} as const
