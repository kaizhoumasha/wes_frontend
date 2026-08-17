import { execFileSync } from 'node:child_process'
import { existsSync, realpathSync } from 'node:fs'

function git(backendRoot: string, args: string[]): string {
  try {
    return execFileSync('git', args, {
      cwd: backendRoot,
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'pipe']
    }).trim()
  } catch (error) {
    const cause = error as NodeJS.ErrnoException & { stderr?: string | Buffer }
    const details =
      typeof cause.stderr === 'string'
        ? cause.stderr.trim()
        : cause.stderr?.toString('utf-8').trim()
    throw new Error(`无法检查后端 Git checkout${details ? `: ${details}` : ''}`)
  }
}

export function assertBackendCheckout(backendRoot: string, expectedCommit?: string): string {
  if (!existsSync(backendRoot)) {
    throw new Error(`后端目录不存在: ${backendRoot}`)
  }

  const resolvedRoot = realpathSync(backendRoot)
  const repositoryRoot = realpathSync(git(resolvedRoot, ['rev-parse', '--show-toplevel']))
  if (repositoryRoot !== resolvedRoot) {
    throw new Error(`后端目录必须是 Git checkout 根目录: ${backendRoot}`)
  }

  const branch = git(resolvedRoot, ['branch', '--show-current'])
  if (branch !== 'develop') {
    throw new Error(`后端分支必须是 develop，当前为: ${branch || '(detached HEAD)'}`)
  }

  const dirty = git(resolvedRoot, ['status', '--porcelain=v1', '--untracked-files=normal'])
  if (dirty) {
    throw new Error(`后端工作树不干净，拒绝读取契约: ${resolvedRoot}`)
  }

  const head = git(resolvedRoot, ['rev-parse', 'HEAD'])
  if (expectedCommit && head !== expectedCommit) {
    throw new Error(`后端 commit 不匹配：期望 ${expectedCommit}，实际 ${head}`)
  }

  return head
}
