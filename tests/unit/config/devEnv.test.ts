import { readFileSync } from 'node:fs'
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
  it('points the same-origin dev proxy at the generated backend contract source', () => {
    const env = readEnvFile(resolve(process.cwd(), '.env.development'))

    expect(env.VITE_API_BASE_URL ?? '').toBe('')
    expect(env.VITE_API_PROXY_TARGET).toBe('http://127.0.0.1:8011')
  })
})
