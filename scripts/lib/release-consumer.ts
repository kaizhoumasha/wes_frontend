import { createHash } from 'node:crypto'
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync
} from 'node:fs'
import { dirname, extname, join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse as parseVueSfc } from 'vue/compiler-sfc'
import ts from 'typescript'
import { buildGeneratedMethodCatalog, type HttpMethod } from '../generate-api-types'
import { readCanonicalOpenApiSnapshot, validateOpenApiDocument } from './openapi-sync'
import { readCanonicalPermissionSnapshot, type PermissionRecord } from './permissions-codegen'

const REQUIRED_OPERATIONS_KIND = 'wes.release.required-operations.v1' as const
const REQUIRED_PERMISSIONS_KIND = 'wes.release.required-permissions.v1' as const
const FRONTEND_FINGERPRINTS_KIND = 'wes.release.frontend-fingerprints.v1' as const

type UpperHttpMethod = Uppercase<HttpMethod>

export interface RequiredOperation {
  method: UpperHttpMethod
  path: string
}

export interface ConsumerFingerprints {
  consumer_openapi_sha256: string
  dependencies_sha256: string
  kind: typeof FRONTEND_FINGERPRINTS_KIND
  recipe_sha256: string
  required_operations_sha256: string
  required_permissions_sha256: string
}

export interface ReleaseImageIdentity {
  revision: string | undefined
  sourceTree: string | undefined
}

export interface ReleaseConsumerResult {
  requiredOperations: RequiredOperation[]
  requiredPermissions: string[]
  fingerprints: ConsumerFingerprints
}

export interface ExportReleaseConsumerOptions {
  frontendRoot?: string
  outputDir?: string
}

interface StaticObject {
  kind: 'object'
  origin: 'generated-permission' | 'unresolved-permission' | 'local'
  properties: Map<string, StaticValue>
  containsGeneratedPermissionSpread: boolean
  unknownSpread: boolean
}

interface StaticArray {
  kind: 'array'
  values: StaticValue[]
  unknownSpread: boolean
}

interface ApiObject {
  kind: 'api-object'
  methods: Map<string, RequiredOperation>
}

interface ApiMethod {
  kind: 'api-method'
  operation: RequiredOperation
}

interface HttpClient {
  kind: 'http-client'
}

interface HttpClientMethod {
  kind: 'http-client-method'
  method: UpperHttpMethod | 'request'
}

interface UnknownValue {
  kind: 'unknown'
}

interface UnionValue {
  kind: 'union'
  values: StaticValue[]
}

type StaticValue =
  | string
  | StaticObject
  | StaticArray
  | ApiObject
  | ApiMethod
  | HttpClient
  | HttpClientMethod
  | UnknownValue
  | UnionValue
type StaticEnvironment = Map<string, StaticValue>

const UNKNOWN: UnknownValue = { kind: 'unknown' }
const HTTP_CLIENT: HttpClient = { kind: 'http-client' }

const HTTP_METHODS: Readonly<Record<string, UpperHttpMethod>> = {
  Get: 'GET',
  Post: 'POST',
  Put: 'PUT',
  Patch: 'PATCH',
  Delete: 'DELETE',
  get: 'GET',
  post: 'POST',
  put: 'PUT',
  patch: 'PATCH',
  delete: 'DELETE'
}

interface AnalysisState {
  operations: Map<string, RequiredOperation>
  permissionNames: Set<string>
  permissionRecords: ReadonlyMap<string, PermissionRecord>
  openApiDocument: Record<string, unknown>
}

function compareCodePoint(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0
}

function sha256(value: string | Buffer): string {
  return createHash('sha256').update(value).digest('hex')
}

