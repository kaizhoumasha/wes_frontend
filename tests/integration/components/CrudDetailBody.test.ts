/**
 * CrudDetailBody Integration Tests
 *
 * Tests for the detail body component including:
 * - Loading state
 * - Error state
 * - Empty state
 * - Normal content rendering
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import CrudDetailBody from '@/components/common/crud-page/detail/CrudDetailBody.vue'
import type { CrudPageEntity } from '@/components/common/crud-page/types'
import type { CrudPageDetailSection } from '@/components/common/crud-page/detail/types'

/* eslint-disable vue/one-component-per-file, vue/require-prop-types */
// Mock Element Plus components
const MockSkeleton = defineComponent({
  name: 'ElSkeleton',
  props: ['rows', 'animated'],
  template: '<div class="mock-skeleton" :data-rows="rows">Loading...</div>'
})

const MockAlert = defineComponent({
  name: 'ElAlert',
  props: ['type', 'title', 'showIcon', 'closable'],
  emits: ['close'],
  setup(props, { slots }) {
    return () => h('div', {
      class: ['mock-alert', `mock-alert--${props.type}`],
      'data-title': props.title
    }, [
      h('span', { class: 'mock-alert__title' }, props.title),
      slots.default ? slots.default() : null
    ])
  }
})

const MockEmpty = defineComponent({
  name: 'ElEmpty',
  props: ['description', 'image'],
  setup(props, { slots }) {
    return () => h('div', { class: 'mock-empty' }, [
      slots.description ? slots.description() : h('p', props.description),
      slots.default ? slots.default() : null
    ])
  }
})

const MockButton = defineComponent({
  name: 'ElButton',
  props: ['size', 'type'],
  emits: ['click'],
  setup(props, { emit, slots }) {
    return () => h('button', {
      class: 'mock-button',
      'data-size': props.size,
      'data-type': props.type,
      onClick: () => emit('click')
    }, slots.default ? slots.default() : 'Button')
  }
})

const MockDetailSection = defineComponent({
  name: 'CrudDetailSection',
  props: ['section', 'item', 'collapsed', 'emptyValue'],
  emits: ['toggleCollapse'],
  template: '<div class="mock-detail-section" :data-collapsed="collapsed">{{ section.title }}</div>'
})
/* eslint-enable vue/one-component-per-file, vue/require-prop-types */

interface TestEntity extends CrudPageEntity {
  name: string
}

