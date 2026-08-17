import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { describe, expect, it } from 'vitest'

const FOUNDATION_DIRECTORIES = ['src/components/common', 'src/components/ui', 'src/api/base']
const MODULE_SPECIFIER_PATTERNS = [
  /\bimport\s+(?:type\s+)?(?:[^'";]*?\s+from\s+)?['"]([^'"]+)['"]/g,
  /\bexport\s+(?:type\s+)?[^'";]*?\s+from\s+['"]([^'"]+)['"]/g,
  /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g
]

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

function extractModuleSpecifiers(source: string): string[] {
  return MODULE_SPECIFIER_PATTERNS.flatMap(pattern =>
    Array.from(source.matchAll(pattern), match => match[1])
  )
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

  return extractModuleSpecifiers(source).filter(specifier => {
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
