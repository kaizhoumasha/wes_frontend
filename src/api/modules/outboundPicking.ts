// ==================== AUTO GENERATED START ====================
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 自动生成的 API 模块
 *
 * ⚠️  请勿手动编辑 AUTO GENERATED 区域
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 资源: /api/v1/outbound-picking/tasks
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

export type PlanBlockersApplyCorrectionResult = ContractResponseData<'/api/v1/outbound-picking/tasks/{task_id}/plan-blockers/{blocking_evidence_id}/apply-correction', 'post'>
export type PlanBlockersApplyCorrectionPathParams = ContractPathParams<'/api/v1/outbound-picking/tasks/{task_id}/plan-blockers/{blocking_evidence_id}/apply-correction', 'post'>
export type PlanBlockersApplyCorrectionInput = ContractRequestBody<'/api/v1/outbound-picking/tasks/{task_id}/plan-blockers/{blocking_evidence_id}/apply-correction', 'post'>

export const outboundPickingApiMethods = {
  /**
   * 校验两份计划证据并原子应用修正版本
   * @endpoint POST /api/v1/outbound-picking/tasks/{task_id}/plan-blockers/{blocking_evidence_id}/apply-correction
   * @returns alova method instance
   */
  planBlockersApplyCorrection(params: ContractPathParams<'/api/v1/outbound-picking/tasks/{task_id}/plan-blockers/{blocking_evidence_id}/apply-correction', 'post'>, body: ContractRequestBody<'/api/v1/outbound-picking/tasks/{task_id}/plan-blockers/{blocking_evidence_id}/apply-correction', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/outbound-picking/tasks/{task_id}/plan-blockers/{blocking_evidence_id}/apply-correction', { params, body, config })
  }
}
// ==================== AUTO GENERATED END ====================

// ==================== CUSTOM METHODS START ====================

// ==================== CUSTOM METHODS END ====================

// ==================== CUSTOM CONFIG START ====================

// ==================== CUSTOM CONFIG END ====================
