#!/usr/bin/env tsx

import { execFileSync } from 'node:child_process'
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  unlinkSync,
  writeFileSync
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { assertBackendCheckout } from './lib/backend-checkout'
import { writeFileAtomically } from './lib/atomic-file'
import {
  CANONICAL_OPENAPI_SNAPSHOT_PATH,
  type ContractSyncRecord,
  parseProviderFingerprints,
  parseProviderOpenApiArtifact,
  serializeOpenApiDocument
} from './lib/openapi-sync'
import {
  CANONICAL_PERMISSIONS_SNAPSHOT_PATH,
  parseCanonicalPermissionSnapshot,
  type PermissionSyncRecord
} from './lib/permissions-codegen'
import { computeSha256 } from './lib/sha256'

const SCRIPT_PATH = fileURLToPath(import.meta.url)
const FRONTEND_ROOT = resolve(dirname(SCRIPT_PATH), '..')

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

function publishFreezeFiles(publications: Array<{ path: string; content: string }>): void {
  const previous = new Map(
    publications.map(({ path }) => [path, existsSync(path) ? readFileSync(path, 'utf-8') : null])
  )
  try {
    for (const publication of publications) {
      writeFileAtomically(publication.path, publication.content)
    }
  } catch (error) {
    for (const publication of [...publications].reverse()) {
      restoreFile(publication.path, previous.get(publication.path) ?? null)
    }
    throw error
  }
}

export function freezeBackendContract(options: FreezeBackendContractOptions): ContractSyncRecord {
  const frontendRoot = resolve(options.frontendRoot ?? FRONTEND_ROOT)
  const temporaryDirectoryRoot = resolve(options.temporaryDirectoryRoot ?? tmpdir())
  const backendRoot = resolve(options.backendRoot)
  const backendCommit = assertBackendCheckout(backendRoot)
  const extractionDirectory = mkdtempSync(join(temporaryDirectoryRoot, 'wes-provider-'))
  const providerDirectory = join(extractionDirectory, 'provider')

  let openApiSerialized: string
  let permissionsSerialized: string
  let permissionRecord: PermissionSyncRecord
  try {
    try {
      execFileSync(
        'uv',
        ['run', 'python', 'scripts/export_release_provider.py', '--out-dir', providerDirectory],
        {
          cwd: backendRoot,
          env: process.env,
          stdio: ['ignore', 'pipe', 'pipe']
        }
      )
    } catch (error) {
      const cause = error as NodeJS.ErrnoException & { stderr?: string | Buffer }
      const details =
        typeof cause.stderr === 'string'
          ? cause.stderr.trim()
          : cause.stderr?.toString('utf-8').trim()
      throw new Error(`后端 provider 导出失败${details ? `: ${details}` : ''}`)
    }

    const providerOpenApi = readFileSync(join(providerDirectory, 'provider-openapi.json'), 'utf-8')
    const document = parseProviderOpenApiArtifact(providerOpenApi)
    openApiSerialized = serializeOpenApiDocument(document)
    permissionsSerialized = readFileSync(
      join(providerDirectory, 'provided-permissions.json'),
      'utf-8'
    )
    const permissionSnapshot = parseCanonicalPermissionSnapshot(permissionsSerialized)
    const fingerprints = parseProviderFingerprints(
      readFileSync(join(providerDirectory, 'provider-fingerprints.json'), 'utf-8')
    )
    if (computeSha256(providerOpenApi) !== fingerprints.provider_openapi_sha256) {
      throw new Error('provider-openapi raw artifact SHA-256 与 provider fingerprints 不匹配')
    }
    if (permissionSnapshot.sha256 !== fingerprints.provided_permissions_sha256) {
      throw new Error('provided-permissions raw artifact SHA-256 与 provider fingerprints 不匹配')
    }

    const backendCommitAfterExtraction = assertBackendCheckout(backendRoot)
    if (backendCommitAfterExtraction !== backendCommit) {
      throw new Error(
        `后端 HEAD 在 provider 导出期间发生变化：${backendCommit} -> ${backendCommitAfterExtraction}`
      )
    }

    const record: ContractSyncRecord = {
      backendCommit,
      openApiSha256: computeSha256(openApiSerialized),
      snapshotPath: CANONICAL_OPENAPI_SNAPSHOT_PATH
    }
    permissionRecord = {
      backendCommit,
      permissionsSha256: permissionSnapshot.sha256,
      permissionCount: permissionSnapshot.permissions.length
    }
    const publications = [
      {
        path: resolve(frontendRoot, CANONICAL_OPENAPI_SNAPSHOT_PATH),
        content: openApiSerialized
      },
      {
        path: resolve(frontendRoot, CANONICAL_PERMISSIONS_SNAPSHOT_PATH),
        content: permissionsSerialized
      },
      {
        path: resolve(frontendRoot, '.contract-sync-record.json'),
        content: `${JSON.stringify(record, null, 2)}\n`
      },
      {
        path: resolve(frontendRoot, '.permission-sync-record.json'),
        content: `${JSON.stringify(permissionRecord, null, 2)}\n`
      }
    ]
    const stagingDirectory = join(extractionDirectory, 'frontend-publication')
    mkdirSync(stagingDirectory)
    for (const [index, publication] of publications.entries()) {
      const stagedPath = join(stagingDirectory, String(index))
      writeFileSync(stagedPath, publication.content, 'utf-8')
      if (readFileSync(stagedPath, 'utf-8') !== publication.content) {
        throw new Error(`冻结 staging 校验失败: ${publication.path}`)
      }
    }

    publishFreezeFiles(publications)
    return record
  } finally {
    rmSync(extractionDirectory, { force: true, recursive: true })
  }
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
