import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  unlinkSync,
  writeFileSync
} from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { computeSha256 } from './sha256'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export const FRONTEND_ROOT = resolve(__dirname, '../..')
export const PERMISSIONS_OUTPUT_DIR = resolve(FRONTEND_ROOT, 'src/api/generated/permissions')
export const PERMISSIONS_INDEX_FILE = resolve(PERMISSIONS_OUTPUT_DIR, 'index.ts')
export const PERMISSION_SYNC_RECORD_FILE = resolve(FRONTEND_ROOT, '.permission-sync-record.json')
export const CANONICAL_PERMISSIONS_SNAPSHOT_PATH = 'contracts/permissions.current.json' as const
export const PROVIDED_PERMISSIONS_KIND = 'wes.release.provided-permissions.v1' as const
export const GENERATE_PERMISSIONS_COMMAND = 'pnpm generate:permissions'

export interface PermissionRecord {
  name: string
  type: string
  category: string | null
  description: string | null
  resource: string | null
  action: string | null
  method: string | null
  path: string | null
}

export interface PermissionGroup {
  key: string
  category: string
  resource: string
  type: string
  constName: string
  relativeFilePath: string
  permissions: PermissionRecord[]
}

export interface PermissionSyncRecord {
  backendCommit: string
  permissionsSha256: string
  permissionCount: number
}

const ACTION_ORDER = [
  'list',
  'view',
  'detail',
  'create',
  'update',
  'delete',
  'restore',
  'trash',
  'bulk_delete',
  'batch_restore',
  'batch_permanent_delete'
]

const ACTION_COMMENT_MAP: Record<string, string> = {
  list: '列表查询权限',
  view: '视图访问权限',
  detail: '详情查看权限',
  create: '创建权限',
  update: '更新权限',
  delete: '删除权限',
  restore: '恢复权限',
  trash: '回收站权限',
  bulk_delete: '批量删除权限',
  batch_restore: '批量恢复权限',
  batch_permanent_delete: '批量永久删除权限'
}

export function ensureDir(path: string): void {
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true })
  }
}

const PERMISSION_FIELDS = [
  'action',
  'category',
  'description',
  'method',
  'name',
  'path',
  'resource',
  'type'
] as const

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0
}

function comparePermissionProviderOrder(left: PermissionRecord, right: PermissionRecord): number {
  for (const field of ['name', 'type', 'method', 'path'] as const) {
    const comparison = compareText(left[field] ?? '', right[field] ?? '')
    if (comparison !== 0) {
      return comparison
    }
  }
  return 0
}

export function normalizePermissions(value: unknown): PermissionRecord[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error('权限快照 permissions 必须是非空数组')
  }

  const names = new Set<string>()
  const normalized = value.map((candidate, index) => {
    if (!isObject(candidate)) {
      throw new Error(`权限快照 permissions[${index}] 必须是对象`)
    }
    const keys = Object.keys(candidate).sort()
    if (
      keys.length !== PERMISSION_FIELDS.length ||
      !keys.every((key, keyIndex) => key === PERMISSION_FIELDS[keyIndex])
    ) {
      throw new Error(`权限快照 permissions[${index}] 字段必须严格匹配当前格式`)
    }
    for (const field of PERMISSION_FIELDS) {
      const fieldValue = candidate[field]
      if (typeof fieldValue !== 'string' || fieldValue.trim() === '') {
        throw new Error(`权限快照 permissions[${index}].${field} 必须是非空字符串`)
      }
    }
    const name = candidate.name as string
    if (names.has(name)) {
      throw new Error(`权限快照包含重复权限名: ${name}`)
    }
    names.add(name)
    return {
      action: candidate.action as string,
      category: candidate.category as string,
      description: candidate.description as string,
      method: candidate.method as string,
      name,
      path: candidate.path as string,
      resource: candidate.resource as string,
      type: candidate.type as string
    }
  })

  return normalized.sort(comparePermissionProviderOrder)
}

export function serializePermissionSnapshot(permissions: unknown): string {
  return `${JSON.stringify({
    kind: PROVIDED_PERMISSIONS_KIND,
    permissions: normalizePermissions(permissions)
  })}\n`
}

