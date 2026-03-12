/**
 * 响应式布局检测 Composable
 *
 * 提供纯功能性的响应式断点检测，不包含 UI 状态管理
 * 可被 useLayout、组件等复用
 *
 * ## 断点规范
 *
 * - Mobile: < 768px
 * - Tablet: 768px - 1279px
 * - Desktop: ≥ 1280px
 *
 * ## 使用示例
 *
 * ```ts
 * import { useResponsiveLayout } from '@/composables/useResponsiveLayout'
 *
 * const {
 *   device,
 *   isMobile,
 *   isTablet,
 *   isDesktop,
 *   breakpoint,
 *   matchesBreakpoint
 * } = useResponsiveLayout()
 *
 * // 响应式显示不同内容
 * if (isMobile.value) {
 *   // 移动端逻辑
 * }
 *
 * // 动态匹配断点
 * const matchesTablet = matchesBreakpoint(BREAKPOINTS.MOBILE)
 * ```
 *
 * ## 与 useLayout 的区别
 *
 * - `useResponsiveLayout`: **纯响应式检测**，无状态，可随处使用
 * - `useLayout`: **布局状态管理**，包含侧边栏、菜单等 UI 状态
 */

import { computed } from 'vue'
import { useBreakpoints, useWindowSize } from '@vueuse/core'
import { BREAKPOINTS, getDeviceType, DeviceType } from '@/constants/breakpoints'

// ==================== 全局状态 ====================

/**
 * 当前窗口宽度（px）
 */
const { width: windowWidth } = useWindowSize()

/**
 * 响应式断点实例（单例，所有 composable 共享）
 */
const breakpoints = useBreakpoints({
  small: BREAKPOINTS.SMALL,
  mobile: BREAKPOINTS.MOBILE,
  desktop: BREAKPOINTS.DESKTOP
})

/**
 * 是否为移动设备（< 768px）
 */
export const isMobile = breakpoints.smaller('mobile')

/**
 * 是否为平板设备（768px - 1279px）
 */
export const isTablet = breakpoints.between('mobile', 'desktop')

/**
 * 是否为桌面设备（≥ 1280px）
 */
export const isDesktop = breakpoints.greaterOrEqual('desktop')

/**
 * 是否为小屏设备（< 480px）
 */
export const isSmall = breakpoints.smaller('small')

/**
 * 当前设备类型
 */
export const device = computed<DeviceType>(() => {
  if (isMobile.value) return DeviceType.MOBILE
  if (isTablet.value) return DeviceType.TABLET
  return DeviceType.DESKTOP
})

/**
 * 当前断点值
 */
export const breakpoint = computed(() => {
  if (isSmall.value) return BREAKPOINTS.SMALL
  if (isMobile.value) return BREAKPOINTS.MOBILE
  return BREAKPOINTS.DESKTOP
})

// ==================== Composable 函数 ====================

/**
 * 响应式布局检测 Hook
 *
 * @returns 响应式布局状态
 *
 * @example
 * ```ts
 * // 基础用法
 * const { isMobile, isTablet, device } = useResponsiveLayout()
 *
 * // 动态匹配断点
 * const { matchesBreakpoint, matchesRange } = useResponsiveLayout()
 * const isSmallScreen = matchesBreakpoint(BREAKPOINTS.SMALL)
 * const isTabletRange = matchesRange(BREAKPOINTS.MOBILE, BREAKPOINTS.DESKTOP)
 * ```
 */
export function useResponsiveLayout() {
  /**
   * 检查当前宽度是否匹配指定断点
   *
   * @param bp - 断点常量（BREAKPOINTS.SMALL | BREAKPOINTS.MOBILE | BREAKPOINTS.DESKTOP）
   * @returns 是否匹配
   *
   * @example
   * ```ts
   * const { matchesBreakpoint } = useResponsiveLayout()
   * const isMobile = matchesBreakpoint(BREAKPOINTS.MOBILE) // width >= 768px
   * ```
   */
  function matchesBreakpoint(bp: number): boolean {
    return windowWidth.value >= bp
  }

  /**
   * 检查当前宽度是否在指定范围内
   *
   * @param min - 最小断点
   * @param max - 最大断点
   * @returns 是否在范围内
   *
   * @example
   * ```ts
   * const { matchesRange } = useResponsiveLayout()
   * const isTablet = matchesRange(BREAKPOINTS.MOBILE, BREAKPOINTS.DESKTOP) // 768px - 1279px
   * ```
   */
  function matchesRange(min: number, max: number): boolean {
    return windowWidth.value >= min && windowWidth.value < max
  }

  /**
   * 获取当前设备类型
   *
   * @returns 设备类型
   */
  function getCurrentDevice(): DeviceType {
    return getDeviceType(windowWidth.value)
  }

  /**
   * 检查是否为指定设备类型
   *
   * @param type - 设备类型
   * @returns 是否匹配
   *
   * @example
   * ```ts
   * const { isDevice } = useResponsiveLayout()
   * const isMobileDevice = isDevice(DeviceType.MOBILE)
   * ```
   */
  function isDevice(type: DeviceType): boolean {
    return device.value === type
  }

  // ==================== 导出 ====================

  return {
    // 当前状态
    windowWidth,
    breakpoint,
    device,
    isSmall,
    isMobile,
    isTablet,
    isDesktop,

    // 工具方法
    matchesBreakpoint,
    matchesRange,
    getCurrentDevice,
    isDevice
  }
}

// ==================== 类型导出 ====================

/**
 * 响应式布局状态类型
 */
export type ResponsiveLayoutState = ReturnType<typeof useResponsiveLayout>

/**
 * 设备类型（从 constants/breakpoints.ts 重新导出）
 */
export { DeviceType } from '@/constants/breakpoints'
