/**
 * 菜单管理 API
 */

import {
  createSoftDeleteCrudApi,
  type CrudCreateInput,
  type CrudItem,
  type SoftDeleteCrudResourceCollectionPath,
  type CrudUpdateInput,
} from '@/api/base/crud-api'
import { API_CACHE_DURATION } from '@/constants/cache'
import { contractClient } from '@/api/contract/client'
import type { ContractPath, ContractResponseData } from '@/api/contract/types'

const MENU_COLLECTION_PATH = '/api/v1/menus' satisfies SoftDeleteCrudResourceCollectionPath
const MENU_TREE_PATH = '/api/v1/menus/my_menu' satisfies ContractPath

export type Menu = CrudItem<typeof MENU_COLLECTION_PATH>

export type CreateMenuInput = CrudCreateInput<typeof MENU_COLLECTION_PATH>

export type UpdateMenuInput = CrudUpdateInput<typeof MENU_COLLECTION_PATH>

export type MenuTreeResponse = ContractResponseData<typeof MENU_TREE_PATH, 'get'>

const baseMenuApi = createSoftDeleteCrudApi({
  collection: MENU_COLLECTION_PATH,
  item: `${MENU_COLLECTION_PATH}/{id}` as const,
  query: `${MENU_COLLECTION_PATH}/query` as const,
  restore: `${MENU_COLLECTION_PATH}/{id}/restore` as const,
  trash: `${MENU_COLLECTION_PATH}/trash` as const,
  trashRestore: `${MENU_COLLECTION_PATH}/trash/restore` as const,
  trashPermanentDelete: `${MENU_COLLECTION_PATH}/trash/permanent` as const
})

export const menuApi = {
  ...baseMenuApi,

  /**
   * 获取当前用户的菜单树
   */
  async getMenuTree(): Promise<MenuTreeResponse> {
    return await contractClient.get(MENU_TREE_PATH, {
      config: { cacheFor: API_CACHE_DURATION.NONE }
    })
  }
}
