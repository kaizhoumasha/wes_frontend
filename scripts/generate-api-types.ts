#!/usr/bin/env tsx
/**
 * OpenAPI 类型生成脚本
 *
 * 从后端 OpenAPI 端点生成 TypeScript 类型定义、字段元数据和按 model 分组的 API 模块。
 * 生成策略完全基于路径事实，不再依赖 operationId 前缀猜测或单复数硬编码。
 */

import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  unlinkSync,
  writeFileSync
} from 'node:fs'
import { dirname, isAbsolute, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import openapiTS, { astToString } from 'openapi-typescript'
import ts from 'typescript'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const ENUM_MARKER = '__enum'
export const DEFAULT_BACKEND_OPENAPI_URL = 'http://localhost:8001/api/openapi.json'

export const AUTO_GENERATED_START =
  '// ==================== AUTO GENERATED START ===================='
export const AUTO_GENERATED_END = '// ==================== AUTO GENERATED END ===================='
export const CUSTOM_METHODS_START =
  '// ==================== CUSTOM METHODS START ===================='
export const CUSTOM_METHODS_END = '// ==================== CUSTOM METHODS END ===================='
export const CUSTOM_CONFIG_START =
  '// ==================== CUSTOM CONFIG START ===================='
export const CUSTOM_CONFIG_END = '// ==================== CUSTOM CONFIG END ===================='

export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete'

interface OpenApiPathItem {
  get?: OpenApiOperation
  post?: OpenApiOperation
  put?: OpenApiOperation
  patch?: OpenApiOperation
  delete?: OpenApiOperation
}

interface OpenApiOperation {
  operationId?: string
  summary?: string
  description?: string
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
  responses?: Record<
    string,
    {
      description?: string
      content?: {
        'application/json'?: {
          schema?: unknown
        }
      }
    }
  >
}

export interface EndpointInfo {
  path: string
  method: HttpMethod
  operation: OpenApiOperation
}

interface OpenApiPropertySchema {
  $ref?: string
  type?: string
  title?: string
  description?: string
  format?: string
  default?: unknown
  enum?: Array<string | number | boolean | null>
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
  enum?: Array<string | number | boolean | null>
}

interface GeneratedOpenApiFieldMetadata {
  title?: string
  description?: string
  type?: string
  format?: string
  required: boolean
  nullable: boolean
  default?: unknown
  enum?: Array<string | number | boolean | null>
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

interface Config {
  openApiSource: string
  generatedOpenApiSourceLabel: string
  outputDir: string
  metadataOutputDir: string
  modulesOutputDir: string
}

function resolveOpenApiSource(): string {
  const explicitSource = process.env.OPENAPI_SPEC_PATH || process.env.OPENAPI_SPEC_URL
  const baseOrSpecUrl = explicitSource || process.env.VITE_API_BASE_URL || process.env.BACKEND_URL

  if (!baseOrSpecUrl) {
    return 'http://localhost:8001/api/openapi.json'
  }

  if (/^https?:\/\//.test(baseOrSpecUrl)) {
    if (/\/(openapi|swagger)\.(json|ya?ml)$/i.test(baseOrSpecUrl)) {
      return baseOrSpecUrl
    }

    return `${baseOrSpecUrl.replace(/\/$/, '')}/api/openapi.json`
  }

  const filePath = isAbsolute(baseOrSpecUrl) ? baseOrSpecUrl : resolve(__dirname, '..', baseOrSpecUrl)
  return filePath
}

export function resolveGeneratedOpenApiSourceLabel(openApiSource: string): string {
  try {
    const url = new URL(openApiSource)
    const isLocalHost = ['localhost', '127.0.0.1', '::1'].includes(url.hostname)
    const isOpenApiEndpoint = /\/api\/openapi\.json$/i.test(url.pathname)

    if (isLocalHost && isOpenApiEndpoint) {
      return DEFAULT_BACKEND_OPENAPI_URL
    }
  } catch {
    return openApiSource
  }

  return openApiSource
}

const openApiSource = resolveOpenApiSource()

const config: Config = {
  openApiSource,
  generatedOpenApiSourceLabel: resolveGeneratedOpenApiSourceLabel(openApiSource),
  outputDir: join(__dirname, '../src/api/generated'),
  metadataOutputDir: join(__dirname, '../src/api/generated/openapi-metadata'),
  modulesOutputDir: join(__dirname, '../src/api/modules')
}

export interface ModuleModelGroup {
  key: string
  version: string
  module: string
  model: string
  collectionPath: string
  endpoints: EndpointInfo[]
}

export interface CrudCapabilities {
  kind: 'none' | 'standard' | 'soft-delete'
  hasBulkDelete: boolean
}

export interface ModulePlan {
  key: string
  kind: 'resource' | 'module-actions'
  fileBaseName: string
  groups: ModuleModelGroup[]
}

interface ProvisionalModulePlan {
  key: string
  kind: ModulePlan['kind']
  groups: ModuleModelGroup[]
  preferredBaseName: string
  fallbackBaseName: string
}

interface ExistingModuleSections {
  auto: string
  customMethods: string
  customConfig: string
}

interface GeneratedMethodInfo {
  name: string
  path: string
  method: HttpMethod
  responseType: string
  pathParamsType?: string
  queryParamsType?: string
  bodyType?: string
  summary?: string
  description?: string
  typeAliasBase: string
}

const NO_CRUD_CAPABILITIES = {
  kind: 'none',
  hasBulkDelete: false
} as const satisfies CrudCapabilities

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

function deleteFileIfExists(path: string): boolean {
  if (!existsSync(path)) {
    return false
  }

  unlinkSync(path)
  return true
}

async function fetchOpenApiSpec(source: string): Promise<unknown> {
  if (!/^https?:\/\//.test(source)) {
    console.log(`📥 正在从本地读取 OpenAPI 规范: ${source}`)

    if (!existsSync(source)) {
      throw new Error(`本地 OpenAPI 规范文件不存在: ${source}`)
    }

    const raw = readFileSync(source, 'utf-8')
    const spec = JSON.parse(raw)
    console.log('✅ OpenAPI 规范读取成功')
    return spec
  }

  console.log(`📥 正在从后端获取 OpenAPI 规范: ${source}`)

  const response = await fetch(source, {
    headers: {
      Accept: 'application/json'
    },
    // @ts-expect-error Node fetch extra option in local dev
    ignoreHTTPSErrors: true
  })

  if (!response.ok) {
    throw new Error(`获取 OpenAPI 规范失败: ${response.status} ${response.statusText}`)
  }

  const spec = await response.json()
  console.log('✅ OpenAPI 规范获取成功')
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

function unwrapNullableSchema(schema: OpenApiPropertySchema): {
  schema: OpenApiPropertySchema
  nullable: boolean
} {
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

function getEnumFromSchemaRef(
  schemas: Record<string, OpenApiPropertySchema>,
  ref: string | undefined
): Array<string | number | boolean | null> | undefined {
  const refName = getRefName(ref)

  if (!refName) {
    return undefined
  }

  const refSchema = schemas[refName]

  if (!refSchema) {
    return undefined
  }

  const { schema } = unwrapNullableSchema(refSchema)
  return schema.enum
}

function buildArrayMetadata(
  items: OpenApiPropertySchema | undefined,
  schemas: Record<string, OpenApiPropertySchema>
): GeneratedOpenApiArrayMetadata | undefined {
  if (!items) {
    return undefined
  }

  const { schema } = unwrapNullableSchema(items)
  const ref = getRefName(schema.$ref)
  return {
    type: schema.type,
    format: schema.format,
    ref,
    enum: schema.enum ?? getEnumFromSchemaRef(schemas, schema.$ref)
  }
}

function buildFieldMetadata(
  fieldName: string,
  schema: OpenApiPropertySchema,
  requiredFields: Set<string>,
  schemas: Record<string, OpenApiPropertySchema>
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
    enum: resolvedSchema.enum ?? getEnumFromSchemaRef(schemas, resolvedSchema.$ref),
    ref,
    items: buildArrayMetadata(resolvedSchema.items, schemas),
    minLength: resolvedSchema.minLength,
    maxLength: resolvedSchema.maxLength,
    minimum: resolvedSchema.minimum,
    maximum: resolvedSchema.maximum
  }
}

function extractSchemaMetadata(spec: unknown): Record<string, GeneratedOpenApiSchemaMetadata> {
  const schemas = getSchemas(spec)
  const result: Record<string, GeneratedOpenApiSchemaMetadata> = {}

  for (const [schemaName, schema] of Object.entries(schemas)) {
    if (isGenericResponseWrapperSchema(schema)) {
      continue
    }

    if (schema.type === 'object' || schema.properties) {
      const required = schema.required ?? []
      const requiredFields = new Set(required)
      const fields = Object.fromEntries(
        Object.entries(schema.properties ?? {}).map(([fieldName, fieldSchema]) => [
          fieldName,
          buildFieldMetadata(fieldName, fieldSchema, requiredFields, schemas)
        ])
      )

      result[schemaName] = {
        title: schema.title,
        description: schema.description,
        required,
        additionalProperties:
          typeof schema.additionalProperties === 'boolean'
            ? schema.additionalProperties
            : undefined,
        fields
      }
      continue
    }

    if (schema.enum) {
      result[schemaName] = {
        title: schema.title,
        description: schema.description,
        required: [],
        fields: {
          [ENUM_MARKER]: {
            title: schema.title,
            description: schema.description,
            type: 'string',
            required: true,
            nullable: false,
            default: schema.default,
            enum: schema.enum
          }
        }
      }
    }
  }

  return result
}

const GENERATED_RESPONSE_TYPE_HELPERS = `export type ApiResponse<TData> = {
  code: string
  message: string
  data?: TData | null
  timestamp?: string
}

export type ApiListData<TItem> = {
  total: number
  items?: TItem[]
  limit: number
  offset: number
}

export type ApiListResponse<TItem> = ApiResponse<ApiListData<TItem>>
`

type GenericResponseWrapperKind = 'response' | 'list-data' | 'list-response'

interface GenericResponseWrapperSchema {
  kind: GenericResponseWrapperKind
  typeArgument: string
}

function parseGenericResponseWrapperTitle(
  title: string | undefined
): GenericResponseWrapperSchema | undefined {
  const match = title?.match(/^(ResponseSchemaModel|ListResponseData|ListResponseSchemaModel)\[(.+)]$/)

  if (!match) {
    return undefined
  }

  const [, rawKind, typeArgument] = match

  if (rawKind === 'ResponseSchemaModel') {
    return { kind: 'response', typeArgument }
  }

  if (rawKind === 'ListResponseData') {
    return { kind: 'list-data', typeArgument }
  }

  return { kind: 'list-response', typeArgument }
}

function isGenericResponseWrapperSchema(schema: OpenApiPropertySchema): boolean {
  return parseGenericResponseWrapperTitle(schema.title) !== undefined
}

function getComponentSchemaName(path: string | undefined): string | undefined {
  const prefix = '#/components/schemas/'

  if (!path?.startsWith(prefix)) {
    return undefined
  }

  return path.slice(prefix.length)
}

function splitTopLevelTypeArguments(value: string): string[] {
  const result: string[] = []
  let depth = 0
  let startIndex = 0

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index]

    if (char === '[') {
      depth += 1
      continue
    }

    if (char === ']') {
      depth -= 1
      continue
    }

    if (char === ',' && depth === 0) {
      result.push(value.slice(startIndex, index).trim())
      startIndex = index + 1
    }
  }

  result.push(value.slice(startIndex).trim())
  return result
}

function createComponentsSchemaTypeNode(schemaName: string): ts.TypeNode {
  return ts.factory.createIndexedAccessTypeNode(
    ts.factory.createIndexedAccessTypeNode(
      ts.factory.createTypeReferenceNode('components'),
      ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral('schemas'))
    ),
    ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(schemaName))
  )
}

