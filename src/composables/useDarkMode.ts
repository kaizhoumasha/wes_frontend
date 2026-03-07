import { useDark, useToggle } from '@vueuse/core'

/**
 * 暗黑模式管理 Composable
 *
 * 功能：
 * - 首次访问跟随系统偏好（initialValue: auto）
 * - 持久化用户选择到 localStorage（默认键名：vueuse-color-scheme）
 * - 响应式 isDark 状态
 * - 提供 toggle 方法
 * - 支持快捷键切换 (Ctrl/Cmd + K)
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * const { isDark, toggle } = useDarkMode()
 * </script>
 *
 * <template>
 *   <button @click="toggle">
 *     {{ isDark ? '🌙 暗黑' : '☀️ 明亮' }}
 *   </button>
 * </template>
 * ```
 */
// 使用模块级单例，确保全局只初始化一次
const isDark = useDark({
  selector: 'html',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: '',
  initialValue: 'auto',
  disableTransition: false
})

const toggleDark = useToggle(isDark)
let hotkeyBound = false

const handleKeydown = (e: KeyboardEvent) => {
  // Ctrl/Cmd + K (避免与浏览器快捷键冲突)
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    toggleDark()
  }
}

function bindHotkey() {
  if (hotkeyBound) {
    return
  }

  window.addEventListener('keydown', handleKeydown)
  hotkeyBound = true
}

function unbindHotkey() {
  if (!hotkeyBound) {
    return
  }

  window.removeEventListener('keydown', handleKeydown)
  hotkeyBound = false
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    unbindHotkey()
  })
}

export function useDarkMode() {
  return {
    isDark,
    toggle: toggleDark
  }
}

/**
 * 在应用启动时初始化主题（确保登录页等无 Header 页面也生效）
 * 同时注册全局快捷键 (Ctrl/Cmd + K)
 */
export function initDarkMode() {
  bindHotkey()

  // 返回 isDark 供其他模块使用
  return isDark
}
