/**
 * 响应式断点常量
 *
 * 与 Tailwind 配置和 CSS 变量保持一致
 * 用于 TypeScript/Vue 组件中的响应式判断
 */

/**
 * 响应式断点定义（单位：px）
 *
 * @see tailwind.config.js - screens 配置
 * @see src/assets/styles/globals.css - CSS 变量定义
 */
export const BREAKPOINTS = {
  /** 小屏设备边界 (>= 480px) */
  SMALL: 480,
  /** 平板/移动端边界 (>= 768px) */
  MOBILE: 768,
  /** 桌面/平板边界 (>= 1280px) */
  DESKTOP: 1280
} as const

/**
 * 响应式断点类型
 */
export type Breakpoint = (typeof BREAKPOINTS)[keyof typeof BREAKPOINTS]

/**
 * 设备类型枚举
 */
export enum DeviceType {
  /** 桌面端 (>= 1280px) */
  DESKTOP = 'desktop',
  /** 平板端 (768px - 1279px) */
  TABLET = 'tablet',
  /** 移动端 (< 768px) */
  MOBILE = 'mobile'
}

/**
 * 根据窗口宽度获取设备类型
 *
 * @param width - 窗口宽度（px）
 * @returns 设备类型
 *
 * @example
 * ```ts
 * getDeviceType(1920) // DeviceType.DESKTOP
 * getDeviceType(1024) // DeviceType.TABLET
 * getDeviceType(375)  // DeviceType.MOBILE
 * ```
 */
export function getDeviceType(width: number): DeviceType {
  if (width >= BREAKPOINTS.DESKTOP) {
    return DeviceType.DESKTOP
  }
  if (width >= BREAKPOINTS.MOBILE) {
    return DeviceType.TABLET
  }
  return DeviceType.MOBILE
}

/**
 * 检查宽度是否匹配断点
 *
 * @param width - 窗口宽度
 * @param breakpoint - 断点常量
 * @returns 是否匹配
 *
 * @example
 * ```ts
 * isBreakpoint(1920, BREAKPOINTS.DESKTOP) // true
 * isBreakpoint(1024, BREAKPOINTS.DESKTOP) // false
 * ```
 */
export function isBreakpoint(width: number, breakpoint: Breakpoint): boolean {
  return width >= breakpoint
}
