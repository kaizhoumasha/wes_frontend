/**
 * 时区工具模块
 *
 * 与后端 timezone.py 对齐的时区处理方案
 *
 * 后端方案:
 * - 存储: naive UTC datetime (TIMESTAMP WITHOUT TIME ZONE)
 * - API响应: aware UTC datetime (ISO 8601: "2024-01-01T12:00:00Z")
 * - 应用时区: Asia/Shanghai (可配置)
 *
 * 前端方案:
 * - 接收: 解析后端 ISO 8601 格式 (aware UTC)
 * - 显示: 转换为用户选择的时区（默认应用时区）
 * - 提交: 转换为 aware UTC datetime
 *
 * 多时区支持:
 * - 用户可以在设置中选择自己的时区
 * - 可选使用浏览器时区自动检测
 * - 详细文档: @docs/TIMEZONE_HANDLING.md
 */

import { formatInTimeZone } from 'date-fns-tz'

/**
 * 应用默认时区（与后端 DATETIME_TIMEZONE 对齐）
 *
 * 注意: 这是服务器/应用默认时区，作为后备选项
 * 用户实际看到的时区取决于他们的时区设置
 */
export const APP_TIMEZONE = 'Asia/Shanghai'

/**
 * 浏览器本地时区（自动检测）
 */
export const BROWSER_TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone

/**
 * 解析后端 API 返回的时间字符串
 *
 * 后端标准格式: "2024-01-01T12:00:00Z" 或 "2024-01-01T12:00:00+00:00"
 * 兼容格式: "2024-01-01T12:00:00.123456" (自动视为 UTC)
 *
 * @param isoString - 后端返回的 ISO 8601 时间字符串
 * @returns Date 对象（内部使用 UTC timestamp）
 * @throws {Error} 如果解析失败
 *
 * @example
 * parseApiTime("2024-01-01T12:00:00Z") // → Date 对象
 * parseApiTime("2024-01-01T12:00:00.123456") // → Date 对象 (自动视为 UTC)
 */
