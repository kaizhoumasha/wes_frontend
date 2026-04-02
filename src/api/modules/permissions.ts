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
import { contractClient } from '@/api/contract/client'
import type {
  ContractPathParams,
  ContractQueryParams,
  ContractRequestBody,
  ContractRequestConfig,
  ContractResponseData,
} from '@/api/contract/types'
import type { components, paths } from '@/api/generated/openapi-types'
import {
  type SoftDeleteCrudApi,
  createSoftDeleteCrudApi,
  type CrudCreateInput,
  type CrudItem,
  type CrudResourceCollectionPath,
  type CrudUpdateInput,
  type SoftDeleteCrudResourceCollectionPath,
} from '@/api/base/crud-api'

const PERMISSIONS_COLLECTION_PATH = '/api/v1/admin/permissions' as const

type EnsureEntityId<TItem> = TItem extends { id?: infer TId }
  ? Omit<TItem, 'id'> & { id: Exclude<TId, null | undefined> }
  : TItem

export type PermissionsItem = EnsureEntityId<CrudItem<typeof PERMISSIONS_COLLECTION_PATH>>
export type CreatePermissionsInput = CrudCreateInput<typeof PERMISSIONS_COLLECTION_PATH>
export type UpdatePermissionsInput = CrudUpdateInput<typeof PERMISSIONS_COLLECTION_PATH>

export type TreeResult = ContractResponseData<'/api/v1/admin/permissions/tree', 'get'>
export type TreeQuery = ContractQueryParams<'/api/v1/admin/permissions/tree', 'get'>

export type SiblingsResult = ContractResponseData<'/api/v1/admin/permissions/siblings/{node_id}', 'get'>
export type SiblingsPathParams = ContractPathParams<'/api/v1/admin/permissions/siblings/{node_id}', 'get'>
export type SiblingsQuery = ContractQueryParams<'/api/v1/admin/permissions/siblings/{node_id}', 'get'>

export type AncestorsResult = ContractResponseData<'/api/v1/admin/permissions/ancestors/{node_id}', 'get'>
export type AncestorsPathParams = ContractPathParams<'/api/v1/admin/permissions/ancestors/{node_id}', 'get'>
export type AncestorsQuery = ContractQueryParams<'/api/v1/admin/permissions/ancestors/{node_id}', 'get'>

export type ChildrenResult = ContractResponseData<'/api/v1/admin/permissions/children/{node_id}', 'get'>
export type ChildrenPathParams = ContractPathParams<'/api/v1/admin/permissions/children/{node_id}', 'get'>

export type MoveResult = ContractResponseData<'/api/v1/admin/permissions/move', 'put'>
export type MoveInput = ContractRequestBody<'/api/v1/admin/permissions/move', 'put'>

export type BatchSortResult = ContractResponseData<'/api/v1/admin/permissions/batch-sort', 'put'>
export type BatchSortInput = ContractRequestBody<'/api/v1/admin/permissions/batch-sort', 'put'>

const basePermissionsApi = createSoftDeleteCrudApi({
  collection: PERMISSIONS_COLLECTION_PATH as unknown as SoftDeleteCrudResourceCollectionPath,
  item: `${PERMISSIONS_COLLECTION_PATH}/{id}` as const,
  query: `${PERMISSIONS_COLLECTION_PATH}/query` as const,
  restore: `${PERMISSIONS_COLLECTION_PATH}/{id}/restore` as const,
  trash: `${PERMISSIONS_COLLECTION_PATH}/trash` as const,
  trashRestore: `${PERMISSIONS_COLLECTION_PATH}/trash/restore` as const,
  trashPermanentDelete: `${PERMISSIONS_COLLECTION_PATH}/trash/permanent` as const,
}) as unknown as SoftDeleteCrudApi<PermissionsItem, CreatePermissionsInput, UpdatePermissionsInput>

export const permissionsApi = {
  ...basePermissionsApi,

  /**
   * Get Tree
   * @description 获取树形结构（默认懒加载模式）
   * @endpoint GET /api/v1/admin/permissions/tree
   */
  async tree(query?: ContractQueryParams<'/api/v1/admin/permissions/tree', 'get'>, config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/admin/permissions/tree', 'get'>> {
    return await contractClient.get('/api/v1/admin/permissions/tree', { query, config })
  },

  /**
   * Get Siblings
   * @description 获取同级节点
   * @endpoint GET /api/v1/admin/permissions/siblings/{node_id}
   */
  async siblings(params: ContractPathParams<'/api/v1/admin/permissions/siblings/{node_id}', 'get'>, query?: ContractQueryParams<'/api/v1/admin/permissions/siblings/{node_id}', 'get'>, config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/admin/permissions/siblings/{node_id}', 'get'>> {
    return await contractClient.get('/api/v1/admin/permissions/siblings/{node_id}', { params, query, config })
  },

  /**
   * Get Ancestors
   * @description 获取祖先节点
   * @endpoint GET /api/v1/admin/permissions/ancestors/{node_id}
   */
  async ancestors(params: ContractPathParams<'/api/v1/admin/permissions/ancestors/{node_id}', 'get'>, query?: ContractQueryParams<'/api/v1/admin/permissions/ancestors/{node_id}', 'get'>, config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/admin/permissions/ancestors/{node_id}', 'get'>> {
    return await contractClient.get('/api/v1/admin/permissions/ancestors/{node_id}', { params, query, config })
  },

  /**
   * Get Children
   * @description 获取子级节点
   * @endpoint GET /api/v1/admin/permissions/children/{node_id}
   */
  async children(params: ContractPathParams<'/api/v1/admin/permissions/children/{node_id}', 'get'>, config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/admin/permissions/children/{node_id}', 'get'>> {
    return await contractClient.get('/api/v1/admin/permissions/children/{node_id}', { params, config })
  },

  /**
   * Move Node
   * @description 移动节点
   * @endpoint PUT /api/v1/admin/permissions/move
   */
  async move(body: ContractRequestBody<'/api/v1/admin/permissions/move', 'put'>, config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/admin/permissions/move', 'put'>> {
    return await contractClient.put('/api/v1/admin/permissions/move', { body, config })
  },

  /**
   * Batch Sort
   * @description 批量排序节点

适用于拖拽排序场景，一次请求更新多个节点的 parent_id 和 sort_order
   * @endpoint PUT /api/v1/admin/permissions/batch-sort
   */
  async batchSort(body: ContractRequestBody<'/api/v1/admin/permissions/batch-sort', 'put'>, config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/admin/permissions/batch-sort', 'put'>> {
    return await contractClient.put('/api/v1/admin/permissions/batch-sort', { body, config })
  }
}
// ==================== AUTO GENERATED END ====================

// ==================== CUSTOM METHODS START ====================

// ==================== CUSTOM METHODS END ====================

// ==================== CUSTOM CONFIG START ====================

// ==================== CUSTOM CONFIG END ====================
