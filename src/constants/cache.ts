/**
 * 缓存相关常量配置
 *
 * 统一管理各模块的缓存 TTL 和存储键，避免魔法数字散落各处
 */

/** SessionStorage 缓存前缀 */
export const CACHE_KEY_PREFIX = 'wes_'

/** 默认缓存过期时间（5 分钟） */
export const DEFAULT_CACHE_TTL = 5 * 60 * 1000

/** 权限缓存相关 */
export const PERMISSION_CACHE = {
  /** 权限数据键 */
  KEY: `${CACHE_KEY_PREFIX}user_permissions`,
  /** 缓存时间戳键 */
  TIME_KEY: `${CACHE_KEY_PREFIX}user_permissions_time`,
  /** 缓存过期时间 */
  TTL: DEFAULT_CACHE_TTL
} as const

/** 菜单缓存相关 */
export const MENU_CACHE = {
  /** 菜单数据键 */
  KEY: `${CACHE_KEY_PREFIX}menu-tree`,
  /** 缓存时间戳键 */
  TIME_KEY: `${CACHE_KEY_PREFIX}menu-time`,
  /** 缓存过期时间 */
  TTL: DEFAULT_CACHE_TTL
} as const

/** 布局状态缓存相关 */
export const LAYOUT_CACHE = {
  /** 侧边栏折叠状态键 */
  SIDEBAR_COLLAPSED_KEY: 'sidebar_collapsed'
} as const

/**
 * 通用缓存辅助函数
 */

/** 从 sessionStorage 获取带过期检查的缓存数据 */
export function getCachedData<T>(
  key: string,
  timeKey: string,
  ttl: number
): T | null {
  try {
    const cachedData = sessionStorage.getItem(key)
    const cachedTime = sessionStorage.getItem(timeKey)

    if (!cachedData || !cachedTime) {
      return null
    }

    const cacheAge = Date.now() - Number.parseInt(cachedTime, 10)
    if (cacheAge > ttl) {
      sessionStorage.removeItem(key)
      sessionStorage.removeItem(timeKey)
      return null
    }

    return JSON.parse(cachedData) as T
  } catch {
    return null
  }
}

/** 将数据写入 sessionStorage 缓存 */
export function setCachedData<T>(
  key: string,
  timeKey: string,
  data: T
): void {
  try {
    sessionStorage.setItem(key, JSON.stringify(data))
    sessionStorage.setItem(timeKey, Date.now().toString())
  } catch (error) {
    console.error(`写入缓存失败 [${key}]:`, error)
  }
}

/** 清除指定缓存 */
export function clearCachedData(
  ...keys: string[]
): void {
  keys.forEach((key) => sessionStorage.removeItem(key))
}

/**
 * HMR 状态恢复工具
 *
 * 当 Vite 热更新导致模块重新加载时，模块级 ref 会重置为空。
 * 此函数用于从 sessionStorage 恢复状态（无需重新请求 API）。
 *
 * @param cacheKey 缓存数据键
 * @param timeKey 缓存时间戳键
 * @param normalizeFn 数据标准化函数（可选）
 * @returns 缓存的数据，不存在时返回 null
 *
 * @example
 * ```ts
 * const menus = ref<MenuItem[]>([])
 * const cached = restoreFromHMR(
 *   MENU_CACHE.KEY,
 *   MENU_CACHE.TIME_KEY,
 *   normalizeMenuTree
 * )
 * if (cached) {
 *   menus.value = cached
 * }
 * ```
 */
export function restoreFromHMR<T, R = T>(
  cacheKey: string,
  timeKey: string,
  normalizeFn?: (data: T) => R
): R | null {
  const hasCached = sessionStorage.getItem(cacheKey) !== null
  const hasCachedTime = sessionStorage.getItem(timeKey) !== null

  if (!hasCached || !hasCachedTime) {
    return null
  }

  try {
    const cachedData = sessionStorage.getItem(cacheKey)
    if (!cachedData) return null

    const parsed = JSON.parse(cachedData) as T
    return normalizeFn ? normalizeFn(parsed) : (parsed as unknown as R)
  } catch {
    return null
  }
}