function canonicalJson(value: unknown): string {
  return `${JSON.stringify(value)}\n`
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function hasExactKeys(value: Record<string, unknown>, keys: string[]): boolean {
  return Object.keys(value).join(',') === keys.join(',')
}

function parseArtifactJson(serialized: string, label: string): unknown {
  if (serialized.length === 0) throw new Error(`${label} 不能为空`)
  try {
    return JSON.parse(serialized)
  } catch (error) {
    throw new Error(`${label} 不是有效 JSON: ${(error as Error).message}`)
  }
}

export function validateReleaseConsumerArtifacts(
  artifactDir: string,
  expected?: ConsumerFingerprints,
  identity?: ReleaseImageIdentity
): ConsumerFingerprints {
  if (
    identity &&
    (!identity.revision ||
      !/^[0-9a-f]{40}$/.test(identity.revision) ||
      !identity.sourceTree ||
      !/^[0-9a-f]{40}$/.test(identity.sourceTree))
  ) {
    throw new Error('镜像 Git 身份必须是 40 位 lowercase hex')
  }
  const expectedNames = [
    'consumer-fingerprints.json',
    'consumer-openapi.json',
    'required-operations.json',
    'required-permissions.json'
  ]
  const actualNames = readdirSync(artifactDir).sort(compareCodePoint)
  if (actualNames.join(',') !== expectedNames.join(',')) {
    throw new Error('consumer 产物目录必须且只能包含四个 exporter 文件')
  }
  const read = (name: string): string => readFileSync(join(artifactDir, name), 'utf8')
  const openapiSerialized = read('consumer-openapi.json')
  const operationsSerialized = read('required-operations.json')
  const permissionsSerialized = read('required-permissions.json')
  const fingerprintsSerialized = read('consumer-fingerprints.json')

  const openapi = parseArtifactJson(openapiSerialized, 'consumer OpenAPI')
  validateOpenApiDocument(openapi)

  const operationsValue = parseArtifactJson(operationsSerialized, 'required operations')
  if (
    !isRecord(operationsValue) ||
    !hasExactKeys(operationsValue, ['kind', 'operations']) ||
    operationsValue.kind !== REQUIRED_OPERATIONS_KIND ||
    !Array.isArray(operationsValue.operations)
  ) {
    throw new Error('required operations schema 无效')
  }
  const operations: RequiredOperation[] = operationsValue.operations.map(value => {
    if (
      !isRecord(value) ||
      !hasExactKeys(value, ['method', 'path']) ||
      typeof value.method !== 'string' ||
      !['DELETE', 'GET', 'PATCH', 'POST', 'PUT'].includes(value.method) ||
      typeof value.path !== 'string' ||
      value.path.length === 0
    ) {
      throw new Error('required operation 条目无效')
    }
    return { method: value.method as UpperHttpMethod, path: value.path }
  })
  const sortedOperations = [...operations].sort(
    (left, right) =>
      compareCodePoint(left.path, right.path) || compareCodePoint(left.method, right.method)
  )
  if (
    operations.some(
      (operation, index) =>
        operation.path !== sortedOperations[index]?.path ||
        operation.method !== sortedOperations[index]?.method ||
        (index > 0 &&
          operation.path === operations[index - 1]?.path &&
          operation.method === operations[index - 1]?.method)
    ) ||
    operationsSerialized !== canonicalJson(operationsValue)
  ) {
    throw new Error('required operations 必须规范排序、唯一并使用 canonical JSON')
  }

  const permissionsValue = parseArtifactJson(permissionsSerialized, 'required permissions')
  if (
    !isRecord(permissionsValue) ||
    !hasExactKeys(permissionsValue, ['kind', 'permissions']) ||
    permissionsValue.kind !== REQUIRED_PERMISSIONS_KIND ||
    !Array.isArray(permissionsValue.permissions) ||
    permissionsValue.permissions.some(
      value => typeof value !== 'string' || value.length === 0 || value === '*'
    )
  ) {
    throw new Error('required permissions schema 无效')
  }
  const permissions = permissionsValue.permissions as string[]
  const sortedPermissions = [...permissions].sort(compareCodePoint)
  if (
    permissions.some(
      (permission, index) =>
        permission !== sortedPermissions[index] || permission === permissions[index - 1]
    ) ||
    permissionsSerialized !== canonicalJson(permissionsValue)
  ) {
    throw new Error('required permissions 必须规范排序、唯一并使用 canonical JSON')
  }

  const fingerprintsValue = parseArtifactJson(fingerprintsSerialized, 'consumer fingerprints')
  const fingerprintKeys = [
    'consumer_openapi_sha256',
    'dependencies_sha256',
    'kind',
    'recipe_sha256',
    'required_operations_sha256',
    'required_permissions_sha256'
  ]
  if (
    !isRecord(fingerprintsValue) ||
    !hasExactKeys(fingerprintsValue, fingerprintKeys) ||
    fingerprintsValue.kind !== FRONTEND_FINGERPRINTS_KIND ||
    fingerprintKeys
      .filter(key => key.endsWith('_sha256'))
      .some(
        key =>
          typeof fingerprintsValue[key] !== 'string' ||
          !/^[0-9a-f]{64}$/.test(fingerprintsValue[key])
      ) ||
    fingerprintsSerialized !== canonicalJson(fingerprintsValue)
  ) {
    throw new Error('consumer fingerprints schema 无效')
  }
  const fingerprints = fingerprintsValue as unknown as ConsumerFingerprints
  if (
    fingerprints.consumer_openapi_sha256 !== sha256(openapiSerialized) ||
    fingerprints.required_operations_sha256 !== sha256(operationsSerialized) ||
    fingerprints.required_permissions_sha256 !== sha256(permissionsSerialized)
  ) {
    throw new Error('consumer raw bytes 指纹不匹配')
  }
  if (expected && JSON.stringify(fingerprints) !== JSON.stringify(expected)) {
    throw new Error('镜像 label 输入与 consumer exporter 指纹不一致')
  }
  return fingerprints
}

function sourceLocation(node: ts.Node, sourceFile: ts.SourceFile): string {
  const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile))
  return `${sourceFile.fileName}:${line + 1}:${character + 1}`
}

function unwrapExpression(expression: ts.Expression): ts.Expression {
  let current = expression
  while (
    ts.isParenthesizedExpression(current) ||
    ts.isAsExpression(current) ||
    ts.isTypeAssertionExpression(current) ||
    ts.isSatisfiesExpression(current) ||
    ts.isNonNullExpression(current) ||
    ts.isAwaitExpression(current)
  ) {
    current = current.expression
  }
  return current
}

function staticPropertyName(name: ts.PropertyName | ts.Expression): string | undefined {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) {
    return name.text
  }
  if (ts.isComputedPropertyName(name)) {
    return staticPropertyName(name.expression)
  }
  return undefined
}

function unionValues(values: StaticValue[]): StaticValue {
  const flattened = values.flatMap(value => (value.kind === 'union' ? value.values : [value]))
  return flattened.length === 1 ? flattened[0]! : { kind: 'union', values: flattened }
}

