import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  assertCurrentDtoContracts,
  assertCurrentPaths,
  assertNoSystemOwnedPathsInModules,
  assertPermissionRecordMatchesContract
} from '../../../scripts/contract-test'
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

describe('contract browser module ownership', () => {
  const currentPaths = {
    '/api/v1/wms/events': {},
    '/api/v1/callback/event': {},
    '/api/v1/callback/result': {},
    '/api/v1/callback/logs/query': {}
  }

  const systemPaths = ['/api/v1/wms/events', '/api/v1/callback/event', '/api/v1/callback/result']

  it.each([
    ['single-quoted', (path: string) => `'${path}'`],
    ['double-quoted', (path: string) => `"${path}"`],
    ['template', (path: string) => `\`${path}\``]
  ])('rejects %s system-owned paths from browser modules', (_literalKind, literal) => {
    for (const systemPath of systemPaths) {
      expect(() =>
        assertNoSystemOwnedPathsInModules(
          `contractMethods.post(${literal(systemPath)})`,
          currentPaths
        )
      ).toThrow(systemPath)
    }
  })

  it('keeps callback administration paths browser-owned', () => {
    expect(() =>
      assertNoSystemOwnedPathsInModules(
        "contractMethods.post('/api/v1/callback/logs/query')",
        currentPaths
      )
    ).not.toThrow()
  })
})

describe('contract required system paths', () => {
  const currentPaths = {
    '/api/v1/workline/work_lines/{id}/plane/scene': {},
    '/api/v1/workline/work_lines/{id}/plane/snapshot': {},
    '/api/v1/workline/work_lines/{id}/available-plugins': {},
    '/api/v1/workline/work_lines/{id}/configuration-status': {},
    '/api/v1/workline/work_lines/{id}/configuration': {},
    '/api/v1/workline/work_lines/{id}/deactivate': {},
    '/api/v1/wms/events': {},
    '/api/v1/callback/event': {},
    '/api/v1/callback/result': {}
  }

  it.each(['/api/v1/callback/event', '/api/v1/callback/result'])(
    'rejects a raw contract missing %s',
    missingPath => {
      const paths = { ...currentPaths }
      delete paths[missingPath as keyof typeof paths]

      expect(() => assertCurrentPaths(paths)).toThrow(missingPath)
    }
  )

  it('rejects the retired external callback ingress', () => {
    expect(() =>
      assertCurrentPaths({
        ...currentPaths,
        '/api/v1/callback/external': {}
      })
    ).toThrow('/api/v1/callback/external')
  })
})

describe('contract WorkLine and Device ownership boundaries', () => {
  const schema = (properties: string[]) => ({
    properties: Object.fromEntries(properties.map(field => [field, {}]))
  })
  const currentSchemas = {
    WorkLineCreate: schema(['runtime_config_json', 'diagnostic_profile']),
    WorkLineUpdate: schema(['runtime_config_json', 'diagnostic_profile']),
    WorkLineResponse: schema(['runtime_config_json', 'diagnostic_profile', 'plugin_key', 'config']),
    DeviceCreate: schema(['device_role', 'role_index', 'upstream_device_id', 'diagnostic_profile']),
    DeviceUpdate: schema(['device_role', 'role_index', 'upstream_device_id', 'diagnostic_profile']),
    DeviceResponse: schema([
      'device_role',
      'role_index',
      'upstream_device_id',
      'work_line_id',
      'diagnostic_profile'
    ])
  }

  it('keeps plugin selection and device ownership out of generic write contracts', () => {
    expect(() => assertCurrentDtoContracts(currentSchemas)).not.toThrow()
    expect(() =>
      assertCurrentDtoContracts({
        ...currentSchemas,
        DeviceUpdate: schema([
          'device_role',
          'role_index',
          'upstream_device_id',
          'diagnostic_profile',
          'work_line_id'
        ])
      })
    ).toThrow('DeviceUpdate 仍包含已退役字段 work_line_id')
  })
})
