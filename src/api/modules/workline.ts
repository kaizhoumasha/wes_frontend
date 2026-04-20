// ==================== AUTO GENERATED START ====================
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 自动生成的 API 模块
 *
 * ⚠️  请勿手动编辑 AUTO GENERATED 区域
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 资源: /api/v1/workline/runtime, /api/v1/workline/trace
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

export type OverviewResult = ContractResponseData<'/api/v1/workline/runtime/overview', 'get'>

export type WorklinesResult = ContractResponseData<'/api/v1/workline/runtime/worklines', 'get'>

export type GetWorklinesResult = ContractResponseData<'/api/v1/workline/runtime/worklines/{workline_id}', 'get'>
export type GetWorklinesPathParams = ContractPathParams<'/api/v1/workline/runtime/worklines/{workline_id}', 'get'>

export type DevicesResult = ContractResponseData<'/api/v1/workline/runtime/devices', 'get'>
export type DevicesQuery = ContractQueryParams<'/api/v1/workline/runtime/devices', 'get'>

export type GetDevicesResult = ContractResponseData<'/api/v1/workline/runtime/devices/{device_id}', 'get'>
export type GetDevicesPathParams = ContractPathParams<'/api/v1/workline/runtime/devices/{device_id}', 'get'>

export type RequestResult = ContractResponseData<'/api/v1/workline/trace/request/{request_id}', 'get'>
export type RequestPathParams = ContractPathParams<'/api/v1/workline/trace/request/{request_id}', 'get'>

export type CorrelationResult = ContractResponseData<'/api/v1/workline/trace/correlation/{correlation_id}', 'get'>
export type CorrelationPathParams = ContractPathParams<'/api/v1/workline/trace/correlation/{correlation_id}', 'get'>

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
   * [biz:workline:list] 运行监控总览
   * @endpoint GET /api/v1/workline/runtime/overview
   * @returns alova method instance
   */
  overview(config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/workline/runtime/overview', { config })
  },

  /**
   * [biz:workline:list] 工作线运行态列表
   * @endpoint GET /api/v1/workline/runtime/worklines
   * @returns alova method instance
   */
  worklines(config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/workline/runtime/worklines', { config })
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
  getDevices(params: ContractPathParams<'/api/v1/workline/runtime/devices/{device_id}', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/workline/runtime/devices/{device_id}', { params, config })
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
   * [biz:workline:list] 根据 correlation_id 查询 Trace
   * @endpoint GET /api/v1/workline/trace/correlation/{correlation_id}
   * @returns alova method instance
   */
  correlation(params: ContractPathParams<'/api/v1/workline/trace/correlation/{correlation_id}', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/workline/trace/correlation/{correlation_id}', { params, config })
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

// ==================== CUSTOM METHODS END ====================

// ==================== CUSTOM CONFIG START ====================

// ==================== CUSTOM CONFIG END ====================
