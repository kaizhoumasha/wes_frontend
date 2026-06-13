import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const CANONICAL_OPENAPI_URL = 'http://localhost:8001/api/openapi.json'

describe('contract generation endpoint noise', () => {
  it('keeps generated API type source labels stable for local OpenAPI endpoints', async () => {
    const generator = await import('../../../scripts/generate-api-types')

    expect(
      (generator as {
        resolveGeneratedOpenApiSourceLabel?: (source: string) => string
      }).resolveGeneratedOpenApiSourceLabel?.('http://127.0.0.1:8012/api/openapi.json')
    ).toBe(CANONICAL_OPENAPI_URL)
  })

  it('writes zod sync records with the canonical backend URL rather than the fetch URL', () => {
    const source = readFileSync(
      join(process.cwd(), 'scripts/generate-zod-from-openapi.ts'),
      'utf-8'
    )

    expect(source).toContain(`DEFAULT_BACKEND_OPENAPI_URL = '${CANONICAL_OPENAPI_URL}'`)
    expect(source).toContain('backendUrl: DEFAULT_BACKEND_OPENAPI_URL')
    expect(source).toContain('record.backendUrl !== DEFAULT_BACKEND_OPENAPI_URL')
  })
})