function createRecordTypeNode(valueType: ts.TypeNode): ts.TypeNode {
  return ts.factory.createTypeReferenceNode('Record', [
    ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
    valueType
  ])
}

function createTypeNodeForPythonType(
  typeExpression: string,
  schemaNames: ReadonlySet<string>
): ts.TypeNode {
  const trimmed = typeExpression.trim()

  if (trimmed === 'Any') {
    return ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword)
  }

  if (trimmed === 'None' || trimmed === 'NoneType') {
    return ts.factory.createLiteralTypeNode(ts.factory.createNull())
  }

  if (trimmed === 'str') {
    return ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
  }

  if (trimmed === 'int' || trimmed === 'float') {
    return ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword)
  }

  if (trimmed === 'bool') {
    return ts.factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword)
  }

  const listMatch = trimmed.match(/^list\[(.+)]$/)
  if (listMatch) {
    return ts.factory.createArrayTypeNode(createTypeNodeForPythonType(listMatch[1], schemaNames))
  }

  const dictMatch = trimmed.match(/^dict\[(.+)]$/)
  if (dictMatch) {
    const [keyType, valueType] = splitTopLevelTypeArguments(dictMatch[1])

    if (keyType !== 'str') {
      return createRecordTypeNode(ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword))
    }

    return createRecordTypeNode(createTypeNodeForPythonType(valueType, schemaNames))
  }

  if (schemaNames.has(trimmed)) {
    return createComponentsSchemaTypeNode(trimmed)
  }

  return ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword)
}

