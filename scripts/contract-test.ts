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

interface ContractIssue {
  endpoint: string
  method: string
  issues: FieldIssue[]
}

const API_MODULES_DIR = join(__dirname, '../src/api/modules')
const TYPES_DIR = join(__dirname, '../src/api/types')

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

  const typesIndexPath = join(TYPES_DIR, 'index.ts')
  if (!existsSync(typesIndexPath)) {
    return issues
  }

  const typesIndexContent = readFileSync(typesIndexPath, 'utf-8')

  // 检查 './models/auth' 的导出
  const authModelsPath = join(TYPES_DIR, 'models/auth.ts')
  const authTypes = extractExportedTypes(authModelsPath)

  const authReExportRegex = /export\s+type\s*\{([^}]+)\}\s+from\s+['"]\.\/models\/auth['"]/
  const authReExportMatch = typesIndexContent.match(authReExportRegex)
  
  if (authReExportMatch) {
    const reExportedFromAuth = authReExportMatch[1]
      .split(',')
      .map(t => t.trim())
      .filter(t => t && !t.startsWith('//'))

    for (const exportedType of reExportedFromAuth) {
      const cleanType = exportedType.split(' as ')[0].trim()
      
      if (!authTypes.includes(cleanType)) {
        issues.push({
          field: `models/auth.${cleanType}`,
          type: 'export_error',
          severity: 'error',
          expected: `类型 ${cleanType} 在 models/auth.ts 中不存在或未导出`,
        })
      }
    }
  }

  // 检查 src/api/modules/index.ts 的导出
  const modulesIndexPath = join(API_MODULES_DIR, 'index.ts')
  if (!existsSync(modulesIndexPath)) {
    return issues
  }

  const modulesIndexContent = readFileSync(modulesIndexPath, 'utf-8')

  const userModulePath = join(API_MODULES_DIR, 'user.ts')
  const userTypes = extractExportedTypes(userModulePath)

  const userReExportRegex = /export\s+type\s*\{([^}]+)\}\s+from\s+['"]\.\/user['"]/
  const userReExportMatch = modulesIndexContent.match(userReExportRegex)
  
  if (userReExportMatch) {
    const reExportedFromUser = userReExportMatch[1]
      .split(',')
      .map(t => t.trim())
      .filter(t => t && !t.startsWith('//'))

    for (const exportedType of reExportedFromUser) {
      const cleanType = exportedType.split(' as ')[0].trim()
      
      if (!userTypes.includes(cleanType)) {
        issues.push({
          field: `modules/user.${cleanType}`,
          type: 'export_error',
          severity: 'error',
          expected: `类型 ${cleanType} 在 modules/user.ts 中不存在或未导出`,
        })
      }
    }
  }

  return issues
}

function checkUserContract(): FieldIssue[] {
  const issues: FieldIssue[] = []

  const authTypesPath = join(TYPES_DIR, 'models/auth.ts')
  if (!existsSync(authTypesPath)) {
    issues.push({
      field: 'UserResponse',
      type: 'missing',
      severity: 'error',
      expected: 'src/api/types/models/auth.ts 应导出 UserResponse',
    })
    return issues
  }

  const authTypesContent = readFileSync(authTypesPath, 'utf-8')
  const requiredFields = ['id', 'username', 'is_multi_login', 'roles']

  for (const field of requiredFields) {
    if (!authTypesContent.includes(field)) {
      issues.push({
        field,
        type: 'missing',
        severity: 'error',
        expected: `UserResponse 应包含 ${field} 字段`,
      })
    }
  }

  return issues
}

function checkDeviceContract(): FieldIssue[] {
  const issues: FieldIssue[] = []

  const deviceModulePath = join(API_MODULES_DIR, 'device.ts')
  if (!existsSync(deviceModulePath)) {
    issues.push({
      field: 'Device',
      type: 'missing',
      severity: 'error',
      expected: 'src/api/modules/device.ts 应定义 Device 类型',
    })
    return issues
  }

  const deviceContent = readFileSync(deviceModulePath, 'utf-8')
  const requiredFields = ['device_code', 'device_name', 'device_status', 'device_type', 'host', 'port']

  for (const field of requiredFields) {
    if (!deviceContent.includes(field)) {
      issues.push({
        field,
        type: 'missing',
        severity: 'error',
        expected: `Device 应包含 ${field} 字段`,
      })
    }
  }

  return issues
}

function checkAuthResponseContract(): FieldIssue[] {
  const issues: FieldIssue[] = []

  const authTypesPath = join(TYPES_DIR, 'models/auth.ts')
  if (!existsSync(authTypesPath)) {
    return issues
  }

  const authTypesContent = readFileSync(authTypesPath, 'utf-8')
  const oauthFields = ['expires_in', 'refresh_expires_in']

  for (const field of oauthFields) {
    if (!authTypesContent.includes(field)) {
      issues.push({
        field: `LoginResponse.${field}`,
        type: 'missing',
        severity: 'error',
        expected: `LoginResponse 应包含 OAuth 2.0 标准字段 ${field}`,
      })
    }
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

  console.log('📋 检查 API 配置契约...')
  const configIssues = checkApiPathContract()
  if (configIssues.length > 0) {
    allIssues.push({ endpoint: 'Client', method: 'Config', issues: configIssues })
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
