/**
 * 环境变量配置 - 单一数据源
 * 所有环境变量在此定义，供组件和非组件模块共同使用
 */
export const env = {
  /** API 基础 URL */
  get apiBaseUrl() {
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'
  },

  /** WebSocket URL */
  get wsUrl() {
    return import.meta.env.VITE_WS_URL || 'ws://localhost:8001/api/v1/ws'
  },

  /** 应用标题 */
  get appTitle() {
    return import.meta.env.VITE_APP_TITLE || 'P9 WES'
  },

  /** 是否启用 Mock 数据 */
  get isMock() {
    return import.meta.env.VITE_APP_MOCK === 'true'
  },

  /** 是否为开发环境 */
  get isDev() {
    return import.meta.env.VITE_APP_DEV === 'true' || import.meta.env.DEV
  },

  /** 是否为生产环境 */
  get isProd() {
    return import.meta.env.PROD
  },
} as const

// 类型导出
export type EnvConfig = typeof env
export type EnvKey = keyof EnvConfig
