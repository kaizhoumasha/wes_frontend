// ==================== AUTO GENERATED START ====================
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 自动生成的 API 模块
 *
 * ⚠️  请勿手动编辑 AUTO GENERATED 区域
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 资源: /api/v1/resource/rack-bin-mounts
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

const RACK_BIN_MOUNTS_COLLECTION_PATH = '/api/v1/resource/rack-bin-mounts' as const

type EnsureEntityId<TItem> = TItem extends { id?: infer TId }
  ? Omit<TItem, 'id'> & { id: Exclude<TId, null | undefined> }
  : TItem

export type RackBinMountsItem = EnsureEntityId<ContractResponseData<'/api/v1/resource/rack-bin-mounts/{id}', 'get'>>
export type ReadonlyInput = Record<string, never>

const baseRackBinMountsApiMethods = {
  getById(params: ContractPathParams<'/api/v1/resource/rack-bin-mounts/{id}', 'get'>, query?: ContractQueryParams<'/api/v1/resource/rack-bin-mounts/{id}', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/resource/rack-bin-mounts/{id}', { params, query, config })
  },

  query(body: ContractRequestBody<'/api/v1/resource/rack-bin-mounts/query', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/resource/rack-bin-mounts/query', { body, config })
  }
}

export const rackBinMountsApiMethods = {
  ...baseRackBinMountsApiMethods,
}

export const rackBinMountsApi = createReadonlyCrudRequestAdapterFromMethods(rackBinMountsApiMethods)
// ==================== AUTO GENERATED END ====================

// ==================== CUSTOM METHODS START ====================

// ==================== CUSTOM METHODS END ====================

// ==================== CUSTOM CONFIG START ====================

// ==================== CUSTOM CONFIG END ====================
