/**
 * 菜单管理 API
 */

import {
  createSoftDeleteCrudApi,
  type SoftDeleteCrudResourceCollectionPath,
  type CrudCreateInput,
  type CrudItem,
  type CrudUpdateInput,
} from '@/api/base/crud-api'
import { menuGeneratedApi } from '@/api/generated/api-clients'
import { contractClient } from '@/api/contract/client'
import { API_CACHE_DURATION } from '@/constants/cache'
import type { ContractResponseData } from '@/api/contract/types'

const MENU_COLLECTION_PATH = '/api/v1/menus' satisfies SoftDeleteCrudResourceCollectionPath

export type Menu = CrudItem<typeof MENU_COLLECTION_PATH>
export type CreateMenuInput = CrudCreateInput<typeof MENU_COLLECTION_PATH>
export type UpdateMenuInput = CrudUpdateInput<typeof MENU_COLLECTION_PATH>

const baseMenuApi = createSoftDeleteCrudApi({
  collection: MENU_COLLECTION_PATH,
  item: `${MENU_COLLECTION_PATH}/{id}` as const,
  query: `${MENU_COLLECTION_PATH}/query` as const,
  restore: `${MENU_COLLECTION_PATH}/{id}/restore` as const,
  trash: `${MENU_COLLECTION_PATH}/trash` as const,
  trashRestore: `${MENU_COLLECTION_PATH}/trash/restore` as const,
  trashPermanentDelete: `${MENU_COLLECTION_PATH}/trash/permanent` as const,
})

/**
 * 菜单管理 API
 */
export const menuApi = {
  ...baseMenuApi,

  // 生成客户端方法的友好别名
  tree: menuGeneratedApi.tree,
  getSiblings: menuGeneratedApi.getSiblingsApiV1MenusSiblings_nodeId_,
  getAncestors: menuGeneratedApi.getAncestorsApiV1MenusAncestors_nodeId_,
  move: menuGeneratedApi.move,

  /**
   * 获取当前用户的菜单树（带缓存控制）
   */
  async getMenuTree(): Promise<ContractResponseData<'/api/v1/menus/my_menu', 'get'>> {
    return await contractClient.get('/api/v1/menus/my_menu', {
      config: { cacheFor: API_CACHE_DURATION.NONE }
    })
  }
}