function createGenericResponseWrapperTypeNode(
  wrapper: GenericResponseWrapperSchema,
  schemaNames: ReadonlySet<string>
): ts.TypeNode {
  const typeArgument = createTypeNodeForPythonType(wrapper.typeArgument, schemaNames)

  if (wrapper.kind === 'response') {
    return ts.factory.createTypeReferenceNode('ApiResponse', [typeArgument])
  }

  if (wrapper.kind === 'list-data') {
    return ts.factory.createTypeReferenceNode('ApiListData', [typeArgument])
  }

  return ts.factory.createTypeReferenceNode('ApiListResponse', [typeArgument])
}

async function generateTypesFile(spec: unknown, outputPath: string): Promise<boolean> {
  console.log('🔧 正在生成类型定义文件...')

  const schemaNames = new Set(Object.keys(getSchemas(spec)))
  const ast = await openapiTS(spec as Parameters<typeof openapiTS>[0], {
    alphabetize: true,
    inject: GENERATED_RESPONSE_TYPE_HELPERS,
    transform(schemaObject, options) {
      const schemaName = getComponentSchemaName(options.path)
      if (!schemaName) {
        return undefined
      }

      const wrapper = parseGenericResponseWrapperTitle(schemaObject.title)
      if (!wrapper) {
        return undefined
      }

      return createGenericResponseWrapperTypeNode(wrapper, schemaNames)
    }
  })

  const generatedTypes = astToString(ast)
  const content = `/**
 * 自动生成的 OpenAPI 类型定义
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: ${config.generatedOpenApiSourceLabel}
 *
 * 更新类型: pnpm generate:types
 */

/* tslint:disable */

${generatedTypes}
`

  const changed = writeFileIfChanged(outputPath, content)
  console.log(changed ? `✅ 类型定义文件已更新: ${outputPath}` : `✅ 类型定义无变化: ${outputPath}`)
  return changed
}

interface MetadataModulePlan {
  schemaName: string
  exportName: string
  fileName: string
  metadata: GeneratedOpenApiSchemaMetadata
}

interface MetadataGenerationResult {
  changed: boolean
  deletedFiles: string[]
  generatedFileNames: string[]
}

const TYPESCRIPT_RESERVED_WORDS = new Set([
  'abstract',
  'any',
  'as',
  'asserts',
  'async',
  'await',
  'bigint',
  'boolean',
  'break',
  'case',
  'catch',
  'class',
  'const',
  'constructor',
  'continue',
  'debugger',
  'declare',
  'default',
  'delete',
  'do',
  'else',
  'enum',
  'export',
  'extends',
  'false',
  'finally',
  'for',
  'from',
  'function',
  'get',
  'if',
  'implements',
  'import',
  'in',
  'infer',
  'instanceof',
  'interface',
  'is',
  'keyof',
  'let',
  'module',
  'namespace',
  'never',
  'new',
  'null',
  'number',
  'object',
  'of',
  'package',
  'private',
  'protected',
  'public',
  'readonly',
  'require',
  'return',
  'set',
  'static',
  'string',
  'super',
  'switch',
  'symbol',
  'this',
  'throw',
  'true',
  'try',
  'type',
  'typeof',
  'undefined',
  'unique',
  'unknown',
  'var',
  'void',
  'while',
  'with',
  'yield'
])

function toTypeScriptIdentifier(value: string, fallback: string): string {
  const sanitized = value.replace(/[^a-zA-Z0-9_$]+/g, '_')
  const base = sanitized || fallback
  const identifier = /^[a-zA-Z_$]/.test(base) ? base : `${fallback}${base}`

  if (TYPESCRIPT_RESERVED_WORDS.has(identifier)) {
    return `${identifier}Schema`
  }

  return identifier
}

function createMetadataModulePlans(
  metadata: Record<string, GeneratedOpenApiSchemaMetadata>
): MetadataModulePlan[] {
  const usedExports = new Map<string, string>()
  const usedFiles = new Map<string, string>()

  return Object.entries(metadata)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([schemaName, schemaMetadata]) => {
      const identifier = toTypeScriptIdentifier(schemaName, 'Schema')
      const exportName = `${identifier}Metadata`
      const fileName = `${identifier}.ts`
      const previousExport = usedExports.get(exportName)
      const previousFile = usedFiles.get(fileName)

      if (previousExport) {
        throw new Error(
          `OpenAPI schema 元数据导出名冲突: ${previousExport} 与 ${schemaName} 都映射到 ${exportName}`
        )
      }

      if (previousFile) {
        throw new Error(
          `OpenAPI schema 元数据文件名冲突: ${previousFile} 与 ${schemaName} 都映射到 ${fileName}`
        )
      }

      usedExports.set(exportName, schemaName)
      usedFiles.set(fileName, schemaName)

      return {
        schemaName,
        exportName,
        fileName,
        metadata: schemaMetadata
      }
    })
}

function buildMetadataTypesTemplate(): string {
  return `/**
 * 自动生成的 OpenAPI 字段元数据类型
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: ${config.generatedOpenApiSourceLabel}
 *
 * 更新类型: pnpm generate:types
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
`
}

function buildMetadataModuleTemplate(plan: MetadataModulePlan): string {
  return `/**
 * 自动生成的 OpenAPI schema 字段元数据: ${plan.schemaName}
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: ${config.generatedOpenApiSourceLabel}
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const ${plan.exportName} = ${JSON.stringify(plan.metadata, null, 2)} satisfies OpenApiSchemaMetadata
`
}

function buildMetadataIndexTemplate(plans: MetadataModulePlan[]): string {
  const exports = plans
    .map(plan => `export { ${plan.exportName} } from './${plan.fileName.replace(/\.ts$/, '')}'`)
    .join('\n')

  return `/**
 * 自动生成的 OpenAPI schema 字段元数据索引
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: ${config.generatedOpenApiSourceLabel}
 *
 * 更新类型: pnpm generate:types
 */

export type {
  OpenApiArrayMetadata,
  OpenApiEnumValue,
  OpenApiFieldMetadata,
  OpenApiSchemaMetadata
} from '../openapi-metadata-types'

${exports}
`
}

function buildMetadataEntryTemplate(): string {
  return `/**
 * 自动生成的 OpenAPI schema 字段元数据入口
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: ${config.generatedOpenApiSourceLabel}
 *
 * 更新类型: pnpm generate:types
 */

export * from './openapi-metadata/index'
`
}

