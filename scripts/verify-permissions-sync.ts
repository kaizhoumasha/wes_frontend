#!/usr/bin/env tsx
/**
 * 权限生成同步验证脚本
 *
 * 用于 pre-commit hook 中，确保前端生成的权限常量与后端真实权限保持同步。
 *
 * 检查逻辑：
 * 1. 检查生成入口文件是否存在
 * 2. 检查同步记录是否存在
 * 3. 扫描后端最新权限并计算哈希
 * 4. 与上次生成记录对比，不一致则提示重新生成
 */

import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  DEFAULT_BACKEND_ROOT,
  FRONTEND_ROOT,
  PERMISSIONS_INDEX_FILE,
  computePermissionsHash,
  readPermissionSyncRecord,
  scanBackendPermissions
} from './lib/permissions-codegen'

interface CliOptions {
  backendRoot: string
  requireBackend: boolean
  silent: boolean
}

function parseArgs(argv: string[]): CliOptions {
  let backendRoot = DEFAULT_BACKEND_ROOT
  let requireBackend = false
  let silent = false

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]

    if (arg === '--backend-root') {
      const value = argv[index + 1]
      if (!value) {
        throw new Error('`--backend-root` 缺少目录参数')
      }
      backendRoot = resolve(FRONTEND_ROOT, value)
      index += 1
      continue
    }

    if (arg === '--silent') {
      silent = true
      continue
    }

    if (arg === '--require-backend') {
      requireBackend = true
      continue
    }

    throw new Error(`不支持的参数: ${arg}`)
  }

  return { backendRoot, requireBackend, silent }
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2))

  if (!options.silent) {
    console.log('🔍 检查权限常量同步状态...\n')
  }

  if (!existsSync(PERMISSIONS_INDEX_FILE)) {
    console.log('⚠️  未找到生成的权限入口文件')
    console.log('   请先运行: pnpm permission:generate\n')
    process.exit(1)
  }

  const record = readPermissionSyncRecord()
  if (!record) {
    console.log('⚠️  未找到权限同步记录')
    console.log('   请先运行: pnpm permission:generate\n')
    process.exit(1)
  }

  if (!options.silent) {
    console.log(`📅 上次生成: ${record.lastSyncTime}`)
    console.log(`📦 上次扫描权限数: ${record.permissionCount}`)
  }

  let permissions
  try {
    permissions = scanBackendPermissions(options.backendRoot)
  } catch (error) {
    if (options.requireBackend) {
      throw error
    }

    console.warn('⚠️  后端权限扫描失败，跳过权限同步检查')
    if (!options.silent) {
      console.warn(`   提示：如需强制检查，可运行: pnpm permission:verify -- --require-backend`)
    }
    process.exit(0)
  }

  const currentHash = computePermissionsHash(permissions)

  if (currentHash !== record.permissionsHash) {
    console.log('❌ 权限常量已过期！后端权限与前端生成文件不一致')
    console.log('')
    console.log('   请运行以下命令同步:')
    console.log('   pnpm permission:generate')
    console.log('')
    process.exit(1)
  }

  if (!options.silent) {
    console.log('✅ 权限同步检查通过\n')
  }
}

main().catch(error => {
  console.error('❌ 检查失败:', error)
  process.exit(1)
})
