// ==================== AUTO GENERATED START ====================
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 自动生成的 API 模块
 *
 * ⚠️  请勿手动编辑 AUTO GENERATED 区域
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 资源: /api/v1/transport/debug-runs, /api/v1/transport/debug-tasks, /api/v1/transport/evidences, /api/v1/transport/tasks
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

export type DebugRunsResult = ContractResponseData<'/api/v1/transport/debug-runs', 'get'>
export type DebugRunsQuery = ContractQueryParams<'/api/v1/transport/debug-runs', 'get'>

export type CreateDebugRunsResult = ContractResponseData<'/api/v1/transport/debug-runs', 'post'>
export type CreateDebugRunsInput = ContractRequestBody<'/api/v1/transport/debug-runs', 'post'>

export type StreamResult = ContractResponseData<'/api/v1/transport/debug-runs/stream', 'get'>

export type GetByRunIdResult = ContractResponseData<'/api/v1/transport/debug-runs/{run_id}', 'get'>
export type GetByRunIdPathParams = ContractPathParams<'/api/v1/transport/debug-runs/{run_id}', 'get'>

export type AbortResult = ContractResponseData<'/api/v1/transport/debug-runs/{run_id}/abort', 'post'>
export type AbortPathParams = ContractPathParams<'/api/v1/transport/debug-runs/{run_id}/abort', 'post'>
export type AbortInput = ContractRequestBody<'/api/v1/transport/debug-runs/{run_id}/abort', 'post'>

export type DebugTasksResult = ContractResponseData<'/api/v1/transport/debug-tasks', 'post'>
export type DebugTasksInput = ContractRequestBody<'/api/v1/transport/debug-tasks', 'post'>

export type ResetResult = ContractResponseData<'/api/v1/transport/debug-tasks/{transport_task_id}/reset', 'post'>
export type ResetPathParams = ContractPathParams<'/api/v1/transport/debug-tasks/{transport_task_id}/reset', 'post'>
export type ResetInput = ContractRequestBody<'/api/v1/transport/debug-tasks/{transport_task_id}/reset', 'post'>

export type ResetPreviewResult = ContractResponseData<'/api/v1/transport/debug-tasks/{transport_task_id}/reset-preview', 'get'>
export type ResetPreviewPathParams = ContractPathParams<'/api/v1/transport/debug-tasks/{transport_task_id}/reset-preview', 'get'>

export type GetStreamResult = ContractResponseData<'/api/v1/transport/evidences/stream', 'get'>

export type TasksResult = ContractResponseData<'/api/v1/transport/tasks', 'get'>
export type TasksQuery = ContractQueryParams<'/api/v1/transport/tasks', 'get'>

export type GetByTransportTaskIdResult = ContractResponseData<'/api/v1/transport/tasks/{transport_task_id}', 'get'>
export type GetByTransportTaskIdPathParams = ContractPathParams<'/api/v1/transport/tasks/{transport_task_id}', 'get'>

export const transportApiMethods = {
  /**
   * [ops:transport-debug-run:list] 查询 Transport 自动联调轮次
   * @endpoint GET /api/v1/transport/debug-runs
   * @returns alova method instance
   */
  debugRuns(query?: ContractQueryParams<'/api/v1/transport/debug-runs', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/transport/debug-runs', { query, config })
  },

  /**
   * [ops:transport-debug-run:start] 创建 Transport 自动联调轮次
   * @endpoint POST /api/v1/transport/debug-runs
   * @returns alova method instance
   */
  createDebugRuns(body: ContractRequestBody<'/api/v1/transport/debug-runs', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/transport/debug-runs', { body, config })
  },

  /**
   * [ops:transport-debug-run:stream] 实时订阅 Transport 自动联调轮次状态
   * @endpoint GET /api/v1/transport/debug-runs/stream
   * @returns alova method instance
   */
  stream(config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/transport/debug-runs/stream', { config })
  },

  /**
   * [ops:transport-debug-run:read] 查询 Transport 自动联调轮次详情
   * @endpoint GET /api/v1/transport/debug-runs/{run_id}
   * @returns alova method instance
   */
  getByRunId(params: ContractPathParams<'/api/v1/transport/debug-runs/{run_id}', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/transport/debug-runs/{run_id}', { params, config })
  },

  /**
   * [ops:transport-debug-run:abort] 安全终止 Transport 自动联调轮次
   * @endpoint POST /api/v1/transport/debug-runs/{run_id}/abort
   * @returns alova method instance
   */
  abort(params: ContractPathParams<'/api/v1/transport/debug-runs/{run_id}/abort', 'post'>, body: ContractRequestBody<'/api/v1/transport/debug-runs/{run_id}/abort', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/transport/debug-runs/{run_id}/abort', { params, body, config })
  },

  /**
   * [ops:transport:debug-create] 创建 Transport 调试任务
   * @endpoint POST /api/v1/transport/debug-tasks
   * @returns alova method instance
   */
  debugTasks(body: ContractRequestBody<'/api/v1/transport/debug-tasks', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/transport/debug-tasks', { body, config })
  },

  /**
   * [ops:transport:debug-reset] 清理 Transport 联调任务
   * @endpoint POST /api/v1/transport/debug-tasks/{transport_task_id}/reset
   * @returns alova method instance
   */
  reset(params: ContractPathParams<'/api/v1/transport/debug-tasks/{transport_task_id}/reset', 'post'>, body: ContractRequestBody<'/api/v1/transport/debug-tasks/{transport_task_id}/reset', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/transport/debug-tasks/{transport_task_id}/reset', { params, body, config })
  },

  /**
   * [ops:transport:debug-preview] 预检 Transport 联调任务清理
   * @endpoint GET /api/v1/transport/debug-tasks/{transport_task_id}/reset-preview
   * @returns alova method instance
   */
  resetPreview(params: ContractPathParams<'/api/v1/transport/debug-tasks/{transport_task_id}/reset-preview', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/transport/debug-tasks/{transport_task_id}/reset-preview', { params, config })
  },

  /**
   * [ops:transport-evidence:stream] 实时订阅 WMS Transport callback 与 evidence 应用状态
   * @endpoint GET /api/v1/transport/evidences/stream
   * @returns alova method instance
   */
  getStream(config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/transport/evidences/stream', { config })
  },

  /**
   * [ops:transport-task:list] 查询本地 Transport 任务列表
   * @endpoint GET /api/v1/transport/tasks
   * @returns alova method instance
   */
  tasks(query?: ContractQueryParams<'/api/v1/transport/tasks', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/transport/tasks', { query, config })
  },

  /**
   * [ops:transport-task:read] 查询本地 Transport 任务
   * @endpoint GET /api/v1/transport/tasks/{transport_task_id}
   * @returns alova method instance
   */
  getByTransportTaskId(params: ContractPathParams<'/api/v1/transport/tasks/{transport_task_id}', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/transport/tasks/{transport_task_id}', { params, config })
  }
}
// ==================== AUTO GENERATED END ====================

// ==================== CUSTOM METHODS START ====================
export type DebugRunCreateInput = CreateDebugRunsInput
export type DebugRunResult = GetByRunIdResult
export type DebugRunPage = DebugRunsResult
export type DebugRunAbortInput = AbortInput
// ==================== CUSTOM METHODS END ====================

// ==================== CUSTOM CONFIG START ====================

// ==================== CUSTOM CONFIG END ====================