function readStaticProperty(
  base: StaticValue,
  key: StaticValue,
  expression: ts.Expression,
  sourceFile: ts.SourceFile
): StaticValue {
  if (base.kind === 'union') {
    return unionValues(
      base.values.map(value => readStaticProperty(value, key, expression, sourceFile))
    )
  }
  if (base.kind === 'unknown') return UNKNOWN
  if (base.kind === 'http-client') {
    if (typeof key !== 'string') {
      throw new Error(`动态 HTTP method: ${sourceLocation(expression, sourceFile)}`)
    }
    if (key === 'request') return { kind: 'http-client-method', method: 'request' }
    const method = HTTP_METHODS[key]
    return method ? { kind: 'http-client-method', method } : UNKNOWN
  }
  if (base.kind !== 'object' && base.kind !== 'api-object') return UNKNOWN
  if (typeof key !== 'string') {
    if (base.kind === 'api-object') {
      throw new Error(`动态 generated method: ${sourceLocation(expression, sourceFile)}`)
    }
    if (base.origin === 'generated-permission') {
      throw new Error(`动态权限: ${sourceLocation(expression, sourceFile)}`)
    }
    return UNKNOWN
  }
  if (base.kind === 'api-object') {
    const operation = base.methods.get(key)
    if (!operation) {
      throw new Error(`未知 generated method ${key}: ${sourceLocation(expression, sourceFile)}`)
    }
    return { kind: 'api-method', operation }
  }
  const value = base.properties.get(key)
  if (value === undefined && base.origin === 'unresolved-permission') return base
  if (value === undefined && base.origin === 'generated-permission') {
    throw new Error(`未知权限 leaf ${key}: ${sourceLocation(expression, sourceFile)}`)
  }
  return value ?? UNKNOWN
}

function evaluateExpression(
  rawExpression: ts.Expression,
  environment: StaticEnvironment,
  sourceFile: ts.SourceFile,
  objectOrigin: StaticObject['origin'] = 'local'
): StaticValue {
  const expression = unwrapExpression(rawExpression)

  if (ts.isStringLiteral(expression) || ts.isNoSubstitutionTemplateLiteral(expression)) {
    return expression.text
  }
  if (ts.isIdentifier(expression)) {
    return environment.get(expression.text) ?? UNKNOWN
  }
  if (ts.isArrayLiteralExpression(expression)) {
    const values: StaticValue[] = []
    let unknownSpread = false
    for (const element of expression.elements) {
      if (!ts.isSpreadElement(element)) {
        values.push(evaluateExpression(element, environment, sourceFile, objectOrigin))
        continue
      }
      const spread = evaluateExpression(element.expression, environment, sourceFile, objectOrigin)
      if (spread.kind === 'array') {
        values.push(...spread.values)
        unknownSpread ||= spread.unknownSpread
      } else {
        unknownSpread = true
      }
    }
    return {
      kind: 'array',
      values,
      unknownSpread
    }
  }
  if (ts.isObjectLiteralExpression(expression)) {
    const properties = new Map<string, StaticValue>()
    let containsGeneratedPermissionSpread = false
    let unknownSpread = false
    for (const property of expression.properties) {
      if (ts.isSpreadAssignment(property)) {
        const spread = evaluateExpression(
          property.expression,
          environment,
          sourceFile,
          objectOrigin
        )
        if (spread && spread.kind === 'object') {
          for (const [key, value] of spread.properties) properties.set(key, value)
          containsGeneratedPermissionSpread ||=
            spread.origin === 'generated-permission' || spread.containsGeneratedPermissionSpread
          unknownSpread ||= spread.unknownSpread
        } else {
          unknownSpread = true
        }
        continue
      }
      if (ts.isPropertyAssignment(property)) {
        const key = staticPropertyName(property.name)
        const value = evaluateExpression(
          property.initializer,
          environment,
          sourceFile,
          objectOrigin
        )
        if (key !== undefined) properties.set(key, value)
        else unknownSpread = true
        continue
      }
      if (ts.isShorthandPropertyAssignment(property)) {
        properties.set(property.name.text, environment.get(property.name.text) ?? UNKNOWN)
      }
    }
    return {
      kind: 'object',
      origin: objectOrigin,
      properties,
      containsGeneratedPermissionSpread,
      unknownSpread
    }
  }
  if (ts.isPropertyAccessExpression(expression) || ts.isElementAccessExpression(expression)) {
    const base = evaluateExpression(expression.expression, environment, sourceFile, objectOrigin)
    const key = ts.isPropertyAccessExpression(expression)
      ? expression.name.text
      : expression.argumentExpression
        ? evaluateExpression(expression.argumentExpression, environment, sourceFile, objectOrigin)
        : UNKNOWN
    return readStaticProperty(base, key, expression, sourceFile)
  }
  if (
    ts.isBinaryExpression(expression) &&
    (expression.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken ||
      expression.operatorToken.kind === ts.SyntaxKind.BarBarToken)
  ) {
    return unionValues([
      evaluateExpression(expression.left, environment, sourceFile, objectOrigin),
      evaluateExpression(expression.right, environment, sourceFile, objectOrigin)
    ])
  }
  if (ts.isConditionalExpression(expression)) {
    const whenTrue = evaluateExpression(expression.whenTrue, environment, sourceFile, objectOrigin)
    const whenFalse = evaluateExpression(
      expression.whenFalse,
      environment,
      sourceFile,
      objectOrigin
    )
    return unionValues([whenTrue, whenFalse])
  }
  return UNKNOWN
}

