/**
 * Vitest Test Setup
 *
 * Global setup for all tests including:
 * - Vue Test Utils configuration
 * - Global mocks
 * - DOM environment
 */

import { config } from '@vue/test-utils'

function createMemoryStorage(): Storage {
  const store = new Map<string, string>()

  return {
    get length() {
      return store.size
    },
    clear() {
      store.clear()
    },
    getItem(key: string) {
      return store.get(key) ?? null
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null
    },
    removeItem(key: string) {
      store.delete(key)
    },
    setItem(key: string, value: string) {
      store.set(key, value)
    }
  }
}

const testLocalStorage = createMemoryStorage()
const testSessionStorage = createMemoryStorage()

Object.defineProperty(window, 'localStorage', {
  configurable: true,
  writable: true,
  value: testLocalStorage
})

Object.defineProperty(window, 'sessionStorage', {
  configurable: true,
  writable: true,
  value: testSessionStorage
})

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  writable: true,
  value: testLocalStorage
})

Object.defineProperty(globalThis, 'sessionStorage', {
  configurable: true,
  writable: true,
  value: testSessionStorage
})

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
