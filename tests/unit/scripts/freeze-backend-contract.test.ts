import { execFileSync } from 'node:child_process'
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  freezeBackendContract,
  parseFreezeBackendContractArgs
} from '../../../scripts/freeze-backend-contract'
import { writeFileAtomically } from '../../../scripts/lib/atomic-file'
import { computeSha256 } from '../../../scripts/lib/sha256'

vi.mock('../../../scripts/lib/atomic-file', async importOriginal => {
  const actual = await importOriginal<typeof import('../../../scripts/lib/atomic-file')>()
  return {
    ...actual,
    writeFileAtomically: vi.fn(actual.writeFileAtomically)
  }
})

const PROVIDER_OPENAPI =
  '{"info":{"title":"Frozen API","version":"1.0.0"},"openapi":"3.1.0","paths":{"/api/v1/health":{"get":{"responses":{"200":{"description":"ok"}}}}}}\n'
const PROVIDED_PERMISSIONS =
  '{"kind":"wes.release.provided-permissions.v1","permissions":[{"action":"list","category":"biz","description":"设备列表","method":"GET","name":"biz:device:list","path":"/api/v1/devices","resource":"device","type":"user_api"}]}\n'

function git(cwd: string, ...args: string[]): string {
  return execFileSync('git', args, { cwd, encoding: 'utf-8' }).trim()
}

