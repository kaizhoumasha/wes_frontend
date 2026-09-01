import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  exportReleaseConsumer,
  writeArtifactDirectoryAtomically
} from '../../../scripts/lib/release-consumer'

const OPENAPI = {
  openapi: '3.1.0',
  info: { title: 'fixture', version: '1' },
  paths: {
    '/api/v1/admin/widgets': { post: {} },
    '/api/v1/admin/widgets/{id}': { get: {}, put: {}, delete: {} },
    '/api/v1/admin/widgets/query': { post: {} },
    '/api/v1/admin/widgets/alias-call': { get: {} },
    '/api/v1/admin/widgets/optional-call': { patch: {} },
    '/api/v1/admin/widgets/reset': { post: {} },
    '/api/v1/auth/refresh': { post: {} },
    '/api/v1/device/evidences/stream': { get: {} }
  }
}

const PERMISSIONS = [
  ['admin:widget:create', 'POST', '/api/v1/admin/widgets'],
  ['admin:widget:detail', 'GET', '/api/v1/admin/widgets/{id}'],
  ['admin:widget:list', 'POST', '/api/v1/admin/widgets/query'],
  ['admin:widget:reset', 'POST', '/api/v1/admin/widgets/reset']
].map(([name, method, path]) => ({
  action: name.split(':')[2],
  category: 'admin',
  description: name,
  method,
  name,
  path,
  resource: 'widget',
  type: 'user_api'
}))

function write(root: string, relativePath: string, content: string): void {
  const path = join(root, relativePath)
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, content, 'utf8')
}

function createFixture(
  source: string,
  extraFiles: Record<string, string> = {}
): { root: string; outputDir: string } {
  const root = mkdtempSync(join(tmpdir(), 'release-consumer-'))
  write(root, 'contracts/openapi.current.json', `${JSON.stringify(OPENAPI)}\n`)
  write(
    root,
    'contracts/permissions.current.json',
    `${JSON.stringify({ kind: 'wes.release.provided-permissions.v1', permissions: PERMISSIONS })}\n`
  )
  write(
    root,
    'src/api/generated/permissions/index.ts',
    `const WIDGET_PERMISSION = {
  page: 'admin:widget:list',
  list: 'admin:widget:list',
  detail: 'admin:widget:detail',
  create: 'admin:widget:create',
  reset: 'admin:widget:reset'
} as const
export const ADMIN_PERMISSIONS = { widget: WIDGET_PERMISSION } as const
`
  )
  write(root, 'src/fixture.ts', source)
  write(
    root,
    'src/Fixture.vue',
    `<script setup lang="ts">
import { widgetsApiMethods as widget } from '@/api/modules/widgets'
widget['update'](1, {})
</script>
<template><div /></template>
`
  )
  write(root, 'tests/ignored.ts', `api[method](path)\n`)
  write(root, 'dist/ignored.js', `api[method](path)\n`)
  write(root, 'package.json', '{"scripts":{"build":"vite build --mode production"}}\n')
  write(root, 'pnpm-lock.yaml', 'lockfileVersion: 9\n')
  write(root, '.npmrc', 'fetch-retries=5\n')
  write(root, 'Dockerfile', 'RUN pnpm run build\nCMD ["nginx", "-g", "daemon off;"]\n')
  write(root, 'nginx.conf', 'events {}\nhttp {}\n')
  write(root, 'vite.config.ts', 'export default {}\n')
  for (const [relativePath, content] of Object.entries(extraFiles)) {
    write(root, relativePath, content)
  }
  return { root, outputDir: join(root, 'artifacts/release-consumer') }
}

