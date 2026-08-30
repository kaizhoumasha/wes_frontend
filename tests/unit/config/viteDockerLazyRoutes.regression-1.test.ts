// Regression: ISSUE-001 — cold lazy routes must not return 504 while dependency rediscovery runs.
// Found by /qa on 2026-08-30
// Report: wes_backend/.gstack/qa-reports/qa-report-127-0-0-1-15173-2026-08-30.md

import { describe, expect, it } from 'vitest'
import viteConfig from '../../../vite.config'

describe('Docker development lazy-route optimization', () => {
  it('keeps lazy-route requests valid while Vite refreshes optimized dependencies', () => {
    const previousFrontendAppDir = process.env.FRONTEND_APP_DIR
    process.env.FRONTEND_APP_DIR = '/app'

    try {
      if (typeof viteConfig !== 'function') throw new Error('vite config must be a function')
      const config = viteConfig({
        command: 'serve',
        mode: 'development',
        isSsrBuild: false,
        isPreview: false
      })

      expect(config.optimizeDeps?.ignoreOutdatedRequests).toBe(true)
      expect(config.optimizeDeps?.noDiscovery).not.toBe(true)
    } finally {
      if (previousFrontendAppDir === undefined) delete process.env.FRONTEND_APP_DIR
      else process.env.FRONTEND_APP_DIR = previousFrontendAppDir
    }
  })
})
