// ==================== AUTO GENERATED START ====================
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 自动生成的 API 模块
 *
 * ⚠️  请勿手动编辑 AUTO GENERATED 区域
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 资源: /api/v1/workline/inbound-handoff, /api/v1/workline/integration-debug, /api/v1/workline/ng-return-items, /api/v1/workline/operations, /api/v1/workline/plugins, /api/v1/workline/runtime, /api/v1/workline/runtime-holds, /api/v1/workline/trace
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

export type DemandsResult = ContractResponseData<'/api/v1/workline/inbound-handoff/demands', 'get'>
export type DemandsQuery = ContractQueryParams<'/api/v1/workline/inbound-handoff/demands', 'get'>

export type GetDemandsResult = ContractResponseData<'/api/v1/workline/inbound-handoff/demands/{demand_id}', 'get'>
export type GetDemandsPathParams = ContractPathParams<'/api/v1/workline/inbound-handoff/demands/{demand_id}', 'get'>

export type SourceItemsActionsRetrySourcePickResult = ContractResponseData<'/api/v1/workline/inbound-handoff/source-items/{source_item_id}/actions/retry-source-pick', 'post'>
export type SourceItemsActionsRetrySourcePickPathParams = ContractPathParams<'/api/v1/workline/inbound-handoff/source-items/{source_item_id}/actions/retry-source-pick', 'post'>

export type CasesLatestResult = ContractResponseData<'/api/v1/workline/integration-debug/cases/latest', 'get'>
export type CasesLatestQuery = ContractQueryParams<'/api/v1/workline/integration-debug/cases/latest', 'get'>

export type CasesLookupResult = ContractResponseData<'/api/v1/workline/integration-debug/cases/lookup', 'get'>
export type CasesLookupQuery = ContractQueryParams<'/api/v1/workline/integration-debug/cases/lookup', 'get'>

export type NgReturnItemsResult = ContractResponseData<'/api/v1/workline/ng-return-items', 'get'>
export type NgReturnItemsQuery = ContractQueryParams<'/api/v1/workline/ng-return-items', 'get'>

export type SandboxPendingResult = ContractResponseData<'/api/v1/workline/operations/sandbox/pending', 'get'>
export type SandboxPendingQuery = ContractQueryParams<'/api/v1/workline/operations/sandbox/pending', 'get'>

export type SandboxCompletedResult = ContractResponseData<'/api/v1/workline/operations/sandbox/completed', 'get'>
export type SandboxCompletedQuery = ContractQueryParams<'/api/v1/workline/operations/sandbox/completed', 'get'>

export type ReplayInboxesResult = ContractResponseData<'/api/v1/workline/operations/replay/inboxes/{inbox_id}', 'post'>
export type ReplayInboxesPathParams = ContractPathParams<'/api/v1/workline/operations/replay/inboxes/{inbox_id}', 'post'>
export type ReplayInboxesInput = ContractRequestBody<'/api/v1/workline/operations/replay/inboxes/{inbox_id}', 'post'>

export type ReconciliationsSessionsResolveResult = ContractResponseData<'/api/v1/workline/operations/reconciliations/sessions/{session_id}/resolve', 'post'>
export type ReconciliationsSessionsResolvePathParams = ContractPathParams<'/api/v1/workline/operations/reconciliations/sessions/{session_id}/resolve', 'post'>
export type ReconciliationsSessionsResolveInput = ContractRequestBody<'/api/v1/workline/operations/reconciliations/sessions/{session_id}/resolve', 'post'>

export type ManualSessionsResult = ContractResponseData<'/api/v1/workline/operations/manual/sessions/{session_id}', 'post'>
export type ManualSessionsPathParams = ContractPathParams<'/api/v1/workline/operations/manual/sessions/{session_id}', 'post'>
export type ManualSessionsInput = ContractRequestBody<'/api/v1/workline/operations/manual/sessions/{session_id}', 'post'>

