/**
 * 审计日志 API
 *
 * 审计日志是只读资源，只有查询和详情接口，无创建/更新/删除
 */

import { contractClient } from '@/api/contract/client'
import type { ContractRequestConfig } from '@/api/contract/types'
import type { components } from '@/api/generated/openapi-types'
import type { PaginationData } from '@/api/base/crud-api'

// 类型定义
export type AuditLog = components['schemas']['AuditLogResponse']

// 查询参数类型
interface QueryOptions {
  filters?: components['schemas']['FilterGroup'] | null
  sort?: components['schemas']['SortField'][]
  offset?: number
  limit?: number
}

/**
 * 审计日志 API
 *
 * 只读接口：查询列表、获取详情
 */
export const auditLogApi = {
  /**
   * 获取审计日志详情
   * @param id 审计日志ID
   * @param config 请求配置
   */
  async getById(
    id: number,
    config?: ContractRequestConfig
  ): Promise<AuditLog> {
    return await contractClient.get('/api/v1/audit-logs/{id}', {
      params: { id },
      config
    })
  },

  /**
   * 查询审计日志列表
   * @param options 查询参数
   * @param config 请求配置
   */
  async query(
    options?: QueryOptions,
    config?: ContractRequestConfig
  ): Promise<PaginationData<AuditLog>> {
    const response = await contractClient.post('/api/v1/audit-logs/query', {
      body: {
        offset: options?.offset ?? 0,
        limit: options?.limit ?? 10,
        filters: options?.filters ?? null,
        sort: options?.sort ?? [],
        include_deleted: false,
        max_depth: 1
      },
      config
    }) as {
      items?: AuditLog[]
      limit: number
      offset: number
      total: number
    }

    const size = response.limit
    const page = size > 0 ? Math.floor(response.offset / size) + 1 : 1

    return {
      items: response.items ?? [],
      total: response.total,
      page,
      size,
      pages: size > 0 ? Math.ceil(response.total / size) : 0
    }
  }
}
