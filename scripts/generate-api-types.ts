#!/usr/bin/env tsx
/**
 * OpenAPI 类型生成脚本
 *
 * 从后端 OpenAPI 端点生成 TypeScript 类型定义和 API 客户端
 * 确保前后端类型一致，防止契约漂移
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import openapiTS, { astToString } from 'openapi-typescript'
import ts from 'typescript'

// ==================== API 客户端生成 ====================

/**
 * OpenAPI Path Item 对象
 */
interface OpenApiPathItem {
  get?: OpenApiOperation
  post?: OpenApiOperation
  put?: OpenApiOperation
  patch?: OpenApiOperation
  delete?: OpenApiOperation
  parameters?: unknown
}

/**
 * OpenAPI Operation 对象
 */
interface OpenApiOperation {
  operationId?: string
  summary?: string
  description?: string
  tags?: string[]
  parameters?: Array<{
    name: string
    in: 'path' | 'query' | 'header' | 'cookie'
    required?: boolean
    schema?: unknown
  }>
  requestBody?: {
    content?: {
      'application/json'?: {
        schema?: unknown
      }
    }
  }
  responses?: Record<string, {
    description?: string
    content?: {
      'application/json'?: {
        schema?: unknown
      }
    }
  }>
}

/**
 * HTTP 方法集合
 */
type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete'

/**
 * 端点信息
 */
interface EndpointInfo {
  path: string
  method: HttpMethod
  operation: OpenApiOperation
}

/**
 * 资源分组
 */
interface ResourceGroup {
  resourceName: string
  collectionPath: string
  endpoints: EndpointInfo[]
  extraEndpoints: EndpointInfo[]
}

/**
 * 生成的 API 客户端方法
 */
interface GeneratedApiMethod {
  name: string
  path: string
  method: HttpMethod
  hasPathParams: boolean
  hasQueryParams: boolean
  hasBody: boolean
  responseType: string
  pathParamsType?: string
  queryParamsType?: string
  bodyType?: string
  summary?: string
  description?: string
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// ==================== 配置 ====================

interface Config {
  /** 后端 OpenAPI 端点 */
  backendUrl: string
  /** 输出目录 */
  outputDir: string
  /** 模块输出目录 */
  modulesOutputDir: string
  /** 是否覆盖已存在的类型 */
  overwrite: boolean
  /** 是否生成 API 客户端 */
  generateApiClients: boolean
  /** 是否生成 API 模块 */
  generateApiModules: boolean
}

const config: Config = {
  // 从环境变量读取，默认开发环境
  backendUrl:
    process.env.VITE_API_BASE_URL ||
    process.env.BACKEND_URL ||
    'http://localhost:8001/api/openapi.json',
  outputDir: join(__dirname, '../src/api/generated'),
  modulesOutputDir: join(__dirname, '../src/api/modules'),
  overwrite: true,
  generateApiClients: true,
  generateApiModules: true
}

type OpenApiEnumValue = string | number | boolean | null

interface OpenApiPropertySchema {
  $ref?: string
  type?: string
  title?: string
  description?: string
  format?: string
  default?: unknown
  enum?: OpenApiEnumValue[]
  minLength?: number
  maxLength?: number
  minimum?: number
  maximum?: number
  items?: OpenApiPropertySchema
  properties?: Record<string, OpenApiPropertySchema>
  required?: string[]
  additionalProperties?: boolean | OpenApiPropertySchema
  anyOf?: OpenApiPropertySchema[]
  oneOf?: OpenApiPropertySchema[]
  allOf?: OpenApiPropertySchema[]
}

interface OpenApiDocument {
  components?: {
    schemas?: Record<string, OpenApiPropertySchema>
  }
  paths?: Record<string, OpenApiPathItem>
}

interface GeneratedOpenApiArrayMetadata {
  type?: string
  format?: string
  ref?: string
  enum?: OpenApiEnumValue[]
}

interface GeneratedOpenApiFieldMetadata {
  title?: string
  description?: string
  type?: string
  format?: string
  required: boolean
  nullable: boolean
  default?: unknown
  enum?: OpenApiEnumValue[]
  ref?: string
  items?: GeneratedOpenApiArrayMetadata
  minLength?: number
  maxLength?: number
  minimum?: number
  maximum?: number
}

interface GeneratedOpenApiSchemaMetadata {
  title?: string
  description?: string
  required: string[]
  additionalProperties?: boolean
  fields: Record<string, GeneratedOpenApiFieldMetadata>
}

// ==================== 工具函数 ====================

/**
 * 确保目录存在
 */
function ensureDir(path: string): void {
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true })
  }
}

function writeFileIfChanged(path: string, content: string): boolean {
  const previous = existsSync(path) ? readFileSync(path, 'utf-8') : null
  if (previous === content) {
    return false
  }

  writeFileSync(path, content, 'utf-8')
  return true
}

/**
 * 从 URL 获取 OpenAPI 规范
 */
