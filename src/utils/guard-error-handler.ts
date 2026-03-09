/**
 * 路由守卫错误处理工具
 *
 * 统一处理守卫中的权限加载错误，避免重复代码
 */

import type { ApiResponseError } from '@/api/client'
import { ClientErrorCode } from '@/api/constants/response-codes'

/** 认证错误码集合 */
const AUTH_ERROR_CODES = new Set([
  ClientErrorCode.UNAUTHORIZED,
  ClientErrorCode.INVALID_CREDENTIALS,
  ClientErrorCode.INVALID_TOKEN,
  ClientErrorCode.TOKEN_EXPIRED,
  ClientErrorCode.TOKEN_MISSING
])

/**
 * 判断是否为认证错误
 */
function isAuthError(error: unknown): error is ApiResponseError {
  return (
    error instanceof Error &&
    'code' in error &&
    typeof (error as ApiResponseError).code === 'string' &&
    AUTH_ERROR_CODES.has((error as ApiResponseError).code)
  )
}

/**
 * 守卫错误包装器
 *
 * 统一处理守卫中的权限加载失败，避免重复代码
 *
 * @param context 错误上下文（用于日志）
 * @returns 包装后的函数
 *
 * @example
 * ```ts
 * import { withGuardErrorHandling } from '@/utils/guard-error-handler'
 *
 * const { withGuardErrorHandling } = useGuardErrorHandler()
 * await withGuardErrorHandling(() => loadPermissions(), '权限守卫')
 * ```
 */
export async function withGuardErrorHandling<T>(
  guardAction: () => Promise<T>,
  context: string
): Promise<T | undefined> {
  try {
    return await guardAction()
  } catch (error) {
    // 认证错误：已在 API 客户端中处理（清除 token 并重定向）
    // 这里静默放行，让认证守卫处理重定向
    if (isAuthError(error)) {
      return undefined
    }

    // 其他错误：记录日志但允许导航继续
    console.error(`[${context}] 执行失败:`, error)
    return undefined
  }
}