export type SandboxWorklinesSimulateEstopResult = ContractResponseData<'/api/v1/workline/operations/sandbox/worklines/{workline_id}/simulate-estop', 'post'>
export type SandboxWorklinesSimulateEstopPathParams = ContractPathParams<'/api/v1/workline/operations/sandbox/worklines/{workline_id}/simulate-estop', 'post'>
export type SandboxWorklinesSimulateEstopInput = ContractRequestBody<'/api/v1/workline/operations/sandbox/worklines/{workline_id}/simulate-estop', 'post'>

export type SandboxWorklinesStartResult = ContractResponseData<'/api/v1/workline/operations/sandbox/worklines/{workline_id}/start', 'post'>
export type SandboxWorklinesStartPathParams = ContractPathParams<'/api/v1/workline/operations/sandbox/worklines/{workline_id}/start', 'post'>
export type SandboxWorklinesStartInput = ContractRequestBody<'/api/v1/workline/operations/sandbox/worklines/{workline_id}/start', 'post'>

export type SafetyWorklinesClearEstopResult = ContractResponseData<'/api/v1/workline/operations/safety/worklines/{workline_id}/clear-estop', 'post'>
export type SafetyWorklinesClearEstopPathParams = ContractPathParams<'/api/v1/workline/operations/safety/worklines/{workline_id}/clear-estop', 'post'>
export type SafetyWorklinesClearEstopInput = ContractRequestBody<'/api/v1/workline/operations/safety/worklines/{workline_id}/clear-estop', 'post'>

export type SandboxEventsResult = ContractResponseData<'/api/v1/workline/operations/sandbox/events', 'post'>
export type SandboxEventsInput = ContractRequestBody<'/api/v1/workline/operations/sandbox/events', 'post'>

export type SandboxAckResult = ContractResponseData<'/api/v1/workline/operations/sandbox/ack', 'post'>
export type SandboxAckInput = ContractRequestBody<'/api/v1/workline/operations/sandbox/ack', 'post'>

export type SandboxExternalCallbacksResult = ContractResponseData<'/api/v1/workline/operations/sandbox/external-callbacks', 'post'>
export type SandboxExternalCallbacksInput = ContractRequestBody<'/api/v1/workline/operations/sandbox/external-callbacks', 'post'>

export type ResultsResult = ContractResponseData<'/api/v1/workline/operations/results', 'post'>
export type ResultsInput = ContractRequestBody<'/api/v1/workline/operations/results', 'post'>

export type SandboxTemplatesResult = ContractResponseData<'/api/v1/workline/operations/sandbox/templates', 'get'>
export type SandboxTemplatesQuery = ContractQueryParams<'/api/v1/workline/operations/sandbox/templates', 'get'>

export type SandboxWorklinesCleanupResult = ContractResponseData<'/api/v1/workline/operations/sandbox/worklines/{workline_id}/cleanup', 'post'>
export type SandboxWorklinesCleanupPathParams = ContractPathParams<'/api/v1/workline/operations/sandbox/worklines/{workline_id}/cleanup', 'post'>
export type SandboxWorklinesCleanupInput = ContractRequestBody<'/api/v1/workline/operations/sandbox/worklines/{workline_id}/cleanup', 'post'>

export type DebugDataWorklinesCleanupResult = ContractResponseData<'/api/v1/workline/operations/debug-data/worklines/{workline_id}/cleanup', 'post'>
export type DebugDataWorklinesCleanupPathParams = ContractPathParams<'/api/v1/workline/operations/debug-data/worklines/{workline_id}/cleanup', 'post'>
export type DebugDataWorklinesCleanupInput = ContractRequestBody<'/api/v1/workline/operations/debug-data/worklines/{workline_id}/cleanup', 'post'>

export type DebugDataCleanupAllResult = ContractResponseData<'/api/v1/workline/operations/debug-data/cleanup-all', 'post'>
export type DebugDataCleanupAllInput = ContractRequestBody<'/api/v1/workline/operations/debug-data/cleanup-all', 'post'>

export type OptionsResult = ContractResponseData<'/api/v1/workline/plugins/options', 'get'>

