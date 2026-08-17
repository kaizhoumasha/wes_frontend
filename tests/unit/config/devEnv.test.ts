import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  CANONICAL_OPENAPI_SNAPSHOT_PATH,
  readCanonicalOpenApiSnapshot,
  readContractSyncRecord
} from '../../../scripts/lib/openapi-sync'

function readEnvFile(path: string): Record<string, string> {
  const result: Record<string, string> = {}
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const separatorIndex = trimmed.indexOf('=')
    if (separatorIndex < 0) continue
    result[trimmed.slice(0, separatorIndex)] = trimmed.slice(separatorIndex + 1)
  }
  return result
}

describe('.env.development', () => {
  it('points the same-origin dev proxy at the local WES backend', () => {
    const env = readEnvFile(resolve(process.cwd(), '.env.development'))

    expect(env.VITE_API_BASE_URL ?? '').toBe('')
    expect(env.VITE_API_PROXY_TARGET).toBe('http://127.0.0.1:8001')
  })

  it('binds the exact sync record to the checked-in canonical snapshot', () => {
    const frontendRoot = process.cwd()
    const record = readContractSyncRecord(resolve(frontendRoot, '.contract-sync-record.json'))
    const snapshot = readCanonicalOpenApiSnapshot(frontendRoot)

    expect(Object.keys(record).sort()).toEqual(['backendCommit', 'openApiSha256', 'snapshotPath'])
    expect(record.snapshotPath).toBe(CANONICAL_OPENAPI_SNAPSHOT_PATH)
    expect(snapshot.sha256).toBe(record.openApiSha256)
  })
})
