/**
 * 自动生成的权限常量定义
 *
 * ⚠️ 请勿手动编辑此文件
 * 此文件由 scripts/generate-permissions.ts 自动生成
 *
 * 后端目录: /Users/kaizhou/SynologyDrive/works/wes_backend
 * 权限分组: user_api:biz:workline
 *
 * 更新权限: pnpm generate:permissions
 */

export const BIZ_WORKLINE_PERMISSION = {
  /** 页面访问权限 */
  page: 'biz:workline:list',
  /** 列表查询权限 */
  list: 'biz:workline:list',
  /** 详情查看权限 */
  detail: 'biz:workline:detail',
  /** 创建权限 */
  create: 'biz:workline:create',
  /** 更新权限 */
  update: 'biz:workline:update',
  /** 删除权限 */
  delete: 'biz:workline:delete',
  /** 恢复权限 */
  restore: 'biz:workline:restore',
  /** 回收站权限 */
  trash: 'biz:workline:trash',
  /** 启用作业线 */
  activate: 'biz:workline:activate',
  /** 清理工作线调试过程数据 */
  cleanupDebugData: 'biz:workline:cleanup-debug-data',
  /** 清理工作线沙箱运行时数据 */
  cleanupSandbox: 'biz:workline:cleanup-sandbox',
  /** 人工确认 checklist 后清除工作线急停 */
  clearEstop: 'biz:workline:clear-estop',
  /** 停用作业线 */
  deactivate: 'biz:workline:deactivate',
  /** 查询 NG Return Items */
  listNgReturnItem: 'biz:workline:list-ng-return-item',
  /** 批量永久删除WorkLine */
  permanentDelete: 'biz:workline:permanent_delete',
  /** 解除 runtime reconciliation 隔离，不重发设备命令、不调用 timeout 插件处理、释放安全停靠队列 */
  resolveReconciliation: 'biz:workline:resolve-reconciliation',
  /** 解除 Runtime Hold */
  resolveRuntimeHold: 'biz:workline:resolve-runtime-hold',
  /** 查询 Runtime Hold NG 原因选项 */
  viewRuntimeHold: 'biz:workline:view-runtime-hold',
} as const
