import { computed, type ComputedRef } from 'vue'
import { env } from '@/config/env'

/**
 * 环境变量的响应式引用类型
 */
type EnvRefs = {
  [K in keyof typeof env]: ComputedRef<(typeof env)[K]>
}

/**
 * 环境变量访问组合式函数
 * 从 env.ts 读取环境变量，提供响应式访问
 *
 * @example
 * const { apiBaseUrl, isDev } = useEnv()
 */
export function useEnv(): EnvRefs {
  // 使用 Object.fromEntries 避免类型推断问题
  return Object.fromEntries(
    (Object.keys(env) as Array<keyof typeof env>).map(key => [
      key,
      computed(() => env[key])
    ])
  ) as EnvRefs
}