async function fetchOpenApiSpec(url: string): Promise<unknown> {
  console.log(`📥 正在从后端获取 OpenAPI 规范: ${url}`)

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json'
    },
    // 开发环境忽略证书错误
    // @ts-expect-error - Node.js fetch options
    ignoreHTTPSErrors: true
  })

  if (!response.ok) {
    throw new Error(`获取 OpenAPI 规范失败: ${response.status} ${response.statusText}`)
  }

  const spec = await response.json()
  console.log(`✅ OpenAPI 规范获取成功`)
  return spec
}

function getSchemas(spec: unknown): Record<string, OpenApiPropertySchema> {
  return (spec as OpenApiDocument).components?.schemas ?? {}
}

function getRefName(ref: string | undefined): string | undefined {
  const prefix = '#/components/schemas/'
  if (!ref?.startsWith(prefix)) {
    return undefined
  }

  return ref.slice(prefix.length)
}

function isNullSchema(schema: OpenApiPropertySchema | undefined): boolean {
  return schema?.type === 'null'
}

function unwrapNullableSchema(
  schema: OpenApiPropertySchema
): { schema: OpenApiPropertySchema; nullable: boolean } {
  const variants = schema.anyOf ?? schema.oneOf
  if (!variants?.length) {
    return { schema, nullable: false }
  }

  const nonNullVariants = variants.filter(variant => !isNullSchema(variant))
  const nullable = nonNullVariants.length !== variants.length

  if (nonNullVariants.length !== 1) {
    return { schema, nullable }
  }

  const [resolvedSchema] = nonNullVariants
  return {
    nullable,
    schema: {
      ...resolvedSchema,
      title: schema.title ?? resolvedSchema.title,
      description: schema.description ?? resolvedSchema.description,
      default: schema.default ?? resolvedSchema.default
    }
  }
}

function buildArrayMetadata(items: OpenApiPropertySchema | undefined): GeneratedOpenApiArrayMetadata | undefined {
  if (!items) {
    return undefined
  }

  const { schema } = unwrapNullableSchema(items)
  const ref = getRefName(schema.$ref)

  return {
    type: schema.type,
    format: schema.format,
    ref,
    enum: schema.enum
  }
}

function buildFieldMetadata(
  fieldName: string,
  schema: OpenApiPropertySchema,
  requiredFields: Set<string>
): GeneratedOpenApiFieldMetadata {
  const { schema: resolvedSchema, nullable } = unwrapNullableSchema(schema)
  const ref = getRefName(resolvedSchema.$ref)

  return {
    title: resolvedSchema.title,
    description: resolvedSchema.description,
    type: resolvedSchema.type,
    format: resolvedSchema.format,
    required: requiredFields.has(fieldName),
    nullable,
    default: resolvedSchema.default,
    enum: resolvedSchema.enum,
    ref,
    items: buildArrayMetadata(resolvedSchema.items),
    minLength: resolvedSchema.minLength,
    maxLength: resolvedSchema.maxLength,
    minimum: resolvedSchema.minimum,
    maximum: resolvedSchema.maximum
  }
}

function extractSchemaMetadata(spec: unknown): Record<string, GeneratedOpenApiSchemaMetadata> {
  const schemas = getSchemas(spec)

  return Object.fromEntries(
    Object.entries(schemas)
      .filter(([, schema]) => schema.type === 'object' || schema.properties)
      .map(([schemaName, schema]) => {
        const required = schema.required ?? []
        const requiredFields = new Set(required)
        const fields = Object.fromEntries(
          Object.entries(schema.properties ?? {}).map(([fieldName, fieldSchema]) => [
            fieldName,
            buildFieldMetadata(fieldName, fieldSchema, requiredFields)
          ])
        )

        return [schemaName, {
          title: schema.title,
          description: schema.description,
          required,
          additionalProperties:
            typeof schema.additionalProperties === 'boolean'
              ? schema.additionalProperties
              : undefined,
          fields
        }]
      })
  )
}

/**
 * 生成类型定义文件
 */
async function generateTypesFile(spec: unknown, outputPath: string): Promise<boolean> {
  console.log(`🔧 正在生成类型定义文件...`)

  const ast = await openapiTS(spec as Parameters<typeof openapiTS>[0], {
    alphabetize: true
  })

  const generatedTypes = astToString(ast)
  const content = `/**
 * 自动生成的 OpenAPI 类型定义
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: ${config.backendUrl}
 *
 * 更新类型: pnpm type:generate
 */

/* tslint:disable */

${generatedTypes}
`

  const changed = writeFileIfChanged(outputPath, content)
  if (changed) {
    console.log(`✅ 类型定义文件已更新: ${outputPath}`)
  } else {
    console.log(`✅ 类型定义无变化: ${outputPath}`)
  }

  return changed
}

