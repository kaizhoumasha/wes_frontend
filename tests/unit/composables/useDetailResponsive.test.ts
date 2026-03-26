/**
 * useDetailResponsive Composable Tests
 *
 * Tests for responsive behavior including:
 * - Mode detection (drawer/dialog)
 * - Width calculation
 * - Fullscreen detection
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useDetailResponsive } from '@/components/common/crud-page/detail/composables/useDetailResponsive'
import { mockViewportWidth, restoreViewport } from '../../utils/mock'
import type { CrudPageDetailConfig } from '@/components/common/crud-page/detail/types'

// Mock useResponsiveLayout
vi.mock('@/composables/useResponsiveLayout', () => ({
  useResponsiveLayout: () => {
    let currentWidth = 1024
    // Get the current window width
    if (typeof window !== 'undefined') {
      currentWidth = window.innerWidth
    }
    return {
      isMobile: { value: currentWidth < 768 },
      isTablet: { value: currentWidth >= 768 && currentWidth < 1280 },
      isDesktop: { value: currentWidth >= 1280 }
    }
  }
}))

describe('useDetailResponsive', () => {
  beforeEach(() => {
    restoreViewport()
    vi.clearAllMocks()
  })

  afterEach(() => {
    restoreViewport()
  })

  describe('mode detection', () => {
    it('should use drawer mode on desktop (>= 1280px)', () => {
      mockViewportWidth(1400)
      const responsive = useDetailResponsive({})

      expect(responsive.resolvedMode.value).toBe('drawer')
    })

    it('should use fullScreen mode on mobile (< 768px)', () => {
      mockViewportWidth(500)
      const responsive = useDetailResponsive({})

      expect(responsive.resolvedMode.value).toBe('fullScreen')
    })

    it('should use drawer mode on tablet (768-1279px)', () => {
      mockViewportWidth(1000)
      const responsive = useDetailResponsive({})

      expect(responsive.resolvedMode.value).toBe('drawer')
    })

    it('should respect config mode override', () => {
      mockViewportWidth(1400)
      const config: CrudPageDetailConfig<{ id: number }> = {
        mode: 'dialog'
      }
      const responsive = useDetailResponsive(config)

      expect(responsive.resolvedMode.value).toBe('dialog')
    })
  })

  describe('width calculation', () => {
    it('should use default width when not specified', () => {
      const responsive = useDetailResponsive({})

      // Default drawer width
      expect(responsive.resolvedWidth.value).toBeDefined()
    })

    it('should use config width when specified', () => {
      const responsive = useDetailResponsive({ width: 600 })

      expect(responsive.resolvedWidth.value).toBe(600)
    })

    it('should use responsive tablet width on tablet', () => {
      mockViewportWidth(1000)
      const responsive = useDetailResponsive({
        responsive: {
          tablet: { width: 500 }
        }
      })

      expect(responsive.resolvedWidth.value).toBe(500)
    })
  })

  describe('fullscreen detection', () => {
    it('should be fullscreen on mobile', () => {
      mockViewportWidth(500)
      const responsive = useDetailResponsive({})

      expect(responsive.isFullscreen.value).toBe(true)
    })

    it('should not be fullscreen on desktop', () => {
      mockViewportWidth(1400)
      const responsive = useDetailResponsive({})

      expect(responsive.isFullscreen.value).toBe(false)
    })
  })

  describe('isMobile', () => {
    it('should be true on mobile viewport', () => {
      mockViewportWidth(500)
      const responsive = useDetailResponsive({})

      expect(responsive.isMobile.value).toBe(true)
    })

    it('should be false on desktop viewport', () => {
      mockViewportWidth(1400)
      const responsive = useDetailResponsive({})

      expect(responsive.isMobile.value).toBe(false)
    })
  })
})