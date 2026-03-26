/**
 * CrudDetailSection Integration Tests
 *
 * Tests for the detail section component including:
 * - Visibility control
 * - Visual styling variants
 * - Collapse behavior
 * - Field rendering
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent } from 'vue'
import CrudDetailSection from '@/components/common/crud-page/detail/CrudDetailSection.vue'
import type { CrudPageEntity } from '@/components/common/crud-page/types'
import type { CrudPageDetailSection } from '@/components/common/crud-page/detail/types'

/* eslint-disable vue/one-component-per-file, vue/require-prop-types */
// Mock Element Plus components
const MockCollapseTransition = defineComponent({
  name: 'ElCollapseTransition',
  setup(_, { slots }) {
    return () => slots.default ? slots.default() : null
  }
})

const MockTag = defineComponent({
  name: 'ElTag',
  props: ['type', 'size', 'effect'],
  template: '<span class="mock-tag"><slot /></span>'
})

const MockEmpty = defineComponent({
  name: 'ElEmpty',
  props: ['description', 'image'],
  template: '<div class="mock-empty">{{ description }}</div>'
})

const MockTable = defineComponent({
  name: 'ElTable',
  props: ['data', 'size', 'border'],
  template: '<table class="mock-table"><slot /></table>'
})

MockTable.Column = defineComponent({
  name: 'ElTableColumn',
  props: ['prop', 'label'],
  template: '<th class="mock-table-column">{{ label }}</th>'
})

// Mock AppIcon
const MockAppIcon = defineComponent({
  name: 'AppIcon',
  props: ['icon', 'size'],
  template: '<span class="mock-icon" :data-icon="icon" />'
})

// Mock CrudDetailField
const MockDetailField = defineComponent({
  name: 'CrudDetailField',
  props: ['field', 'item', 'appearance', 'emptyText', 'emptyDash'],
  template: '<div class="mock-detail-field">{{ field.key }}</div>'
})
/* eslint-enable vue/one-component-per-file, vue/require-prop-types */

interface TestEntity extends CrudPageEntity {
  name: string
  status?: string
}

