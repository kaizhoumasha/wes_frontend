/**
 * 路由守卫错误处理工具
 *
 * 统一处理守卫中的权限加载错误，避免重复代码
 */

import { isAuthError } from '@/api/services/auth-error-handler'

export type GuardActionResult = 'success' | 'auth-redirected' | 'unavailable'

/**
 * 守卫错误包装器
 *
 * 统一处理守卫中的权限加载失败，避免重复代码
 *
 * @param context 错误上下文（用于日志）
 * @returns 守卫操作结果
 *
 * @example
 * ```ts
 * import { withGuardErrorHandling } from '@/utils/guard-error-handler'
 *
 * const { withGuardErrorHandling } = useGuardErrorHandler()
 * await withGuardErrorHandling(() => loadPermissions(), '权限守卫')
 * ```
 */
export async function withGuardErrorHandling(
  guardAction: () => Promise<unknown>,
  context: string
): Promise<GuardActionResult> {
  try {
    await guardAction()
    return 'success'
  } catch (error) {
    // 认证错误：已由 API 客户端处理清除 token 与登录跳转。
    if (isAuthError(error)) {
      return 'auth-redirected'
    }

    // 其他错误：记录日志并标记为临时不可用，由调用方关闭访问。
    console.error(`[${context}] 执行失败:`, error)
    return 'unavailable'
  }
}
