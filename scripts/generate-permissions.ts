#!/usr/bin/env tsx
/**
 * 权限常量生成脚本
 *
 * 基于后端 FastAPI 路由的真实权限依赖，按权限节点生成独立文件。
 *
 * 使用方式：
 *   pnpm permission:generate
 *   pnpm exec tsx scripts/generate-permissions.ts --backend-root ../wes_backend
 */

import {
  DEFAULT_BACKEND_ROOT,
  FRONTEND_ROOT,
  PERMISSIONS_INDEX_FILE,
  PERMISSIONS_OUTPUT_DIR,
  buildPermissionFileContent,
  buildPermissionsIndexContent,
  computePermissionsHash,
  groupPermissions,
  listGeneratedPermissionFiles,
  readPermissionSyncRecord,
  removeStalePermissionFiles,
  scanBackendPermissions,
  writePermissionGroupFile,
  writePermissionSyncRecord,
  writePermissionsIndex
} from './lib/permissions-codegen'
import { resolve as resolvePath } from 'node:path'
import { resolve } from 'node:path'

interface CliOptions {
  backendRoot: string
}

function parseArgs(argv: string[]): CliOptions {
  let backendRoot = DEFAULT_BACKEND_ROOT

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

    throw new Error(`不支持的参数: ${arg}`)
  }

  return { backendRoot }
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2))

  console.log('🚀 权限常量生成工具\n')
  console.log(`📦 后端目录: ${options.backendRoot}`)

  const permissions = scanBackendPermissions(options.backendRoot)
  console.log(`🔍 已扫描后端权限 ${permissions.length} 条`)
  const permissionsHash = computePermissionsHash(permissions)

  const groups = groupPermissions(permissions)
  console.log(`🧩 已生成权限分组 ${groups.length} 组`)

  const expectedGroupFiles = groups.map(group => resolvePath(PERMISSIONS_OUTPUT_DIR, group.relativeFilePath))
  const expectedFiles = [...expectedGroupFiles, PERMISSIONS_INDEX_FILE].sort()
  const currentFiles = listGeneratedPermissionFiles()
  const hasFileSetChange =
    currentFiles.length !== expectedFiles.length ||
    currentFiles.some((filePath, index) => filePath !== expectedFiles[index])

  const record = readPermissionSyncRecord()
  const recordUnchanged =
    record?.permissionsHash === permissionsHash &&
    record.backendRoot === options.backendRoot &&
    record.permissionCount === permissions.length

  let hasContentChange = hasFileSetChange
  for (const group of groups) {
    const content = buildPermissionFileContent(group, options.backendRoot)
    hasContentChange = writePermissionGroupFile(group, content) || hasContentChange
  }

  const indexContent = buildPermissionsIndexContent(groups, options.backendRoot)
  hasContentChange = writePermissionsIndex(indexContent) || hasContentChange

  const staleFiles = removeStalePermissionFiles(expectedFiles)
  hasContentChange = staleFiles.length > 0 || hasContentChange

  if (!hasContentChange && recordUnchanged) {
    console.log('\n✅ 权限常量无变化，未更新生成文件')
    return
  }

  writePermissionSyncRecord({
    lastSyncTime: new Date().toISOString(),
    permissionsHash,
    backendRoot: options.backendRoot,
    permissionCount: permissions.length
  })

  console.log('\n✅ 权限常量生成完成')
}

main().catch(error => {
  console.error('\n❌ 权限常量生成失败:', error)
  process.exit(1)
})
