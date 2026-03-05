/**
 * API 版本配置
 *
 * 统一管理 API 版本，支持全局默认版本和模块级版本覆盖
 *
 * @example
 * ```ts
 * import { getApiPath, getApiUrl } from '@/config/api/version'
 *
 * // 使用默认版本
 * getApiPath('/auth/login')        // '/api/v1/auth/login'
 * getApiUrl('/auth/login')         // 'http://localhost:8001/api/v1/auth/login'
 *
 * // 使用自定义版本
 * getApiPath('/auth/login', 'v2')  // '/api/v2/auth/login'
 * ```
 */

/** 当前默认 API 版本 */
export const API_DEFAULT_VERSION = 'v1'

/** 支持的 API 版本列表 */
export const API_VERSIONS = ['v1', 'v2'] as const

/** API 版本类型 */
export type ApiVersion = (typeof API_VERSIONS)[number]

/**
 * 模块级版本配置
 *
 * 用于特定模块使用不同版本的 API
 *
 * @example
 * ```ts
 * // 新功能使用 v2 API
 * API_MODULE_VERSIONS['/advanced-features'] = 'v2'
 * ```
 */
export const API_MODULE_VERSIONS: Record<string, ApiVersion> = {}

/**
 * 获取模块的 API 版本
 *
 * @param path API 路径
 * @returns API 版本
 */
export function getModuleVersion(path: string): ApiVersion {
  // 检查是否有模块级配置
  for (const [modulePath, version] of Object.entries(API_MODULE_VERSIONS)) {
    if (path.startsWith(modulePath)) {
      return version
    }
  }
  return API_DEFAULT_VERSION
}

/**
 * 构建带版本的 API 路径
 *
 * @param path API 路径（不含版本和 /api 前缀）
 * @param version 可选版本（默认使用全局版本）
 * @returns 完整的 API 路径
 *
 * @example
 * ```ts
 * getApiPath('/auth/login')              // '/api/v1/auth/login'
 * getApiPath('/auth/login', 'v2')        // '/api/v2/auth/login'
 * getApiPath('/users')                   // '/api/v1/users'
 * ```
 */
export function getApiPath(path: string, version?: ApiVersion): string {
  const targetVersion = version || getModuleVersion(path)
  return `/api/${targetVersion}${path}`
}

/**
 * 构建带版本的完整 API URL
 *
 * @param path API 路径（不含版本和 /api 前缀）
 * @param baseUrl 基础 URL（不含版本）
 * @param version 可选版本（默认使用全局版本）
 * @returns 完整的 API URL
 *
 * @example
 * ```ts
 * getApiUrl('/auth/login', 'http://localhost:8001')
 * // 'http://localhost:8001/api/v1/auth/login'
 *
 * getApiUrl('/auth/login', 'http://localhost:8001', 'v2')
 * // 'http://localhost:8001/api/v2/auth/login'
 * ```
 */
export function getApiUrl(path: string, baseUrl: string, version?: ApiVersion): string {
  const apiPath = getApiPath(path, version)
  return `${baseUrl}${apiPath}`
}

/**
 * 更新模块版本配置
 *
 * 用于运行时动态更新模块版本（慎用）
 *
 * @param modulePath 模块路径
 * @param version API 版本
 */
export function setModuleVersion(modulePath: string, version: ApiVersion): void {
  API_MODULE_VERSIONS[modulePath] = version
}
