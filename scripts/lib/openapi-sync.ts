import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { computeSha256 } from './sha256'

export const CANONICAL_OPENAPI_SNAPSHOT_PATH = 'contracts/openapi.current.json' as const
export const OPENAPI_MARKER_PATTERN = /^\/\*\* @openapi-sha256 [a-f0-9]{64} \*\/$/m

export interface ContractSyncRecord {
  backendCommit: string
  openApiSha256: string
  snapshotPath: typeof CANONICAL_OPENAPI_SNAPSHOT_PATH
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function hasExactKeys(value: Record<string, unknown>, keys: string[]): boolean {
  const actualKeys = Object.keys(value).sort()
  const expectedKeys = [...keys].sort()
  return (
    actualKeys.length === expectedKeys.length &&
    actualKeys.every((key, index) => key === expectedKeys[index])
  )
}

export function validateOpenApiDocument(
  document: unknown
): asserts document is Record<string, unknown> {
  if (
    !isObject(document) ||
    typeof document.openapi !== 'string' ||
    !/^3\.\d+\.\d+$/.test(document.openapi)
  ) {
    throw new Error('契约快照必须是 OpenAPI 3 文档')
  }

  if (!isObject(document.info)) {
    throw new Error('OpenAPI 文档缺少有效 info')
  }
  if (typeof document.info.title !== 'string' || document.info.title.trim() === '') {
    throw new Error('OpenAPI 文档缺少非空 info.title')
  }
  if (typeof document.info.version !== 'string' || document.info.version.trim() === '') {
    throw new Error('OpenAPI 文档缺少非空 info.version')
  }

  if (!isObject(document.paths)) {
    throw new Error('OpenAPI 文档缺少有效 paths')
  }
}

export function serializeOpenApiDocument(document: unknown): string {
  validateOpenApiDocument(document)
  return `${JSON.stringify(document, null, 2)}\n`
}

export function parseContractSyncRecord(value: unknown): ContractSyncRecord {
  if (
    !isObject(value) ||
    !hasExactKeys(value, ['backendCommit', 'openApiSha256', 'snapshotPath'])
  ) {
    throw new Error('契约同步记录字段必须严格匹配当前格式')
  }

  if (typeof value.backendCommit !== 'string' || !/^[a-f0-9]{40}$/.test(value.backendCommit)) {
    throw new Error('契约同步记录 backendCommit 无效')
  }

  if (typeof value.openApiSha256 !== 'string' || !/^[a-f0-9]{64}$/.test(value.openApiSha256)) {
    throw new Error('契约同步记录必须包含有效 SHA-256')
  }

  if (value.snapshotPath !== CANONICAL_OPENAPI_SNAPSHOT_PATH) {
    throw new Error(`契约同步记录 snapshotPath 必须是 ${CANONICAL_OPENAPI_SNAPSHOT_PATH}`)
  }

  return {
    backendCommit: value.backendCommit,
    openApiSha256: value.openApiSha256,
    snapshotPath: value.snapshotPath
  }
}

export function readContractSyncRecord(recordPath: string): ContractSyncRecord {
  if (!existsSync(recordPath)) {
    throw new Error(`契约同步记录不存在: ${recordPath}`)
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(readFileSync(recordPath, 'utf-8'))
  } catch (error) {
    throw new Error(`契约同步记录不是有效 JSON: ${(error as Error).message}`)
  }

  return parseContractSyncRecord(parsed)
}

export function readCanonicalOpenApiSnapshot(frontendRoot: string): {
  document: Record<string, unknown>
  serialized: string
  sha256: string
} {
  const snapshotPath = resolve(frontendRoot, CANONICAL_OPENAPI_SNAPSHOT_PATH)
  if (!existsSync(snapshotPath)) {
    throw new Error(`OpenAPI 契约快照不存在: ${snapshotPath}`)
  }

  const serialized = readFileSync(snapshotPath, 'utf-8')
  let document: unknown
  try {
    document = JSON.parse(serialized)
  } catch (error) {
    throw new Error(`OpenAPI 契约快照不是有效 JSON: ${(error as Error).message}`)
  }
  validateOpenApiDocument(document)

  return { document, serialized, sha256: computeSha256(serialized) }
}

export function buildOpenApiMarker(sha256: string): string {
  if (!/^[a-f0-9]{64}$/.test(sha256)) {
    throw new Error('OpenAPI marker 必须使用有效 SHA-256')
  }
  return `/** @openapi-sha256 ${sha256} */`
}

export function readOpenApiMarker(content: string, filePath: string): string {
  const marker = content.match(OPENAPI_MARKER_PATTERN)?.[0]
  if (!marker) {
    throw new Error(`生成入口缺少 OpenAPI SHA-256 marker: ${filePath}`)
  }
  return marker.split(' ')[2]
}

const SYSTEM_OWNED_CALLBACK_PATHS = new Set([
  '/api/v1/callback/event',
  '/api/v1/callback/external',
  '/api/v1/callback/result'
])

export function isBrowserOwnedEndpoint(path: string): boolean {
  const isWmsEndpoint = path === '/api/v1/wms' || path.startsWith('/api/v1/wms/')
  return !isWmsEndpoint && !SYSTEM_OWNED_CALLBACK_PATHS.has(path)
}
