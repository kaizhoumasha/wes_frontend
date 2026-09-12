// ==================== AUTO GENERATED START ====================
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 自动生成的 API 模块
 *
 * ⚠️  请勿手动编辑 AUTO GENERATED 区域
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 资源: /api/v1/workline/operations
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

export type WorklinesStartResult = ContractResponseData<'/api/v1/workline/operations/worklines/{workline_id}/start', 'post'>
export type WorklinesStartPathParams = ContractPathParams<'/api/v1/workline/operations/worklines/{workline_id}/start', 'post'>
export type WorklinesStartInput = ContractRequestBody<'/api/v1/workline/operations/worklines/{workline_id}/start', 'post'>

export const worklineApiMethods = {
  /**
   * [biz:workline:start] 启动 WorkLine 当前插件
   * @description 在同一事务内校验版本并启动当前插件。
   * @endpoint POST /api/v1/workline/operations/worklines/{workline_id}/start
   * @returns alova method instance
   */
  worklinesStart(params: ContractPathParams<'/api/v1/workline/operations/worklines/{workline_id}/start', 'post'>, body: ContractRequestBody<'/api/v1/workline/operations/worklines/{workline_id}/start', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/workline/operations/worklines/{workline_id}/start', { params, body, config })
  }
}
// ==================== AUTO GENERATED END ====================

// ==================== CUSTOM METHODS START ====================

// ==================== CUSTOM METHODS END ====================

// ==================== CUSTOM CONFIG START ====================

// ==================== CUSTOM CONFIG END ====================
