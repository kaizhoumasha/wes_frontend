/**
 * 字符串工具函数
 */

/**
 * HTML 实体转义映射
 */
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}

/**
 * 转义 HTML 特殊字符，防止 XSS 攻击
 *
 * @param str - 要转义的字符串
 * @returns 转义后的字符串
 *
 * @example
 * ```typescript
 * escapeHtml('<script>alert("xss")</script>')
 * // 返回: '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
 * ```
 */
export function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, char => HTML_ENTITIES[char] || char)
}

/**
 * 安全获取错误消息（带 HTML 转义）
 *
 * @param error - 错误对象
 * @param fallback - 默认消息
 * @returns 转义后的错误消息
 */
export function getSafeErrorMessage(error: unknown, fallback = '未知错误'): string {
  if (error instanceof Error) {
    return escapeHtml(error.message)
  }
  if (typeof error === 'string') {
    return escapeHtml(error)
  }
  return fallback
}

export function getErrorMessage(error: unknown, fallback = '未知错误'): string {
  return error instanceof Error ? error.message : fallback
}
