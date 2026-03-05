/**
 * API Base URL 配置
 *
 * 统一管理 API Base URL，确保不包含版本前缀
 * 版本前缀由 @/config/api/version.ts 自动添加
 */

import { env } from '../env'

/**
 * API Base URL（不含版本前缀）
 *
 * 注意：此 URL 不应包含 /api/vX 等版本前缀
 * 版本前缀会由 getApiPath() 自动添加
 *
 * @example
 * ```ts
 * // ❌ 错误：包含版本前缀
 * const BAD_URL = 'http://localhost:8001/api/v1'
 *
 * // ✅ 正确：不含版本前缀
 * const GOOD_URL = 'http://localhost:8001'
 * ```
 */
export const API_BASE_URL = env.apiBaseUrl

/**
 * WebSocket Base URL（不含版本前缀）
 *
 * 注意：此 URL 不应包含 /api/vX 等版本前缀
 */
export const WS_BASE_URL = env.wsUrl