describe.sequential('freeze backend contract', () => {
  let root: string
  let backendRoot: string
  let frontendRoot: string
  let temporaryDirectoryRoot: string
  let binRoot: string
  let previousPath: string

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'freeze-backend-contract-test-'))
    backendRoot = join(root, 'backend')
    frontendRoot = join(root, 'frontend')
    temporaryDirectoryRoot = join(root, 'temporary')
    binRoot = join(root, 'bin')
    mkdirSync(backendRoot)
    mkdirSync(frontendRoot)
    mkdirSync(temporaryDirectoryRoot)
    mkdirSync(binRoot)

    git(backendRoot, 'init', '-b', 'develop')
    git(backendRoot, 'config', 'user.name', 'Contract Test')
    git(backendRoot, 'config', 'user.email', 'contract@example.test')
    writeFileSync(join(backendRoot, 'tracked.txt'), 'baseline\n')
    git(backendRoot, 'add', 'tracked.txt')
    git(backendRoot, 'commit', '-m', 'baseline')

    const fakeUv = join(binRoot, 'uv')
    writeFileSync(
      fakeUv,
      [
        '#!/bin/sh',
        'count=0',
        'if [ -f "$FAKE_EXPORT_COUNT_FILE" ]; then count=$(sed -n "1p" "$FAKE_EXPORT_COUNT_FILE"); fi',
        'count=$((count + 1))',
        'printf "%s" "$count" > "$FAKE_EXPORT_COUNT_FILE"',
        'if [ "$FAKE_EXPORT_FAIL" = "1" ]; then exit 9; fi',
        '[ "$1" = "run" ] && [ "$2" = "python" ] && [ "$3" = "scripts/export_release_provider.py" ] && [ "$4" = "--out-dir" ] || exit 10',
        'output_dir="$5"',
        'mkdir -p "$output_dir"',
        'printf "%s" "$FAKE_PROVIDER_OPENAPI" > "$output_dir/provider-openapi.json"',
        'printf "%s" "$FAKE_PROVIDED_PERMISSIONS" > "$output_dir/provided-permissions.json"',
        'printf "%s" "$FAKE_PROVIDER_FINGERPRINTS" > "$output_dir/provider-fingerprints.json"',
        'if [ "$FAKE_EXPORT_CHANGE_HEAD" = "1" ]; then git commit --allow-empty -m changed >/dev/null; fi',
        ''
      ].join('\n')
    )
    chmodSync(fakeUv, 0o755)
    previousPath = process.env.PATH ?? ''
    process.env.PATH = `${binRoot}:${previousPath}`
    process.env.FAKE_PROVIDER_OPENAPI = PROVIDER_OPENAPI
    process.env.FAKE_PROVIDED_PERMISSIONS = PROVIDED_PERMISSIONS
    process.env.FAKE_PROVIDER_FINGERPRINTS = `${JSON.stringify({
      dependencies_sha256: 'a'.repeat(64),
      expected_schema_head: 'head',
      kind: 'wes.release.backend-fingerprints.v1',
      migration_tree_sha256: 'b'.repeat(64),
      provided_permissions_sha256: computeSha256(PROVIDED_PERMISSIONS),
      provider_openapi_sha256: computeSha256(PROVIDER_OPENAPI),
      recipe_sha256: 'c'.repeat(64)
    })}\n`
    process.env.FAKE_EXPORT_COUNT_FILE = join(root, 'export-count')
    delete process.env.FAKE_EXPORT_FAIL
    delete process.env.FAKE_EXPORT_CHANGE_HEAD
  })

  afterEach(() => {
    process.env.PATH = previousPath
    delete process.env.FAKE_PROVIDER_OPENAPI
    delete process.env.FAKE_PROVIDED_PERMISSIONS
    delete process.env.FAKE_PROVIDER_FINGERPRINTS
    delete process.env.FAKE_EXPORT_COUNT_FILE
    delete process.env.FAKE_EXPORT_FAIL
    delete process.env.FAKE_EXPORT_CHANGE_HEAD
    rmSync(root, { force: true, recursive: true })
  })

  function freeze(): ReturnType<typeof freezeBackendContract> {
    return freezeBackendContract({ backendRoot, frontendRoot, temporaryDirectoryRoot })
  }

  function expectNoOutputs(): void {
    expect(existsSync(join(frontendRoot, 'contracts/openapi.current.json'))).toBe(false)
    expect(existsSync(join(frontendRoot, 'contracts/permissions.current.json'))).toBe(false)
    expect(existsSync(join(frontendRoot, '.contract-sync-record.json'))).toBe(false)
    expect(existsSync(join(frontendRoot, '.permission-sync-record.json'))).toBe(false)
    expect(readdirSync(temporaryDirectoryRoot)).toEqual([])
  }

  function seedPreviousOutputs(): Map<string, string> {
    const previous = new Map([
      ['contracts/openapi.current.json', 'previous openapi\n'],
      ['contracts/permissions.current.json', 'previous permissions\n'],
      ['.contract-sync-record.json', 'previous contract record\n'],
      ['.permission-sync-record.json', 'previous permission record\n']
    ])
    for (const [relativePath, content] of previous) {
      const path = join(frontendRoot, relativePath)
      mkdirSync(join(path, '..'), { recursive: true })
      writeFileSync(path, content)
    }
    return previous
  }

  function expectPreviousOutputs(previous: Map<string, string>): void {
    for (const [relativePath, content] of previous) {
      expect(readFileSync(join(frontendRoot, relativePath), 'utf-8')).toBe(content)
    }
    expect(readdirSync(temporaryDirectoryRoot)).toEqual([])
  }

  it('accepts the standard argv separator and rejects all unsupported options', () => {
    expect(parseFreezeBackendContractArgs(['--', '--backend-root', backendRoot])).toEqual({
      backendRoot
    })
    expect(() => parseFreezeBackendContractArgs(['--source', 'http://example.test'])).toThrow(
      /不支持的参数/
    )
    expect(() => parseFreezeBackendContractArgs(['--unknown'])).toThrow(/不支持的参数/)
  })

  it.each([
    ['missing root', () => rmSync(backendRoot, { recursive: true }), /不存在/],
    ['wrong branch', () => git(backendRoot, 'branch', '-m', 'feature/wrong'), /develop/],
    ['dirty tree', () => writeFileSync(join(backendRoot, 'tracked.txt'), 'dirty\n'), /不干净/]
  ])('fails closed for %s without writing artifacts', (_label, arrange, expected) => {
    arrange()
    expect(() => freeze()).toThrow(expected)
    expectNoOutputs()
  })

  it('leaves all four previous files byte-identical when provider export fails', () => {
    const previous = seedPreviousOutputs()
    process.env.FAKE_EXPORT_FAIL = '1'
    expect(() => freeze()).toThrow(/provider.*失败|导出失败/)
    expectPreviousOutputs(previous)
  })

  it('leaves all four previous files byte-identical for invalid provider artifacts', () => {
    const previous = seedPreviousOutputs()
    process.env.FAKE_PROVIDED_PERMISSIONS =
      '{"kind":"wes.release.provided-permissions.v1","permissions":[]}\n'
    process.env.FAKE_PROVIDER_OPENAPI = '{"openapi":"2.0","paths":{}}\n'
    expect(() => freeze()).toThrow(/OpenAPI 3/)
    expectPreviousOutputs(previous)
  })

  it('leaves all four previous files byte-identical when raw artifact fingerprints mismatch', () => {
    const previous = seedPreviousOutputs()
    process.env.FAKE_PROVIDER_FINGERPRINTS = process.env.FAKE_PROVIDER_FINGERPRINTS!.replace(
      computeSha256(PROVIDED_PERMISSIONS),
      '0'.repeat(64)
    )
    expect(() => freeze()).toThrow(/provided-permissions.*SHA-256|权限.*SHA-256/)
    expectPreviousOutputs(previous)
  })

  it('leaves all four previous files byte-identical when backend HEAD changes during export', () => {
    const previous = seedPreviousOutputs()
    process.env.FAKE_EXPORT_CHANGE_HEAD = '1'
    expect(() => freeze()).toThrow(/HEAD.*变化/)
    expectPreviousOutputs(previous)
  })

  it('restores all four previous files when final publication fails', () => {
    const previous = seedPreviousOutputs()
    const atomicWrite = vi.mocked(writeFileAtomically)
    const realAtomicWrite = atomicWrite.getMockImplementation()
    if (!realAtomicWrite) {
      throw new Error('atomic write test double is missing its real implementation')
    }
    atomicWrite
      .mockImplementationOnce(realAtomicWrite)
      .mockImplementationOnce(realAtomicWrite)
      .mockImplementationOnce(realAtomicWrite)
      .mockImplementationOnce(() => {
        throw new Error('simulated record publication failure')
      })

    expect(() => freeze()).toThrow('simulated record publication failure')
    expectPreviousOutputs(previous)
  })

  it('calls the provider exporter once and publishes both snapshots with both provenance records', () => {
    const backendCommit = git(backendRoot, 'rev-parse', 'HEAD')
    const record = freeze()
    const snapshot = readFileSync(join(frontendRoot, 'contracts/openapi.current.json'), 'utf-8')

    expect(snapshot).toBe(`${JSON.stringify(JSON.parse(PROVIDER_OPENAPI), null, 2)}\n`)
    expect(record).toEqual({
      backendCommit,
      openApiSha256: expect.stringMatching(/^[a-f0-9]{64}$/),
      snapshotPath: 'contracts/openapi.current.json'
    })
    expect(
      JSON.parse(readFileSync(join(frontendRoot, '.contract-sync-record.json'), 'utf-8'))
    ).toEqual(record)
    expect(readFileSync(join(frontendRoot, 'contracts/permissions.current.json'), 'utf-8')).toBe(
      PROVIDED_PERMISSIONS
    )
    expect(
      JSON.parse(readFileSync(join(frontendRoot, '.permission-sync-record.json'), 'utf-8'))
    ).toEqual({
      backendCommit,
      permissionsSha256: expect.stringMatching(/^[a-f0-9]{64}$/),
      permissionCount: 1
    })
    expect(readFileSync(process.env.FAKE_EXPORT_COUNT_FILE!, 'utf-8')).toBe('1')
    expect(readdirSync(temporaryDirectoryRoot)).toEqual([])
  })
})
