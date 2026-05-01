// ==================== AUTO GENERATED START ====================
 
/**
 * 自动生成的 API 模块
 *
 * ⚠️  请勿手动编辑 AUTO GENERATED 区域
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 资源: /api/v1/workline/operations, /api/v1/workline/runtime, /api/v1/workline/trace
 */
import { contractMethods } from '@/api/contract/client'
import { post } from '@/api/client'
import type {
  ContractPathParams,
  ContractQueryParams,
  ContractRequestBody,
  ContractRequestConfig,
  ContractResponseData,
} from '@/api/contract/types'

export type SandboxPendingResult = ContractResponseData<'/api/v1/workline/operations/sandbox/pending', 'get'>
export type SandboxPendingQuery = ContractQueryParams<'/api/v1/workline/operations/sandbox/pending', 'get'>

export type ReplayInboxesResult = ContractResponseData<'/api/v1/workline/operations/replay/inboxes/{inbox_id}', 'post'>
export type ReplayInboxesPathParams = ContractPathParams<'/api/v1/workline/operations/replay/inboxes/{inbox_id}', 'post'>
export type ReplayInboxesInput = ContractRequestBody<'/api/v1/workline/operations/replay/inboxes/{inbox_id}', 'post'>

export type ManualSessionsResult = ContractResponseData<'/api/v1/workline/operations/manual/sessions/{session_id}', 'post'>
export type ManualSessionsPathParams = ContractPathParams<'/api/v1/workline/operations/manual/sessions/{session_id}', 'post'>
export type ManualSessionsInput = ContractRequestBody<'/api/v1/workline/operations/manual/sessions/{session_id}', 'post'>

export type SandboxEventsResult = ContractResponseData<'/api/v1/workline/operations/sandbox/events', 'post'>
export type SandboxEventsInput = ContractRequestBody<'/api/v1/workline/operations/sandbox/events', 'post'>

export type ResultsResult = ContractResponseData<'/api/v1/workline/operations/results', 'post'>
export type ResultsInput = ContractRequestBody<'/api/v1/workline/operations/results', 'post'>

export type SandboxTemplatesResult = ContractResponseData<'/api/v1/workline/operations/sandbox/templates', 'get'>
export type SandboxTemplatesQuery = ContractQueryParams<'/api/v1/workline/operations/sandbox/templates', 'get'>

export type OverviewResult = ContractResponseData<'/api/v1/workline/runtime/overview', 'get'>

export type WorklinesResult = ContractResponseData<'/api/v1/workline/runtime/worklines', 'get'>

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

export type QueryResult = ContractResponseData<'/api/v1/workline/trace/query', 'post'>
export type QueryInput = ContractRequestBody<'/api/v1/workline/trace/query', 'post'>

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
  sandboxCompleted(query?: { limit?: number; workline_id?: number; device_id?: number }, config?: ContractRequestConfig) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (contractMethods as any).get('/api/v1/workline/operations/sandbox/completed', { query, config })
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
   * [biz:workline:update] 创建人工操作
   * @endpoint POST /api/v1/workline/operations/manual/sessions/{session_id}
   * @returns alova method instance
   */
  manualSessions(params: ContractPathParams<'/api/v1/workline/operations/manual/sessions/{session_id}', 'post'>, body: ContractRequestBody<'/api/v1/workline/operations/manual/sessions/{session_id}', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/workline/operations/manual/sessions/{session_id}', { params, body, config })
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
   * [biz:workline:list] 工作线运行态详情
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

type SandboxAckRequest = {
  dispatch_key: string
}

export const sandboxAck = (body: SandboxAckRequest) => {
  return post('/api/v1/workline/operations/sandbox/ack', body)
}

export const sandboxProcess = () => {
  return post('/api/v1/workline/operations/sandbox/process')
}

// ==================== CUSTOM METHODS END ====================

// ==================== CUSTOM CONFIG START ====================

// ==================== CUSTOM CONFIG END ====================
