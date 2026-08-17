import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { assertPermissionRecordMatchesContract } from '../../../scripts/contract-test'
import type { ContractSyncRecord } from '../../../scripts/lib/openapi-sync'

const BACKEND_COMMIT = 'de034e721befae2e1658d0aff96f2f2e43a0ffbb'
const contractRecord: ContractSyncRecord = {
  backendCommit: BACKEND_COMMIT,
  openApiSha256: 'a'.repeat(64),
  snapshotPath: 'contracts/openapi.current.json'
}

describe('contract permission record binding', () => {
  let root: string
  let permissionRecordPath: string

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'contract-permission-record-'))
    permissionRecordPath = join(root, '.permission-sync-record.json')
  })

  afterEach(() => {
    rmSync(root, { force: true, recursive: true })
  })

  it('accepts only an exact permission record bound to the contract commit', () => {
    const permissionRecord = {
      backendCommit: BACKEND_COMMIT,
      permissionsSha256: 'b'.repeat(64),
      permissionCount: 1
    }
    writeFileSync(permissionRecordPath, JSON.stringify(permissionRecord))

    expect(assertPermissionRecordMatchesContract(contractRecord, permissionRecordPath)).toEqual(
      permissionRecord
    )
  })

  it('rejects a permission record bound to another backend commit', () => {
    writeFileSync(
      permissionRecordPath,
      JSON.stringify({
        backendCommit: '0'.repeat(40),
        permissionsSha256: 'b'.repeat(64),
        permissionCount: 1
      })
    )

    expect(() =>
      assertPermissionRecordMatchesContract(contractRecord, permissionRecordPath)
    ).toThrow(/commit 不匹配/)
  })

  it('rejects permission records with compatibility fields', () => {
    writeFileSync(
      permissionRecordPath,
      JSON.stringify({
        backendCommit: BACKEND_COMMIT,
        permissionsSha256: 'b'.repeat(64),
        permissionCount: 1,
        lastSyncTime: '2026-08-18T00:00:00.000Z'
      })
    )

    expect(() =>
      assertPermissionRecordMatchesContract(contractRecord, permissionRecordPath)
    ).toThrow(/缺失或格式无效/)
  })
})
