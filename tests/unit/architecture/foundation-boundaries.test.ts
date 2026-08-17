import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { parse as parseVueSfc } from 'vue/compiler-sfc'
import ts from 'typescript'
import { describe, expect, it } from 'vitest'

const FOUNDATION_DIRECTORIES = ['src/components/common', 'src/components/ui', 'src/api/base']

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

function extractSourceDependencies(
  source: string,
  sourceFile: string
): { moduleSpecifiers: string[]; externalScriptSources: string[] } {
  if (!sourceFile.endsWith('.vue')) {
    const scriptKind = sourceFile.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
    return {
      moduleSpecifiers: extractModuleSpecifiersFromScript(source, sourceFile, scriptKind),
      externalScriptSources: []
    }
  }

  const parsedSfc = parseVueSfc(source, { filename: sourceFile })
  if (parsedSfc.errors.length > 0) {
    const details = parsedSfc.errors
      .map(error => (error instanceof Error ? error.message : String(error)))
      .join('; ')
    throw new Error(`Foundation Vue SFC 解析失败 (${sourceFile}): ${details}`)
  }

  const descriptor = parsedSfc.descriptor
  const scriptBlocks = [descriptor.script, descriptor.scriptSetup]

  return {
    moduleSpecifiers: scriptBlocks.flatMap((block, index) => {
      if (!block) {
        return []
      }
      const scriptKind = block.lang === 'tsx' ? ts.ScriptKind.TSX : ts.ScriptKind.TS
      return extractModuleSpecifiersFromScript(
        block.content,
        `${sourceFile}#script-${index}`,
        scriptKind
      )
    }),
    externalScriptSources: scriptBlocks.flatMap(block => (block?.src ? [block.src] : []))
  }
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

function findFoundationDependencyViolations(
  source: string,
  sourceFile: string,
  repoRoot: string
): string[] {
  const businessApiDirectory = resolve(repoRoot, 'src/api/modules')
  const dependencies = extractSourceDependencies(source, sourceFile)

  return [
    ...dependencies.externalScriptSources.map(source => `<script src>: ${source}`),
    ...dependencies.moduleSpecifiers.filter(specifier => {
      const resolvedSpecifier = resolveModuleSpecifier(specifier, sourceFile, repoRoot)
      return (
        resolvedSpecifier === businessApiDirectory ||
        resolvedSpecifier?.startsWith(`${businessApiDirectory}${sep}`)
      )
    })
  ]
}

describe('foundation dependency boundaries', () => {
  it.each([
    ['static import', "import { x } from '@/api/modules/x'"],
    ['export-from', "export { x } from '@/api/modules/x'"],
    ['dynamic import', "const module = import('@/api/modules/x')"]
  ])('detects business API alias dependencies through %s', (_syntax, source) => {
    const repoRoot = resolve(process.cwd())
    const sourceFile = resolve(repoRoot, 'src/components/common/example.ts')

    expect(findFoundationDependencyViolations(source, sourceFile, repoRoot)).toEqual([
      '@/api/modules/x'
    ])
  })

  it('detects relative imports that resolve into business API modules', () => {
    const source = "import { x } from '../../api/modules/x'"
    const repoRoot = resolve(process.cwd())
    const sourceFile = resolve(repoRoot, 'src/components/common/example.ts')

    expect(findFoundationDependencyViolations(source, sourceFile, repoRoot)).toEqual([
      '../../api/modules/x'
    ])
  })

  it('detects relative export-from dependencies separated by comment trivia', () => {
    const source = "export { x } from /* boundary */ '../../api/modules/x'"
    const repoRoot = resolve(process.cwd())
    const sourceFile = resolve(repoRoot, 'src/components/common/example.ts')

    expect(findFoundationDependencyViolations(source, sourceFile, repoRoot)).toEqual([
      '../../api/modules/x'
    ])
  })

  it('detects dynamic imports with a static template literal', () => {
    const source = 'const module = import(`@/api/modules/x`)'
    const repoRoot = resolve(process.cwd())
    const sourceFile = resolve(repoRoot, 'src/components/common/example.ts')

    expect(findFoundationDependencyViolations(source, sourceFile, repoRoot)).toEqual([
      '@/api/modules/x'
    ])
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

    expect(findFoundationDependencyViolations(source, sourceFile, repoRoot)).toEqual([
      '../../api/modules/x'
    ])
  })

  it('rejects foundation Vue external script sources', () => {
    const source = '<script src="../../api/modules/x.ts"></script>'
    const repoRoot = resolve(process.cwd())
    const sourceFile = resolve(repoRoot, 'src/components/common/example.vue')

    expect(findFoundationDependencyViolations(source, sourceFile, repoRoot)).toEqual([
      '<script src>: ../../api/modules/x.ts'
    ])
  })

  it('fails closed when Vue rejects an external script setup source', () => {
    const source = '<script setup src="./shared.ts"></script>'
    const repoRoot = resolve(process.cwd())
    const sourceFile = resolve(repoRoot, 'src/components/common/example.vue')

    expect(() => findFoundationDependencyViolations(source, sourceFile, repoRoot)).toThrow(
      /Foundation Vue SFC 解析失败.*script setup.*src/i
    )
  })

  it('does not import business API modules from common, ui, or api base', () => {
    const repoRoot = resolve(process.cwd())
    const violations = FOUNDATION_DIRECTORIES.flatMap(directory =>
      collectSourceFiles(resolve(repoRoot, directory)).flatMap(file => {
        const violations = findFoundationDependencyViolations(
          readFileSync(file, 'utf-8'),
          file,
          repoRoot
        )
        return violations.map(violation => `${relative(repoRoot, file)}: ${violation}`)
      })
    )

    expect(violations, `基础层依赖违规:\n${violations.join('\n')}`).toEqual([])
  })
})
