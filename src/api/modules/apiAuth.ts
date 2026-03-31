// ==================== AUTO GENERATED START ====================
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 自动生成的 API 模块
 *
 * ⚠️  请勿手动编辑 AUTO GENERATED 区域
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 资源: /api/v1/api_auth/access-log
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

export type GetByIdResult = ContractResponseData<'/api/v1/api_auth/access-log/{id}', 'get'>
export type GetByIdPathParams = ContractPathParams<'/api/v1/api_auth/access-log/{id}', 'get'>
export type GetByIdQuery = ContractQueryParams<'/api/v1/api_auth/access-log/{id}', 'get'>

export type QueryResult = ContractResponseData<'/api/v1/api_auth/access-log/query', 'post'>
export type QueryInput = ContractRequestBody<'/api/v1/api_auth/access-log/query', 'post'>

export const apiAuthApi = {
  /**
   * [api-auth:apiaccesslog:get] 获取APIAccessLog
   * @endpoint GET /api/v1/api_auth/access-log/{id}
   */
  async getById(params: ContractPathParams<'/api/v1/api_auth/access-log/{id}', 'get'>, query?: ContractQueryParams<'/api/v1/api_auth/access-log/{id}', 'get'>, config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/api_auth/access-log/{id}', 'get'>> {
    return await contractClient.get('/api/v1/api_auth/access-log/{id}', { params, query, config })
  },

  /**
   * [api-auth:apiaccesslog:list] 获取APIAccessLog列表
   * @endpoint POST /api/v1/api_auth/access-log/query
   */
  async query(body: ContractRequestBody<'/api/v1/api_auth/access-log/query', 'post'>, config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/api_auth/access-log/query', 'post'>> {
    return await contractClient.post('/api/v1/api_auth/access-log/query', { body, config })
  }
}
// ==================== AUTO GENERATED END ====================

// ==================== CUSTOM METHODS START ====================

// ==================== CUSTOM METHODS END ====================

// ==================== CUSTOM CONFIG START ====================

// ==================== CUSTOM CONFIG END ====================
