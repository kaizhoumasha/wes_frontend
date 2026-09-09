// ==================== AUTO GENERATED START ====================
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 自动生成的 API 模块
 *
 * ⚠️  请勿手动编辑 AUTO GENERATED 区域
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 资源: /api/v1/workline-integration-debug/runs
 */
import { contractMethods } from '@/api/contract/client'
import type {
  ContractPathParams,
  ContractQueryParams,
  ContractRequestBody,
  ContractRequestConfig,
  ContractResponseData,
} from '@/api/contract/types'
import type { components, paths } from '@/api/generated/openapi-types'

export type RunsResult = ContractResponseData<'/api/v1/workline-integration-debug/runs', 'get'>
export type RunsQuery = ContractQueryParams<'/api/v1/workline-integration-debug/runs', 'get'>

export type CreateRunsResult = ContractResponseData<'/api/v1/workline-integration-debug/runs', 'post'>
export type CreateRunsInput = ContractRequestBody<'/api/v1/workline-integration-debug/runs', 'post'>

export type StreamResult = ContractResponseData<'/api/v1/workline-integration-debug/runs/stream', 'get'>

export type GetByRunIdResult = ContractResponseData<'/api/v1/workline-integration-debug/runs/{run_id}', 'get'>
export type GetByRunIdPathParams = ContractPathParams<'/api/v1/workline-integration-debug/runs/{run_id}', 'get'>

export type BindTaskResult = ContractResponseData<'/api/v1/workline-integration-debug/runs/{run_id}/bind-task', 'post'>
export type BindTaskPathParams = ContractPathParams<'/api/v1/workline-integration-debug/runs/{run_id}/bind-task', 'post'>
export type BindTaskInput = ContractRequestBody<'/api/v1/workline-integration-debug/runs/{run_id}/bind-task', 'post'>

export type CloseResult = ContractResponseData<'/api/v1/workline-integration-debug/runs/{run_id}/close', 'post'>
export type ClosePathParams = ContractPathParams<'/api/v1/workline-integration-debug/runs/{run_id}/close', 'post'>
export type CloseInput = ContractRequestBody<'/api/v1/workline-integration-debug/runs/{run_id}/close', 'post'>

export type CompleteResult = ContractResponseData<'/api/v1/workline-integration-debug/runs/{run_id}/complete', 'post'>
export type CompletePathParams = ContractPathParams<'/api/v1/workline-integration-debug/runs/{run_id}/complete', 'post'>
export type CompleteInput = ContractRequestBody<'/api/v1/workline-integration-debug/runs/{run_id}/complete', 'post'>

export type ConfirmPhaseResult = ContractResponseData<'/api/v1/workline-integration-debug/runs/{run_id}/confirm-phase', 'post'>
export type ConfirmPhasePathParams = ContractPathParams<'/api/v1/workline-integration-debug/runs/{run_id}/confirm-phase', 'post'>
export type ConfirmPhaseInput = ContractRequestBody<'/api/v1/workline-integration-debug/runs/{run_id}/confirm-phase', 'post'>

export type DeviceCommandResult = ContractResponseData<'/api/v1/workline-integration-debug/runs/{run_id}/device-command', 'post'>
export type DeviceCommandPathParams = ContractPathParams<'/api/v1/workline-integration-debug/runs/{run_id}/device-command', 'post'>
export type DeviceCommandInput = ContractRequestBody<'/api/v1/workline-integration-debug/runs/{run_id}/device-command', 'post'>

export type DeviceCommandRefreshResult = ContractResponseData<'/api/v1/workline-integration-debug/runs/{run_id}/device-command/refresh', 'post'>
export type DeviceCommandRefreshPathParams = ContractPathParams<'/api/v1/workline-integration-debug/runs/{run_id}/device-command/refresh', 'post'>
export type DeviceCommandRefreshInput = ContractRequestBody<'/api/v1/workline-integration-debug/runs/{run_id}/device-command/refresh', 'post'>

