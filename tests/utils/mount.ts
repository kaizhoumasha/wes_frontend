/**
 * Vue Component Mount Utilities
 *
 * Provides typed mounting functions for testing Vue components
 */

import { mount, type VueWrapper } from '@vue/test-utils'
import type { Component } from 'vue'

interface MountOptions {
  props?: Record<string, unknown>
  slots?: Record<string, unknown>
  global?: {
    stubs?: Record<string, boolean | Component>
    mocks?: Record<string, unknown>
    provide?: Record<string, unknown>
  }
}

/**
 * Mount a component with common defaults
 */
export function mountComponent<T extends Component>(
  component: T,
  options: MountOptions = {}
): VueWrapper {
  return mount(component, {
    props: options.props,
    slots: options.slots,
    global: {
      stubs: options.global?.stubs,
      mocks: options.global?.mocks,
      provide: options.global?.provide
    }
  })
}

/**
 * Create a mock router for component tests
 */
export function createMockRouter() {
  return {
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    currentRoute: {
      value: {
        path: '/',
        params: {},
        query: {}
      }
    }
  }
}

/**
 * Wait for Vue to process updates
 */
export async function flushPromises(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 0))
}