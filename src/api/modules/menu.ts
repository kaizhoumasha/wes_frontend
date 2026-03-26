/**
 * 菜单 API
 */

import { API_CACHE_DURATION } from '@/constants/cache'
import { contractClient } from '@/api/contract/client'
import type { ContractPath, ContractResponseData } from '@/api/contract/types'

const MENU_TREE_PATH = '/api/v1/menus/my_menu' satisfies ContractPath

export type MenuResponse = ContractResponseData<typeof MENU_TREE_PATH, 'get'>

export const menuApi = {
  async getMenuTree(): Promise<MenuResponse> {
    return await contractClient.get(MENU_TREE_PATH, {
      config: { cacheFor: API_CACHE_DURATION.NONE }
    })
  }
}
