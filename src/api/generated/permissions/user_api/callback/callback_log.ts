/**
 * 自动生成的权限常量定义
 *
 * ⚠️ 请勿手动编辑此文件
 * 此文件由 scripts/generate-permissions.ts 自动生成
 *
 * 权限分组: user_api:callback:callback_log
 *
 * 更新权限: pnpm generate:permissions
 */

export const CALLBACK_CALLBACK_LOG_PERMISSION = {
  /** 页面访问权限 */
  page: 'callback:callback_log:list',
  /** 列表查询权限 */
  list: 'callback:callback_log:list',
  /** 详情查看权限 */
  detail: 'callback:callback_log:detail',
  /** 根据请求 ID 查询回调日志 */
  detailByRequestId: 'callback:callback_log:detail-by-request-id',
  /** 根据回调主体编码查询回调日志 */
  listBySubjectCode: 'callback:callback_log:list-by-subject-code',
  /** 根据 Trace ID 查询回调日志 */
  listByTraceId: 'callback:callback_log:list-by-trace-id',
} as const
