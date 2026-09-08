// ==================== AUTO GENERATED START ====================
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 自动生成的 API 模块
 *
 * ⚠️  请勿手动编辑 AUTO GENERATED 区域
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 资源: /api/v1/wms-diagnostics/exchanges
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

export type ExchangesResult = ContractResponseData<'/api/v1/wms-diagnostics/exchanges', 'get'>
export type ExchangesQuery = ContractQueryParams<'/api/v1/wms-diagnostics/exchanges', 'get'>

export type StreamResult = ContractResponseData<'/api/v1/wms-diagnostics/exchanges/stream', 'get'>
export type StreamQuery = ContractQueryParams<'/api/v1/wms-diagnostics/exchanges/stream', 'get'>

export type GetByExchangeIdResult = ContractResponseData<'/api/v1/wms-diagnostics/exchanges/{exchange_id}', 'get'>
export type GetByExchangeIdPathParams = ContractPathParams<'/api/v1/wms-diagnostics/exchanges/{exchange_id}', 'get'>

export const wmsDiagnosticsApiMethods = {
  /**
   * [ops:wms-diagnostics:query] 查询近期 WMS 交互
   * @endpoint GET /api/v1/wms-diagnostics/exchanges
   * @returns alova method instance
   */
  exchanges(query?: ContractQueryParams<'/api/v1/wms-diagnostics/exchanges', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/wms-diagnostics/exchanges', { query, config })
  },

  /**
   * [ops:wms-diagnostics:stream] 实时观察 WMS 请求与响应
   * @endpoint GET /api/v1/wms-diagnostics/exchanges/stream
   * @returns alova method instance
   */
  stream(query?: ContractQueryParams<'/api/v1/wms-diagnostics/exchanges/stream', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/wms-diagnostics/exchanges/stream', { query, config })
  },

  /**
   * [ops:wms-diagnostics:read] 查看 WMS 交互详情
   * @endpoint GET /api/v1/wms-diagnostics/exchanges/{exchange_id}
   * @returns alova method instance
   */
  getByExchangeId(params: ContractPathParams<'/api/v1/wms-diagnostics/exchanges/{exchange_id}', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/wms-diagnostics/exchanges/{exchange_id}', { params, config })
  }
}
// ==================== AUTO GENERATED END ====================

// ==================== CUSTOM METHODS START ====================

// ==================== CUSTOM METHODS END ====================

// ==================== CUSTOM CONFIG START ====================

// ==================== CUSTOM CONFIG END ====================
