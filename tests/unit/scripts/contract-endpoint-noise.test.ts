import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const CANONICAL_OPENAPI_URL = 'http://localhost:8001/api/openapi.json'
const OLD_MANIFEST_FIELDS = [
  'required_' + 'device_roles',
  'event_' + 'source_roles',
  'command_' + 'target_roles',
  'supported_' + 'events',
  'supported_' + 'commands',
  'single_' + 'layer_boundaries',
  'WorkLine' + 'SingleLayerRackBoundarySummary'
]
const OLD_MANIFEST_FIELD_PATTERN = new RegExp(
  `(?<![A-Za-z0-9_])(${OLD_MANIFEST_FIELDS.join('|')})(?![A-Za-z0-9_])`
)
const WORKLINE_CONTRACT_DRIFT_FILES = [
  'src/api/modules/workline.ts',
  'src/api/generated/openapi-types.ts',
  'src/api/generated/openapi-metadata/index.ts',
  'src/types/generated/zod-schemas.ts',
]
const FORBIDDEN_WORKLINE_CONTRACT_DRIFT = [
  '/api/v1/workline/inbound-handoff',
  'SmtInboundHandoff',
]

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

  it('keeps runtime smoke manifest fixtures on the new manifest summary contract', () => {
    const source = readFileSync(
      join(process.cwd(), 'scripts/runtime-agent-browser-smoke.sh'),
      'utf-8'
    )

    expect(source).not.toMatch(OLD_MANIFEST_FIELD_PATTERN)
    expect(source).toContain('"devices"')
    expect(source).toContain('"positions"')
    expect(source).toContain('"topology"')
    expect(source).toContain('"events"')
    expect(source).toContain('"commands"')
    expect(source).toContain('"resource_boundaries"')
  })

  it('keeps unrelated SMT inbound handoff contracts out of generated workline sources', () => {
    for (const filePath of WORKLINE_CONTRACT_DRIFT_FILES) {
      const source = readFileSync(join(process.cwd(), filePath), 'utf-8')

      for (const forbiddenContract of FORBIDDEN_WORKLINE_CONTRACT_DRIFT) {
        expect(source, `${filePath} should not contain ${forbiddenContract}`).not.toContain(
          forbiddenContract
        )
      }
    }

    const metadataFiles = readdirSync(
      join(process.cwd(), 'src/api/generated/openapi-metadata')
    )
    expect(metadataFiles.filter(fileName => fileName.startsWith('SmtInboundHandoff'))).toEqual(
      []
    )
  })
})