async function generateMetadataFile(spec: unknown, outputPath: string): Promise<boolean> {
  console.log('🧭 正在生成 OpenAPI 字段元数据...')

  const metadata = extractSchemaMetadata(spec)
  const serializedMetadata = JSON.stringify(metadata, null, 2)
  const content = `/**
 * 自动生成的 OpenAPI 字段元数据
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: ${config.backendUrl}
 *
 * 更新类型: pnpm type:generate
 */

export type OpenApiEnumValue = string | number | boolean | null

export interface OpenApiArrayMetadata {
  type?: string
  format?: string
  ref?: string
  enum?: OpenApiEnumValue[]
}

export interface OpenApiFieldMetadata {
  title?: string
  description?: string
  type?: string
  format?: string
  required: boolean
  nullable: boolean
  default?: unknown
  enum?: OpenApiEnumValue[]
  ref?: string
  items?: OpenApiArrayMetadata
  minLength?: number
  maxLength?: number
  minimum?: number
  maximum?: number
}

export interface OpenApiSchemaMetadata {
  title?: string
  description?: string
  required: string[]
  additionalProperties?: boolean
  fields: Record<string, OpenApiFieldMetadata>
}

export const OPENAPI_SCHEMA_METADATA = ${serializedMetadata} as const satisfies Record<
  string,
  OpenApiSchemaMetadata
>

export function getOpenApiSchemaMetadata(schemaName: string): OpenApiSchemaMetadata | undefined {
  return (OPENAPI_SCHEMA_METADATA as Record<string, OpenApiSchemaMetadata>)[schemaName]
}

export function getOpenApiFieldMetadata(
  schemaName: string,
  fieldName: string
): OpenApiFieldMetadata | undefined {
  return (OPENAPI_SCHEMA_METADATA as Record<string, OpenApiSchemaMetadata>)[schemaName]?.fields[fieldName]
}
`

  const changed = writeFileIfChanged(outputPath, content)
  if (changed) {
    console.log(`✅ 字段元数据文件已更新: ${outputPath}`)
  } else {
    console.log(`✅ 字段元数据无变化: ${outputPath}`)
  }

  return changed
}

/**
 * 验证生成的类型
 */
function validateGeneratedFile(outputPath: string): void {
  console.log(`🔍 正在验证生成文件: ${outputPath}`)

  if (!existsSync(outputPath)) {
    throw new Error(`类型文件不存在: ${outputPath}`)
  }

  const content = readFileSync(outputPath, 'utf-8')

  const result = ts.transpileModule(content, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ESNext
    },
    fileName: outputPath,
    reportDiagnostics: true
  })

  if (result.diagnostics?.length) {
    const message = ts.formatDiagnosticsWithColorAndContext(result.diagnostics, {
      getCanonicalFileName: fileName => fileName,
      getCurrentDirectory: () => process.cwd(),
      getNewLine: () => '\n'
    })
    throw new Error(`生成的类型文件存在语法问题:\n${message}`)
  }

  console.log(`✅ 生成文件验证通过`)
}

// ==================== API 客户端生成 ====================

/**
 * 提取资源名称（复数形式），例如 /api/v1/menus/tree -> menus
 */
function extractResourceName(path: string): string | null {
  const match = path.match(/^\/api\/v\d+\/([^/]+)(?:\/|$)/)
  return match?.[1] ?? null
}

/**
 * 将复数资源名转换为单数（简单规则）
 */
function toSingular(name: string): string {
  // 简单的复数转换规则
  if (name.endsWith('ies')) return name.slice(0, -3) + 'y'
  if (name.endsWith('es') && !name.endsWith('sses')) return name.slice(0, -2)
  if (name.endsWith('s') && !name.endsWith('ss')) return name.slice(0, -1)
  return name
}

/**
 * 将资源名转换为合法的 JavaScript 标识符
 * 例如 api-auth -> apiAuth
 */
function toValidIdentifier(name: string): string {
  // 移除或替换特殊字符，转换为 camelCase
  return name
    .split(/[-_]/)
    .map((part, index) => {
      if (index === 0) return part
      return part.charAt(0).toUpperCase() + part.slice(1)
    })
    .join('')
}

/**
 * 将 kebab-case/snake_case 转换为 camelCase
 */
function toCamelCase(str: string): string {
  return str.replace(/[-_](.)/g, (_, char) => char.toUpperCase())
}

/**
 * 将路径转换为方法名，例如 /api/v1/menus/tree -> getTree
 */
