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

export type SafetyWorklinesClearEstopResult = ContractResponseData<'/api/v1/workline/operations/safety/worklines/{workline_id}/clear-estop', 'post'>
export type SafetyWorklinesClearEstopPathParams = ContractPathParams<'/api/v1/workline/operations/safety/worklines/{workline_id}/clear-estop', 'post'>
export type SafetyWorklinesClearEstopInput = ContractRequestBody<'/api/v1/workline/operations/safety/worklines/{workline_id}/clear-estop', 'post'>

export type WorklinesStartResult = ContractResponseData<'/api/v1/workline/operations/worklines/{workline_id}/start', 'post'>
export type WorklinesStartPathParams = ContractPathParams<'/api/v1/workline/operations/worklines/{workline_id}/start', 'post'>
export type WorklinesStartInput = ContractRequestBody<'/api/v1/workline/operations/worklines/{workline_id}/start', 'post'>

export const worklineApiMethods = {
  /**
   * [biz:workline:clear-estop] 人工确认 checklist 后清除工作线急停
   * @endpoint POST /api/v1/workline/operations/safety/worklines/{workline_id}/clear-estop
   * @returns alova method instance
   */
  safetyWorklinesClearEstop(params: ContractPathParams<'/api/v1/workline/operations/safety/worklines/{workline_id}/clear-estop', 'post'>, body: ContractRequestBody<'/api/v1/workline/operations/safety/worklines/{workline_id}/clear-estop', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/workline/operations/safety/worklines/{workline_id}/clear-estop', { params, body, config })
  },

  /**
   * [biz:workline:start] 启动 WorkLine 并激活运行代际
   * @description 在一个事务内 replay 或创建完整 LineRunEpoch。
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
