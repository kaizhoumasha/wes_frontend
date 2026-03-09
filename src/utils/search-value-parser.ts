/**
 * 搜索值解析器
 *
 * 将用户输入的关键字解析为指定类型的值。
 * 这是一个纯函数模块，不依赖 Vue，可单独测试。
 *
 * @module utils/search-value-parser
 */

import type { SearchDataType } from '@/types/search'

// ==================== 类型定义 ====================

/**
 * 值解析结果
 */
export interface ParsedValue {
  /** 是否解析成功 */
  success: boolean
  /** 解析后的值（成功时） */
  value?: unknown
  /** 错误信息（失败时） */
  error?: string
}

// ==================== 主函数 ====================

/**
 * 将用户输入的关键字解析为指定类型的值
 *
 * @param keyword - 用户输入的关键字
 * @param dataType - 目标数据类型
 * @returns 解析结果
 *
 * @example
 * ```ts
 * parseKeywordValue('true', 'boolean')  // { success: true, value: true }
 * parseKeywordValue('123', 'number')    // { success: true, value: 123 }
 * parseKeywordValue('abc', 'number')    // { success: false, error: '...' }
 * parseKeywordValue('admin', 'text')    // { success: true, value: 'admin' }
 * ```
 */
export function parseKeywordValue(
  keyword: string,
  dataType: SearchDataType
): ParsedValue {
  const trimmed = keyword.trim()

  if (dataType === 'boolean') {
    return parseBooleanValue(trimmed)
  }

  if (dataType === 'number') {
    return parseNumberValue(trimmed)
  }

  // text, date, enum 直接返回原始值
  return { success: true, value: trimmed }
}

// ==================== 布尔值解析 ====================

/**
 * 布尔值解析映射表
 *
 * 支持多种语言和格式的布尔值表示：
 * - 英文: true/false, yes/no, y/n
 * - 中文: 是/否
 * - 数字: 1/0
 */
const BOOLEAN_VALUE_MAP: Record<string, boolean> = {
  // 英文
  'true': true,
  'false': false,
  'yes': true,
  'no': false,
  'y': true,
  'n': false,
  // 中文
  '是': true,
  '否': false,
  // 数字
  '1': true,
  '0': false,
}

/**
 * 解析布尔值
 *
 * @param value - 待解析的字符串
 * @returns 解析结果
 *
 * @example
 * ```ts
 * parseBooleanValue('true')   // { success: true, value: true }
 * parseBooleanValue('是')     // { success: true, value: true }
 * parseBooleanValue('1')      // { success: true, value: true }
 * parseBooleanValue('abc')    // { success: false, error: '无法解析布尔值: abc' }
 * ```
 */
function parseBooleanValue(value: string): ParsedValue {
  const lower = value.toLowerCase()

  if (lower in BOOLEAN_VALUE_MAP) {
    return { success: true, value: BOOLEAN_VALUE_MAP[lower] }
  }

  return {
    success: false,
    error: `无法解析布尔值: ${value}（支持：true/false、是/否、1/0、y/n）`,
  }
}

// ==================== 数值解析 ====================

/**
 * 解析数值
 *
 * @param value - 待解析的字符串
 * @returns 解析结果
 *
 * @example
 * ```ts
 * parseNumberValue('123')    // { success: true, value: 123 }
 * parseNumberValue('-45.6')  // { success: true, value: -45.6 }
 * parseNumberValue('abc')    // { success: false, error: '无法解析数值: abc' }
 * ```
 */
function parseNumberValue(value: string): ParsedValue {
  const num = Number(value)

  if (Number.isNaN(num)) {
    return {
      success: false,
      error: `无法解析数值: ${value}`,
    }
  }

  return { success: true, value: num }
}

// ==================== 工具函数 ====================

/**
 * 检查字符串是否可以解析为布尔值
 *
 * @param value - 待检查的字符串
 * @returns 是否为有效的布尔值字符串
 *
 * @example
 * ```ts
 * isBooleanString('true')  // true
 * isBooleanString('是')    // true
 * isBooleanString('123')   // false
 * ```
 */
export function isBooleanString(value: string): boolean {
  const lower = value.toLowerCase().trim()
  return lower in BOOLEAN_VALUE_MAP
}

/**
 * 检查字符串是否可以解析为数值
 *
 * @param value - 待检查的字符串
 * @returns 是否为有效的数值字符串
 *
 * @example
 * ```ts
 * isNumericString('123')    // true
 * isNumericString('-45.6')  // true
 * isNumericString('abc')    // false
 * ```
 */
export function isNumericString(value: string): boolean {
  const trimmed = value.trim()
  return /^-?\d+(\.\d+)?$/.test(trimmed) && !Number.isNaN(Number(trimmed))
}
