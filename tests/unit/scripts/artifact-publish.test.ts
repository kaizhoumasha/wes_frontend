import { createHash } from 'node:crypto'
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { replaceGeneratedPermissions } from '../../../scripts/generate-permissions'
import { writeFileAtomically } from '../../../scripts/lib/atomic-file'
import { validateReleaseConsumerArtifacts } from '../../../scripts/lib/release-consumer'

describe.sequential('generated artifact publication', () => {
  let root: string

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'artifact-publish-'))
  })

  afterEach(() => {
    rmSync(root, { force: true, recursive: true })
  })

  it('publishes one file through a same-directory rename without leaving temp files', () => {
    const targetPath = join(root, 'record.json')
    writeFileSync(targetPath, 'old\n')

    writeFileAtomically(targetPath, 'new\n')

    expect(readFileSync(targetPath, 'utf-8')).toBe('new\n')
    expect(readdirSync(root)).toEqual(['record.json'])
  })

  it('removes its same-directory temp file when publication fails', () => {
    const targetPath = join(root, 'record.json')
    mkdirSync(targetPath)
    writeFileSync(join(targetPath, 'keep.txt'), 'unchanged\n')

    expect(() => writeFileAtomically(targetPath, 'new\n')).toThrow()

    expect(readFileSync(join(targetPath, 'keep.txt'), 'utf-8')).toBe('unchanged\n')
    expect(readdirSync(root)).toEqual(['record.json'])
  })

  it('replaces only the permission directory and leaves the freeze record byte-identical', () => {
    const generatedRoot = join(root, 'generated')
    const outputDirectory = join(generatedRoot, 'permissions')
    const stagedDirectory = join(generatedRoot, '.permissions-staged')
    const recordPath = join(root, '.permission-sync-record.json')
    mkdirSync(outputDirectory, { recursive: true })
    mkdirSync(stagedDirectory)
    writeFileSync(join(outputDirectory, 'index.ts'), 'old\n')
    writeFileSync(join(stagedDirectory, 'index.ts'), 'new\n')
    writeFileSync(recordPath, 'freeze record\n')

    replaceGeneratedPermissions(stagedDirectory, { outputDirectory })

    expect(readFileSync(join(outputDirectory, 'index.ts'), 'utf-8')).toBe('new\n')
    expect(readFileSync(recordPath, 'utf-8')).toBe('freeze record\n')
    expect(readdirSync(generatedRoot)).toEqual(['permissions'])
  })

  it('preserves the previous permission directory when creating its backup fails', () => {
    const generatedRoot = join(root, 'generated')
    const outputDirectory = join(generatedRoot, 'permissions')
    const stagedDirectory = join(generatedRoot, '.permissions-staged')
    const backupDirectory = `${stagedDirectory}-backup`
    const recordPath = join(root, '.permission-sync-record.json')
    mkdirSync(outputDirectory, { recursive: true })
    mkdirSync(stagedDirectory)
    mkdirSync(backupDirectory)
    writeFileSync(join(outputDirectory, 'index.ts'), 'old\n')
    writeFileSync(join(stagedDirectory, 'index.ts'), 'new\n')
    writeFileSync(join(backupDirectory, 'blocker.txt'), 'blocker\n')
    writeFileSync(recordPath, 'freeze record\n')

    expect(() => replaceGeneratedPermissions(stagedDirectory, { outputDirectory })).toThrow()

    expect(readFileSync(join(outputDirectory, 'index.ts'), 'utf-8')).toBe('old\n')
    expect(readFileSync(recordPath, 'utf-8')).toBe('freeze record\n')
  })

  it('validates image-boundary consumer artifacts and rejects malformed or mismatched inputs', () => {
    const artifactRoot = join(root, 'release-consumer')
    mkdirSync(artifactRoot)
    const openapi = `${JSON.stringify({ openapi: '3.1.0', info: { title: 'test', version: '1' }, paths: {} }, null, 2)}\n`
    const operations = `${JSON.stringify({ kind: 'wes.release.required-operations.v1', operations: [] })}\n`
    const permissions = `${JSON.stringify({ kind: 'wes.release.required-permissions.v1', permissions: [] })}\n`
    const hash = (value: string): string => createHash('sha256').update(value).digest('hex')
    const fingerprints = {
      consumer_openapi_sha256: hash(openapi),
      dependencies_sha256: '1'.repeat(64),
      kind: 'wes.release.frontend-fingerprints.v1' as const,
      recipe_sha256: '2'.repeat(64),
      required_operations_sha256: hash(operations),
      required_permissions_sha256: hash(permissions)
    }
    writeFileSync(join(artifactRoot, 'consumer-openapi.json'), openapi)
    writeFileSync(join(artifactRoot, 'required-operations.json'), operations)
    writeFileSync(join(artifactRoot, 'required-permissions.json'), permissions)
    writeFileSync(
      join(artifactRoot, 'consumer-fingerprints.json'),
      `${JSON.stringify(fingerprints)}\n`
    )

    expect(validateReleaseConsumerArtifacts(artifactRoot, fingerprints)).toEqual(fingerprints)
    expect(
      validateReleaseConsumerArtifacts(artifactRoot, fingerprints, {
        revision: 'a'.repeat(40),
        sourceTree: 'b'.repeat(40)
      })
    ).toEqual(fingerprints)
    expect(() =>
      validateReleaseConsumerArtifacts(artifactRoot, {
        ...fingerprints,
        consumer_openapi_sha256: 'f'.repeat(64)
      })
    ).toThrow('镜像 label 输入与 consumer exporter 指纹不一致')

    for (const invalidHash of [
      '',
      'a'.repeat(63),
      'A'.repeat(64),
      `${'a'.repeat(63)}\n`,
      `$(id)${'a'.repeat(59)}`
    ]) {
      writeFileSync(
        join(artifactRoot, 'consumer-fingerprints.json'),
        `${JSON.stringify({ ...fingerprints, dependencies_sha256: invalidHash })}\n`
      )
      expect(() => validateReleaseConsumerArtifacts(artifactRoot)).toThrow(
        'consumer fingerprints schema 无效'
      )
    }
    writeFileSync(
      join(artifactRoot, 'consumer-fingerprints.json'),
      `${JSON.stringify(fingerprints)}\n`
    )

    writeFileSync(join(artifactRoot, 'required-operations.json'), '{')
    expect(() => validateReleaseConsumerArtifacts(artifactRoot, fingerprints)).toThrow(
      'required operations 不是有效 JSON'
    )
  })

  it.each([
    [undefined, 'b'.repeat(40)],
    ['', 'b'.repeat(40)],
    ['a'.repeat(39), 'b'.repeat(40)],
    ['A'.repeat(40), 'b'.repeat(40)],
    [`${'a'.repeat(39)}\n`, 'b'.repeat(40)],
    [`$(id)${'a'.repeat(35)}`, 'b'.repeat(40)],
    ['a'.repeat(40), undefined],
    ['a'.repeat(40), 'b'.repeat(41)]
  ])('rejects malformed image Git identity', (revision, sourceTree) => {
    const artifactRoot = join(root, 'release-consumer')
    mkdirSync(artifactRoot)
    const openapi = `${JSON.stringify({ openapi: '3.1.0', info: { title: 'test', version: '1' }, paths: {} }, null, 2)}\n`
    const operations = `${JSON.stringify({ kind: 'wes.release.required-operations.v1', operations: [] })}\n`
    const permissions = `${JSON.stringify({ kind: 'wes.release.required-permissions.v1', permissions: [] })}\n`
    const hash = (value: string): string => createHash('sha256').update(value).digest('hex')
    const fingerprints = {
      consumer_openapi_sha256: hash(openapi),
      dependencies_sha256: '1'.repeat(64),
      kind: 'wes.release.frontend-fingerprints.v1' as const,
      recipe_sha256: '2'.repeat(64),
      required_operations_sha256: hash(operations),
      required_permissions_sha256: hash(permissions)
    }
    writeFileSync(join(artifactRoot, 'consumer-openapi.json'), openapi)
    writeFileSync(join(artifactRoot, 'required-operations.json'), operations)
    writeFileSync(join(artifactRoot, 'required-permissions.json'), permissions)
    writeFileSync(
      join(artifactRoot, 'consumer-fingerprints.json'),
      `${JSON.stringify(fingerprints)}\n`
    )

    expect(() =>
      validateReleaseConsumerArtifacts(artifactRoot, fingerprints, { revision, sourceTree })
    ).toThrow('镜像 Git 身份必须是 40 位 lowercase hex')
  })
})
