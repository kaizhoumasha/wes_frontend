import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  generatePermissions,
  parseGeneratePermissionsArgs
} from '../../../scripts/generate-permissions'
import {
  assertPermissionRecordBackendCommit,
  assertGeneratedPermissionFiles,
  buildPermissionFileContent,
  buildPermissionsIndexContent,
  computePermissionsHash,
  groupPermissions,
  readPermissionSyncRecord
} from '../../../scripts/lib/permissions-codegen'
import {
  parseVerifyPermissionsArgs,
  verifyPermissions
} from '../../../scripts/verify-permissions-sync'

const BACKEND_COMMIT = 'de034e721befae2e1658d0aff96f2f2e43a0ffbb'
const PERMISSION_LEAF =
  '{"action":"list","category":"biz","description":"设备列表","method":"GET","name":"biz:device:list","path":"/api/v1/devices","resource":"device","type":"user_api"}'
const PERMISSION_SNAPSHOT = `{"kind":"wes.release.provided-permissions.v1","permissions":[${PERMISSION_LEAF}]}\n`
const PERMISSION_SNAPSHOT_SHA256 =
  '27f6a72509875032eddb0fe59f3ecad2663e3b72c9b49529200d5dc422f58b38'
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
  it('accepts only offline generation and verification options', () => {
    expect(parseGeneratePermissionsArgs([])).toEqual({})
    expect(parseGeneratePermissionsArgs(['--'])).toEqual({})
    expect(parseVerifyPermissionsArgs([])).toEqual({ silent: false })
    expect(parseVerifyPermissionsArgs(['--', '--silent'])).toEqual({ silent: true })
    expect(() => parseGeneratePermissionsArgs(['--backend-root', '/tmp/wes_backend'])).toThrow(
      /不支持的参数/
    )
    expect(() => parseVerifyPermissionsArgs(['--backend-root', '/tmp/wes_backend'])).toThrow(
      /不支持的参数/
    )
  })

  it('uses deterministic SHA-256 over the canonical permission snapshot bytes', () => {
    const hash = computePermissionsHash(permissions)

    expect(hash).toBe(PERMISSION_SNAPSHOT_SHA256)
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
    expect(groupContent).toContain('pnpm generate:permissions')
    expect(groupContent).not.toContain('--backend-root')
  })

  it('generates and verifies from the checked-in snapshot without invoking uv or Python', () => {
    const root = mkdtempSync(join(tmpdir(), 'offline-permissions-'))
    const binRoot = join(root, 'bin')
    const previousPath = process.env.PATH ?? ''

    try {
      mkdirSync(join(root, 'contracts'), { recursive: true })
      mkdirSync(binRoot)
      writeFileSync(join(root, 'contracts/permissions.current.json'), PERMISSION_SNAPSHOT)
      writeFileSync(
        join(root, '.contract-sync-record.json'),
        `${JSON.stringify({
          backendCommit: BACKEND_COMMIT,
          openApiSha256: 'a'.repeat(64),
          snapshotPath: 'contracts/openapi.current.json'
        })}\n`
      )
      const permissionRecordContent = `${JSON.stringify(
        {
          backendCommit: BACKEND_COMMIT,
          permissionsSha256: PERMISSION_SNAPSHOT_SHA256,
          permissionCount: 1
        },
        null,
        2
      )}\n`
      writeFileSync(join(root, '.permission-sync-record.json'), permissionRecordContent)
      writeFileSync(join(binRoot, 'uv'), '#!/bin/sh\nexit 91\n')
      chmodSync(join(binRoot, 'uv'), 0o755)
      process.env.PATH = binRoot

      expect(generatePermissions({ frontendRoot: root })).toEqual({
        backendCommit: BACKEND_COMMIT,
        permissionsSha256: PERMISSION_SNAPSHOT_SHA256,
        permissionCount: 1
      })
      expect(() => verifyPermissions({ frontendRoot: root, silent: true })).not.toThrow()

      const groupPath = join(root, 'src/api/generated/permissions/user_api/biz/device.ts')
      expect(existsSync(groupPath)).toBe(true)
      writeFileSync(groupPath, '// drift\n')
      expect(() => verifyPermissions({ frontendRoot: root, silent: true })).toThrow(
        /生成权限文件.*不一致/
      )
      expect(JSON.parse(readFileSync(join(root, '.permission-sync-record.json'), 'utf-8'))).toEqual(
        {
          backendCommit: BACKEND_COMMIT,
          permissionsSha256: PERMISSION_SNAPSHOT_SHA256,
          permissionCount: 1
        }
      )
      expect(readFileSync(join(root, '.permission-sync-record.json'), 'utf-8')).toBe(
        permissionRecordContent
      )
    } finally {
      process.env.PATH = previousPath
      rmSync(root, { force: true, recursive: true })
    }
  })

  it.each([
    [
      'replaced snapshot',
      PERMISSION_SNAPSHOT.replace('/api/v1/devices', '/api/v1/other'),
      {
        backendCommit: BACKEND_COMMIT,
        permissionsSha256: PERMISSION_SNAPSHOT_SHA256,
        permissionCount: 1
      },
      /权限 SHA-256 不匹配/
    ],
    [
      'wrong permission count',
      PERMISSION_SNAPSHOT,
      {
        backendCommit: BACKEND_COMMIT,
        permissionsSha256: PERMISSION_SNAPSHOT_SHA256,
        permissionCount: 2
      },
      /权限数量不匹配/
    ],
    [
      'different backend commit',
      PERMISSION_SNAPSHOT,
      {
        backendCommit: '0'.repeat(40),
        permissionsSha256: PERMISSION_SNAPSHOT_SHA256,
        permissionCount: 1
      },
      /commit 不匹配/
    ]
  ])('does not legalize %s or touch generated files', (_label, snapshot, record, expected) => {
    const root = mkdtempSync(join(tmpdir(), 'permission-provenance-mismatch-'))
    const outputDirectory = join(root, 'src/api/generated/permissions')
    const recordPath = join(root, '.permission-sync-record.json')
    const recordContent = `${JSON.stringify(record, null, 2)}\n`

    try {
      mkdirSync(join(root, 'contracts'), { recursive: true })
      mkdirSync(outputDirectory, { recursive: true })
      writeFileSync(join(root, 'contracts/permissions.current.json'), snapshot)
      writeFileSync(
        join(root, '.contract-sync-record.json'),
        `${JSON.stringify({
          backendCommit: BACKEND_COMMIT,
          openApiSha256: 'a'.repeat(64),
          snapshotPath: 'contracts/openapi.current.json'
        })}\n`
      )
      writeFileSync(recordPath, recordContent)
      writeFileSync(join(outputDirectory, 'index.ts'), 'old index\n')
      writeFileSync(join(outputDirectory, 'sentinel.ts'), 'old sentinel\n')

      expect(() => generatePermissions({ frontendRoot: root })).toThrow(expected)

      expect(readFileSync(recordPath, 'utf-8')).toBe(recordContent)
      expect(readFileSync(join(outputDirectory, 'index.ts'), 'utf-8')).toBe('old index\n')
      expect(readFileSync(join(outputDirectory, 'sentinel.ts'), 'utf-8')).toBe('old sentinel\n')
    } finally {
      rmSync(root, { force: true, recursive: true })
    }
  })

  it.each([
    ['wrong kind', PERMISSION_SNAPSHOT.replace('wes.release.provided-permissions.v1', 'legacy')],
    [
      'extra top-level field',
      PERMISSION_SNAPSHOT.replace(',"permissions"', ',"legacy":true,"permissions"')
    ],
    [
      'extra leaf field',
      PERMISSION_SNAPSHOT.replace('"type":"user_api"', '"type":"user_api","legacy":"x"')
    ],
    [
      'empty leaf field',
      PERMISSION_SNAPSHOT.replace('"description":"设备列表"', '"description":""')
    ],
    [
      'duplicate permission name',
      `{"kind":"wes.release.provided-permissions.v1","permissions":[${PERMISSION_LEAF},${PERMISSION_LEAF}]}\n`
    ],
    [
      'non-canonical leaf order',
      PERMISSION_SNAPSHOT.replace(
        '{"action":"list","category":"biz"',
        '{"category":"biz","action":"list"'
      )
    ]
  ])('rejects %s in the canonical permission snapshot', (_label, snapshot) => {
    const root = mkdtempSync(join(tmpdir(), 'invalid-permission-snapshot-'))
    try {
      mkdirSync(join(root, 'contracts'), { recursive: true })
      writeFileSync(join(root, 'contracts/permissions.current.json'), snapshot)
      writeFileSync(
        join(root, '.contract-sync-record.json'),
        `${JSON.stringify({
          backendCommit: BACKEND_COMMIT,
          openApiSha256: 'a'.repeat(64),
          snapshotPath: 'contracts/openapi.current.json'
        })}\n`
      )
      expect(() => generatePermissions({ frontendRoot: root })).toThrow(
        /权限快照|permissions|canonical|字段|重复|非空|顺序/
      )
    } finally {
      rmSync(root, { force: true, recursive: true })
    }
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

      writeFileSync(
        groupPath,
        '// valid TypeScript, but not generated from the backend permissions\n'
      )
      expect(() => assertGeneratedPermissionFiles(permissions, outputDir)).toThrow(
        /生成权限文件与权限快照不一致/
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
