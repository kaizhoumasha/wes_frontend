/**
 * Token刷新服务
 * 处理401错误时的静默Token刷新和请求队列管理
 */

import { clearPermissionState } from '@/composables/permission-state'
import type { RequestBody } from '@/api/types/request'
import type {
  ContractPath,
  ContractRequestConfig,
  ContractResponseData,
} from '@/api/contract/types'
import type { Router } from 'vue-router'

// ==================== 常量定义 ====================

/** Token存储键 */
export const TOKEN_KEY = 'access_token' as const
/** Refresh Token存储键（HttpOnly Cookie，不存储在localStorage） */
export const REFRESH_TOKEN_COOKIE = 'refresh_token' as const
/** Token过期时间存储键 */
export const TOKEN_EXPIRES_AT_KEY = 'token_expires_at' as const

const AUTH_REFRESH_PATH = '/api/v1/auth/refresh' satisfies ContractPath
const AUTH_LOGOUT_PATH = '/api/v1/auth/logout' satisfies ContractPath

/** 刷新Token的API端点 */
type RefreshTokenResponse = ContractResponseData<typeof AUTH_REFRESH_PATH, 'post'>

// ==================== 类型定义 ====================

/**
 * 请求队列项（用于 Token 刷新期间的请求等待）
 */
interface QueuedRequest {
  /** 解析函数 */
  resolve: () => void
  /** 拒绝函数 */
  reject: (error: unknown) => void
}

interface TokenRequestClient {
  Post<TResponse = unknown>(
    url: string,
    data?: RequestBody,
    config?: ContractRequestConfig
  ): PromiseLike<TResponse>
}

// ==================== 状态管理 ====================

/** 是否正在刷新Token */
let isRefreshing = false
/** 等待中的请求队列 */
let failedQueue: QueuedRequest[] = []

/** Token 刷新成功后的回调 */
let onTokenRefreshedCallback: (() => Promise<void>) | null = null
let routerInstance: Router | null = null

export function setTokenRefreshRouter(router: Router): void {
  routerInstance = router
}

/**
 * 注册 Token 刷新成功后的回调
 * 用于刷新用户上下文（用户信息、权限、菜单）
 *
 * @param callback 回调函数
 *
 * @example
 * ```ts
 * // 在应用初始化时注册
 * setOnTokenRefreshed(async () => {
 *   await loadUserContext()
 * })
 * ```
 */
export function setOnTokenRefreshed(callback: () => Promise<void>): void {
  onTokenRefreshedCallback = callback
}

// ==================== Token存储操作 ====================

// TODO: 安全增强 - Access Token 应迁移到 HttpOnly Cookie
// 当前方案：Access Token 存储在 localStorage，存在 XSS 窃取风险
// 改进方案：
// 1. 后端将 Access Token 设置在 HttpOnly Cookie 中
// 2. 前端通过 credentials: 'include' 自动携带
// 3. 移除 localStorage 中的 token 存储
// 相关文件：wes_backend/app/api/auth.py

/**
 * 获取访问Token
 * @returns 访问Token或null
 */
export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * 设置访问Token
 * @param token 访问Token
 */
export function setAccessToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

/**
 * 移除访问Token
 */
export function removeAccessToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

/**
 * 获取Token过期时间
 * @returns Token过期时间戳或null
 */
export function getTokenExpiresAt(): number | null {
  const expiresAt = localStorage.getItem(TOKEN_EXPIRES_AT_KEY)
  return expiresAt ? Number.parseInt(expiresAt, 10) : null
}

/**
 * 设置Token过期时间
 * @param expiresAt 过期时间戳（毫秒）
 */
export function setTokenExpiresAt(expiresAt: number): void {
  localStorage.setItem(TOKEN_EXPIRES_AT_KEY, expiresAt.toString())
}

/**
 * 移除Token过期时间
 */
export function removeTokenExpiresAt(): void {
  localStorage.removeItem(TOKEN_EXPIRES_AT_KEY)
}

/**
 * 判断Token是否即将过期（5分钟内）
 * @returns 是否即将过期
 */
export function isTokenExpiringSoon(): boolean {
  const expiresAt = getTokenExpiresAt()
  if (!expiresAt) return false
  return Date.now() > expiresAt - 5 * 60 * 1000
}

/**
 * 清除所有Token相关数据
 */
export function clearTokens(): void {
  removeAccessToken()
  removeTokenExpiresAt()
}

// ==================== 请求队列管理 ====================

/**
 * 处理队列中的请求
 * @param error 刷新失败时的错误（如果有）
 */
function processQueue(error?: unknown): void {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve()
    }
  })
  failedQueue = []
}

function finishRefresh(error?: unknown): void {
  isRefreshing = false
  processQueue(error)
}

// ==================== Token刷新 ====================

