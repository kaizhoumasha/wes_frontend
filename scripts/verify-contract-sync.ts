#!/usr/bin/env tsx

import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  CANONICAL_OPENAPI_SNAPSHOT_PATH,
  readCanonicalOpenApiSnapshot,
  readContractSyncRecord,
  readOpenApiMarker,
  serializeOpenApiDocument
} from './lib/openapi-sync'

const SCRIPT_PATH = fileURLToPath(import.meta.url)
const FRONTEND_ROOT = resolve(dirname(SCRIPT_PATH), '..')

interface CliOptions {
  silent: boolean
}

export function parseVerifyContractArgs(argv: string[]): CliOptions {
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

export function verifyContract(frontendRoot: string = FRONTEND_ROOT): void {
  const record = readContractSyncRecord(resolve(frontendRoot, '.contract-sync-record.json'))
  const snapshot = readCanonicalOpenApiSnapshot(frontendRoot)
  const canonicalSerialization = serializeOpenApiDocument(snapshot.document)
  if (snapshot.serialized !== canonicalSerialization) {
    throw new Error('OpenAPI 快照未使用 canonical JSON 序列化')
  }
  if (snapshot.sha256 !== record.openApiSha256) {
    throw new Error(
      `OpenAPI 快照 SHA-256 不匹配：记录 ${record.openApiSha256}，当前 ${snapshot.sha256}`
    )
  }
  if (record.snapshotPath !== CANONICAL_OPENAPI_SNAPSHOT_PATH) {
    throw new Error(`契约快照路径必须是 ${CANONICAL_OPENAPI_SNAPSHOT_PATH}`)
  }

  const generatedEntries = [
    resolve(frontendRoot, 'src/api/generated/openapi-types.ts'),
    resolve(frontendRoot, 'src/types/generated/zod-schemas.ts')
  ]
  for (const filePath of generatedEntries) {
    if (!existsSync(filePath)) {
      throw new Error(`生成入口不存在: ${filePath}`)
    }
    const generatedSha256 = readOpenApiMarker(readFileSync(filePath, 'utf-8'), filePath)
    if (generatedSha256 !== record.openApiSha256) {
      throw new Error(`生成入口 OpenAPI SHA-256 不匹配: ${filePath}（${generatedSha256}）`)
    }
  }
}

function isCliEntry(): boolean {
  const executedFile = process.argv[1]
  return !!executedFile && resolve(executedFile) === SCRIPT_PATH
}

if (isCliEntry()) {
  try {
    const options = parseVerifyContractArgs(process.argv.slice(2))
    verifyContract()
    if (!options.silent) {
      console.log('✅ 契约同步检查通过')
    }
  } catch (error) {
    console.error(`❌ 契约同步检查失败: ${(error as Error).message}`)
    process.exit(1)
  }
}
