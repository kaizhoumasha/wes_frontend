/**
 * StandardDialog 常量定义
 */

import type { DialogSize, SizeConfig, TitleIconType } from './types'

export const SIZE_CONFIG: Record<DialogSize, SizeConfig> = {
  xs: {
    width: 400,
    maxWidth: 90 // vw
  },
  sm: {
    width: 520,
    maxWidth: 90
  },
  md: {
    width: 640,
    maxWidth: 90
  },
  lg: {
    width: 800,
    maxWidth: 90
  },
  xl: {
    width: 900,
    maxWidth: 85
  },
  full: {
    width: 0, // 不使用固定宽度
    maxWidth: 95
  }
} as const

/** 响应式断点 */
export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1280
} as const

/** 对话框各区域高度 */
export const DIALOG_DIMENSIONS = {
  HEADER_HEIGHT: 56,
  FOOTER_HEIGHT: 64,
  MAX_HEIGHT_VH: 85
} as const

/** 标题图标配置 */
export const TITLE_ICON_CONFIG: Record<TitleIconType, { icon: string; class: string }> = {
  warning: {
    icon: 'lucide:triangle-alert',
    class: 'text-amber-500'
  },
  danger: {
    icon: 'lucide:circle-alert',
    class: 'text-red-500'
  },
  info: {
    icon: 'lucide:info',
    class: 'text-blue-500'
  },
  success: {
    icon: 'lucide:circle-check',
    class: 'text-green-500'
  }
} as const
