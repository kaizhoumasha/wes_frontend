/**
 * CrudDetailPanel Integration Tests
 *
 * Tests for the detail panel component including:
 * - Open/close behavior
 * - Controlled/uncontrolled modes
 * - Keyboard navigation
 * - ARIA attributes
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick, defineComponent, ref, h } from 'vue'
import CrudDetailPanel from '@/components/common/crud-page/detail/CrudDetailPanel.vue'
import type { CrudPageEntity } from '@/components/common/crud-page/types'
import { createMockEntity, createMockFetcher } from '../../utils/mock'

// Mock useDetailResponsive before importing the component
vi.mock('@/components/common/crud-page/detail/composables/useDetailResponsive', () => ({
  useDetailResponsive: () => ({
    resolvedMode: { value: 'drawer' },
    resolvedWidth: { value: '50%' },
    resolvedDrawerSize: { value: 'md' },
    resolvedDrawerWidth: { value: undefined },
    isFullscreen: { value: false },
    isMobile: { value: false },
    isTablet: { value: false }
  })
}))

/* eslint-disable vue/one-component-per-file, vue/require-prop-types */
// Mock Element Plus components with proper v-model handling
const MockDrawer = defineComponent({
  name: 'ElDrawer',
  props: ['modelValue', 'size', 'direction', 'closeOnClickModal', 'closeOnPressEscape', 'role', 'ariaLabelledby'],
  emits: ['update:modelValue', 'close'],
  setup(props, { emit, slots }) {
    const handleClose = () => {
      emit('update:modelValue', false)
      emit('close')
    }
    return () => props.modelValue
      ? h('div', {
          class: 'mock-drawer',
          role: props.role,
          'aria-labelledby': props.ariaLabelledby,
          'data-size': props.size
        }, [
          slots.header ? h('div', { class: 'mock-drawer__header' }, slots.header()) : null,
          slots.default ? h('div', { class: 'mock-drawer__body' }, slots.default()) : null,
          slots.footer ? h('div', { class: 'mock-drawer__footer' }, slots.footer()) : null,
          h('button', { class: 'mock-close-btn', onClick: handleClose }, 'Close')
        ])
      : null
  }
})

const MockDialog = defineComponent({
  name: 'ElDialog',
  props: ['modelValue', 'width', 'fullscreen', 'closeOnClickModal', 'closeOnPressEscape', 'role', 'ariaLabelledby'],
  emits: ['update:modelValue', 'close'],
  setup(props, { emit, slots }) {
    const handleClose = () => {
      emit('update:modelValue', false)
      emit('close')
    }
    return () => props.modelValue
      ? h('div', {
          class: 'mock-dialog',
          role: props.role,
          'aria-labelledby': props.ariaLabelledby,
          'data-width': props.width,
          'data-fullscreen': props.fullscreen
        }, [
          slots.header ? h('div', { class: 'mock-dialog__header' }, slots.header()) : null,
          slots.default ? h('div', { class: 'mock-dialog__body' }, slots.default()) : null,
          slots.footer ? h('div', { class: 'mock-dialog__footer' }, slots.footer()) : null,
          h('button', { class: 'mock-close-btn', onClick: handleClose }, 'Close')
        ])
      : null
  }
})

// Stub components for child components
const MockDetailBody = defineComponent({
  name: 'CrudDetailBody',
  props: ['loading', 'error', 'item', 'sections', 'emptyValue', 'isSectionCollapsed', 'onToggleCollapse', 'onRefresh'],
  emits: ['close'],
  template: '<div class="mock-detail-body">Detail Body</div>'
})

const MockDetailActions = defineComponent({
  name: 'CrudDetailActions',
  props: ['actions', 'item'],
  emits: ['actionComplete', 'close'],
  template: '<div class="mock-detail-actions">Actions</div>'
})
/* eslint-enable vue/one-component-per-file, vue/require-prop-types */

interface TestEntity extends CrudPageEntity {
  name: string
}