function bindName(name: ts.BindingName, value: StaticValue, environment: StaticEnvironment): void {
  if (ts.isIdentifier(name)) {
    environment.set(name.text, value)
    return
  }
  if (
    value.kind !== 'object' &&
    value.kind !== 'array' &&
    value.kind !== 'api-object' &&
    value.kind !== 'union'
  ) {
    for (const element of name.elements) {
      if (!ts.isOmittedExpression(element)) bindName(element.name, UNKNOWN, environment)
    }
    return
  }

  name.elements.forEach((element, index) => {
    if (ts.isOmittedExpression(element)) return
    const propertyName = element.propertyName
      ? (staticPropertyName(element.propertyName) ?? '')
      : element.name.getText()
    const childValue = (() => {
      if (value.kind === 'array') return value.values[index] ?? UNKNOWN
      if (value.kind === 'api-object') {
        const operation = value.methods.get(propertyName)
        return operation ? ({ kind: 'api-method', operation } as const) : UNKNOWN
      }
      if (value.kind === 'object') return value.properties.get(propertyName) ?? UNKNOWN
      return unionValues(
        value.values.map(branch => {
          if (branch.kind === 'array') return branch.values[index] ?? UNKNOWN
          if (branch.kind === 'api-object') {
            const operation = branch.methods.get(propertyName)
            return operation ? ({ kind: 'api-method', operation } as const) : UNKNOWN
          }
          if (branch.kind === 'object') return branch.properties.get(propertyName) ?? UNKNOWN
          return UNKNOWN
        })
      )
    })()
    bindName(element.name, childValue, environment)
  })
}

function resolveModuleFile(baseFile: string, moduleSpecifier: string): string {
  const candidate = resolve(dirname(baseFile), moduleSpecifier)
  for (const path of [candidate, `${candidate}.ts`, join(candidate, 'index.ts')]) {
    if (existsSync(path) && statSync(path).isFile()) return path
  }
  throw new Error(`无法解析权限模块: ${moduleSpecifier} from ${baseFile}`)
}

function loadPermissionModuleExports(
  filePath: string,
  cache: Map<string, StaticEnvironment>
): StaticEnvironment {
  const absolutePath = resolve(filePath)
  const cached = cache.get(absolutePath)
  if (cached) return cached

  const sourceFile = ts.createSourceFile(
    absolutePath,
    readFileSync(absolutePath, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  )
  const environment: StaticEnvironment = new Map()
  const exports: StaticEnvironment = new Map()
  cache.set(absolutePath, exports)

  for (const statement of sourceFile.statements) {
    if (ts.isImportDeclaration(statement) && ts.isStringLiteral(statement.moduleSpecifier)) {
      const clause = statement.importClause
      if (
        !clause ||
        clause.isTypeOnly ||
        !clause.namedBindings ||
        !ts.isNamedImports(clause.namedBindings)
      ) {
        continue
      }
      const imported = loadPermissionModuleExports(
        resolveModuleFile(absolutePath, statement.moduleSpecifier.text),
        cache
      )
      for (const element of clause.namedBindings.elements) {
        const value = imported.get((element.propertyName ?? element.name).text)
        if (value !== undefined) environment.set(element.name.text, value)
      }
      continue
    }
    if (!ts.isVariableStatement(statement)) continue
    const isExported = statement.modifiers?.some(
      modifier => modifier.kind === ts.SyntaxKind.ExportKeyword
    )
    for (const declaration of statement.declarationList.declarations) {
      const value = declaration.initializer
        ? evaluateExpression(
            declaration.initializer,
            environment,
            sourceFile,
            'generated-permission'
          )
        : UNKNOWN
      bindName(declaration.name, value, environment)
      if (isExported && ts.isIdentifier(declaration.name)) {
        exports.set(declaration.name.text, value)
      }
    }
  }
  return exports
}

function collectProductionFiles(sourceRoot: string): string[] {
  if (!existsSync(sourceRoot)) throw new Error(`production source root 不存在: ${sourceRoot}`)
  const files: string[] = []
  const excludedFiles = new Set([resolve(sourceRoot, 'api/client.ts')])
  const excludedRoots = [
    join(sourceRoot, 'api/generated'),
    join(sourceRoot, 'api/modules'),
    join(sourceRoot, 'api/base'),
    join(sourceRoot, 'api/contract')
  ].map(path => `${resolve(path)}${sep}`)

  const walk = (directory: string): void => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name)
      if (entry.isDirectory()) {
        const normalized = `${resolve(path)}${sep}`
        if (!excludedRoots.some(root => normalized.startsWith(root))) walk(path)
      } else if (
        entry.isFile() &&
        !excludedFiles.has(resolve(path)) &&
        ['.ts', '.tsx', '.vue'].includes(extname(entry.name))
      ) {
        files.push(path)
      }
    }
  }
  walk(sourceRoot)
  return files.sort(compareCodePoint)
}

