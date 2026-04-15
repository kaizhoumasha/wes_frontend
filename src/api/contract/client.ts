import { apiClient } from '@/api/client'
import type {
  ContractPathWithMethod,
  ContractRequestOptions,
  ContractResponseData,
} from './types'
import {
  createContractMethodContext,
  type ContractRequestMethod
} from './helpers'

function dispatchContractMethod<
  TMethod extends ContractRequestMethod,
  TPath extends ContractPathWithMethod<TMethod>,
>(
  path: TPath,
  method: TMethod,
  options: ContractRequestOptions<TPath, TMethod> = {} as ContractRequestOptions<TPath, TMethod>
) {
  const { url, config, body } = createContractMethodContext(path, options)

  switch (method) {
    case 'get':
      return apiClient.Get<ContractResponseData<TPath, TMethod>>(url, config)
    case 'post':
      return apiClient.Post<ContractResponseData<TPath, TMethod>>(url, body, config)
    case 'put':
      return apiClient.Put<ContractResponseData<TPath, TMethod>>(url, body, config)
    case 'patch':
      return apiClient.Patch<ContractResponseData<TPath, TMethod>>(url, body, config)
    case 'delete':
      return apiClient.Delete<ContractResponseData<TPath, TMethod>>(url, body, config)
    default:
      throw new Error(`Unsupported contract method: ${String(method)}`)
  }
}


export type ContractMethodInstance<
  TMethod extends ContractRequestMethod,
  TPath extends ContractPathWithMethod<TMethod>
> = ReturnType<typeof dispatchContractMethod<TMethod, TPath>>

/**
 * 契约层 method 工厂。
 *
 * 对齐 alova 最佳实践：
 * - 统一管理 method 创建逻辑
 * - 为 cache / CSIL / 状态操作保留稳定 method 边界
 * - 与现有 promise 风格 contractClient 并存，渐进演进
 */
export const contractMethods = {
  request: dispatchContractMethod,

  get<TPath extends ContractPathWithMethod<'get'>>(
    path: TPath,
    options?: ContractRequestOptions<TPath, 'get'>
  ) {
    return dispatchContractMethod(path, 'get', options)
  },

  post<TPath extends ContractPathWithMethod<'post'>>(
    path: TPath,
    options?: ContractRequestOptions<TPath, 'post'>
  ) {
    return dispatchContractMethod(path, 'post', options)
  },

  put<TPath extends ContractPathWithMethod<'put'>>(
    path: TPath,
    options?: ContractRequestOptions<TPath, 'put'>
  ) {
    return dispatchContractMethod(path, 'put', options)
  },

  patch<TPath extends ContractPathWithMethod<'patch'>>(
    path: TPath,
    options?: ContractRequestOptions<TPath, 'patch'>
  ) {
    return dispatchContractMethod(path, 'patch', options)
  },

  delete<TPath extends ContractPathWithMethod<'delete'>>(
    path: TPath,
    options?: ContractRequestOptions<TPath, 'delete'>
  ) {
    return dispatchContractMethod(path, 'delete', options)
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
 *
 * 保持现有 Promise 风格接口，兼容现有业务层调用。
 */
async function sendRequest<
  TMethod extends ContractRequestMethod,
  TPath extends ContractPathWithMethod<TMethod>,
>(
  path: TPath,
  method: TMethod,
  options: ContractRequestOptions<TPath, TMethod> = {} as ContractRequestOptions<TPath, TMethod>
): Promise<ContractResponseData<TPath, TMethod>> {
  return await contractMethods.request(path, method, options)
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