export type ExportResult = ContractResponseData<'/api/v1/workline-integration-debug/runs/{run_id}/export', 'get'>
export type ExportPathParams = ContractPathParams<'/api/v1/workline-integration-debug/runs/{run_id}/export', 'get'>

export type PlanRefreshResult = ContractResponseData<'/api/v1/workline-integration-debug/runs/{run_id}/plan/refresh', 'post'>
export type PlanRefreshPathParams = ContractPathParams<'/api/v1/workline-integration-debug/runs/{run_id}/plan/refresh', 'post'>
export type PlanRefreshInput = ContractRequestBody<'/api/v1/workline-integration-debug/runs/{run_id}/plan/refresh', 'post'>

export type Point2ScanResult = ContractResponseData<'/api/v1/workline-integration-debug/runs/{run_id}/point2-scan', 'post'>
export type Point2ScanPathParams = ContractPathParams<'/api/v1/workline-integration-debug/runs/{run_id}/point2-scan', 'post'>
export type Point2ScanInput = ContractRequestBody<'/api/v1/workline-integration-debug/runs/{run_id}/point2-scan', 'post'>

export type TakeoverResult = ContractResponseData<'/api/v1/workline-integration-debug/runs/{run_id}/takeover', 'post'>
export type TakeoverPathParams = ContractPathParams<'/api/v1/workline-integration-debug/runs/{run_id}/takeover', 'post'>
export type TakeoverInput = ContractRequestBody<'/api/v1/workline-integration-debug/runs/{run_id}/takeover', 'post'>

export type TransportResult = ContractResponseData<'/api/v1/workline-integration-debug/runs/{run_id}/transport', 'post'>
export type TransportPathParams = ContractPathParams<'/api/v1/workline-integration-debug/runs/{run_id}/transport', 'post'>
export type TransportInput = ContractRequestBody<'/api/v1/workline-integration-debug/runs/{run_id}/transport', 'post'>

export type TransportRefreshResult = ContractResponseData<'/api/v1/workline-integration-debug/runs/{run_id}/transport/refresh', 'post'>
export type TransportRefreshPathParams = ContractPathParams<'/api/v1/workline-integration-debug/runs/{run_id}/transport/refresh', 'post'>
export type TransportRefreshInput = ContractRequestBody<'/api/v1/workline-integration-debug/runs/{run_id}/transport/refresh', 'post'>

export type WmsBinInboundBatchResult = ContractResponseData<'/api/v1/workline-integration-debug/runs/{run_id}/wms/bin-inbound-batch', 'post'>
export type WmsBinInboundBatchPathParams = ContractPathParams<'/api/v1/workline-integration-debug/runs/{run_id}/wms/bin-inbound-batch', 'post'>
export type WmsBinInboundBatchInput = ContractRequestBody<'/api/v1/workline-integration-debug/runs/{run_id}/wms/bin-inbound-batch', 'post'>

export type WmsBinReturnBatchResult = ContractResponseData<'/api/v1/workline-integration-debug/runs/{run_id}/wms/bin-return-batch', 'post'>
export type WmsBinReturnBatchPathParams = ContractPathParams<'/api/v1/workline-integration-debug/runs/{run_id}/wms/bin-return-batch', 'post'>
export type WmsBinReturnBatchInput = ContractRequestBody<'/api/v1/workline-integration-debug/runs/{run_id}/wms/bin-return-batch', 'post'>

export type WmsBindCompletionResult = ContractResponseData<'/api/v1/workline-integration-debug/runs/{run_id}/wms/bind-completion', 'post'>
export type WmsBindCompletionPathParams = ContractPathParams<'/api/v1/workline-integration-debug/runs/{run_id}/wms/bind-completion', 'post'>
export type WmsBindCompletionInput = ContractRequestBody<'/api/v1/workline-integration-debug/runs/{run_id}/wms/bind-completion', 'post'>

export type WmsCompletionApplyReportResult = ContractResponseData<'/api/v1/workline-integration-debug/runs/{run_id}/wms/completion-apply-report', 'post'>
export type WmsCompletionApplyReportPathParams = ContractPathParams<'/api/v1/workline-integration-debug/runs/{run_id}/wms/completion-apply-report', 'post'>
export type WmsCompletionApplyReportInput = ContractRequestBody<'/api/v1/workline-integration-debug/runs/{run_id}/wms/completion-apply-report', 'post'>