function generateMethodName(path: string, method: HttpMethod, operationId?: string): string {
  // 优先使用 operationId
  if (operationId) {
    // 清理 operationId，例如 reset_password_api_v1_users__id__reset_password_put -> resetPassword
    // 步骤 1: 移除 _post/get/put/patch/delete 后缀
    const withoutMethod = operationId.replace(/_(get|post|put|patch|delete)$/i, '')

    // 步骤 2: 找到最后一个 api_vX_ 之后的部分，提取动作名称
    // 例如: reset_password_api_v1_users__id__reset_password -> reset_password
    // 匹配最后一段（通常是动作描述）
    const parts = withoutMethod.split('_')

    // 找到 api_v 开头的位置，然后取其后两个部分（资源名之后的动作）
    const apiIndex = parts.findIndex(p => p.startsWith('api') && p.match(/^v\d+$/))
    if (apiIndex >= 0 && apiIndex + 2 < parts.length) {
      // 跳过 api_v1, resource_name, 然后取剩下的动作部分
      const actionParts = parts.slice(apiIndex + 2)

      // 过滤掉 id 和空字符串（路径参数）
      const cleanedParts = actionParts.filter(p => p && p !== 'id')

      if (cleanedParts.length > 0) {
        return toCamelCase(cleanedParts.join('_'))
      }
    }

    // 回退：返回最后一部分
    return toCamelCase(parts[parts.length - 1] || withoutMethod)
  }

  // 从路径生成
  const parts = path.split('/').filter(p => p && !p.startsWith('{'))
  const lastPart = parts[parts.length - 1]

  const methodPrefix: Record<HttpMethod, string> = {
    get: 'get',
    post: 'create',
    put: 'update',
    patch: 'patch',
    delete: 'delete'
  }

  const prefix = methodPrefix[method]
  const suffix = lastPart ? toCamelCase(lastPart) : ''

  return suffix ? `${prefix}${suffix[0].toUpperCase()}${suffix.slice(1)}` : prefix
}

/**
 * 确保方法名在同一资源组中唯一
 */
function ensureUniqueMethodName(name: string, existingNames: Set<string>): string {
  if (!existingNames.has(name)) {
    return name
  }

  // 如果名字已存在，添加数字后缀
  let counter = 2
  let newName = `${name}${counter}`
  while (existingNames.has(newName)) {
    counter++
    newName = `${name}${counter}`
  }
  return newName
}

/**
 * 检查路径是否是标准 CRUD 端点
 */
function isStandardCrudEndpoint(path: string, method: HttpMethod, resourceName: string): boolean {
  const basePath = `/api/v1/${resourceName}`

  // 定义标准 CRUD 端点模式（支持参数匹配）
  const patterns = [
    { pattern: new RegExp(`^${escapeRegex(basePath)}$`), method: 'post' },           // 创建
    { pattern: new RegExp(`^${escapeRegex(basePath)}/\\{[^}]+\\}$`), method: 'get' },  // 获取详情
    { pattern: new RegExp(`^${escapeRegex(basePath)}/\\{[^}]+\\}$`), method: 'put' },  // 更新
    { pattern: new RegExp(`^${escapeRegex(basePath)}/\\{[^}]+\\}$`), method: 'delete' }, // 删除
    { pattern: new RegExp(`^${escapeRegex(basePath)}/query$`), method: 'post' }, // 查询列表
    { pattern: new RegExp(`^.*\\/query$`), method: 'post' }, // 任何子资源的查询列表
    { pattern: new RegExp(`^${escapeRegex(basePath)}/\\{[^}]+\\}/restore$`), method: 'post' }, // 恢复
    { pattern: new RegExp(`^${escapeRegex(basePath)}/trash$`), method: 'get' }, // 回收站列表
    { pattern: new RegExp(`^${escapeRegex(basePath)}/trash/restore$`), method: 'post' }, // 批量恢复
    { pattern: new RegExp(`^${escapeRegex(basePath)}/trash/permanent$`), method: 'delete' }, // 批量永久删除
    { pattern: new RegExp(`^${escapeRegex(basePath)}/bulk$`), method: 'delete' }, // 批量删除
    { pattern: new RegExp(`^.*\\/bulk$`), method: 'delete' }, // 任何子资源的批量删除
  ]

  return patterns.some(p => p.pattern.test(path) && p.method === method)
}

/**
 * 转义正则特殊字符
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * 从 OpenAPI 规范中提取所有端点
 */
function extractEndpoints(spec: unknown): EndpointInfo[] {
  const paths = (spec as OpenApiDocument).paths ?? {}
  const endpoints: EndpointInfo[] = []

  const methods: HttpMethod[] = ['get', 'post', 'put', 'patch', 'delete']

  for (const [path, pathItem] of Object.entries(paths)) {
    if (!pathItem) continue

    for (const method of methods) {
      const operation = pathItem[method]
      if (operation) {
        endpoints.push({
          path,
          method,
          operation
        })
      }
    }
  }

  return endpoints
}

/**
 * 按资源对端点进行分组
 */
function groupEndpointsByResource(endpoints: EndpointInfo[]): ResourceGroup[] {
  const groups = new Map<string, ResourceGroup>()

  for (const endpoint of endpoints) {
    const resourceName = extractResourceName(endpoint.path)
    if (!resourceName) continue

    if (!groups.has(resourceName)) {
      groups.set(resourceName, {
        resourceName,
        collectionPath: `/api/v1/${resourceName}`,
        endpoints: [],
        extraEndpoints: []
      })
    }

    const group = groups.get(resourceName)!
    group.endpoints.push(endpoint)

    // 判断是否为额外端点（非标准 CRUD）
    if (!isStandardCrudEndpoint(endpoint.path, endpoint.method, resourceName)) {
      group.extraEndpoints.push(endpoint)
    }
  }

  return Array.from(groups.values())
}