function collectStaleGeneratedMetadataModules(
  outputDir: string,
  expectedFiles: Set<string>
): string[] {
  if (!existsSync(outputDir)) {
    return []
  }

  return readdirSync(outputDir)
    .filter(fileName => fileName.endsWith('.ts') && !expectedFiles.has(fileName))
    .filter(fileName => {
      const content = readFileSync(join(outputDir, fileName), 'utf-8')
      return (
        content.includes('自动生成的 OpenAPI schema 字段元数据') &&
        content.includes('此文件由 scripts/generate-api-types.ts 自动生成')
      )
    })
    .sort()
}

function deleteStaleGeneratedMetadataModules(
  outputDir: string,
  expectedFiles: Set<string>
): string[] {
  const staleFiles = collectStaleGeneratedMetadataModules(outputDir, expectedFiles)

  for (const fileName of staleFiles) {
    deleteFileIfExists(join(outputDir, fileName))
  }

  return staleFiles
}

async function generateMetadataFiles(
  spec: unknown,
  typesOutputPath: string,
  entryOutputPath: string,
  indexOutputPath: string,
  modulesOutputDir: string
): Promise<MetadataGenerationResult> {
  console.log('🧭 正在生成 OpenAPI 字段元数据...')

  const metadata = extractSchemaMetadata(spec)
  const plans = createMetadataModulePlans(metadata)
  const expectedFiles = new Set<string>(['index.ts'])
  let changed = writeFileIfChanged(typesOutputPath, buildMetadataTypesTemplate())
  changed = writeFileIfChanged(entryOutputPath, buildMetadataEntryTemplate()) || changed

  ensureDir(modulesOutputDir)

  const indexChanged = writeFileIfChanged(indexOutputPath, buildMetadataIndexTemplate(plans))
  changed = changed || indexChanged

  for (const plan of plans) {
    expectedFiles.add(plan.fileName)

    const outputPath = join(modulesOutputDir, plan.fileName)
    const fileChanged = writeFileIfChanged(outputPath, buildMetadataModuleTemplate(plan))
    console.log(
      fileChanged ? `  ✅ 已更新: ${plan.fileName}` : `  ✅ 无变化: ${plan.fileName}`
    )
    changed = changed || fileChanged
  }

  const deletedFiles = deleteStaleGeneratedMetadataModules(modulesOutputDir, expectedFiles)

  console.log(
    changed || deletedFiles.length > 0
      ? `✅ 字段元数据已拆分生成: ${modulesOutputDir}`
      : `✅ 字段元数据无变化: ${modulesOutputDir}`
  )

  return {
    changed: changed || deletedFiles.length > 0,
    deletedFiles,
    generatedFileNames: ['index.ts', ...plans.map(plan => plan.fileName)]
  }
}

export function validateGeneratedFile(outputPath: string): void {
  if (!existsSync(outputPath)) {
    throw new Error(`生成文件不存在: ${outputPath}`)
  }

  const result = ts.transpileModule(readFileSync(outputPath, 'utf-8'), {
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
    throw new Error(`生成文件存在语法问题:\n${message}`)
  }
}

export function extractEndpoints(spec: unknown): EndpointInfo[] {
  const paths = (spec as OpenApiDocument).paths ?? {}
  const methods: HttpMethod[] = ['get', 'post', 'put', 'patch', 'delete']
  const endpoints: EndpointInfo[] = []

  for (const [path, pathItem] of Object.entries(paths)) {
    if (!pathItem) {
      continue
    }

    for (const method of methods) {
      const operation = pathItem[method]
      if (operation) {
        endpoints.push({ path, method, operation })
      }
    }
  }

  return endpoints
}

function parseModuleModelFromPath(path: string): {
  version: string
  module: string
  model: string
  collectionPath: string
} | null {
  const match = path.match(/^\/api\/(v\d+)\/([^/]+)\/([^/]+)(?:\/.*)?$/)
  if (!match) {
    return null
  }

  const [, version, module, model] = match
  return {
    version,
    module,
    model,
    collectionPath: `/api/${version}/${module}/${model}`
  }
}

export function groupEndpointsByModuleModel(endpoints: EndpointInfo[]): ModuleModelGroup[] {
  const groups = new Map<string, ModuleModelGroup>()

  for (const endpoint of endpoints) {
    const parsed = parseModuleModelFromPath(endpoint.path)
    if (!parsed) {
      continue
    }

    const key = `${parsed.module}:${parsed.model}`
    const existing = groups.get(key)
    if (existing) {
      existing.endpoints.push(endpoint)
      continue
    }

    groups.set(key, {
      key,
      version: parsed.version,
      module: parsed.module,
      model: parsed.model,
      collectionPath: parsed.collectionPath,
      endpoints: [endpoint]
    })
  }

  return Array.from(groups.values()).sort((left, right) => left.key.localeCompare(right.key))
}

function getRelativePath(collectionPath: string, path: string): string | null {
  if (path === collectionPath) {
    return ''
  }

  const prefix = `${collectionPath}/`
  if (!path.startsWith(prefix)) {
    return null
  }

  return path.slice(prefix.length)
}

function isParameterSegment(segment: string): boolean {
  return /^\{[^}]+\}$/.test(segment)
}

function isSingleParameterRelativePath(relativePath: string): boolean {
  return !!relativePath && relativePath.split('/').length === 1 && isParameterSegment(relativePath)
}

function hasRelativeEndpoint(
  collectionPath: string,
  endpoints: EndpointInfo[],
  relativePath: string,
  method: HttpMethod
): boolean {
  return endpoints.some(
    endpoint =>
      getRelativePath(collectionPath, endpoint.path) === relativePath && endpoint.method === method
  )
}

function hasParameterizedItemEndpoint(
  collectionPath: string,
  endpoints: EndpointInfo[],
  method: HttpMethod
): boolean {
  return endpoints.some(endpoint => {
    const relativePath = getRelativePath(collectionPath, endpoint.path)
    return (
      endpoint.method === method && !!relativePath && isSingleParameterRelativePath(relativePath)
    )
  })
}

