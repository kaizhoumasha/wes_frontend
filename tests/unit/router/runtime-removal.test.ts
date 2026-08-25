import type { RouteRecordRaw } from 'vue-router'
import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { createRoutes } from '@/router/routes'

const mocks = vi.hoisted(() => ({
  route: {
    path: '/runtime/monitor',
    meta: {
      runtimeImmersive: true,
    },
  },
  router: {
    push: vi.fn(),
    replace: vi.fn()
  }
}))

vi.mock('vue-router', async () => {
  const actual = await vi.importActual<typeof import('vue-router')>('vue-router')

  return {
    ...actual,
    useRoute: () => mocks.route,
    useRouter: () => mocks.router
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

vi.mock('@/composables/useMenu', () => {
  return {
    useMenu: () => ({
      selectMenu: vi.fn()
    }),
  }
})

enableAutoUnmount(afterEach)

function flatten(routes: readonly RouteRecordRaw[]): RouteRecordRaw[] {
  return routes.flatMap(route => [route, ...flatten(route.children ?? [])])
}

describe('legacy runtime removal', () => {
  it('does not publish legacy runtime routes', () => {
    const routes = flatten(createRoutes())

    expect(routes.some(route => route.name === 'RuntimeRoot')).toBe(false)
    expect(routes.some(route => route.path === 'runtime')).toBe(false)
  })

  it('does not register the retired menu administration page', () => {
    const routes = flatten(createRoutes())

    expect(routes.some(route => route.name === 'MenuList')).toBe(false)
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

  it('uses /auth/my across auth lifecycle refreshes without requesting admin menus', async () => {
    vi.resetModules()
    vi.unstubAllGlobals()
    localStorage.clear()
    mocks.route.query = { redirect: '/admin/users' }
    mocks.router.push.mockReset().mockResolvedValue(undefined)
    mocks.router.replace.mockReset().mockResolvedValue(undefined)

    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const path = new URL(input instanceof Request ? input.url : String(input)).pathname
      const dataByPath: Record<string, unknown> = {
        '/api/v1/auth/login': {
          user: {
            id: 1,
            username: 'operator',
            email: 'operator@example.com',
            full_name: '操作员',
            is_superuser: false,
            is_multi_login: true,
            created_at: '2026-08-26T00:00:00Z',
            version: 0,
            roles: []
          },
          access_token: 'logged-in-token',
          expires_in: 3600
        },
        '/api/v1/auth/my': {
          user: {
            id: 1,
            username: 'operator',
            email: 'operator@example.com',
            full_name: '操作员',
            is_superuser: false,
            is_multi_login: true,
            created_at: '2026-08-26T00:00:00Z',
            version: 0,
            roles: []
          },
          permissions: [],
          menus: []
        },
        '/api/v1/auth/refresh': { access_token: 'refreshed-token', expires_in: 3600 },
        '/api/v1/auth/logout': null
      }

      return Promise.resolve(
        new Response(
          JSON.stringify({ code: '1000', message: 'ok', data: dataByPath[path] }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      )
    })
    vi.stubGlobal('fetch', fetchMock)

    const [{ apiClient }, { bootstrapAuthContext }, { logout, refreshAccessToken, setOnTokenRefreshed }, { useLoginForm }, { default: AuthContextUnavailable }] =
      await Promise.all([
        import('@/api/client'),
        import('@/app/bootstrap-auth-context'),
        import('@/api/services/token-refresh'),
        import('@/composables/useLoginForm'),
        import('@/views/error/AuthContextUnavailable.vue')
      ])

    await bootstrapAuthContext()
    await bootstrapAuthContext({ forceRefresh: true })

    setOnTokenRefreshed(() =>
      bootstrapAuthContext({ forceRefresh: true, preserveAccessTokenOnFallback: true })
    )
    await refreshAccessToken(apiClient)
    await logout(apiClient)

    const login = useLoginForm()
    login.form.username = 'operator'
    login.form.password = 'password'
    await login.handleLogin()

    const retryPage = mount(AuthContextUnavailable)
    await retryPage.get('button').trigger('click')
    await flushPromises()

    const paths = fetchMock.mock.calls.map(([input]) =>
      new URL(input instanceof Request ? input.url : String(input)).pathname
    )
    expect(paths).toEqual(expect.not.arrayContaining([expect.stringContaining('/admin/menus')]))
    expect(paths).not.toContain('/api/v1/auth/permissions')
    expect(paths.filter(path => path === '/api/v1/auth/my')).toHaveLength(5)
    expect(paths).toContain('/api/v1/auth/login')
    expect(paths).toContain('/api/v1/auth/refresh')
    expect(paths).toContain('/api/v1/auth/logout')
  })
})
