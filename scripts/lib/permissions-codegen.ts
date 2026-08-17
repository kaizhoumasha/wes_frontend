import { execFileSync } from 'node:child_process'
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  unlinkSync,
  writeFileSync
} from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { writeFileAtomically } from './atomic-file'
import { computeSha256 } from './sha256'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export const FRONTEND_ROOT = resolve(__dirname, '../..')
export const DEFAULT_BACKEND_ROOT = resolve(FRONTEND_ROOT, '../wes_backend')
export const PERMISSIONS_OUTPUT_DIR = resolve(FRONTEND_ROOT, 'src/api/generated/permissions')
export const PERMISSIONS_INDEX_FILE = resolve(PERMISSIONS_OUTPUT_DIR, 'index.ts')
export const PERMISSION_SYNC_RECORD_FILE = resolve(FRONTEND_ROOT, '.permission-sync-record.json')
export const UV_CACHE_DIR = resolve(FRONTEND_ROOT, 'node_modules/.cache/uv')

const JSON_START_MARKER = '__PERMISSIONS_JSON_START__'
const JSON_END_MARKER = '__PERMISSIONS_JSON_END__'
const GENERATE_COMMAND = 'pnpm generate:permissions'

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

function extractJsonPayload(rawOutput: string): PermissionRecord[] {
  const startIndex = rawOutput.indexOf(JSON_START_MARKER)
  const endIndex = rawOutput.indexOf(JSON_END_MARKER)

  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
    throw new Error('未能从后端扫描输出中提取权限 JSON，请检查后端日志或脚本实现')
  }

  const payload = rawOutput.slice(startIndex + JSON_START_MARKER.length, endIndex).trim()
  return JSON.parse(payload) as PermissionRecord[]
}

export function scanBackendPermissions(backendRoot: string): PermissionRecord[] {
  if (!existsSync(backendRoot)) {
    throw new Error(`后端目录不存在: ${backendRoot}`)
  }

  const pythonCode = `
import json

from src.register import create_app
from src.utils.permission_scanner import scan_routes_for_permissions

app = create_app()

print("${JSON_START_MARKER}")
print(json.dumps(scan_routes_for_permissions(app), ensure_ascii=False))
print("${JSON_END_MARKER}")
`

  try {
    ensureDir(UV_CACHE_DIR)

    const stdout = execFileSync('uv', ['run', 'python', '-c', pythonCode], {
      cwd: backendRoot,
      env: {
        ...process.env,
        PYTHONPATH: '.',
        UV_CACHE_DIR
      },
      encoding: 'utf-8'
    })

    return extractJsonPayload(stdout)
  } catch (error) {
    const cause = error as NodeJS.ErrnoException & {
      stdout?: string | Buffer
      stderr?: string | Buffer
    }
    const stderr =
      typeof cause.stderr === 'string'
        ? cause.stderr.trim()
        : cause.stderr?.toString('utf-8').trim()
    const stdout =
      typeof cause.stdout === 'string'
        ? cause.stdout.trim()
        : cause.stdout?.toString('utf-8').trim()
    const details = [stderr, stdout].filter(Boolean).join('\n')

    throw new Error(
      [
        `后端权限扫描失败，请确认后端依赖已安装且可执行: ${backendRoot}`,
        details || '未获取到额外错误信息'
      ].join('\n')
    )
  }
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
    ` * 更新权限: ${GENERATE_COMMAND}`,
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
  const normalized = [...permissions]
    .sort((left, right) => left.name.localeCompare(right.name))
    .map(permission => ({
      name: permission.name,
      type: permission.type,
      category: permission.category,
      description: permission.description,
      resource: permission.resource,
      action: permission.action,
      method: permission.method,
      path: permission.path
    }))

  return computeSha256(JSON.stringify(normalized))
}

export function writePermissionSyncRecord(record: PermissionSyncRecord): void {
  const content = `${JSON.stringify(record, null, 2)}\n`
  if (
    !existsSync(PERMISSION_SYNC_RECORD_FILE) ||
    readFileSync(PERMISSION_SYNC_RECORD_FILE, 'utf-8') !== content
  ) {
    writeFileAtomically(PERMISSION_SYNC_RECORD_FILE, content)
  }
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