export function classifyCrudCapabilities(
  collectionPath: string,
  endpoints: EndpointInfo[]
): CrudCapabilities {
  const hasStandardCrud =
    hasRelativeEndpoint(collectionPath, endpoints, '', 'post') &&
    hasParameterizedItemEndpoint(collectionPath, endpoints, 'get') &&
    hasParameterizedItemEndpoint(collectionPath, endpoints, 'put') &&
    hasParameterizedItemEndpoint(collectionPath, endpoints, 'delete') &&
    hasRelativeEndpoint(collectionPath, endpoints, 'query', 'post')

  if (!hasStandardCrud) {
    return {
      kind: 'none',
      hasBulkDelete: false
    }
  }

  const hasSoftDelete =
    endpoints.some(endpoint => {
      const relativePath = getRelativePath(collectionPath, endpoint.path)
      if (!relativePath || endpoint.method !== 'post') {
        return false
      }

      const parts = relativePath.split('/')
      return parts.length === 2 && isParameterSegment(parts[0]) && parts[1] === 'restore'
    }) &&
    hasRelativeEndpoint(collectionPath, endpoints, 'trash', 'get') &&
    hasRelativeEndpoint(collectionPath, endpoints, 'trash/restore', 'post') &&
    hasRelativeEndpoint(collectionPath, endpoints, 'trash/permanent', 'delete')

  return {
    kind: hasSoftDelete ? 'soft-delete' : 'standard',
    hasBulkDelete: hasRelativeEndpoint(collectionPath, endpoints, 'bulk', 'delete')
  }
}

function isManagedCrudEndpoint(
  relativePath: string,
  method: HttpMethod,
  capabilities: CrudCapabilities
): boolean {
  if (capabilities.kind === 'none') {
    return false
  }

  if (relativePath === '' && method === 'post') {
    return true
  }

  if (relativePath === 'query' && method === 'post') {
    return true
  }

  if (relativePath === 'bulk' && method === 'delete') {
    return true
  }

  if (isSingleParameterRelativePath(relativePath) && ['get', 'put', 'delete'].includes(method)) {
    return true
  }

  if (capabilities.kind === 'soft-delete') {
    const parts = relativePath.split('/')
    if (
      parts.length === 2 &&
      isParameterSegment(parts[0]) &&
      parts[1] === 'restore' &&
      method === 'post'
    ) {
      return true
    }

    if (relativePath === 'trash' && method === 'get') {
      return true
    }

    if (relativePath === 'trash/restore' && method === 'post') {
      return true
    }

    if (relativePath === 'trash/permanent' && method === 'delete') {
      return true
    }
  }

  return false
}

function tokenizeIdentifier(value: string): string[] {
  const normalized = value.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
  const parts = normalized
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map(part => part.replace(/[^a-zA-Z0-9]/g, '').toLowerCase())

  if (parts.length === 0) {
    return []
  }

  return parts
}

function toCamelCaseIdentifier(value: string): string {
  const parts = tokenizeIdentifier(value)

  if (parts.length === 0) {
    return 'module'
  }

  return parts
    .map((part, index) => {
      const lowerPart = part.toLowerCase()
      return index === 0 ? lowerPart : lowerPart.charAt(0).toUpperCase() + lowerPart.slice(1)
    })
    .join('')
}

function toPascalCaseIdentifier(value: string): string {
  const parts = tokenizeIdentifier(value)

  if (parts.length === 0) {
    return 'Module'
  }

  return parts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('')
}

function toScreamingSnakeCase(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .toUpperCase()
}

function stripPathParam(segment: string): string {
  return segment.replace(/^\{/, '').replace(/\}$/, '')
}

function methodPrefix(method: HttpMethod): string {
  switch (method) {
    case 'get':
      return 'get'
    case 'post':
      return 'create'
    case 'put':
      return 'update'
    case 'patch':
      return 'patch'
    case 'delete':
      return 'delete'
  }
}

export function buildMethodNameFromRelativePath(
  relativePath: string,
  method: HttpMethod,
  fallbackName?: string
): string {
  const segments = relativePath.split('/').filter(Boolean)
  const staticSegments = segments.filter(segment => !isParameterSegment(segment))

  if (staticSegments.length > 0) {
    return toCamelCaseIdentifier(staticSegments.join('-'))
  }

  const paramSegments = segments.filter(isParameterSegment).map(stripPathParam)

  if (paramSegments.length > 0) {
    return `${methodPrefix(method)}By${paramSegments.map(toPascalCaseIdentifier).join('And')}`
  }

  if (fallbackName) {
    return toCamelCaseIdentifier(fallbackName)
  }

  return methodPrefix(method)
}

function ensureUniqueMethodName(
  name: string,
  method: HttpMethod,
  existingNames: Set<string>
): string {
  if (!existingNames.has(name)) {
    existingNames.add(name)
    return name
  }

  const withMethodPrefix = `${methodPrefix(method)}${name.charAt(0).toUpperCase()}${name.slice(1)}`
  if (!existingNames.has(withMethodPrefix)) {
    existingNames.add(withMethodPrefix)
    return withMethodPrefix
  }

  let index = 2
  let candidate = `${withMethodPrefix}${index}`
  while (existingNames.has(candidate)) {
    index += 1
    candidate = `${withMethodPrefix}${index}`
  }

  existingNames.add(candidate)
  return candidate
}

export function buildModulePlans(groups: ModuleModelGroup[]): ModulePlan[] {
  const pureActionGroupsByModule = new Map<string, ModuleModelGroup[]>()
  const provisionalPlans: ProvisionalModulePlan[] = []

  for (const group of groups) {
    const capabilities = classifyCrudCapabilities(group.collectionPath, group.endpoints)
    if (capabilities.kind === 'none') {
      const existing = pureActionGroupsByModule.get(group.module) ?? []
      existing.push(group)
      pureActionGroupsByModule.set(group.module, existing)
      continue
    }

    provisionalPlans.push({
      key: group.key,
      kind: 'resource',
      groups: [group],
      preferredBaseName: toCamelCaseIdentifier(group.model),
      fallbackBaseName: toCamelCaseIdentifier(`${group.module}-${group.model}`)
    })
  }

  for (const [moduleName, moduleGroups] of pureActionGroupsByModule.entries()) {
    moduleGroups.sort((left, right) => left.collectionPath.localeCompare(right.collectionPath))
    provisionalPlans.push({
      key: `module:${moduleName}`,
      kind: 'module-actions',
      groups: moduleGroups,
      preferredBaseName: toCamelCaseIdentifier(moduleName),
      fallbackBaseName: toCamelCaseIdentifier(`${moduleName}-module`)
    })
  }

  const counts = new Map<string, number>()
  for (const plan of provisionalPlans) {
    counts.set(plan.preferredBaseName, (counts.get(plan.preferredBaseName) ?? 0) + 1)
  }

  const finalizedPlans: ModulePlan[] = []
  const usedNames = new Set<string>()

  for (const plan of provisionalPlans.sort((left, right) => left.key.localeCompare(right.key))) {
    const isPreferredNameDuplicated = (counts.get(plan.preferredBaseName) ?? 0) > 1
    const initialBaseName = isPreferredNameDuplicated
      ? plan.fallbackBaseName
      : plan.preferredBaseName

    let fileBaseName = initialBaseName
    let index = 2
    while (usedNames.has(fileBaseName)) {
      fileBaseName = `${initialBaseName}${index}`
      index += 1
    }

    usedNames.add(fileBaseName)
    finalizedPlans.push({
      key: plan.key,
      kind: plan.kind,
      fileBaseName,
      groups: plan.groups
    })
  }

  return finalizedPlans
}

