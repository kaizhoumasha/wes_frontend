import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AuthContextUnavailable from '@/views/error/AuthContextUnavailable.vue'

const mocks = vi.hoisted(() => ({
  bootstrapAuthContext: vi.fn(),
  route: { query: { redirect: '/admin/users?tab=active' } },
  replace: vi.fn()
}))

vi.mock('@/app/bootstrap-auth-context', () => ({
  bootstrapAuthContext: mocks.bootstrapAuthContext
}))

vi.mock('vue-router', async importOriginal => {
  const actual = await importOriginal<typeof import('vue-router')>()
  return {
    ...actual,
    useRoute: () => mocks.route,
    useRouter: () => ({ replace: mocks.replace })
  }
})

describe('AuthContextUnavailable', () => {
  beforeEach(() => {
    mocks.bootstrapAuthContext.mockReset()
    mocks.replace.mockReset()
    mocks.route.query = { redirect: '/admin/users?tab=active' }
  })

  it('retries the forced auth bootstrap and replaces the original internal route', async () => {
    mocks.bootstrapAuthContext.mockResolvedValueOnce(undefined)
    const wrapper = mount(AuthContextUnavailable)

    await wrapper.get('button').trigger('click')
    await flushPromises()

    expect(mocks.bootstrapAuthContext).toHaveBeenCalledWith({
      forceRefresh: true,
      preserveAccessTokenOnFallback: true
    })
    expect(mocks.replace).toHaveBeenCalledWith('/admin/users?tab=active')
  })

  it.each(['//evil.example', 'https://evil.example', 'dashboard', '/\\evil'])(
    'rejects unsafe redirect %s and falls back to the dashboard',
    async redirect => {
      mocks.route.query = { redirect }
      mocks.bootstrapAuthContext.mockResolvedValueOnce(undefined)
      const wrapper = mount(AuthContextUnavailable)

      await wrapper.get('button').trigger('click')
      await flushPromises()

      expect(mocks.replace).toHaveBeenCalledWith('/dashboard')
    }
  )

  it('keeps the retry page actionable after a repeated temporary failure', async () => {
    mocks.bootstrapAuthContext.mockRejectedValueOnce(new Error('offline'))
    const wrapper = mount(AuthContextUnavailable)

    await wrapper.get('button').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('请检查网络或稍后重试')
    expect(wrapper.get('button').attributes('disabled')).toBeUndefined()
  })

  it('coalesces rapid retry clicks into one bootstrap request', async () => {
    let resolveBootstrap!: () => void
    mocks.bootstrapAuthContext.mockImplementationOnce(
      () =>
        new Promise<void>(resolve => {
          resolveBootstrap = resolve
        })
    )
    const wrapper = mount(AuthContextUnavailable)

    const button = wrapper.get('button')
    await button.trigger('click')
    await button.trigger('click')

    expect(mocks.bootstrapAuthContext).toHaveBeenCalledOnce()
    expect(button.attributes('disabled')).toBeDefined()

    resolveBootstrap()
    await flushPromises()
  })
})
