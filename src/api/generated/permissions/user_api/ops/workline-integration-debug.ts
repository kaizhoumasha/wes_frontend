/**
 * 自动生成的权限常量定义
 *
 * ⚠️ 请勿手动编辑此文件
 * 此文件由 scripts/generate-permissions.ts 自动生成
 *
 * 权限分组: user_api:ops:workline-integration-debug
 *
 * 更新权限: pnpm generate:permissions
 */

export const OPS_WORKLINE_INTEGRATION_DEBUG_PERMISSION = {
  /** 页面访问权限 */
  page: 'ops:workline-integration-debug:list',
  /** 列表查询权限 */
  list: 'ops:workline-integration-debug:list',
  /** 创建权限 */
  create: 'ops:workline-integration-debug:create',
  /** 请求五层货架入站料箱批次 */
  binInboundBatch: 'ops:workline-integration-debug:bin-inbound-batch',
  /** 请求回流 Bin 的目标槽位 */
  binReturnBatch: 'ops:workline-integration-debug:bin-return-batch',
  /** 绑定已接收的人工 Bin 完成决定 */
  bindCompletion: 'ops:workline-integration-debug:bind-completion',
  /** 绑定 WMS MANUAL PickingTask */
  bindTask: 'ops:workline-integration-debug:bind-task',
  /** 记录双方人工清理并关闭 run */
  close: 'ops:workline-integration-debug:close',
  /** 标记本轮联调完成 */
  complete: 'ops:workline-integration-debug:complete',
  /** 发送完成决定应用结果 Operation */
  completionApplyReport: 'ops:workline-integration-debug:completion-apply-report',
  /** 记录现场步骤人工确认并推进 */
  confirmPhase: 'ops:workline-integration-debug:confirm-phase',
  /** 使用 Run 冻结设备创建 ECS 调试命令 */
  deviceCommand: 'ops:workline-integration-debug:device-command',
  /** 导出 WMS C# 联调证据包 */
  export: 'ops:workline-integration-debug:export',
  /** 记录 point2 实际扫码 */
  point2Scan: 'ops:workline-integration-debug:point2-scan',
  /** 为所选任务发送 PickingTask prepare Operation */
  prepareTask: 'ops:workline-integration-debug:prepare-task',
  /** 请求货架离场目的地 */
  rackDeparture: 'ops:workline-integration-debug:rack-departure',
  /** 查看人工出库联调 run */
  read: 'ops:workline-integration-debug:read',
  /** 刷新 DeviceCommand 权威终态 */
  refreshDevice: 'ops:workline-integration-debug:refresh-device',
  /** 读取已应用的 plan_delta 资源并进入货架搬运 */
  refreshPlan: 'ops:workline-integration-debug:refresh-plan',
  /** 刷新 Transport 权威终态 */
  refreshTransport: 'ops:workline-integration-debug:refresh-transport',
  /** 按持久化 WMS 响应推进联调状态 */
  refreshWms: 'ops:workline-integration-debug:refresh-wms',
  /** 实时订阅人工出库联调状态 */
  stream: 'ops:workline-integration-debug:stream',
  /** 接管联调 run 操作权 */
  takeover: 'ops:workline-integration-debug:takeover',
  /** 请求 PickingTask 完成确认 */
  taskCompletion: 'ops:workline-integration-debug:task-completion',
  /** 模拟或创建真实 Transport 调试动作 */
  transport: 'ops:workline-integration-debug:transport',
  /** 发送人工 Bin 任务准入 Operation */
  workAdmission: 'ops:workline-integration-debug:work-admission',
} as const
