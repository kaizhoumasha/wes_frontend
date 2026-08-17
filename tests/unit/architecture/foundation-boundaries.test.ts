import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import ts from 'typescript'
import { describe, expect, it } from 'vitest'

const FOUNDATION_DIRECTORIES = ['src/components/common', 'src/components/ui', 'src/api/base']
const VUE_SCRIPT_BLOCK = /<script(?:\s[^>]*)?>([\s\S]*?)<\/script\s*>/gi

function collectSourceFiles(directory: string): string[] {
  const files: string[] = []
  for (const entry of readdirSync(directory)) {
    const path = join(directory, entry)
    if (statSync(path).isDirectory()) {
      files.push(...collectSourceFiles(path))
    } else if (path.endsWith('.ts') || path.endsWith('.tsx') || path.endsWith('.vue')) {
      files.push(path)
    }
  }
  return files
}

function getStaticModuleSpecifier(node: ts.Node | undefined): string | null {
  return node && (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node))
    ? node.text
    : null
}

function extractModuleSpecifiersFromScript(
  source: string,
  sourceFile: string,
  scriptKind: ts.ScriptKind
): string[] {
  const parsed = ts.createSourceFile(sourceFile, source, ts.ScriptTarget.Latest, true, scriptKind)
  const specifiers: string[] = []

  function visit(node: ts.Node): void {
    let specifier: string | null = null

    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      specifier = getStaticModuleSpecifier(node.moduleSpecifier)
    } else if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
      specifier = getStaticModuleSpecifier(node.arguments[0])
    }

    if (specifier !== null) {
      specifiers.push(specifier)
    }
    ts.forEachChild(node, visit)
  }

  visit(parsed)
  return specifiers
}

function extractModuleSpecifiers(source: string, sourceFile: string): string[] {
  if (!sourceFile.endsWith('.vue')) {
    const scriptKind = sourceFile.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
    return extractModuleSpecifiersFromScript(source, sourceFile, scriptKind)
  }

  return Array.from(source.matchAll(VUE_SCRIPT_BLOCK)).flatMap((match, index) => {
    const scriptKind = /\blang\s*=\s*["']tsx["']/i.test(match[0])
      ? ts.ScriptKind.TSX
      : ts.ScriptKind.TS
    return extractModuleSpecifiersFromScript(match[1], `${sourceFile}#script-${index}`, scriptKind)
  })
}

function resolveModuleSpecifier(
  specifier: string,
  sourceFile: string,
  repoRoot: string
): string | null {
  if (specifier.startsWith('@/')) {
    return resolve(repoRoot, 'src', specifier.slice(2))
  }
  if (specifier.startsWith('.')) {
    return resolve(dirname(sourceFile), specifier)
  }
  return null
}

function findBusinessApiSpecifiers(source: string, sourceFile: string, repoRoot: string): string[] {
  const businessApiDirectory = resolve(repoRoot, 'src/api/modules')

  return extractModuleSpecifiers(source, sourceFile).filter(specifier => {
    const resolvedSpecifier = resolveModuleSpecifier(specifier, sourceFile, repoRoot)
    return (
      resolvedSpecifier === businessApiDirectory ||
      resolvedSpecifier?.startsWith(`${businessApiDirectory}${sep}`)
    )
  })
}

describe('foundation dependency boundaries', () => {
  it.each([
    ['static import', "import { x } from '@/api/modules/x'"],
    ['export-from', "export { x } from '@/api/modules/x'"],
    ['dynamic import', "const module = import('@/api/modules/x')"]
  ])('detects business API alias dependencies through %s', (_syntax, source) => {
    const repoRoot = resolve(process.cwd())
    const sourceFile = resolve(repoRoot, 'src/components/common/example.ts')

    expect(findBusinessApiSpecifiers(source, sourceFile, repoRoot)).toEqual(['@/api/modules/x'])
  })

  it('detects relative imports that resolve into business API modules', () => {
    const source = "import { x } from '../../api/modules/x'"
    const repoRoot = resolve(process.cwd())
    const sourceFile = resolve(repoRoot, 'src/components/common/example.ts')

    expect(findBusinessApiSpecifiers(source, sourceFile, repoRoot)).toEqual(['../../api/modules/x'])
  })

  it('detects relative export-from dependencies separated by comment trivia', () => {
    const source = "export { x } from /* boundary */ '../../api/modules/x'"
    const repoRoot = resolve(process.cwd())
    const sourceFile = resolve(repoRoot, 'src/components/common/example.ts')

    expect(findBusinessApiSpecifiers(source, sourceFile, repoRoot)).toEqual(['../../api/modules/x'])
  })

  it('detects dynamic imports with a static template literal', () => {
    const source = 'const module = import(`@/api/modules/x`)'
    const repoRoot = resolve(process.cwd())
    const sourceFile = resolve(repoRoot, 'src/components/common/example.ts')

    expect(findBusinessApiSpecifiers(source, sourceFile, repoRoot)).toEqual(['@/api/modules/x'])
  })

  it('parses Vue script blocks without treating template text as imports', () => {
    const source = `
      <template>import('@/api/modules/template-only')</template>
      <script setup lang="ts">
      export { x } from /* boundary */ '../../api/modules/x'
      </script>
    `
    const repoRoot = resolve(process.cwd())
    const sourceFile = resolve(repoRoot, 'src/components/common/example.vue')

    expect(findBusinessApiSpecifiers(source, sourceFile, repoRoot)).toEqual(['../../api/modules/x'])
  })

  it('does not import business API modules from common, ui, or api base', () => {
    const repoRoot = resolve(process.cwd())
    const violations = FOUNDATION_DIRECTORIES.flatMap(directory =>
      collectSourceFiles(resolve(repoRoot, directory)).flatMap(file => {
        const specifiers = findBusinessApiSpecifiers(readFileSync(file, 'utf-8'), file, repoRoot)
        return specifiers.map(specifier => `${relative(repoRoot, file)}: ${specifier}`)
      })
    )

    expect(violations, `基础层不得依赖业务 API:\n${violations.join('\n')}`).toEqual([])
  })
})