export type ManifestResult = ContractResponseData<'/api/v1/workline/plugins/{plugin_key}/manifest', 'get'>
export type ManifestPathParams = ContractPathParams<'/api/v1/workline/plugins/{plugin_key}/manifest', 'get'>

export type OverviewResult = ContractResponseData<'/api/v1/workline/runtime/overview', 'get'>
export type OverviewQuery = ContractQueryParams<'/api/v1/workline/runtime/overview', 'get'>

export type WorklinesResult = ContractResponseData<'/api/v1/workline/runtime/worklines', 'get'>
export type WorklinesQuery = ContractQueryParams<'/api/v1/workline/runtime/worklines', 'get'>

export type GetWorklinesResult = ContractResponseData<'/api/v1/workline/runtime/worklines/{workline_id}', 'get'>
export type GetWorklinesPathParams = ContractPathParams<'/api/v1/workline/runtime/worklines/{workline_id}', 'get'>

export type DevicesResult = ContractResponseData<'/api/v1/workline/runtime/devices', 'get'>
export type DevicesQuery = ContractQueryParams<'/api/v1/workline/runtime/devices', 'get'>

export type GetDevicesResult = ContractResponseData<'/api/v1/workline/runtime/devices/{device_id}', 'get'>
export type GetDevicesPathParams = ContractPathParams<'/api/v1/workline/runtime/devices/{device_id}', 'get'>
export type GetDevicesQuery = ContractQueryParams<'/api/v1/workline/runtime/devices/{device_id}', 'get'>

export type SessionsPathResult = ContractResponseData<'/api/v1/workline/runtime/sessions/{session_id}/path', 'get'>
export type SessionsPathPathParams = ContractPathParams<'/api/v1/workline/runtime/sessions/{session_id}/path', 'get'>

export type TracesPathResult = ContractResponseData<'/api/v1/workline/runtime/traces/{trace_id}/path', 'get'>
export type TracesPathPathParams = ContractPathParams<'/api/v1/workline/runtime/traces/{trace_id}/path', 'get'>

export type NgReasonsResult = ContractResponseData<'/api/v1/workline/runtime-holds/ng-reasons', 'get'>
export type NgReasonsQuery = ContractQueryParams<'/api/v1/workline/runtime-holds/ng-reasons', 'get'>

export type RuntimeHoldsResult = ContractResponseData<'/api/v1/workline/runtime-holds', 'get'>
export type RuntimeHoldsQuery = ContractQueryParams<'/api/v1/workline/runtime-holds', 'get'>

export type GetByHoldIdResult = ContractResponseData<'/api/v1/workline/runtime-holds/{hold_id}', 'get'>
export type GetByHoldIdPathParams = ContractPathParams<'/api/v1/workline/runtime-holds/{hold_id}', 'get'>

export type ResolveResult = ContractResponseData<'/api/v1/workline/runtime-holds/{hold_id}/resolve', 'post'>
export type ResolvePathParams = ContractPathParams<'/api/v1/workline/runtime-holds/{hold_id}/resolve', 'post'>
export type ResolveInput = ContractRequestBody<'/api/v1/workline/runtime-holds/{hold_id}/resolve', 'post'>

export type RequestResult = ContractResponseData<'/api/v1/workline/trace/request/{request_id}', 'get'>
export type RequestPathParams = ContractPathParams<'/api/v1/workline/trace/request/{request_id}', 'get'>

export type TraceResult = ContractResponseData<'/api/v1/workline/trace/trace/{trace_id}', 'get'>
export type TracePathParams = ContractPathParams<'/api/v1/workline/trace/trace/{trace_id}', 'get'>

export type BlockingPointResult = ContractResponseData<'/api/v1/workline/trace/{trace_id}/blocking-point', 'get'>
export type BlockingPointPathParams = ContractPathParams<'/api/v1/workline/trace/{trace_id}/blocking-point', 'get'>

