// ==================== AUTO GENERATED START ====================
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 自动生成的 API 模块
 *
 * ⚠️  请勿手动编辑 AUTO GENERATED 区域
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 资源: /api/v1/transport/debug-tasks, /api/v1/transport/tasks
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

export type DebugTasksResult = ContractResponseData<'/api/v1/transport/debug-tasks', 'post'>
export type DebugTasksInput = ContractRequestBody<'/api/v1/transport/debug-tasks', 'post'>

export type GetByTransportTaskIdResult = ContractResponseData<'/api/v1/transport/tasks/{transport_task_id}', 'get'>
export type GetByTransportTaskIdPathParams = ContractPathParams<'/api/v1/transport/tasks/{transport_task_id}', 'get'>

export const transportApiMethods = {
  /**
   * [ops:transport:debug-create] 创建 Transport 调试任务
   * @endpoint POST /api/v1/transport/debug-tasks
   * @returns alova method instance
   */
  debugTasks(body: ContractRequestBody<'/api/v1/transport/debug-tasks', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/transport/debug-tasks', { body, config })
  },

  /**
   * [ops:transport:read] 查询本地 Transport 任务
   * @endpoint GET /api/v1/transport/tasks/{transport_task_id}
   * @returns alova method instance
   */
  getByTransportTaskId(params: ContractPathParams<'/api/v1/transport/tasks/{transport_task_id}', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/transport/tasks/{transport_task_id}', { params, config })
  }
}
// ==================== AUTO GENERATED END ====================

// ==================== CUSTOM METHODS START ====================

// ==================== CUSTOM METHODS END ====================

// ==================== CUSTOM CONFIG START ====================

// ==================== CUSTOM CONFIG END ====================
