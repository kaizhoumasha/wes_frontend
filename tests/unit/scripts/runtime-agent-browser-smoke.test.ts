import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('runtime agent browser smoke script', () => {
  it('checks mobile monitor pane navigation before scene assertions', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'scripts/runtime-agent-browser-smoke.sh'),
      'utf8'
    )

    expect(source).toContain('assert_monitor_mobile_panes')
    expect(source).toContain('[data-test="monitor-mobile-pane-line"]')
    expect(source).toContain('[data-test="monitor-mobile-pane-scene"]')
    expect(source).toContain('[data-test="monitor-mobile-pane-actions"]')
    expect(source).toContain('ab click "[data-test=\\"monitor-mobile-pane-actions\\"]"')
    expect(source).toContain('ab click "[data-test=\\"monitor-mobile-pane-scene\\"]"')
  })

  it('checks the immersive monitor shell in both light and dark themes', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'scripts/runtime-agent-browser-smoke.sh'),
      'utf8'
    )

    expect(source).toContain('set_monitor_theme')
    expect(source).toContain('assert_monitor_immersive_shell')
    expect(source).toContain('[data-test="monitor-shell-topbar"]')
    expect(source).toContain('[data-test="monitor-theme-toggle"]')
    expect(source).toContain('monitor-desktop-dark')
    expect(source).toContain('monitor-mobile-light')
    expect(source).toContain('document.documentElement.classList')
  })

  it('checks business projection details from the right-side monitor panel', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'scripts/runtime-agent-browser-smoke.sh'),
      'utf8'
    )

    expect(source).toContain('select_monitor_first_device')
    expect(source).toContain('assert_monitor_business_projection')
    expect(source).toContain('[data-test="monitor-side-tab-business"]')
    expect(source).toContain('[data-test="monitor-business-projection"]')
    expect(source).not.toContain('[data-test="runtime-scene-station-lease"]')
    expect(source).not.toContain('[data-test="runtime-scene-rack-operation"]')
    expect(source).not.toContain('[data-test="runtime-scene-rack-snapshot"]')
    expect(source).not.toContain('[data-test="runtime-rack-layout-panel"]')
    expect(source).not.toContain('[data-test="runtime-rack-inspector"]')
  })
})
