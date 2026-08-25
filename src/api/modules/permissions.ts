// ==================== AUTO GENERATED START ====================
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 自动生成的 API 模块
 *
 * ⚠️  请勿手动编辑 AUTO GENERATED 区域
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 资源: /api/v1/admin/permissions
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

const PERMISSIONS_COLLECTION_PATH = '/api/v1/admin/permissions' as const

type EnsureEntityId<TItem> = TItem extends { id?: infer TId }
  ? Omit<TItem, 'id'> & { id: Exclude<TId, null | undefined> }
  : TItem

export type PermissionsItem = EnsureEntityId<ContractResponseData<'/api/v1/admin/permissions/{id}', 'get'>>
export type ReadonlyInput = Record<string, never>

export type AncestorsResult = ContractResponseData<'/api/v1/admin/permissions/ancestors/{node_id}', 'get'>
export type AncestorsPathParams = ContractPathParams<'/api/v1/admin/permissions/ancestors/{node_id}', 'get'>
export type AncestorsQuery = ContractQueryParams<'/api/v1/admin/permissions/ancestors/{node_id}', 'get'>

export type ChildrenResult = ContractResponseData<'/api/v1/admin/permissions/children/{node_id}', 'get'>
export type ChildrenPathParams = ContractPathParams<'/api/v1/admin/permissions/children/{node_id}', 'get'>

export type SiblingsResult = ContractResponseData<'/api/v1/admin/permissions/siblings/{node_id}', 'get'>
export type SiblingsPathParams = ContractPathParams<'/api/v1/admin/permissions/siblings/{node_id}', 'get'>
export type SiblingsQuery = ContractQueryParams<'/api/v1/admin/permissions/siblings/{node_id}', 'get'>

export type TreeResult = ContractResponseData<'/api/v1/admin/permissions/tree', 'get'>
export type TreeQuery = ContractQueryParams<'/api/v1/admin/permissions/tree', 'get'>

const basePermissionsApiMethods = {
  getById(params: ContractPathParams<'/api/v1/admin/permissions/{id}', 'get'>, query?: ContractQueryParams<'/api/v1/admin/permissions/{id}', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/admin/permissions/{id}', { params, query, config })
  },

  query(body: ContractRequestBody<'/api/v1/admin/permissions/query', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/admin/permissions/query', { body, config })
  }
}

export const permissionsApiMethods = {
  ...basePermissionsApiMethods,

  /**
   * Get Ancestors
   * @description 获取祖先节点
   * @endpoint GET /api/v1/admin/permissions/ancestors/{node_id}
   * @returns alova method instance
   */
  ancestors(params: ContractPathParams<'/api/v1/admin/permissions/ancestors/{node_id}', 'get'>, query?: ContractQueryParams<'/api/v1/admin/permissions/ancestors/{node_id}', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/admin/permissions/ancestors/{node_id}', { params, query, config })
  },

  /**
   * Get Children
   * @description 获取子级节点
   * @endpoint GET /api/v1/admin/permissions/children/{node_id}
   * @returns alova method instance
   */
  children(params: ContractPathParams<'/api/v1/admin/permissions/children/{node_id}', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/admin/permissions/children/{node_id}', { params, config })
  },

  /**
   * Get Siblings
   * @description 获取同级节点
   * @endpoint GET /api/v1/admin/permissions/siblings/{node_id}
   * @returns alova method instance
   */
  siblings(params: ContractPathParams<'/api/v1/admin/permissions/siblings/{node_id}', 'get'>, query?: ContractQueryParams<'/api/v1/admin/permissions/siblings/{node_id}', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/admin/permissions/siblings/{node_id}', { params, query, config })
  },

  /**
   * Get Tree
   * @description 获取树形结构（默认懒加载模式）
   * @endpoint GET /api/v1/admin/permissions/tree
   * @returns alova method instance
   */
  tree(query?: ContractQueryParams<'/api/v1/admin/permissions/tree', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/admin/permissions/tree', { query, config })
  }
}

export const permissionsApi = createReadonlyCrudRequestAdapterFromMethods(permissionsApiMethods)
// ==================== AUTO GENERATED END ====================

// ==================== CUSTOM METHODS START ====================

// ==================== CUSTOM METHODS END ====================

// ==================== CUSTOM CONFIG START ====================

// ==================== CUSTOM CONFIG END ====================
