#!/usr/bin/env tsx

import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { assertBackendCheckout } from './lib/backend-checkout'
import { readContractSyncRecord } from './lib/openapi-sync'
import {
  DEFAULT_BACKEND_ROOT,
  FRONTEND_ROOT,
  PERMISSIONS_INDEX_FILE,
  assertPermissionRecordBackendCommit,
  computePermissionsHash,
  readPermissionSyncRecord,
  scanBackendPermissions
} from './lib/permissions-codegen'

interface CliOptions {
  backendRoot: string
  silent: boolean
}

export function parseVerifyPermissionsArgs(argv: string[]): CliOptions {
  let backendRoot = DEFAULT_BACKEND_ROOT
  let silent = false

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    if (argument === '--') {
      continue
    }
    if (argument === '--backend-root') {
      const value = argv[index + 1]
      if (!value || value.startsWith('--')) {
        throw new Error('`--backend-root` 缺少目录参数')
      }
      backendRoot = resolve(FRONTEND_ROOT, value)
      index += 1
      continue
    }
    if (argument === '--silent') {
      silent = true
      continue
    }
    throw new Error(`不支持的参数: ${argument}`)
  }

  return { backendRoot, silent }
}

export function verifyPermissions(options: CliOptions): void {
  if (!existsSync(PERMISSIONS_INDEX_FILE)) {
    throw new Error('未找到生成的权限入口文件，请先运行 pnpm generate:permissions')
  }

  const contractRecord = readContractSyncRecord(
    resolve(FRONTEND_ROOT, '.contract-sync-record.json')
  )
  const backendCommit = assertBackendCheckout(options.backendRoot, contractRecord.backendCommit)
  const permissionRecord = assertPermissionRecordBackendCommit(
    readPermissionSyncRecord(),
    backendCommit
  )
  const permissions = scanBackendPermissions(options.backendRoot)
  const backendCommitAfterScan = assertBackendCheckout(options.backendRoot)
  if (backendCommitAfterScan !== backendCommit) {
    throw new Error(
      `后端 HEAD 在权限扫描期间发生变化：${backendCommit} -> ${backendCommitAfterScan}`
    )
  }

  if (permissions.length !== permissionRecord.permissionCount) {
    throw new Error(
      `权限数量不匹配：记录 ${permissionRecord.permissionCount}，当前 ${permissions.length}`
    )
  }
  const permissionsSha256 = computePermissionsHash(permissions)
  if (permissionsSha256 !== permissionRecord.permissionsSha256) {
    throw new Error('权限 SHA-256 不匹配，请重新运行 pnpm generate:permissions')
  }
}

function isCliEntry(): boolean {
  const executedFile = process.argv[1]
  return !!executedFile && resolve(executedFile) === fileURLToPath(import.meta.url)
}

if (isCliEntry()) {
  try {
    const options = parseVerifyPermissionsArgs(process.argv.slice(2))
    verifyPermissions(options)
    if (!options.silent) {
      console.log('✅ 权限同步检查通过')
    }
  } catch (error) {
    console.error(`❌ 权限同步检查失败: ${(error as Error).message}`)
    process.exit(1)
  }
}
