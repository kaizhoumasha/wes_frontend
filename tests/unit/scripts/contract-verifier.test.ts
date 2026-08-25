import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { buildOpenApiMarker, serializeOpenApiDocument } from '../../../scripts/lib/openapi-sync'
import { computeSha256 } from '../../../scripts/lib/sha256'
import { verifyContract } from '../../../scripts/verify-contract-sync'
import { verifyPermissions } from '../../../scripts/verify-permissions-sync'

const BACKEND_COMMIT = 'de034e721befae2e1658d0aff96f2f2e43a0ffbb'

describe('contract verifier torn-state rejection', () => {
  let root: string
  let serialized: string
  let snapshotSha256: string

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'contract-verifier-'))
    serialized = serializeOpenApiDocument({
      openapi: '3.1.0',
      info: { title: 'WES', version: '1.0.0' },
      paths: {}
    })
    snapshotSha256 = computeSha256(serialized)
    mkdirSync(join(root, 'contracts'))
    mkdirSync(join(root, 'src/api/generated'), { recursive: true })
    mkdirSync(join(root, 'src/types/generated'), { recursive: true })
    writeFileSync(join(root, 'contracts/openapi.current.json'), serialized)
  })

  afterEach(() => {
    rmSync(root, { force: true, recursive: true })
  })

  function writeRecord(openApiSha256: string): void {
    writeFileSync(
      join(root, '.contract-sync-record.json'),
      `${JSON.stringify({
        backendCommit: BACKEND_COMMIT,
        openApiSha256,
        snapshotPath: 'contracts/openapi.current.json'
      })}\n`
    )
  }

  function writeGeneratedMarkers(openApiSha256: string): void {
    const content = `${buildOpenApiMarker(openApiSha256)}\n`
    writeFileSync(join(root, 'src/api/generated/openapi-types.ts'), content)
    writeFileSync(join(root, 'src/types/generated/zod-schemas.ts'), content)
  }

  it('rejects a snapshot published without its matching record', () => {
    writeRecord('0'.repeat(64))
    writeGeneratedMarkers(snapshotSha256)

    expect(() => verifyContract(root)).toThrow(/快照 SHA-256 不匹配/)
  })

  it('rejects a record published before matching derived artifacts', () => {
    writeRecord(snapshotSha256)
    writeGeneratedMarkers('0'.repeat(64))

    expect(() => verifyContract(root)).toThrow(/生成入口 OpenAPI SHA-256 不匹配/)
  })

  it('rejects a permission snapshot whose raw-byte hash differs from its provenance record', () => {
    const permissionSnapshot =
      '{"kind":"wes.release.provided-permissions.v1","permissions":[{"action":"list","category":"biz","description":"设备列表","method":"GET","name":"biz:device:list","path":"/api/v1/devices","resource":"device","type":"user_api"}]}\n'
    mkdirSync(join(root, 'src/api/generated/permissions'), { recursive: true })
    writeFileSync(join(root, 'src/api/generated/permissions/index.ts'), '')
    writeFileSync(join(root, 'contracts/permissions.current.json'), permissionSnapshot)
    writeRecord(snapshotSha256)
    writeFileSync(
      join(root, '.permission-sync-record.json'),
      `${JSON.stringify({
        backendCommit: BACKEND_COMMIT,
        permissionsSha256: '0'.repeat(64),
        permissionCount: 1
      })}\n`
    )

    expect(() => verifyPermissions({ frontendRoot: root, silent: true })).toThrow(
      /权限 SHA-256 不匹配/
    )
  })
})
