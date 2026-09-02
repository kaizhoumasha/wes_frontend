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
import { PERMISSIONS } from '@/api/generated/permissions'

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

  it('runs type checking once through the check command chain', () => {
    const packageJson = JSON.parse(
      readFileSync(join(REPOSITORY_ROOT, 'package.json'), 'utf-8')
    ) as { scripts: Record<string, string> }

    expect(packageJson.scripts.check).toBe('pnpm run lint')
    expect(packageJson.scripts.lint).toBe('pnpm run lint:all')
    expect(
      Object.entries(packageJson.scripts)
        .filter(([, command]) => command.includes('type:check'))
        .map(([name]) => name)
    ).toEqual(['lint:all'])
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

  it('excludes the canonical permission snapshot from Prettier writes', () => {
    const fileInfo = JSON.parse(
      execFileSync(
        'pnpm',
        ['exec', 'prettier', '--file-info', 'contracts/permissions.current.json'],
        {
          cwd: REPOSITORY_ROOT,
          encoding: 'utf-8'
        }
      )
    ) as { ignored: boolean }

    expect(fileInfo.ignored).toBe(true)
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
    makeExecutable(join(binRoot, 'pnpm'), '#!/bin/sh\n[ -z "$GIT_DIR" ] || exit 41\n')
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
    expect(workflow).toContain('run: pnpm permission:verify')
    expect(workflow).not.toContain('cloudflare-pages:')
    expect(workflow).not.toContain('wrangler pages deploy')
  })

  it('runs repository quality gates before the Jenkins image build', () => {
    const jenkinsfile = readFileSync(join(REPOSITORY_ROOT, 'Jenkinsfile'), 'utf-8')

    const testIndex = jenkinsfile.indexOf('pnpm run test')
    const contractTestIndex = jenkinsfile.indexOf('pnpm run contract:test')
    const contractVerifyIndex = jenkinsfile.indexOf('pnpm run contract:verify')
    const permissionVerifyIndex = jenkinsfile.indexOf('pnpm permission:verify')
    const exportIndex = jenkinsfile.indexOf(
      'pnpm export:release-consumer --out-dir artifacts/release-consumer'
    )
    const lintIndex = jenkinsfile.indexOf('pnpm run lint')
    const buildIndex = jenkinsfile.indexOf('pnpm run build:dev')
    const imageBuildIndex = jenkinsfile.indexOf("stage('Build Frontend Image')")

    expect(testIndex).toBeGreaterThan(-1)
    expect(contractTestIndex).toBeGreaterThan(testIndex)
    expect(contractVerifyIndex).toBeGreaterThan(contractTestIndex)
    expect(permissionVerifyIndex).toBeGreaterThan(contractVerifyIndex)
    expect(exportIndex).toBeGreaterThan(permissionVerifyIndex)
    expect(lintIndex).toBeGreaterThan(exportIndex)
    expect(buildIndex).toBeGreaterThan(lintIndex)
    expect(imageBuildIndex).toBeGreaterThan(buildIndex)
  })

  it('checks out Jenkins builds from the internal GitLab endpoint', () => {
    const jenkinsfile = readFileSync(join(REPOSITORY_ROOT, 'Jenkinsfile'), 'utf-8')

    expect(jenkinsfile).toContain('deleteDir()')
    expect(jenkinsfile).toContain(
      'git remote add origin http://192.168.0.220:9080/wes/wes_frontend.git'
    )
    expect(jenkinsfile).not.toContain(
      'git remote add origin https://git.zontecmes.com/wes/wes_frontend.git'
    )
    expect(jenkinsfile).toContain("credentialsId: 'gitlab-http-creds'")
    expect(jenkinsfile).toContain("usernameVariable: 'GITLAB_USERNAME'")
    expect(jenkinsfile).toContain("passwordVariable: 'GITLAB_PASSWORD'")
    expect(jenkinsfile).toContain('set +x')
    expect(jenkinsfile).toContain('timeout --kill-after=10s 180s')
    expect(jenkinsfile).toContain('for attempt in 1 2 3')
    expect(jenkinsfile).toContain('if [ "$attempt" -lt 3 ]')
    expect(jenkinsfile).toContain('sleep 10')
    expect(jenkinsfile).toContain('credential.helper=!f()')
    expect(jenkinsfile).toContain('fetch --no-tags --force origin')
    expect(jenkinsfile).not.toContain('--depth')
    expect(jenkinsfile).toContain(
      '"+refs/heads/${CI_SOURCE_BRANCH}:refs/remotes/origin/${CI_SOURCE_BRANCH}"'
    )
    expect(jenkinsfile).toContain(
      'git checkout --detach "refs/remotes/origin/${CI_SOURCE_BRANCH}"'
    )
    expect(jenkinsfile).not.toContain('zt_git.happyjack.cn')
    expect(jenkinsfile).not.toContain('checkout([')
    expect(jenkinsfile).toContain('env.gitlabMergeRequestLastCommit')
    expect(jenkinsfile).toContain(
      "git rev-parse \"refs/remotes/origin/${CI_SOURCE_BRANCH}^{commit}\""
    )
    expect(jenkinsfile).toContain(
      'boolean isManualBuild = !isMergeRequest && !gitlabActionType && !beforeCommit && !afterCommit'
    )
    expect(jenkinsfile).toContain(
      "env.CI_EVENT_TYPE = isManualBuild ? 'MANUAL' : (gitlabActionType ?: 'UNKNOWN')"
    )
    expect(jenkinsfile).toContain('if (isManualBuild)')
    expect(jenkinsfile).toContain('trustedSourceCommit = fetchedSourceCommit')
    expect(jenkinsfile.indexOf('git rev-parse "refs/remotes/origin/${CI_SOURCE_BRANCH}^{commit}"')).toBeLessThan(
      jenkinsfile.indexOf('if (isManualBuild)')
    )
    expect(jenkinsfile).toContain('Source event requires a non-zero 40-character trusted commit')
    expect(jenkinsfile).toContain('Fetched source ref must match the trusted event commit')
    expect(jenkinsfile).not.toContain('PreBuildMerge')
    expect(jenkinsfile).not.toContain('mergeTarget')
  })

  it('uses a cached CI tools image instead of installing tools in every quality run', () => {
    const jenkinsfile = readFileSync(join(REPOSITORY_ROOT, 'Jenkinsfile'), 'utf-8')
    const ciDockerfile = readFileSync(join(REPOSITORY_ROOT, 'docker/ci/Dockerfile'), 'utf-8')

    expect(jenkinsfile).toContain("stage('Build Frontend CI Tools Image')")
    expect(jenkinsfile).toContain('-f docker/ci/Dockerfile')
    expect(jenkinsfile).toContain('docker/ci')
    expect(jenkinsfile).toContain('"${CI_TOOLS_IMAGE}"')
    expect(jenkinsfile).not.toContain('apt-get update -qq')
    expect(jenkinsfile).not.toContain('corepack prepare pnpm@10.10.0 --activate')
    expect(ciDockerfile).toContain('FROM node:22-bookworm-slim')
    expect(ciDockerfile).toContain('apt-get install -y --no-install-recommends git')
    expect(ciDockerfile).toContain('corepack prepare pnpm@10.10.0 --activate')
  })

  it('applies the repository retry budget before the production dependency install', () => {
    const dockerfile = readFileSync(join(REPOSITORY_ROOT, 'Dockerfile'), 'utf-8')
    const npmrc = readFileSync(join(REPOSITORY_ROOT, '.npmrc'), 'utf-8')
    const retryConfigIndex = dockerfile.indexOf('COPY package.json pnpm-lock.yaml .npmrc ./')
    const installIndex = dockerfile.indexOf('RUN pnpm install --frozen-lockfile')
    const readPnpmConfig = (name: string): string =>
      execFileSync('pnpm', ['config', 'get', name], {
        cwd: REPOSITORY_ROOT,
        encoding: 'utf-8'
      }).trim()

    expect(retryConfigIndex).toBeGreaterThan(-1)
    expect(installIndex).toBeGreaterThan(retryConfigIndex)
    expect(dockerfile).not.toMatch(/--registry(?:=|\s)/i)
    expect(dockerfile).not.toContain('registry.npmmirror.com')
    expect(dockerfile).not.toMatch(/npm_config_registry/i)
    expect(dockerfile).not.toMatch(/pnpm\s+config\s+set\s+registry/i)
    expect(npmrc).not.toMatch(/^\s*registry\s*=/m)
    expect(readPnpmConfig('registry')).toBe('https://registry.npmjs.org/')
    expect(readPnpmConfig('fetch-retries')).toBe('5')
    expect(readPnpmConfig('fetch-retry-maxtimeout')).toBe('120000')
    expect(readPnpmConfig('fetch-timeout')).toBe('300000')
  })

  it('binds the frontend image to its own consumer artifacts and production inputs', () => {
    const dockerfile = readFileSync(join(REPOSITORY_ROOT, 'Dockerfile'), 'utf-8')
    const jenkinsfile = readFileSync(join(REPOSITORY_ROOT, 'Jenkinsfile'), 'utf-8')

    expect(dockerfile).toContain('ARG WES_VCS_REVISION')
    expect(dockerfile).toContain('ARG WES_SOURCE_TREE')
    expect(dockerfile).toContain('ARG WES_CONSUMER_OPENAPI_SHA256')
    expect(dockerfile).toContain('ARG WES_REQUIRED_OPERATIONS_SHA256')
    expect(dockerfile).toContain('ARG WES_REQUIRED_PERMISSIONS_SHA256')
    expect(dockerfile).toContain('ARG WES_FRONTEND_DEPENDENCIES_SHA256')
    expect(dockerfile).toContain('ARG WES_FRONTEND_RECIPE_SHA256')
    expect(dockerfile).toContain('revision: process.env.WES_VCS_REVISION')
    expect(dockerfile).toContain('sourceTree: process.env.WES_SOURCE_TREE')
    expect(dockerfile).toContain('org.opencontainers.image.revision="${WES_VCS_REVISION}"')
    expect(dockerfile).toContain('com.zontec.wes.source-manifest="${WES_SOURCE_TREE}"')
    expect(dockerfile).toContain(
      'org.wes.release.consumer-openapi.sha256="${WES_CONSUMER_OPENAPI_SHA256}"'
    )
    expect(dockerfile).toContain(
      'org.wes.release.required-operations.sha256="${WES_REQUIRED_OPERATIONS_SHA256}"'
    )
    expect(dockerfile).toContain(
      'org.wes.release.required-permissions.sha256="${WES_REQUIRED_PERMISSIONS_SHA256}"'
    )
    expect(dockerfile).toContain(
      'org.wes.release.frontend-dependencies.sha256="${WES_FRONTEND_DEPENDENCIES_SHA256}"'
    )
    expect(dockerfile).toContain(
      'org.wes.release.frontend-recipe.sha256="${WES_FRONTEND_RECIPE_SHA256}"'
    )
    expect(dockerfile).toContain(
      'COPY --from=builder /app/artifacts/release-consumer/consumer-openapi.json /opt/wes/release/consumer-openapi.json'
    )
    expect(dockerfile).toContain(
      'COPY --from=builder /app/artifacts/release-consumer/required-operations.json /opt/wes/release/required-operations.json'
    )
    expect(dockerfile).toContain(
      'COPY --from=builder /app/artifacts/release-consumer/required-permissions.json /opt/wes/release/required-permissions.json'
    )
    expect(dockerfile).not.toContain('/opt/wes/release/consumer-fingerprints.json')
    expect(dockerfile).not.toContain('WES_BACKEND_CONTRACT_REVISION')
    expect(dockerfile).not.toContain('backend-contract-revision')
    expect(jenkinsfile).toContain(
      "String sourceTree = sh(returnStdout: true, script: 'git rev-parse HEAD^{tree}').trim()"
    )
    expect(jenkinsfile).toContain('env.CI_SOURCE_TREE = sourceTree')
    expect(jenkinsfile).toContain('--build-arg WES_VCS_REVISION="${CI_COMMIT_SHA}"')
    expect(jenkinsfile).toContain('--build-arg WES_SOURCE_TREE="${CI_SOURCE_TREE}"')
    expect(jenkinsfile).not.toMatch(/BACKEND_(?:IMAGE|COMMIT|CONTRACT)/)
    expect(jenkinsfile).not.toContain('DEPLOY_SOURCE_COMMIT')
    expect(jenkinsfile).not.toContain('release-consumer-build.env')
    expect(jenkinsfile).not.toMatch(/^\s*\. artifacts\//m)
    expect(jenkinsfile).toContain("split('\\n', -1)")
    expect(jenkinsfile).toContain('/^[0-9a-f]{64}$/')
  })

  it('exports once, publishes develop independently, and never triggers deployment', () => {
    const jenkinsfile = readFileSync(join(REPOSITORY_ROOT, 'Jenkinsfile'), 'utf-8')
    const exportCommand = 'pnpm export:release-consumer --out-dir artifacts/release-consumer'
    const pushStage = jenkinsfile.slice(
      jenkinsfile.indexOf("stage('Push Frontend Image')"),
      jenkinsfile.indexOf('\n    }\n\n    post {')
    )

    expect(jenkinsfile.match(new RegExp(exportCommand, 'g'))).toHaveLength(1)
    expect(jenkinsfile.indexOf(exportCommand)).toBeLessThan(
      jenkinsfile.indexOf("stage('Build Frontend Image')")
    )
    expect(jenkinsfile).toContain('artifacts/release-consumer/*')
    expect(jenkinsfile).toContain('env.CI_DOCKER_IMAGE_COMMIT = "${env.IMAGE_REPO}:${fullCommit}"')
    expect(jenkinsfile).toContain('env.CI_DOCKER_IMAGE_CHANNEL = "${env.IMAGE_REPO}:develop"')
    expect(pushStage).toContain("env.CI_EVENT_TYPE == 'PUSH'")
    expect(pushStage).toContain("env.CI_IS_MERGE_REQUEST != 'true'")
    expect(pushStage).toContain("env.CI_SOURCE_BRANCH == 'develop'")
    expect(pushStage).not.toContain('CI_PAIRED_RELEASE')
    expect(jenkinsfile).not.toContain("stage('Trigger Test Deploy')")
    expect(jenkinsfile).not.toContain('wes_test_deploy')
    expect(jenkinsfile).not.toContain('parameters {')
  })

  it('documents permission generation and verification as offline commands', () => {
    const maintainedDocs = [
      'README.md',
      'CLAUDE.md',
      'docs/CONTRACT_FRONTEND_DEVELOPMENT_MANUAL.md',
      'docs/CONTRACT_SYNC_WORKFLOW.md',
      'docs/CONTRACT_TESTING.md',
      'docs/CRUD_DEVELOPMENT_GUIDE.md'
    ]
    const permissionCommandWithBackendCheckout =
      /pnpm (?:generate:permissions|permission:verify)[^\n]*--backend-root/

    for (const filePath of maintainedDocs) {
      const content = readFileSync(join(REPOSITORY_ROOT, filePath), 'utf-8')
      expect(content, filePath).not.toMatch(permissionCommandWithBackendCheckout)
    }
  })

  it('does not retain live-backend contract hooks beside the canonical gates', () => {
    expect(existsSync(join(REPOSITORY_ROOT, '.claude/hooks/check-backend-api.sh'))).toBe(false)
    expect(existsSync(join(REPOSITORY_ROOT, 'scripts/hooks/pre-commit-check-api'))).toBe(false)

    const claudeSettings = readFileSync(join(REPOSITORY_ROOT, '.claude/settings.json'), 'utf-8')
    const crudGuide = readFileSync(join(REPOSITORY_ROOT, 'docs/CRUD_DEVELOPMENT_GUIDE.md'), 'utf-8')
    expect(claudeSettings).not.toContain('check-backend-api')
    expect(crudGuide).not.toMatch(/check-backend-api|pre-commit-check-api/)

    const packageJson = JSON.parse(
      readFileSync(join(REPOSITORY_ROOT, 'package.json'), 'utf-8')
    ) as { scripts: Record<string, string> }
    expect(packageJson.scripts).not.toHaveProperty('permission:generate')
  })

  it('does not publish the retired menu contract or permission family', () => {
    const packageJson = JSON.parse(
      readFileSync(join(REPOSITORY_ROOT, 'package.json'), 'utf-8')
    ) as { scripts: Record<string, string> }
    const dockerfile = readFileSync(join(REPOSITORY_ROOT, 'Dockerfile'), 'utf-8')
    const jenkinsfile = readFileSync(join(REPOSITORY_ROOT, 'Jenkinsfile'), 'utf-8')
    const generatedPermissions = JSON.stringify(PERMISSIONS)

    expect(packageJson.scripts).not.toHaveProperty('generate:menu')
    expect(packageJson.scripts).not.toHaveProperty('menu:generate')
    expect(dockerfile).not.toContain('menu-manifest.json')
    expect(jenkinsfile).not.toContain('menu-manifest.json')
    expect(generatedPermissions).not.toContain('admin:menu:')
  })

  it('does not expose retired SSE build configuration', () => {
    for (const filePath of ['Dockerfile', 'Jenkinsfile', '.env.development', '.env.production']) {
      const content = readFileSync(join(REPOSITORY_ROOT, filePath), 'utf-8')
      expect(content, filePath).not.toContain('VITE_SSE_URL')
    }
  })
})
