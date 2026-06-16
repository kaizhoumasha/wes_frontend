import { existsSync, readFileSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const REPO_ROOT = resolve(__dirname, '..', '..', '..', '..')

describe('WorklineReconciliationPanel removal (T9)', () => {
  it('does not leave the deleted component file behind', () => {
    const filePath = resolve(
      REPO_ROOT,
      'src/components/runtime/monitor/WorklineReconciliationPanel.vue'
    )
    expect(existsSync(filePath)).toBe(false)
  })

  it('has no residual `WorklineReconciliationPanel` import or usage in src', () => {
    let output: string
    try {
      output = execSync(
        'grep -rn "WorklineReconciliationPanel" src/ --include="*.vue" --include="*.ts" --include="*.tsx" || true',
        { cwd: REPO_ROOT, encoding: 'utf-8' }
      )
    } catch {
      output = ''
    }
    // Allow an empty output. Any non-empty output means a stale reference exists.
    expect(output.trim()).toBe('')
  })

  it('exposes WorklineReconciliationForm at the expected path', () => {
    const formPath = resolve(
      REPO_ROOT,
      'src/components/runtime/monitor/WorklineReconciliationForm.vue'
    )
    expect(existsSync(formPath)).toBe(true)
    const content = readFileSync(formPath, 'utf-8')
    expect(content).toContain('workline-reconciliation-form')
    expect(content).toContain('submitResolve')
  })
})
