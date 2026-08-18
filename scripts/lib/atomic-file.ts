import { randomUUID } from 'node:crypto'
import { mkdirSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { basename, dirname, join } from 'node:path'

export function writeFileAtomically(targetPath: string, content: string): void {
  const parentDirectory = dirname(targetPath)
  mkdirSync(parentDirectory, { recursive: true })
  const temporaryPath = join(parentDirectory, `.${basename(targetPath)}.${randomUUID()}.tmp`)

  try {
    writeFileSync(temporaryPath, content, { encoding: 'utf-8', flag: 'wx' })
    renameSync(temporaryPath, targetPath)
  } finally {
    rmSync(temporaryPath, { force: true })
  }
}
