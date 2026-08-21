#!/usr/bin/env tsx

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  type ContractSyncRecord,
  isBrowserOwnedEndpoint,
  readCanonicalOpenApiSnapshot,
  readContractSyncRecord,
  readOpenApiMarker
} from './lib/openapi-sync'
import {
  assertPermissionRecordBackendCommit,
  type PermissionSyncRecord,
  readPermissionSyncRecord
} from './lib/permissions-codegen'

const SCRIPT_PATH = fileURLToPath(import.meta.url)
const FRONTEND_ROOT = resolve(dirname(SCRIPT_PATH), '..')

function requireObject(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`${label} 缺失或不是对象`)
  }
  return value as Record<string, unknown>
}

function requireSchemaProperties(
  schemas: Record<string, unknown>,
  schemaName: string
): Record<string, unknown> {
  const schema = requireObject(schemas[schemaName], `schema ${schemaName}`)
  return requireObject(schema.properties, `schema ${schemaName}.properties`)
}

function assertFields(
  schemaName: string,
  properties: Record<string, unknown>,
  required: string[],
  forbidden: string[]
): void {
  for (const field of required) {
    if (!(field in properties)) {
      throw new Error(`${schemaName} 缺少当前字段 ${field}`)
    }
  }
  for (const field of forbidden) {
    if (field in properties) {
      throw new Error(`${schemaName} 仍包含已退役字段 ${field}`)
    }
  }
}

function walkTypeScriptFiles(root: string): string[] {
  if (!existsSync(root)) {
    return []
  }
  return readdirSync(root, { withFileTypes: true }).flatMap(entry => {
    const path = join(root, entry.name)
    return entry.isDirectory() ? walkTypeScriptFiles(path) : path.endsWith('.ts') ? [path] : []
  })
}

function assertCurrentDtoContracts(schemas: Record<string, unknown>): void {
  for (const schemaName of ['WorkLineCreate', 'WorkLineResponse', 'WorkLineUpdate']) {
    assertFields(
      schemaName,
      requireSchemaProperties(schemas, schemaName),
      ['runtime_config_json', 'diagnostic_profile'],
      ['plugin_key', 'contract_version']
    )
  }

  const retiredDeviceFields = [
    'auth_token',
    'callback_path',
    'capabilities_json',
    'current_command_id',
    'device_status',
    'error_code',
    'host',
    'idempotency_ttl',
    'last_heartbeat_at',
    'maintenance_mode',
    'max_concurrent_tasks',
    'port',
    'protocol',
    'timeout',
    'vendor_type'
  ]
  for (const schemaName of ['DeviceCreate', 'DeviceResponse', 'DeviceUpdate']) {
    assertFields(
      schemaName,
      requireSchemaProperties(schemas, schemaName),
      ['device_role', 'role_index', 'upstream_device_id', 'work_line_id', 'diagnostic_profile'],
      retiredDeviceFields
    )
  }
}

export function assertCurrentPaths(paths: Record<string, unknown>): void {
  for (const path of [
    '/api/v1/workline/work_lines/{id}/plane/scene',
    '/api/v1/workline/work_lines/{id}/plane/snapshot',
    '/api/v1/wms/events',
    '/api/v1/callback/event',
    '/api/v1/callback/result'
  ]) {
    if (!(path in paths)) {
      throw new Error(`OpenAPI 缺少当前路径 ${path}`)
    }
  }

  const retiredPath = Object.keys(paths).find(
    path =>
      path === '/api/v1/workline/runtime' ||
      path.startsWith('/api/v1/workline/runtime/') ||
      path === '/api/v1/workline/plugins' ||
      path.startsWith('/api/v1/workline/plugins/') ||
      path === '/api/v1/callback/external'
  )
  if (retiredPath) {
    throw new Error(`OpenAPI 仍包含已退役路径 ${retiredPath}`)
  }
}

export function assertNoSystemOwnedPathsInModules(
  moduleSources: string,
  paths: Record<string, unknown>
): void {
  for (const systemPath of Object.keys(paths).filter(path => !isBrowserOwnedEndpoint(path))) {
    if (moduleSources.includes(systemPath)) {
      throw new Error(`浏览器 API 模块不应包含系统端点 ${systemPath}`)
    }
  }
}