export type WmsPrepareResult = ContractResponseData<'/api/v1/workline-integration-debug/runs/{run_id}/wms/prepare', 'post'>
export type WmsPreparePathParams = ContractPathParams<'/api/v1/workline-integration-debug/runs/{run_id}/wms/prepare', 'post'>
export type WmsPrepareInput = ContractRequestBody<'/api/v1/workline-integration-debug/runs/{run_id}/wms/prepare', 'post'>

export type WmsRackDepartureResult = ContractResponseData<'/api/v1/workline-integration-debug/runs/{run_id}/wms/rack-departure', 'post'>
export type WmsRackDeparturePathParams = ContractPathParams<'/api/v1/workline-integration-debug/runs/{run_id}/wms/rack-departure', 'post'>
export type WmsRackDepartureInput = ContractRequestBody<'/api/v1/workline-integration-debug/runs/{run_id}/wms/rack-departure', 'post'>

export type WmsRefreshResult = ContractResponseData<'/api/v1/workline-integration-debug/runs/{run_id}/wms/refresh', 'post'>
export type WmsRefreshPathParams = ContractPathParams<'/api/v1/workline-integration-debug/runs/{run_id}/wms/refresh', 'post'>
export type WmsRefreshInput = ContractRequestBody<'/api/v1/workline-integration-debug/runs/{run_id}/wms/refresh', 'post'>

export type WmsTaskCompletionResult = ContractResponseData<'/api/v1/workline-integration-debug/runs/{run_id}/wms/task-completion', 'post'>
export type WmsTaskCompletionPathParams = ContractPathParams<'/api/v1/workline-integration-debug/runs/{run_id}/wms/task-completion', 'post'>
export type WmsTaskCompletionInput = ContractRequestBody<'/api/v1/workline-integration-debug/runs/{run_id}/wms/task-completion', 'post'>

export type WmsWorkAdmissionResult = ContractResponseData<'/api/v1/workline-integration-debug/runs/{run_id}/wms/work-admission', 'post'>
export type WmsWorkAdmissionPathParams = ContractPathParams<'/api/v1/workline-integration-debug/runs/{run_id}/wms/work-admission', 'post'>
export type WmsWorkAdmissionInput = ContractRequestBody<'/api/v1/workline-integration-debug/runs/{run_id}/wms/work-admission', 'post'>

