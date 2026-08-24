import { shallowMount } from '@vue/test-utils'
import { ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import AppHeader from '@/components/common/AppHeader.vue'
import { useLayout } from '@/composables/useLayout'

vi.mock('@/composables/useLayout', () => ({ useLayout: vi.fn() }))

vi.mock('@/composables/useMenu', () => ({
  useMenu: () => ({ clearMenus: vi.fn() })
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

function mountHeader({
  sidebarCollapsed,
  isMobile = false,
  isMobileMenuOpen = false
}: {
  sidebarCollapsed: boolean
  isMobile?: boolean
  isMobileMenuOpen?: boolean
}) {
  vi.mocked(useLayout).mockReturnValue({
    sidebarCollapsed: ref(sidebarCollapsed),
    isMobile: ref(isMobile),
    isMobileMenuOpen: ref(isMobileMenuOpen),
    toggleSidebar: vi.fn()
  } as ReturnType<typeof useLayout>)

  return shallowMount(AppHeader, {
    global: {
      stubs: {
        StandardDialog: true,
        ThemeToggle: true,
        TimezoneSettings: true,
        ElBreadcrumb: true,
        ElBreadcrumbItem: true,
        ElDropdown: true,
        ElDropdownItem: true,
        ElDropdownMenu: true,
        ElAvatar: true,
        ElIcon: true
      }
    }
  })
}

// Regression: ISSUE-001 — 移动端菜单按钮缺少可访问名称
// Found by /qa on 2026-08-24
// Report: .gstack/qa-reports/qa-report-127-0-0-1-2026-08-24.md
describe('AppHeader sidebar toggle accessibility', () => {
  it('describes the action for expanded and collapsed desktop sidebar states', () => {
    expect(
      mountHeader({ sidebarCollapsed: false }).find('.collapse-button').attributes('aria-label')
    ).toBe('收起侧边栏')
    expect(
      mountHeader({ sidebarCollapsed: true }).find('.collapse-button').attributes('aria-label')
    ).toBe('展开侧边栏')
  })

  it('describes the action for closed and open mobile navigation states', () => {
    expect(
      mountHeader({ sidebarCollapsed: false, isMobile: true }).find('.collapse-button').attributes('aria-label')
    ).toBe('打开导航菜单')
    expect(
      mountHeader({ sidebarCollapsed: false, isMobile: true, isMobileMenuOpen: true })
        .find('.collapse-button')
        .attributes('aria-label')
    ).toBe('关闭导航菜单')
  })
})
