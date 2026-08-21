import { describe, expect, it } from 'vitest'
import viteConfig from '../../../vite.config'

describe('Docker development dependency optimization', () => {
  it('prebundles Element Plus deep style imports before lazy routes are opened', () => {
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

      expect(config.optimizeDeps?.include).toContain('element-plus/es/components/**/style/index')
    } finally {
      if (previousFrontendAppDir === undefined) delete process.env.FRONTEND_APP_DIR
      else process.env.FRONTEND_APP_DIR = previousFrontendAppDir
    }
  })
})