export const worklineIntegrationDebugApiMethods = {
  /**
   * [ops:workline-integration-debug:read] 查询人工出库联调 run
   * @endpoint GET /api/v1/workline-integration-debug/runs
   * @returns alova method instance
   */
  runs(query?: ContractQueryParams<'/api/v1/workline-integration-debug/runs', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/workline-integration-debug/runs', { query, config })
  },

  /**
   * [ops:workline-integration-debug:operate] 创建人工出库联调 run
   * @endpoint POST /api/v1/workline-integration-debug/runs
   * @returns alova method instance
   */
  createRuns(body: ContractRequestBody<'/api/v1/workline-integration-debug/runs', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/workline-integration-debug/runs', { body, config })
  },

  /**
   * [ops:workline-integration-debug:read] 实时订阅人工出库联调状态
   * @endpoint GET /api/v1/workline-integration-debug/runs/stream
   * @returns alova method instance
   */
  stream(config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/workline-integration-debug/runs/stream', { config })
  },

  /**
   * [ops:workline-integration-debug:read] 查看人工出库联调 run
   * @endpoint GET /api/v1/workline-integration-debug/runs/{run_id}
   * @returns alova method instance
   */
  getByRunId(params: ContractPathParams<'/api/v1/workline-integration-debug/runs/{run_id}', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/workline-integration-debug/runs/{run_id}', { params, config })
  },

  /**
   * [ops:workline-integration-debug:operate] 绑定 WMS MANUAL PickingTask
   * @endpoint POST /api/v1/workline-integration-debug/runs/{run_id}/bind-task
   * @returns alova method instance
   */
  bindTask(params: ContractPathParams<'/api/v1/workline-integration-debug/runs/{run_id}/bind-task', 'post'>, body: ContractRequestBody<'/api/v1/workline-integration-debug/runs/{run_id}/bind-task', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/workline-integration-debug/runs/{run_id}/bind-task', { params, body, config })
  },

  /**
   * [ops:workline-integration-debug:operate] 记录双方人工清理并关闭 run
   * @endpoint POST /api/v1/workline-integration-debug/runs/{run_id}/close
   * @returns alova method instance
   */
  close(params: ContractPathParams<'/api/v1/workline-integration-debug/runs/{run_id}/close', 'post'>, body: ContractRequestBody<'/api/v1/workline-integration-debug/runs/{run_id}/close', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/workline-integration-debug/runs/{run_id}/close', { params, body, config })
  },

  /**
   * [ops:workline-integration-debug:operate] 标记本轮联调完成
   * @endpoint POST /api/v1/workline-integration-debug/runs/{run_id}/complete
   * @returns alova method instance
   */
  complete(params: ContractPathParams<'/api/v1/workline-integration-debug/runs/{run_id}/complete', 'post'>, body: ContractRequestBody<'/api/v1/workline-integration-debug/runs/{run_id}/complete', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/workline-integration-debug/runs/{run_id}/complete', { params, body, config })
  },

  /**
   * [ops:workline-integration-debug:operate] 记录现场步骤人工确认并推进
   * @endpoint POST /api/v1/workline-integration-debug/runs/{run_id}/confirm-phase
   * @returns alova method instance
   */
  confirmPhase(params: ContractPathParams<'/api/v1/workline-integration-debug/runs/{run_id}/confirm-phase', 'post'>, body: ContractRequestBody<'/api/v1/workline-integration-debug/runs/{run_id}/confirm-phase', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/workline-integration-debug/runs/{run_id}/confirm-phase', { params, body, config })
  },

  /**
   * [ops:workline-integration-debug:operate] 使用 Run 冻结设备创建 ECS 调试命令
   * @endpoint POST /api/v1/workline-integration-debug/runs/{run_id}/device-command
   * @returns alova method instance
   */
  deviceCommand(params: ContractPathParams<'/api/v1/workline-integration-debug/runs/{run_id}/device-command', 'post'>, body: ContractRequestBody<'/api/v1/workline-integration-debug/runs/{run_id}/device-command', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/workline-integration-debug/runs/{run_id}/device-command', { params, body, config })
  },

  /**
   * [ops:workline-integration-debug:operate] 刷新 DeviceCommand 权威终态
   * @endpoint POST /api/v1/workline-integration-debug/runs/{run_id}/device-command/refresh
   * @returns alova method instance
   */
  deviceCommandRefresh(params: ContractPathParams<'/api/v1/workline-integration-debug/runs/{run_id}/device-command/refresh', 'post'>, body: ContractRequestBody<'/api/v1/workline-integration-debug/runs/{run_id}/device-command/refresh', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/workline-integration-debug/runs/{run_id}/device-command/refresh', { params, body, config })
  },

  /**
   * [ops:workline-integration-debug:read] 导出 WMS C# 联调证据包
   * @endpoint GET /api/v1/workline-integration-debug/runs/{run_id}/export
   * @returns alova method instance
   */
  export(params: ContractPathParams<'/api/v1/workline-integration-debug/runs/{run_id}/export', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/workline-integration-debug/runs/{run_id}/export', { params, config })
  },

  /**
   * [ops:workline-integration-debug:operate] 读取已应用的 plan_delta 资源并进入货架搬运
   * @endpoint POST /api/v1/workline-integration-debug/runs/{run_id}/plan/refresh
   * @returns alova method instance
   */
  planRefresh(params: ContractPathParams<'/api/v1/workline-integration-debug/runs/{run_id}/plan/refresh', 'post'>, body: ContractRequestBody<'/api/v1/workline-integration-debug/runs/{run_id}/plan/refresh', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/workline-integration-debug/runs/{run_id}/plan/refresh', { params, body, config })
  },

  /**
   * [ops:workline-integration-debug:operate] 记录 point2 实际扫码
   * @endpoint POST /api/v1/workline-integration-debug/runs/{run_id}/point2-scan
   * @returns alova method instance
   */
  point2Scan(params: ContractPathParams<'/api/v1/workline-integration-debug/runs/{run_id}/point2-scan', 'post'>, body: ContractRequestBody<'/api/v1/workline-integration-debug/runs/{run_id}/point2-scan', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/workline-integration-debug/runs/{run_id}/point2-scan', { params, body, config })
  },

  /**
   * [ops:workline-integration-debug:operate] 接管联调 run 操作权
   * @endpoint POST /api/v1/workline-integration-debug/runs/{run_id}/takeover
   * @returns alova method instance
   */
  takeover(params: ContractPathParams<'/api/v1/workline-integration-debug/runs/{run_id}/takeover', 'post'>, body: ContractRequestBody<'/api/v1/workline-integration-debug/runs/{run_id}/takeover', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/workline-integration-debug/runs/{run_id}/takeover', { params, body, config })
  },

  /**
   * [ops:workline-integration-debug:operate] 模拟或创建真实 Transport 调试动作
   * @endpoint POST /api/v1/workline-integration-debug/runs/{run_id}/transport
   * @returns alova method instance
   */
  transport(params: ContractPathParams<'/api/v1/workline-integration-debug/runs/{run_id}/transport', 'post'>, body: ContractRequestBody<'/api/v1/workline-integration-debug/runs/{run_id}/transport', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/workline-integration-debug/runs/{run_id}/transport', { params, body, config })
  },

  /**
   * [ops:workline-integration-debug:operate] 刷新 Transport 权威终态
   * @endpoint POST /api/v1/workline-integration-debug/runs/{run_id}/transport/refresh
   * @returns alova method instance
   */
  transportRefresh(params: ContractPathParams<'/api/v1/workline-integration-debug/runs/{run_id}/transport/refresh', 'post'>, body: ContractRequestBody<'/api/v1/workline-integration-debug/runs/{run_id}/transport/refresh', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/workline-integration-debug/runs/{run_id}/transport/refresh', { params, body, config })
  },

  /**
   * [ops:workline-integration-debug:operate] 请求五层货架入站料箱批次
   * @endpoint POST /api/v1/workline-integration-debug/runs/{run_id}/wms/bin-inbound-batch
   * @returns alova method instance
   */
  wmsBinInboundBatch(params: ContractPathParams<'/api/v1/workline-integration-debug/runs/{run_id}/wms/bin-inbound-batch', 'post'>, body: ContractRequestBody<'/api/v1/workline-integration-debug/runs/{run_id}/wms/bin-inbound-batch', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/workline-integration-debug/runs/{run_id}/wms/bin-inbound-batch', { params, body, config })
  },

  /**
   * [ops:workline-integration-debug:operate] 请求回流 Bin 的目标槽位
   * @endpoint POST /api/v1/workline-integration-debug/runs/{run_id}/wms/bin-return-batch
   * @returns alova method instance
   */
  wmsBinReturnBatch(params: ContractPathParams<'/api/v1/workline-integration-debug/runs/{run_id}/wms/bin-return-batch', 'post'>, body: ContractRequestBody<'/api/v1/workline-integration-debug/runs/{run_id}/wms/bin-return-batch', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/workline-integration-debug/runs/{run_id}/wms/bin-return-batch', { params, body, config })
  },

  /**
   * [ops:workline-integration-debug:operate] 绑定已接收的人工 Bin 完成决定
   * @endpoint POST /api/v1/workline-integration-debug/runs/{run_id}/wms/bind-completion
   * @returns alova method instance
   */
  wmsBindCompletion(params: ContractPathParams<'/api/v1/workline-integration-debug/runs/{run_id}/wms/bind-completion', 'post'>, body: ContractRequestBody<'/api/v1/workline-integration-debug/runs/{run_id}/wms/bind-completion', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/workline-integration-debug/runs/{run_id}/wms/bind-completion', { params, body, config })
  },

  /**
   * [ops:workline-integration-debug:operate] 发送完成决定应用结果 Operation
   * @endpoint POST /api/v1/workline-integration-debug/runs/{run_id}/wms/completion-apply-report
   * @returns alova method instance
   */
  wmsCompletionApplyReport(params: ContractPathParams<'/api/v1/workline-integration-debug/runs/{run_id}/wms/completion-apply-report', 'post'>, body: ContractRequestBody<'/api/v1/workline-integration-debug/runs/{run_id}/wms/completion-apply-report', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/workline-integration-debug/runs/{run_id}/wms/completion-apply-report', { params, body, config })
  },

  /**
   * [ops:workline-integration-debug:operate] 为所选任务发送 PickingTask prepare Operation
   * @endpoint POST /api/v1/workline-integration-debug/runs/{run_id}/wms/prepare
   * @returns alova method instance
   */
  wmsPrepare(params: ContractPathParams<'/api/v1/workline-integration-debug/runs/{run_id}/wms/prepare', 'post'>, body: ContractRequestBody<'/api/v1/workline-integration-debug/runs/{run_id}/wms/prepare', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/workline-integration-debug/runs/{run_id}/wms/prepare', { params, body, config })
  },

  /**
   * [ops:workline-integration-debug:operate] 请求货架离场目的地
   * @endpoint POST /api/v1/workline-integration-debug/runs/{run_id}/wms/rack-departure
   * @returns alova method instance
   */
  wmsRackDeparture(params: ContractPathParams<'/api/v1/workline-integration-debug/runs/{run_id}/wms/rack-departure', 'post'>, body: ContractRequestBody<'/api/v1/workline-integration-debug/runs/{run_id}/wms/rack-departure', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/workline-integration-debug/runs/{run_id}/wms/rack-departure', { params, body, config })
  },

  /**
   * [ops:workline-integration-debug:operate] 按持久化 WMS 响应推进联调状态
   * @endpoint POST /api/v1/workline-integration-debug/runs/{run_id}/wms/refresh
   * @returns alova method instance
   */
  wmsRefresh(params: ContractPathParams<'/api/v1/workline-integration-debug/runs/{run_id}/wms/refresh', 'post'>, body: ContractRequestBody<'/api/v1/workline-integration-debug/runs/{run_id}/wms/refresh', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/workline-integration-debug/runs/{run_id}/wms/refresh', { params, body, config })
  },

  /**
   * [ops:workline-integration-debug:operate] 请求 PickingTask 完成确认
   * @endpoint POST /api/v1/workline-integration-debug/runs/{run_id}/wms/task-completion
   * @returns alova method instance
   */
  wmsTaskCompletion(params: ContractPathParams<'/api/v1/workline-integration-debug/runs/{run_id}/wms/task-completion', 'post'>, body: ContractRequestBody<'/api/v1/workline-integration-debug/runs/{run_id}/wms/task-completion', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/workline-integration-debug/runs/{run_id}/wms/task-completion', { params, body, config })
  },

  /**
   * [ops:workline-integration-debug:operate] 发送人工 Bin 任务准入 Operation
   * @endpoint POST /api/v1/workline-integration-debug/runs/{run_id}/wms/work-admission
   * @returns alova method instance
   */
  wmsWorkAdmission(params: ContractPathParams<'/api/v1/workline-integration-debug/runs/{run_id}/wms/work-admission', 'post'>, body: ContractRequestBody<'/api/v1/workline-integration-debug/runs/{run_id}/wms/work-admission', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/workline-integration-debug/runs/{run_id}/wms/work-admission', { params, body, config })
  }
}
// ==================== AUTO GENERATED END ====================

// ==================== CUSTOM METHODS START ====================

// ==================== CUSTOM METHODS END ====================

// ==================== CUSTOM CONFIG START ====================

// ==================== CUSTOM CONFIG END ====================
