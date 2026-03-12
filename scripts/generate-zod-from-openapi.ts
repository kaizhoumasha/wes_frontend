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

import { writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = join(__filename, '..')

// ==================== 类型定义 ====================

interface OpenAPISchema {
  type?: string
  title?: string
  description?: string
  required?: string[]
  properties?: Record<string, PropertySchema>
  additionalProperties?: boolean
}

interface PropertySchema {
  type?: string
  title?: string
  description?: string
  minLength?: number
  maxLength?: number
  minimum?: number
  maximum?: number
  pattern?: string
  format?: string
  anyOf?: Array<{ type?: string }>
  enum?: (string | number)[]
  default?: unknown
  items?: PropertySchema
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

function writeSyncRecord(openApiData: Record<string, unknown>): void {
  const schemas = JSON.stringify(openApiData.components?.schemas || {})
  const record: SyncRecord = {
    lastSyncTime: new Date().toISOString(),
    openApiHash: simpleHash(schemas),
    backendUrl: BACKEND_OPENAPI_URL,
  }
  writeFileSync(SYNC_RECORD_FILE, JSON.stringify(record, null, 2), 'utf-8')
  console.log(`✅ 记录同步状态: ${SYNC_RECORD_FILE}`)
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

/**
 * 将 OpenAPI 属性转换为 Zod 定义（兼容 zod v3）
 */
function propertyToZod(
  fieldName: string,
  prop: PropertySchema,
  isRequired: boolean
): string {
  // 内部函数，用于从属性生成核心 Zod 链
  const generateCoreZod = (p: PropertySchema): string[] => {
    const calls: string[] = []
    if (p.enum) {
      const enumValues = p.enum.map((v) =>
        typeof v === 'string' ? JSON.stringify(v) : String(v)
      ).join(', ')
      calls.push(`z.enum([${enumValues}])`)
    } else {
      switch (p.type) {
        case 'string':
          calls.push('z.string()')
          if (p.minLength !== undefined) calls.push(`.min(${p.minLength})`)
          if (p.maxLength !== undefined) calls.push(`.max(${p.maxLength})`)
          if (p.pattern) calls.push(`.regex(${JSON.stringify(p.pattern)})`)
          if (p.format === 'email') calls.push('.email()')
          else if (p.format === 'uri' || p.format === 'url') calls.push('.url()')
          else if (p.format === 'date-time') calls.push('.datetime()')
          else if (p.format === 'date') calls.push('.date()')
          else if (p.format === 'time') calls.push('.time()')
          else if (p.format === 'uuid') calls.push('.uuid()')
          break

        case 'number':
        case 'integer':
          calls.push('z.number()')
          if (p.minimum !== undefined) calls.push(`.min(${p.minimum})`)
          if (p.maximum !== undefined) calls.push(`.max(${p.maximum})`)
          break

        case 'boolean':
          calls.push('z.boolean()')
          break

        case 'array':
          calls.push('z.array(z.any())')
          break

        case 'object':
          calls.push('z.record(z.any())')
          break

        default:
          calls.push('z.any()')
      }
    }
    return calls
  }

  let zodDef: string

  // 检查是否为可空类型 (e.g., anyOf: [ { type: 'string', ... }, { type: 'null' } ])
  const isNullable = prop.anyOf?.some((p) => p.type === 'null') ?? false
  // 查找 non-null 的 schema 定义，同时考虑顶层 prop 的属性
  const nonNullSchema = isNullable
    ? { ...prop, ...prop.anyOf?.find((p) => p.type !== 'null') }
    : null
  if (nonNullSchema) {
    delete nonNullSchema.anyOf
  }


  if (nonNullSchema) {
    // 从 non-null 部分生成核心 Zod 链
    const coreZod = generateCoreZod(nonNullSchema).join('')
    // 包装成 union
    zodDef = `z.union([${coreZod}, z.null()])`
  } else if (prop.anyOf) {
    // 处理其他非标准的 anyOf (如果存在)
    const types = prop.anyOf.map((p) => generateCoreZod(p).join('')).join(', ')
    zodDef = `z.union([${types}])`
  } else {
    // 标准的非 anyOf 属性
    zodDef = generateCoreZod(prop).join('')
  }

  const finalZodCalls = [zodDef]

  // 可选处理
  if (!isRequired) {
    finalZodCalls.push('.optional()')
  }

  // 默认值
  if (prop.default !== undefined) {
    const defaultValue = typeof prop.default === 'string'
      ? JSON.stringify(prop.default)
      : String(prop.default)
    finalZodCalls.push(`.default(${defaultValue})`)
  }

  return finalZodCalls.join('')
}

/**
 * 生成 Zod schema 代码
 */
function generateZodSchema(
  schemaName: string,
  schema: OpenAPISchema
): string | null {
  // 跳过非请求 schema
  if (
    schemaName.endsWith('Response') ||
    schemaName.startsWith('HTTPValidation') ||
    schemaName.startsWith('Body_') ||
    schemaName.startsWith('ResponseSchema')
  ) {
    return null
  }

  const requiredFields = new Set(schema.required || [])
  const properties = schema.properties || {}

  if (Object.keys(properties).length === 0) {
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

  // 生成 schema
  lines.push(`export const ${schemaName}Schema = z.object({`)

  for (const [fieldName, prop] of Object.entries(properties)) {
    const zodDef = propertyToZod(fieldName, prop, requiredFields.has(fieldName))

    // 添加字段注释
    const comment = prop.title || prop.description
    if (comment) {
      lines.push(`  /** ${comment} */`)
    }

    lines.push(`  ${fieldName}: ${zodDef},`)
  }

  lines.push('})')

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
  lines.push(' *')
  lines.push(` * 生成时间: ${new Date().toISOString()}`)
  lines.push(' */')
  lines.push('')
  lines.push("import { z } from 'zod'")
  lines.push('')

  // 为每个 schema 生成 Zod 定义
  const schemaNames = Object.keys(schemas).sort()

  for (const schemaName of schemaNames) {
    const schemaCode = generateZodSchema(schemaName, schemas[schemaName])
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
function generateExtensionFile(): void {
  const extensionPath = join(__dirname, '../src/types/zod-extensions.ts')

  if (existsSync(extensionPath)) {
    return
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
}

// ==================== 主函数 ====================

async function main(): Promise<void> {
  console.log('🚀 开始生成 Zod schemas...\n')

  try {
    // 1. 获取 OpenAPI schema
    const { schemas, openApiData } = await fetchOpenAPISchema()

    // 2. 生成 Zod schemas 文件
    console.log('\n📝 生成 Zod schemas...')
    const content = generateZodSchemasFile(schemas)

    // 3. 确保输出目录存在
    if (!existsSync(OUTPUT_DIR)) {
      mkdirSync(OUTPUT_DIR, { recursive: true })
    }

    // 4. 写入文件
    writeFileSync(OUTPUT_FILE, content, 'utf-8')
    console.log(`✅ 生成文件: ${OUTPUT_FILE}`)

    // 5. 生成扩展文件
    generateExtensionFile()

    // 6. 写入同步记录
    writeSyncRecord(openApiData)

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
