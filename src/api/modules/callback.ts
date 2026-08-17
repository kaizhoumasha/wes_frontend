// ==================== AUTO GENERATED START ====================
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 自动生成的 API 模块
 *
 * ⚠️  请勿手动编辑 AUTO GENERATED 区域
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 资源: /api/v1/callback/event, /api/v1/callback/logs, /api/v1/callback/result
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

export type EventResult = ContractResponseData<'/api/v1/callback/event', 'post'>

export type RequestResult = ContractResponseData<'/api/v1/callback/logs/request/{request_id}', 'get'>
export type RequestPathParams = ContractPathParams<'/api/v1/callback/logs/request/{request_id}', 'get'>

export type TraceResult = ContractResponseData<'/api/v1/callback/logs/trace/{trace_id}', 'get'>
export type TracePathParams = ContractPathParams<'/api/v1/callback/logs/trace/{trace_id}', 'get'>

export type SubjectResult = ContractResponseData<'/api/v1/callback/logs/subject/{subject_code}', 'get'>
export type SubjectPathParams = ContractPathParams<'/api/v1/callback/logs/subject/{subject_code}', 'get'>
export type SubjectQuery = ContractQueryParams<'/api/v1/callback/logs/subject/{subject_code}', 'get'>

export type GetByIdResult = ContractResponseData<'/api/v1/callback/logs/{id}', 'get'>
export type GetByIdPathParams = ContractPathParams<'/api/v1/callback/logs/{id}', 'get'>
export type GetByIdQuery = ContractQueryParams<'/api/v1/callback/logs/{id}', 'get'>

export type QueryResult = ContractResponseData<'/api/v1/callback/logs/query', 'post'>
export type QueryInput = ContractRequestBody<'/api/v1/callback/logs/query', 'post'>

export type ResultResult = ContractResponseData<'/api/v1/callback/result', 'post'>

export const callbackApiMethods = {
  /**
   * Accept Device Event
   * @endpoint POST /api/v1/callback/event
   * @returns alova method instance
   */
  event(config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/callback/event', { config })
  },

  /**
   * [callback:callback_log:detail] 根据请求 ID 查询回调日志
   * @description 根据 request_id 查询单条回调日志记录
   * @endpoint GET /api/v1/callback/logs/request/{request_id}
   * @returns alova method instance
   */
  request(params: ContractPathParams<'/api/v1/callback/logs/request/{request_id}', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/callback/logs/request/{request_id}', { params, config })
  },

  /**
   * [callback:callback_log:list] 根据 Trace ID 查询回调日志
   * @description 根据 trace_id 查询所有相关的回调日志（用于串联整个流程）
   * @endpoint GET /api/v1/callback/logs/trace/{trace_id}
   * @returns alova method instance
   */
  trace(params: ContractPathParams<'/api/v1/callback/logs/trace/{trace_id}', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/callback/logs/trace/{trace_id}', { params, config })
  },

  /**
   * [callback:callback_log:list] 根据回调主体编码查询回调日志
   * @description 查询指定回调主体最近的回调记录。设备回调主体通常是 device_code。
   * @endpoint GET /api/v1/callback/logs/subject/{subject_code}
   * @returns alova method instance
   */
  subject(params: ContractPathParams<'/api/v1/callback/logs/subject/{subject_code}', 'get'>, query?: ContractQueryParams<'/api/v1/callback/logs/subject/{subject_code}', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/callback/logs/subject/{subject_code}', { params, query, config })
  },

  /**
   * [callback:callback_log:detail] 获取CallbackLog
   * @endpoint GET /api/v1/callback/logs/{id}
   * @returns alova method instance
   */
  getById(params: ContractPathParams<'/api/v1/callback/logs/{id}', 'get'>, query?: ContractQueryParams<'/api/v1/callback/logs/{id}', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/callback/logs/{id}', { params, query, config })
  },

  /**
   * [callback:callback_log:list] 获取CallbackLog列表
   * @endpoint POST /api/v1/callback/logs/query
   * @returns alova method instance
   */
  query(body: ContractRequestBody<'/api/v1/callback/logs/query', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/callback/logs/query', { body, config })
  },

  /**
   * Accept Device Result
   * @endpoint POST /api/v1/callback/result
   * @returns alova method instance
   */
  result(config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/callback/result', { config })
  }
}
// ==================== AUTO GENERATED END ====================

// ==================== CUSTOM METHODS START ====================

// ==================== CUSTOM METHODS END ====================

// ==================== CUSTOM CONFIG START ====================

// ==================== CUSTOM CONFIG END ====================
