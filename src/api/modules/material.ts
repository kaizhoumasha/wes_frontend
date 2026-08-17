// ==================== AUTO GENERATED START ====================
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 自动生成的 API 模块
 *
 * ⚠️  请勿手动编辑 AUTO GENERATED 区域
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 资源: /api/v1/material/material-units
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

export type LocationQueryResult = ContractResponseData<'/api/v1/material/material-units/location-query', 'get'>
export type LocationQueryQuery = ContractQueryParams<'/api/v1/material/material-units/location-query', 'get'>

export const materialApiMethods = {
  /**
   * [biz:material:location-query] 查询物料作业期位置
   * @description 统一 MaterialLocationQuery 入口，API 层只委托查询 service。
   * @endpoint GET /api/v1/material/material-units/location-query
   * @returns alova method instance
   */
  locationQuery(query?: ContractQueryParams<'/api/v1/material/material-units/location-query', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/material/material-units/location-query', { query, config })
  }
}
// ==================== AUTO GENERATED END ====================

// ==================== CUSTOM METHODS START ====================

// ==================== CUSTOM METHODS END ====================

// ==================== CUSTOM CONFIG START ====================

// ==================== CUSTOM CONFIG END ====================
