#!/usr/bin/env tsx

import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readContractSyncRecord } from './lib/openapi-sync'
import {
  FRONTEND_ROOT,
  GENERATE_PERMISSIONS_COMMAND,
  assertGeneratedPermissionFiles,
  assertPermissionRecordBackendCommit,
  readCanonicalPermissionSnapshot,
  readPermissionSyncRecord
} from './lib/permissions-codegen'

interface CliOptions {
  silent: boolean
  frontendRoot?: string
}

export function parseVerifyPermissionsArgs(argv: string[]): CliOptions {
  let silent = false

  for (const argument of argv) {
    if (argument === '--') {
      continue
    }
    if (argument === '--silent') {
      silent = true
      continue
    }
    throw new Error(`不支持的参数: ${argument}`)
  }

  return { silent }
}

export function verifyPermissions(options: CliOptions): void {
  const frontendRoot = resolve(options.frontendRoot ?? FRONTEND_ROOT)
  const permissionsIndexFile = resolve(frontendRoot, 'src/api/generated/permissions/index.ts')
  const permissionsOutputDirectory = resolve(frontendRoot, 'src/api/generated/permissions')
  if (!existsSync(permissionsIndexFile)) {
    throw new Error(`未找到生成的权限入口文件，请先运行 ${GENERATE_PERMISSIONS_COMMAND}`)
  }

  const contractRecord = readContractSyncRecord(resolve(frontendRoot, '.contract-sync-record.json'))
  const permissionRecord = assertPermissionRecordBackendCommit(
    readPermissionSyncRecord(resolve(frontendRoot, '.permission-sync-record.json')),
    contractRecord.backendCommit
  )
  const snapshot = readCanonicalPermissionSnapshot(frontendRoot)
  const permissions = snapshot.permissions

  if (permissions.length !== permissionRecord.permissionCount) {
    throw new Error(
      `权限数量不匹配：记录 ${permissionRecord.permissionCount}，当前 ${permissions.length}`
    )
  }
  if (snapshot.sha256 !== permissionRecord.permissionsSha256) {
    throw new Error('权限 SHA-256 不匹配，必须先运行显式 contract:freeze')
  }
  assertGeneratedPermissionFiles(permissions, permissionsOutputDirectory)
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