function buildContractTypeRef(
  kind: 'path' | 'query' | 'body' | 'response',
  path: string,
  method: HttpMethod
): string {
  switch (kind) {
    case 'path':
      return `ContractPathParams<'${path}', '${method}'>`
    case 'query':
      return `ContractQueryParams<'${path}', '${method}'>`
    case 'body':
      return `ContractRequestBody<'${path}', '${method}'>`
    case 'response':
      return `ContractResponseData<'${path}', '${method}'>`
  }
}

function buildGeneratedMethodInfo(
  group: ModuleModelGroup,
  endpoint: EndpointInfo,
  capabilities: CrudCapabilities,
  existingNames: Set<string>
): GeneratedMethodInfo {
  const relativePath = getRelativePath(group.collectionPath, endpoint.path)
  if (relativePath === null) {
    throw new Error(`端点不属于资源集合: ${endpoint.path}`)
  }

  let baseName = buildMethodNameFromRelativePath(relativePath, endpoint.method)
  if (capabilities.kind === 'none' && relativePath === '') {
    baseName = toCamelCaseIdentifier(group.model)
  }

  const name = ensureUniqueMethodName(baseName, endpoint.method, existingNames)
  const typeAliasBase = toPascalCaseIdentifier(name)

  const queryParams = endpoint.operation.parameters?.some(parameter => parameter.in === 'query')
  const pathParams = endpoint.operation.parameters?.some(parameter => parameter.in === 'path')
  const hasBody = !!endpoint.operation.requestBody?.content?.['application/json']

  return {
    name,
    path: endpoint.path,
    method: endpoint.method,
    responseType: buildContractTypeRef('response', endpoint.path, endpoint.method),
    pathParamsType: pathParams
      ? buildContractTypeRef('path', endpoint.path, endpoint.method)
      : undefined,
    queryParamsType: queryParams
      ? buildContractTypeRef('query', endpoint.path, endpoint.method)
      : undefined,
    bodyType: hasBody ? buildContractTypeRef('body', endpoint.path, endpoint.method) : undefined,
    summary: endpoint.operation.summary,
    description: endpoint.operation.description,
    typeAliasBase
  }
}

function generateMethodTypeAliases(methodInfo: GeneratedMethodInfo): string[] {
  const lines = [`export type ${methodInfo.typeAliasBase}Result = ${methodInfo.responseType}`]

  if (methodInfo.pathParamsType) {
    lines.push(`export type ${methodInfo.typeAliasBase}PathParams = ${methodInfo.pathParamsType}`)
  }

  if (methodInfo.queryParamsType) {
    lines.push(`export type ${methodInfo.typeAliasBase}Query = ${methodInfo.queryParamsType}`)
  }

  if (methodInfo.bodyType) {
    lines.push(`export type ${methodInfo.typeAliasBase}Input = ${methodInfo.bodyType}`)
  }

  return lines
}

function generateMethodFactoryCode(methodInfo: GeneratedMethodInfo): string {
  const lines: string[] = []

  if (methodInfo.summary || methodInfo.description) {
    lines.push('  /**')
    if (methodInfo.summary) {
      lines.push(`   * ${methodInfo.summary}`)
    }
    if (methodInfo.description && methodInfo.description !== methodInfo.summary) {
      lines.push(`   * @description ${methodInfo.description}`)
    }
    lines.push(`   * @endpoint ${methodInfo.method.toUpperCase()} ${methodInfo.path}`)
    lines.push('   * @returns alova method instance')
    lines.push('   */')
  }

  const signatureParts: string[] = []
  const requestOptions: string[] = []

  if (methodInfo.pathParamsType) {
    signatureParts.push(`params: ${methodInfo.pathParamsType}`)
    requestOptions.push('params')
  }

  if (methodInfo.bodyType) {
    signatureParts.push(`body: ${methodInfo.bodyType}`)
    requestOptions.push('body')
  }

  if (methodInfo.queryParamsType) {
    signatureParts.push(`query?: ${methodInfo.queryParamsType}`)
    requestOptions.push('query')
  }

  signatureParts.push('config?: ContractRequestConfig')
  requestOptions.push('config')

  lines.push(`  ${methodInfo.name}(${signatureParts.join(', ')}) {`)
  lines.push(
    `    return contractMethods.${methodInfo.method}('${methodInfo.path}', { ${requestOptions.join(', ')} })`
  )
  lines.push('  }')

  return lines.join('\n')
}

function getPlanCrudCapabilities(plan: ModulePlan): CrudCapabilities {
  if (plan.kind !== 'resource') {
    return NO_CRUD_CAPABILITIES
  }

  const primaryGroup = plan.groups[0]
  return classifyCrudCapabilities(primaryGroup.collectionPath, primaryGroup.endpoints)
}

function getGeneratedEndpointsForGroup(
  plan: ModulePlan,
  group: ModuleModelGroup,
  capabilities: CrudCapabilities
): EndpointInfo[] {
  if (plan.kind !== 'resource') {
    return group.endpoints
  }

  return group.endpoints.filter(endpoint => {
    const relativePath = getRelativePath(group.collectionPath, endpoint.path)
    return (
      relativePath !== null && !isManagedCrudEndpoint(relativePath, endpoint.method, capabilities)
    )
  })
}

function getCrudResourcePathType(capabilities: CrudCapabilities): string | null {
  if (capabilities.kind === 'soft-delete') {
    return 'SoftDeleteCrudResourceCollectionPath'
  }

  if (capabilities.kind === 'standard') {
    return 'CrudResourceCollectionPath'
  }

  return null
}

