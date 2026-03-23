#!/usr/bin/env tsx
/**
 * 前后端契约测试
 */

import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

interface FieldIssue {
  field: string
  type: 'missing' | 'type_mismatch' | 'enum_mismatch' | 'optional_mismatch' | 'export_error'
  expected?: string
  actual?: string
  severity: 'error' | 'warning'
}

const API_MODULES_DIR = join(__dirname, '../src/api/modules')
const OPENAPI_TYPES_PATH = join(__dirname, '../src/api/generated/openapi-types.ts')

function readOpenApiTypes(): string | null {
  if (!existsSync(OPENAPI_TYPES_PATH)) {
    return null
  }

  return readFileSync(OPENAPI_TYPES_PATH, 'utf-8')
}

function extractNamedBlock(content: string, blockName: string): string | null {
  const marker = `${blockName}: {`
  const start = content.indexOf(marker)

  if (start === -1) {
    return null
  }

  let braceDepth = 0
  let blockStarted = false

  for (let index = start; index < content.length; index++) {
    const char = content[index]

    if (char === '{') {
      braceDepth += 1
      blockStarted = true
    } else if (char === '}') {
      braceDepth -= 1

      if (blockStarted && braceDepth === 0) {
        return content.slice(start, index + 1)
      }
    }
  }

  return null
}

function requireSchemaBlock(
  issues: FieldIssue[],
  openApiTypesContent: string | null,
  schemaName: string
): string | null {
  if (!openApiTypesContent) {
    issues.push({
      field: schemaName,
      type: 'missing',
      severity: 'error',
      expected: `src/api/generated/openapi-types.ts 应生成 ${schemaName} schema`,
    })
    return null
  }

  const schemaBlock = extractNamedBlock(openApiTypesContent, schemaName)

  if (!schemaBlock) {
    issues.push({
      field: schemaName,
      type: 'missing',
      severity: 'error',
      expected: `OpenAPI components.schemas 中应包含 ${schemaName}`,
    })
    return null
  }

  return schemaBlock
}

function extractExportedTypes(filePath: string): string[] {
  if (!existsSync(filePath)) {
    return []
  }

  const content = readFileSync(filePath, 'utf-8')
  const types: string[] = []

  const interfaceRegex = /export\s+(?:interface|type)\s+(\w+)/g
  let match
  while ((match = interfaceRegex.exec(content)) !== null) {
    types.push(match[1])
  }

  return types
}

function validateTypeExports(): FieldIssue[] {
  const issues: FieldIssue[] = []

  const authModulePath = join(API_MODULES_DIR, 'auth.ts')
  const userModulePath = join(API_MODULES_DIR, 'user.ts')
  const authTypes = extractExportedTypes(authModulePath)
  const userTypes = extractExportedTypes(userModulePath)

  for (const exportedType of ['ApiPermissionInfo', 'UserInfo']) {
    if (!authTypes.includes(exportedType)) {
      issues.push({
        field: `modules/auth.${exportedType}`,
        type: 'export_error',
        severity: 'error',
        expected: `类型 ${exportedType} 在 modules/auth.ts 中不存在或未导出`,
      })
    }
  }

  for (const exportedType of ['User', 'CreateUserInput', 'UpdateUserInput']) {
    if (!userTypes.includes(exportedType)) {
      issues.push({
        field: `modules/user.${exportedType}`,
        type: 'export_error',
        severity: 'error',
        expected: `类型 ${exportedType} 在 modules/user.ts 中不存在或未导出`,
      })
    }
  }

  return issues
}

function checkUserContract(): FieldIssue[] {
  const issues: FieldIssue[] = []
  const schemaBlock = requireSchemaBlock(issues, readOpenApiTypes(), 'UserResponse')

  if (!schemaBlock) {
    return issues
  }

  const requiredFields = ['id', 'username', 'is_multi_login', 'roles']

  for (const field of requiredFields) {
    if (!schemaBlock.includes(field)) {
      issues.push({
        field,
        type: 'missing',
        severity: 'error',
        expected: `OpenAPI UserResponse schema 应包含 ${field} 字段`,
      })
    }
  }

  return issues
}

