#!/usr/bin/env tsx
/**
 * 从后端 OpenAPI schema 生成前端 Zod validation schemas
 *
 * 功能：
 * 1. 从 FastAPI OpenAPI 提取验证规则（minLength, maxLength, pattern 等）
 * 2. 生成对应的 Zod schema 定义（兼容 zod v3）
 * 3. 支持前端扩展自定义验证规则
 *
 * 使用方法：
 *   pnpm exec tsx scripts/generate-zod-from-openapi.ts
 */

import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = join(__filename, '..')

// ==================== 类型定义 ====================

type EnumValue = string | number | boolean | null

interface OpenAPISchema {
  $ref?: string
  type?: string
  title?: string
  description?: string
  minLength?: number
  maxLength?: number
  minimum?: number
  maximum?: number
  pattern?: string
  format?: string
  enum?: EnumValue[]
  default?: unknown
  items?: PropertySchema
  required?: string[]
  properties?: Record<string, PropertySchema>
  additionalProperties?: boolean | PropertySchema
  anyOf?: PropertySchema[]
  oneOf?: PropertySchema[]
  allOf?: PropertySchema[]
}

interface PropertySchema {
  $ref?: string
  type?: string
  title?: string
  description?: string
  minLength?: number
  maxLength?: number
  minimum?: number
  maximum?: number
  pattern?: string
  format?: string
  anyOf?: PropertySchema[]
  oneOf?: PropertySchema[]
  allOf?: PropertySchema[]
  enum?: EnumValue[]
  default?: unknown
  items?: PropertySchema
  required?: string[]
  properties?: Record<string, PropertySchema>
  additionalProperties?: boolean | PropertySchema
}

// ==================== 配置 ====================

const BACKEND_OPENAPI_URL = 'http://localhost:8001/api/openapi.json'
const OUTPUT_DIR = join(__dirname, '../src/types/generated')
const OUTPUT_FILE = join(OUTPUT_DIR, 'zod-schemas.ts')
const SYNC_RECORD_FILE = join(__dirname, '../.contract-sync-record.json')

// ==================== 同步记录 ====================

/**
 * 计算字符串的简单哈希值
 */
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36)
}

/**
 * 写入同步记录
 */
interface SyncRecord {
  lastSyncTime: string
  openApiHash: string
  backendUrl: string
}