/**
 * 刷新访问Token
 * @param apiClient Alova实例
 * @returns 新的访问Token
 * @throws 刷新失败时抛出错误
 */
 
export async function refreshAccessToken(apiClient: TokenRequestClient): Promise<string> {
  // 防止并发刷新
  if (isRefreshing) {
    // 如果正在刷新，将请求加入队列等待
    await new Promise<void>((resolve, reject) => {
      failedQueue.push({ resolve, reject })
    })
    // 刷新完成后，返回新Token
    const newToken = getAccessToken()
    if (!newToken) {
      throw new Error('Token刷新失败')
    }
    return newToken
  }

  isRefreshing = true

  try {
    // 调用刷新Token接口
    // 注意：Refresh Token存储在HttpOnly Cookie中，无需手动传递
    const response = await apiClient.Post(AUTH_REFRESH_PATH, {}, {
      meta: {
        isRefreshRequest: true
      }
    }) as RefreshTokenResponse

    if (!response?.access_token) {
      throw new Error('刷新Token响应格式错误')
    }

    // 更新Token
    setAccessToken(response.access_token)

    // 更新Token过期时间
    const expiresInSeconds = response.expires_in || 3600 // 默认1小时
    const expiresAt = Date.now() + expiresInSeconds * 1000
    setTokenExpiresAt(expiresAt)

    // 先结束刷新状态，再释放队列，避免后到请求加入已清空的队列。
    finishRefresh()

    // Token 刷新成功后，刷新用户上下文
    if (onTokenRefreshedCallback) {
      try {
        await onTokenRefreshedCallback()
      } catch (error) {
        console.warn('[Token刷新] 刷新用户上下文失败:', error)
        // 不阻塞，token 已刷新成功
      }
    }

    return response.access_token
  } catch (error) {
    // 刷新失败，清除Token并跳转登录
    clearTokens()

    // 先结束刷新状态，再拒绝队列，避免跳转期间出现无人处理的新 waiter。
    finishRefresh(error)

    // 跳转到登录页
    await redirectToLogin()

    throw error
  }
}

/**
 * 检查Token是否过期并自动刷新
 * @param apiClient Alova实例
 * @returns 是否刷新成功
 */
 
export async function checkAndRefreshToken(apiClient: TokenRequestClient): Promise<boolean> {
  const token = getAccessToken()

  // 没有Token，不刷新
  if (!token) {
    return false
  }

  // Token即将过期，刷新
  if (isTokenExpiringSoon()) {
    try {
      await refreshAccessToken(apiClient)
      return true
    } catch {
      return false
    }
  }

  return false
}

// ==================== 认证状态管理 ====================

/**
 * 检查是否已登录
 * @returns 是否已登录
 */
export function isAuthenticated(): boolean {
  return !!getAccessToken()
}

/**
 * 跳转到登录页
 * @param redirectUrl 登录成功后重定向的URL（默认为当前页）
 */
export async function redirectToLogin(redirectUrl?: string): Promise<void> {
  // 保存当前路径用于登录后重定向
  if (!redirectUrl) {
    redirectUrl = window.location.pathname + window.location.search
  }

  if (redirectUrl && redirectUrl !== '/login') {
    sessionStorage.setItem('redirect_after_login', redirectUrl)
  }

  if (routerInstance) {
    await routerInstance.push('/login')
    return
  }

  window.location.href = '/login'
}

/**
 * 登出
 * @param apiClient Alova实例（可选）
 */
 
export async function logout(apiClient?: TokenRequestClient): Promise<void> {
  // 第一步：调用后端登出接口（此时还有 token，可以正常鉴权）
  if (apiClient) {
    try {
      await apiClient.Post(AUTH_LOGOUT_PATH)
    } catch (error) {
      console.error('调用后端登出接口失败:', error)
      // 即使后端接口失败，也继续执行前端清理
    }
  }

  // 第二步：清除权限
  try {
    clearPermissionState()
  } catch {
    // 忽略清除权限错误
  }

  // 第三步：清除Token
  clearTokens()

  // 第四步：清除其他用户相关数据
  sessionStorage.clear()

  // 第五步：跳转到登录页
  if (routerInstance) {
    await routerInstance.push('/login')
  } else {
    window.location.href = '/login'
  }
}

// ==================== 导出状态（用于测试） ====================

/**
 * 获取当前刷新状态（仅用于测试）
 * @returns 是否正在刷新
 */
export function getRefreshingState(): boolean {
  return isRefreshing
}

/**
 * 获取当前队列长度（仅用于测试）
 * @returns 队列长度
 */
export function getQueueLength(): number {
  return failedQueue.length
}

/**
 * 重置刷新状态（仅用于测试）
 */
export function resetRefreshState(): void {
  isRefreshing = false
  failedQueue = []
}
