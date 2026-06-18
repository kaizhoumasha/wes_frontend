import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

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
  const snapshotPath = 'contracts/openapi.workline-plugin-manifest-yaml-topology.json'

  it('points the same-origin dev proxy at the local WES backend', () => {
    const env = readEnvFile(resolve(process.cwd(), '.env.development'))

    expect(env.VITE_API_BASE_URL ?? '').toBe('')
    expect(env.VITE_API_PROXY_TARGET).toBe('http://127.0.0.1:8001')
  })

  it('keeps the default contract sync endpoint on the local WES backend port', () => {
    const generatorSource = readFileSync(
      resolve(process.cwd(), 'scripts/generate-zod-from-openapi.ts'),
      'utf8'
    )

    expect(generatorSource).toContain(
      "DEFAULT_BACKEND_OPENAPI_URL = 'http://127.0.0.1:8001/api/openapi.json'"
    )
  })

  it('records the OpenAPI source that produced the checked-in contract hash', () => {
    const record = JSON.parse(
      readFileSync(resolve(process.cwd(), '.contract-sync-record.json'), 'utf8')
    ) as { backendUrl?: string }

    expect(record.backendUrl).toBe(snapshotPath)
    expect(existsSync(resolve(process.cwd(), snapshotPath))).toBe(true)
  })
})
