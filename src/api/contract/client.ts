import { apiClient } from '@/api/client'
import type {
  ContractPathWithMethod,
  ContractPathParams,
  ContractRequestConfig,
  ContractRequestOptions,
  ContractResponseData,
} from './types'
import type { RequestBody, RequestParams } from '@/api/types/request'

/**
 * 当前契约客户端支持的 HTTP 方法。
 */
type RequestMethod = 'get' | 'post' | 'put' | 'patch' | 'delete'

/**
 * 将 OpenAPI 模板路径与 path params 合成为实际请求 URL。
 */
function buildUrlWithPathParams<
  TMethod extends RequestMethod,
  TPath extends ContractPathWithMethod<TMethod>,
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
function buildConfig<TQuery>(
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

/**
 * 契约层统一请求入口。
 *
 * 负责：
 * - 校验 path 与 method 的类型匹配
 * - 展开路径参数
 * - 合并 query/config
 * - 调用底层 alova 客户端
 */
async function sendRequest<
  TMethod extends RequestMethod,
  TPath extends ContractPathWithMethod<TMethod>,
>(
  path: TPath,
  method: TMethod,
  options: ContractRequestOptions<TPath, TMethod> = {} as ContractRequestOptions<TPath, TMethod>
): Promise<ContractResponseData<TPath, TMethod>> {
  const url = buildUrlWithPathParams(path, options.params as ContractPathParams<TPath, TMethod> | undefined)
  const config = buildConfig(options.query, options.config)
  const body = options.body as RequestBody | undefined

  switch (method) {
    case 'get':
      return await apiClient.Get<ContractResponseData<TPath, TMethod>>(url, config)
    case 'post':
      return await apiClient.Post<ContractResponseData<TPath, TMethod>>(url, body, config)
    case 'put':
      return await apiClient.Put<ContractResponseData<TPath, TMethod>>(url, body, config)
    case 'patch':
      return await apiClient.Patch<ContractResponseData<TPath, TMethod>>(url, body, config)
    case 'delete':
      return await apiClient.Delete<ContractResponseData<TPath, TMethod>>(url, body, config)
    default:
      throw new Error(`Unsupported contract method: ${String(method)}`)
  }
}

/**
 * 基于 OpenAPI 契约的类型安全请求客户端。
 *
 * 每个方法只允许调用契约中真实支持该 HTTP method 的路径。
 */
export const contractClient = {
  request: sendRequest,

  get<TPath extends ContractPathWithMethod<'get'>>(
    path: TPath,
    options?: ContractRequestOptions<TPath, 'get'>
  ): Promise<ContractResponseData<TPath, 'get'>> {
    return sendRequest(path, 'get', options)
  },

  post<TPath extends ContractPathWithMethod<'post'>>(
    path: TPath,
    options?: ContractRequestOptions<TPath, 'post'>
  ): Promise<ContractResponseData<TPath, 'post'>> {
    return sendRequest(path, 'post', options)
  },

  put<TPath extends ContractPathWithMethod<'put'>>(
    path: TPath,
    options?: ContractRequestOptions<TPath, 'put'>
  ): Promise<ContractResponseData<TPath, 'put'>> {
    return sendRequest(path, 'put', options)
  },

  patch<TPath extends ContractPathWithMethod<'patch'>>(
    path: TPath,
    options?: ContractRequestOptions<TPath, 'patch'>
  ): Promise<ContractResponseData<TPath, 'patch'>> {
    return sendRequest(path, 'patch', options)
  },

  delete<TPath extends ContractPathWithMethod<'delete'>>(
    path: TPath,
    options?: ContractRequestOptions<TPath, 'delete'>
  ): Promise<ContractResponseData<TPath, 'delete'>> {
    return sendRequest(path, 'delete', options)
  }
}