describe('CrudDetailSection', () => {
  const mockItem = { id: 1, name: 'Test Item', status: 'active' } as TestEntity

  const createWrapper = (options: {
    props?: Partial<{
      section: CrudPageDetailSection<TestEntity>
      item: TestEntity
      collapsed: boolean
      emptyValue: { text?: string; icon?: string; dash?: boolean }
    }>
  } = {}): VueWrapper => {
    const defaultSection: CrudPageDetailSection<TestEntity> = {
      title: '基本信息',
      weight: 'primary',
      variant: 'card',
      fields: [
        { key: 'name', label: '名称' },
        { key: 'status', label: '状态' }
      ]
    }

    return mount(CrudDetailSection, {
      props: {
        section: defaultSection,
        item: mockItem,
        collapsed: false,
        ...options.props
      },
      global: {
        stubs: {
          ElCollapseTransition: MockCollapseTransition,
          ElTag: MockTag,
          ElEmpty: MockEmpty,
          ElTable: MockTable,
          'ElTable.Column': MockTable.Column,
          AppIcon: MockAppIcon,
          CrudDetailField: MockDetailField
        }
      }
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ==================== Visibility ====================

  describe('visibility', () => {
    it('should show section by default', () => {
      const wrapper = createWrapper()

      expect(wrapper.find('.detail-section').exists()).toBe(true)
    })

    it('should hide section when showWhen returns false', () => {
      const section: CrudPageDetailSection<TestEntity> = {
        title: '条件区块',
        showWhen: item => item.status === 'active',
        fields: []
      }

      const wrapper = createWrapper({
        props: {
          section,
          item: { ...mockItem, status: 'inactive' }
        }
      })

      expect(wrapper.find('.detail-section').exists()).toBe(false)
    })

    it('should show section when showWhen returns true', () => {
      const section: CrudPageDetailSection<TestEntity> = {
        title: '条件区块',
        showWhen: item => item.status === 'active',
        fields: []
      }

      const wrapper = createWrapper({
        props: { section }
      })

      expect(wrapper.find('.detail-section').exists()).toBe(true)
    })
  })

  // ==================== Visual Styling ====================

  describe('visual styling', () => {
    it('should apply primary weight class', () => {
      const wrapper = createWrapper({
        props: {
          section: { title: 'Test', weight: 'primary', fields: [] }
        }
      })

      expect(wrapper.find('.detail-section').classes()).toContain('detail-section--primary')
    })

    it('should apply secondary weight class', () => {
      const wrapper = createWrapper({
        props: {
          section: { title: 'Test', weight: 'secondary', fields: [] }
        }
      })

      expect(wrapper.find('.detail-section').classes()).toContain('detail-section--secondary')
    })

    it('should apply tertiary weight class', () => {
      const wrapper = createWrapper({
        props: {
          section: { title: 'Test', weight: 'tertiary', fields: [] }
        }
      })

      expect(wrapper.find('.detail-section').classes()).toContain('detail-section--tertiary')
    })

    it('should apply card variant class', () => {
      const wrapper = createWrapper({
        props: {
          section: { title: 'Test', variant: 'card', fields: [] }
        }
      })

      expect(wrapper.find('.detail-section').classes()).toContain('detail-section--card')
    })

    it('should apply flat variant class', () => {
      const wrapper = createWrapper({
        props: {
          section: { title: 'Test', variant: 'flat', fields: [] }
        }
      })

      expect(wrapper.find('.detail-section').classes()).toContain('detail-section--flat')
    })

    it('should apply outlined variant class', () => {
      const wrapper = createWrapper({
        props: {
          section: { title: 'Test', variant: 'outlined', fields: [] }
        }
      })

      expect(wrapper.find('.detail-section').classes()).toContain('detail-section--outlined')
    })

    it('should apply filled variant class', () => {
      const wrapper = createWrapper({
        props: {
          section: { title: 'Test', variant: 'filled', fields: [] }
        }
      })

      expect(wrapper.find('.detail-section').classes()).toContain('detail-section--filled')
    })

    it('should apply headless class when no title or icon', () => {
      const wrapper = createWrapper({
        props: {
          section: { fields: [] }
        }
      })

      expect(wrapper.find('.detail-section').classes()).toContain('detail-section--headless')
    })
  })

  // ==================== Collapse Behavior ====================

  describe('collapse behavior', () => {
    it('should show collapsed class when collapsed', () => {
      const wrapper = createWrapper({
        props: {
          section: { title: 'Test', collapsible: true, fields: [] },
          collapsed: true
        }
      })

      expect(wrapper.find('.detail-section').classes()).toContain('detail-section--collapsed')
    })

    it('should apply collapsible class', () => {
      const wrapper = createWrapper({
        props: {
          section: { title: 'Test', collapsible: true, fields: [] }
        }
      })

      expect(wrapper.find('.detail-section').classes()).toContain('detail-section--collapsible')
    })

    it('should emit toggle-collapse on header click', async () => {
      const wrapper = createWrapper({
        props: {
          section: { title: 'Test', collapsible: true, fields: [] }
        }
      })

      await wrapper.find('.detail-section__header').trigger('click')

      expect(wrapper.emitted('toggle-collapse')).toBeTruthy()
    })

    it('should not emit toggle-collapse when not collapsible', async () => {
      const wrapper = createWrapper({
        props: {
          section: { title: 'Test', collapsible: false, fields: [] }
        }
      })

      await wrapper.find('.detail-section__header').trigger('click')

      expect(wrapper.emitted('toggle-collapse')).toBeFalsy()
    })

    it('should have clickable header class when collapsible', () => {
      const wrapper = createWrapper({
        props: {
          section: { title: 'Test', collapsible: true, fields: [] }
        }
      })

      expect(wrapper.find('.detail-section__header').classes()).toContain('detail-section__header--clickable')
    })
  })

  // ==================== Field Rendering ====================

  describe('field rendering', () => {
    it('should render fields', () => {
      const wrapper = createWrapper()

      const fields = wrapper.findAll('.mock-detail-field')
      expect(fields.length).toBe(2)
    })

    it('should pass field props to CrudDetailField', () => {
      const wrapper = createWrapper()

      const field = wrapper.find('.mock-detail-field')
      expect(field.text()).toContain('name')
    })

    it('should handle empty fields array', () => {
      const wrapper = createWrapper({
        props: {
          section: { title: 'Empty', fields: [] }
        }
      })

      expect(wrapper.findAll('.mock-detail-field').length).toBe(0)
    })
  })

  // ==================== Header Rendering ====================

  describe('header rendering', () => {
    it('should render title', () => {
      const wrapper = createWrapper()

      expect(wrapper.find('.detail-section__title').text()).toBe('基本信息')
    })

    it('should render icon when provided', () => {
      const wrapper = createWrapper({
        props: {
          section: { title: 'Test', icon: 'ep:user', fields: [] }
        }
      })

      expect(wrapper.find('.mock-icon').exists()).toBe(true)
      expect(wrapper.find('.mock-icon').attributes('data-icon')).toBe('ep:user')
    })

    it('should hide header when no title or icon', () => {
      const wrapper = createWrapper({
        props: {
          section: { fields: [] }
        }
      })

      expect(wrapper.find('.detail-section__header').exists()).toBe(false)
    })
  })

  // ==================== Props ====================

  describe('props', () => {
    it('should use default collapsed value', () => {
      const wrapper = createWrapper()

      expect(wrapper.find('.detail-section').classes()).not.toContain('detail-section--collapsed')
    })

    it('should pass emptyValue to fields', () => {
      const wrapper = createWrapper({
        props: {
          emptyValue: { text: 'N/A', dash: false }
        }
      })

      // Component should render without error
      expect(wrapper.find('.mock-detail-field').exists()).toBe(true)
    })
  })
})