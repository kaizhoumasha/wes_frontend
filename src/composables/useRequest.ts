/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 统一请求状态管理 Composable
 * 提供统一的请求状态管理和自动重试功能
 */

import { ref, shallowRef, computed } from 'vue'
import type { Ref } from 'vue'
import { show } from '@/api/services/error-notification'
import { RequestState } from '@/api/types/request'
import { classifyErrorByCode } from '@/api/utils/error-classifier'
import type { ApiError } from '@/api/types/request'

// ==================== 类型定义 ====================

/**
 * useRequest 配置选项
 */
export interface UseRequestOptions<TData = unknown, TError = ApiError> {
  /** 是否立即执行请求 */
  immediate?: boolean
  /** 成功回调 */
  onSuccess?: (data: TData) => void | Promise<void>
  /** 错误回调 */
  onError?: (error: TError) => void | Promise<void>
  /** 最终回调（无论成功失败） */
  onFinally?: () => void | Promise<void>
  /** 是否禁用自动错误通知 */
  silent?: boolean
  /** 最大重试次数 */
  retry?: number
  /** 重试延迟（毫秒） */
  retryDelay?: number
  /** 重试条件函数 */
  shouldRetry?: (error: TError) => boolean
  /** 请求前回调 */
  onBefore?: () => void | Promise<void>
}

/**
 * useRequest 返回值
 */
export interface UseRequestReturn<TData = unknown, TError = ApiError> {
  /** 响应数据 */
  data: Ref<TData | null>
  /** 错误信息 */
  error: Ref<TError | null>
  /** 是否正在加载（首次加载） */
  loading: Ref<boolean>
  /** 是否正在获取（包括刷新） */
  isFetching: Ref<boolean>
  /** 请求状态 */
  status: Ref<RequestState>
  /** 是否成功 */
  isSuccess: Ref<boolean>
  /** 是否失败 */
  isError: Ref<boolean>
  /** 是否为空闲状态 */
  isIdle: Ref<boolean>
  /** 执行请求 */
  execute: (...args: unknown[]) => Promise<TData>
  /** 重试请求 */
  retry: () => Promise<TData>
  /** 重置状态 */
  reset: () => void
  /** 取消请求（如果支持） */
  cancel: () => void
}

// ==================== 辅助函数 ====================

/**
 * 延迟函数
 * @param ms 延迟毫秒数
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ==================== useRequest 实现 ====================

/**
 * 统一请求状态管理 Composable
 * @param requestFn 请求函数或返回Promise的函数
 * @param options 配置选项
 * @returns 请求状态和控制方法
 */
export function useRequest<TData = unknown, TError extends ApiError = ApiError>(
  requestFn: () => Promise<TData>,
  options: UseRequestOptions<TData, TError> = {}
): UseRequestReturn<TData, TError> {
  const {
    immediate = false,
    onSuccess,
    onError,
    onFinally,
    silent = false,
    retry: maxRetries = 0,
    retryDelay = 1000,
    shouldRetry,
    onBefore
  } = options

  // 状态
  const data = shallowRef<TData | null>(null) as Ref<TData | null>
  const error = shallowRef<TError | null>(null) as Ref<TError | null>
  const loading = ref(false)
  const isFetching = ref(false)
  const status = ref<RequestState>(RequestState.IDLE)

  // 当前重试次数
  let currentRetryCount = 0

  // AbortController（用于取消请求）
  let abortController: AbortController | null = null

  // 计算属性
  const isSuccess = computed(() => status.value === RequestState.SUCCESS)
  const isError = computed(() => status.value === RequestState.ERROR)
  const isIdle = computed(() => status.value === RequestState.IDLE)

  /**
   * 执行请求
   */
  const execute = async (...args: unknown[]): Promise<TData> => {
    // 取消之前的请求
    if (abortController) {
      abortController.abort()
    }

    // 创建新的AbortController
    abortController = new AbortController()

    try {
      // 请求前回调
      await onBefore?.()

      // 更新状态
      loading.value = true
      isFetching.value = true
      status.value = RequestState.LOADING
      error.value = null

      // 执行请求
      const result = await requestFn()

      // 成功处理
      data.value = result
      status.value = RequestState.SUCCESS
      currentRetryCount = 0

      // 成功回调
      await onSuccess?.(result)

      return result
    } catch (err) {
      const errorObj = (err as TError) || null
      error.value = errorObj
      status.value = RequestState.ERROR

      // 检查是否应该重试
      const canRetry =
        currentRetryCount < maxRetries &&
        (shouldRetry?.(errorObj) ?? canRetryRequest(errorObj))

      if (canRetry && errorObj) {
        currentRetryCount++
        await delay(retryDelay)
        return execute(...args)
      }

      // 错误通知（除非silent）
      if (!silent && errorObj) {
        await handleErrorNotification(errorObj)
      }

      // 错误回调
      if (errorObj) {
        await onError?.(errorObj)
      }

      throw errorObj
    } finally {
      loading.value = false
      isFetching.value = false
      abortController = null

      // 最终回调
      await onFinally?.()
    }
  }

  /**
   * 重试请求
   */
  const retryExecute = async (): Promise<TData> => {
    currentRetryCount = 0
    return execute()
  }

  /**
   * 重置状态
   */
  const reset = (): void => {
    data.value = null
    error.value = null
    loading.value = false
    isFetching.value = false
    status.value = RequestState.IDLE
    currentRetryCount = 0
  }

  /**
   * 取消请求
   */
  const cancel = (): void => {
    if (abortController) {
      abortController.abort()
      abortController = null
    }
    loading.value = false
    isFetching.value = false
    if (status.value === RequestState.LOADING) {
      status.value = RequestState.IDLE
    }
  }

  // 立即执行
  if (immediate) {
    execute()
  }

  return {
    data,
    error,
    loading,
    isFetching,
    status,
    isSuccess,
    isError,
    isIdle,
    execute,
    retry: retryExecute,
    reset,
    cancel
  }
}