/**
 * 获取路径参数名称列表
 */
function extractPathParams(path: string): string[] {
  const matches = path.matchAll(/\{(\w+)\}/g)
  return Array.from(matches).map(m => m[1])
}

/**
 * 生成单个 API 方法的代码
 */
function generateApiMethodCode(method: GeneratedApiMethod): string {
  const lines: string[] = []

  // 文档注释
  if (method.summary || method.description) {
    lines.push('  /**')
    if (method.summary) {
      lines.push(`   * ${method.summary}`)
    }
    if (method.description && method.description !== method.summary) {
      lines.push(`   * @description ${method.description}`)
    }
    lines.push(`   * @endpoint ${method.method.toUpperCase()} ${method.path}`)
    lines.push('   */')
  }

  // 方法签名
  const params: string[] = []

  // 路径参数
  if (method.hasPathParams && method.pathParamsType) {
    params.push(`params: ${method.pathParamsType}`)
  }

  // 请求体
  if (method.hasBody && method.bodyType) {
    params.push(`body: ${method.bodyType}`)
  }

  // Query 参数
  if (method.hasQueryParams && method.queryParamsType) {
    params.push(`query?: ${method.queryParamsType}`)
  }

  // Config 参数（始终添加）
  params.push('config?: ContractRequestConfig')

  // 生成方法体
  const args: string[] = []

  if (method.hasPathParams) {
    args.push('params')
  }

  if (method.hasBody) {
    args.push('body')
  }

  if (method.hasQueryParams) {
    args.push('query')
  }

  const optionsArg = args.length > 0
    ? `{ ${args.join(', ')}${args.length > 0 ? ', ' : ''}config }`
    : '{ config }'

  lines.push(`  async ${method.name}(${params.join(', ')}): Promise<${method.responseType}> {`)
  lines.push(`    return await contractClient.${method.method}('${method.path}', ${optionsArg})`)
  lines.push('  }')

  return lines.join('\n')
}

/**
 * 从 operation 生成方法信息
 */
function buildApiMethodInfo(
  endpoint: EndpointInfo,
  existingNames: Set<string> = new Set()
): GeneratedApiMethod | null {
  const { path, method, operation } = endpoint

  // 跳过没有 operationId 或无法识别的端点
  if (!operation.operationId) {
    return null
  }

  const baseName = generateMethodName(path, method, operation.operationId)
  const name = ensureUniqueMethodName(baseName, existingNames)
  existingNames.add(name)

  const pathParams = extractPathParams(path)
  const hasPathParams = pathParams.length > 0

  // 构建类型引用（使用生成的 openapi-types 中的 paths）
  const pathParamsType = hasPathParams
    ? `paths['${path}']['${method}']['parameters']['path']`
    : undefined

  const queryParams = operation.parameters?.filter(p => p.in === 'query')
  const hasQueryParams = (queryParams?.length ?? 0) > 0
  const queryParamsType = hasQueryParams
    ? `paths['${path}']['${method}']['parameters']['query']`
    : undefined

  const hasBody = !!operation.requestBody?.content?.['application/json']
  const bodyType = hasBody
    ? `paths['${path}']['${method}']['requestBody']['content']['application/json']`
    : undefined

  // 使用 ContractResponseData 来解包响应
  const responseType = `ContractResponseData<'${path}', '${method}'>`

  return {
    name,
    path,
    method,
    hasPathParams,
    hasQueryParams,
    hasBody,
    responseType,
    pathParamsType,
    queryParamsType,
    bodyType,
    summary: operation.summary,
    description: operation.description
  }
}

/**
 * 生成资源组的 API 客户端代码
 */
function generateResourceClientCode(group: ResourceGroup): string | null {
  if (group.extraEndpoints.length === 0) {
    return null
  }

  const validResourceName = toValidIdentifier(group.resourceName)
  const singularName = toSingular(validResourceName)
  const clientName = `${singularName}GeneratedApi`

  const methods: string[] = []
  const existingNames = new Set<string>()

  for (const endpoint of group.extraEndpoints) {
    const methodInfo = buildApiMethodInfo(endpoint, existingNames)
    if (methodInfo) {
      methods.push(generateApiMethodCode(methodInfo))
    }
  }

  if (methods.length === 0) {
    return null
  }

  const lines: string[] = []
  lines.push(`/**`)
  lines.push(` * ${group.resourceName} 资源 - 自动生成的 API 客户端`)
  lines.push(` * @base ${group.collectionPath}`)
  lines.push(` */`)
  lines.push(`export const ${clientName} = {`)
  lines.push(methods.join(',\n\n'))
  lines.push('}')
  lines.push('')
  lines.push(`/**`)
  lines.push(` * ${group.resourceName} 资源 API 客户端类型`)
  lines.push(` */`)
  lines.push(`export type ${clientName[0].toUpperCase() + clientName.slice(1)}Type = typeof ${clientName}`)

  return lines.join('\n')
}