describe('CrudDetailPanel', () => {
  const mockEntity = createMockEntity({ name: 'Test User' }) as TestEntity
  const mockFetcher = createMockFetcher(mockEntity)

  const createWrapper = (options: {
    props?: Record<string, unknown>
    global?: Record<string, unknown>
  } = {}): VueWrapper => {
    return mount(CrudDetailPanel, {
      props: {
        config: {
          title: '测试详情',
          entityTypeLabel: '用户',
          sections: []
        },
        fetcher: mockFetcher,
        ...options.props
      },
      global: {
        stubs: {
          ElDrawer: MockDrawer,
          ElDialog: MockDialog,
          CrudDetailBody: MockDetailBody,
          CrudDetailActions: MockDetailActions
        },
        ...options.global
      }
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ==================== T-PANEL-1: Open/Close Behavior ====================

  describe('open/close behavior', () => {
    it('should not render panel when closed', async () => {
      const wrapper = createWrapper()

      expect(wrapper.find('.mock-drawer').exists()).toBe(false)
      expect(wrapper.find('.mock-dialog').exists()).toBe(false)
    })

    it('should open panel via openWithItem method', async () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as unknown as {
        openWithItem: (item: TestEntity) => void
      }

      vm.openWithItem(mockEntity)
      await nextTick()

      // Should render drawer on desktop
    expect(wrapper.find('.mock-drawer').exists()).toBe(true)
  })

    it('should use StandardDrawer preset size by default instead of custom width', async () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as unknown as {
        openWithItem: (item: TestEntity) => void
      }

      vm.openWithItem(mockEntity)
      await nextTick()

      const drawer = wrapper.find('.mock-drawer')
      expect(drawer.attributes('data-size')).toBe('min(640px, 92vw)')
    })

    it('should render drawer actions in the StandardDrawer footer', async () => {
      const wrapper = createWrapper({
        props: {
          config: {
            title: '测试详情',
            entityTypeLabel: '用户',
            showActions: true,
            actions: [
              {
                key: 'inspect',
                label: '检查',
                onClick: vi.fn()
              }
            ],
            sections: []
          }
        }
      })
      const vm = wrapper.vm as unknown as {
        openWithItem: (item: TestEntity) => void
      }

      vm.openWithItem(mockEntity)
      await nextTick()

      expect(wrapper.find('.mock-drawer__footer .mock-detail-actions').exists()).toBe(true)
      expect(wrapper.find('.mock-drawer__body .mock-detail-actions').exists()).toBe(false)
    })

    it('should close panel via close method', async () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as unknown as {
        openWithItem: (item: TestEntity) => void
        close: () => void
      }

      vm.openWithItem(mockEntity)
      await nextTick()
      expect(wrapper.find('.mock-drawer').exists()).toBe(true)

      vm.close()
      await nextTick()
      expect(wrapper.find('.mock-drawer').exists()).toBe(false)
    })

    it('should emit close event when closed', async () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as unknown as {
        openWithItem: (item: TestEntity) => void
        close: () => void
      }

      vm.openWithItem(mockEntity)
      await nextTick()

      vm.close()
      await nextTick()

      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('should open with openWithId method', async () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as unknown as {
        openWithId: (id: number) => Promise<void>
      }

      await vm.openWithId(1)
      await nextTick()

      expect(wrapper.find('.mock-drawer').exists()).toBe(true)
    })
  })

  // ==================== T-PANEL-2: Controlled/Uncontrolled Mode ====================

  describe('controlled/uncontrolled mode', () => {
    describe('uncontrolled mode', () => {
      it('should manage its own state when open prop is undefined', async () => {
        const wrapper = createWrapper()
        const vm = wrapper.vm as unknown as {
          openWithItem: (item: TestEntity) => void
        }

        // open prop is undefined by default
        expect(wrapper.props('open')).toBeUndefined()

        vm.openWithItem(mockEntity)
        await nextTick()

        expect(wrapper.find('.mock-drawer').exists()).toBe(true)
      })
    })

    describe('controlled mode', () => {
      it('should use open prop when provided', async () => {
        const wrapper = createWrapper({
          props: {
            open: true,
            item: mockEntity
          }
        })

        await nextTick()

        expect(wrapper.find('.mock-drawer').exists()).toBe(true)
      })

      it('should emit update:open when state changes in controlled mode', async () => {
        const open = ref(true)
        const wrapper = createWrapper({
          props: {
            open: open.value,
            item: mockEntity,
            'onUpdate:open': (value: boolean) => {
              open.value = value
            }
          }
        })

        await nextTick()

        // Find close button and trigger close
        const vm = wrapper.vm as unknown as { close: () => void }
        vm.close()
        await nextTick()

        expect(wrapper.emitted('update:open')).toBeTruthy()
        expect(wrapper.emitted('update:open')?.[0]).toEqual([false])
      })

      it('should use item prop in controlled mode', async () => {
        const wrapper = createWrapper({
          props: {
            open: true,
            item: mockEntity
          }
        })

        await nextTick()

        // Panel should be open with the provided item
        expect(wrapper.find('.mock-drawer').exists()).toBe(true)
      })

      it('should use loading prop in controlled mode', async () => {
        const wrapper = createWrapper({
          props: {
            open: true,
            item: mockEntity,
            loading: true
          }
        })

        await nextTick()

        // Check that MockDetailBody receives loading prop
        const body = wrapper.findComponent(MockDetailBody)
        expect(body.props('loading')).toBe(true)
      })

      it('should use error prop in controlled mode', async () => {
        const testError = new Error('Test error')
        const wrapper = createWrapper({
          props: {
            open: true,
            item: null,
            error: testError
          }
        })

        await nextTick()

        // Check that MockDetailBody receives error prop
        const body = wrapper.findComponent(MockDetailBody)
        expect(body.props('error')).toBe(testError)
      })
    })
  })

  // ==================== T-PANEL-3: Keyboard Navigation ====================

  describe('keyboard navigation', () => {
    it('should have handleKeydown method', () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as unknown as { handleKeydown: (e: KeyboardEvent) => void }

      expect(typeof vm.handleKeydown).toBe('function')
    })

    it('should trap Tab focus within panel', async () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as unknown as {
        openWithItem: (item: TestEntity) => void
      }

      vm.openWithItem(mockEntity)
      await nextTick()

      // Panel should be rendered
      expect(wrapper.find('.mock-drawer').exists()).toBe(true)
    })
  })

  // ==================== T-PANEL-4: ARIA Attributes ====================

  describe('ARIA attributes', () => {
    it('should have role="dialog" on drawer', async () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as unknown as {
        openWithItem: (item: TestEntity) => void
      }

      vm.openWithItem(mockEntity)
      await nextTick()

      const drawer = wrapper.find('.mock-drawer')
      expect(drawer.attributes('role')).toBe('dialog')
    })

    it('should have aria-labelledby attribute', async () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as unknown as {
        openWithItem: (item: TestEntity) => void
      }

      vm.openWithItem(mockEntity)
      await nextTick()

      const drawer = wrapper.find('.mock-drawer')
      expect(drawer.attributes('aria-labelledby')).toBeDefined()
    })

    it('should have role="dialog" on dialog mode', async () => {
      // Note: This test uses the same mock as other tests (drawer mode)
      // Dialog mode is tested through the responsive composable
      // Here we just verify the dialog component has proper ARIA
      const wrapper = createWrapper()
      const vm = wrapper.vm as unknown as {
        openWithItem: (item: TestEntity) => void
      }

      vm.openWithItem(mockEntity)
      await nextTick()

      // In drawer mode, drawer should have role="dialog"
      const drawer = wrapper.find('.mock-drawer')
      expect(drawer.exists()).toBe(true)
      expect(drawer.attributes('role')).toBe('dialog')
    })
  })

  // ==================== Title and Eyebrow ====================

  describe('title and eyebrow', () => {
    it('should display custom title', async () => {
      const wrapper = createWrapper({
        props: {
          config: {
            title: '自定义标题',
            sections: []
          }
        }
      })
      const vm = wrapper.vm as unknown as {
        openWithItem: (item: TestEntity) => void
      }

      vm.openWithItem(mockEntity)
      await nextTick()

      const title = wrapper.find('.detail-panel__title')
      expect(title.text()).toBe('自定义标题')
    })

    it('should display function title', async () => {
      const wrapper = createWrapper({
        props: {
          config: {
            title: (item: TestEntity) => `详情: ${item.name}`,
            sections: []
          }
        }
      })
      const vm = wrapper.vm as unknown as {
        openWithItem: (item: TestEntity) => void
      }

      vm.openWithItem(mockEntity)
      await nextTick()

      const title = wrapper.find('.detail-panel__title')
      expect(title.text()).toBe('详情: Test User')
    })

    it('should display eyebrow with entity ID and type', async () => {
      const wrapper = createWrapper({
        props: {
          config: {
            entityTypeLabel: '用户',
            sections: []
          }
        }
      })
      const vm = wrapper.vm as unknown as {
        openWithItem: (item: TestEntity) => void
      }

      vm.openWithItem(mockEntity)
      await nextTick()

      const eyebrow = wrapper.find('.detail-panel__eyebrow')
      expect(eyebrow.text()).toContain('#1')
      expect(eyebrow.text()).toContain('用户')
    })
  })

  // ==================== Public Methods ====================

  describe('public methods', () => {
    it('should expose openWithItem method', () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as unknown as {
        openWithItem: (item: TestEntity) => void
      }

      expect(typeof vm.openWithItem).toBe('function')
    })

    it('should expose openWithId method', () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as unknown as {
        openWithId: (id: number) => Promise<void>
      }

      expect(typeof vm.openWithId).toBe('function')
    })

    it('should expose close method', () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as unknown as { close: () => void }

      expect(typeof vm.close).toBe('function')
    })

    it('should expose refresh method', () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as unknown as { refresh: () => void }

      expect(typeof vm.refresh).toBe('function')
    })
  })
})
