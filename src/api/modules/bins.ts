// ==================== AUTO GENERATED START ====================
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 自动生成的 API 模块
 *
 * ⚠️  请勿手动编辑 AUTO GENERATED 区域
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 资源: /api/v1/resource/bins
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
import { createReadonlyCrudRequestAdapterFromMethods } from '@/api/base/createReadonlyCrudRequestAdapter'

const BINS_COLLECTION_PATH = '/api/v1/resource/bins' as const

type EnsureEntityId<TItem> = TItem extends { id?: infer TId }
  ? Omit<TItem, 'id'> & { id: Exclude<TId, null | undefined> }
  : TItem

export type BinsItem = EnsureEntityId<ContractResponseData<'/api/v1/resource/bins/{id}', 'get'>>
export type ReadonlyInput = Record<string, never>

const baseBinsApiMethods = {
  getById(params: ContractPathParams<'/api/v1/resource/bins/{id}', 'get'>, query?: ContractQueryParams<'/api/v1/resource/bins/{id}', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/resource/bins/{id}', { params, query, config })
  },

  query(body: ContractRequestBody<'/api/v1/resource/bins/query', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/resource/bins/query', { body, config })
  }
}

export const binsApiMethods = {
  ...baseBinsApiMethods,
}

export const binsApi = createReadonlyCrudRequestAdapterFromMethods(binsApiMethods)
// ==================== AUTO GENERATED END ====================

// ==================== CUSTOM METHODS START ====================

// ==================== CUSTOM METHODS END ====================

// ==================== CUSTOM CONFIG START ====================

// ==================== CUSTOM CONFIG END ====================
