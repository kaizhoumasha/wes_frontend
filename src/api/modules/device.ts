// ==================== AUTO GENERATED START ====================
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 自动生成的 API 模块
 *
 * ⚠️  请勿手动编辑 AUTO GENERATED 区域
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 资源: /api/v1/device/commands, /api/v1/device/evidences
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

export type DebugPreflightResult = ContractResponseData<'/api/v1/device/commands/debug/preflight', 'post'>
export type DebugPreflightInput = ContractRequestBody<'/api/v1/device/commands/debug/preflight', 'post'>

export type DebugResult = ContractResponseData<'/api/v1/device/commands/debug', 'post'>
export type DebugInput = ContractRequestBody<'/api/v1/device/commands/debug', 'post'>

export type GetByCommandCodeResult = ContractResponseData<'/api/v1/device/commands/{command_code}', 'get'>
export type GetByCommandCodePathParams = ContractPathParams<'/api/v1/device/commands/{command_code}', 'get'>

export type StreamResult = ContractResponseData<'/api/v1/device/evidences/stream', 'get'>
export type StreamQuery = ContractQueryParams<'/api/v1/device/evidences/stream', 'get'>

export const deviceApiMethods = {
  /**
   * 枚举 ECS 设备并检查 MANUAL_DEBUG 运行态
   * @endpoint POST /api/v1/device/commands/debug/preflight
   * @returns alova method instance
   */
  debugPreflight(body: ContractRequestBody<'/api/v1/device/commands/debug/preflight', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/device/commands/debug/preflight', { body, config })
  },

  /**
   * 创建 DeviceCommand 联调命令
   * @endpoint POST /api/v1/device/commands/debug
   * @returns alova method instance
   */
  debug(body: ContractRequestBody<'/api/v1/device/commands/debug', 'post'>, config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/device/commands/debug', { body, config })
  },

  /**
   * 查询 DeviceCommand 联调结果
   * @endpoint GET /api/v1/device/commands/{command_code}
   * @returns alova method instance
   */
  getByCommandCode(params: ContractPathParams<'/api/v1/device/commands/{command_code}', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/device/commands/{command_code}', { params, config })
  },

  /**
   * 实时订阅 ECS callback 与 evidence 应用状态
   * @endpoint GET /api/v1/device/evidences/stream
   * @returns alova method instance
   */
  stream(query?: ContractQueryParams<'/api/v1/device/evidences/stream', 'get'>, config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/device/evidences/stream', { query, config })
  }
}
// ==================== AUTO GENERATED END ====================

// ==================== CUSTOM METHODS START ====================

// ==================== CUSTOM METHODS END ====================

// ==================== CUSTOM CONFIG START ====================

// ==================== CUSTOM CONFIG END ====================
