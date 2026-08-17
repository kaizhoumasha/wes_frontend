import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const OPENAPI_MARKER_PATTERN = /^\/\*\* @openapi-sha256 [a-f0-9]{64} \*\/$/m
const CURRENT_CONTRACT_FILES = [
  'src/api/generated/openapi-metadata/PlaneSceneView.ts',
  'src/api/generated/openapi-metadata/PlaneSnapshot.ts',
  'src/api/generated/openapi-metadata/WorklineActiveObjectsResponse.ts'
]
const RETIRED_CONTRACT_FILES = [
  'src/api/generated/openapi-metadata/WorkLinePluginManifestSummary.ts',
  'src/api/generated/openapi-metadata/RuntimeOverviewResponse.ts',
  'src/api/generated/openapi-metadata/RuntimeHoldDetailResponse.ts'
]

describe('contract generation endpoint noise', () => {
  it('marks generated entry files with the current canonical snapshot SHA-256', () => {
    const generatedApiRoot = join(process.cwd(), 'src/api/generated')
    const generatedEntryFiles = ['openapi-types.ts', '../../types/generated/zod-schemas.ts']

    for (const filePath of generatedEntryFiles) {
      const source = readFileSync(join(generatedApiRoot, filePath), 'utf-8')

      expect(source, filePath).toMatch(OPENAPI_MARKER_PATTERN)
      expect(source, filePath).not.toContain('openapi.workline-plugin-manifest-yaml-topology.json')
    }
  })

  it('keeps system-owned paths out of browser modules without hiding callback administration', () => {
    const moduleRoot = join(process.cwd(), 'src/api/modules')
    const moduleSources = readdirSync(moduleRoot)
      .filter(fileName => fileName.endsWith('.ts'))
      .map(fileName => readFileSync(join(moduleRoot, fileName), 'utf-8'))
      .join('\n')

    expect(moduleSources).not.toContain('/api/v1/wms/')
    expect(moduleSources).not.toContain("'/api/v1/callback/external'")
    expect(moduleSources).toContain('/api/v1/callback/logs')
  })

  it('generates current plane and active-object metadata', () => {
    for (const filePath of CURRENT_CONTRACT_FILES) {
      expect(existsSync(join(process.cwd(), filePath)), `${filePath} should exist`).toBe(true)
    }
  })

  it('removes retired runtime and plugin metadata mechanically', () => {
    for (const filePath of RETIRED_CONTRACT_FILES) {
      expect(existsSync(join(process.cwd(), filePath)), `${filePath} should be removed`).toBe(false)
    }
  })
})
