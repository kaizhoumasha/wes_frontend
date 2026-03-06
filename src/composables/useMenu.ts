/**
 * 菜单状态管理 Composable
 *
 * 提供菜单树数据管理，支持：
 * - 菜单树加载与缓存（sessionStorage + 5分钟 TTL）
 * - 活动菜单跟踪
 * - 面包屑导航生成
 * - 菜单权限过滤（后端已处理）
 *
 * ## 缓存策略
 *
 * - 使用 sessionStorage 存储菜单树
 * - 缓存键: `menu-tree`, `menu-time`
 * - 缓存过期时间: 5 分钟
 *
 * ## 使用示例
 *
 * ```ts
 * const { menuTree, loadMenus, clearMenus, flatMenuItems } = useMenu()
 *
 * // 加载菜单（登录后调用）
 * await loadMenus()
 *
 * // 强制刷新菜单
 * await loadMenus(true)
 *
 * // 登出时清除菜单
 * clearMenus()
 *
 * // 获取面包屑
 * const breadcrumb = getBreadcrumb('/system/users')
 * ```
 */

import { computed, ref } from 'vue'
import { menuApi } from '@/api/modules/menu'
import type { MenuItem, FlatMenuItem, MenuTreeResponse } from '@/types/menu'
import { toMenuItem, flattenMenuTree, getMenuBreadcrumb as computeBreadcrumb } from '@/types/menu'

// ==================== 常量定义 ====================

/** SessionStorage 菜单缓存键 */
const MENU_CACHE_KEY = 'menu-tree'

/** SessionStorage 菜单缓存时间戳键 */
const MENU_CACHE_TIME_KEY = 'menu-time'

/** 菜单缓存过期时间（5 分钟） */
const MENU_CACHE_TTL = 5 * 60 * 1000

// ==================== 全局状态 ====================

/** 菜单树数据（内存缓存） */
const menuTree = ref<MenuItem[]>([])

/** 扁平化菜单项（用于面包屑导航） */
const flatMenuItems = ref<FlatMenuItem[]>([])

/** 是否正在加载菜单 */
const isLoading = ref(false)

/** 菜单加载错误 */
const loadError = ref<Error | null>(null)

/** 当前选中的菜单路径 */
const selectedPath = ref('')

/** 当前展开的菜单路径数组 */
const openedPaths = ref<string[]>([])

/** 是否已尝试加载过菜单（用于区分"未加载"和"加载后为空"） */
const hasLoaded = ref(false)

// ==================== 计算属性 ====================

/** 菜单是否已加载（只要尝试过加载就返回 true） */
export const isMenuLoaded = computed(() => hasLoaded.value)

// ==================== 菜单管理函数 ====================

/**
 * 菜单状态管理 Hook
 *
 * @returns 菜单状态和方法
 *
 * @example
 * ```ts
 * const {
 *   menuTree,
 *   flatMenuItems,
 *   selectedPath,
 *   openedPaths,
 *   loadMenus,
 *   clearMenus,
 *   selectMenu,
 *   getBreadcrumb
 * } = useMenu()
 *
 * // 登录后加载菜单
 * await loadMenus()
 *
 * // 选中菜单
 * selectMenu('/system/users')
 *
 * // 获取面包屑
 * const breadcrumb = getBreadcrumb('/system/users')
 * ```
 */