function assertGeneratedArtifacts(
  openApiSha256: string,
  paths: Record<string, unknown>
): void {
  const openApiTypesPath = resolve(FRONTEND_ROOT, 'src/api/generated/openapi-types.ts')
  const zodPath = resolve(FRONTEND_ROOT, 'src/types/generated/zod-schemas.ts')
  for (const filePath of [openApiTypesPath, zodPath]) {
    const marker = readOpenApiMarker(readFileSync(filePath, 'utf-8'), filePath)
    if (marker !== openApiSha256) {
      throw new Error(`生成入口 marker 与当前 OpenAPI SHA-256 不一致: ${filePath}`)
    }
  }

  const openApiTypes = readFileSync(openApiTypesPath, 'utf-8')
  if (!openApiTypes.includes('"/api/v1/wms/events"')) {
    throw new Error('raw OpenAPI type mirror 缺少 /api/v1/wms/events')
  }

  const moduleFiles = walkTypeScriptFiles(resolve(FRONTEND_ROOT, 'src/api/modules'))
  const moduleSources = moduleFiles.map(path => readFileSync(path, 'utf-8')).join('\n')
  assertNoSystemOwnedPathsInModules(moduleSources, paths)
  if (!moduleSources.includes('/api/v1/callback/logs')) {
    throw new Error('callback 管理读取端点被错误过滤')
  }

  const generatedFiles = [
    ...walkTypeScriptFiles(resolve(FRONTEND_ROOT, 'src/api/generated')),
    ...moduleFiles,
    zodPath
  ]
  for (const filePath of generatedFiles) {
    if (
      readFileSync(filePath, 'utf-8').includes('openapi.workline-plugin-manifest-yaml-topology')
    ) {
      throw new Error(`生成物仍引用旧 OpenAPI 快照: ${filePath}`)
    }
  }
}

function assertLegacyRuntimeDoesNotReturn(): void {
  for (const removedFile of ['src/api/services/sse-client.ts', 'src/api/services/sse-session.ts']) {
    if (existsSync(resolve(FRONTEND_ROOT, removedFile))) {
      throw new Error(`已删除的 Runtime 文件被重新生成: ${removedFile}`)
    }
  }

  const maintainedSources = walkTypeScriptFiles(resolve(FRONTEND_ROOT, 'src/api/modules'))
    .map(path => readFileSync(path, 'utf-8'))
    .join('\n')
  for (const removedSymbol of ['RuntimeHoldNgReasonsQuery', 'runtimeHoldApiMethods']) {
    if (maintainedSources.includes(removedSymbol)) {
      throw new Error(`已删除的 Runtime symbol 被重新生成: ${removedSymbol}`)
    }
  }
}

export function assertPermissionRecordMatchesContract(
  contractRecord: ContractSyncRecord,
  permissionRecordPath: string
): PermissionSyncRecord {
  return assertPermissionRecordBackendCommit(
    readPermissionSyncRecord(permissionRecordPath),
    contractRecord.backendCommit
  )
}

function main(): void {
  const record = readContractSyncRecord(resolve(FRONTEND_ROOT, '.contract-sync-record.json'))
  const snapshot = readCanonicalOpenApiSnapshot(FRONTEND_ROOT)
  const components = requireObject(snapshot.document.components, 'OpenAPI components')
  const schemas = requireObject(components.schemas, 'OpenAPI components.schemas')
  const paths = requireObject(snapshot.document.paths, 'OpenAPI paths')

  assertCurrentDtoContracts(schemas)
  assertCurrentPaths(paths)
  assertGeneratedArtifacts(record.openApiSha256, paths)
  assertLegacyRuntimeDoesNotReturn()

  assertPermissionRecordMatchesContract(
    record,
    resolve(FRONTEND_ROOT, '.permission-sync-record.json')
  )

  console.log('✅ 当前 OpenAPI、浏览器端点所有权与生成物不变量检查通过')
}

if (process.argv[1] && resolve(process.argv[1]) === SCRIPT_PATH) {
  try {
    main()
  } catch (error) {
    console.error(`❌ 契约测试失败: ${(error as Error).message}`)
    process.exit(1)
  }
}
