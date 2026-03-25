#!/usr/bin/env tsx
/**
 * OpenAPI 类型生成脚本
 *
 * 从后端 OpenAPI 端点生成 TypeScript 类型定义
 * 确保前后端类型一致，防止契约漂移
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import openapiTS, { astToString } from 'openapi-typescript'
import ts from 'typescript'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// ==================== 配置 ====================

interface Config {
  /** 后端 OpenAPI 端点 */
  backendUrl: string
  /** 输出目录 */
  outputDir: string
  /** 是否覆盖已存在的类型 */
  overwrite: boolean
}

const config: Config = {
  // 从环境变量读取，默认开发环境
  backendUrl:
    process.env.VITE_API_BASE_URL ||
    process.env.BACKEND_URL ||
    'http://localhost:8001/api/openapi.json',
  outputDir: join(__dirname, '../src/api/generated'),
  overwrite: true
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

    const changed = typeChanged || metadataChanged
    console.log(changed ? '\n✅ 类型生成完成！' : '\n✅ 类型无变化，未更新生成文件')
    console.log(`📁 输出目录: ${config.outputDir}`)
    console.log('\n💡 提示: 运行 pnpm type:check 验证类型正确性')
  } catch (error) {
    console.error('\n❌ 类型生成失败:', error)
    process.exit(1)
  }
}

// 运行主流程
main()
