#!/usr/bin/env tsx

import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  renameSync,
  rmSync,
  writeFileSync
} from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readContractSyncRecord } from './lib/openapi-sync'
import {
  FRONTEND_ROOT,
  PERMISSIONS_OUTPUT_DIR,
  assertPermissionRecordBackendCommit,
  buildPermissionFileContent,
  buildPermissionsIndexContent,
  groupPermissions,
  readCanonicalPermissionSnapshot,
  readPermissionSyncRecord,
  type PermissionSyncRecord
} from './lib/permissions-codegen'

interface CliOptions {
  frontendRoot?: string
}

export interface PermissionPublicationPaths {
  outputDirectory: string
}

export function parseGeneratePermissionsArgs(argv: string[]): CliOptions {
  for (const argument of argv) {
    if (argument === '--') {
      continue
    }
    throw new Error(`不支持的参数: ${argument}`)
  }
  return {}
}

export function replaceGeneratedPermissions(
  stagedDirectory: string,
  paths: PermissionPublicationPaths = {
    outputDirectory: PERMISSIONS_OUTPUT_DIR
  }
): void {
  const { outputDirectory } = paths
  const backupDirectory = `${stagedDirectory}-backup`
  const hadGeneratedDirectory = existsSync(outputDirectory)
  let backupCreated = false
  let stagedInstalled = false

  try {
    if (hadGeneratedDirectory) {
      renameSync(outputDirectory, backupDirectory)
      backupCreated = true
    }
    renameSync(stagedDirectory, outputDirectory)
    stagedInstalled = true
    if (backupCreated) {
      rmSync(backupDirectory, { force: true, recursive: true })
      backupCreated = false
    }
  } catch (error) {
    if (stagedInstalled) {
      rmSync(outputDirectory, { force: true, recursive: true })
    }
    if (backupCreated) {
      renameSync(backupDirectory, outputDirectory)
    }
    throw error
  } finally {
    rmSync(stagedDirectory, { force: true, recursive: true })
  }
}

export function generatePermissions(options: CliOptions): PermissionSyncRecord {
  const frontendRoot = resolve(options.frontendRoot ?? FRONTEND_ROOT)
  const contractRecord = readContractSyncRecord(resolve(frontendRoot, '.contract-sync-record.json'))
  const snapshot = readCanonicalPermissionSnapshot(frontendRoot)
  const permissions = snapshot.permissions
  const permissionRecord = assertPermissionRecordBackendCommit(
    readPermissionSyncRecord(resolve(frontendRoot, '.permission-sync-record.json')),
    contractRecord.backendCommit
  )
  if (permissions.length !== permissionRecord.permissionCount) {
    throw new Error(
      `权限数量不匹配：记录 ${permissionRecord.permissionCount}，当前 ${permissions.length}`
    )
  }
  if (snapshot.sha256 !== permissionRecord.permissionsSha256) {
    throw new Error(`权限 SHA-256 不匹配，必须先运行显式 contract:freeze`)
  }
  const groups = groupPermissions(permissions)
  const outputDirectory = resolve(frontendRoot, 'src/api/generated/permissions')
  const generatedParent = dirname(outputDirectory)
  mkdirSync(generatedParent, { recursive: true })
  const stagedDirectory = mkdtempSync(resolve(generatedParent, '.permissions-'))
  try {
    for (const group of groups) {
      const outputPath = resolve(stagedDirectory, group.relativeFilePath)
      mkdirSync(dirname(outputPath), { recursive: true })
      writeFileSync(outputPath, buildPermissionFileContent(group), 'utf-8')
    }
    writeFileSync(
      resolve(stagedDirectory, 'index.ts'),
      buildPermissionsIndexContent(groups),
      'utf-8'
    )
    replaceGeneratedPermissions(stagedDirectory, { outputDirectory })
  } finally {
    rmSync(stagedDirectory, { force: true, recursive: true })
  }
  return permissionRecord
}

function isCliEntry(): boolean {
  const executedFile = process.argv[1]
  return !!executedFile && resolve(executedFile) === fileURLToPath(import.meta.url)
}

if (isCliEntry()) {
  try {
    const options = parseGeneratePermissionsArgs(process.argv.slice(2))
    const record = generatePermissions(options)
    console.log(`✅ 权限常量生成完成：${record.permissionCount} 条`)
  } catch (error) {
    console.error(`❌ 权限常量生成失败: ${(error as Error).message}`)
    process.exit(1)
  }
}
