/**
 * 登录表单逻辑 Composable
 *
 * 提供登录表单的状态管理、验证和提交逻辑
 */

import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { authApi } from '@/api/modules/auth'
import { ApiResponseError } from '@/api/client'
import { setAccessToken, setTokenExpiresAt, clearTokens } from '@/api/services/token-refresh'
import { usePermission } from '@/composables/usePermission'
import { useMenu } from '@/composables/useMenu'

export function useLoginForm() {
  const router = useRouter()
  const { loadPermissions, hydratePermissions } = usePermission()
  const { loadMenus, hydrateMenus } = useMenu()

  // 表单引用
  const usernameInput = ref<HTMLInputElement>()
  const passwordInput = ref<HTMLInputElement>()

  // 表单状态
  const loading = ref(false)
  const usernameFocused = ref(false)
  const passwordFocused = ref(false)

  // 表单数据
  const form = reactive({
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

  /**
   * 验证表单
   * @returns 验证是否通过
   */
  const validate = (): boolean => {
    // 用户名验证
    if (!form.username) {
      ElMessage.warning(rules.username.required)
      usernameInput.value?.focus()
      return false
    }
    if (form.username.length < rules.username.minLength.value) {
      ElMessage.warning(rules.username.minLength.message)
      usernameInput.value?.focus()
      return false
    }

    // 密码验证
    if (!form.password) {
      ElMessage.warning(rules.password.required)
      passwordInput.value?.focus()
      return false
    }
    if (form.password.length < rules.password.minLength.value) {
      ElMessage.warning(rules.password.minLength.message)
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
      const myContext = await authApi.getMy()

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

      // 存储 Token
      setAccessToken(result.access_token)
      const expiresAt = Date.now() + result.expires_in * 1000
      setTokenExpiresAt(expiresAt)

      // 加载用户上下文
      try {
        await loadUserContext()
      } catch (contextError) {
        console.error('加载用户上下文失败:', contextError)
        clearTokens()
        ElMessage.error('权限加载失败，请重试')
        throw contextError
      }

      ElMessage.success('登录成功')

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
        ElMessage.error('登录失败，请稍后重试')
      }
      // 智能聚焦：根据表单状态决定聚焦位置
      // 如果用户名为空 → 聚焦用户名框
      // 如果密码为空或已有输入 → 聚焦密码框（更可能是密码错误）
      const shouldFocusPassword = form.username.length > 0
      setTimeout(() => {
        if (shouldFocusPassword) {
          passwordInput.value?.focus()
        } else {
          usernameInput.value?.focus()
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
      ElMessage.warning(rules.username.required)
      usernameInput.value?.focus()
      return
    }
    if (form.username.length < rules.username.minLength.value) {
      ElMessage.warning(rules.username.minLength.message)
      usernameInput.value?.focus()
      return
    }

    // 验证通过，聚焦密码框
    passwordInput.value?.focus()
  }

  return {
    // 状态
    loading,
    usernameFocused,
    passwordFocused,
    form,
    usernameInput,
    passwordInput,

    // 方法
    handleLogin,
    focusUsernameInput,
    focusPasswordInput
  }
}