describe('CrudDetailBody', () => {
  const mockSections: CrudPageDetailSection<TestEntity>[] = [
    { title: '基本信息', weight: 'primary', fields: [] },
    { title: '详细信息', weight: 'secondary', fields: [] },
    { title: '元数据', weight: 'tertiary', fields: [] }
  ]

  const mockItem = { id: 1, name: 'Test Item' } as TestEntity

  const mockHandlers = {
    isSectionCollapsed: vi.fn(() => false),
    onToggleCollapse: vi.fn(),
    onRefresh: vi.fn()
  }

  const createWrapper = (options: {
    props?: Partial<{
      loading: boolean
      error: Error | null
      item: TestEntity | null
      sections: CrudPageDetailSection<TestEntity>[]
      emptyValue: { text?: string; icon?: string; dash?: boolean }
      isSectionCollapsed: (section: CrudPageDetailSection<TestEntity>) => boolean
      onToggleCollapse: (section: CrudPageDetailSection<TestEntity>) => void
      onRefresh: () => void
    }>
  } = {}): VueWrapper => {
    return mount(CrudDetailBody, {
      props: {
        loading: false,
        error: null,
        item: mockItem,
        sections: mockSections,
        isSectionCollapsed: mockHandlers.isSectionCollapsed,
        onToggleCollapse: mockHandlers.onToggleCollapse,
        onRefresh: mockHandlers.onRefresh,
        ...options.props
      },
      global: {
        stubs: {
          ElSkeleton: MockSkeleton,
          ElAlert: MockAlert,
          ElEmpty: MockEmpty,
          ElButton: MockButton,
          CrudDetailSection: MockDetailSection
        }
      }
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ==================== Loading State ====================

  describe('loading state', () => {
    it('should show skeleton when loading', () => {
      const wrapper = createWrapper({ props: { loading: true } })

      expect(wrapper.find('.mock-skeleton').exists()).toBe(true)
      expect(wrapper.find('.mock-skeleton').attributes('data-rows')).toBe('5')
    })

    it('should not show content when loading', () => {
      const wrapper = createWrapper({ props: { loading: true } })

      expect(wrapper.find('.detail-panel__content').exists()).toBe(false)
      expect(wrapper.find('.mock-alert').exists()).toBe(false)
      expect(wrapper.find('.mock-empty').exists()).toBe(false)
    })
  })

  // ==================== Error State ====================

  describe('error state', () => {
    const testError = new Error('Network error')

    it('should show error alert when error exists', () => {
      const wrapper = createWrapper({ props: { loading: false, error: testError } })

      const alert = wrapper.find('.mock-alert')
      expect(alert.exists()).toBe(true)
      expect(alert.classes()).toContain('mock-alert--error')
    })

    it('should display error message', () => {
      const wrapper = createWrapper({ props: { loading: false, error: testError } })

      const alert = wrapper.find('.mock-alert')
      expect(alert.attributes('data-title')).toContain('Network error')
    })

    it('should have retry button in error state', () => {
      const wrapper = createWrapper({ props: { loading: false, error: testError } })

      const button = wrapper.find('.mock-button')
      expect(button.exists()).toBe(true)
    })

    it('should call onRefresh when retry button clicked', async () => {
      const wrapper = createWrapper({ props: { loading: false, error: testError } })

      const button = wrapper.find('.mock-button')
      await button.trigger('click')

      expect(mockHandlers.onRefresh).toHaveBeenCalledTimes(1)
    })

    it('should not show content when error exists', () => {
      const wrapper = createWrapper({ props: { loading: false, error: testError } })

      expect(wrapper.find('.detail-panel__content').exists()).toBe(false)
    })
  })

  // ==================== Empty State ====================

  describe('empty state', () => {
    it('should show empty state when item is null', () => {
      const wrapper = createWrapper({ props: { item: null } })

      expect(wrapper.find('.mock-empty').exists()).toBe(true)
    })

    it('should show empty text and hint', () => {
      const wrapper = createWrapper({ props: { item: null } })

      expect(wrapper.find('.detail-panel__empty-text').exists()).toBe(true)
      expect(wrapper.find('.detail-panel__empty-hint').exists()).toBe(true)
    })

    it('should have close button in empty state', () => {
      const wrapper = createWrapper({ props: { item: null } })

      const buttons = wrapper.findAll('.mock-button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should emit close when close button clicked', async () => {
      const wrapper = createWrapper({ props: { item: null } })

      const button = wrapper.find('.mock-button')
      await button.trigger('click')

      expect(wrapper.emitted('close')).toBeTruthy()
    })
  })

  // ==================== Content State ====================

  describe('content state', () => {
    it('should show content when item exists and no error/loading', () => {
      const wrapper = createWrapper()

      expect(wrapper.find('.detail-panel__content').exists()).toBe(true)
    })

    it('should render primary and secondary sections', () => {
      const wrapper = createWrapper()

      const sections = wrapper.findAll('.mock-detail-section')
      // Total sections = 3 (primary + secondary in content, tertiary in footer-meta)
      expect(sections.length).toBe(3)
    })

    it('should render tertiary sections in footer meta', () => {
      const wrapper = createWrapper()

      expect(wrapper.find('.detail-panel__footer-meta').exists()).toBe(true)
    })

    it('should pass collapsed state to sections', () => {
      const collapsedHandler = vi.fn((section) => section.title === '详细信息')
      const wrapper = createWrapper({
        props: { isSectionCollapsed: collapsedHandler }
      })

      const sections = wrapper.findAll('.mock-detail-section')
      expect(sections[0].attributes('data-collapsed')).toBe('false')
      expect(sections[1].attributes('data-collapsed')).toBe('true')
    })

    it('should not show footer meta when no tertiary sections', () => {
      const sectionsWithoutTertiary: CrudPageDetailSection<TestEntity>[] = [
        { title: '基本信息', weight: 'primary', fields: [] }
      ]

      const wrapper = createWrapper({
        props: { sections: sectionsWithoutTertiary }
      })

      expect(wrapper.find('.detail-panel__footer-meta').exists()).toBe(false)
    })
  })

  // ==================== Section Filtering ====================

  describe('section filtering', () => {
    it('should have content with primary and secondary sections', () => {
      const wrapper = createWrapper()

      const content = wrapper.find('.detail-panel__content')
      expect(content.exists()).toBe(true)
      expect(content.text()).toContain('基本信息')
      expect(content.text()).toContain('详细信息')
    })

    it('should place tertiary sections in footer', () => {
      const wrapper = createWrapper()

      const footerMeta = wrapper.find('.detail-panel__footer-meta')
      const tertiarySections = footerMeta.findAll('.mock-detail-section')

      expect(tertiarySections.length).toBe(1)
      expect(tertiarySections[0].text()).toBe('元数据')
    })
  })

  // ==================== Props Handling ====================

  describe('props handling', () => {
    it('should pass emptyValue to sections', () => {
      const emptyValue = { text: '--', dash: true }
      const wrapper = createWrapper({ props: { emptyValue } })

      // Component should render without error
      expect(wrapper.find('.mock-detail-section').exists()).toBe(true)
    })

    it('should handle empty sections array', () => {
      const wrapper = createWrapper({ props: { sections: [] } })

      expect(wrapper.find('.detail-panel__content').exists()).toBe(true)
      expect(wrapper.findAll('.mock-detail-section').length).toBe(0)
    })
  })
})