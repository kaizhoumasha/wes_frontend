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
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  freezeBackendContract,
  parseFreezeBackendContractArgs
} from '../../../scripts/freeze-backend-contract'

const VALID_OPENAPI = {
  openapi: '3.1.0',
  info: { title: 'Frozen API', version: '1.0.0' },
  paths: { '/api/v1/health': { get: { responses: { 200: { description: 'ok' } } } } }
}

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
        'if [ "$FAKE_UV_FAIL" = "1" ]; then exit 9; fi',
        'for argument do output_path="$argument"; done',
        'printf "%s" "$FAKE_OPENAPI_JSON" > "$output_path"',
        'if [ "$FAKE_UV_CHANGE_HEAD" = "1" ]; then git commit --allow-empty -m changed >/dev/null; fi',
        ''
      ].join('\n')
    )
    chmodSync(fakeUv, 0o755)
    previousPath = process.env.PATH ?? ''
    process.env.PATH = `${binRoot}:${previousPath}`
    process.env.FAKE_OPENAPI_JSON = JSON.stringify(VALID_OPENAPI)
    delete process.env.FAKE_UV_FAIL
    delete process.env.FAKE_UV_CHANGE_HEAD
  })

  afterEach(() => {
    process.env.PATH = previousPath
    delete process.env.FAKE_OPENAPI_JSON
    delete process.env.FAKE_UV_FAIL
    delete process.env.FAKE_UV_CHANGE_HEAD
    rmSync(root, { force: true, recursive: true })
  })

  function freeze(): ReturnType<typeof freezeBackendContract> {
    return freezeBackendContract({ backendRoot, frontendRoot, temporaryDirectoryRoot })
  }

  function expectNoOutputs(): void {
    expect(existsSync(join(frontendRoot, 'contracts/openapi.current.json'))).toBe(false)
    expect(existsSync(join(frontendRoot, '.contract-sync-record.json'))).toBe(false)
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

  it('does not write artifacts when Python extraction fails', () => {
    process.env.FAKE_UV_FAIL = '1'
    expect(() => freeze()).toThrow(/提取失败/)
    expectNoOutputs()
  })

  it('does not write artifacts for invalid OpenAPI', () => {
    process.env.FAKE_OPENAPI_JSON = JSON.stringify({ openapi: '2.0', paths: {} })
    expect(() => freeze()).toThrow(/OpenAPI 3/)
    expectNoOutputs()
  })

  it('does not write artifacts when backend HEAD changes during extraction', () => {
    process.env.FAKE_UV_CHANGE_HEAD = '1'
    expect(() => freeze()).toThrow(/HEAD.*变化/)
    expectNoOutputs()
  })

  it('restores the previous snapshot when final record publication fails', () => {
    const contractsRoot = join(frontendRoot, 'contracts')
    const snapshotPath = join(contractsRoot, 'openapi.current.json')
    mkdirSync(contractsRoot)
    writeFileSync(snapshotPath, 'previous snapshot\n')
    chmodSync(frontendRoot, 0o555)

    try {
      expect(() => freeze()).toThrow()
    } finally {
      chmodSync(frontendRoot, 0o755)
    }

    expect(readFileSync(snapshotPath, 'utf-8')).toBe('previous snapshot\n')
    expect(existsSync(join(frontendRoot, '.contract-sync-record.json'))).toBe(false)
    expect(readdirSync(contractsRoot)).toEqual(['openapi.current.json'])
    expect(readdirSync(temporaryDirectoryRoot)).toEqual([])
  })

  it('writes the canonical snapshot and exact portable record only after success', () => {
    const backendCommit = git(backendRoot, 'rev-parse', 'HEAD')
    const record = freeze()
    const snapshot = readFileSync(join(frontendRoot, 'contracts/openapi.current.json'), 'utf-8')

    expect(snapshot).toBe(`${JSON.stringify(VALID_OPENAPI, null, 2)}\n`)
    expect(record).toEqual({
      backendCommit,
      openApiSha256: expect.stringMatching(/^[a-f0-9]{64}$/),
      snapshotPath: 'contracts/openapi.current.json'
    })
    expect(
      JSON.parse(readFileSync(join(frontendRoot, '.contract-sync-record.json'), 'utf-8'))
    ).toEqual(record)
    expect(readdirSync(temporaryDirectoryRoot)).toEqual([])
  })
})
