/**
 * Vitest Test Setup
 *
 * Global setup for all tests including:
 * - Vue Test Utils configuration
 * - Global mocks
 * - DOM environment
 */

import { config } from '@vue/test-utils'

// Mock window.matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false
  })
})

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Global Vue Test Utils config
config.global.stubs = {
  // Stub Element Plus components by default
  ElDrawer: true,
  ElDialog: true,
  ElButton: true,
  ElTooltip: true,
  ElSkeleton: true,
  ElEmpty: true,
  ElAlert: true,
  ElTag: true,
  ElTable: true,
  ElCollapseTransition: true
}