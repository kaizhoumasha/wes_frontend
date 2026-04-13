/**
 * Mock Utilities for Testing
 *
 * Provides reusable mock factories for common dependencies
 */

import { vi } from 'vitest'

/**
 * Create a mock fetcher function for detail panel tests
 */
export function createMockFetcher<T>(data: T, delay = 0) {
  return vi.fn(async (id: number) => {
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay))
    }
    if (id === -1) {
      throw new Error('Not found')
    }
    return data
  })
}

/**
 * Create a mock entity for testing
 */
export function createMockEntity(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    name: 'Test Entity',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    ...overrides
  }
}

/**
 * Create a mock detail config
 */
export function createMockDetailConfig(overrides = {}) {
  return {
    title: 'Test Detail',
    entityTypeLabel: '测试实体',
    sections: [],
    showActions: false,
    ...overrides
  }
}

/**
 * Create a mock section config
 */
export function createMockSection(overrides = {}) {
  return {
    title: 'Test Section',
    weight: 'primary' as const,
    variant: 'card' as const,
    fields: [],
    ...overrides
  }
}

/**
 * Create a mock field config
 */
export function createMockField(overrides = {}) {
  return {
    key: 'name',
    label: '名称',
    ...overrides
  }
}

/**
 * Mock window.innerWidth for responsive tests
 */
export function mockViewportWidth(width: number) {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width
  })
  window.dispatchEvent(new Event('resize'))
}

/**
 * Restore viewport to default
 */
export function restoreViewport() {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 1024
  })
}
