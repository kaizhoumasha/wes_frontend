import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const FOUNDATION_DIRECTORIES = [
  'src/components/common',
  'src/components/ui',
  'src/api/base'
]
const BUSINESS_API_IMPORT = /\bimport(?:\s+type)?\s*(?:[\w*{},\s]+?\s+from\s*)?['"]@\/api\/modules\/[^'"]+['"]|\bimport\s*\(\s*['"]@\/api\/modules\/[^'"]+['"]\s*\)/g

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

describe('foundation dependency boundaries', () => {
  it('does not import business API modules from common, ui, or api base', () => {
    const repoRoot = resolve(process.cwd())
    const violations = FOUNDATION_DIRECTORIES.flatMap(directory =>
      collectSourceFiles(resolve(repoRoot, directory)).flatMap(file => {
        const imports = readFileSync(file, 'utf-8').match(BUSINESS_API_IMPORT) ?? []
        return imports.map(importStatement =>
          `${relative(repoRoot, file)}: ${importStatement.trim()}`
        )
      })
    )

    expect(violations, `基础层不得依赖业务 API:\n${violations.join('\n')}`).toEqual([])
  })
})
