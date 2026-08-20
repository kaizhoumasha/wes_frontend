import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  AUTO_GENERATED_END,
  AUTO_GENERATED_START,
  buildMethodNameFromRelativePath,
  buildModulePlans,
  classifyCrudCapabilities,
  CUSTOM_CONFIG_END,
  CUSTOM_CONFIG_START,
  CUSTOM_METHODS_END,
  CUSTOM_METHODS_START,
  deleteStaleGeneratedModules,
  generateModuleAutoSection,
  groupEndpointsByModuleModel,
  mergeModuleWithCustomSections,
  type EndpointInfo
} from '../../../scripts/generate-api-types'

function makeEndpoint(path: string, method: EndpointInfo['method']): EndpointInfo {
  return {
    path,
    method,
    operation: {}
  }
}

describe('generate-api-types helpers', () => {
  it('groups endpoints by module and model from path', () => {
    const groups = groupEndpointsByModuleModel([
      makeEndpoint('/api/v1/admin/users', 'post'),
      makeEndpoint('/api/v1/admin/users/query', 'post'),
      makeEndpoint('/api/v1/admin/roles', 'post')
    ])

    expect(groups.map(group => group.key)).toEqual(['admin:roles', 'admin:users'])
    expect(groups[1]?.collectionPath).toBe('/api/v1/admin/users')
  })

  it('filters system-owned endpoints before grouping browser modules', () => {
    const groups = groupEndpointsByModuleModel([
      makeEndpoint('/api/v1/wms/events', 'post'),
      makeEndpoint('/api/v1/callback/external', 'post'),
      makeEndpoint('/api/v1/callback/logs', 'get'),
      makeEndpoint('/api/v1/admin/users', 'post')
    ])

    expect(groups.flatMap(group => group.endpoints.map(endpoint => endpoint.path))).toEqual([
      '/api/v1/admin/users',
      '/api/v1/callback/logs'
    ])
  })

  it('derives method names from relative paths instead of operationId heuristics', () => {
    expect(buildMethodNameFromRelativePath('reset-password', 'put')).toBe('resetPassword')
    expect(buildMethodNameFromRelativePath('stats/cache', 'get')).toBe('statsCache')
    expect(buildMethodNameFromRelativePath('{id}/assign-roles', 'post')).toBe('assignRoles')
  })

  it('detects soft-delete crud capabilities from path presence only', () => {
    const capabilities = classifyCrudCapabilities('/api/v1/admin/users', [
      makeEndpoint('/api/v1/admin/users', 'post'),
      makeEndpoint('/api/v1/admin/users/{id}', 'get'),
      makeEndpoint('/api/v1/admin/users/{id}', 'put'),
      makeEndpoint('/api/v1/admin/users/{id}', 'delete'),
      makeEndpoint('/api/v1/admin/users/query', 'post'),
      makeEndpoint('/api/v1/admin/users/{id}/restore', 'post'),
      makeEndpoint('/api/v1/admin/users/trash', 'get'),
      makeEndpoint('/api/v1/admin/users/trash/restore', 'post'),
      makeEndpoint('/api/v1/admin/users/trash/permanent', 'delete')
    ])

    expect(capabilities.kind).toBe('soft-delete')
    expect(capabilities.hasBulkDelete).toBe(false)
  })

  it('classifies detail and query resources as readonly', () => {
    const capabilities = classifyCrudCapabilities('/api/v1/admin/permissions', [
      makeEndpoint('/api/v1/admin/permissions/{id}', 'get'),
      makeEndpoint('/api/v1/admin/permissions/query', 'post')
    ])

    expect(capabilities).toEqual({
      kind: 'readonly',
      hasBulkDelete: false
    })
  })

  it('generates readonly methods and an adapter without write inputs', () => {
    const plans = buildModulePlans(
      groupEndpointsByModuleModel([
        makeEndpoint('/api/v1/admin/permissions/{id}', 'get'),
        makeEndpoint('/api/v1/admin/permissions/query', 'post')
      ])
    )

    expect(plans).toHaveLength(1)
    expect(plans[0]?.kind).toBe('resource')

    const source = generateModuleAutoSection(plans[0]!)

    expect(source).toContain(
      `import { createReadonlyCrudRequestAdapterFromMethods } from '@/api/base/createReadonlyCrudRequestAdapter'`
    )
    expect(source).toContain('export type ReadonlyInput = Record<string, never>')
    expect(source).toContain('export const permissionsApiMethods = {')
    expect(source).toContain(
      `return contractMethods.get('/api/v1/admin/permissions/{id}', { params, query, config })`
    )
    expect(source).toContain(
      `return contractMethods.post('/api/v1/admin/permissions/query', { body, config })`
    )
    expect(source).toContain(
      'export const permissionsApi = createReadonlyCrudRequestAdapterFromMethods(permissionsApiMethods)'
    )
    expect(source).not.toContain('CreatePermissionsInput')
    expect(source).not.toContain('UpdatePermissionsInput')
    expect(source).not.toContain('createCrudRequestAdapterMethods')
    expect(source).not.toContain('createSoftDeleteCrudRequestAdapterMethods')
  })

  it('aggregates pure action resources into a module-level file', () => {
    const groups = groupEndpointsByModuleModel([
      makeEndpoint('/api/v1/auth/login', 'post'),
      makeEndpoint('/api/v1/auth/my', 'get'),
      makeEndpoint('/api/v1/auth/permissions', 'get'),
      makeEndpoint('/api/v1/admin/users', 'post'),
      makeEndpoint('/api/v1/admin/users/{id}', 'get'),
      makeEndpoint('/api/v1/admin/users/{id}', 'put'),
      makeEndpoint('/api/v1/admin/users/{id}', 'delete'),
      makeEndpoint('/api/v1/admin/users/query', 'post')
    ])

    const plans = buildModulePlans(groups)

    expect(
      plans
        .map(plan => ({
          fileBaseName: plan.fileBaseName,
          groupKeys: plan.groups.map(group => group.key)
        }))
        .sort((left, right) => left.fileBaseName.localeCompare(right.fileBaseName))
    ).toEqual([
      { fileBaseName: 'auth', groupKeys: ['auth:login', 'auth:my', 'auth:permissions'] },
      { fileBaseName: 'users', groupKeys: ['admin:users'] }
    ])
  })

  it('preserves custom blocks when regenerating module content', () => {
    const merged = mergeModuleWithCustomSections(
      [
        '// ==================== AUTO GENERATED START ====================',
        '/**',
        ' * header',
        ' */',
        'new auto',
        '// ==================== AUTO GENERATED END ====================',
        '',
        '// ==================== CUSTOM METHODS START ====================',
        '// custom methods',
        '// ==================== CUSTOM METHODS END ====================',
        '',
        '// ==================== CUSTOM CONFIG START ====================',
        '// custom config',
        '// ==================== CUSTOM CONFIG END ====================',
        ''
      ].join('\n'),
      [
        '// ==================== AUTO GENERATED START ====================',
        '/**',
        ' * old header',
        ' */',
        'old auto',
        '// ==================== AUTO GENERATED END ====================',
        '',
        '// ==================== CUSTOM METHODS START ====================',
        'export const keepMe = true',
        '// ==================== CUSTOM METHODS END ====================',
        '',
        '// ==================== CUSTOM CONFIG START ====================',
        'export const cacheFor = 3000',
        '// ==================== CUSTOM CONFIG END ====================',
        ''
      ].join('\n')
    )

    expect(merged).toContain('new auto')
    expect(merged).toContain('export const keepMe = true')
    expect(merged).toContain('export const cacheFor = 3000')
    expect(merged).not.toContain('old auto')
  })

  it('accepts compact empty custom blocks after obsolete custom code is removed', () => {
    const generated = mergeModuleWithCustomSections(
      [
        AUTO_GENERATED_START,
        'new auto',
        AUTO_GENERATED_END,
        '',
        CUSTOM_METHODS_START,
        '',
        CUSTOM_METHODS_END,
        '',
        CUSTOM_CONFIG_START,
        '',
        CUSTOM_CONFIG_END,
        ''
      ].join('\n'),
      [
        AUTO_GENERATED_START,
        'old auto',
        AUTO_GENERATED_END,
        '',
        CUSTOM_METHODS_START,
        CUSTOM_METHODS_END,
        '',
        CUSTOM_CONFIG_START,
        '',
        CUSTOM_CONFIG_END,
        ''
      ].join('\n')
    )

    expect(generated).toContain('new auto')
    expect(generated).not.toContain('old auto')
  })

  it('deletes stale generated modules without touching manual files', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'generate-api-types-'))

    try {
      const staleGeneratedFile = join(tempDir, 'stale.ts')
      const manualFile = join(tempDir, 'manual.ts')

      writeFileSync(
        staleGeneratedFile,
        [
          AUTO_GENERATED_START,
          'generated content',
          AUTO_GENERATED_END,
          '',
          CUSTOM_METHODS_START,
          '',
          CUSTOM_METHODS_END,
          '',
          CUSTOM_CONFIG_START,
          '',
          CUSTOM_CONFIG_END,
          ''
        ].join('\n')
      )
      writeFileSync(manualFile, 'export const keepManualFile = true\n')

      const deletedFiles = deleteStaleGeneratedModules(tempDir, new Set(['manual.ts']))

      expect(deletedFiles).toEqual(['stale.ts'])
      expect(existsSync(staleGeneratedFile)).toBe(false)
      expect(existsSync(manualFile)).toBe(true)
    } finally {
      rmSync(tempDir, { force: true, recursive: true })
    }
  })
})
