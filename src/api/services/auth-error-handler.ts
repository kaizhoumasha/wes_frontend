/**
 * 认证错误处理服务
 *
 * 统一处理 Token 无效、过期等认证相关错误
 * - 清除无效 Token 和权限缓存
 * - 重定向到登录页
 * - 提供全局错误处理钩子
 */

import { removeAccessToken } from '../services/token-refresh'
import type { ApiResponseError } from '../client'
import { ClientErrorCode } from '../constants/response-codes'
import type { Router } from 'vue-router'

// ==================== 常量定义 ====================

/** 需要登出的错误码 */
const AUTH_ERROR_CODES: ReadonlySet<string> = new Set([
  ClientErrorCode.UNAUTHORIZED,
  ClientErrorCode.INVALID_CREDENTIALS,
  ClientErrorCode.INVALID_TOKEN,
  ClientErrorCode.TOKEN_EXPIRED,
  ClientErrorCode.TOKEN_MISSING
])

/** 登录页路径 */
const LOGIN_PATH = '/login'

// ==================== 路由实例引用 ====================

/** 路由实例（延迟注入） */
let routerInstance: Router | null = null

/**
 * 设置路由实例（由 router/index.ts 调用）
 *
 * @param router Vue Router 实例
 */
export function setRouterInstance(router: Router): void {
  routerInstance = router
}

// ==================== 认证错误判断 ====================

/**
 * 判断是否为认证错误
 *
 * @param error 错误对象
 * @returns 是否为认证错误
 */
export function isAuthError(error: unknown): error is ApiResponseError {
  return (
    error instanceof Error &&
    'code' in error &&
    typeof (error as ApiResponseError).code === 'string' &&
    AUTH_ERROR_CODES.has((error as ApiResponseError).code)
  )
}

/**
 * 判断错误码是否需要登出
 *
 * @param code 响应码
 * @returns 是否需要登出
 */
export function shouldLogout(code: string): boolean {
  return AUTH_ERROR_CODES.has(code)
}

// ==================== 登出处理 ====================

/**
 * 清除认证状态
 *
 * - 清除 Token
 * - 清除权限缓存
 * - 清除会话存储的认证相关数据
 */
function clearAuthState(): void {
  // 清除 Token
  removeAccessToken()

  // 清除 sessionStorage 中的认证相关数据
  const keysToRemove: string[] = []
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i)
    if (key) {
      // 清除权限、用户等相关缓存
      if (
        key.includes('permission') ||
        key.includes('user') ||
        key.includes('auth') ||
        key.includes('redirect')
      ) {
        keysToRemove.push(key)
      }
    }
  }
  keysToRemove.forEach((key) => sessionStorage.removeItem(key))

  // 清除 localStorage 中的认证相关数据（除了 access_token 由 removeAccessToken 处理）
  localStorage.removeItem('user_info')
  localStorage.removeItem('permissions')
}

/**
 * 重定向到登录页
 *
 * @param returnPath 登录后返回的路径（可选）
 */
function redirectToLogin(returnPath?: string): void {
  if (!routerInstance) {
    console.warn('[认证错误] 路由实例未设置，无法自动重定向')
    window.location.href = LOGIN_PATH
    return
  }

  // 保存当前路径用于登录后重定向
  if (returnPath) {
    sessionStorage.setItem('redirect_after_login', returnPath)
  }

  routerInstance.push(LOGIN_PATH).catch((err: Error) => {
    console.error('[认证错误] 重定向到登录页失败:', err)
    // 降级处理：直接修改 location
    window.location.href = LOGIN_PATH
  })
}

// ==================== 主要错误处理函数 ====================

/**
 * 处理认证错误
 *
 * 当 API 返回认证相关错误码时调用：
 * - 清除无效的 Token 和权限缓存
 * - 重定向到登录页
 * - 可选的回调通知
 *
 * @param error 错误对象
 * @param options 处理选项
 *
 * @example
 * ```ts
 * import { handleAuthError } from '@/api/services/auth-error-handler'
 *
 * try {
 *   await someApi()
 * } catch (error) {
 *   if (isAuthError(error)) {
 *     await handleAuthError(error, {
 *       returnPath: '/dashboard',
 *       showMessage: true
 *     })
 *   }
 * }
 * ```
 */
export async function handleAuthError(
  error: ApiResponseError,
  options: {
    /** 登录后返回的路径（默认为当前路径） */
    returnPath?: string
    /** 是否显示错误提示消息 */
    showMessage?: boolean
  } = {}
): Promise<void> {
  const { returnPath, showMessage = false } = options

  console.warn(`[认证错误] Code: ${error.code}, Message: ${error.message}`)

  // 清除认证状态
  clearAuthState()

  // 显示错误提示（可选）
  if (showMessage) {
    // 这里可以使用 Element Plus 的 ElMessage
    // 避免循环依赖，通过全局事件总线或直接调用
    if (typeof window !== 'undefined' && 'ElMessage' in window) {
      window.ElMessage.warning({
        message: error.message || '登录已失效，请重新登录',
        duration: 3000,
        showClose: true
      })
    }
  }

  // 延迟重定向，确保状态清除完成
  await new Promise((resolve) => setTimeout(resolve, 100))

  // 重定向到登录页
  redirectToLogin(returnPath || window.location.pathname)
}

/**
 * 处理 401 未授权响应
 *
 * 用于响应拦截器中处理 HTTP 401 错误
 *
 * @param returnPath 登录后返回的路径
 */
export function handleUnauthorizedResponse(returnPath?: string): void {
  clearAuthState()
  redirectToLogin(returnPath)
}

// ==================== 导出 ====================

export default {
  setRouterInstance,
  isAuthError,
  shouldLogout,
  handleAuthError,
  handleUnauthorizedResponse,
  clearAuthState,
  redirectToLogin
}

// ==================== 全局类型扩展 ====================

declare global {
  interface Window {
    ElMessage: {
      warning: (options: { message: string; duration: number; showClose: boolean }) => void
    }
  }
}

export {}
