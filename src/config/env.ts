/**
 * 环境变量配置 - 单一数据源
 * 所有环境变量在此定义，供组件和非组件模块共同使用
 */
const API_PREFIX = '/api/v1'

type RuntimeImportMetaEnv = Partial<ImportMetaEnv> & {
  DEV?: boolean | string
  PROD?: boolean | string
  MODE?: string
}

function getRuntimeEnv(): RuntimeImportMetaEnv {
  return import.meta.env ?? (globalThis as { process?: { env?: RuntimeImportMetaEnv } }).process?.env ?? {}
}

function parseEnvBoolean(value: boolean | string | undefined): boolean {
  if (typeof value === 'boolean') {
    return value
  }

  return value === 'true'
}

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
    const runtimeEnv = getRuntimeEnv()
    return runtimeEnv.VITE_APP_ENV || runtimeEnv.MODE || 'development'
  },

  /** API 基础 URL */
  get apiBaseUrl() {
    return normalizeApiBaseUrl(getRuntimeEnv().VITE_API_BASE_URL) ?? 'http://localhost:8001'
  },

  /** 应用标题 */
  get appTitle() {
    return getRuntimeEnv().VITE_APP_TITLE || 'P9 MCS'
  },

  /** 是否启用 Mock 数据 */
  get isMock() {
    return getRuntimeEnv().VITE_APP_MOCK === 'true'
  },

  /** 是否为开发环境 */
  get isDev() {
    const runtimeEnv = getRuntimeEnv()
    return runtimeEnv.VITE_APP_DEV === 'true' || parseEnvBoolean(runtimeEnv.DEV)
  },

  /** 是否为生产环境 */
  get isProd() {
    return parseEnvBoolean(getRuntimeEnv().PROD)
  },

  /** 是否为非生产环境 */
  get isNonProd() {
    const runtimeEnv = getRuntimeEnv()
    const appEnv = (runtimeEnv.VITE_APP_ENV || runtimeEnv.MODE || 'development').toLowerCase()
    return !parseEnvBoolean(runtimeEnv.PROD) && appEnv !== 'prod' && appEnv !== 'production'
  }
} as const

// 类型导出
export type EnvConfig = typeof env
export type EnvKey = keyof EnvConfig
