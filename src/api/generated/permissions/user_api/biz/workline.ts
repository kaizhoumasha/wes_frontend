/**
 * 自动生成的权限常量定义
 *
 * ⚠️ 请勿手动编辑此文件
 * 此文件由 scripts/generate-permissions.ts 自动生成
 *
 * 权限分组: user_api:biz:workline
 *
 * 更新权限: pnpm generate:permissions -- --backend-root /path/to/wes_backend
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
  /** 批量恢复权限 */
  batchRestore: 'biz:workline:batch_restore',
  /** 批量永久删除权限 */
  batchPermanentDelete: 'biz:workline:batch_permanent_delete',
  /** 启用作业线 */
  activate: 'biz:workline:activate',
  /** 查询作业线当前 active objects */
  activeObjects: 'biz:workline:active-objects',
  /** 人工确认 checklist 后清除工作线急停 */
  clearEstop: 'biz:workline:clear-estop',
  /** 查询作业线配置状态 */
  configurationStatus: 'biz:workline:configuration-status',
  /** 停用作业线 */
  deactivate: 'biz:workline:deactivate',
  /** 永久删除WorkLine */
  permanentDelete: 'biz:workline:permanent_delete',
  /** Replay 历史 Inbox */
  replayInbox: 'biz:workline:replay-inbox',
  /** 提交 EFFECT reconciliation 人工决议 */
  resolveEffectReconciliation: 'biz:workline:resolve-effect-reconciliation',
  /** 解除 runtime reconciliation 隔离，不重发设备命令、不重复执行超时处理、释放安全停靠队列 */
  resolveReconciliation: 'biz:workline:resolve-reconciliation',
  /** 查询沙箱已完成 Outbox */
  sandboxCompleted: 'biz:workline:sandbox-completed',
  /** 查询沙箱待处理 Outbox */
  sandboxPending: 'biz:workline:sandbox-pending',
  /** 沙箱模拟 WorkLine 软件急停冻结 */
  simulateEstop: 'biz:workline:simulate-estop',
  /** 启动 WorkLine 并激活运行代际 */
  start: 'biz:workline:start',
  /** 沙箱模拟 Command ACK */
  submitSandboxAck: 'biz:workline:submit-sandbox-ack',
  /** 沙箱模拟 External HTTP 回调 */
  submitSandboxExternalCallback: 'biz:workline:submit-sandbox-external-callback',
  /** 获取作业线平面静态场景 */
  viewPlaneScene: 'biz:workline:view-plane-scene',
  /** 获取作业线平面动态快照 */
  viewPlaneSnapshot: 'biz:workline:view-plane-snapshot',
} as const