// ==================== 辅助函数 ====================

/**
 * 判断错误是否可以重试
 * @param error 错误对象
 * @returns 是否可以重试
 */
function canRetryRequest(error: unknown): boolean {
  if (!error) return false

  const apiError = error as Partial<ApiError>

  // 网络错误可以重试
  if (apiError.type === 'network' || apiError.type === 'timeout') {
    return true
  }

  // 5xx服务器错误可以重试
  if (apiError.statusCode && apiError.statusCode >= 500 && apiError.statusCode < 600) {
    return true
  }

  // 检查响应码是否可重试
  if (apiError.code !== undefined) {
    const classification = classifyErrorByCode(apiError.code, apiError.message)
    return classification.retryable
  }

  return false
}

/**
 * 处理错误通知
 * @param error 错误对象
 */
async function handleErrorNotification(error: Partial<ApiError>): Promise<void> {
  if (!error) return

  // 如果有响应码，使用响应码分类
  if (error.code !== undefined) {
    const classification = classifyErrorByCode(error.code, error.message)
    await show(classification)
  } else if (error.type === 'network') {
    // 网络错误特殊处理
     
    await show({
      type: 'network' as any,
      severity: 'high' as any,
      userMessage: error.message || '网络连接失败',
      logMessage: error.message || '网络连接失败',
      notificationType: 'message' as any,
      retryable: true,
      requiresAuth: false,

      metadata: {
        code: '0',
        range: '5xxx' as any,
        severity: 'high' as any,
        defaultMessage: '网络连接失败',
        logLevel: 'error' as any,
        retryable: true,
        notificationType: 'message' as any
      }
    })
  } else {
    // 其他错误直接显示消息
     
    await show({
      type: 'unknown' as any,
      severity: 'medium' as any,
      userMessage: error.message || '请求失败',
      logMessage: error.message || '请求失败',
      notificationType: 'message' as any,
      retryable: false,
      requiresAuth: false,

      metadata: {
        code: '0',
        range: '5xxx' as any,
        severity: 'medium' as any,
        defaultMessage: '请求失败',
        logLevel: 'error' as any,
        retryable: false,
        notificationType: 'message' as any
      }
    })
  }
}

/**
 * 快捷方式：创建一个不会立即执行的请求
 */
export function useLazyRequest<TData = unknown, TError extends ApiError = ApiError>(
  requestFn: () => Promise<TData>,
  options?: Omit<UseRequestOptions<TData, TError>, 'immediate'>
): UseRequestReturn<TData, TError> {
  return useRequest(requestFn, { ...options, immediate: false })
}

/**
 * 快捷方式：创建一个自动执行的请求
 */
export function useAutoRequest<TData = unknown, TError extends ApiError = ApiError>(
  requestFn: () => Promise<TData>,
  options?: Omit<UseRequestOptions<TData, TError>, 'immediate'>
): UseRequestReturn<TData, TError> {
  return useRequest(requestFn, { ...options, immediate: true })
}