function generateModuleAutoSection(plan: ModulePlan): string {
  const moduleBaseName = plan.fileBaseName
  const pascalBaseName = toPascalCaseIdentifier(moduleBaseName)
  const apiName = `${moduleBaseName}Api`
  const existingNames = new Set<string>()
  const primaryGroup = plan.groups[0]
  const capabilities = getPlanCrudCapabilities(plan)
  const collectionConst = `${toScreamingSnakeCase(moduleBaseName)}_COLLECTION_PATH`
  const bulkConst = `${toScreamingSnakeCase(moduleBaseName)}_BULK_DELETE_PATH`
  const generatedMethods = plan.groups.flatMap(group => {
    const sourceEndpoints = getGeneratedEndpointsForGroup(plan, group, capabilities)
    return sourceEndpoints.map(endpoint =>
      buildGeneratedMethodInfo(group, endpoint, capabilities, existingNames)
    )
  })

  const imports: string[] = [
    `/* eslint-disable @typescript-eslint/no-unused-vars */`,
    `/**`,
    ` * 自动生成的 API 模块`,
    ` *`,
    ` * ⚠️  请勿手动编辑 AUTO GENERATED 区域`,
    ` * 此文件由 scripts/generate-api-types.ts 自动生成`,
    ` *`,
    ` * 资源: ${plan.groups.map(group => group.collectionPath).join(', ')}`,
    ` */`,
    `import { contractMethods } from '@/api/contract/client'`,
    `import type {`,
    `  ContractPathParams,`,
    `  ContractQueryParams,`,
    `  ContractRequestBody,`,
    `  ContractRequestConfig,`,
    `  ContractResponseData,`,
    `} from '@/api/contract/types'`,
    `import type { components, paths } from '@/api/generated/openapi-types'`
  ]

  if (capabilities.kind === 'soft-delete') {
    imports.push(
      `import {`,
      `  type SoftDeleteCrudApiMethods,`,
      `  createSoftDeleteCrudRequestAdapterMethods,`,
      `  type CrudCreateInput,`,
      `  type CrudItem,`,
      `  type CrudResourceCollectionPath,`,
      `  type CrudUpdateInput,`,
      `  type SoftDeleteCrudResourceCollectionPath,`,
      `} from '@/api/base/crud-request-adapter'`
    )
  } else if (capabilities.kind === 'standard') {
    imports.push(
      `import {`,
      `  type CrudApiMethods,`,
      `  createCrudRequestAdapterMethods,`,
      `  type CrudCreateInput,`,
      `  type CrudItem,`,
      `  type CrudResourceCollectionPath,`,
      `  type CrudUpdateInput,`,
      `} from '@/api/base/crud-request-adapter'`
    )
  }

  const lines = [...imports, '']
  const resourcePathType = getCrudResourcePathType(capabilities)

  if (plan.kind === 'resource') {
    lines.push(`const ${collectionConst} = '${primaryGroup.collectionPath}' as const`)
    if (capabilities.hasBulkDelete) {
      lines.push(`const ${bulkConst} = '${primaryGroup.collectionPath}/bulk' as const`)
    }
    lines.push('')
    lines.push(`type EnsureEntityId<TItem> = TItem extends { id?: infer TId }`)
    lines.push(`  ? Omit<TItem, 'id'> & { id: Exclude<TId, null | undefined> }`)
    lines.push(`  : TItem`)
    lines.push('')
    lines.push(
      `export type ${pascalBaseName}Item = EnsureEntityId<CrudItem<typeof ${collectionConst}>>`
    )
    lines.push(
      `export type Create${pascalBaseName}Input = CrudCreateInput<typeof ${collectionConst}>`
    )
    lines.push(
      `export type Update${pascalBaseName}Input = CrudUpdateInput<typeof ${collectionConst}>`
    )
    lines.push('')
  }

  for (const methodInfo of generatedMethods) {
    lines.push(...generateMethodTypeAliases(methodInfo))
    lines.push('')
  }

  if (plan.kind === 'resource' && capabilities.kind === 'soft-delete') {
    lines.push(`const base${pascalBaseName}ApiMethods = createSoftDeleteCrudRequestAdapterMethods({`)
    lines.push(`  collection: ${collectionConst} as unknown as ${resourcePathType},`)
    lines.push(`  item: \`\${${collectionConst}}/{id}\` as const,`)
    lines.push(`  query: \`\${${collectionConst}}/query\` as const,`)
    lines.push(`  restore: \`\${${collectionConst}}/{id}/restore\` as const,`)
    lines.push(`  trash: \`\${${collectionConst}}/trash\` as const,`)
    lines.push(`  trashRestore: \`\${${collectionConst}}/trash/restore\` as const,`)
    lines.push(`  trashPermanentDelete: \`\${${collectionConst}}/trash/permanent\` as const,`)
    if (capabilities.hasBulkDelete) {
      lines.push(`  bulkDelete: ${bulkConst},`)
    }
    lines.push(
      `}) as unknown as SoftDeleteCrudApiMethods<${pascalBaseName}Item, Create${pascalBaseName}Input, Update${pascalBaseName}Input>`
    )
    lines.push('')
  }

  if (plan.kind === 'resource' && capabilities.kind === 'standard') {
    lines.push(`const base${pascalBaseName}ApiMethods = createCrudRequestAdapterMethods({`)
    lines.push(`  collection: ${collectionConst} as unknown as ${resourcePathType},`)
    lines.push(`  item: \`\${${collectionConst}}/{id}\` as const,`)
    lines.push(`  query: \`\${${collectionConst}}/query\` as const,`)
    if (capabilities.hasBulkDelete) {
      lines.push(`  bulkDelete: ${bulkConst},`)
    }
    lines.push(
      `}) as unknown as CrudApiMethods<${pascalBaseName}Item, Create${pascalBaseName}Input, Update${pascalBaseName}Input>`
    )
    lines.push('')
  }

  lines.push(`export const ${apiName}Methods = {`)
  if (plan.kind === 'resource' && capabilities.kind !== 'none') {
    lines.push(`  ...base${pascalBaseName}ApiMethods,`)
    if (generatedMethods.length > 0) {
      lines.push('')
    }
  }
  if (generatedMethods.length > 0) {
    lines.push(generatedMethods.map(generateMethodFactoryCode).join(',\n\n'))
  }
  lines.push(`}`)

  return lines
    .filter((line, index, allLines) => !(line === '' && allLines[index - 1] === ''))
    .join('\n')
    .trim()
}

function buildModuleTemplate(autoContent: string, customMethods = '', customConfig = ''): string {
  return [
    AUTO_GENERATED_START,
    autoContent.trim(),
    AUTO_GENERATED_END,
    '',
    CUSTOM_METHODS_START,
    customMethods.trim(),
    CUSTOM_METHODS_END,
    '',
    CUSTOM_CONFIG_START,
    customConfig.trim(),
    CUSTOM_CONFIG_END,
    ''
  ].join('\n')
}

