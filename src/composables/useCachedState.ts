/**
 * 通用缓存状态管理 Composable
 *
 * 提供带 TTL 的状态管理，支持：
 * - 内存缓存（ref）
 * - sessionStorage 持久化
 * - TTL 过期检查
 * - 数据标准化
 * - HMR 状态恢复
 *
 * ## 使用示例
 *
 * ```ts
 * const { state, loadFromCache, saveToCache, clearCache } = useCachedState({
 *   key: 'user_data',
 *   ttl: 5 * 60 * 1000, // 5 分钟
 *   normalizer: (data) => data.map(normalizeUser)
 * })
 *
 * // 加载数据（优先从缓存）
 * await loadData()
 *
 * // 清除缓存
 * clearCache()
 * ```
 */

import { ref, computed } from 'vue'
import { getCachedData, setCachedData, clearCachedData, restoreFromHMR } from '@/constants/cache'

export interface UseCachedStateOptions<T> {
  /** 缓存数据键 */
  key: string
  /** 缓存时间戳键 */
  timeKey: string
  /** 缓存过期时间（毫秒） */
  ttl: number
  /** 数据标准化函数 */
  normalizer?: (data: T[]) => T[]
}

export function useCachedState<T>(options: UseCachedStateOptions<T>) {
  const { key, timeKey, ttl, normalizer } = options

  // 内存缓存
  const state = ref<T[]>([])
  const isLoading = ref(false)
  const loadError = ref<Error | null>(null)

  /**
   * 从缓存获取数据
   */
  const getFromCache = (): T[] | null => {
    const cached = getCachedData<T[]>(key, timeKey, ttl)
    if (!cached) return null
    if (!Array.isArray(cached)) return null
    return normalizer ? normalizer(cached) : cached
  }

  /**
   * 将数据写入缓存
   */
  const saveToCache = (data: T[]): void => {
    setCachedData(key, timeKey, data)
  }

  /**
   * 设置状态并更新缓存
   */
  const setState = (data: T[]): void => {
    const normalized = normalizer ? normalizer(data) : data
    state.value = normalized
    saveToCache(normalized)
  }

  /**
   * 清除缓存
   */
  const clearCache = (): void => {
    state.value = []
    loadError.value = null
    clearCachedData(key, timeKey)
  }

  /**
   * 从 sessionStorage 恢复状态（HMR 支持）
   */
  const restoreState = (): boolean => {
    if (state.value.length > 0) {
      return false // 已有数据，无需恢复
    }

    const restored = restoreFromHMR<T[]>(key, timeKey, normalizer)
    if (restored && Array.isArray(restored) && restored.length > 0) {
      state.value = restored
      return true
    }

    return false
  }

  return {
    state: computed(() => state.value),
    isLoading: computed(() => isLoading.value),
    loadError: computed(() => loadError.value),
    getFromCache,
    saveToCache,
    setState,
    clearCache,
    restoreState
  }
}

/**
 * 类型导出
 */
export type CachedState<T> = ReturnType<typeof useCachedState<T>>['state']
