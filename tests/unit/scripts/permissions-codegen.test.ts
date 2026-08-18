import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { parseGeneratePermissionsArgs } from '../../../scripts/generate-permissions'
import {
  assertPermissionRecordBackendCommit,
  assertGeneratedPermissionFiles,
  buildPermissionFileContent,
  buildPermissionsIndexContent,
  computePermissionsHash,
  groupPermissions,
  readPermissionSyncRecord
} from '../../../scripts/lib/permissions-codegen'
import { parseVerifyPermissionsArgs } from '../../../scripts/verify-permissions-sync'

const BACKEND_COMMIT = 'de034e721befae2e1658d0aff96f2f2e43a0ffbb'
const permissions = [
  {
    name: 'biz:device:list',
    type: 'user_api',
    category: 'biz',
    description: '设备列表',
    resource: 'device',
    action: 'list',
    method: 'GET',
    path: '/api/v1/devices'
  }
]

describe('permission code generation', () => {
  it('requires an explicit backend checkout for generation and verification', () => {
    expect(() => parseGeneratePermissionsArgs([])).toThrow(/必须提供 `--backend-root`/)
    expect(() => parseVerifyPermissionsArgs([])).toThrow(/必须提供 `--backend-root`/)

    expect(parseGeneratePermissionsArgs(['--', '--backend-root', '/tmp/wes_backend'])).toEqual({
      backendRoot: '/tmp/wes_backend'
    })
    expect(
      parseVerifyPermissionsArgs(['--backend-root', '/tmp/wes_backend', '--silent'])
    ).toEqual({ backendRoot: '/tmp/wes_backend', silent: true })
  })

  it('uses deterministic SHA-256 over normalized permission facts', () => {
    const hash = computePermissionsHash(permissions)

    expect(hash).toMatch(/^[a-f0-9]{64}$/)
    expect(computePermissionsHash([...permissions].reverse())).toBe(hash)
    expect(computePermissionsHash([{ ...permissions[0], path: '/api/v1/other' }])).not.toBe(hash)
    expect(
      computePermissionsHash([{ ...permissions[0], description: '设备列表（已更新）' }])
    ).not.toBe(hash)
  })

  it('generates portable content without backend paths or timestamps', () => {
    const [group] = groupPermissions(permissions)
    const groupContent = buildPermissionFileContent(group)
    const indexContent = buildPermissionsIndexContent([group])

    for (const content of [groupContent, indexContent]) {
      expect(content).not.toContain('/Users/')
      expect(content).not.toContain('backendRoot')
      expect(content).not.toMatch(/\d{4}-\d{2}-\d{2}T/)
      expect(content).toContain('scripts/generate-permissions.ts')
    }
    expect(groupContent).toContain(`权限分组: ${group.key}`)
    expect(groupContent).toContain(
      'pnpm generate:permissions -- --backend-root /path/to/wes_backend'
    )
  })

  it('rejects generated permission files that differ from the scanned permissions', () => {
    const outputDir = mkdtempSync(join(tmpdir(), 'generated-permissions-'))
    const [group] = groupPermissions(permissions)
    const groupPath = join(outputDir, group.relativeFilePath)

    try {
      mkdirSync(dirname(groupPath), { recursive: true })
      writeFileSync(groupPath, buildPermissionFileContent(group))
      writeFileSync(join(outputDir, 'index.ts'), buildPermissionsIndexContent([group]))

      expect(() => assertGeneratedPermissionFiles(permissions, outputDir)).not.toThrow()

      writeFileSync(groupPath, '// valid TypeScript, but not generated from the backend permissions\n')
      expect(() => assertGeneratedPermissionFiles(permissions, outputDir)).toThrow(
        /生成权限文件与后端权限不一致/
      )
    } finally {
      rmSync(outputDir, { force: true, recursive: true })
    }
  })

  it('accepts only the exact permission record and rejects legacy records', () => {
    const root = mkdtempSync(join(tmpdir(), 'permission-record-'))
    const recordPath = join(root, '.permission-sync-record.json')

    try {
      const expected = {
        backendCommit: BACKEND_COMMIT,
        permissionsSha256: 'b'.repeat(64),
        permissionCount: 1
      }
      writeFileSync(recordPath, `${JSON.stringify(expected)}\n`)
      expect(readPermissionSyncRecord(recordPath)).toEqual(expected)

      writeFileSync(
        recordPath,
        JSON.stringify({
          ...expected,
          lastSyncTime: '2026-08-18T00:00:00.000Z',
          backendRoot: '/Users/example/wes_backend'
        })
      )
      expect(readPermissionSyncRecord(recordPath)).toBeNull()

      writeFileSync(
        recordPath,
        JSON.stringify({
          permissionsHash: 'legacy',
          backendRoot: '/tmp/backend',
          permissionCount: 1
        })
      )
      expect(readPermissionSyncRecord(recordPath)).toBeNull()
    } finally {
      rmSync(root, { force: true, recursive: true })
    }
  })

  it('rejects a permission record bound to another backend commit', () => {
    const root = mkdtempSync(join(tmpdir(), 'permission-record-'))
    const recordPath = join(root, '.permission-sync-record.json')

    try {
      writeFileSync(
        recordPath,
        JSON.stringify({
          backendCommit: '0'.repeat(40),
          permissionsSha256: 'b'.repeat(64),
          permissionCount: 1
        })
      )
      const record = readPermissionSyncRecord(recordPath)
      expect(() => assertPermissionRecordBackendCommit(record, BACKEND_COMMIT)).toThrow(
        /commit 不匹配/
      )
    } finally {
      rmSync(root, { force: true, recursive: true })
    }
  })
})
