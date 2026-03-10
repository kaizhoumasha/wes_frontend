#!/usr/bin/env tsx
/**
 * 前后端契约同步验证脚本
 *
 * 用于 pre-commit hook 中，确保 Zod schemas 与后端 OpenAPI 保持同步
 *
 * 检查逻辑：
 * 1. 检查后端是否运行（可选，通过 --require-backend 参数控制）
 * 2. 获取当前 OpenAPI schema 的哈希值
 * 3. 与上次同步记录的哈希值对比
 * 4. 如果不一致，提示运行 pnpm zod:generate
 */

import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = join(__filename, '..')

// ==================== 配置 ====================

const BACKEND_OPENAPI_URL = process.env.BACKEND_OPENAPI_URL || 'http://localhost:8001/api/openapi.json'
const SYNC_RECORD_FILE = join(__dirname, '../.contract-sync-record.json')
const GENERATED_SCHEMA_FILE = join(__dirname, '../src/types/generated/zod-schemas.ts')

// ==================== 类型定义 ====================

interface SyncRecord {
  lastSyncTime: string
  openApiHash: string
  backendUrl: string
}

// ==================== 工具函数 ====================

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
 * 获取 OpenAPI schema 的哈希值（仅包含 schemas 部分）
 */
async function getOpenApiHash(): Promise<string> {
  try {
    const response = await fetch(BACKEND_OPENAPI_URL)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const openapi = await response.json()
    const schemas = JSON.stringify(openapi.components?.schemas || {})
    return simpleHash(schemas)
  } catch (error) {
    if ((error as Error).message.includes('fetch failed') || (error as Error).message.includes('ECONNREFUSED')) {
      console.warn('⚠️  后端服务未运行，跳过契约同步检查')
      console.log('   提示：如需启用检查，请确保后端运行在', BACKEND_OPENAPI_URL)
      return 'backend-not-running'
    }
    throw error
  }
}

/**
 * 读取同步记录
 */
function readSyncRecord(): SyncRecord | null {
  if (!existsSync(SYNC_RECORD_FILE)) {
    return null
  }
  try {
    const content = readFileSync(SYNC_RECORD_FILE, 'utf-8')
    return JSON.parse(content) as SyncRecord
  } catch {
    return null
  }
}

/**
 * 从生成的文件中提取同步时间
 */
function getGeneratedFileTimestamp(): string | null {
  if (!existsSync(GENERATED_SCHEMA_FILE)) {
    return null
  }
  const content = readFileSync(GENERATED_SCHEMA_FILE, 'utf-8')
  const match = content.match(/生成时间: ([^\n]+)/)
  return match ? match[1] : null
}

// ==================== 主函数 ====================

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const requireBackend = args.includes('--require-backend')
  const silent = args.includes('--silent')

  console.log('🔍 检查前后端契约同步状态...\n')

  // 1. 检查生成文件是否存在
  const timestamp = getGeneratedFileTimestamp()
  if (!timestamp) {
    console.log('⚠️  未找到生成的 Zod schemas 文件')
    console.log('   请先运行: pnpm zod:generate\n')
    process.exit(1) // 失败：需要生成
  }

  if (!silent) {
    console.log(`📅 上次生成: ${timestamp}`)
  }

  // 2. 如果后端未运行且不强制要求，跳过检查
  const currentHash = await getOpenApiHash()
  if (currentHash === 'backend-not-running') {
    if (!requireBackend) {
      console.log('✅ 后端未运行，跳过契约同步检查\n')
      process.exit(0) // 通过：跳过检查
    }
    console.log('❌ 后端服务未运行')
    console.log(`   请确保后端运行在: ${BACKEND_OPENAPI_URL}\n`)
    process.exit(1) // 失败：后端未运行
  }

  // 3. 读取同步记录
  const record = readSyncRecord()
  if (!record) {
    console.log('⚠️  未找到同步记录')
    console.log('   这是首次检查，请先运行: pnpm zod:generate\n')
    process.exit(1) // 失败：首次运行
  }

  // 4. 对比哈希值
  if (currentHash !== record.openApiHash) {
    console.log('❌ 契约已漂移！后端 OpenAPI 与前端 Zod schemas 不同步')
    console.log('')
    console.log('   请运行以下命令同步:')
    console.log('   pnpm zod:generate')
    console.log('')
    console.log('   详细文档: docs/CONTRACT_SYNC_WORKFLOW.md\n')
    process.exit(1) // 失败：需要同步
  }

  // 5. 检查通过
  if (!silent) {
    console.log('✅ 契约同步检查通过\n')
  }
  process.exit(0) // 通过
}

// ==================== 执行 ====================

main().catch(error => {
  console.error('❌ 检查失败:', error)
  process.exit(1)
})
