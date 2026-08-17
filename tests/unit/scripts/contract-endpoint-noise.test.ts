import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const CANONICAL_OPENAPI_URL = 'http://127.0.0.1:8001/api/openapi.json'
const MANIFEST_CONTRACT_FILES = [
  'src/api/generated/openapi-metadata/WorkLinePluginManifestSummary.ts',
  'src/api/generated/openapi-metadata/CommandBinding.ts',
  'src/api/generated/openapi-metadata/ResourceBoundary.ts',
  'src/api/generated/openapi-metadata/RackPosition.ts',
  'src/api/generated/openapi-metadata/RackPositionCarrierCapability.ts'
]
const REMOVED_MANIFEST_CONTRACT_FILES = [
  `src/api/generated/openapi-metadata/${'Command' + 'ResultBinding'}.ts`,
  `src/api/generated/openapi-metadata/${'Rack' + 'PositionArg'}.ts`,
  `src/api/generated/openapi-metadata/${'Rack' + 'PositionArgSource'}.ts`
]
const FORBIDDEN_WORKLINE_CONTRACT_DRIFT = ['/api/v1/workline/inbound-handoff', 'SmtInboundHandoff']

describe('contract generation endpoint noise', () => {
  it('omits OpenAPI source labels from generated API contract files', () => {
    const generatedApiRoot = join(process.cwd(), 'src/api/generated')
    const generatedApiFiles = [
      'openapi-types.ts',
      'openapi-metadata.ts',
      'openapi-metadata-types.ts',
      ...readdirSync(join(generatedApiRoot, 'openapi-metadata')).map(
        fileName => `openapi-metadata/${fileName}`
      )
    ].filter(filePath => filePath.endsWith('.ts'))
    const generatorSource = readFileSync(
      join(process.cwd(), 'scripts/generate-api-types.ts'),
      'utf-8'
    )

    expect(generatorSource).not.toContain('后端 OpenAPI 端点:')
    expect(generatorSource).not.toContain('generatedOpenApiSourceLabel')

    for (const filePath of generatedApiFiles) {
      const source = readFileSync(join(generatedApiRoot, filePath), 'utf-8')

      expect(source, filePath).not.toContain('后端 OpenAPI 端点:')
      expect(source, filePath).not.toContain(CANONICAL_OPENAPI_URL)
      expect(source, filePath).not.toContain(
        'contracts/openapi.workline-plugin-manifest-yaml-topology.json'
      )
    }
  })

  it('writes zod sync records with the OpenAPI source that generated the hash', () => {
    return Promise.all([
      import('../../../scripts/generate-zod-from-openapi'),
      import('../../../scripts/verify-contract-sync')
    ]).then(([zodGenerator, verifier]) => {
      expect(zodGenerator.resolveOpenApiSourceRecordFromEnv({})).toBe(CANONICAL_OPENAPI_URL)
      expect(
        zodGenerator.resolveOpenApiSourceRecordFromEnv({
          OPENAPI_SPEC_PATH: 'contracts/openapi.workline-plugin-manifest-yaml-topology.json',
          OPENAPI_SPEC_URL: 'https://example.test/openapi.json',
          BACKEND_OPENAPI_URL: 'http://127.0.0.1:8012/api/openapi.json'
        })
      ).toBe('contracts/openapi.workline-plugin-manifest-yaml-topology.json')
      expect(
        zodGenerator.resolveOpenApiSourceRecordFromEnv({
          BACKEND_OPENAPI_URL: 'http://127.0.0.1:8012/api/openapi.json'
        })
      ).toBe('http://127.0.0.1:8012/api/openapi.json')
      expect(
        verifier.resolveOpenApiSource({
          lastSyncTime: '2026-06-18T00:00:00.000Z',
          openApiHash: 'fqiikh',
          backendUrl: 'contracts/openapi.workline-plugin-manifest-yaml-topology.json'
        })
      ).toBe(join(process.cwd(), 'contracts/openapi.workline-plugin-manifest-yaml-topology.json'))
    })
  })

  it('keeps unrelated SMT inbound handoff contracts out of generated manifest sources', () => {
    for (const filePath of MANIFEST_CONTRACT_FILES) {
      const source = readFileSync(join(process.cwd(), filePath), 'utf-8')

      for (const forbiddenContract of FORBIDDEN_WORKLINE_CONTRACT_DRIFT) {
        expect(source, `${filePath} should not contain ${forbiddenContract}`).not.toContain(
          forbiddenContract
        )
      }
    }
  })

  it('does not keep removed payload-binding manifest metadata files', () => {
    for (const filePath of REMOVED_MANIFEST_CONTRACT_FILES) {
      expect(existsSync(join(process.cwd(), filePath)), `${filePath} should be removed`).toBe(false)
    }
  })
})
