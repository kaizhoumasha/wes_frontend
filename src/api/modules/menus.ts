// ==================== AUTO GENERATED START ====================
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 自动生成的 API 模块
 *
 * ⚠️  请勿手动编辑 AUTO GENERATED 区域
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 资源: /api/v1/admin/menus
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

const MENUS_COLLECTION_PATH = '/api/v1/admin/menus' as const

type EnsureEntityId<TItem> = TItem extends { id?: infer TId }
  ? Omit<TItem, 'id'> & { id: Exclude<TId, null | undefined> }
  : TItem

export type MenusItem = EnsureEntityId<CrudItem<typeof MENUS_COLLECTION_PATH>>
export type CreateMenusInput = CrudCreateInput<typeof MENUS_COLLECTION_PATH>
export type UpdateMenusInput = CrudUpdateInput<typeof MENUS_COLLECTION_PATH>

export type TreeResult = ContractResponseData<'/api/v1/admin/menus/tree', 'get'>
export type TreeQuery = ContractQueryParams<'/api/v1/admin/menus/tree', 'get'>

export type SiblingsResult = ContractResponseData<'/api/v1/admin/menus/siblings/{node_id}', 'get'>
export type SiblingsPathParams = ContractPathParams<'/api/v1/admin/menus/siblings/{node_id}', 'get'>
export type SiblingsQuery = ContractQueryParams<'/api/v1/admin/menus/siblings/{node_id}', 'get'>

export type AncestorsResult = ContractResponseData<'/api/v1/admin/menus/ancestors/{node_id}', 'get'>
export type AncestorsPathParams = ContractPathParams<'/api/v1/admin/menus/ancestors/{node_id}', 'get'>
export type AncestorsQuery = ContractQueryParams<'/api/v1/admin/menus/ancestors/{node_id}', 'get'>

export type ChildrenResult = ContractResponseData<'/api/v1/admin/menus/children/{node_id}', 'get'>
export type ChildrenPathParams = ContractPathParams<'/api/v1/admin/menus/children/{node_id}', 'get'>

export type MoveResult = ContractResponseData<'/api/v1/admin/menus/move', 'put'>
export type MoveInput = ContractRequestBody<'/api/v1/admin/menus/move', 'put'>

export type BatchSortResult = ContractResponseData<'/api/v1/admin/menus/batch-sort', 'put'>
export type BatchSortInput = ContractRequestBody<'/api/v1/admin/menus/batch-sort', 'put'>

export type MyMenuResult = ContractResponseData<'/api/v1/admin/menus/my_menu', 'get'>

const baseMenusApi = createSoftDeleteCrudApi({
  collection: MENUS_COLLECTION_PATH as unknown as SoftDeleteCrudResourceCollectionPath,
  item: `${MENUS_COLLECTION_PATH}/{id}` as const,
  query: `${MENUS_COLLECTION_PATH}/query` as const,
  restore: `${MENUS_COLLECTION_PATH}/{id}/restore` as const,
  trash: `${MENUS_COLLECTION_PATH}/trash` as const,
  trashRestore: `${MENUS_COLLECTION_PATH}/trash/restore` as const,
  trashPermanentDelete: `${MENUS_COLLECTION_PATH}/trash/permanent` as const,
}) as unknown as SoftDeleteCrudApi<MenusItem, CreateMenusInput, UpdateMenusInput>

export const menusApi = {
  ...baseMenusApi,

  /**
   * Get Tree
   * @description 获取树形结构（默认懒加载模式）
   * @endpoint GET /api/v1/admin/menus/tree
   */
  async tree(query?: ContractQueryParams<'/api/v1/admin/menus/tree', 'get'>, config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/admin/menus/tree', 'get'>> {
    return await contractClient.get('/api/v1/admin/menus/tree', { query, config })
  },

  /**
   * Get Siblings
   * @description 获取同级节点
   * @endpoint GET /api/v1/admin/menus/siblings/{node_id}
   */
  async siblings(params: ContractPathParams<'/api/v1/admin/menus/siblings/{node_id}', 'get'>, query?: ContractQueryParams<'/api/v1/admin/menus/siblings/{node_id}', 'get'>, config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/admin/menus/siblings/{node_id}', 'get'>> {
    return await contractClient.get('/api/v1/admin/menus/siblings/{node_id}', { params, query, config })
  },

  /**
   * Get Ancestors
   * @description 获取祖先节点
   * @endpoint GET /api/v1/admin/menus/ancestors/{node_id}
   */
  async ancestors(params: ContractPathParams<'/api/v1/admin/menus/ancestors/{node_id}', 'get'>, query?: ContractQueryParams<'/api/v1/admin/menus/ancestors/{node_id}', 'get'>, config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/admin/menus/ancestors/{node_id}', 'get'>> {
    return await contractClient.get('/api/v1/admin/menus/ancestors/{node_id}', { params, query, config })
  },

  /**
   * Get Children
   * @description 获取子级节点
   * @endpoint GET /api/v1/admin/menus/children/{node_id}
   */
  async children(params: ContractPathParams<'/api/v1/admin/menus/children/{node_id}', 'get'>, config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/admin/menus/children/{node_id}', 'get'>> {
    return await contractClient.get('/api/v1/admin/menus/children/{node_id}', { params, config })
  },

  /**
   * Move Node
   * @description 移动节点
   * @endpoint PUT /api/v1/admin/menus/move
   */
  async move(body: ContractRequestBody<'/api/v1/admin/menus/move', 'put'>, config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/admin/menus/move', 'put'>> {
    return await contractClient.put('/api/v1/admin/menus/move', { body, config })
  },

  /**
   * Batch Sort
   * @description 批量排序节点

适用于拖拽排序场景，一次请求更新多个节点的 parent_id 和 sort_order
   * @endpoint PUT /api/v1/admin/menus/batch-sort
   */
  async batchSort(body: ContractRequestBody<'/api/v1/admin/menus/batch-sort', 'put'>, config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/admin/menus/batch-sort', 'put'>> {
    return await contractClient.put('/api/v1/admin/menus/batch-sort', { body, config })
  },

  /**
   * 获取当前用户的菜单树
   * @description 返回当前用户可访问的菜单树（基于角色权限过滤）
   * @endpoint GET /api/v1/admin/menus/my_menu
   */
  async myMenu(config?: ContractRequestConfig): Promise<ContractResponseData<'/api/v1/admin/menus/my_menu', 'get'>> {
    return await contractClient.get('/api/v1/admin/menus/my_menu', { config })
  }
}
// ==================== AUTO GENERATED END ====================

// ==================== CUSTOM METHODS START ====================

// ==================== CUSTOM METHODS END ====================

// ==================== CUSTOM CONFIG START ====================

// ==================== CUSTOM CONFIG END ====================
