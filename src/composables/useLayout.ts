/**
 * 布局状态管理 Composable
 *
 * 提供响应式布局状态管理，支持：
 * - 设备类型检测（mobile/tablet/desktop）
 * - 侧边栏折叠状态
 * - 移动端抽屉状态
 * - 响应式行为切换
 *
 * ## 设备断点
 *
 * - Mobile: < 768px
 * - Tablet: 768px - 1279px
 * - Desktop: ≥ 1280px
 *
 * ## 使用示例
 *
 * ```ts
 * const {
 *   sidebarCollapsed,
 *   isMobileMenuOpen,
 *   device,
 *   isMobile,
 *   toggleSidebar,
 *   openMobileMenu,
 *   closeMobileMenu
 * } = useLayout()
 *
 * // 切换侧边栏
 * toggleSidebar()
 *
 * // 移动端打开菜单
 * if (isMobile.value) {
 *   openMobileMenu()
 * }
 * ```
 */

import { ref, computed, watch } from 'vue'
import { useBreakpoints, useStorage } from '@vueuse/core'

// ==================== 常量定义 ====================

/** 响应式断点配置 */
const BREAKPOINTS = {
  mobile: 0,
  tablet: 768,
  desktop: 1280
}

/** LocalStorage 侧边栏状态键 */
const SIDEBAR_COLLAPSED_KEY = 'sidebar_collapsed'

// ==================== 全局状态 ====================

/** 侧边栏折叠状态（持久化到 localStorage） */
const sidebarCollapsed = useStorage(SIDEBAR_COLLAPSED_KEY, false)

/** 移动端菜单打开状态 */
const isMobileMenuOpen = ref(false)

/** 响应式断点 */
const breakpoints = useBreakpoints(BREAKPOINTS)

// ==================== 计算属性 ====================

/** 是否为移动设备（< 768px） */
export const isMobile = breakpoints.smaller('tablet')

/** 是否为平板设备（768px - 1279px） */
export const isTablet = breakpoints.between('tablet', 'desktop')

/** 是否为桌面设备（≥ 1280px） */
export const isDesktop = breakpoints.greaterOrEqual('desktop')

/** 当前设备类型 */
export const device = computed(() => {
  if (isMobile.value) return 'mobile'
  if (isTablet.value) return 'tablet'
  return 'desktop'
})

/** 侧边栏宽度（根据折叠状态和设备类型） */
export const sidebarWidth = computed(() => {
  if (isMobile.value) return 0
  if (sidebarCollapsed.value) return 64
  return 240
})

/** 主内容区左边距（侧边栏宽度） */
export const contentMarginLeft = computed(() => {
  if (isMobile.value) return 0
  return `${sidebarWidth.value}px`
})

// ==================== 响应式行为 ====================

// 监听设备类型变化，自动调整侧边栏状态
watch(device, (newDevice) => {
  // 移动端：强制关闭侧边栏（使用抽屉模式）
  if (newDevice === 'mobile') {
    isMobileMenuOpen.value = false
  }
  // 平板端：默认折叠
  else if (newDevice === 'tablet' && sidebarCollapsed.value === false) {
    // 仅在首次切换到平板时折叠，避免用户手动展开后又被折叠
    // 这里不做自动折叠，保持用户选择
  }
})

// ==================== Composable 函数 ====================

/**
 * 布局状态管理 Hook
 *
 * @returns 布局状态和方法
 *
 * @example
 * ```ts
 * const {
 *   sidebarCollapsed,
 *   isMobileMenuOpen,
 *   device,
 *   isMobile,
 *   isDesktop,
 *   toggleSidebar,
 *   openMobileMenu,
 *   closeMobileMenu
 * } = useLayout()
 * ```
 */
export function useLayout() {
  /**
   * 切换侧边栏折叠状态
   *
   * - Desktop: 切换 240px / 64px
   * - Tablet: 切换 240px / 64px
   * - Mobile: 打开/关闭抽屉
   */
  const toggleSidebar = () => {
    if (isMobile.value) {
      // 移动端：切换抽屉
      isMobileMenuOpen.value = !isMobileMenuOpen.value
    } else {
      // 桌面/平板：切换折叠状态
      sidebarCollapsed.value = !sidebarCollapsed.value
    }
  }

  /**
   * 打开移动端菜单
   */
  const openMobileMenu = () => {
    isMobileMenuOpen.value = true
  }

  /**
   * 关闭移动端菜单
   */
  const closeMobileMenu = () => {
    isMobileMenuOpen.value = false
  }

  /**
   * 设置侧边栏折叠状态
   *
   * @param collapsed 是否折叠
   */
  const setSidebarCollapsed = (collapsed: boolean) => {
    sidebarCollapsed.value = collapsed
  }

  // ==================== 导出 ====================

  return {
    // 状态
    sidebarCollapsed: computed(() => sidebarCollapsed.value),
    isMobileMenuOpen: computed(() => isMobileMenuOpen.value),
    device,
    isMobile: computed(() => isMobile.value),
    isTablet: computed(() => isTablet.value),
    isDesktop: computed(() => isDesktop.value),
    sidebarWidth,
    contentMarginLeft,

    // 方法
    toggleSidebar,
    openMobileMenu,
    closeMobileMenu,
    setSidebarCollapsed
  }
}

// ==================== 类型导出 ====================

/** 设备类型 */
export type DeviceType = 'mobile' | 'tablet' | 'desktop'
