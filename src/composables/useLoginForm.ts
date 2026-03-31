/**
 * 登录表单逻辑 Composable
 *
 * 提供登录表单的状态管理、验证和提交逻辑
 */

import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { authApi } from '@/api/modules/auth'
import { ApiResponseError } from '@/api/client'
import { setAccessToken, setTokenExpiresAt, clearTokens } from '@/api/services/token-refresh'
import { usePermission } from '@/composables/usePermission'
import { useMenu } from '@/composables/useMenu'
import { useCurrentUser } from '@/composables/useCurrentUser'

const REMEMBERED_USERNAME_KEY = 'wes_remembered_username'

export function useLoginForm() {
  const router = useRouter()
  const { loadPermissions, hydratePermissions } = usePermission()
  const { loadMenus, hydrateMenus } = useMenu()
  const { hydrateCurrentUser, clearCurrentUser } = useCurrentUser()

  // 表单引用
  const usernameInput = ref<HTMLInputElement>()
  const passwordInput = ref<HTMLInputElement>()

  // UI 状态
  const loading = ref(false)
  const passwordVisible = ref(false)
  const rememberMe = ref(false)
  const usernameFocused = ref(false)
  const passwordFocused = ref(false)
  const usernameTouched = ref(false)
  const passwordTouched = ref(false)

  // 表单数据
  const form = reactive({
    username: '',
    password: ''
  })

  // 错误信息
  const errors = reactive({
    username: '',
    password: ''
  })

  // 验证规则
  const rules = {
    username: {
      required: '请输入用户名',
      minLength: { value: 3, message: '用户名长度至少 3 个字符' }
    },
    password: {
      required: '请输入密码',
      minLength: { value: 6, message: '密码长度至少 6 个字符' }
    }
  }

  // 计算属性：表单是否有效
  const isFormValid = computed(() => {
    return (
      form.username.length >= rules.username.minLength.value &&
      form.password.length >= rules.password.minLength.value
    )
  })

  /**
   * 验证用户名
   * @returns 是否有效
   */
  const validateUsername = (): boolean => {
    if (!form.username) {
      errors.username = rules.username.required
      return false
    }
    if (form.username.length < rules.username.minLength.value) {
      errors.username = rules.username.minLength.message
      return false
    }
    errors.username = ''
    return true
  }

  /**
   * 验证密码
   * @returns 是否有效
   */
  const validatePassword = (): boolean => {
    if (!form.password) {
      errors.password = rules.password.required
      return false
    }
    if (form.password.length < rules.password.minLength.value) {
      errors.password = rules.password.minLength.message
      return false
    }
    errors.password = ''
    return true
  }

  /**
   * 实时验证用户名（用于失去焦点时）
   */
  const validateUsernameOnBlur = (): void => {
    usernameTouched.value = true
    validateUsername()
    usernameFocused.value = false
  }

  /**
   * 实时验证密码（用于失去焦点时）
   */
  const validatePasswordOnBlur = (): void => {
    passwordTouched.value = true
    validatePassword()
    passwordFocused.value = false
  }

  /**
   * 清除错误（当用户输入时）
   */
  const clearUsernameError = (): void => {
    errors.username = ''
  }

  const clearPasswordError = (): void => {
    errors.password = ''
  }

  /**
   * 切换密码可见性
   */
  const togglePasswordVisibility = (): void => {
    passwordVisible.value = !passwordVisible.value
    // 切换后重新聚焦密码框
    setTimeout(() => {
      passwordInput.value?.focus()
    }, 0)
  }

  /**
   * 加载记住的用户名
   */
  const loadRememberedUsername = (): void => {
    const remembered = localStorage.getItem(REMEMBERED_USERNAME_KEY)
    if (remembered) {
      form.username = remembered
      rememberMe.value = true
    }
  }

  /**
   * 保存/清除记住的用户名
   */
  const handleRememberMe = (): void => {
    if (rememberMe.value && form.username) {
      localStorage.setItem(REMEMBERED_USERNAME_KEY, form.username)
    } else {
      localStorage.removeItem(REMEMBERED_USERNAME_KEY)
    }
  }

  /**
   * 验证表单
   * @returns 验证是否通过
   */
  const validate = (): boolean => {
    // 标记所有字段为已触碰
    usernameTouched.value = true
    passwordTouched.value = true

    const isUsernameValid = validateUsername()
    const isPasswordValid = validatePassword()

    if (!isUsernameValid) {
      usernameInput.value?.focus()
      return false
    }
    if (!isPasswordValid) {
      passwordInput.value?.focus()
      return false
    }

    return true
  }

  /**
   * 加载用户上下文（权限和菜单）
   */
  const loadUserContext = async (): Promise<void> => {
    // 优先使用聚合接口一次性加载用户上下文
    let initializedFromMy = false
    try {
      const myContext = await authApi.my()

      hydrateCurrentUser(myContext.user)

      if (Array.isArray(myContext.permissions) && myContext.permissions.length > 0) {
        hydratePermissions(myContext.permissions)
      } else {
        await loadPermissions(true)
      }

      if (Array.isArray(myContext.menus) && myContext.menus.length > 0) {
        hydrateMenus(myContext.menus)
      } else {
        await loadMenus(true)
      }

      initializedFromMy = true
    } catch (contextError) {
      console.warn('加载 /auth/my 失败，回退到分步加载:', contextError)
    }

    // 回退方案：分步加载权限和菜单
    if (!initializedFromMy) {
      await loadPermissions(true)
      await loadMenus(true)
    }
  }

  // 清除认证信息使用统一的 clearTokens()

  /**
   * 处理登录提交
   */
  const handleLogin = async (): Promise<void> => {
    // 验证表单
    if (!validate()) {
      return
    }

    try {
      loading.value = true

      // 登录请求
      const result = await authApi.login({
        username: form.username,
        password: form.password
      })

      hydrateCurrentUser(result.user)

      // 存储 Token
      setAccessToken(result.access_token)
      const expiresAt = Date.now() + result.expires_in * 1000
      setTokenExpiresAt(expiresAt)

      // 处理记住我
      handleRememberMe()

      // 加载用户上下文
      try {
        await loadUserContext()
      } catch (contextError) {
        console.error('加载用户上下文失败:', contextError)
        clearTokens()
        clearCurrentUser()
        errors.password = '权限加载失败，请重试'
        throw contextError
      }

      // 跳转到目标页面
      const redirect = sessionStorage.getItem('redirect_after_login')
      sessionStorage.removeItem('redirect_after_login')

      // 等待路由跳转完成，如果被阻止则强制跳转
      const navigationResult = await router.push(redirect || '/dashboard')
      if (navigationResult) {
        // 导航被阻止（可能被路由守卫），使用强制跳转
        window.location.href = redirect || '/dashboard'
      }
    } catch (error) {
      console.error('登录失败:', error)
      // ApiResponseError 已由 API 客户端的错误通知系统处理
      if (!(error instanceof ApiResponseError)) {
        errors.password = '登录失败，请稍后重试'
      } else {
        // 设置错误信息用于显示
        errors.password = '用户名或密码错误'
      }
      // 智能聚焦：根据表单状态决定聚焦位置
      const shouldFocusPassword = form.username.length > 0
      setTimeout(() => {
        if (shouldFocusPassword) {
          passwordInput.value?.focus()
          passwordTouched.value = true
        } else {
          usernameInput.value?.focus()
          usernameTouched.value = true
        }
      }, 100)
    } finally {
      loading.value = false
    }
  }

  /**
   * 自动聚焦用户名输入框
   */
  const focusUsernameInput = (): void => {
    setTimeout(() => {
      usernameInput.value?.focus()
    }, 500)
  }

  /**
   * 聚焦密码输入框（仅在用户名验证通过后）
   */
  const focusPasswordInput = (): void => {
    // 验证用户名
    if (!form.username) {
      errors.username = rules.username.required
      usernameInput.value?.focus()
      return
    }
    if (form.username.length < rules.username.minLength.value) {
      errors.username = rules.username.minLength.message
      usernameInput.value?.focus()
      return
    }
    errors.username = ''

    // 验证通过，聚焦密码框
    passwordInput.value?.focus()
  }

  /**
   * 初始化 - 加载记住的用户名
   */
  const init = (): void => {
    loadRememberedUsername()
  }

  return {
    // 状态
    loading,
    passwordVisible,
    rememberMe,
    usernameFocused,
    passwordFocused,
    usernameTouched,
    passwordTouched,
    form,
    errors,
    usernameInput,
    passwordInput,
    isFormValid,

    // 方法
    handleLogin,
    focusUsernameInput,
    focusPasswordInput,
    togglePasswordVisibility,
    validateUsernameOnBlur,
    validatePasswordOnBlur,
    clearUsernameError,
    clearPasswordError,
    init
  }
}