/**
 * 生成 API 客户端文件
 */
async function generateApiClientsFile(spec: unknown, outputPath: string): Promise<boolean> {
  console.log('🔧 正在生成 API 客户端...')

  const endpoints = extractEndpoints(spec)
  const groups = groupEndpointsByResource(endpoints)

  // 只保留有额外端点的资源组
  const groupsWithExtras = groups.filter(g => g.extraEndpoints.length > 0)

  if (groupsWithExtras.length === 0) {
    console.log('ℹ️ 未发现需要生成客户端的非标准端点')
    return false
  }

  const clientCodes: string[] = []

  for (const group of groupsWithExtras) {
    const code = generateResourceClientCode(group)
    if (code) {
      clientCodes.push(code)
    }
  }

  const content = `/**
 * 自动生成的 API 客户端
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: ${config.backendUrl}
 *
 * 更新客户端: pnpm type:generate
 */

import { contractClient } from '@/api/contract/client'
import type { ContractRequestConfig, ContractResponseData } from '@/api/contract/types'
import type { paths } from './openapi-types'

${clientCodes.join('\n\n')}
`

  const changed = writeFileIfChanged(outputPath, content)
  if (changed) {
    console.log(`✅ API 客户端文件已更新: ${outputPath}`)
  } else {
    console.log(`✅ API 客户端文件无变化: ${outputPath}`)
  }

  return changed
}

// ==================== API 模块生成 ====================

/**
 * CRUD 资源类型
 */
type CrudType = 'soft-delete' | 'standard' | 'none'

/**
 * 模块配置信息
 */
interface ModuleInfo {
  resourceName: string
  collectionPath: string
  crudType: CrudType
  hasBulkDelete: boolean
  extraMethods: string[]
  singularName: string
  pascalName: string
}

/**
 * 检测资源的 CRUD 类型
 */
function detectCrudType(endpoints: EndpointInfo[], basePath: string): CrudType {
  const hasPost = endpoints.some(e => e.path === basePath && e.method === 'post')
  const hasGet = endpoints.some(e => {
    const pattern = new RegExp(`^${escapeRegex(basePath)}/\\{[^}]+\\}$`)
    return pattern.test(e.path) && e.method === 'get'
  })
  const hasPut = endpoints.some(e => {
    const pattern = new RegExp(`^${escapeRegex(basePath)}/\\{[^}]+\\}$`)
    return pattern.test(e.path) && e.method === 'put'
  })
  const hasDelete = endpoints.some(e => {
    const pattern = new RegExp(`^${escapeRegex(basePath)}/\\{[^}]+\\}$`)
    return pattern.test(e.path) && e.method === 'delete'
  })
  const hasQuery = endpoints.some(e => e.path === `${basePath}/query` && e.method === 'post')

  const hasStandardCrud = hasPost && hasGet && hasPut && hasDelete && hasQuery
  if (!hasStandardCrud) return 'none'

  // 检查是否支持软删除
  const hasRestore = endpoints.some(e => {
    const pattern = new RegExp(`^${escapeRegex(basePath)}/\\{[^}]+\\}/restore$`)
    return pattern.test(e.path) && e.method === 'post'
  })
  const hasTrash = endpoints.some(e => e.path === `${basePath}/trash` && e.method === 'get')
  const hasTrashRestore = endpoints.some(e => e.path === `${basePath}/trash/restore` && e.method === 'post')
  const hasTrashPermanent = endpoints.some(e => e.path === `${basePath}/trash/permanent` && e.method === 'delete')

  if (hasRestore && hasTrash && hasTrashRestore && hasTrashPermanent) {
    return 'soft-delete'
  }

  return 'standard'
}

/**
 * 检测是否有批量删除端点
 */
function hasBulkDeleteEndpoint(endpoints: EndpointInfo[], basePath: string): boolean {
  return endpoints.some(e => e.path === `${basePath}/bulk` && e.method === 'delete')
}

/**
 * 获取非标准端点的方法名列表
 */
function getExtraMethodNames(endpoints: EndpointInfo[], resourceName: string): string[] {
  const extraEndpoints = endpoints.filter(e => !isStandardCrudEndpoint(e.path, e.method, resourceName))
  const existingNames = new Set<string>()
  const names: string[] = []

  for (const endpoint of extraEndpoints) {
    if (endpoint.operation.operationId) {
      const name = generateMethodName(endpoint.path, endpoint.method, endpoint.operation.operationId)
      const uniqueName = ensureUniqueMethodName(name, existingNames)
      existingNames.add(uniqueName)
      names.push(uniqueName)
    }
  }

  return names
}

/**
 * 将资源名转换为 PascalCase
 */
function toPascalCase(name: string): string {
  const camelCase = toValidIdentifier(name)
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1)
}

/**
 * 生成 API 模块代码
 */