function checkDeviceContract(): FieldIssue[] {
  const issues: FieldIssue[] = []
  const schemaBlock = requireSchemaBlock(issues, readOpenApiTypes(), 'DeviceResponse')

  if (!schemaBlock) {
    return issues
  }

  const requiredFields = ['device_code', 'device_name', 'device_status', 'device_type', 'host', 'port']

  for (const field of requiredFields) {
    if (!schemaBlock.includes(field)) {
      issues.push({
        field,
        type: 'missing',
        severity: 'error',
        expected: `OpenAPI DeviceResponse schema 应包含 ${field} 字段`,
      })
    }
  }

  return issues
}

function checkAuthResponseContract(): FieldIssue[] {
  const issues: FieldIssue[] = []
  const schemaBlock = requireSchemaBlock(issues, readOpenApiTypes(), 'LoginResponse')

  if (!schemaBlock) {
    return issues
  }

  const oauthFields = ['expires_in', 'refresh_expires_in']

  for (const field of oauthFields) {
    if (!schemaBlock.includes(field)) {
      issues.push({
        field: `LoginResponse.${field}`,
        type: 'missing',
        severity: 'error',
        expected: `OpenAPI 登录响应契约应包含 OAuth 2.0 标准字段 ${field}`,
      })
    }
  }

  return issues
}

function checkSessionContract(): FieldIssue[] {
  const issues: FieldIssue[] = []
  const schemaBlock = requireSchemaBlock(issues, readOpenApiTypes(), 'SessionInfo')

  if (!schemaBlock) {
    return issues
  }

  if (!schemaBlock.includes('last_active')) {
    issues.push({
      field: 'SessionInfo.last_active',
      type: 'missing',
      severity: 'error',
      expected: 'OpenAPI SessionInfo schema 应包含 last_active 字段',
    })
  }

  if (schemaBlock.includes('last_active_at')) {
    issues.push({
      field: 'SessionInfo.last_active_at',
      type: 'type_mismatch',
      severity: 'error',
      expected: 'OpenAPI SessionInfo schema 不应使用 last_active_at，请统一为 last_active',
    })
  }

  return issues
}

function checkApiPathContract(): FieldIssue[] {
  const issues: FieldIssue[] = []

  const clientPath = join(__dirname, '../src/api/client.ts')
  if (!existsSync(clientPath)) {
    return issues
  }

  const clientContent = readFileSync(clientPath, 'utf-8')

  if (!clientContent.includes('credentials')) {
    issues.push({
      field: 'credentials',
      type: 'missing',
      severity: 'error',
      expected: 'API 客户端应配置 credentials: "include" 以支持 Cookie',
    })
  }

  return issues
}

function checkSSEContract(): FieldIssue[] {
  const issues: FieldIssue[] = []

  const envPath = join(__dirname, '../src/config/env.ts')
  if (!existsSync(envPath)) {
    issues.push({
      field: 'env.sseUrl',
      type: 'missing',
      severity: 'error',
      expected: 'src/config/env.ts 应定义 SSE URL',
    })
    return issues
  }

  const envContent = readFileSync(envPath, 'utf-8')
  if (!envContent.includes('/api/v1/events/stream')) {
    issues.push({
      field: 'env.sseUrl',
      type: 'missing',
      severity: 'error',
      expected: 'SSE URL 必须指向 /api/v1/events/stream',
    })
  }
  if (envContent.includes('/sys/events/stream') || envContent.includes('/api/v1/sys/events/stream')) {
    issues.push({
      field: 'env.sseUrl',
      type: 'type_mismatch',
      severity: 'error',
      expected: 'SSE URL 不应使用 /sys/events/stream 或 /api/v1/sys/events/stream',
    })
  }

  const sseClientPath = join(__dirname, '../src/api/services/sse-client.ts')
  if (!existsSync(sseClientPath)) {
    issues.push({
      field: 'SSEEventType',
      type: 'missing',
      severity: 'error',
      expected: 'src/api/services/sse-client.ts 应定义 SSEEventType',
    })
    return issues
  }

  const sseClientContent = readFileSync(sseClientPath, 'utf-8')
  const requiredEventTypes = ['system_notification', 'business_status', 'message']
  for (const eventType of requiredEventTypes) {
    if (!sseClientContent.includes(`'${eventType}'`)) {
      issues.push({
        field: `SSEEventType.${eventType}`,
        type: 'missing',
        severity: 'error',
        expected: `SSEEventType 应包含 ${eventType}`,
      })
    }
  }

  if (sseClientContent.includes('task_update')) {
    issues.push({
      field: 'SSEEventType.task_update',
      type: 'enum_mismatch',
      severity: 'error',
      expected: 'SSE 事件类型不应包含 task_update（严格一致模式）',
    })
  }

  if (
    sseClientContent.includes('/sys/events/stream') ||
    sseClientContent.includes('/api/v1/sys/events/stream')
  ) {
    issues.push({
      field: 'sse-client endpoint',
      type: 'type_mismatch',
      severity: 'error',
      expected: 'SSE 客户端不应包含旧路径 /sys/events/stream 或 /api/v1/sys/events/stream',
    })
  }

  const customEventsRegex =
    /const\s+CUSTOM_EVENTS:\s*SSEEventType\[\]\s*=\s*\[\s*'system_notification'\s*,\s*'business_status'\s*\]/
  if (!customEventsRegex.test(sseClientContent)) {
    issues.push({
      field: 'CUSTOM_EVENTS',
      type: 'enum_mismatch',
      severity: 'error',
      expected: 'CUSTOM_EVENTS 必须严格为 [system_notification, business_status]',
    })
  }

  return issues
}

