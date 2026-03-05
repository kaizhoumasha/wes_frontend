/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Token刷新服务
 * 处理401错误时的静默Token刷新和请求队列管理
 */

import { getApiPath } from '../client'
import router from '@/router'

// ==================== 常量定义 ====================

/** Token存储键 */
export const TOKEN_KEY = 'access_token' as const
/** Refresh Token存储键（HttpOnly Cookie，不存储在localStorage） */
export const REFRESH_TOKEN_COOKIE = 'refresh_token' as const
/** Token过期时间存储键 */
export const TOKEN_EXPIRES_AT_KEY = 'token_expires_at' as const

/** 刷新Token的API端点 */
const REFRESH_ENDPOINT = getApiPath('/auth/refresh')

// ==================== 类型定义 ====================

/**
 * 请求队列项
 */
 
interface QueuedRequest {
  /** 请求方法 */
  method: any
   
  /** 解析函数 */
  resolve: (value: any) => void
  /** 拒绝函数 */
  reject: (error: unknown) => void
}

// ==================== 状态管理 ====================

/** 是否正在刷新Token */
let isRefreshing = false
/** 等待中的请求队列 */
let failedQueue: QueuedRequest[] = []

// ==================== Token存储操作 ====================

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
      resolve(undefined)
    }
  })
  failedQueue = []
}

/**
 * 添加请求到队列
 * @param method 请求方法
 * @returns Promise，当Token刷新后resolve
 */
 
export function enqueueRequest(method: any): Promise<any> {
  return new Promise<any>((resolve, reject) => {
    failedQueue.push({ method, resolve, reject })
  })
}

// ==================== Token刷新 ====================

/**
 * 刷新访问Token
 * @param apiClient Alova实例
 * @returns 新的访问Token
 * @throws 刷新失败时抛出错误
 */
 
export async function refreshAccessToken(apiClient: any): Promise<string> {
  // 防止并发刷新
  if (isRefreshing) {
    // 如果正在刷新，将请求加入队列等待
    await new Promise<any>((resolve, reject) => {
      failedQueue.push({ method: null, resolve, reject })
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
    const response = await apiClient.Post(REFRESH_ENDPOINT, {})

    // 解析响应（alova会自动提取data字段）
    const data = response

    if (!data || !data.access_token) {
      throw new Error('刷新Token响应格式错误')
    }

    // 更新Token
    setAccessToken(data.access_token)

    // 更新Token过期时间
    const expiresInSeconds = data.expires_in || 3600 // 默认1小时
    const expiresAt = Date.now() + expiresInSeconds * 1000
    setTokenExpiresAt(expiresAt)

    // 处理队列中的请求（全部成功）
    processQueue()

    return data.access_token
  } catch (error) {
    // 刷新失败，清除Token并跳转登录
    clearTokens()

    // 处理队列中的请求（全部失败）
    processQueue(error)

    // 跳转到登录页
    await redirectToLogin()

    throw error
  } finally {
    isRefreshing = false
  }
}

/**
 * 检查Token是否过期并自动刷新
 * @param apiClient Alova实例
 * @returns 是否刷新成功
 */
 
export async function checkAndRefreshToken(apiClient: any): Promise<boolean> {
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

  // 跳转到登录页
  await router.push('/login')
}

/**
 * 登出
 * @param apiClient Alova实例（可选）
 */
 
export async function logout(apiClient?: any): Promise<void> {
  // 清除Token
  clearTokens()

  // 清除其他用户相关数据
  sessionStorage.clear()

  // 如果有apiClient，调用登出接口
  if (apiClient) {
    try {
      await apiClient.Post(getApiPath('/auth/logout'))
    } catch {
      // 忽略登出接口错误
    }
  }

  // 跳转到登录页
  await router.push('/login')
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
