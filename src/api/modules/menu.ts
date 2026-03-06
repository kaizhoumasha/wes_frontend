/**
 * 菜单 API
 *
 * 处理菜单加载、菜单查询等操作
 * 对应后端: src/app/admin/v1/menu.py
 */

import { apiClient, getApiPath } from '../client'
import type { ApiResponse } from '../types'
import type { MenuTreeResponse } from '@/types/menu'

// ==================== 类型定义 ====================

/**
 * 菜单响应
 */
export type MenuResponse = MenuTreeResponse[]

// ==================== API 函数 ====================

/**
 * 菜单 API
 */
export const menuApi = {
  /**
   * 获取当前用户的菜单树
   *
   * 后端已根据用户权限过滤菜单，前端无需额外处理
   * 返回的是树形结构，可直接用于渲染
   *
   * @returns 菜单树数组
   *
   * @example
   * ```ts
   * const menuTree = await menuApi.getMenuTree()
   * // [
   * //   {
   * //     id: 1,
   * //     name: 'system',
   * //     title: '系统管理',
   * //     path: '/system',
   * //     icon: 'Setting',
   * //     children: [
   * //       { id: 2, name: 'system:users', title: '用户管理', path: '/system/users', ... }
   * //     ]
   * //   }
   * // ]
   * ```
   */
  async getMenuTree(): Promise<MenuResponse> {
    const response = await apiClient.Get<ApiResponse<MenuResponse>>(
      getApiPath('/menus/my')
    )
    return response as unknown as MenuResponse
  }
}
