#!/usr/bin/env tsx

import { resolve } from 'node:path'
import { exportReleaseConsumer } from './lib/release-consumer'

function readOutputDir(args: string[]): string | undefined {
  if (args.length === 0) return undefined
  if (args.length !== 2 || args[0] !== '--out-dir' || !args[1] || args[1].startsWith('--')) {
    throw new Error('用法: pnpm export:release-consumer [--out-dir <目录>]')
  }
  return resolve(args[1])
}

try {
  const result = exportReleaseConsumer({ outputDir: readOutputDir(process.argv.slice(2)) })
  console.log(
    `已导出 frontend consumer: ${result.requiredOperations.length} operations, ${result.requiredPermissions.length} permissions`
  )
} catch (error) {
  console.error(`导出 frontend consumer 失败: ${(error as Error).message}`)
  process.exitCode = 1
}