function parseProductionSource(filePath: string): ts.SourceFile {
  const raw = readFileSync(filePath, 'utf8')
  if (extname(filePath) !== '.vue') {
    return ts.createSourceFile(filePath, raw, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  }
  const descriptor = parseVueSfc(raw, { filename: filePath }).descriptor
  const scripts = [descriptor.script?.content, descriptor.scriptSetup?.content].filter(Boolean)
  if (scripts.length === 0) {
    return ts.createSourceFile(`${filePath}.ts`, '', ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  }
  return ts.createSourceFile(
    `${filePath}.ts`,
    scripts.join('\n'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  )
}

function addPermission(value: StaticValue, state: AnalysisState, location: string): void {
  if (typeof value === 'string') {
    if (value === '*') return
    if (!state.permissionRecords.has(value)) throw new Error(`未知权限 ${value}: ${location}`)
    state.permissionNames.add(value)
    return
  }
  if (value.kind === 'unknown') {
    throw new Error(`无法解析权限 import/barrel；无法静态解析权限表达式: ${location}`)
  }
  if (value.kind === 'union') {
    for (const child of value.values) addPermission(child, state, location)
    return
  }
  if (
    value.kind === 'api-object' ||
    value.kind === 'api-method' ||
    value.kind === 'http-client' ||
    value.kind === 'http-client-method'
  ) {
    throw new Error(`权限 sink 收到非权限值: ${location}`)
  }
  if (value.kind === 'object') {
    if (value.origin === 'generated-permission') throw new Error(`整组权限引用: ${location}`)
    if (value.origin === 'unresolved-permission') {
      throw new Error(`无法解析权限 import/barrel: ${location}`)
    }
    if (value.containsGeneratedPermissionSpread) {
      throw new Error(`整组权限 spread: ${location}`)
    }
    if (value.unknownSpread) throw new Error(`无法静态解析权限 spread: ${location}`)
    for (const child of value.properties.values()) addPermission(child, state, location)
    return
  }
  if (value.unknownSpread) throw new Error(`无法静态解析权限 spread: ${location}`)
  for (const child of value.values) addPermission(child, state, location)
}

function hasOpenApiOperation(
  document: Record<string, unknown>,
  operation: RequiredOperation
): boolean {
  const paths = document.paths as Record<string, Record<string, unknown>> | undefined
  return !!paths?.[operation.path]?.[operation.method.toLowerCase()]
}

function addOperation(operation: RequiredOperation, state: AnalysisState, location: string): void {
  if (!hasOpenApiOperation(state.openApiDocument, operation)) {
    throw new Error(
      `endpoint 不在 canonical OpenAPI: ${operation.method} ${operation.path} at ${location}`
    )
  }
  state.operations.set(`${operation.path}\u0000${operation.method}`, operation)
}

function valueBranches(value: StaticValue): StaticValue[] {
  return value.kind === 'union' ? value.values.flatMap(valueBranches) : [value]
}

function staticStrings(value: StaticValue): string[] | undefined {
  const branches = valueBranches(value)
  return branches.every(branch => typeof branch === 'string') ? (branches as string[]) : undefined
}

function isPermissionDeclarationFile(fileName: string): boolean {
  const normalized = fileName.split(sep).join('/')
  return (
    normalized.includes('/views/') ||
    normalized.includes('/router/routes/') ||
    normalized.endsWith('/src/fixture.ts')
  )
}

function isCallArgumentObjectProperty(node: ts.PropertyAssignment): boolean {
  let current: ts.Node = node
  while (
    ts.isObjectLiteralExpression(current.parent) ||
    ts.isArrayLiteralExpression(current.parent)
  ) {
    current = current.parent
  }
  return (
    ts.isCallExpression(current.parent) &&
    current.parent.arguments.includes(current as ts.Expression)
  )
}

function canonicalImportValue(
  moduleName: string,
  importedName: string,
  frontendRoot: string,
  apiCatalog: ReadonlyMap<string, ReadonlyMap<string, ApiObject>>,
  permissionCache: Map<string, StaticEnvironment>
): StaticValue | undefined {
  if (
    moduleName === '@/api/generated/permissions' ||
    moduleName.startsWith('@/api/generated/permissions/')
  ) {
    const relativeModule =
      moduleName === '@/api/generated/permissions'
        ? 'src/api/generated/permissions/index.ts'
        : `${moduleName.replace('@/', 'src/')}.ts`
    return loadPermissionModuleExports(resolve(frontendRoot, relativeModule), permissionCache).get(
      importedName
    )
  }
  if (moduleName === '@/composables/permission-state' && importedName === 'SUPERUSER_PERMISSION') {
    return '*'
  }
  if (moduleName.startsWith('@/api/modules/')) {
    return apiCatalog.get(moduleName)?.get(importedName)
  }
  if (
    (moduleName === '@/api/client' && importedName === 'apiClient') ||
    (moduleName === '@/api/contract/client' &&
      (importedName === 'contractClient' || importedName === 'contractMethods'))
  ) {
    return HTTP_CLIENT
  }
  return undefined
}

function sourceModuleFile(
  sourceFileName: string,
  moduleName: string,
  frontendRoot: string
): string | undefined {
  try {
    if (moduleName.startsWith('./') || moduleName.startsWith('../')) {
      return resolveModuleFile(sourceFileName, moduleName)
    }
    if (moduleName.startsWith('@/')) {
      return resolveModuleFile(join(frontendRoot, 'src/index.ts'), `./${moduleName.slice(2)}`)
    }
  } catch {
    return undefined
  }
  return undefined
}

function resolveNamedImportValue(
  sourceFileName: string,
  moduleName: string,
  importedName: string,
  frontendRoot: string,
  apiCatalog: ReadonlyMap<string, ReadonlyMap<string, ApiObject>>,
  permissionCache: Map<string, StaticEnvironment>,
  resolving: Set<string> = new Set()
): StaticValue {
  const canonical = canonicalImportValue(
    moduleName,
    importedName,
    frontendRoot,
    apiCatalog,
    permissionCache
  )
  if (canonical !== undefined) return canonical

  const moduleFile = sourceModuleFile(sourceFileName, moduleName, frontendRoot)
  if (!moduleFile) return UNKNOWN
  const cacheKey = `${moduleFile}\u0000${importedName}`
  if (resolving.has(cacheKey)) return UNKNOWN
  resolving.add(cacheKey)
  try {
    const sourceFile = parseProductionSource(moduleFile)
    const candidates: StaticValue[] = []
    for (const statement of sourceFile.statements) {
      if (
        ts.isExportDeclaration(statement) &&
        statement.moduleSpecifier &&
        ts.isStringLiteral(statement.moduleSpecifier)
      ) {
        if (statement.exportClause && ts.isNamedExports(statement.exportClause)) {
          for (const element of statement.exportClause.elements) {
            if (element.name.text !== importedName) continue
            candidates.push(
              resolveNamedImportValue(
                moduleFile,
                statement.moduleSpecifier.text,
                (element.propertyName ?? element.name).text,
                frontendRoot,
                apiCatalog,
                permissionCache,
                resolving
              )
            )
          }
        } else if (!statement.exportClause) {
          candidates.push(
            resolveNamedImportValue(
              moduleFile,
              statement.moduleSpecifier.text,
              importedName,
              frontendRoot,
              apiCatalog,
              permissionCache,
              resolving
            )
          )
        }
      }
    }
    const resolved = candidates.filter(candidate => candidate.kind !== 'unknown')
    return resolved.length === 1 ? resolved[0]! : UNKNOWN
  } finally {
    resolving.delete(cacheKey)
  }
}

function analyzeSourceFile(
  sourceFile: ts.SourceFile,
  frontendRoot: string,
  apiCatalog: ReadonlyMap<string, ReadonlyMap<string, ApiObject>>,
  permissionCache: Map<string, StaticEnvironment>,
  state: AnalysisState
): void {
  const environment: StaticEnvironment = new Map()
  const httpClientInterfaces = new Set<string>()
  const interfaceDeclarations = sourceFile.statements.filter(ts.isInterfaceDeclaration)

  for (const statement of interfaceDeclarations) {
    const memberNames = statement.members
      .filter(ts.isMethodSignature)
      .map(member => staticPropertyName(member.name))
      .filter((name): name is string => name !== undefined)
    if (memberNames.some(name => name === 'request' || HTTP_METHODS[name])) {
      httpClientInterfaces.add(statement.name.text)
    }
  }

  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier))
      continue
    const moduleName = statement.moduleSpecifier.text
    const clause = statement.importClause
    if (
      !clause ||
      clause.isTypeOnly ||
      !clause.namedBindings ||
      !ts.isNamedImports(clause.namedBindings)
    ) {
      continue
    }
    for (const element of clause.namedBindings.elements) {
      if (element.isTypeOnly) continue
      const importedName = (element.propertyName ?? element.name).text
      const value = resolveNamedImportValue(
        sourceFile.fileName,
        moduleName,
        importedName,
        frontendRoot,
        apiCatalog,
        permissionCache
      )
      if (value.kind === 'unknown' && moduleName.startsWith('@/api/modules')) {
        throw new Error(
          `无法解析 generated method import ${importedName}: ${sourceLocation(element, sourceFile)}`
        )
      }
      environment.set(element.name.text, value)
    }
  }

  const typeEnvironment = new Map<string, StaticValue>()
  for (const name of httpClientInterfaces) typeEnvironment.set(name, HTTP_CLIENT)
  for (const declaration of interfaceDeclarations) {
    const methodNames = declaration.members
      .filter(ts.isMethodSignature)
      .map(member => staticPropertyName(member.name))
      .filter((name): name is string => name !== undefined)
    if (methodNames.length === 0 || typeEnvironment.has(declaration.name.text)) continue
    const candidates = [...environment.values()].filter(
      (value): value is ApiObject =>
        typeof value !== 'string' &&
        value.kind === 'api-object' &&
        methodNames.every(methodName => value.methods.has(methodName))
    )
    if (candidates.length === 1) {
      typeEnvironment.set(declaration.name.text, {
        kind: 'api-object',
        methods: new Map(
          methodNames.map(methodName => [methodName, candidates[0]!.methods.get(methodName)!])
        )
      })
    }
  }
  for (const declaration of interfaceDeclarations) {
    if (typeEnvironment.has(declaration.name.text)) continue
    const properties = new Map<string, StaticValue>()
    for (const member of declaration.members) {
      if (!ts.isPropertySignature(member) || !member.type) continue
      const name = staticPropertyName(member.name)
      if (!name || !ts.isTypeReferenceNode(member.type)) continue
      const value = typeEnvironment.get(member.type.typeName.getText())
      if (value) properties.set(name, value)
    }
    if (properties.size > 0) {
      typeEnvironment.set(declaration.name.text, {
        kind: 'object',
        origin: 'local',
        properties,
        containsGeneratedPermissionSpread: false,
        unknownSpread: false
      })
    }
  }

  const visit = (node: ts.Node): void => {
    if (ts.isParameter(node) && ts.isIdentifier(node.name) && node.type) {
      const type = node.type
      if (ts.isTypeReferenceNode(type)) {
        const value = typeEnvironment.get(type.typeName.getText())
        if (value) environment.set(node.name.text, value)
      }
    }
    if (ts.isVariableDeclaration(node) && node.initializer) {
      bindName(
        node.name,
        evaluateExpression(node.initializer, environment, sourceFile),
        environment
      )
    }

    if (ts.isPropertyAssignment(node)) {
      const key = staticPropertyName(node.name)
      if (
        (key === 'permission' || key === 'permissions') &&
        isPermissionDeclarationFile(sourceFile.fileName) &&
        !isCallArgumentObjectProperty(node)
      ) {
        addPermission(
          evaluateExpression(node.initializer, environment, sourceFile),
          state,
          sourceLocation(node, sourceFile)
        )
      }
    }

    if (ts.isCallExpression(node)) {
      const evaluatedCall = evaluateExpression(node.expression, environment, sourceFile)
      const callBranches = valueBranches(evaluatedCall)
      const apiMethods = callBranches.filter(
        (value): value is ApiMethod => typeof value !== 'string' && value.kind === 'api-method'
      )
      if (apiMethods.length > 0) {
        if (callBranches.some(value => typeof value !== 'string' && value.kind === 'unknown')) {
          throw new Error(`无法静态解析 generated method: ${sourceLocation(node, sourceFile)}`)
        }
        for (const method of apiMethods) {
          addOperation(method.operation, state, sourceLocation(node, sourceFile))
        }
      }

      const callee = unwrapExpression(node.expression)
      const callName = ts.isIdentifier(callee)
        ? callee.text
        : ts.isPropertyAccessExpression(callee)
          ? callee.name.text
          : undefined
      if (
        callName &&
        ['hasPermission', 'hasAnyPermission', 'hasAllPermissions'].includes(callName)
      ) {
        const permission = node.arguments[0]
          ? evaluateExpression(node.arguments[0], environment, sourceFile)
          : UNKNOWN
        if (
          isPermissionDeclarationFile(sourceFile.fileName) ||
          valueBranches(permission).some(value => value.kind !== 'unknown')
        ) {
          addPermission(permission, state, sourceLocation(node, sourceFile))
        }
      }

      const httpMethods = callBranches.filter(
        (value): value is HttpClientMethod =>
          typeof value !== 'string' && value.kind === 'http-client-method'
      )
      for (const httpMethod of httpMethods) {
        const paths = node.arguments[0]
          ? staticStrings(evaluateExpression(node.arguments[0], environment, sourceFile))
          : undefined
        if (!paths) {
          throw new Error(
            `${httpMethod.method === 'request' ? '动态 method/path' : '动态 endpoint path'}: ${sourceLocation(node, sourceFile)}`
          )
        }
        if (httpMethod.method === 'request') {
          const methods = node.arguments[1]
            ? staticStrings(evaluateExpression(node.arguments[1], environment, sourceFile))
            : undefined
          if (!methods) throw new Error(`动态 method/path: ${sourceLocation(node, sourceFile)}`)
          for (const path of paths) {
            for (const method of methods) {
              addOperation(
                { method: method.toUpperCase() as UpperHttpMethod, path },
                state,
                sourceLocation(node, sourceFile)
              )
            }
          }
        } else {
          for (const path of paths) {
            if (path.startsWith('/api/')) {
              addOperation(
                { method: httpMethod.method, path },
                state,
                sourceLocation(node, sourceFile)
              )
            }
          }
        }
      }

      for (const argument of node.arguments) {
        const branches = valueBranches(evaluateExpression(argument, environment, sourceFile))
        if (branches.some(value => typeof value !== 'string' && value.kind === 'api-method')) {
          throw new Error(`generated method 作为 callback: ${sourceLocation(argument, sourceFile)}`)
        }
        if (
          branches.some(value => typeof value !== 'string' && value.kind === 'http-client-method')
        ) {
          throw new Error(`HTTP method 作为 callback: ${sourceLocation(argument, sourceFile)}`)
        }
      }
    }

    if (
      ts.isNewExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === 'URL'
    ) {
      const path = node.arguments?.[0]
        ? evaluateExpression(node.arguments[0], environment, sourceFile)
        : UNKNOWN
      const paths = staticStrings(path)
      for (const candidate of paths ?? []) {
        if (candidate.startsWith('/api/')) {
          addOperation({ method: 'GET', path: candidate }, state, sourceLocation(node, sourceFile))
        }
      }
    }

    ts.forEachChild(node, visit)
  }
  ts.forEachChild(sourceFile, visit)
}

