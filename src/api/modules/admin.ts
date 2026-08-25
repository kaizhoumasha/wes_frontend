// ==================== AUTO GENERATED START ====================
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 自动生成的 API 模块
 *
 * ⚠️  请勿手动编辑 AUTO GENERATED 区域
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 资源: /api/v1/admin/performance
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

export type ConfigResult = ContractResponseData<'/api/v1/admin/performance/config', 'get'>

export type HealthResult = ContractResponseData<'/api/v1/admin/performance/health', 'get'>

export type LoadTestResetResult = ContractResponseData<'/api/v1/admin/performance/load-test/reset', 'post'>

export type MetricsResult = ContractResponseData<'/api/v1/admin/performance/metrics', 'get'>

export const adminApiMethods = {
  /**
   * 获取性能测试配置
   * @description 获取系统配置信息

用于性能测试时了解系统配置
   * @endpoint GET /api/v1/admin/performance/config
   * @returns alova method instance
   */
  config(config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/admin/performance/config', { config })
  },

  /**
   * 健康检查
   * @description 简单健康检查

返回各组件的健康状态
   * @endpoint GET /api/v1/admin/performance/health
   * @returns alova method instance
   */
  health(config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/admin/performance/health', { config })
  },

  /**
   * 重置性能测试数据
   * @description 重置性能测试数据

清空所有缓存，准备开始新的性能测试
   * @endpoint POST /api/v1/admin/performance/load-test/reset
   * @returns alova method instance
   */
  loadTestReset(config?: ContractRequestConfig) {
    return contractMethods.post('/api/v1/admin/performance/load-test/reset', { config })
  },

  /**
   * 获取系统性能指标
   * @description 获取系统性能指标

返回：
- system: CPU、内存、磁盘使用情况
- database: 数据库连接池状态
- redis: Redis 连接状态
- cache: 缓存统计信息
   * @endpoint GET /api/v1/admin/performance/metrics
   * @returns alova method instance
   */
  metrics(config?: ContractRequestConfig) {
    return contractMethods.get('/api/v1/admin/performance/metrics', { config })
  }
}
// ==================== AUTO GENERATED END ====================

// ==================== CUSTOM METHODS START ====================

// ==================== CUSTOM METHODS END ====================

// ==================== CUSTOM CONFIG START ====================

// ==================== CUSTOM CONFIG END ====================
