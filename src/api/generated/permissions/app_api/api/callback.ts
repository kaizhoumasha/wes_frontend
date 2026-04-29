/**
 * 自动生成的权限常量定义
 *
 * ⚠️ 请勿手动编辑此文件
 * 此文件由 scripts/generate-permissions.ts 自动生成
 *
 * 后端目录: /Users/kaizhou/SynologyDrive/works/wes_backend
 * 权限分组: app_api:api:callback
 *
 * 更新权限: pnpm generate:permissions
 */

export const API_CALLBACK_PERMISSION = {
  /** 设备事件上报 */
  event: 'api:callback:event',
  /** 任务结果回传 */
  result: 'api:callback:result',
} as const
