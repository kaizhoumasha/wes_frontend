// ==================== AUTO GENERATED START ====================
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 自动生成的 API 模块
 *
 * ⚠️  请勿手动编辑 AUTO GENERATED 区域
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 资源: /api/v1/sys/audit-logs, /api/v1/sys/events
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

export type GetByIdResult = ContractResponseData<'/api/v1/sys/audit-logs/{id}', 'get'>
export type GetByIdPathParams = ContractPathParams<'/api/v1/sys/audit-logs/{id}', 'get'>
export type GetByIdQuery = ContractQueryParams<'/api/v1/sys/audit-logs/{id}', 'get'>

export type QueryResult = ContractResponseData<'/api/v1/sys/audit-logs/query', 'post'>
export type QueryInput = ContractRequestBody<'/api/v1/sys/audit-logs/query', 'post'>

export type StreamResult = ContractResponseData<'/api/v1/sys/events/stream', 'get'>
export type StreamQuery = ContractQueryParams<'/api/v1/sys/events/stream', 'get'>

export const sysApiMethods = {
  /**
   * [sys:auditlog:get] 获取AuditLog
   * @endpoint GET /api/v1/sys/audit-logs/{id}
   * @returns alova method instance
   */
  getById(params: ContractPathParams<'/api/v1/sys/audit-logs/{id}', 'get'>, query?: ContractQueryParams<'/api/v1/sys/audit-logs/{id}', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/sys/audit-logs/{id}', { params, query, config })
  },

  /**
   * [sys:auditlog:list] 获取AuditLog列表
   * @endpoint POST /api/v1/sys/audit-logs/query
   * @returns alova method instance
   */
  query(body: ContractRequestBody<'/api/v1/sys/audit-logs/query', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/sys/audit-logs/query', { body, config })
  },

  /**
   * SSE 实时事件流
   * @description 订阅 SSE 事件流，接收系统通知和业务状态更新
   * @endpoint GET /api/v1/sys/events/stream
   * @returns alova method instance
   */
  stream(query?: ContractQueryParams<'/api/v1/sys/events/stream', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/sys/events/stream', { query, config })
  }
}
// ==================== AUTO GENERATED END ====================

// ==================== CUSTOM METHODS START ====================

// ==================== CUSTOM METHODS END ====================

// ==================== CUSTOM CONFIG START ====================

// ==================== CUSTOM CONFIG END ====================
