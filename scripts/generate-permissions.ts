#!/usr/bin/env tsx

import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  unlinkSync,
  writeFileSync
} from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { assertBackendCheckout } from './lib/backend-checkout'
import { writeFileAtomically } from './lib/atomic-file'
import { readContractSyncRecord } from './lib/openapi-sync'
import {
  DEFAULT_BACKEND_ROOT,
  FRONTEND_ROOT,
  PERMISSIONS_OUTPUT_DIR,
  PERMISSION_SYNC_RECORD_FILE,
  buildPermissionFileContent,
  buildPermissionsIndexContent,
  computePermissionsHash,
  groupPermissions,
  scanBackendPermissions,
  type PermissionSyncRecord
} from './lib/permissions-codegen'

interface CliOptions {
  backendRoot: string
}

export interface PermissionPublicationPaths {
  outputDirectory: string
  recordPath: string
}

export function parseGeneratePermissionsArgs(argv: string[]): CliOptions {
  let backendRoot = DEFAULT_BACKEND_ROOT

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
    throw new Error(`不支持的参数: ${argument}`)
  }

  return { backendRoot }
}

export function replaceGeneratedPermissions(
  stagedDirectory: string,
  record: PermissionSyncRecord,
  paths: PermissionPublicationPaths = {
    outputDirectory: PERMISSIONS_OUTPUT_DIR,
    recordPath: PERMISSION_SYNC_RECORD_FILE
  }
): void {
  const { outputDirectory, recordPath } = paths
  const backupDirectory = `${stagedDirectory}-backup`
  const previousRecord = existsSync(recordPath) ? readFileSync(recordPath, 'utf-8') : null
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
    writeFileAtomically(recordPath, `${JSON.stringify(record, null, 2)}\n`)
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
    if (previousRecord === null) {
      if (existsSync(recordPath)) {
        unlinkSync(recordPath)
      }
    } else {
      writeFileAtomically(recordPath, previousRecord)
    }
    throw error
  } finally {
    rmSync(stagedDirectory, { force: true, recursive: true })
  }
}

export function generatePermissions(options: CliOptions): PermissionSyncRecord {
  const contractRecord = readContractSyncRecord(
    resolve(FRONTEND_ROOT, '.contract-sync-record.json')
  )
  const backendCommit = assertBackendCheckout(options.backendRoot, contractRecord.backendCommit)
  const permissions = scanBackendPermissions(options.backendRoot)
  const permissionsSha256 = computePermissionsHash(permissions)
  const groups = groupPermissions(permissions)

  const backendCommitAfterScan = assertBackendCheckout(options.backendRoot)
  if (backendCommitAfterScan !== backendCommit) {
    throw new Error(
      `后端 HEAD 在权限扫描期间发生变化：${backendCommit} -> ${backendCommitAfterScan}`
    )
  }

  const generatedParent = dirname(PERMISSIONS_OUTPUT_DIR)
  mkdirSync(generatedParent, { recursive: true })
  const stagedDirectory = mkdtempSync(resolve(generatedParent, '.permissions-'))
  const record: PermissionSyncRecord = {
    backendCommit,
    permissionsSha256,
    permissionCount: permissions.length
  }
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
    replaceGeneratedPermissions(stagedDirectory, record)
  } finally {
    rmSync(stagedDirectory, { force: true, recursive: true })
  }
  return record
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