async function main(): Promise<void> {
  console.log('🔍 前后端契约测试\n')

  const allIssues: ContractIssue[] = []

  console.log('📋 检查类型导出完整性...')
  const exportIssues = validateTypeExports()
  if (exportIssues.length > 0) {
    allIssues.push({ endpoint: 'Type Exports', method: 'Validation', issues: exportIssues })
  }

  console.log('📋 检查 User DTO 契约...')
  const userIssues = checkUserContract()
  if (userIssues.length > 0) {
    allIssues.push({ endpoint: 'User', method: 'DTO', issues: userIssues })
  }

  console.log('📋 检查 Device DTO 契约...')
  const deviceIssues = checkDeviceContract()
  if (deviceIssues.length > 0) {
    allIssues.push({ endpoint: 'Device', method: 'DTO', issues: deviceIssues })
  }

  console.log('📋 检查认证响应契约...')
  const authIssues = checkAuthResponseContract()
  if (authIssues.length > 0) {
    allIssues.push({ endpoint: '/api/v1/auth/login', method: 'POST', issues: authIssues })
  }

  console.log('📋 检查会话响应契约...')
  const sessionIssues = checkSessionContract()
  if (sessionIssues.length > 0) {
    allIssues.push({ endpoint: '/api/v1/auth/sessions', method: 'GET', issues: sessionIssues })
  }

  console.log('📋 检查 API 配置契约...')
  const configIssues = checkApiPathContract()
  if (configIssues.length > 0) {
    allIssues.push({ endpoint: 'Client', method: 'Config', issues: configIssues })
  }

  console.log('📋 检查 SSE 契约...')
  const sseIssues = checkSSEContract()
  if (sseIssues.length > 0) {
    allIssues.push({ endpoint: '/api/v1/events/stream', method: 'GET', issues: sseIssues })
  }

  console.log('\n' + '='.repeat(60))

  if (allIssues.length === 0) {
    console.log('✅ 所有契约检查通过！')
    console.log('前后端类型定义一致')
  } else {
    console.log('❌ 发现契约不一致问题：\n')

    let errorCount = 0
    let warningCount = 0

    for (const issue of allIssues) {
      console.log(`\n📌 ${issue.endpoint} (${issue.method})`)

      for (const detail of issue.issues) {
        const icon = detail.severity === 'error' ? '❌' : '⚠️'
        console.log(`  ${icon} ${detail.field}: ${detail.expected || detail.type}`)

        if (detail.severity === 'error') {
          errorCount++
        } else {
          warningCount++
        }
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log(`总计: ${errorCount} 个错误, ${warningCount} 个警告\n`)

    if (errorCount > 0) {
      console.log('💡 修复建议:')
      console.log('   1. 检查并移除不存在的类型导出')
      console.log('   2. 检查后端 API 定义')
      console.log('   3. 更新前端 DTO 定义以匹配后端')
      console.log('   4. 确保字段名、类型、枚举值完全一致')
      console.log('   5. 运行 pnpm run type:check 验证类型正确性')

      process.exit(1)
    }
  }

  console.log()
}

main()
