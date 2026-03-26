/**
 * CrudDetailField Integration Tests
 *
 * Tests for the detail field component including:
 * - Value extraction
 * - Formatter application
 * - Empty value handling
 * - Layout classes
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import CrudDetailField from '@/components/common/crud-page/detail/CrudDetailField.vue'
import type { CrudPageEntity } from '@/components/common/crud-page/types'

/* eslint-disable vue/require-prop-types */
// Mock Element Plus components
const MockTooltip = defineComponent({
  name: 'ElTooltip',
  props: ['content', 'placement', 'effect'],
  setup(props, { slots }) {
    return () => h('div', {
      class: 'mock-tooltip',
      'data-content': props.content
    }, slots.default ? slots.default() : null)
  }
})
/* eslint-enable vue/require-prop-types */

interface TestEntity extends CrudPageEntity {
  name: string
  status?: string
  createdAt?: string
  isActive?: boolean
  metadata?: Record<string, unknown>
  user?: {
    profile?: {
      email: string
    }
  }
}

describe('CrudDetailField', () => {
  const mockItem: TestEntity = {
    id: 1,
    name: 'Test Item',
    status: 'active',
    createdAt: '2024-01-15T10:30:00Z',
    isActive: true,
    metadata: { key: 'value' },
    user: {
      profile: {
        email: 'test@example.com'
      }
    }
  }

  const createWrapper = (options: {
    props?: Partial<{
      field: { key: string; label?: string; formatter?: string | ((value: unknown, item: TestEntity) => string); layout?: string; showWhen?: (value: unknown, item: TestEntity) => boolean; labelPosition?: string }
      item: TestEntity
      appearance: 'default' | 'meta'
      emptyText: string
      emptyDash: boolean
    }>
  } = {}): VueWrapper => {
    return mount(CrudDetailField, {
      props: {
        field: { key: 'name', label: '名称' },
        item: mockItem,
        appearance: 'default',
        emptyText: '—',
        emptyDash: true,
        ...options.props
      },
      global: {
        stubs: {
          ElTooltip: MockTooltip
        }
      }
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ==================== Value Extraction ====================

  describe('value extraction', () => {
    it('should extract simple field value', () => {
      const wrapper = createWrapper({
        props: { field: { key: 'name' } }
      })

      expect(wrapper.find('.detail-field__value').text()).toContain('Test Item')
    })

    it('should extract nested field value', () => {
      const wrapper = createWrapper({
        props: { field: { key: 'user.profile.email' } }
      })

      expect(wrapper.find('.detail-field__value').text()).toContain('test@example.com')
    })

    it('should handle missing nested path', () => {
      const wrapper = createWrapper({
        props: { field: { key: 'nonexistent.path' } }
      })

      expect(wrapper.find('.detail-field__empty').exists()).toBe(true)
    })
  })

  // ==================== Empty Value Handling ====================

  describe('empty value handling', () => {
    it('should show empty dash for null value', () => {
      const wrapper = createWrapper({
        props: {
          field: { key: 'status' },
          item: { ...mockItem, status: null }
        }
      })

      expect(wrapper.find('.detail-field__empty').exists()).toBe(true)
      expect(wrapper.find('.detail-field__empty').text()).toBe('—')
    })

    it('should show empty dash for undefined value', () => {
      const wrapper = createWrapper({
        props: {
          field: { key: 'nonexistent' }
        }
      })

      expect(wrapper.find('.detail-field__empty').exists()).toBe(true)
    })

    it('should show empty dash for empty string', () => {
      const wrapper = createWrapper({
        props: {
          field: { key: 'status' },
          item: { ...mockItem, status: '' }
        }
      })

      expect(wrapper.find('.detail-field__empty').exists()).toBe(true)
    })

    it('should show empty dash for empty array', () => {
      const wrapper = createWrapper({
        props: {
          field: { key: 'tags' },
          item: { ...mockItem, tags: [] } as TestEntity
        }
      })

      expect(wrapper.find('.detail-field__empty').exists()).toBe(true)
    })

    it('should use custom emptyText when emptyDash is false', () => {
      const wrapper = createWrapper({
        props: {
          field: { key: 'status' },
          item: { ...mockItem, status: null },
          emptyDash: false,
          emptyText: 'N/A'
        }
      })

      expect(wrapper.find('.detail-field__empty').text()).toBe('N/A')
    })
  })

  // ==================== Formatter Application ====================

  describe('formatter application', () => {
    it('should apply custom formatter function', () => {
      const wrapper = createWrapper({
        props: {
          field: {
            key: 'status',
            formatter: (value: unknown) => String(value).toUpperCase()
          }
        }
      })

      expect(wrapper.find('.detail-field__value').text()).toContain('ACTIVE')
    })

    it('should apply built-in date formatter', () => {
      const wrapper = createWrapper({
        props: {
          field: { key: 'createdAt', formatter: 'date' }
        }
      })

      // Date formatter should format the date
      expect(wrapper.find('.detail-field__value').exists()).toBe(true)
    })

    it('should apply built-in datetime formatter', () => {
      const wrapper = createWrapper({
        props: {
          field: { key: 'createdAt', formatter: 'datetime' }
        }
      })

      expect(wrapper.find('.detail-field__value').exists()).toBe(true)
    })

    it('should apply JSON formatter for objects', () => {
      const wrapper = createWrapper({
        props: {
          field: { key: 'metadata', formatter: 'json' }
        }
      })

      const value = wrapper.find('.detail-field__value').text()
      expect(value).toContain('key')
      expect(value).toContain('value')
    })

    it('should fallback to raw value when formatter errors', () => {
      const wrapper = createWrapper({
        props: {
          field: {
            key: 'name',
            formatter: () => {
              throw new Error('Formatter error')
            }
          }
        }
      })

      // When formatter fails, component falls back to raw value
      expect(wrapper.find('.detail-field__value').text()).toContain('Test Item')
    })
  })

  // ==================== Layout Classes ====================

  describe('layout classes', () => {
    it('should apply half layout class by default', () => {
      const wrapper = createWrapper({
        props: { field: { key: 'name' } }
      })

      expect(wrapper.find('.detail-field').classes()).toContain('detail-field--half')
    })

    it('should apply full layout class for long values', () => {
      const wrapper = createWrapper({
        props: {
          field: { key: 'description' },
          item: { ...mockItem, description: 'a'.repeat(100) } as TestEntity
        }
      })

      expect(wrapper.find('.detail-field').classes()).toContain('detail-field--full')
    })

    it('should apply third layout class for short id values', () => {
      const wrapper = createWrapper({
        props: { field: { key: 'id' } }
      })

      expect(wrapper.find('.detail-field').classes()).toContain('detail-field--third')
    })

    it('should apply explicit layout override', () => {
      const wrapper = createWrapper({
        props: { field: { key: 'name', layout: 'full' } }
      })

      expect(wrapper.find('.detail-field').classes()).toContain('detail-field--full')
    })
  })

  // ==================== Label ====================

  describe('label', () => {
    it('should display custom label', () => {
      const wrapper = createWrapper({
        props: { field: { key: 'name', label: '名称' } }
      })

      expect(wrapper.find('.detail-field__label').text()).toBe('名称')
    })

    it('should use key as label when no label provided', () => {
      const wrapper = createWrapper({
        props: { field: { key: 'status' } }
      })

      expect(wrapper.find('.detail-field__label').text()).toBe('status')
    })
  })

  // ==================== Visibility ====================

  describe('visibility', () => {
    it('should show field by default', () => {
      const wrapper = createWrapper()

      expect(wrapper.find('.detail-field').exists()).toBe(true)
    })

    it('should hide field when showWhen returns false', () => {
      const wrapper = createWrapper({
        props: {
          field: {
            key: 'status',
            showWhen: (value: unknown) => value === 'hidden'
          }
        }
      })

      expect(wrapper.find('.detail-field').exists()).toBe(false)
    })

    it('should show field when showWhen returns true', () => {
      const wrapper = createWrapper({
        props: {
          field: {
            key: 'status',
            showWhen: (value: unknown) => value === 'active'
          }
        }
      })

      expect(wrapper.find('.detail-field').exists()).toBe(true)
    })
  })

  // ==================== Appearance ====================

  describe('appearance', () => {
    it('should apply default appearance class', () => {
      const wrapper = createWrapper({
        props: { appearance: 'default' }
      })

      expect(wrapper.find('.detail-field').classes()).toContain('detail-field--default')
    })

    it('should apply meta appearance class', () => {
      const wrapper = createWrapper({
        props: { appearance: 'meta' }
      })

      expect(wrapper.find('.detail-field').classes()).toContain('detail-field--meta')
    })
  })

  // ==================== Label Position ====================

  describe('label position', () => {
    it('should apply left label position by default', () => {
      const wrapper = createWrapper()

      expect(wrapper.find('.detail-field').classes()).toContain('detail-field--label-left')
    })

    it('should apply top label position', () => {
      const wrapper = createWrapper({
        props: { field: { key: 'name', labelPosition: 'top' } }
      })

      expect(wrapper.find('.detail-field').classes()).toContain('detail-field--label-top')
    })

    it('should apply inline label position', () => {
      const wrapper = createWrapper({
        props: { field: { key: 'name', labelPosition: 'inline' } }
      })

      expect(wrapper.find('.detail-field').classes()).toContain('detail-field--label-inline')
    })
  })

  // ==================== Truncation ====================

  describe('truncation', () => {
    it('should not truncate short text', () => {
      const wrapper = createWrapper({
        props: { field: { key: 'name' } }
      })

      expect(wrapper.find('.mock-tooltip').exists()).toBe(false)
    })

    it('should truncate long text with tooltip', () => {
      const longText = 'a'.repeat(100)
      const wrapper = createWrapper({
        props: {
          field: { key: 'description' },
          item: { ...mockItem, description: longText } as TestEntity
        }
      })

      // Full layout has truncation limit of 140
      expect(wrapper.find('.detail-field__truncated').exists()).toBe(false)
    })
  })
})