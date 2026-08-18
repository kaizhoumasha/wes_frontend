#!/usr/bin/env tsx

import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, unlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { assertBackendCheckout } from './lib/backend-checkout'
import { writeFileAtomically } from './lib/atomic-file'
import {
  CANONICAL_OPENAPI_SNAPSHOT_PATH,
  type ContractSyncRecord,
  serializeOpenApiDocument
} from './lib/openapi-sync'
import { computeSha256 } from './lib/sha256'

const SCRIPT_PATH = fileURLToPath(import.meta.url)
const FRONTEND_ROOT = resolve(dirname(SCRIPT_PATH), '..')
const PYTHON_EXTRACTOR = `
import json
import sys
from pathlib import Path

from main import app

Path(sys.argv[1]).write_text(
    json.dumps(app.openapi(), ensure_ascii=False),
    encoding="utf-8",
)
`

export interface FreezeBackendContractOptions {
  backendRoot: string
  frontendRoot?: string
  temporaryDirectoryRoot?: string
}

export function parseFreezeBackendContractArgs(argv: string[]): { backendRoot: string } {
  let backendRoot: string | undefined

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
      backendRoot = resolve(value)
      index += 1
      continue
    }
    throw new Error(`不支持的参数: ${argument}`)
  }

  if (!backendRoot) {
    throw new Error('必须提供 `--backend-root`')
  }
  return { backendRoot }
}

function restoreFile(path: string, previous: string | null): void {
  if (previous === null) {
    if (existsSync(path)) {
      unlinkSync(path)
    }
    return
  }
  writeFileAtomically(path, previous)
}

export function freezeBackendContract(options: FreezeBackendContractOptions): ContractSyncRecord {
  const frontendRoot = resolve(options.frontendRoot ?? FRONTEND_ROOT)
  const temporaryDirectoryRoot = resolve(options.temporaryDirectoryRoot ?? tmpdir())
  const backendRoot = resolve(options.backendRoot)
  const backendCommit = assertBackendCheckout(backendRoot)
  const extractionDirectory = mkdtempSync(join(temporaryDirectoryRoot, 'wes-openapi-'))
  const extractedPath = join(extractionDirectory, 'openapi.json')

  let serialized: string
  try {
    try {
      execFileSync('uv', ['run', 'python', '-c', PYTHON_EXTRACTOR, extractedPath], {
        cwd: backendRoot,
        env: process.env,
        stdio: ['ignore', 'pipe', 'pipe']
      })
    } catch (error) {
      const cause = error as NodeJS.ErrnoException & { stderr?: string | Buffer }
      const details =
        typeof cause.stderr === 'string'
          ? cause.stderr.trim()
          : cause.stderr?.toString('utf-8').trim()
      throw new Error(`OpenAPI Python 提取失败${details ? `: ${details}` : ''}`)
    }

    let document: unknown
    try {
      document = JSON.parse(readFileSync(extractedPath, 'utf-8'))
    } catch (error) {
      throw new Error(`提取结果不是有效 JSON: ${(error as Error).message}`)
    }
    serialized = serializeOpenApiDocument(document)
  } finally {
    rmSync(extractionDirectory, { force: true, recursive: true })
  }

  const backendCommitAfterExtraction = assertBackendCheckout(backendRoot)
  if (backendCommitAfterExtraction !== backendCommit) {
    throw new Error(
      `后端 HEAD 在 OpenAPI 提取期间发生变化：${backendCommit} -> ${backendCommitAfterExtraction}`
    )
  }

  const snapshotPath = resolve(frontendRoot, CANONICAL_OPENAPI_SNAPSHOT_PATH)
  const recordPath = resolve(frontendRoot, '.contract-sync-record.json')
  const record: ContractSyncRecord = {
    backendCommit,
    openApiSha256: computeSha256(serialized),
    snapshotPath: CANONICAL_OPENAPI_SNAPSHOT_PATH
  }
  const previousSnapshot = existsSync(snapshotPath) ? readFileSync(snapshotPath, 'utf-8') : null
  const previousRecord = existsSync(recordPath) ? readFileSync(recordPath, 'utf-8') : null

  mkdirSync(dirname(snapshotPath), { recursive: true })
  try {
    writeFileAtomically(snapshotPath, serialized)
    writeFileAtomically(recordPath, `${JSON.stringify(record, null, 2)}\n`)
  } catch (error) {
    restoreFile(snapshotPath, previousSnapshot)
    restoreFile(recordPath, previousRecord)
    throw error
  }

  return record
}

function isCliEntry(): boolean {
  const executedFile = process.argv[1]
  return !!executedFile && resolve(executedFile) === SCRIPT_PATH
}

if (isCliEntry()) {
  try {
    const options = parseFreezeBackendContractArgs(process.argv.slice(2))
    const record = freezeBackendContract(options)
    console.log(`✅ 已冻结后端契约: ${record.backendCommit}`)
  } catch (error) {
    console.error(`❌ 冻结后端契约失败: ${(error as Error).message}`)
    process.exit(1)
  }
}
