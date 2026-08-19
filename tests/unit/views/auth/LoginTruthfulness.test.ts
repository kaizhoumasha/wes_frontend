import { shallowMount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import Login from '@/views/auth/Login.vue'

vi.mock('@/composables/useLoginForm', async () => {
  const { computed, reactive, ref } = await vi.importActual<typeof import('vue')>('vue')
  const noop = vi.fn()
  return {
    useLoginForm: () => ({
      loading: ref(false),
      passwordVisible: ref(false),
      rememberMe: ref(false),
      usernameFocused: ref(false),
      passwordFocused: ref(false),
      usernameTouched: ref(false),
      passwordTouched: ref(false),
      form: reactive({ username: '', password: '' }),
      errors: reactive({ username: '', password: '' }),
      usernameInput: ref<HTMLInputElement>(),
      passwordInput: ref<HTMLInputElement>(),
      isFormValid: computed(() => false),
      handleLogin: noop,
      focusUsernameInput: noop,
      focusPasswordInput: noop,
      togglePasswordVisibility: noop,
      validateUsernameOnBlur: noop,
      validatePasswordOnBlur: noop,
      clearUsernameError: noop,
      clearPasswordError: noop,
      init: noop
    })
  }
})

describe('Login truthfulness', () => {
  it('does not claim a release version or unmeasured system health', () => {
    const wrapper = shallowMount(Login, {
      global: {
        stubs: {
          ThemeToggle: true,
          LoginLogo: true,
          BrandFeatures: true,
          Transition: false
        }
      }
    })

    expect(wrapper.text()).toContain('请使用授权账号登录')
    expect(wrapper.text()).not.toContain('v0.1.0')
    expect(wrapper.text()).not.toContain('系统正常运行')
    expect(wrapper.find('.status-dot').exists()).toBe(false)
  })
})
