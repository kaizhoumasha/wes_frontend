import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import router from './router'
import App from './App.vue'
import './assets/styles/globals.css'
import { initDarkMode } from './composables/useDarkMode'

// 初始化错误通知服务
import { initializeErrorNotification } from './api/services/error-notification'

// Token 刷新后刷新用户上下文
import { setOnTokenRefreshed } from './api/services/token-refresh'
import { useCurrentUser } from './composables/useCurrentUser'
import { usePermission } from './composables/usePermission'
import { useMenu } from './composables/useMenu'

// 启动阶段初始化主题（确保所有路由页面都能正确应用主题）
initDarkMode()

// 初始化错误通知配置
initializeErrorNotification({
  // 启用对话框通知（严重错误）
  enableDialog: true,
  // 启用右上角通知（业务错误）
  enableNotification: true,
  // 启用顶部消息提示（一般错误）
  enableMessage: true,
  // 启用日志记录
  enableLogging: true
})

// 注册 Token 刷新成功后的回调
setOnTokenRefreshed(async () => {
  const { hydrateCurrentUser } = useCurrentUser()
  const { hydratePermissions, loadPermissions } = usePermission()
  const { hydrateMenus, loadMenus } = useMenu()

  try {
    // 重新加载用户上下文
    const { authApi } = await import('./api/modules/auth')
    const myContext = await authApi.my()

    hydrateCurrentUser(myContext.user)
    hydratePermissions(myContext.permissions)
    hydrateMenus(myContext.menus)
  } catch (error) {
    console.warn('[Token刷新回调] 加载用户上下文失败，尝试分步加载:', error)

    // 分步加载
    try {
      await loadPermissions(true)
    } catch (e) {
      console.warn('[Token刷新回调] 加载权限失败:', e)
    }

    try {
      await loadMenus(true)
    } catch (e) {
      console.warn('[Token刷新回调] 加载菜单失败:', e)
    }
  }
})

const app = createApp(App)
const pinia = createPinia()

pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)
app.use(ElementPlus)

app.mount('#app')
