import { shallowMount } from '@vue/test-utils'
import { ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import AppHeader from '@/components/common/AppHeader.vue'

vi.mock('@/composables/useLayout', () => ({
  useLayout: () => ({
    sidebarCollapsed: ref(false),
    isMobile: ref(false),
    isMobileMenuOpen: ref(false),
    toggleSidebar: vi.fn()
  })
}))

vi.mock('@/composables/useMenu', () => ({
  useMenu: () => ({ getBreadcrumb: vi.fn(() => []) })
}))

vi.mock('@/composables/usePermission', () => ({
  usePermission: () => ({ clearPermissions: vi.fn() })
}))

vi.mock('@/composables/useCurrentUser', () => ({
  useCurrentUser: () => ({
    currentUser: ref({ full_name: '系统管理员' }),
    clearCurrentUser: vi.fn()
  })
}))

vi.mock('@/stores/timezone', () => ({
  useTimezoneStore: () => ({
    useBrowserTimezone: true,
    userTimezone: null
  })
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useRoute: () => ({ path: '/dashboard' })
}))

describe('QA regression: AppHeader user menu truthfulness', () => {
  it('does not expose unfinished profile or session actions', () => {
    const wrapper = shallowMount(AppHeader, {
      global: {
        stubs: {
          StandardDialog: true,
          ThemeToggle: true,
          TimezoneSettings: true,
          ElBreadcrumb: true,
          ElBreadcrumbItem: true,
          ElDropdown: {
            template: '<div><slot /><slot name="dropdown" /></div>'
          },
          ElDropdownItem: {
            template: '<div><slot /></div>'
          },
          ElDropdownMenu: {
            template: '<div><slot /></div>'
          },
          ElAvatar: true,
          ElIcon: true
        }
      }
    })

    expect(wrapper.text()).not.toContain('个人资料')
    expect(wrapper.text()).not.toContain('会话管理')
    expect(wrapper.text()).toContain('时区设置')
    expect(wrapper.text()).toContain('退出登录')
  })
})
