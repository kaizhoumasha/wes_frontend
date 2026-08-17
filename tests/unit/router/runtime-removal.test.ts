import type { RouteRecordRaw } from 'vue-router'
import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { buildCurrentMenuManifest } from '@/router/menu-manifest'
import { createRoutes } from '@/router/routes'

const mocks = vi.hoisted(() => ({
  route: {
    path: '/runtime/monitor',
    meta: {
      runtimeImmersive: true,
    },
  },
}))

vi.mock('vue-router', async () => {
  const actual = await vi.importActual<typeof import('vue-router')>('vue-router')

  return {
    ...actual,
    useRoute: () => mocks.route,
  }
})

vi.mock('@/composables/useLayout', async () => {
  const { ref } = await vi.importActual<typeof import('vue')>('vue')

  return {
    useLayout: () => ({
      sidebarCollapsed: ref(false),
      contentMarginLeft: ref('240px'),
      isMobile: ref(false),
      isMobileMenuOpen: ref(false),
      closeMobileMenu: vi.fn(),
    }),
  }
})

vi.mock('@/composables/useMenu', async () => {
  const { ref } = await vi.importActual<typeof import('vue')>('vue')

  return {
    useMenu: () => ({
      selectMenu: vi.fn(),
      isMenuLoaded: ref(true),
      loadMenus: vi.fn(),
    }),
  }
})

enableAutoUnmount(afterEach)

function flatten(routes: readonly RouteRecordRaw[]): RouteRecordRaw[] {
  return routes.flatMap(route => [route, ...flatten(route.children ?? [])])
}

describe('legacy runtime removal', () => {
  it('does not publish legacy runtime routes or menu entries', () => {
    const routes = flatten(createRoutes())
    const menu = buildCurrentMenuManifest()

    expect(routes.some(route => route.name === 'RuntimeRoot')).toBe(false)
    expect(routes.some(route => route.path === 'runtime')).toBe(false)
    expect(menu.some(entry => entry.name.startsWith('runtime:'))).toBe(false)
    expect(menu.some(entry => entry.path.startsWith('/runtime'))).toBe(false)
  })

  it('keeps the standard layout for a runtimeImmersive route meta', () => {
    const wrapper = mount(DefaultLayout, {
      attachTo: document.body,
      global: {
        stubs: {
          AppSidebar: { template: '<aside data-test="sidebar" />' },
          AppHeader: { template: '<header data-test="header" />' },
          RouterView: { template: '<div data-test="router-view" />' },
          Transition: false,
        },
      },
    })

    expect(wrapper.classes()).not.toContain('is-immersive')
    expect(wrapper.find('[data-test="sidebar"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="header"]').exists()).toBe(true)
    expect(wrapper.find('.main-content').attributes('style')).toContain('margin-left: 240px')
    expect(wrapper.find('.page-main').exists()).toBe(true)
  })
})