function buildApiCatalog(document: Record<string, unknown>): Map<string, Map<string, ApiObject>> {
  const catalog = new Map<string, Map<string, ApiObject>>()
  for (const entry of buildGeneratedMethodCatalog(document)) {
    let exports = catalog.get(entry.modulePath)
    if (!exports) {
      exports = new Map()
      catalog.set(entry.modulePath, exports)
    }
    let apiObject = exports.get(entry.exportName)
    if (!apiObject) {
      apiObject = { kind: 'api-object', methods: new Map() }
      exports.set(entry.exportName, apiObject)
    }
    const operation = {
      method: entry.method.toUpperCase() as UpperHttpMethod,
      path: entry.path
    }
    const previous = apiObject.methods.get(entry.methodName)
    if (previous && (previous.method !== operation.method || previous.path !== operation.path)) {
      throw new Error(
        `generated method 不唯一: ${entry.modulePath}#${entry.exportName}.${entry.methodName}`
      )
    }
    apiObject.methods.set(entry.methodName, operation)
  }
  return catalog
}

function buildInputSetHash(frontendRoot: string, paths: string[]): string {
  const files = [...paths].sort(compareCodePoint).map(path => {
    if (path.includes('..') || path.startsWith('/')) throw new Error(`非法 input-set path: ${path}`)
    const absolutePath = resolve(frontendRoot, path)
    if (!existsSync(absolutePath)) throw new Error(`fingerprint input 不存在: ${path}`)
    return { path, sha256: sha256(readFileSync(absolutePath)) }
  })
  return sha256(canonicalJson({ kind: 'wes.release.input-set.v1', files }))
}

