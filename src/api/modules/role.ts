/**
 * 角色管理 API
 */

import type { ContractPath, ContractResponseData, ContractSchema } from '@/api/contract/types'
import { contractClient } from '@/api/contract/client'

const ROLES_QUERY_PATH = '/api/v1/roles/query' satisfies ContractPath

export type Role = ContractSchema<'RoleResponse'>
export type RoleSimple = ContractSchema<'RoleResponseSimple'>

type RolesQueryResponse = ContractResponseData<typeof ROLES_QUERY_PATH, 'post'>

export const roleApi = {
  /**
   * 查询所有角色列表
   * 用于用户分配角色时获取可选角色
   */
  async query(): Promise<Role[]> {
    const response: RolesQueryResponse = await contractClient.post(ROLES_QUERY_PATH, {
      body: {
        include_deleted: false,
        limit: 100, // 获取所有角色
        max_depth: 1,
        offset: 0
      }
    })
    return response.items ?? []
  }
}
