/**
 * 表格全屏状态管理 Composable
 *
 * 提供表格全屏切换功能，通过 CSS class 控制全屏模式
 *
 * @example
 * ```ts
 * const { isFullscreen, toggle } = useTableFullscreen()
 *
 * // 切换全屏
 * toggle()
 * ```
 */

import { ref } from 'vue'

const FULLSCREEN_CLASS = 'table-fullscreen'

/**
 * 表格全屏状态管理
 */
export function useTableFullscreen() {
  /**
   * 是否全屏状态
   */
  const isFullscreen = ref(false)

  /**
   * 切换全屏模式
   *
   * 通过添加/移除 CSS class 到 body 来控制全屏样式
   * 全屏样式由全局 CSS 定义
   */
  function toggle() {
    isFullscreen.value = !isFullscreen.value

    if (isFullscreen.value) {
      document.body.classList.add(FULLSCREEN_CLASS)
    } else {
      document.body.classList.remove(FULLSCREEN_CLASS)
    }
  }

  return {
    isFullscreen,
    toggle
  }
}