export function parseApiTime(isoString: string): Date {
  // 防御性处理：如果时间字符串不包含时区标识符，自动添加 'Z' (UTC)
  // 这是为了兼容后端可能返回的 naive datetime 格式
  let normalizedString = isoString.trim()

  // 检查是否已经有时区标识符
  const hasTimezone = normalizedString.endsWith('Z') ||
                      normalizedString.includes('+') ||
                      normalizedString.includes('-', 10) // 避免匹配日期中的 '-'

  if (!hasTimezone) {
    // 没有时区标识符，默认视为 UTC 时间
    normalizedString = normalizedString + 'Z'
    console.debug(`[parseApiTime] 添加 UTC 标识符: ${isoString} → ${normalizedString}`)
  }

  const date = new Date(normalizedString)
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid API time format: ${isoString}`)
  }
  return date
}

/**
 * 格式化时间为应用时区字符串（用于显示）
 *
 * 示例: "2024-01-01 20:00:00" (Asia/Shanghai, UTC+8)
 *
 * @param date - Date 对象（从 parseApiTime 解析得到，内部为 UTC timestamp）
 * @param formatStr - 格式字符串，默认 "yyyy-MM-dd HH:mm:ss"
 * @returns 应用时区（Asia/Shanghai）的格式化时间字符串
 *
 * @example
 * const date = parseApiTime("2024-01-01T12:00:00Z")
 * formatAppTime(date) // "2024-01-01 20:00:00" (UTC+8)
 */
export function formatAppTime(
  date: Date,
  formatStr: string = 'yyyy-MM-dd HH:mm:ss'
): string {
  // 使用 date-fns-tz 在应用时区（Asia/Shanghai）中格式化时间
  return formatInTimeZone(date, APP_TIMEZONE, formatStr)
}

/**
 * 格式化相对时间（用于显示 "刚刚"、"5分钟前" 等）
 *
 * @param apiTime - 后端返回的时间字符串
 * @returns 相对时间字符串
 *
 * @example
 * formatRelativeTime("2024-01-01T12:00:00Z") // "5分钟前"
 */
export function formatRelativeTime(apiTime: string): string {
  const date = parseApiTime(apiTime)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 7) {
    return formatAppTime(date, 'yyyy-MM-dd')
  } else if (days > 0) {
    return `${days}天前`
  } else if (hours > 0) {
    return `${hours}小时前`
  } else if (minutes > 0) {
    return `${minutes}分钟前`
  } else {
    return '刚刚'
  }
}

/**
 * 时间格式化配置（供 Element Plus DatePicker 使用）
 */
export const TIME_FORMAT_CONFIG = {
  // 日期时间选择器格式
  datetimeFormat: 'YYYY-MM-DD HH:mm:ss',
  // 日期格式
  dateFormat: 'YYYY-MM-DD',
  // 时间格式
  timeFormat: 'HH:mm:ss',
}

// ==================== 缺失功能实现 ====================

/**
 * 将应用时区时间字符串转换为 API UTC 时间（用于表单提交）
 *
 * 输入: 应用时区的时间字符串（如 "2024-01-01 20:00:00"，视为 Asia/Shanghai 时间）
 * 输出: ISO 8601 UTC 时间字符串（如 "2024-01-01T12:00:00Z"）
 *
 * 注意: 当前仅支持 "yyyy-MM-dd HH:mm:ss" 格式输入
 *
 * @param localDateTime - 应用时区的时间字符串
 * @returns ISO 8601 UTC 时间字符串（带 'Z' 后缀）
 *
 * @example
 * // 表单提交时将本地时间转换为 UTC
 * const utcTime = toApiTime("2024-01-01 20:00:00")
 * // "2024-01-01T12:00:00Z" (Asia/Shanghai 20:00 = UTC 12:00)
 */
export function toApiTime(localDateTime: string): string {
  // 使用 date-fns-tz 将应用时区时间转换为 UTC ISO 8601 格式
  // formatInTimeZone 会自动处理时区转换
  const utcIsoString = formatInTimeZone(localDateTime, APP_TIMEZONE, "yyyy-MM-dd'T'HH:mm:ssXXX")
  // formatInTimeZone 返回的格式是 "2024-01-01T12:00:00+00:00"，需要转换为 "2024-01-01T12:00:00Z"
  return utcIsoString.replace('+00:00', 'Z')
}

/**
 * 格式化时间为浏览器本地时区字符串（用于个性化显示）
 *
 * @param date - Date 对象（从 parseApiTime 解析得到）
 * @param formatStr - 格式字符串，默认 "yyyy-MM-dd HH:mm:ss"
 * @returns 浏览器本地时区的格式化时间字符串
 *
 * @example
 * const date = parseApiTime("2024-01-01T12:00:00Z")
 * formatLocalTime(date) // 取决于浏览器时区，如 "2024-01-01 20:00:00" (Asia/Shanghai)
 */
export function formatLocalTime(
  date: Date,
  formatStr: string = 'yyyy-MM-dd HH:mm:ss'
): string {
  // 使用 date-fns-tz 在浏览器本地时区中格式化时间
  return formatInTimeZone(date, BROWSER_TIMEZONE, formatStr)
}

/**
 * 获取当前 UTC 时间（ISO 8601 格式）
 *
 * @returns 当前 UTC 时间字符串（如 "2024-01-01T12:00:00.123Z"）
 *
 * @example
 * const now = nowUtc() // "2024-01-01T12:00:00.123Z"
 */
export function nowUtc(): string {
  return new Date().toISOString()
}

/**
 * 比较两个时间字符串
 *
 * @param time1 - 时间字符串 1
 * @param time2 - 时间字符串 2
 * @returns 比较结果：-1 (time1 < time2), 0 (time1 = time2), 1 (time1 > time2)
 *
 * @example
 * compareTime("2024-01-01T12:00:00Z", "2024-01-01T13:00:00Z") // -1
 * compareTime("2024-01-01T12:00:00Z", "2024-01-01T12:00:00Z") // 0
 * compareTime("2024-01-01T13:00:00Z", "2024-01-01T12:00:00Z") // 1
 */
export function compareTime(time1: string, time2: string): number {
  const date1 = parseApiTime(time1).getTime()
  const date2 = parseApiTime(time2).getTime()

  if (date1 < date2) return -1
  if (date1 > date2) return 1
  return 0
}

/**
 * 检查时间是否已过期
 *
 * @param time - 时间字符串（通常从 API 返回）
 * @param currentTime - 当前时间字符串（可选，默认使用系统时间）
 * @returns true 如果已过期，false 如果未过期
 *
 * @example
 * isExpired("2024-01-01T12:00:00Z") // 取决于当前时间
 * isExpired("2099-01-01T12:00:00Z") // false
 */
export function isExpired(time: string, currentTime?: string): boolean {
  const targetDate = parseApiTime(time).getTime()
  const now = currentTime ? parseApiTime(currentTime).getTime() : Date.now()
  return targetDate < now
}

// ==================== 多时区支持函数 ====================

/**
 * 格式化时间到指定时区（用于多时区场景）
 *
 * 与 formatAppTime 的区别:
 * - formatAppTime() 使用固定的应用时区（Asia/Shanghai）
 * - formatInTimezone() 可以指定任意时区
 *
 * @param date - Date 对象（从 parseApiTime 解析得到）
 * @param timezone - 目标时区（如 'Asia/Shanghai', 'America/New_York'）
 * @param formatStr - 格式字符串，默认 "yyyy-MM-dd HH:mm:ss"
 * @returns 指定时区的格式化时间字符串
 *
 * @example
 * const date = parseApiTime("2024-01-01T12:00:00Z")
 * formatInTimezone(date, 'Asia/Shanghai') // "2024-01-01 20:00:00" (UTC+8)
 * formatInTimezone(date, 'America/New_York') // "2024-01-01 07:00:00" (UTC-5)
 */
export function formatInTimezone(
  date: Date,
  timezone: string,
  formatStr: string = 'yyyy-MM-dd HH:mm:ss'
): string {
  return formatInTimeZone(date, timezone, formatStr)
}

/**
 * 将指定时区的本地时间转换为 API UTC 时间（用于多时区表单提交）
 *
 * 与 toApiTime 的区别:
 * - toApiTime() 假设输入是应用时区（Asia/Shanghai）时间
 * - toApiTimeFromTimezone() 可以指定输入时区
 *
 * @param localDateTime - 指定时区的本地时间字符串
 * @param sourceTimezone - 源时区（用户所在时区，如 'America/New_York'）
 * @returns ISO 8601 UTC 时间字符串（带 'Z' 后缀）
 *
 * @example
 * // 用户在纽约选择了 "2024-01-01 12:00:00"
 * const utcTime = toApiTimeFromTimezone("2024-01-01 12:00:00", "America/New_York")
 * // "2024-01-01T17:00:00Z" (纽约 12:00 = UTC 17:00)
 */
export function toApiTimeFromTimezone(
  localDateTime: string,
  sourceTimezone: string
): string {
  const utcIsoString = formatInTimeZone(
    localDateTime,
    sourceTimezone,
    "yyyy-MM-dd'T'HH:mm:ssXXX"
  )
  return utcIsoString.replace('+00:00', 'Z')
}
