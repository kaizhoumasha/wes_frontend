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
import { replaceGeneratedPermissions } from '../../../scripts/generate-permissions'
import { writeFileAtomically } from '../../../scripts/lib/atomic-file'

const RECORD = {
  backendCommit: 'de034e721befae2e1658d0aff96f2f2e43a0ffbb',
  permissionsSha256: 'a'.repeat(64),
  permissionCount: 1
}

describe.sequential('generated artifact publication', () => {
  let root: string

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'artifact-publish-'))
  })

  afterEach(() => {
    chmodSync(root, 0o755)
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

  it('restores the previous permission directory when final record publication fails', () => {
    const generatedRoot = join(root, 'generated')
    const outputDirectory = join(generatedRoot, 'permissions')
    const stagedDirectory = join(generatedRoot, '.permissions-staged')
    const recordPath = join(root, '.permission-sync-record.json')
    mkdirSync(outputDirectory, { recursive: true })
    mkdirSync(stagedDirectory)
    writeFileSync(join(outputDirectory, 'index.ts'), 'old\n')
    writeFileSync(join(stagedDirectory, 'index.ts'), 'new\n')
    chmodSync(root, 0o555)

    expect(() =>
      replaceGeneratedPermissions(stagedDirectory, RECORD, {
        outputDirectory,
        recordPath
      })
    ).toThrow()

    expect(readFileSync(join(outputDirectory, 'index.ts'), 'utf-8')).toBe('old\n')
    expect(existsSync(recordPath)).toBe(false)
    expect(readdirSync(generatedRoot)).toEqual(['permissions'])
  })
})
