import { execFileSync, spawnSync } from 'node:child_process'
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

const REPOSITORY_ROOT = process.cwd()

function makeExecutable(path: string, content: string): void {
  writeFileSync(path, content)
  chmodSync(path, 0o755)
}

describe.sequential('repository quality gates', () => {
  let root: string

  function runPrePush(
    caseName: string,
    failCommand = ''
  ): {
    status: number | null
    trace: string
  } {
    const caseRoot = join(root, caseName)
    const hookPath = join(caseRoot, 'pre-push')
    const binRoot = join(caseRoot, 'bin')
    const tracePath = join(caseRoot, 'trace.log')
    mkdirSync(join(caseRoot, 'node_modules'), { recursive: true })
    mkdirSync(binRoot)
    writeFileSync(hookPath, readFileSync(join(REPOSITORY_ROOT, '.husky/pre-push'), 'utf-8'))
    makeExecutable(
      join(binRoot, 'pnpm'),
      [
        '#!/bin/sh',
        'printf "%s\\n" "$*" >> "$TRACE_PATH"',
        'if [ "$*" = "$FAIL_COMMAND" ]; then exit 37; fi',
        ''
      ].join('\n')
    )
    execFileSync('git', ['init', '-b', 'feature/test'], { cwd: caseRoot })
    execFileSync('git', ['config', 'user.name', 'Quality Gate Test'], { cwd: caseRoot })
    execFileSync('git', ['config', 'user.email', 'quality@example.test'], { cwd: caseRoot })
    writeFileSync(join(caseRoot, 'tracked.txt'), 'baseline\n')
    execFileSync('git', ['add', 'tracked.txt'], { cwd: caseRoot })
    execFileSync('git', ['commit', '-m', 'baseline'], { cwd: caseRoot })

    const result = spawnSync('sh', [hookPath], {
      cwd: caseRoot,
      encoding: 'utf-8',
      env: {
        ...process.env,
        FAIL_COMMAND: failCommand,
        PATH: `${binRoot}:${process.env.PATH ?? ''}`,
        TRACE_PATH: tracePath
      }
    })

    return { status: result.status, trace: readFileSync(tracePath, 'utf-8') }
  }

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'quality-gates-'))
  })

  afterEach(() => {
    rmSync(root, { force: true, recursive: true })
  })

  it('runs every lint package script in check-only mode', () => {
    const packageJson = JSON.parse(
      readFileSync(join(REPOSITORY_ROOT, 'package.json'), 'utf-8')
    ) as {
      scripts: Record<string, string>
    }
    const packageRoot = join(root, 'lint-package')
    const binRoot = join(packageRoot, 'node_modules/.bin')
    const tracePath = join(packageRoot, 'trace.log')
    const victimPath = join(packageRoot, 'victim.txt')
    mkdirSync(binRoot, { recursive: true })
    writeFileSync(
      join(packageRoot, 'package.json'),
      JSON.stringify({
        scripts: {
          'lint:eslint': packageJson.scripts['lint:eslint'],
          'lint:prettier': packageJson.scripts['lint:prettier'],
          'lint:stylelint': packageJson.scripts['lint:stylelint']
        }
      })
    )
    writeFileSync(victimPath, 'unchanged\n')

    const fakeChecker = [
      '#!/bin/sh',
      'printf "%s\\n" "$*" >> "$TRACE_PATH"',
      'for argument do',
      '  if [ "$argument" = "--fix" ] || [ "$argument" = "--write" ]; then',
      '    printf "modified\\n" > "$VICTIM_PATH"',
      '  fi',
      'done',
      ''
    ].join('\n')
    for (const command of ['eslint', 'prettier', 'stylelint']) {
      makeExecutable(join(binRoot, command), fakeChecker)
    }

    for (const script of ['lint:eslint', 'lint:prettier', 'lint:stylelint']) {
      execFileSync('pnpm', ['run', script], {
        cwd: packageRoot,
        env: { ...process.env, TRACE_PATH: tracePath, VICTIM_PATH: victimPath }
      })
    }

    expect(readFileSync(victimPath, 'utf-8')).toBe('unchanged\n')
    expect(readFileSync(tracePath, 'utf-8')).not.toMatch(/(?:--fix|--write)/)
  })

  it('propagates an offline contract verification failure from pre-commit', () => {
    const hookPath = join(root, 'pre-commit')
    const binRoot = join(root, 'bin')
    const tracePath = join(root, 'trace.log')
    mkdirSync(binRoot)
    writeFileSync(hookPath, readFileSync(join(REPOSITORY_ROOT, '.husky/pre-commit'), 'utf-8'))
    makeExecutable(
      join(binRoot, 'pnpm'),
      '#!/bin/sh\nprintf "%s\\n" "$*" >> "$TRACE_PATH"\nexit 23\n'
    )
    makeExecutable(join(binRoot, 'npx'), '#!/bin/sh\nprintf "npx\\n" >> "$TRACE_PATH"\n')

    const result = spawnSync('sh', [hookPath], {
      cwd: root,
      encoding: 'utf-8',
      env: { ...process.env, PATH: `${binRoot}:${process.env.PATH ?? ''}`, TRACE_PATH: tracePath }
    })

    expect(result.status).toBe(23)
    expect(readFileSync(tracePath, 'utf-8')).toBe('contract:verify --silent\n')
  })

  it('keeps the canonical OpenAPI snapshot owned by the freeze generator', () => {
    const result = spawnSync(
      'pnpm',
      ['exec', 'prettier', '--check', 'contracts/openapi.current.json'],
      {
        cwd: REPOSITORY_ROOT,
        encoding: 'utf-8'
      }
    )

    expect(result.status, `${result.stdout}${result.stderr}`).toBe(0)
  })

  it('fails pre-push when node_modules is missing', () => {
    const hookPath = join(root, 'pre-push')
    writeFileSync(hookPath, readFileSync(join(REPOSITORY_ROOT, '.husky/pre-push'), 'utf-8'))
    execFileSync('git', ['init', '-b', 'feature/test'], { cwd: root })
    execFileSync('git', ['config', 'user.name', 'Quality Gate Test'], { cwd: root })
    execFileSync('git', ['config', 'user.email', 'quality@example.test'], { cwd: root })
    writeFileSync(join(root, 'tracked.txt'), 'baseline\n')
    execFileSync('git', ['add', 'tracked.txt'], { cwd: root })
    execFileSync('git', ['commit', '-m', 'baseline'], { cwd: root })

    const result = spawnSync('sh', [hookPath], { cwd: root, encoding: 'utf-8' })

    expect(result.status).not.toBe(0)
    expect(`${result.stdout}${result.stderr}`).toContain('node_modules')
  })

  it('runs the three pre-push gates in order through real shell execution', () => {
    const result = runPrePush('pre-push-success')

    expect(result.status).toBe(0)
    expect(result.trace).toBe('test\ncontract:test\ncontract:verify\n')
  })

  it.each([
    ['test', 'test\n'],
    ['contract:test', 'test\ncontract:test\n'],
    ['contract:verify', 'test\ncontract:test\ncontract:verify\n']
  ])('propagates a non-zero %s pre-push gate', (failCommand, expectedTrace) => {
    const result = runPrePush(`pre-push-fail-${failCommand.replace(':', '-')}`, failCommand)

    expect(result.status).toBe(37)
    expect(result.trace).toBe(expectedTrace)
  })

  it('declares test and offline contract gates in frontend-only CI', () => {
    const workflow = readFileSync(join(REPOSITORY_ROOT, '.github/workflows/ci-cd.yml'), 'utf-8')

    expect(workflow).toContain('run: pnpm test')
    expect(workflow).toContain('run: pnpm contract:test')
    expect(workflow).toContain('run: pnpm contract:verify')
    expect(workflow).not.toContain('run: pnpm permission:verify')
  })
})
