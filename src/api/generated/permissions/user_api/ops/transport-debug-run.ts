/**
 * 自动生成的权限常量定义
 *
 * ⚠️ 请勿手动编辑此文件
 * 此文件由 scripts/generate-permissions.ts 自动生成
 *
 * 权限分组: user_api:ops:transport-debug-run
 *
 * 更新权限: pnpm generate:permissions
 */

export const OPS_TRANSPORT_DEBUG_RUN_PERMISSION = {
  /** 页面访问权限 */
  page: 'ops:transport-debug-run:list',
  /** 列表查询权限 */
  list: 'ops:transport-debug-run:list',
  /** 安全终止 Transport 自动联调轮次 */
  abort: 'ops:transport-debug-run:abort',
  /** 查询 Transport 自动联调轮次详情 */
  read: 'ops:transport-debug-run:read',
  /** 创建 Transport 自动联调轮次 */
  start: 'ops:transport-debug-run:start',
  /** 实时订阅 Transport 自动联调轮次状态 */
  stream: 'ops:transport-debug-run:stream',
} as const
