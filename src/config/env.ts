/**
 * 环境变量配置 - 单一数据源
 * 所有环境变量在此定义，供组件和非组件模块共同使用
 */
const API_PREFIX = '/api/v1'

function normalizeApiBaseUrl(value: string | undefined): string | undefined {
  if (value === undefined || value === '') {
    return value
  }

  const normalized = value.replace(/\/+$/, '')

  if (normalized === API_PREFIX) {
    return ''
  }

  if (normalized.endsWith(API_PREFIX)) {
    return normalized.slice(0, -API_PREFIX.length)
  }

  return normalized
}

export const env = {
  /** 应用运行环境 */
  get appEnv() {
    return import.meta.env.VITE_APP_ENV || import.meta.env.MODE || 'development'
  },

  /** API 基础 URL */
  get apiBaseUrl() {
    return normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL) ?? 'http://localhost:8001'
  },

  /** SSE 实时事件流 URL */
  get sseUrl() {
    return import.meta.env.VITE_SSE_URL ?? 'http://localhost:8001/api/v1/sys/events/stream'
  },

  /** 应用标题 */
  get appTitle() {
    return import.meta.env.VITE_APP_TITLE || 'P9 MCS'
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

  /** 是否为非生产环境 */
  get isNonProd() {
    const appEnv = (
      import.meta.env.VITE_APP_ENV ||
      import.meta.env.MODE ||
      'development'
    ).toLowerCase()
    return !import.meta.env.PROD && appEnv !== 'prod' && appEnv !== 'production'
  }
} as const

// 类型导出
export type EnvConfig = typeof env
export type EnvKey = keyof EnvConfig