export function parseCanonicalPermissionSnapshot(serialized: string): {
  permissions: PermissionRecord[]
  serialized: string
  sha256: string
} {
  let parsed: unknown
  try {
    parsed = JSON.parse(serialized)
  } catch (error) {
    throw new Error(`权限快照不是有效 JSON: ${(error as Error).message}`)
  }
  if (!isObject(parsed) || Object.keys(parsed).join(',') !== 'kind,permissions') {
    throw new Error('权限快照字段与顺序必须严格匹配 kind,permissions')
  }
  if (parsed.kind !== PROVIDED_PERMISSIONS_KIND) {
    throw new Error(`权限快照 kind 必须是 ${PROVIDED_PERMISSIONS_KIND}`)
  }
  const permissions = normalizePermissions(parsed.permissions)
  const canonical = serializePermissionSnapshot(permissions)
  if (serialized !== canonical) {
    throw new Error('权限快照未使用 canonical JSON 字段顺序或序列化')
  }
  return { permissions, serialized, sha256: computeSha256(canonical) }
}

export function readCanonicalPermissionSnapshot(frontendRoot: string = FRONTEND_ROOT): {
  permissions: PermissionRecord[]
  serialized: string
  sha256: string
} {
  const snapshotPath = resolve(frontendRoot, CANONICAL_PERMISSIONS_SNAPSHOT_PATH)
  if (!existsSync(snapshotPath)) {
    throw new Error(`权限快照不存在: ${snapshotPath}`)
  }
  const serialized = readFileSync(snapshotPath, 'utf-8')
  return parseCanonicalPermissionSnapshot(serialized)
}

function splitWords(value: string): string[] {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .split(/[^a-zA-Z0-9]+/)
    .map(segment => segment.trim())
    .filter(Boolean)
}

function toCamelCase(value: string): string {
  const words = splitWords(value)
  const [first, ...rest] = words

  if (!first) {
    return value
  }

  return (
    first.toLowerCase() +
    rest.map(segment => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase()).join('')
  )
}

function toPascalCase(value: string): string {
  return splitWords(value)
    .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())
    .join('')
}

function toUpperSnakeCase(value: string): string {
  return splitWords(value)
    .map(segment => segment.toUpperCase())
    .join('_')
}

function normalizePathSegment(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]+/g, '-')
}

function sortPermissions(permissions: PermissionRecord[]): PermissionRecord[] {
  return [...permissions].sort((left, right) => {
    const leftIndex = ACTION_ORDER.indexOf(left.action ?? '')
    const rightIndex = ACTION_ORDER.indexOf(right.action ?? '')
    const normalizedLeft = leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex
    const normalizedRight = rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex

    if (normalizedLeft !== normalizedRight) {
      return normalizedLeft - normalizedRight
    }

    return (left.action ?? '').localeCompare(right.action ?? '')
  })
}

function buildConstName(category: string, resource: string, usedNames: Set<string>): string {
  const namespace = `${toUpperSnakeCase(category)}_${toUpperSnakeCase(resource)}`
  const baseName = namespace.endsWith('_PERMISSION') ? namespace : `${namespace}_PERMISSION`

  if (!usedNames.has(baseName)) {
    usedNames.add(baseName)
    return baseName
  }

  let suffix = 2
  while (usedNames.has(`${baseName}_${suffix}`)) {
    suffix += 1
  }

  const uniqueName = `${baseName}_${suffix}`
  usedNames.add(uniqueName)
  return uniqueName
}

export function groupPermissions(allPermissions: PermissionRecord[]): PermissionGroup[] {
  const grouped = new Map<string, PermissionRecord[]>()

  for (const permission of allPermissions) {
    if (!permission.category || !permission.resource) {
      continue
    }

    const key = `${permission.type}:${permission.category}:${permission.resource}`
    const current = grouped.get(key)
    if (current) {
      current.push(permission)
    } else {
      grouped.set(key, [permission])
    }
  }

  const usedNames = new Set<string>()

  return [...grouped.entries()]
    .map(([key, permissions]) => {
      const [type, category, resource] = key.split(':')

      return {
        key,
        category,
        resource,
        type,
        constName: buildConstName(category, resource, usedNames),
        relativeFilePath: `${normalizePathSegment(type)}/${normalizePathSegment(category)}/${normalizePathSegment(resource)}.ts`,
        permissions: sortPermissions(permissions)
      }
    })
    .sort((left, right) => left.key.localeCompare(right.key))
}