export type SessionResult = ContractResponseData<'/api/v1/workline/trace/session/{session_id}', 'get'>
export type SessionPathParams = ContractPathParams<'/api/v1/workline/trace/session/{session_id}', 'get'>

export type CommandResult = ContractResponseData<'/api/v1/workline/trace/command/{command_code}', 'get'>
export type CommandPathParams = ContractPathParams<'/api/v1/workline/trace/command/{command_code}', 'get'>

export type DispatchResult = ContractResponseData<'/api/v1/workline/trace/dispatch/{dispatch_key}', 'get'>
export type DispatchPathParams = ContractPathParams<'/api/v1/workline/trace/dispatch/{dispatch_key}', 'get'>

export type ExchangeResult = ContractResponseData<'/api/v1/workline/trace/exchange/{exchange_request_code}', 'get'>
export type ExchangePathParams = ContractPathParams<'/api/v1/workline/trace/exchange/{exchange_request_code}', 'get'>

export type QueryResult = ContractResponseData<'/api/v1/workline/trace/query', 'post'>
export type QueryInput = ContractRequestBody<'/api/v1/workline/trace/query', 'post'>

export const worklineApiMethods = {
  /**
   * [biz:workline:list] 查询 SMT 入库 handoff demand 列表
   * @endpoint GET /api/v1/workline/inbound-handoff/demands
   * @returns alova method instance
   */
  demands(query?: ContractQueryParams<'/api/v1/workline/inbound-handoff/demands', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/workline/inbound-handoff/demands', { query, config })
  },

  /**
   * [biz:workline:detail] 查询 SMT 入库 handoff demand 详情
   * @endpoint GET /api/v1/workline/inbound-handoff/demands/{demand_id}
   * @returns alova method instance
   */
  getDemands(params: ContractPathParams<'/api/v1/workline/inbound-handoff/demands/{demand_id}', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/workline/inbound-handoff/demands/{demand_id}', { params, config })
  },

  /**
   * [biz:workline:update] 重试 SMT 入库 handoff source-pick
   * @endpoint POST /api/v1/workline/inbound-handoff/source-items/{source_item_id}/actions/retry-source-pick
   * @returns alova method instance
   */
  sourceItemsActionsRetrySourcePick(params: ContractPathParams<'/api/v1/workline/inbound-handoff/source-items/{source_item_id}/actions/retry-source-pick', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/workline/inbound-handoff/source-items/{source_item_id}/actions/retry-source-pick', { params, config })
  },

  /**
   * [biz:workline:list] 查询最新集成调试案件
   * @endpoint GET /api/v1/workline/integration-debug/cases/latest
   * @returns alova method instance
   */
  casesLatest(query?: ContractQueryParams<'/api/v1/workline/integration-debug/cases/latest', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/workline/integration-debug/cases/latest', { query, config })
  },

  /**
   * [biz:workline:list] 按锚点查询集成调试案件
   * @endpoint GET /api/v1/workline/integration-debug/cases/lookup
   * @returns alova method instance
   */
  casesLookup(query?: ContractQueryParams<'/api/v1/workline/integration-debug/cases/lookup', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/workline/integration-debug/cases/lookup', { query, config })
  },

  /**
   * [biz:workline:list-ng-return-item] 查询 NG Return Items
   * @endpoint GET /api/v1/workline/ng-return-items
   * @returns alova method instance
   */
  ngReturnItems(query?: ContractQueryParams<'/api/v1/workline/ng-return-items', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/workline/ng-return-items', { query, config })
  },

  /**
   * [biz:workline:list] 查询沙箱待处理 Outbox
   * @endpoint GET /api/v1/workline/operations/sandbox/pending
   * @returns alova method instance
   */
  sandboxPending(query?: ContractQueryParams<'/api/v1/workline/operations/sandbox/pending', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/workline/operations/sandbox/pending', { query, config })
  },

  /**
   * [biz:workline:list] 查询沙箱已完成 Outbox
   * @endpoint GET /api/v1/workline/operations/sandbox/completed
   * @returns alova method instance
   */
  sandboxCompleted(query?: ContractQueryParams<'/api/v1/workline/operations/sandbox/completed', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/workline/operations/sandbox/completed', { query, config })
  },

  /**
   * [biz:workline:update] Replay 历史 Inbox
   * @endpoint POST /api/v1/workline/operations/replay/inboxes/{inbox_id}
   * @returns alova method instance
   */
  replayInboxes(params: ContractPathParams<'/api/v1/workline/operations/replay/inboxes/{inbox_id}', 'post'>, body: ContractRequestBody<'/api/v1/workline/operations/replay/inboxes/{inbox_id}', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/workline/operations/replay/inboxes/{inbox_id}', { params, body, config })
  },

  /**
   * [biz:workline:resolve-reconciliation] 解除 runtime reconciliation 隔离，不重发设备命令、不调用 timeout 插件处理、释放安全停靠队列
   * @endpoint POST /api/v1/workline/operations/reconciliations/sessions/{session_id}/resolve
   * @returns alova method instance
   */
  reconciliationsSessionsResolve(params: ContractPathParams<'/api/v1/workline/operations/reconciliations/sessions/{session_id}/resolve', 'post'>, body: ContractRequestBody<'/api/v1/workline/operations/reconciliations/sessions/{session_id}/resolve', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/workline/operations/reconciliations/sessions/{session_id}/resolve', { params, body, config })
  },

  /**
   * [biz:workline:update] 创建人工操作
   * @endpoint POST /api/v1/workline/operations/manual/sessions/{session_id}
   * @returns alova method instance
   */
  manualSessions(params: ContractPathParams<'/api/v1/workline/operations/manual/sessions/{session_id}', 'post'>, body: ContractRequestBody<'/api/v1/workline/operations/manual/sessions/{session_id}', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/workline/operations/manual/sessions/{session_id}', { params, body, config })
  },

  /**
   * [biz:workline:update] 沙箱模拟 WorkLine 软件急停冻结
   * @description 沙箱专用安全模拟入口；不通过普通 sandbox event 流。
   * @endpoint POST /api/v1/workline/operations/sandbox/worklines/{workline_id}/simulate-estop
   * @returns alova method instance
   */
  sandboxWorklinesSimulateEstop(params: ContractPathParams<'/api/v1/workline/operations/sandbox/worklines/{workline_id}/simulate-estop', 'post'>, body: ContractRequestBody<'/api/v1/workline/operations/sandbox/worklines/{workline_id}/simulate-estop', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/workline/operations/sandbox/worklines/{workline_id}/simulate-estop', { params, body, config })
  },

  /**
   * [biz:workline:update] 沙箱模拟现场硬件 START
   * @endpoint POST /api/v1/workline/operations/sandbox/worklines/{workline_id}/start
   * @returns alova method instance
   */
  sandboxWorklinesStart(params: ContractPathParams<'/api/v1/workline/operations/sandbox/worklines/{workline_id}/start', 'post'>, body: ContractRequestBody<'/api/v1/workline/operations/sandbox/worklines/{workline_id}/start', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/workline/operations/sandbox/worklines/{workline_id}/start', { params, body, config })
  },

  /**
   * [biz:workline:clear-estop] 人工确认 checklist 后清除工作线急停
   * @endpoint POST /api/v1/workline/operations/safety/worklines/{workline_id}/clear-estop
   * @returns alova method instance
   */
  safetyWorklinesClearEstop(params: ContractPathParams<'/api/v1/workline/operations/safety/worklines/{workline_id}/clear-estop', 'post'>, body: ContractRequestBody<'/api/v1/workline/operations/safety/worklines/{workline_id}/clear-estop', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/workline/operations/safety/worklines/{workline_id}/clear-estop', { params, body, config })
  },

  /**
   * [biz:workline:update] 沙箱发送 Event
   * @endpoint POST /api/v1/workline/operations/sandbox/events
   * @returns alova method instance
   */
  sandboxEvents(body: ContractRequestBody<'/api/v1/workline/operations/sandbox/events', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/workline/operations/sandbox/events', { body, config })
  },

  /**
   * [biz:workline:update] 沙箱模拟 Command ACK
   * @endpoint POST /api/v1/workline/operations/sandbox/ack
   * @returns alova method instance
   */
  sandboxAck(body: ContractRequestBody<'/api/v1/workline/operations/sandbox/ack', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/workline/operations/sandbox/ack', { body, config })
  },

  /**
   * [biz:workline:update] 沙箱模拟 External HTTP 回调
   * @endpoint POST /api/v1/workline/operations/sandbox/external-callbacks
   * @returns alova method instance
   */
  sandboxExternalCallbacks(body: ContractRequestBody<'/api/v1/workline/operations/sandbox/external-callbacks', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/workline/operations/sandbox/external-callbacks', { body, config })
  },

  /**
   * [biz:workline:update] 沙箱模拟 Command Result
   * @endpoint POST /api/v1/workline/operations/results
   * @returns alova method instance
   */
  results(body: ContractRequestBody<'/api/v1/workline/operations/results', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/workline/operations/results', { body, config })
  },

  /**
   * [biz:workline:list] 获取沙箱模板
   * @endpoint GET /api/v1/workline/operations/sandbox/templates
   * @returns alova method instance
   */
  sandboxTemplates(query?: ContractQueryParams<'/api/v1/workline/operations/sandbox/templates', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/workline/operations/sandbox/templates', { query, config })
  },

  /**
   * [biz:workline:cleanup-sandbox] 清理工作线沙箱运行时数据
   * @endpoint POST /api/v1/workline/operations/sandbox/worklines/{workline_id}/cleanup
   * @returns alova method instance
   */
  sandboxWorklinesCleanup(params: ContractPathParams<'/api/v1/workline/operations/sandbox/worklines/{workline_id}/cleanup', 'post'>, body: ContractRequestBody<'/api/v1/workline/operations/sandbox/worklines/{workline_id}/cleanup', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/workline/operations/sandbox/worklines/{workline_id}/cleanup', { params, body, config })
  },

  /**
   * [biz:workline:cleanup-debug-data] 清理工作线调试过程数据
   * @endpoint POST /api/v1/workline/operations/debug-data/worklines/{workline_id}/cleanup
   * @returns alova method instance
   */
  debugDataWorklinesCleanup(params: ContractPathParams<'/api/v1/workline/operations/debug-data/worklines/{workline_id}/cleanup', 'post'>, body: ContractRequestBody<'/api/v1/workline/operations/debug-data/worklines/{workline_id}/cleanup', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/workline/operations/debug-data/worklines/{workline_id}/cleanup', { params, body, config })
  },

  /**
   * [biz:workline:cleanup-debug-data] 清理全部工作线调试过程数据
   * @endpoint POST /api/v1/workline/operations/debug-data/cleanup-all
   * @returns alova method instance
   */
  debugDataCleanupAll(body: ContractRequestBody<'/api/v1/workline/operations/debug-data/cleanup-all', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/workline/operations/debug-data/cleanup-all', { body, config })
  },

  /**
   * [biz:workline:list] 获取作业线插件选项
   * @description 从插件注册表导出作业线插件与契约版本下拉选项。
   * @endpoint GET /api/v1/workline/plugins/options
   * @returns alova method instance
   */
  options(config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/workline/plugins/options', { config })
  },

  /**
   * [biz:workline:list] 获取单个作业线插件 manifest 摘要
   * @description 从插件注册表导出单个作业线插件 manifest 摘要。
   * @endpoint GET /api/v1/workline/plugins/{plugin_key}/manifest
   * @returns alova method instance
   */
  manifest(params: ContractPathParams<'/api/v1/workline/plugins/{plugin_key}/manifest', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/workline/plugins/{plugin_key}/manifest', { params, config })
  },

  /**
   * [biz:workline:list] 运行监控总览
   * @endpoint GET /api/v1/workline/runtime/overview
   * @returns alova method instance
   */
  overview(query?: ContractQueryParams<'/api/v1/workline/runtime/overview', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/workline/runtime/overview', { query, config })
  },

  /**
   * [biz:workline:list] 工作线运行态列表
   * @endpoint GET /api/v1/workline/runtime/worklines
   * @returns alova method instance
   */
  worklines(query?: ContractQueryParams<'/api/v1/workline/runtime/worklines', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/workline/runtime/worklines', { query, config })
  },

  /**
   * [biz:workline:list] 工作线运行态监控投影
   * @endpoint GET /api/v1/workline/runtime/worklines/{workline_id}
   * @returns alova method instance
   */
  getWorklines(params: ContractPathParams<'/api/v1/workline/runtime/worklines/{workline_id}', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/workline/runtime/worklines/{workline_id}', { params, config })
  },

  /**
   * [biz:device:list] 设备运行态列表
   * @endpoint GET /api/v1/workline/runtime/devices
   * @returns alova method instance
   */
  devices(query?: ContractQueryParams<'/api/v1/workline/runtime/devices', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/workline/runtime/devices', { query, config })
  },

  /**
   * [biz:device:list] 设备运行态详情
   * @endpoint GET /api/v1/workline/runtime/devices/{device_id}
   * @returns alova method instance
   */
  getDevices(params: ContractPathParams<'/api/v1/workline/runtime/devices/{device_id}', 'get'>, query?: ContractQueryParams<'/api/v1/workline/runtime/devices/{device_id}', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/workline/runtime/devices/{device_id}', { params, query, config })
  },

  /**
   * [biz:workline:list] Session 设备路径视图
   * @endpoint GET /api/v1/workline/runtime/sessions/{session_id}/path
   * @returns alova method instance
   */
  sessionsPath(params: ContractPathParams<'/api/v1/workline/runtime/sessions/{session_id}/path', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/workline/runtime/sessions/{session_id}/path', { params, config })
  },

  /**
   * [biz:workline:list] Trace 设备路径视图
   * @endpoint GET /api/v1/workline/runtime/traces/{trace_id}/path
   * @returns alova method instance
   */
  tracesPath(params: ContractPathParams<'/api/v1/workline/runtime/traces/{trace_id}/path', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/workline/runtime/traces/{trace_id}/path', { params, config })
  },

  /**
   * [biz:workline:view-runtime-hold] 查询 Runtime Hold NG 原因选项
   * @endpoint GET /api/v1/workline/runtime-holds/ng-reasons
   * @returns alova method instance
   */
  ngReasons(query?: ContractQueryParams<'/api/v1/workline/runtime-holds/ng-reasons', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/workline/runtime-holds/ng-reasons', { query, config })
  },

  /**
   * [biz:workline:view-runtime-hold] 查询 Runtime Hold 列表
   * @endpoint GET /api/v1/workline/runtime-holds
   * @returns alova method instance
   */
  runtimeHolds(query?: ContractQueryParams<'/api/v1/workline/runtime-holds', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/workline/runtime-holds', { query, config })
  },

  /**
   * [biz:workline:view-runtime-hold] 查看 Runtime Hold 明细
   * @endpoint GET /api/v1/workline/runtime-holds/{hold_id}
   * @returns alova method instance
   */
  getByHoldId(params: ContractPathParams<'/api/v1/workline/runtime-holds/{hold_id}', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/workline/runtime-holds/{hold_id}', { params, config })
  },

  /**
   * [biz:workline:resolve-runtime-hold] 解除 Runtime Hold
   * @endpoint POST /api/v1/workline/runtime-holds/{hold_id}/resolve
   * @returns alova method instance
   */
  resolve(params: ContractPathParams<'/api/v1/workline/runtime-holds/{hold_id}/resolve', 'post'>, body: ContractRequestBody<'/api/v1/workline/runtime-holds/{hold_id}/resolve', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/workline/runtime-holds/{hold_id}/resolve', { params, body, config })
  },

  /**
   * [biz:workline:list] 根据 request_id 查询 Trace
   * @endpoint GET /api/v1/workline/trace/request/{request_id}
   * @returns alova method instance
   */
  request(params: ContractPathParams<'/api/v1/workline/trace/request/{request_id}', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/workline/trace/request/{request_id}', { params, config })
  },

  /**
   * [biz:workline:list] 根据 trace_id 查询 Trace
   * @endpoint GET /api/v1/workline/trace/trace/{trace_id}
   * @returns alova method instance
   */
  trace(params: ContractPathParams<'/api/v1/workline/trace/trace/{trace_id}', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/workline/trace/trace/{trace_id}', { params, config })
  },

  /**
   * [biz:workline:list] 查询 Trace 阻塞点诊断卡
   * @endpoint GET /api/v1/workline/trace/{trace_id}/blocking-point
   * @returns alova method instance
   */
  blockingPoint(params: ContractPathParams<'/api/v1/workline/trace/{trace_id}/blocking-point', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/workline/trace/{trace_id}/blocking-point', { params, config })
  },

  /**
   * [biz:workline:list] 根据 session_id 查询 Trace
   * @endpoint GET /api/v1/workline/trace/session/{session_id}
   * @returns alova method instance
   */
  session(params: ContractPathParams<'/api/v1/workline/trace/session/{session_id}', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/workline/trace/session/{session_id}', { params, config })
  },

  /**
   * [biz:workline:list] 根据 command_code 查询 Trace
   * @endpoint GET /api/v1/workline/trace/command/{command_code}
   * @returns alova method instance
   */
  command(params: ContractPathParams<'/api/v1/workline/trace/command/{command_code}', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/workline/trace/command/{command_code}', { params, config })
  },

  /**
   * [biz:workline:list] 根据 dispatch_key 查询 Trace
   * @endpoint GET /api/v1/workline/trace/dispatch/{dispatch_key}
   * @returns alova method instance
   */
  dispatch(params: ContractPathParams<'/api/v1/workline/trace/dispatch/{dispatch_key}', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/workline/trace/dispatch/{dispatch_key}', { params, config })
  },

  /**
   * [biz:workline:list] 根据满箱交换请求编码查询 Trace 与资源证据
   * @endpoint GET /api/v1/workline/trace/exchange/{exchange_request_code}
   * @returns alova method instance
   */
  exchange(params: ContractPathParams<'/api/v1/workline/trace/exchange/{exchange_request_code}', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/workline/trace/exchange/{exchange_request_code}', { params, config })
  },

  /**
   * [biz:workline:list] Trace 列表查询
   * @endpoint POST /api/v1/workline/trace/query
   * @returns alova method instance
   */
  query(body: ContractRequestBody<'/api/v1/workline/trace/query', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/workline/trace/query', { body, config })
  }
}
// ==================== AUTO GENERATED END ====================

// ==================== CUSTOM METHODS START ====================
export interface RuntimeHoldNgReasonsQuery {
  plugin_key?: string | null
  contract_version?: string | null
}

export const runtimeHoldApiMethods = {
  runtimeHoldDetail(holdId: number, config?: ContractRequestConfig) {
    return worklineApiMethods.getByHoldId({ hold_id: holdId }, config)
  },

  resolveRuntimeHold(holdId: number, body: ResolveInput, config?: ContractRequestConfig) {
    return worklineApiMethods.resolve({ hold_id: holdId }, body, config)
  },

  runtimeHoldNgReasons(query?: RuntimeHoldNgReasonsQuery, config?: ContractRequestConfig) {
    return worklineApiMethods.ngReasons(
      query ? { plugin_key: query.plugin_key } : undefined,
      config
    )
  },

  ngReturnItems(query?: NgReturnItemsQuery, config?: ContractRequestConfig) {
    return worklineApiMethods.ngReturnItems(query, config)
  }
}
// ==================== CUSTOM METHODS END ====================

// ==================== CUSTOM CONFIG START ====================

// ==================== CUSTOM CONFIG END ====================