function readSyncRecord(): SyncRecord | null {
  if (!existsSync(SYNC_RECORD_FILE)) {
    return null
  }

  try {
    return JSON.parse(readFileSync(SYNC_RECORD_FILE, 'utf-8')) as SyncRecord
  } catch {
    return null
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

function writeSyncRecord(openApiData: Record<string, unknown>): boolean {
  const schemas = JSON.stringify(openApiData.components?.schemas || {})
  const record: SyncRecord = {
    lastSyncTime: new Date().toISOString(),
    openApiHash: simpleHash(schemas),
    backendUrl: BACKEND_OPENAPI_URL,
  }
  const changed = writeFileIfChanged(SYNC_RECORD_FILE, `${JSON.stringify(record, null, 2)}\n`)
  if (changed) {
    console.log(`✅ 记录同步状态: ${SYNC_RECORD_FILE}`)
  }
  return changed
}

// ==================== 工具函数 ====================

/**
 * 获取 OpenAPI schema
 */
async function fetchOpenAPISchema(): Promise<{
  schemas: Record<string, OpenAPISchema>
  openApiData: Record<string, unknown>
}> {
  console.log(`📡 从后端获取 OpenAPI schema: ${BACKEND_OPENAPI_URL}`)

  try {
    const response = await fetch(BACKEND_OPENAPI_URL)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const openApiData = await response.json() as Record<string, unknown>
    const schemas = (openApiData.components as { schemas?: Record<string, OpenAPISchema> })?.schemas || {}

    console.log(`✅ 成功获取 ${Object.keys(schemas).length} 个 schemas`)
    return { schemas, openApiData }
  } catch (error) {
    console.error('❌ 获取 OpenAPI schema 失败:', error)
    throw error
  }
}

function formatLiteral(value: unknown): string {
  if (typeof value === 'string') {
    return JSON.stringify(value)
  }

  if (value === null) {
    return 'null'
  }

  return String(value)
}

function getRefSchemaName(ref: string): string | null {
  const prefix = '#/components/schemas/'
  if (!ref.startsWith(prefix)) {
    return null
  }

  return ref.slice(prefix.length)
}

function buildEnumZod(values: EnumValue[]): string {
  const nonNullValues = values.filter((value): value is Exclude<EnumValue, null> => value !== null)

  if (nonNullValues.length === 0) {
    return 'z.null()'
  }

  const allStrings = nonNullValues.every((value) => typeof value === 'string')
  const baseEnum = allStrings
    ? `z.enum([${nonNullValues.map((value) => formatLiteral(value)).join(', ')}])`
    : nonNullValues.length === 1
      ? `z.literal(${formatLiteral(nonNullValues[0])})`
      : `z.union([${nonNullValues.map((value) => `z.literal(${formatLiteral(value)})`).join(', ')}])`

  return values.includes(null)
    ? `z.union([${baseEnum}, z.null()])`
    : baseEnum
}

function buildUnion(parts: string[]): string {
  if (parts.length === 0) {
    return 'z.any()'
  }

  if (parts.length === 1) {
    return parts[0]
  }

  return `z.union([${parts.join(', ')}])`
}

function buildIntersection(parts: string[]): string {
  if (parts.length === 0) {
    return 'z.any()'
  }

  return parts.reduce((result, part, index) => (
    index === 0 ? part : `z.intersection(${result}, ${part})`
  ), '')
}

function buildObjectZod(
  schema: OpenAPISchema,
  schemas: Record<string, OpenAPISchema>
): string {
  const requiredFields = new Set(schema.required || [])
  const properties = schema.properties || {}
  const lines = Object.entries(properties).flatMap(([fieldName, prop]) => {
    const fieldLines: string[] = []
    const comment = prop.title || prop.description
    if (comment) {
      fieldLines.push(`  /** ${comment} */`)
    }
    fieldLines.push(`  ${fieldName}: ${propertyToZod(prop, requiredFields.has(fieldName), schemas)},`)
    return fieldLines
  })

  if (lines.length === 0) {
    return 'z.object({})'
  }

  return `z.object({\n${lines.join('\n')}\n})`
}

function wrapSelfReferentialSchema(schemaName: string, zodDef: string): string {
  const selfReference = `z.lazy(() => ${schemaName}Schema)`
  if (!zodDef.includes(selfReference)) {
    return zodDef
  }

  return `z.lazy((): z.ZodTypeAny => ${zodDef})`
}

function schemaToZod(
  schema: PropertySchema,
  schemas: Record<string, OpenAPISchema>
): string {
  if (schema.$ref) {
    const refSchemaName = getRefSchemaName(schema.$ref)
    return refSchemaName ? `z.lazy(() => ${refSchemaName}Schema)` : 'z.any()'
  }

  if (schema.enum) {
    return buildEnumZod(schema.enum)
  }

  if (schema.allOf?.length) {
    return buildIntersection(schema.allOf.map((item) => schemaToZod(item, schemas)))
  }

  if (schema.anyOf?.length) {
    return buildUnion(schema.anyOf.map((item) => schemaToZod(item, schemas)))
  }

  if (schema.oneOf?.length) {
    return buildUnion(schema.oneOf.map((item) => schemaToZod(item, schemas)))
  }

  switch (schema.type) {
    case 'string': {
      const calls = ['z.string()']
      if (schema.minLength !== undefined) calls.push(`.min(${schema.minLength})`)
      if (schema.maxLength !== undefined) calls.push(`.max(${schema.maxLength})`)
      if (schema.pattern) calls.push(`.regex(${JSON.stringify(schema.pattern)})`)
      if (schema.format === 'email') calls.push('.email()')
      else if (schema.format === 'uri' || schema.format === 'url') calls.push('.url()')
      else if (schema.format === 'date-time') calls.push('.datetime()')
      else if (schema.format === 'date') calls.push('.date()')
      else if (schema.format === 'time') calls.push('.time()')
      else if (schema.format === 'uuid') calls.push('.uuid()')
      return calls.join('')
    }

    case 'number':
    case 'integer': {
      const calls = ['z.number()']
      if (schema.minimum !== undefined) calls.push(`.min(${schema.minimum})`)
      if (schema.maximum !== undefined) calls.push(`.max(${schema.maximum})`)
      return calls.join('')
    }

    case 'boolean':
      return 'z.boolean()'

    case 'array':
      return `z.array(${schema.items ? schemaToZod(schema.items, schemas) : 'z.any()'})`

    case 'object':
      if (schema.properties) {
        return buildObjectZod(schema, schemas)
      }
      if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
        return `z.record(${schemaToZod(schema.additionalProperties, schemas)})`
      }
      return 'z.record(z.any())'

    case 'null':
      return 'z.null()'

    default:
      if (schema.properties) {
        return buildObjectZod(schema, schemas)
      }
      return 'z.any()'
  }
}

/**
 * 将 OpenAPI 属性转换为 Zod 定义（兼容 zod v3）
 */
function propertyToZod(
  prop: PropertySchema,
  isRequired: boolean,
  schemas: Record<string, OpenAPISchema>
): string {
  const finalZodCalls = [schemaToZod(prop, schemas)]

  if (!isRequired) {
    finalZodCalls.push('.optional()')
  }

  if (prop.default !== undefined) {
    finalZodCalls.push(`.default(${formatLiteral(prop.default)})`)
  }

  return finalZodCalls.join('')
}

/**
 * 生成 Zod schema 代码
 */
function generateZodSchema(
  schemaName: string,
  schema: OpenAPISchema,
  schemas: Record<string, OpenAPISchema>
): string | null {
  // 跳过 OpenAPI 内部辅助 schema
  if (
    schemaName.startsWith('HTTPValidation') ||
    schemaName.startsWith('Body_') ||
    schemaName.startsWith('ResponseSchema')
  ) {
    return null
  }

  const lines: string[] = []

  // 添加注释
  if (schema.description) {
    lines.push(`/**`)
    lines.push(` * ${schema.description}`)
    lines.push(` *`)
    lines.push(` * 从后端 OpenAPI 自动生成，请勿手动编辑`)
    lines.push(` * 如需添加自定义验证，请在扩展文件中修改`)
    lines.push(` */`)
  }

  if (schema.properties && Object.keys(schema.properties).length > 0) {
    const requiredFields = new Set(schema.required || [])
    const objectLines: string[] = []
    for (const [fieldName, prop] of Object.entries(schema.properties)) {
      const zodDef = propertyToZod(prop, requiredFields.has(fieldName), schemas)

      const comment = prop.title || prop.description
      if (comment) {
        objectLines.push(`  /** ${comment} */`)
      }

      objectLines.push(`  ${fieldName}: ${zodDef},`)
    }

    const objectSchema = `z.object({\n${objectLines.join('\n')}\n})`
    lines.push(`export const ${schemaName}Schema = ${wrapSelfReferentialSchema(schemaName, objectSchema)}`)
    return lines.join('\n')
  }

  const zodDef = wrapSelfReferentialSchema(schemaName, schemaToZod(schema, schemas))
  if (zodDef === 'z.any()') {
    return null
  }

  lines.push(`export const ${schemaName}Schema = ${zodDef}`)
  return lines.join('\n')
}

/**
 * 生成完整的 Zod schemas 文件
 */
function generateZodSchemasFile(schemas: Record<string, OpenAPISchema>): string {
  const lines: string[] = []

  // 文件头注释
  lines.push('/**')
  lines.push(' * Zod Validation Schemas')
  lines.push(' *')
  lines.push(' * 此文件由 scripts/generate-zod-from-openapi.ts 自动生成')
  lines.push(' * 从后端 FastAPI OpenAPI schema 提取验证规则')
  lines.push(' *')
  lines.push(' * ⚠️ 请勿手动编辑此文件')
  lines.push(' * 如需自定义验证规则，请修改 src/types/zod-extensions.ts')
  lines.push(' */')
  lines.push('')
  lines.push("import { z } from 'zod'")
  lines.push('')

  // 为每个 schema 生成 Zod 定义
  const schemaNames = Object.keys(schemas).sort()

  for (const schemaName of schemaNames) {
    const schemaCode = generateZodSchema(schemaName, schemas[schemaName], schemas)
    if (schemaCode) {
      lines.push('')
      lines.push(schemaCode)
      lines.push('')
    }
  }

  return lines.join('\n')
}

/**
 * 生成扩展文件（如果不存在）
 */
function generateExtensionFile(): boolean {
  const extensionPath = join(__dirname, '../src/types/zod-extensions.ts')

  if (existsSync(extensionPath)) {
    return false
  }

  const content = `/**
 * Zod Schema 扩展
 *
 * 在此文件中添加自定义验证规则或覆盖自动生成的 schema
 *
 * 示例：
 * import { UserCreateSchema } from './generated/zod-schemas'
 *
 * export const UserCreateSchemaExtended = UserCreateSchema.superRefine((data, ctx) => {
 *   // 添加自定义验证
 *   if (data.username === 'admin') {
 *     ctx.addIssue({
 *       code: z.ZodIssueCode.custom,
 *       message: '不能使用 admin 作为用户名',
 *       path: ['username']
 *     })
 *   }
 * })
 */

// 导出所有自动生成的 schemas
export * from './generated/zod-schemas'

// 在此添加自定义验证扩展
// 如需使用 z 对象，请取消下面的导入
// import { z } from 'zod'
`

  writeFileSync(extensionPath, content, 'utf-8')
  console.log(`✅ 创建扩展文件: ${extensionPath}`)
  return true
}

// ==================== 主函数 ====================

async function main(): Promise<void> {
  console.log('🚀 开始生成 Zod schemas...\n')

  try {
    // 1. 获取 OpenAPI schema
    const { schemas, openApiData } = await fetchOpenAPISchema()
    const schemasHash = simpleHash(JSON.stringify(openApiData.components?.schemas || {}))

    // 2. 生成 Zod schemas 文件
    console.log('\n📝 生成 Zod schemas...')
    const content = generateZodSchemasFile(schemas)

    // 3. 确保输出目录存在
    if (!existsSync(OUTPUT_DIR)) {
      mkdirSync(OUTPUT_DIR, { recursive: true })
    }

    const record = readSyncRecord()
    const fileChanged = writeFileIfChanged(OUTPUT_FILE, content)
    if (fileChanged) {
      console.log(`✅ 生成文件: ${OUTPUT_FILE}`)
    } else {
      console.log(`✅ 生成文件无变化: ${OUTPUT_FILE}`)
    }

    // 5. 生成扩展文件
    const extensionChanged = generateExtensionFile()

    // 6. 写入同步记录
    const recordNeedsUpdate =
      !record ||
      record.openApiHash !== schemasHash ||
      record.backendUrl !== BACKEND_OPENAPI_URL
    const syncRecordChanged = recordNeedsUpdate ? writeSyncRecord(openApiData) : false

    if (!fileChanged && !extensionChanged && !syncRecordChanged) {
      console.log('\n✨ 无变化，未更新生成文件')
      return
    }

    console.log('\n✨ 完成！')
    console.log('\n📖 使用方法:')
    console.log('  import { UserCreateSchema } from "@/types/zod-extensions"')
    console.log('  import { useForm } from "vee-validate"')
    console.log('  const { handleSubmit } = useForm<CreateUserInput>({')
    console.log('    validationSchema: UserCreateSchema  // 直接传递，无需 toTypedSchema')
    console.log('  })')
    console.log('\n📖 详细文档: docs/ZOD_VALIDATION.md')
    console.log('📖 同步流程: docs/CONTRACT_SYNC_WORKFLOW.md')

  } catch (error) {
    console.error('\n❌ 生成失败:', error)
    process.exit(1)
  }
}

main()
