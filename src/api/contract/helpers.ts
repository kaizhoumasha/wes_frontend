import type {
  ContractPathWithMethod,
  ContractPathParams,
  ContractRequestConfig,
  ContractRequestOptions
} from './types'
import type { RequestBody, RequestParams } from '@/api/types/request'

export type ContractRequestMethod = 'get' | 'post' | 'put' | 'patch' | 'delete'

export interface ContractMethodContext {
  url: string
  config: ContractRequestConfig | undefined
  body: RequestBody | undefined
}

/**
 * 将 OpenAPI 模板路径与 path params 合成为实际请求 URL。
 */
export function buildUrlWithPathParams<
  TMethod extends ContractRequestMethod,
  TPath extends ContractPathWithMethod<TMethod>
>(
  path: TPath,
  pathParams?: ContractPathParams<TPath, TMethod>
): string {
  if (!pathParams) {
    return path
  }

  return path.replace(/\{([^}]+)\}/g, (_, rawKey: string) => {
    const key = rawKey as keyof typeof pathParams
    const value = pathParams[key]

    if (value === undefined || value === null) {
      throw new Error(`Missing path parameter: ${String(key)}`)
    }

    return encodeURIComponent(String(value))
  })
}

/**
 * 将契约层 query 参数合并到底层请求配置中。
 */
export function buildConfig<TQuery>(
  query: TQuery | undefined,
  config: ContractRequestConfig | undefined
): ContractRequestConfig | undefined {
  if (!query) {
    return config
  }

  return {
    ...config,
    params: query as RequestParams
  }
}

export function createContractMethodContext<
  TMethod extends ContractRequestMethod,
  TPath extends ContractPathWithMethod<TMethod>
>(
  path: TPath,
  options: ContractRequestOptions<TPath, TMethod> = {} as ContractRequestOptions<TPath, TMethod>
): ContractMethodContext {
  return {
    url: buildUrlWithPathParams(path, options.params as ContractPathParams<TPath, TMethod> | undefined),
    config: buildConfig(options.query, options.config),
    body: options.body as RequestBody | undefined
  }
}
