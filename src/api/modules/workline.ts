// ==================== AUTO GENERATED START ====================
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 自动生成的 API 模块
 *
 * ⚠️  请勿手动编辑 AUTO GENERATED 区域
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 资源: /api/v1/workline/operations, /api/v1/workline/runtime-operations
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

export type ReconciliationsEffectsResolveResult = ContractResponseData<'/api/v1/workline/operations/reconciliations/effects/{dispatch_key}/resolve', 'post'>
export type ReconciliationsEffectsResolvePathParams = ContractPathParams<'/api/v1/workline/operations/reconciliations/effects/{dispatch_key}/resolve', 'post'>
export type ReconciliationsEffectsResolveInput = ContractRequestBody<'/api/v1/workline/operations/reconciliations/effects/{dispatch_key}/resolve', 'post'>

export type SandboxWorklinesSimulateEstopResult = ContractResponseData<'/api/v1/workline/operations/sandbox/worklines/{workline_id}/simulate-estop', 'post'>
export type SandboxWorklinesSimulateEstopPathParams = ContractPathParams<'/api/v1/workline/operations/sandbox/worklines/{workline_id}/simulate-estop', 'post'>
export type SandboxWorklinesSimulateEstopInput = ContractRequestBody<'/api/v1/workline/operations/sandbox/worklines/{workline_id}/simulate-estop', 'post'>

export type SandboxWorklinesStartResult = ContractResponseData<'/api/v1/workline/operations/sandbox/worklines/{workline_id}/start', 'post'>
export type SandboxWorklinesStartPathParams = ContractPathParams<'/api/v1/workline/operations/sandbox/worklines/{workline_id}/start', 'post'>
export type SandboxWorklinesStartInput = ContractRequestBody<'/api/v1/workline/operations/sandbox/worklines/{workline_id}/start', 'post'>

export type SafetyWorklinesClearEstopResult = ContractResponseData<'/api/v1/workline/operations/safety/worklines/{workline_id}/clear-estop', 'post'>
export type SafetyWorklinesClearEstopPathParams = ContractPathParams<'/api/v1/workline/operations/safety/worklines/{workline_id}/clear-estop', 'post'>
export type SafetyWorklinesClearEstopInput = ContractRequestBody<'/api/v1/workline/operations/safety/worklines/{workline_id}/clear-estop', 'post'>

export type SandboxAckResult = ContractResponseData<'/api/v1/workline/operations/sandbox/ack', 'post'>
export type SandboxAckInput = ContractRequestBody<'/api/v1/workline/operations/sandbox/ack', 'post'>

export type SandboxExternalCallbacksResult = ContractResponseData<'/api/v1/workline/operations/sandbox/external-callbacks', 'post'>
export type SandboxExternalCallbacksInput = ContractRequestBody<'/api/v1/workline/operations/sandbox/external-callbacks', 'post'>

export type NorthboundResult = ContractResponseData<'/api/v1/workline/runtime-operations/northbound', 'get'>
export type NorthboundQuery = ContractQueryParams<'/api/v1/workline/runtime-operations/northbound', 'get'>

export const worklineApiMethods = {
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
   * [biz:workline:resolve-reconciliation] 解除 runtime reconciliation 隔离，不重发设备命令、不重复执行超时处理、释放安全停靠队列
   * @endpoint POST /api/v1/workline/operations/reconciliations/sessions/{session_id}/resolve
   * @returns alova method instance
   */
  reconciliationsSessionsResolve(params: ContractPathParams<'/api/v1/workline/operations/reconciliations/sessions/{session_id}/resolve', 'post'>, body: ContractRequestBody<'/api/v1/workline/operations/reconciliations/sessions/{session_id}/resolve', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/workline/operations/reconciliations/sessions/{session_id}/resolve', { params, body, config })
  },

  /**
   * [biz:workline:resolve-reconciliation] 提交 EFFECT reconciliation 人工决议
   * @endpoint POST /api/v1/workline/operations/reconciliations/effects/{dispatch_key}/resolve
   * @returns alova method instance
   */
  reconciliationsEffectsResolve(params: ContractPathParams<'/api/v1/workline/operations/reconciliations/effects/{dispatch_key}/resolve', 'post'>, body: ContractRequestBody<'/api/v1/workline/operations/reconciliations/effects/{dispatch_key}/resolve', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/workline/operations/reconciliations/effects/{dispatch_key}/resolve', { params, body, config })
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
   * [sys:runtime-operations:view] 获取北向 operation 运维快照
   * @description 只允许 Service 读取 owner-scoped 聚合 SLI；不得返回 payload/trace/secret。
   * @endpoint GET /api/v1/workline/runtime-operations/northbound
   * @returns alova method instance
   */
  northbound(query?: ContractQueryParams<'/api/v1/workline/runtime-operations/northbound', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/workline/runtime-operations/northbound', { query, config })
  }
}
// ==================== AUTO GENERATED END ====================

// ==================== CUSTOM METHODS START ====================

// ==================== CUSTOM METHODS END ====================

// ==================== CUSTOM CONFIG START ====================

// ==================== CUSTOM CONFIG END ====================
