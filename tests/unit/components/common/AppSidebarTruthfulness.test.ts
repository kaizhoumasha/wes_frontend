import { shallowMount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import AppSidebar from '@/components/common/AppSidebar.vue'

vi.mock('@/composables/useLayout', async () => {
  const { ref } = await vi.importActual<typeof import('vue')>('vue')
  return {
    useLayout: () => ({
      sidebarCollapsed: ref(false),
      isMobileMenuOpen: ref(false),
      isMobile: ref(false),
      closeMobileMenu: vi.fn()
    })
  }
})

vi.mock('@/composables/useMenu', async () => {
  const { ref } = await vi.importActual<typeof import('vue')>('vue')
  return {
    useMenu: () => ({
      menuTree: ref([]),
      selectedPath: ref(''),
      openedPaths: ref<string[]>([]),
      selectMenu: vi.fn()
    })
  }
})

describe('AppSidebar truthfulness', () => {
  it('does not display a hard-coded release version', () => {
    const wrapper = shallowMount(AppSidebar, {
      global: {
        stubs: {
          ElMenu: true,
          SidebarMenuItem: true,
          Transition: false
        }
      }
    })

    expect(wrapper.text()).not.toContain('v0.1.0')
    expect(wrapper.find('.version-info').exists()).toBe(false)
  })
})
