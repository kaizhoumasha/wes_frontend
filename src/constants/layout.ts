/**
 * 布局相关常量
 * 
 * 统一管理 CLS 优化中使用的硬编码尺寸值
 */

/** 表格容器最小高度（CLS 预留空间） */
export const TABLE_MIN_HEIGHT = 600 as const

/** 表格组件最小高度（CLS 预留空间） */
export const TABLE_COMPONENT_MIN_HEIGHT = 400 as const

/** 表格 body-wrapper 最小高度（CLS 预留空间） */
export const TABLE_BODY_MIN_HEIGHT = 300 as const

/** 空状态容器最小高度（CLS 预留空间） */
export const TABLE_EMPTY_MIN_HEIGHT = 120 as const

/** 分页器固定高度（CLS 预留空间） */
export const PAGINATION_HEIGHT = 56 as const

/** z-index 层级 */
export const Z_INDEX = {
  sidebar: 1000,
  overlay: 1001,
  fullscreen: 2000
} as const

/** 过渡动画时长（毫秒） */
export const TRANSITION_DURATION = {
  skeletonFade: 300,
  tableFade: 300,
  tableFadeDelay: 200
} as const