interface ArtifactDirectoryOperations {
  removeDirectory?: typeof rmSync
}

export function writeArtifactDirectoryAtomically(
  outputDir: string,
  artifacts: ReadonlyMap<string, string>,
  operations: ArtifactDirectoryOperations = {}
): void {
  const removeDirectory = operations.removeDirectory ?? rmSync
  const parent = dirname(outputDir)
  mkdirSync(parent, { recursive: true })
  const staging = mkdtempSync(join(parent, '.release-consumer-'))
  const backup = `${staging}-backup`
  let backupCreated = false
  let committed = false
  try {
    for (const [name, content] of artifacts) writeFileSync(join(staging, name), content, 'utf8')
    if (existsSync(outputDir)) {
      renameSync(outputDir, backup)
      backupCreated = true
    }
    renameSync(staging, outputDir)
    committed = true
  } catch (error) {
    if (!committed && backupCreated && existsSync(backup)) renameSync(backup, outputDir)
    throw error
  } finally {
    removeDirectory(staging, { recursive: true, force: true })
  }
  if (backupCreated) {
    try {
      removeDirectory(backup, { recursive: true, force: true })
    } catch {
      // The new directory is already the commit point; stale backup cleanup is recoverable.
    }
  }
}

export function exportReleaseConsumer(
  options: ExportReleaseConsumerOptions = {}
): ReleaseConsumerResult {
  const frontendRoot = resolve(
    options.frontendRoot ?? resolve(dirname(fileURLToPath(import.meta.url)), '../..')
  )
  const outputDir = resolve(options.outputDir ?? join(frontendRoot, 'artifacts/release-consumer'))
  const openApi = readCanonicalOpenApiSnapshot(frontendRoot)
  const permissionSnapshot = readCanonicalPermissionSnapshot(frontendRoot)
  const permissionRecords = new Map(
    permissionSnapshot.permissions.map(permission => [permission.name, permission])
  )
  const state: AnalysisState = {
    operations: new Map(),
    permissionNames: new Set(),
    permissionRecords,
    openApiDocument: openApi.document
  }
  const apiCatalog = buildApiCatalog(openApi.document)
  const permissionCache = new Map<string, StaticEnvironment>()

  for (const file of collectProductionFiles(join(frontendRoot, 'src'))) {
    analyzeSourceFile(parseProductionSource(file), frontendRoot, apiCatalog, permissionCache, state)
  }

  for (const name of state.permissionNames) {
    const permission = permissionRecords.get(name)!
    addOperation(
      { method: permission.method!.toUpperCase() as UpperHttpMethod, path: permission.path! },
      state,
      `permission ${name}`
    )
  }

  const requiredPermissions = [...state.permissionNames].sort(compareCodePoint)
  const requiredOperations = [...state.operations.values()].sort(
    (left, right) =>
      compareCodePoint(left.path, right.path) || compareCodePoint(left.method, right.method)
  )
  const requiredOperationsJson = canonicalJson({
    kind: REQUIRED_OPERATIONS_KIND,
    operations: requiredOperations
  })
  const requiredPermissionsJson = canonicalJson({
    kind: REQUIRED_PERMISSIONS_KIND,
    permissions: requiredPermissions
  })
  const fingerprints: ConsumerFingerprints = {
    consumer_openapi_sha256: sha256(openApi.serialized),
    dependencies_sha256: buildInputSetHash(frontendRoot, ['package.json', 'pnpm-lock.yaml']),
    kind: FRONTEND_FINGERPRINTS_KIND,
    recipe_sha256: buildInputSetHash(frontendRoot, [
      '.npmrc',
      'Dockerfile',
      'nginx.conf',
      'package.json',
      'vite.config.ts'
    ]),
    required_operations_sha256: sha256(requiredOperationsJson),
    required_permissions_sha256: sha256(requiredPermissionsJson)
  }

  writeArtifactDirectoryAtomically(
    outputDir,
    new Map([
      ['consumer-openapi.json', openApi.serialized],
      ['required-operations.json', requiredOperationsJson],
      ['required-permissions.json', requiredPermissionsJson],
      ['consumer-fingerprints.json', canonicalJson(fingerprints)]
    ])
  )
  return { requiredOperations, requiredPermissions, fingerprints }
}