function generateModuleCode(module: ModuleInfo): string {
  const lines: string[] = []

  // 文件头部注释
  lines.push(`/**`)
  lines.push(` * ${module.singularName} 管理 API`)
  lines.push(` *`)
  lines.push(` * ⚠️  此文件由 scripts/generate-api-types.ts 自动生成`)
  lines.push(` * 自动生成时间: ${new Date().toISOString()}`)
  lines.push(` *`)
  lines.push(` * 如需添加自定义方法，请在以下占位符区域添加：`)
  lines.push(` * // ==================== CUSTOM METHODS ====================`)
  lines.push(` */`)
  lines.push('')

  // 导入
  lines.push(`import {`)
  if (module.crudType === 'soft-delete') {
    lines.push(`  createSoftDeleteCrudApi,`)
    lines.push(`  type SoftDeleteCrudResourceCollectionPath,`)
  } else if (module.crudType === 'standard') {
    lines.push(`  createCrudApi,`)
    lines.push(`  type CrudResourceCollectionPath,`)
  }
  if (module.crudType !== 'none') {
    lines.push(`  type CrudCreateInput,`)
    lines.push(`  type CrudItem,`)
    lines.push(`  type CrudUpdateInput,`)
  }
  lines.push(`} from '@/api/base/crud-api'`)

  // 导入生成的 API 客户端（如果有额外方法）
  if (module.extraMethods.length > 0) {
    lines.push(`import { ${module.singularName}GeneratedApi } from '@/api/generated/api-clients'`)
  }

  lines.push('')

  // 路径定义
  if (module.crudType !== 'none') {
    const pathConstType = module.crudType === 'soft-delete'
      ? 'SoftDeleteCrudResourceCollectionPath'
      : 'CrudResourceCollectionPath'
    lines.push(`const ${module.pascalName.toUpperCase()}_COLLECTION_PATH = '${module.collectionPath}' satisfies ${pathConstType}`)

    if (module.hasBulkDelete) {
      lines.push(`const ${module.pascalName.toUpperCase()}_BULK_DELETE_PATH = '${module.collectionPath}/bulk' as const`)
    }
    lines.push('')
  }

  // 类型定义
  if (module.crudType !== 'none') {
    lines.push(`export type ${module.pascalName} = CrudItem<typeof ${module.pascalName.toUpperCase()}_COLLECTION_PATH>`)
    lines.push('')
    lines.push(`export type Create${module.pascalName}Input = CrudCreateInput<typeof ${module.pascalName.toUpperCase()}_COLLECTION_PATH>`)
    lines.push('')
    lines.push(`export type Update${module.pascalName}Input = CrudUpdateInput<typeof ${module.pascalName.toUpperCase()}_COLLECTION_PATH>`)
    lines.push('')
  }

  // API 定义
  if (module.crudType !== 'none') {
    lines.push(`const base${module.pascalName}Api = ${module.crudType === 'soft-delete' ? 'createSoftDeleteCrudApi' : 'createCrudApi'}({`)
    lines.push(`  collection: ${module.pascalName.toUpperCase()}_COLLECTION_PATH,`)
    lines.push(`  item: \`\${${module.pascalName.toUpperCase()}_COLLECTION_PATH}/{id}\` as const,`)
    lines.push(`  query: \`\${${module.pascalName.toUpperCase()}_COLLECTION_PATH}/query\` as const,`)

    if (module.crudType === 'soft-delete') {
      lines.push(`  restore: \`\${${module.pascalName.toUpperCase()}_COLLECTION_PATH}/{id}/restore\` as const,`)
      lines.push(`  trash: \`\${${module.pascalName.toUpperCase()}_COLLECTION_PATH}/trash\` as const,`)
      lines.push(`  trashRestore: \`\${${module.pascalName.toUpperCase()}_COLLECTION_PATH}/trash/restore\` as const,`)
      lines.push(`  trashPermanentDelete: \`\${${module.pascalName.toUpperCase()}_COLLECTION_PATH}/trash/permanent\` as const,`)
    }

    if (module.hasBulkDelete) {
      lines.push(`  bulkDelete: ${module.pascalName.toUpperCase()}_BULK_DELETE_PATH,`)
    }

    lines.push('})')
    lines.push('')

    // 组合 API 导出
    lines.push(`export const ${module.singularName}Api = {`)
    lines.push(`  ...base${module.pascalName}Api,`)

    // 添加生成的额外方法
    if (module.extraMethods.length > 0) {
      for (const methodName of module.extraMethods) {
        lines.push(`  ${methodName}: ${module.singularName}GeneratedApi.${methodName},`)
      }
    }

    lines.push('')
    lines.push(`  // ==================== CUSTOM METHODS ====================`)
    lines.push(`  // 在此区域添加自定义方法`)
    lines.push(`  // 可使用的导入项: ContractResponseData, contractClient`)
    lines.push(`  // ======================================================`)
    lines.push('}')
  } else {
    // 非 CRUD 资源，直接导出生成的客户端
    if (module.extraMethods.length > 0) {
      lines.push(`export const ${module.singularName}Api = ${module.singularName}GeneratedApi`)
      lines.push('')
      lines.push(`// ==================== CUSTOM METHODS ====================`)
      lines.push(`// 在此区域添加自定义方法`)
      lines.push(`// ======================================================`)
    }
  }

  lines.push('')

  return lines.join('\n')
}