export function useMenu() {
  /**
   * 从后端加载菜单树
   *
   * @param forceRefresh 是否强制刷新（忽略缓存）
   * @returns Promise，加载完成时 resolve
   *
   * @example
   * ```ts
   * // 登录后加载菜单
   * await loadMenus()
   *
   * // 强制刷新菜单
   * await loadMenus(true)
   * ```
   */
  const loadMenus = async (forceRefresh = false): Promise<void> => {
    // 检查缓存
    if (!forceRefresh && hasLoaded.value) {
      // 已加载过，直接返回（无论有没有数据）
      return
    }

    if (!forceRefresh) {
      const cached = getMenuFromCache()
      if (cached) {
        setMenuState(cached)
        hasLoaded.value = true
        return
      }
    }

    isLoading.value = true
    loadError.value = null

    try {
      const response = await menuApi.getMenuTree()
      const menus = response.map(toMenuItem)
      setMenuState(menus)
      setMenuToCache(menus)
      hasLoaded.value = true
    } catch (error) {
      loadError.value = error as Error
      throw error
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 注入菜单数据（用于 /auth/my 聚合接口）
   *
   * @param menuResponses 后端菜单树响应
   * @param persist 是否写入缓存（默认 true）
   */
  const hydrateMenus = (menuResponses: MenuTreeResponse[], persist = true): void => {
    const menus = menuResponses.map(toMenuItem)
    setMenuState(menus)
    loadError.value = null
    hasLoaded.value = true
    if (persist) {
      setMenuToCache(menus)
    }
  }

  /**
   * 清除菜单状态
   *
   * 登出时调用，清除内存缓存和 sessionStorage
   *
   * @example
   * ```ts
   * // 登出时清除菜单
   * clearMenus()
   * ```
   */
  const clearMenus = (): void => {
    menuTree.value = []
    flatMenuItems.value = []
    selectedPath.value = ''
    openedPaths.value = []
    loadError.value = null
    hasLoaded.value = false
    sessionStorage.removeItem(MENU_CACHE_KEY)
    sessionStorage.removeItem(MENU_CACHE_TIME_KEY)
  }

  /**
   * 选中菜单
   *
   * 更新当前选中路径，并自动展开父级菜单
   *
   * @param path 菜单路径
   *
   * @example
   * ```ts
   * selectMenu('/system/users')
   * ```
   */
  const selectMenu = (path: string): void => {
    selectedPath.value = path

    // 自动展开父级菜单
    const breadcrumb = computeBreadcrumb(menuTree.value, path)
    const pathsToOpen = breadcrumb.slice(0, -1).map((item) => item.path)
    openedPaths.value = pathsToOpen
  }

  /**
   * 切换菜单展开状态
   *
   * @param path 菜单路径
   */
  const toggleMenu = (path: string): void => {
    const index = openedPaths.value.indexOf(path)
    if (index > -1) {
      openedPaths.value.splice(index, 1)
    } else {
      openedPaths.value.push(path)
    }
  }

  /**
   * 获取面包屑导航
   *
   * @param path 菜单路径
   * @returns 面包屑菜单项数组（从根到当前菜单）
   *
   * @example
   * ```ts
   * const breadcrumb = getBreadcrumb('/system/users')
   * // [
   * //   { title: '系统管理', path: '/system' },
   * //   { title: '用户管理', path: '/system/users' }
   * // ]
   * ```
   */
  const getBreadcrumb = (path: string): MenuItem[] => {
    return computeBreadcrumb(menuTree.value, path)
  }

  /**
   * 根据路径查找菜单项
   *
   * @param path 菜单路径
   * @returns 找到的菜单项，未找到时返回 undefined
   */
  const findMenuItem = (path: string): MenuItem | undefined => {
    function find(menus: MenuItem[]): MenuItem | undefined {
      for (const menu of menus) {
        if (menu.path === path) {
          return menu
        }
        if (menu.children.length > 0) {
          const found = find(menu.children)
          if (found) {
            return found
          }
        }
      }
      return undefined
    }

    return find(menuTree.value)
  }

  /**
   * 检查菜单是否应该展开
   *
   * @param path 菜单路径
   * @returns 是否展开
   */
  const isMenuOpened = (path: string): boolean => {
    return openedPaths.value.includes(path)
  }

  /**
   * 检查菜单是否被选中
   *
   * @param path 菜单路径
   * @returns 是否选中
   */
  const isMenuSelected = (path: string): boolean => {
    return selectedPath.value === path
  }

  // ==================== 辅助函数 ====================

  /** 设置菜单状态 */
  const setMenuState = (menus: MenuItem[]): void => {
    const normalized = normalizeMenuTree(menus)
    menuTree.value = normalized
    flatMenuItems.value = flattenMenuTree(normalized)
  }

  /** 标准化菜单树，兜底修复缺失字段（children/is_hidden） */
  const normalizeMenuTree = (menus: MenuItem[]): MenuItem[] => {
    return menus.map((menu) => ({
      ...menu,
      is_hidden: Boolean(menu.is_hidden),
      children: Array.isArray(menu.children) ? normalizeMenuTree(menu.children) : []
    }))
  }

  /** 从缓存获取菜单 */
  const getMenuFromCache = (): MenuItem[] | null => {
    try {
      const cachedData = sessionStorage.getItem(MENU_CACHE_KEY)
      const cachedTime = sessionStorage.getItem(MENU_CACHE_TIME_KEY)

      if (!cachedData || !cachedTime) {
        return null
      }

      const cacheAge = Date.now() - Number.parseInt(cachedTime, 10)
      if (cacheAge > MENU_CACHE_TTL) {
        // 缓存过期
        sessionStorage.removeItem(MENU_CACHE_KEY)
        sessionStorage.removeItem(MENU_CACHE_TIME_KEY)
        return null
      }

      const parsed = JSON.parse(cachedData)
      if (!Array.isArray(parsed)) {
        return null
      }
      return normalizeMenuTree(parsed as MenuItem[])
    } catch {
      return null
    }
  }

  /** 将菜单写入缓存 */
  const setMenuToCache = (menus: MenuItem[]): void => {
    try {
      sessionStorage.setItem(MENU_CACHE_KEY, JSON.stringify(menus))
      sessionStorage.setItem(MENU_CACHE_TIME_KEY, Date.now().toString())
    } catch (error) {
      console.error('写入菜单缓存失败:', error)
    }
  }

  // ==================== 导出 ====================

  return {
    // 状态
    menuTree: computed(() => menuTree.value),
    flatMenuItems: computed(() => flatMenuItems.value),
    selectedPath: computed(() => selectedPath.value),
    openedPaths: computed(() => openedPaths.value),
    isMenuLoaded,
    isLoading: computed(() => isLoading.value),
    loadError: computed(() => loadError.value),

    // 菜单管理
    loadMenus,
    hydrateMenus,
    clearMenus,

    // 菜单操作
    selectMenu,
    toggleMenu,
    getBreadcrumb,
    findMenuItem,
    isMenuOpened,
    isMenuSelected
  }
}

// ==================== 类型导出 ====================

/** 菜单加载函数类型 */
export type LoadMenusFn = ReturnType<typeof useMenu>['loadMenus']

/** 清除菜单函数类型 */
export type ClearMenusFn = ReturnType<typeof useMenu>['clearMenus']