function escapeComment(value: string): string {
  return value.replace(/\*\//g, '* /')
}

function getActionComment(permission: PermissionRecord): string {
  const action = permission.action ?? ''
  return ACTION_COMMENT_MAP[action] || permission.description || `${action} 权限`
}

export function buildPermissionFileContent(group: PermissionGroup): string {
  const lines: string[] = [
    '/**',
    ' * 自动生成的权限常量定义',
    ' *',
    ' * ⚠️ 请勿手动编辑此文件',
    ' * 此文件由 scripts/generate-permissions.ts 自动生成',
    ' *',
    ` * 权限分组: ${group.key}`,
    ' *',
    ` * 更新权限: ${GENERATE_PERMISSIONS_COMMAND}`,
    ' */',
    '',
    `export const ${group.constName} = {`
  ]

  const pagePermission =
    group.permissions.find(permission => permission.action === 'list') ||
    group.permissions.find(permission => permission.action === 'view')

  if (pagePermission) {
    lines.push('  /** 页面访问权限 */')
    lines.push(`  page: '${pagePermission.name}',`)
  }

  for (const permission of group.permissions) {
    const action = permission.action
    if (!action) {
      continue
    }

    lines.push(`  /** ${escapeComment(getActionComment(permission))} */`)
    lines.push(`  ${toCamelCase(action)}: '${permission.name}',`)
  }

  lines.push('} as const', '')
  return lines.join('\n')
}

export function buildPermissionsIndexContent(groups: PermissionGroup[]): string {
  const lines: string[] = [
    '/**',
    ' * 自动生成的权限常量导出入口',
    ' *',
    ' * ⚠️ 请勿手动编辑此文件',
    ' * 此文件由 scripts/generate-permissions.ts 自动生成',
    ' *',
    ' */',
    ''
  ]

  for (const group of groups) {
    const importPath = `./${group.relativeFilePath.replace(/\.ts$/, '')}`
    lines.push(`import { ${group.constName} } from '${importPath}'`)
  }

  lines.push('', '')

  for (const group of groups) {
    lines.push(`export { ${group.constName} }`)
  }

  const categoryGroups = new Map<string, PermissionGroup[]>()
  for (const group of groups) {
    const current = categoryGroups.get(group.category)
    if (current) {
      current.push(group)
    } else {
      categoryGroups.set(group.category, [group])
    }
  }

  for (const [category, categoryPermissionGroups] of [...categoryGroups.entries()].sort(
    (left, right) => left[0].localeCompare(right[0])
  )) {
    const usedProps = new Set<string>()
    const categoryConstName = `${toUpperSnakeCase(category)}_PERMISSIONS`

    lines.push(
      '',
      '/**',
      ` * ${category} 分类权限快捷导出`,
      ' */',
      `export const ${categoryConstName} = {`
    )

    for (const group of categoryPermissionGroups.sort((left, right) =>
      left.resource.localeCompare(right.resource)
    )) {
      let resourceProp = toCamelCase(group.resource)
      if (usedProps.has(resourceProp)) {
        resourceProp = `${resourceProp}${toPascalCase(group.type)}`
      }
      usedProps.add(resourceProp)
      lines.push(`  ${resourceProp}: ${group.constName},`)
    }

    lines.push('} as const')
  }

  lines.push('', '/**', ' * 全量权限快捷导出', ' */', 'export const PERMISSIONS = {')

  for (const category of [...categoryGroups.keys()].sort((left, right) =>
    left.localeCompare(right)
  )) {
    lines.push(`  ${toCamelCase(category)}: ${toUpperSnakeCase(category)}_PERMISSIONS,`)
  }

  lines.push('} as const', '')
  return lines.join('\n')
}

export function resetPermissionsOutput(): void {
  rmSync(PERMISSIONS_OUTPUT_DIR, { recursive: true, force: true })
  ensureDir(PERMISSIONS_OUTPUT_DIR)
}

function walkFiles(dirPath: string): string[] {
  if (!existsSync(dirPath)) {
    return []
  }

  const entries = readdirSync(dirPath, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    const fullPath = resolve(dirPath, entry.name)
    if (entry.isDirectory()) {
      files.push(...walkFiles(fullPath))
      continue
    }

    if (entry.isFile()) {
      files.push(fullPath)
    }
  }

  return files.sort()
}

export function listGeneratedPermissionFiles(): string[] {
  return walkFiles(PERMISSIONS_OUTPUT_DIR)
}

export function assertGeneratedPermissionFiles(
  permissions: PermissionRecord[],
  outputDir: string = PERMISSIONS_OUTPUT_DIR
): void {
  const groups = groupPermissions(permissions)
  const expectedFiles = new Map<string, string>([
    ...groups.map(group => [group.relativeFilePath, buildPermissionFileContent(group)] as const),
    ['index.ts', buildPermissionsIndexContent(groups)]
  ])
  const actualFiles = walkFiles(outputDir)

  if (
    actualFiles.length !== expectedFiles.size ||
    actualFiles.some(filePath => {
      const expectedContent = expectedFiles.get(relative(outputDir, filePath))
      return expectedContent === undefined || readFileSync(filePath, 'utf-8') !== expectedContent
    })
  ) {
    throw new Error(`生成权限文件与权限快照不一致，请重新运行 ${GENERATE_PERMISSIONS_COMMAND}`)
  }
}

export function writeFileIfChanged(outputPath: string, content: string): boolean {
  const previous = existsSync(outputPath) ? readFileSync(outputPath, 'utf-8') : null
  if (previous === content) {
    return false
  }

  ensureDir(dirname(outputPath))
  writeFileSync(outputPath, content, 'utf-8')
  return true
}

export function writePermissionGroupFile(group: PermissionGroup, content: string): boolean {
  const outputPath = resolve(PERMISSIONS_OUTPUT_DIR, group.relativeFilePath)
  return writeFileIfChanged(outputPath, content)
}

export function writePermissionsIndex(content: string): boolean {
  ensureDir(PERMISSIONS_OUTPUT_DIR)
  return writeFileIfChanged(PERMISSIONS_INDEX_FILE, content)
}

export function removeStalePermissionFiles(expectedFiles: string[]): string[] {
  const expected = new Set(expectedFiles)
  const staleFiles = listGeneratedPermissionFiles().filter(filePath => !expected.has(filePath))

  for (const filePath of staleFiles) {
    unlinkSync(filePath)
  }

  return staleFiles
}

export function computePermissionsHash(permissions: PermissionRecord[]): string {
  return computeSha256(serializePermissionSnapshot(permissions))
}

function isExactPermissionSyncRecord(value: unknown): value is PermissionSyncRecord {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false
  }

  const record = value as Record<string, unknown>
  const keys = Object.keys(record).sort()
  const expectedKeys = ['backendCommit', 'permissionCount', 'permissionsSha256']
  return (
    keys.length === expectedKeys.length &&
    keys.every((key, index) => key === expectedKeys[index]) &&
    typeof record.backendCommit === 'string' &&
    /^[a-f0-9]{40}$/.test(record.backendCommit) &&
    typeof record.permissionsSha256 === 'string' &&
    /^[a-f0-9]{64}$/.test(record.permissionsSha256) &&
    typeof record.permissionCount === 'number' &&
    Number.isInteger(record.permissionCount) &&
    record.permissionCount >= 0
  )
}

export function readPermissionSyncRecord(
  recordPath: string = PERMISSION_SYNC_RECORD_FILE
): PermissionSyncRecord | null {
  if (!existsSync(recordPath)) {
    return null
  }

  try {
    const record: unknown = JSON.parse(readFileSync(recordPath, 'utf-8'))
    return isExactPermissionSyncRecord(record) ? record : null
  } catch {
    return null
  }
}

export function assertPermissionRecordBackendCommit(
  record: PermissionSyncRecord | null,
  backendCommit: string
): PermissionSyncRecord {
  if (!record) {
    throw new Error('权限同步记录缺失或格式无效')
  }
  if (record.backendCommit !== backendCommit) {
    throw new Error(
      `权限同步记录 backend commit 不匹配：记录 ${record.backendCommit}，当前 ${backendCommit}`
    )
  }
  return record
}
