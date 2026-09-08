/**
 * 自动生成的权限常量定义
 *
 * ⚠️ 请勿手动编辑此文件
 * 此文件由 scripts/generate-permissions.ts 自动生成
 *
 * 权限分组: user_api:ops:wms-diagnostics
 *
 * 更新权限: pnpm generate:permissions
 */

export const OPS_WMS_DIAGNOSTICS_PERMISSION = {
  /** 查询近期 WMS 交互 */
  query: 'ops:wms-diagnostics:query',
  /** 查看 WMS 交互详情 */
  read: 'ops:wms-diagnostics:read',
  /** 实时观察 WMS 请求与响应 */
  stream: 'ops:wms-diagnostics:stream',
} as const
