/**
 * LRU Cache Composable
 *
 * 提供基于 LRU (Least Recently Used) 策略的缓存功能
 * 当缓存达到最大容量时，自动淘汰最久未使用的条目
 *
 * 性能优化：使用 Map 的原生特性（delete + reinsert）来维护访问顺序
 * - get(): O(1) 原来是 O(n)
 * - set(): O(1) 原来是 O(n)
 * - remove(): O(1) 原来是 O(n)
 *
 * @example
 * ```ts
 * const { cache, get, set, has, remove, clear } = useLruCache<number, User>({ maxSize: 50 })
 *
 * // 存储数据
 * cache.set(1, userData)
 *
 * // 获取数据
 * const user = cache.get(1)
 *
 * // 检查是否存在
 * if (cache.has(1)) { ... }
 *
 * // 删除条目
 * cache.remove(1)
 *
 * // 清空缓存
 * cache.clear()
 * ```
 */

import { shallowRef } from 'vue'

/**
 * LRU 缓存配置
 */
export interface LruCacheOptions<K, V> {
  /** 最大缓存条目数（默认 50） */
  maxSize?: number
  /** 缓存命中时的回调 */
  onHit?: (key: K, value: V) => void
  /** 缓存未命中时的回调 */
  onMiss?: (key: K) => void
  /** 缓存淘汰时的回调 */
  onEvict?: (key: K, value: V) => void
}

/**
 * LRU 缓存实现
 */
export interface LruCache<K, V> {
  /** 获取缓存值 */
  get: (key: K) => V | undefined
  /** 设置缓存值 */
  set: (key: K, value: V) => void
  /** 检查键是否存在 */
  has: (key: K) => boolean
  /** 删除缓存条目 */
  remove: (key: K) => boolean
  /** 清空缓存 */
  clear: () => void
  /** 获取缓存大小 */
  readonly size: number
  /** 获取最大容量 */
  readonly maxSize: number
  /** 获取所有键（按访问顺序，最近访问的在最后） */
  keys: () => K[]
  /** 获取所有值（按访问顺序，最近访问的在最后） */
  values: () => V[]
}

/**
 * 创建 LRU 缓存
 *
 * @param options 缓存配置
 * @returns LRU 缓存实例
 */
export function useLruCache<K extends string | number, V>(
  options: LruCacheOptions<K, V> = {}
): LruCache<K, V> {
  const { maxSize = 50, onHit, onMiss, onEvict } = options

  // 使用 Map 存储数据，Map.prototype.forEach() 按插入顺序迭代
  // 访问顺序：最久未使用的在最前面，最近访问的在最后面
  const cache = shallowRef(new Map<K, V>())

  /**
   * 淘汰最久未使用的条目（Map 第一项）
   */
  function evictLRU() {
    const map = cache.value
    if (map.size === 0) return

    // 获取第一个键（最久未使用的）
    const lruKey = map.keys().next().value as K
    const lruValue = map.get(lruKey)

    map.delete(lruKey)

    if (onEvict && lruValue !== undefined) {
      onEvict(lruKey, lruValue)
    }
  }

  /**
   * 获取缓存值（O(1)）
   */
  function get(key: K): V | undefined {
    const map = cache.value
    const value = map.get(key)

    if (value !== undefined) {
      // 缓存命中：delete + reinsert 将其移到最后（最近访问）
      map.delete(key)
      map.set(key, value)
      onHit?.(key, value)
    } else {
      // 缓存未命中
      onMiss?.(key)
    }

    return value
  }

  /**
   * 设置缓存值（O(1)）
   */
  function set(key: K, value: V) {
    const map = cache.value

    // 如果键已存在，delete 并重新插入到末尾
    if (map.has(key)) {
      map.delete(key)
      map.set(key, value)
      return
    }

    // 如果缓存已满，淘汰最久未使用的条目（第一项）
    if (map.size >= maxSize) {
      evictLRU()
    }

    // 添加新条目到末尾
    map.set(key, value)
  }

  /**
   * 检查键是否存在（O(1)）
   */
  function has(key: K): boolean {
    return cache.value.has(key)
  }

  /**
   * 删除缓存条目（O(1)）
   */
  function remove(key: K): boolean {
    const existed = cache.value.has(key)
    cache.value.delete(key)
    return existed
  }

  /**
   * 清空缓存
   */
  function clear() {
    cache.value.clear()
  }

  /**
   * 获取所有键（按访问顺序，最久未使用的在前）
   */
  function keys(): K[] {
    return Array.from(cache.value.keys())
  }

  /**
   * 获取所有值（按访问顺序，最久未使用的在前）
   */
  function values(): V[] {
    return Array.from(cache.value.values())
  }

  return {
    get,
    set,
    has,
    remove,
    clear,
    get size() {
      return cache.value.size
    },
    maxSize,
    keys,
    values,
  }
}

/**
 * 使用 Map 的简化版本 LRU 缓存
 *
 * 适用于小型缓存场景，使用原生 Map 自动处理 LRU 淘汰
 */
export function useSimpleLruCache<K extends string | number, V>(
  maxSize = 50
): LruCache<K, V> {
  return useLruCache<K, V>({ maxSize })
}
