import { execFileSync, spawnSync } from 'node:child_process'
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync
} from 'node:fs'
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

  it('clears Git hook repository variables before running quality gates', () => {
    const caseRoot = join(root, 'pre-push-git-environment')
    const hookPath = join(caseRoot, 'pre-push')
    const binRoot = join(caseRoot, 'bin')
    mkdirSync(join(caseRoot, 'node_modules'), { recursive: true })
    mkdirSync(binRoot)
    writeFileSync(hookPath, readFileSync(join(REPOSITORY_ROOT, '.husky/pre-push'), 'utf-8'))
    makeExecutable(
      join(binRoot, 'pnpm'),
      '#!/bin/sh\n[ -z "$GIT_DIR" ] || exit 41\n'
    )
    execFileSync('git', ['init', '-b', 'feature/test'], { cwd: caseRoot })

    const result = spawnSync('sh', [hookPath], {
      cwd: caseRoot,
      encoding: 'utf-8',
      env: {
        ...process.env,
        GIT_DIR: execFileSync('git', ['rev-parse', '--absolute-git-dir'], {
          cwd: REPOSITORY_ROOT,
          encoding: 'utf-8'
        }).trim(),
        PATH: `${binRoot}:${process.env.PATH ?? ''}`
      }
    })

    expect(result.status).toBe(0)
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

  it('runs repository quality gates before the Jenkins image build', () => {
    const jenkinsfile = readFileSync(join(REPOSITORY_ROOT, 'Jenkinsfile'), 'utf-8')

    const testIndex = jenkinsfile.indexOf('pnpm run test')
    const contractTestIndex = jenkinsfile.indexOf('pnpm run contract:test')
    const contractVerifyIndex = jenkinsfile.indexOf('pnpm run contract:verify')
    const lintIndex = jenkinsfile.indexOf('pnpm run lint')
    const buildIndex = jenkinsfile.indexOf('pnpm run build:dev')

    expect(testIndex).toBeGreaterThan(-1)
    expect(contractTestIndex).toBeGreaterThan(testIndex)
    expect(contractVerifyIndex).toBeGreaterThan(contractTestIndex)
    expect(lintIndex).toBeGreaterThan(contractVerifyIndex)
    expect(buildIndex).toBeGreaterThan(lintIndex)
  })

  it('binds the frontend image to the exact revision and source tree', () => {
    const dockerfile = readFileSync(join(REPOSITORY_ROOT, 'Dockerfile'), 'utf-8')
    const jenkinsfile = readFileSync(join(REPOSITORY_ROOT, 'Jenkinsfile'), 'utf-8')

    expect(dockerfile).toContain('ARG WES_VCS_REVISION')
    expect(dockerfile).toContain('ARG WES_SOURCE_TREE')
    expect(dockerfile).toContain('org.opencontainers.image.revision="${WES_VCS_REVISION}"')
    expect(dockerfile).toContain('com.zontec.wes.source-manifest="${WES_SOURCE_TREE}"')
    expect(jenkinsfile).toContain(
      "String sourceTree = sh(returnStdout: true, script: 'git rev-parse HEAD^{tree}').trim()"
    )
    expect(jenkinsfile).toContain('env.CI_SOURCE_TREE = sourceTree')
    expect(jenkinsfile).toContain('--build-arg WES_VCS_REVISION="${CI_COMMIT_SHA}"')
    expect(jenkinsfile).toContain('--build-arg WES_SOURCE_TREE="${CI_SOURCE_TREE}"')
  })

  it('documents only explicit backend checkout permission commands', () => {
    const maintainedDocs = [
      'README.md',
      'CLAUDE.md',
      'docs/CONTRACT_FRONTEND_DEVELOPMENT_MANUAL.md',
      'docs/CONTRACT_SYNC_WORKFLOW.md',
      'docs/CONTRACT_TESTING.md',
      'docs/CRUD_DEVELOPMENT_GUIDE.md'
    ]
    const barePermissionCommand =
      /pnpm (?:generate:permissions|permission:verify)(?!\s+--\s+--backend-root)/

    for (const filePath of maintainedDocs) {
      const content = readFileSync(join(REPOSITORY_ROOT, filePath), 'utf-8')
      expect(content, filePath).not.toMatch(barePermissionCommand)
    }
  })

  it('does not retain live-backend contract hooks beside the canonical gates', () => {
    expect(existsSync(join(REPOSITORY_ROOT, '.claude/hooks/check-backend-api.sh'))).toBe(false)
    expect(existsSync(join(REPOSITORY_ROOT, 'scripts/hooks/pre-commit-check-api'))).toBe(false)

    const claudeSettings = readFileSync(
      join(REPOSITORY_ROOT, '.claude/settings.json'),
      'utf-8'
    )
    const crudGuide = readFileSync(
      join(REPOSITORY_ROOT, 'docs/CRUD_DEVELOPMENT_GUIDE.md'),
      'utf-8'
    )
    expect(claudeSettings).not.toContain('check-backend-api')
    expect(crudGuide).not.toMatch(/check-backend-api|pre-commit-check-api/)

    const packageJson = JSON.parse(
      readFileSync(join(REPOSITORY_ROOT, 'package.json'), 'utf-8')
    ) as { scripts: Record<string, string> }
    expect(packageJson.scripts).not.toHaveProperty('permission:generate')
  })

  it('does not expose retired SSE build configuration', () => {
    for (const filePath of ['Dockerfile', 'Jenkinsfile', '.env.development', '.env.production']) {
      const content = readFileSync(join(REPOSITORY_ROOT, filePath), 'utf-8')
      expect(content, filePath).not.toContain('VITE_SSE_URL')
    }
  })
})
