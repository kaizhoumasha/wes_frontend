import type { components, paths } from '@/api/generated/openapi-types'
import type { FullRequestConfig } from '@/api/types/request'

/**
 * 契约层当前统一支持的 HTTP 方法集合。
 */
type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete'

type NonUndefined<T> = Exclude<T, undefined>

type ResponseMap<
  TPath extends ContractPath,
  TMethod extends HttpMethod,
> = ContractOperation<TPath, TMethod> extends { responses: infer TResponses } ? TResponses : never

type JsonContent<T> = T extends { content: { 'application/json': infer TJson } } ? TJson : never

type JsonRequestBody<T> = [NonUndefined<T>] extends [never]
  ? never
  : NonUndefined<T> extends { content: { 'application/json': infer TJson } }
    ? TJson
    : never

type PreferredSuccessResponse<TResponses> =
  200 extends keyof TResponses ? TResponses[200]
    : 201 extends keyof TResponses ? TResponses[201]
      : 202 extends keyof TResponses ? TResponses[202]
        : 204 extends keyof TResponses ? TResponses[204]
          : never

type ContractApiResponseEnvelope<TData = unknown> = {
  code: string
  message: string
  timestamp?: string
  data?: TData | null
}

/**
 * 生成的 OpenAPI `paths` 类型别名。
 */
export type ContractPaths = paths

/**
 * 生成的 OpenAPI `components` 类型别名。
 */
export type ContractComponents = components

/**
 * OpenAPI 契约中所有合法路径。
 */
export type ContractPath = keyof ContractPaths

/**
 * 过滤出支持指定 HTTP 方法的路径集合。
 */
export type ContractPathWithMethod<TMethod extends HttpMethod> = {
  [TPath in ContractPath]: ContractOperation<TPath, TMethod> extends never ? never : TPath
}[ContractPath]

/**
 * OpenAPI schema 名称集合。
 */
export type ContractSchemaName = keyof ContractComponents['schemas']

/**
 * 按 schema 名称获取 OpenAPI 组件类型。
 */
export type ContractSchema<TName extends ContractSchemaName> = ContractComponents['schemas'][TName]

/**
 * 获取指定路径 + 方法对应的原始 operation 类型。
 */
export type ContractOperation<
  TPath extends ContractPath,
  TMethod extends HttpMethod,
> = NonUndefined<ContractPaths[TPath][TMethod]>

/**
 * 获取某个路径真实支持的方法集合。
 */
export type ContractMethodForPath<TPath extends ContractPath> = {
  [TMethod in HttpMethod]: ContractOperation<TPath, TMethod> extends never ? never : TMethod
}[HttpMethod]

/**
 * 获取路径参数类型，例如 `{ id: number }`。
 */
export type ContractPathParams<
  TPath extends ContractPath,
  TMethod extends HttpMethod,
> = ContractOperation<TPath, TMethod> extends {
  parameters: { path: infer TPathParams }
}
  ? TPathParams
  : never

/**
 * 获取 query 参数类型。
 */
export type ContractQueryParams<
  TPath extends ContractPath,
  TMethod extends HttpMethod,
> = ContractOperation<TPath, TMethod> extends {
  parameters: { query?: infer TQuery }
}
  ? TQuery
  : never

/**
 * 获取 JSON 请求体类型。
 */
export type ContractRequestBody<
  TPath extends ContractPath,
  TMethod extends HttpMethod,
> = JsonRequestBody<
  ContractOperation<TPath, TMethod> extends { requestBody?: infer TRequestBody }
    ? TRequestBody
    : never
>

/**
 * 获取成功响应的原始 JSON body 类型。
 */
export type ContractResponseBody<
  TPath extends ContractPath,
  TMethod extends HttpMethod,
> = JsonContent<PreferredSuccessResponse<ResponseMap<TPath, TMethod>>>

/**
 * 获取业务层真正消费的响应数据类型。
 *
 * 规则：
 * - 若响应结构为 `{ data: ... }`，自动解包 `data`
 * - 否则直接返回原始响应体
 */
export type ContractResponseData<
  TPath extends ContractPath,
  TMethod extends HttpMethod,
> = ContractResponseBody<TPath, TMethod> extends ContractApiResponseEnvelope<infer TData>
  ? NonNullable<TData>
  : ContractResponseBody<TPath, TMethod>

/**
 * 提取数组项类型的工具类型。
 */
export type ArrayItem<TArray> = TArray extends readonly (infer TItem)[]
  ? TItem
  : TArray extends (infer TItem)[]
    ? TItem
    : never

/**
 * 契约请求层允许透传到底层客户端的配置。
 */
export type ContractRequestConfig = Partial<FullRequestConfig> & {
  cacheFor?: number
  meta?: Record<string, unknown>
}

/**
 * 契约请求统一入参结构。
 */
export type ContractRequestOptions<
  TPath extends ContractPath,
  TMethod extends HttpMethod,
> = {
  params?: ContractPathParams<TPath, TMethod>
  query?: ContractQueryParams<TPath, TMethod>
  body?: ContractRequestBody<TPath, TMethod>
  config?: ContractRequestConfig
}