function parseModuleSections(content: string): ExistingModuleSections {
  const normalized = content.replace(/\r\n/g, '\n')
  const pattern = new RegExp(
    `^${escapeForRegex(AUTO_GENERATED_START)}\\n([\\s\\S]*?)\\n${escapeForRegex(
      AUTO_GENERATED_END
    )}\\n\\n${escapeForRegex(CUSTOM_METHODS_START)}\\n([\\s\\S]*?)\\n${escapeForRegex(
      CUSTOM_METHODS_END
    )}\\n\\n${escapeForRegex(CUSTOM_CONFIG_START)}\\n([\\s\\S]*?)\\n${escapeForRegex(
      CUSTOM_CONFIG_END
    )}\\n?$`
  )
  const match = normalized.match(pattern)
  if (!match) {
    throw new Error('模块文件 marker 缺失、顺序错误，或存在未知顶层内容')
  }

  return {
    auto: match[1] ?? '',
    customMethods: match[2] ?? '',
    customConfig: match[3] ?? ''
  }
}

function escapeForRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function mergeModuleWithCustomSections(
  newTemplate: string,
  existingContent?: string
): string {
  if (!existingContent) {
    return newTemplate
  }

  const nextSections = parseModuleSections(newTemplate)
  const currentSections = parseModuleSections(existingContent)
  return buildModuleTemplate(
    nextSections.auto,
    currentSections.customMethods,
    currentSections.customConfig
  )
}

function collectStaleGeneratedModules(outputDir: string, expectedFiles: Set<string>): string[] {
  if (!existsSync(outputDir)) {
    return []
  }

  return readdirSync(outputDir)
    .filter(fileName => fileName.endsWith('.ts') && !expectedFiles.has(fileName))
    .filter(fileName => {
      const content = readFileSync(join(outputDir, fileName), 'utf-8')
      return (
        content.includes(AUTO_GENERATED_START) &&
        content.includes(CUSTOM_METHODS_START) &&
        content.includes(CUSTOM_CONFIG_START)
      )
    })
    .sort()
}

export function deleteStaleGeneratedModules(outputDir: string, expectedFiles: Set<string>): string[] {
  const staleFiles = collectStaleGeneratedModules(outputDir, expectedFiles)

  for (const fileName of staleFiles) {
    deleteFileIfExists(join(outputDir, fileName))
  }

  return staleFiles
}

async function generateApiModules(
  spec: unknown,
  outputDir: string
): Promise<{
  changed: boolean
  deletedFiles: string[]
}> {
  console.log('🔧 正在生成 API 模块...')

  const plans = buildModulePlans(groupEndpointsByModuleModel(extractEndpoints(spec)))
  const expectedFiles = new Set<string>()
  let changed = false

  ensureDir(outputDir)

  for (const plan of plans) {
    const outputFileName = `${plan.fileBaseName}.ts`
    const outputPath = join(outputDir, outputFileName)
    expectedFiles.add(outputFileName)

    const nextTemplate = buildModuleTemplate(generateModuleAutoSection(plan))
    const mergedTemplate = mergeModuleWithCustomSections(
      nextTemplate,
      existsSync(outputPath) ? readFileSync(outputPath, 'utf-8') : undefined
    )

    const fileChanged = writeFileIfChanged(outputPath, mergedTemplate)
    console.log(fileChanged ? `  ✅ 已更新: ${outputFileName}` : `  ✅ 无变化: ${outputFileName}`)
    changed = changed || fileChanged
  }

  const deletedFiles = deleteStaleGeneratedModules(outputDir, expectedFiles)

  return {
    changed: changed || deletedFiles.length > 0,
    deletedFiles
  }
}

function isCliEntry(): boolean {
  const executedFile = process.argv[1]
  return !!executedFile && fileURLToPath(import.meta.url) === executedFile
}

export async function main(): Promise<void> {
  console.log('🚀 OpenAPI 类型生成工具\n')

  ensureDir(config.outputDir)
  ensureDir(config.metadataOutputDir)
  ensureDir(config.modulesOutputDir)

  const spec = await fetchOpenApiSpec(config.openApiSource)

  const typesOutputPath = join(config.outputDir, 'openapi-types.ts')
  const metadataEntryOutputPath = join(config.outputDir, 'openapi-metadata.ts')
  const metadataTypesOutputPath = join(config.outputDir, 'openapi-metadata-types.ts')
  const metadataIndexOutputPath = join(config.metadataOutputDir, 'index.ts')
  const apiClientsOutputPath = join(config.outputDir, 'api-clients.ts')

  const typesChanged = await generateTypesFile(spec, typesOutputPath)
  const metadataResult = await generateMetadataFiles(
    spec,
    metadataTypesOutputPath,
    metadataEntryOutputPath,
    metadataIndexOutputPath,
    config.metadataOutputDir
  )
  const apiClientsDeleted = deleteFileIfExists(apiClientsOutputPath)

  validateGeneratedFile(typesOutputPath)
  validateGeneratedFile(metadataEntryOutputPath)
  validateGeneratedFile(metadataTypesOutputPath)

  for (const fileName of metadataResult.generatedFileNames) {
    validateGeneratedFile(join(config.metadataOutputDir, fileName))
  }

  const modulesResult = await generateApiModules(spec, config.modulesOutputDir)

  for (const fileName of readdirSync(config.modulesOutputDir).filter(file =>
    file.endsWith('.ts')
  )) {
    validateGeneratedFile(join(config.modulesOutputDir, fileName))
  }

  const changed =
    typesChanged ||
    metadataResult.changed ||
    apiClientsDeleted ||
    modulesResult.changed

  console.log(changed ? '\n✅ 类型生成完成！' : '\n✅ 类型无变化，未更新生成文件')
  console.log(`📁 生成目录: ${config.outputDir}`)
  console.log(`📁 模块目录: ${config.modulesOutputDir}`)

  if (apiClientsDeleted) {
    console.log(`🧹 已移除旧聚合客户端: ${apiClientsOutputPath}`)
  }

  if (metadataResult.deletedFiles.length > 0) {
    console.log('\n🧹 已移除以下过期的自动生成 metadata 文件：')
    for (const fileName of metadataResult.deletedFiles) {
      console.log(`   - ${fileName}`)
    }
  }

  if (modulesResult.deletedFiles.length > 0) {
    console.log('\n🧹 已移除以下过期的自动生成模块文件：')
    for (const fileName of modulesResult.deletedFiles) {
      console.log(`   - ${fileName}`)
    }
  }

  console.log('\n💡 提示: 运行 pnpm type:check 验证全量类型')
}

if (isCliEntry()) {
  main().catch(error => {
    console.error('\n❌ 类型生成失败:', error)
    process.exit(1)
  })
}
