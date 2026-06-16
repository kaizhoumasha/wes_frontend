import { existsSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const REPO_ROOT = resolve(__dirname, '..', '..', '..', '..')

describe('WorklineSafetyIncidentPanel removal (T10)', () => {
  it('does not leave the deleted component file behind', () => {
    const filePath = resolve(
      REPO_ROOT,
      'src/components/runtime/monitor/WorklineSafetyIncidentPanel.vue'
    )
    expect(existsSync(filePath)).toBe(false)
  })

  it('has no residual `WorklineSafetyIncidentPanel` import or usage in src', () => {
    let output: string
    try {
      output = execSync(
        'grep -rn "WorklineSafetyIncidentPanel" src/ --include="*.vue" --include="*.ts" --include="*.tsx" || true',
        { cwd: REPO_ROOT, encoding: 'utf-8' }
      )
    } catch {
      output = ''
    }
    // Allow an empty output. Any non-empty output means a stale reference exists.
    expect(output.trim()).toBe('')
  })

  it('has no residual `WorklineSafetyIncidentPanel` reference in tests', () => {
    let output: string
    try {
      // Exclude this test file from the grep — it legitimately contains the
      // identifier in describe/it strings to assert the removal.
      output = execSync(
        'grep -rn "WorklineSafetyIncidentPanel" tests/ --include="*.vue" --include="*.ts" --include="*.tsx" ' +
          '| grep -v "worklineSafetyIncidentPanelRemoval.test.ts" || true',
        { cwd: REPO_ROOT, encoding: 'utf-8' }
      )
    } catch {
      output = ''
    }
    expect(output.trim()).toBe('')
  })

  it('exposes the dashboard-v3 replacement components at the expected paths', () => {
    const components = [
      'MonitorAlertCard.vue',
      'MonitorCommandChain.vue',
      'MonitorDeviceActionGroup.vue',
      'MonitorToteTwinCard.vue',
      'MonitorRackOccupancyMatrix.vue'
    ]
    for (const name of components) {
      const filePath = resolve(REPO_ROOT, 'src/components/runtime/monitor', name)
      expect(existsSync(filePath)).toBe(true)
    }
  })
})
