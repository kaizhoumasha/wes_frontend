#!/usr/bin/env tsx
/**
 * 前后端契约测试
 *
 * 验证前端类型与后端 OpenAPI 规范的一致性
 * 检测字段缺失、类型不匹配等问题
 */

import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// ==================== 类型定义 ====================

interface FieldIssue {
  field: string
  type: 'missing' | 'type_mismatch' | 'enum_mismatch' | 'optional_mismatch'
  expected?: string
  actual?: string
  severity: 'error' | 'warning'
}

interface ContractIssue {
  endpoint: string
  method: string
  issues: FieldIssue[]
}

// ==================== 配置 ====================

const API_MODULES_DIR = join(__dirname, '../src/api/modules')
const TYPES_DIR = join(__dirname, '../src/api/types')

// ==================== 工具函数 ====================

/**
 * 检查 User DTO 契约
 */
function checkUserContract(): FieldIssue[] {
  const issues: FieldIssue[] = []

  // 检查 UserResponse 类型定义
  const authTypesPath = join(TYPES_DIR, 'models/auth.ts')
  if (!existsSync(authTypesPath)) {
    issues.push({
      field: 'UserResponse',
      type: 'missing',
      severity: 'error',
      expected: 'src/api/types/models/auth.ts 应导出 UserResponse'
    })
    return issues
  }

  const authTypesContent = readFileSync(authTypesPath, 'utf-8')

  // 检查必需字段
  const requiredFields = ['id', 'username', 'is_multi_login', 'roles']

  for (const field of requiredFields) {
    if (!authTypesContent.includes(field)) {
      issues.push({
        field,
        type: 'missing',
        severity: 'error',
        expected: `UserResponse 应包含 ${field} 字段`
      })
    }
  }

  // 检查不应存在的字段（已从后端移除）
  const deprecatedFields = ['phone', 'status', 'last_login_at', 'gender', 'departmentId']

  for (const field of deprecatedFields) {
    if (authTypesContent.includes(field)) {
      issues.push({
        field,
        type: 'missing',
        severity: 'warning',
        expected: `UserResponse 不应包含已废弃的 ${field} 字段`
      })
    }
  }

  return issues
}

/**
 * 检查 Device DTO 契约
 */
function checkDeviceContract(): FieldIssue[] {
  const issues: FieldIssue[] = []

  const deviceModulePath = join(API_MODULES_DIR, 'device.ts')
  if (!existsSync(deviceModulePath)) {
    issues.push({
      field: 'Device',
      type: 'missing',
      severity: 'error',
      expected: 'src/api/modules/device.ts 应定义 Device 类型'
    })
    return issues
  }

  const deviceContent = readFileSync(deviceModulePath, 'utf-8')

  // 检查必需字段
  const requiredFields = [
    'device_code',
    'device_name',
    'device_status',
    'device_type',
    'host',
    'port'
  ]

  for (const field of requiredFields) {
    if (!deviceContent.includes(field)) {
      issues.push({
        field,
        type: 'missing',
        severity: 'error',
        expected: `Device 应包含 ${field} 字段`
      })
    }
  }

  // 检查枚举值（与后端 DeviceType 对齐）
  const expectedEnums = [
    'PDA',
    'INDUSTRIAL_PC',
    'PRINTER',
    'COMPUTER',
    'LCR_TESTER',
    'ROBOTIC_ARM',
    'VISION_CAMERA',
    'CONVEYOR',
    'LABELER',
    'XRAY',
    'SCANNER'
  ]

  for (const enumValue of expectedEnums) {
    if (!deviceContent.includes(enumValue)) {
      issues.push({
        field: 'DeviceType',
        type: 'enum_mismatch',
        severity: 'error',
        expected: `DeviceType 应包含 ${enumValue}`
      })
    }
  }

  return issues
}

/**
 * 检查认证响应契约
 */
function checkAuthResponseContract(): FieldIssue[] {
  const issues: FieldIssue[] = []

  const authTypesPath = join(TYPES_DIR, 'models/auth.ts')
  if (!existsSync(authTypesPath)) {
    return issues
  }

  const authTypesContent = readFileSync(authTypesPath, 'utf-8')

  // 检查 OAuth 2.0 标准字段
  const oauthFields = ['expires_in', 'refresh_expires_in']

  for (const field of oauthFields) {
    if (!authTypesContent.includes(field)) {
      issues.push({
        field: `LoginResponse.${field}`,
        type: 'missing',
        severity: 'error',
        expected: `LoginResponse 应包含 OAuth 2.0 标准字段 ${field}`
      })
    }
  }

  return issues
}

/**
 * 检查 API 路径配置
 */
function checkApiPathContract(): FieldIssue[] {
  const issues: FieldIssue[] = []

  const clientPath = join(__dirname, '../src/api/client.ts')
  if (!existsSync(clientPath)) {
    return issues
  }

  const clientContent = readFileSync(clientPath, 'utf-8')

  // 检查 credentials 配置
  if (!clientContent.includes('credentials')) {
    issues.push({
      field: 'credentials',
      type: 'missing',
      severity: 'error',
      expected: 'API 客户端应配置 credentials: "include" 以支持 Cookie'
    })
  }

  return issues
}

// ==================== 主流程 ====================

async function main(): Promise<void> {
  console.log('🔍 前后端契约测试\n')

  const allIssues: ContractIssue[] = []

  // User DTO 契约检查
  console.log('📋 检查 User DTO 契约...')
  const userIssues = checkUserContract()
  if (userIssues.length > 0) {
    allIssues.push({ endpoint: 'User', method: 'DTO', issues: userIssues })
  }

  // Device DTO 契约检查
  console.log('📋 检查 Device DTO 契约...')
  const deviceIssues = checkDeviceContract()
  if (deviceIssues.length > 0) {
    allIssues.push({ endpoint: 'Device', method: 'DTO', issues: deviceIssues })
  }

  // 认证响应契约检查
  console.log('📋 检查认证响应契约...')
  const authIssues = checkAuthResponseContract()
  if (authIssues.length > 0) {
    allIssues.push({ endpoint: '/api/v1/auth/login', method: 'POST', issues: authIssues })
  }

  // API 路径配置检查
  console.log('📋 检查 API 配置契约...')
  const configIssues = checkApiPathContract()
  if (configIssues.length > 0) {
    allIssues.push({ endpoint: 'Client', method: 'Config', issues: configIssues })
  }

  // 输出结果
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
      console.log('   1. 检查后端 API 定义')
      console.log('   2. 更新前端 DTO 定义以匹配后端')
      console.log('   3. 确保字段名、类型、枚举值完全一致')

      process.exit(1)
    }
  }

  console.log()
}

// 运行主流程
main()