/**
 * 生成所有 API 模块
 */
async function generateApiModules(spec: unknown, outputDir: string): Promise<boolean> {
  console.log('🔧 正在生成 API 模块...')

  const endpoints = extractEndpoints(spec)
  const groups = groupEndpointsByResource(endpoints)

  let anyChanged = false

  for (const group of groups) {
    const validResourceName = toValidIdentifier(group.resourceName)
    const singularName = toSingular(validResourceName)
    const pascalName = toPascalCase(singularName)
    const crudType = detectCrudType(group.endpoints, group.collectionPath)
    const hasBulkDelete = hasBulkDeleteEndpoint(group.endpoints, group.collectionPath)
    const extraMethods = getExtraMethodNames(group.endpoints, group.resourceName)

    const module: ModuleInfo = {
      resourceName: group.resourceName,
      collectionPath: group.collectionPath,
      crudType,
      hasBulkDelete,
      extraMethods,
      singularName,
      pascalName
    }

    // 生成模块文件名（使用单数形式，与现有约定一致）
    const moduleFileName = group.resourceName === 'users' ? 'user.ts' :
                          group.resourceName === 'roles' ? 'role.ts' :
                          group.resourceName === 'menus' ? 'menu.ts' :
                          group.resourceName === 'work_lines' ? 'workline.ts' :
                          group.resourceName === 'devices' ? 'device.ts' :
                          group.resourceName === 'api-auth' ? 'apiAuth.ts' :
                          singularName.endsWith('s') && !singularName.endsWith('ss') ? `${singularName.slice(0, -1)}.ts` :
                          `${singularName}.ts`

    const outputPath = join(outputDir, moduleFileName)

    // 检查文件是否存在且包含手动代码，或者文件已存在（避免覆盖手动维护的文件）
    const fileExists = existsSync(outputPath)
    const hasManualCode = fileExists &&
      readFileSync(outputPath, 'utf-8').includes('// ==================== CUSTOM METHODS ====================')

    if (fileExists) {
      if (hasManualCode) {
        console.log(`  ℹ️  ${moduleFileName} 包含自定义代码，跳过生成`)
      } else {
        console.log(`  ℹ️  ${moduleFileName} 已存在，跳过生成（手动维护）`)
      }
      continue
    }

    const content = generateModuleCode(module)
    const changed = writeFileIfChanged(outputPath, content)

    if (changed) {
      console.log(`  ✅ 已更新: ${moduleFileName}`)
      anyChanged = true
    } else {
      console.log(`  ✅ 无变化: ${moduleFileName}`)
    }
  }

  return anyChanged
}

// ==================== 主流程 ====================

async function main(): Promise<void> {
  try {
    console.log('🚀 OpenAPI 类型生成工具\n')

    // 确保输出目录存在
    ensureDir(config.outputDir)

    // 获取 OpenAPI 规范
    const spec = await fetchOpenApiSpec(config.backendUrl)

    // 生成类型文件
    const outputPath = join(config.outputDir, 'openapi-types.ts')
    const metadataOutputPath = join(config.outputDir, 'openapi-metadata.ts')
    const typeChanged = await generateTypesFile(spec, outputPath)
    const metadataChanged = await generateMetadataFile(spec, metadataOutputPath)

    // 验证生成结果
    validateGeneratedFile(outputPath)
    validateGeneratedFile(metadataOutputPath)

    // 生成 API 客户端文件（如果启用）
    let clientsChanged = false
    if (config.generateApiClients) {
      const clientsOutputPath = join(config.outputDir, 'api-clients.ts')
      clientsChanged = await generateApiClientsFile(spec, clientsOutputPath)
      if (existsSync(clientsOutputPath)) {
        validateGeneratedFile(clientsOutputPath)
      }
    }

    // 生成 API 模块（如果启用）
    let modulesChanged = false
    if (config.generateApiModules) {
      ensureDir(config.modulesOutputDir)
      modulesChanged = await generateApiModules(spec, config.modulesOutputDir)
    }

    const changed = typeChanged || metadataChanged || clientsChanged || modulesChanged
    console.log(changed ? '\n✅ 类型生成完成！' : '\n✅ 类型无变化，未更新生成文件')
    console.log(`📁 输出目录: ${config.outputDir}`)
    if (config.generateApiClients) {
      console.log('📦 API 客户端已生成')
    }
    if (config.generateApiModules) {
      console.log('📦 API 模块已生成')
    }
    console.log('\n💡 提示: 运行 pnpm type:check 验证类型正确性')
  } catch (error) {
    console.error('\n❌ 类型生成失败:', error)
    process.exit(1)
  }
}

// 运行主流程
main()