const SUCCESS_SOURCE = `
import { ADMIN_PERMISSIONS as AP } from '@/api/generated/permissions'
import { widgetsApiMethods as widget } from '@/api/modules/widgets'
import { apiClient as wire } from '@/api/client'

const { create: createPermission } = AP.widget
const { aliasCall: runAliasedCall } = widget
const refreshPath = '/api/v1/auth/refresh'
const basePermissions = [AP.widget.list]
const explicitPermissions = { list: AP.widget.list }

export const route = { meta: { permission: enabled ? AP['widget']?.page : AP.widget.reset } }
export const resource = {
  permissions: [{
    ...explicitPermissions,
    detail: AP.widget.detail,
    create: createPermission
  }, ...basePermissions]
}
hasPermission(AP.widget.reset)
hasPermission('*')
widget?.optionalCall()
runAliasedCall()
wire.Post(refreshPath)
new URL('/api/v1/device/evidences/stream', baseUrl)
`

describe('release consumer exporter', () => {
  it('exports the exact deterministic production consumer surface and fingerprints', () => {
    const fixture = createFixture(SUCCESS_SOURCE)

    try {
      const first = exportReleaseConsumer({
        frontendRoot: fixture.root,
        outputDir: fixture.outputDir
      })
      const firstBytes = new Map(
        [
          'consumer-openapi.json',
          'required-operations.json',
          'required-permissions.json',
          'consumer-fingerprints.json'
        ].map(name => [name, readFileSync(join(fixture.outputDir, name))])
      )
      const second = exportReleaseConsumer({
        frontendRoot: fixture.root,
        outputDir: fixture.outputDir
      })

      expect(second).toEqual(first)
      for (const [name, bytes] of firstBytes) {
        expect(readFileSync(join(fixture.outputDir, name))).toEqual(bytes)
      }
      expect(readFileSync(join(fixture.outputDir, 'consumer-openapi.json'), 'utf8')).toBe(
        `${JSON.stringify(OPENAPI)}\n`
      )
      expect(first.requiredPermissions).toEqual([
        'admin:widget:create',
        'admin:widget:detail',
        'admin:widget:list',
        'admin:widget:reset'
      ])
      expect(first.requiredOperations).toEqual([
        { method: 'POST', path: '/api/v1/admin/widgets' },
        { method: 'GET', path: '/api/v1/admin/widgets/alias-call' },
        { method: 'PATCH', path: '/api/v1/admin/widgets/optional-call' },
        { method: 'POST', path: '/api/v1/admin/widgets/query' },
        { method: 'POST', path: '/api/v1/admin/widgets/reset' },
        { method: 'GET', path: '/api/v1/admin/widgets/{id}' },
        { method: 'PUT', path: '/api/v1/admin/widgets/{id}' },
        { method: 'POST', path: '/api/v1/auth/refresh' },
        { method: 'GET', path: '/api/v1/device/evidences/stream' }
      ])
      expect(first.fingerprints).toEqual({
        kind: 'wes.release.frontend-fingerprints.v1',
        consumer_openapi_sha256: expect.stringMatching(/^[0-9a-f]{64}$/),
        required_operations_sha256: expect.stringMatching(/^[0-9a-f]{64}$/),
        required_permissions_sha256: expect.stringMatching(/^[0-9a-f]{64}$/),
        dependencies_sha256: expect.stringMatching(/^[0-9a-f]{64}$/),
        recipe_sha256: expect.stringMatching(/^[0-9a-f]{64}$/)
      })
    } finally {
      rmSync(fixture.root, { recursive: true, force: true })
    }
  })

  it('binds repository package-manager settings into the frontend recipe fingerprint', () => {
    const fixture = createFixture(SUCCESS_SOURCE)

    try {
      const first = exportReleaseConsumer({ frontendRoot: fixture.root, outputDir: fixture.outputDir })
      write(fixture.root, '.npmrc', 'fetch-retries=6\n')
      const second = exportReleaseConsumer({ frontendRoot: fixture.root, outputDir: fixture.outputDir })

      expect(second.fingerprints.recipe_sha256).not.toBe(first.fingerprints.recipe_sha256)
      expect(second.fingerprints.dependencies_sha256).toBe(first.fingerprints.dependencies_sha256)
    } finally {
      rmSync(fixture.root, { recursive: true, force: true })
    }
  })

  it.each([
    ['whole permission group', `export const invalid = { permissions: AP.widget }`, '整组权限'],
    [
      'unknown permission',
      `export const invalid = { permission: 'admin:widget:missing' }`,
      '未知权限'
    ],
    [
      'dynamic permission leaf',
      `export const invalid = { permission: AP.widget[key] }`,
      '动态权限'
    ],
    ['dynamic generated method', `widget[key]()`, '动态 generated method'],
    [
      'dynamic direct method',
      `import { apiClient as wire } from '@/api/client'\nwire[verb]('/api/v1/auth/refresh')`,
      '动态 HTTP method'
    ],
    [
      'dynamic direct path',
      `import { apiClient as wire } from '@/api/client'\nwire.Post(path)`,
      '动态 endpoint path'
    ],
    [
      'unresolved barrel',
      `import { widgetsApiMethods } from '@/api/modules'\nwidgetsApiMethods.query()`,
      '无法解析 generated method import'
    ],
    [
      'unresolved permission barrel',
      `import { ADMIN_PERMISSIONS as UNKNOWN } from '@/permissions-barrel'\nexport const invalid = { permissions: UNKNOWN.widget }`,
      '无法解析权限 import/barrel'
    ]
  ])('fails closed for %s', (_name, statement, message) => {
    const fixture = createFixture(`
import { ADMIN_PERMISSIONS as AP } from '@/api/generated/permissions'
import { widgetsApiMethods as widget } from '@/api/modules/widgets'
${statement}
`)

    try {
      expect(() =>
        exportReleaseConsumer({ frontendRoot: fixture.root, outputDir: fixture.outputDir })
      ).toThrow(message)
      expect(existsSync(fixture.outputDir)).toBe(false)
    } finally {
      rmSync(fixture.root, { recursive: true, force: true })
    }
  })

  it('expands known array spreads and unions conditional permission branches', () => {
    const fixture = createFixture(`
import { ADMIN_PERMISSIONS as AP } from '@/api/generated/permissions'
const base = [AP.widget.create]
export const route = { permission: enabled ? AP.widget.detail : AP.widget.reset }
export const actions = { permissions: [...base, AP.widget.list] }
`)

    try {
      const result = exportReleaseConsumer({
        frontendRoot: fixture.root,
        outputDir: fixture.outputDir
      })
      expect(result.requiredPermissions).toEqual([
        'admin:widget:create',
        'admin:widget:detail',
        'admin:widget:list',
        'admin:widget:reset'
      ])
    } finally {
      rmSync(fixture.root, { recursive: true, force: true })
    }
  })

  it('fails closed for an unknown object spread reaching a permission sink', () => {
    const fixture = createFixture(`
const unknownPermissions = loadPermissions()
const merged = { ...unknownPermissions }
export const resource = { permissions: merged }
`)

    try {
      expect(() =>
        exportReleaseConsumer({ frontendRoot: fixture.root, outputDir: fixture.outputDir })
      ).toThrow('无法静态解析权限')
    } finally {
      rmSync(fixture.root, { recursive: true, force: true })
    }
  })

  it('fails closed when a generated permission group is spread into a local permission object', () => {
    const fixture = createFixture(`
import { ADMIN_PERMISSIONS as AP } from '@/api/generated/permissions'
export const resource = { permissions: { ...AP.widget } }
`)

    try {
      expect(() =>
        exportReleaseConsumer({ frontendRoot: fixture.root, outputDir: fixture.outputDir })
      ).toThrow('整组权限 spread')
    } finally {
      rmSync(fixture.root, { recursive: true, force: true })
    }
  })

  it('does not reject an unrelated unknown computed value or spread', () => {
    const fixture = createFixture(`
const unknownValue = loadValue()
const ordinary = { ...unknownValue, [dynamicKey]: unknownValue }
export const label = ordinary.title
`)

    try {
      expect(() =>
        exportReleaseConsumer({ frontendRoot: fixture.root, outputDir: fixture.outputDir })
      ).not.toThrow()
    } finally {
      rmSync(fixture.root, { recursive: true, force: true })
    }
  })

  it('resolves unique relative re-exports by import/export facts', () => {
    const fixture = createFixture(
      `
import { permissions as pagePermissions } from './permission-barrel'
import { methods as api } from './api-barrel'
export const route = { permission: pagePermissions.widget.page }
api.aliasCall()
`,
      {
        'src/permission-barrel.ts': `export { ADMIN_PERMISSIONS as permissions } from '@/api/generated/permissions'\n`,
        'src/api-barrel.ts': `export { widgetsApiMethods as methods } from '@/api/modules/widgets'\n`
      }
    )

    try {
      const result = exportReleaseConsumer({
        frontendRoot: fixture.root,
        outputDir: fixture.outputDir
      })
      expect(result.requiredPermissions).toContain('admin:widget:list')
      expect(result.requiredOperations).toContainEqual({
        method: 'GET',
        path: '/api/v1/admin/widgets/alias-call'
      })
    } finally {
      rmSync(fixture.root, { recursive: true, force: true })
    }
  })

  it('maps a uniquely matching typed API port to its imported generated methods', () => {
    const fixture = createFixture(`
import { widgetsApiMethods as widget } from '@/api/modules/widgets'
interface WidgetPort { aliasCall(): unknown }
interface Options { api?: WidgetPort }
function run(options: Options) {
  const api = options.api ?? widget
  api.aliasCall()
}
run({})
`)

    try {
      const result = exportReleaseConsumer({
        frontendRoot: fixture.root,
        outputDir: fixture.outputDir
      })
      expect(result.requiredOperations).toContainEqual({
        method: 'GET',
        path: '/api/v1/admin/widgets/alias-call'
      })
    } finally {
      rmSync(fixture.root, { recursive: true, force: true })
    }
  })

  it('fails closed when a typed API port does not uniquely match generated facts', () => {
    const fixture = createFixture(`
import { widgetsApiMethods as widget } from '@/api/modules/widgets'
interface UnknownPort { invoke(): unknown }
interface Options { api?: UnknownPort }
function run(options: Options) {
  const api = options.api ?? widget
  api.aliasCall()
}
run({})
`)

    try {
      expect(() =>
        exportReleaseConsumer({ frontendRoot: fixture.root, outputDir: fixture.outputDir })
      ).toThrow('无法静态解析 generated method')
    } finally {
      rmSync(fixture.root, { recursive: true, force: true })
    }
  })

  it.each([
    ['generated method callback', `consume(widget.query)`, 'generated method 作为 callback'],
    [
      'HTTP client method callback',
      `import { apiClient as wire } from '@/api/client'\nconsume(wire.Post)`,
      'HTTP method 作为 callback'
    ]
  ])('fails closed when a controlled %s cannot be invoked locally', (_name, statement, message) => {
    const fixture = createFixture(`
import { widgetsApiMethods as widget } from '@/api/modules/widgets'
${statement}
`)

    try {
      expect(() =>
        exportReleaseConsumer({ frontendRoot: fixture.root, outputDir: fixture.outputDir })
      ).toThrow(message)
    } finally {
      rmSync(fixture.root, { recursive: true, force: true })
    }
  })

  it('keeps the committed output when backup cleanup fails', () => {
    const root = mkdtempSync(join(tmpdir(), 'release-consumer-publish-'))
    const outputDir = join(root, 'consumer')
    mkdirSync(outputDir)
    writeFileSync(join(outputDir, 'old.txt'), 'old\n')

    try {
      expect(() =>
        writeArtifactDirectoryAtomically(outputDir, new Map([['new.txt', 'new\n']]), {
          removeDirectory(path, options) {
            if (path.endsWith('-backup')) throw new Error('injected cleanup failure')
            rmSync(path, options)
          }
        })
      ).not.toThrow()
      expect(readFileSync(join(outputDir, 'new.txt'), 'utf8')).toBe('new\n')
      expect(existsSync(join(outputDir, 'old.txt'))).toBe(false)
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })
})
