// ==================== AUTO GENERATED START ====================
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 自动生成的 API 模块
 *
 * ⚠️  请勿手动编辑 AUTO GENERATED 区域
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 资源: /api/v1/callback/event, /api/v1/callback/external, /api/v1/callback/logs, /api/v1/callback/result
 */
import { contractClient } from '@/api/contract/client'
import type {
  ContractPathParams,
  ContractQueryParams,
  ContractRequestBody,
  ContractRequestConfig,
  ContractResponseData,
} from '@/api/contract/types'
import type { components, paths } from '@/api/generated/openapi-types'

export type EventResult = ContractResponseData<'/api/v1/callback/event', 'post'>

export type ExternalResult = ContractResponseData<'/api/v1/callback/external', 'post'>

export type RequestResult = ContractResponseData<'/api/v1/callback/logs/request/{request_id}', 'get'>
export type RequestPathParams = ContractPathParams<'/api/v1/callback/logs/request/{request_id}', 'get'>

export type CorrelationResult = ContractResponseData<'/api/v1/callback/logs/correlation/{correlation_id}', 'get'>
export type CorrelationPathParams = ContractPathParams<'/api/v1/callback/logs/correlation/{correlation_id}', 'get'>

export type DeviceResult = ContractResponseData<'/api/v1/callback/logs/device/{device_id}', 'get'>
export type DevicePathParams = ContractPathParams<'/api/v1/callback/logs/device/{device_id}', 'get'>
export type DeviceQuery = ContractQueryParams<'/api/v1/callback/logs/device/{device_id}', 'get'>

export type QueryResult = ContractResponseData<'/api/v1/callback/logs/query', 'post'>
export type QueryQuery = ContractQueryParams<'/api/v1/callback/logs/query', 'post'>
export type QueryInput = ContractRequestBody<'/api/v1/callback/logs/query', 'post'>

export type ResultResult = ContractResponseData<'/api/v1/callback/result', 'post'>

export const callbackApi = {
  /**
   * 设备事件上报
   * @description 设备发生状态变更或传感器触发业务信号时，调用此接口上报事件（白皮书 3.2.2）
   * @endpoint POST /api/v1/callback/event
   */
  async event(config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/callback/event', 'post'>> {
    return await contractClient.post('/api/v1/callback/event', { config })
  },

  /**
   * 外部系统回调
   * @description 库位分配、AGV 等外部系统异步回调入口
   * @endpoint POST /api/v1/callback/external
   */
  async external(config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/callback/external', 'post'>> {
    return await contractClient.post('/api/v1/callback/external', { config })
  },

  /**
   * 根据请求 ID 查询回调日志
   * @description 根据 request_id 查询单条回调日志记录
   * @endpoint GET /api/v1/callback/logs/request/{request_id}
   */
  async request(params: ContractPathParams<'/api/v1/callback/logs/request/{request_id}', 'get'>, config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/callback/logs/request/{request_id}', 'get'>> {
    return await contractClient.get('/api/v1/callback/logs/request/{request_id}', { params, config })
  },

  /**
   * 根据关联 ID 查询回调日志
   * @description 根据 correlation_id 查询所有相关的回调日志（用于串联整个流程）
   * @endpoint GET /api/v1/callback/logs/correlation/{correlation_id}
   */
  async correlation(params: ContractPathParams<'/api/v1/callback/logs/correlation/{correlation_id}', 'get'>, config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/callback/logs/correlation/{correlation_id}', 'get'>> {
    return await contractClient.get('/api/v1/callback/logs/correlation/{correlation_id}', { params, config })
  },

  /**
   * 根据设备 ID 查询回调日志
   * @description 查询指定设备最近的回调记录
   * @endpoint GET /api/v1/callback/logs/device/{device_id}
   */
  async device(params: ContractPathParams<'/api/v1/callback/logs/device/{device_id}', 'get'>, query?: ContractQueryParams<'/api/v1/callback/logs/device/{device_id}', 'get'>, config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/callback/logs/device/{device_id}', 'get'>> {
    return await contractClient.get('/api/v1/callback/logs/device/{device_id}', { params, query, config })
  },

  /**
   * 回调日志列表查询
   * @description 通用列表查询接口，支持分页、过滤和排序
   * @endpoint POST /api/v1/callback/logs/query
   */
  async query(body: ContractRequestBody<'/api/v1/callback/logs/query', 'post'>, query?: ContractQueryParams<'/api/v1/callback/logs/query', 'post'>, config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/callback/logs/query', 'post'>> {
    return await contractClient.post('/api/v1/callback/logs/query', { body, query, config })
  },

  /**
   * 任务结果回传
   * @description 设备完成指令后，调用此接口回传执行结果
   * @endpoint POST /api/v1/callback/result
   */
  async result(config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/callback/result', 'post'>> {
    return await contractClient.post('/api/v1/callback/result', { config })
  }
}
// ==================== AUTO GENERATED END ====================

// ==================== CUSTOM METHODS START ====================

// ==================== CUSTOM METHODS END ====================

// ==================== CUSTOM CONFIG START ====================

// ==================== CUSTOM CONFIG END ====================
