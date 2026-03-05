/**
 * 错误通知服务
 * 集成Element Plus组件，实现分级错误通知
 */

import { ElMessage, ElNotification, ElMessageBox } from 'element-plus'
import type { MessageParams, NotificationParams } from 'element-plus'
import type { ErrorClassification } from '../utils/error-classifier'
import { NotificationType } from '../constants/response-codes'

// ==================== 类型定义 ====================

/**
 * 通知配置选项
 */
export interface NotificationConfig {
  /** 是否启用对话框通知 */
  enableDialog?: boolean
  /** 是否启用右上角通知 */
  enableNotification?: boolean
  /** 是否启用顶部消息提示 */
  enableMessage?: boolean
  /** 是否启用日志记录 */
  enableLogging?: boolean
  /** 自定义通知处理函数 */
  customHandler?: (classification: ErrorClassification) => void | Promise<void>
}

/**
 * 全局配置
 */
interface GlobalConfig extends NotificationConfig {
  /** 是否已初始化 */
  initialized: boolean
}

// ==================== 全局状态 ====================

/** 全局配置 */
const globalConfig: GlobalConfig = {
  initialized: false,
  enableDialog: true,
  enableNotification: true,
  enableMessage: true,
  enableLogging: true,
  customHandler: undefined
}

// ==================== 日志工具 ====================

/**
 * 根据日志级别记录日志
 * @param classification 错误分类结果
 */
function logError(classification: ErrorClassification): void {
  if (!globalConfig.enableLogging) return

  const { logMessage, metadata } = classification

  switch (metadata.logLevel) {
    case 'debug':
      console.debug('[API Debug]', logMessage)
      break
    case 'info':
      console.info('[API Info]', logMessage)
      break
    case 'warn':
      console.warn('[API Warning]', logMessage)
      break
    case 'error':
    case 'fatal':
      console.error('[API Error]', logMessage)
      break
  }
}

// ==================== 内部通知实现 ====================

/**
 * 显示对话框通知（需用户确认）
 * @param classification 错误分类结果
 * @returns Promise，用户确认后resolve
 */
async function showDialogInternal(classification: ErrorClassification): Promise<void> {
  if (!globalConfig.enableDialog) return

  const { userMessage, severity } = classification

  // 根据严重程度选择对话框类型
  let title = '提示'

  switch (severity) {
    case 'critical':
    case 'high':
      title = '错误'
      break
    case 'medium':
      title = '警告'
      break
    case 'low':
      title = '提示'
      break
  }

  try {
    await ElMessageBox.alert(userMessage, title, {
      confirmButtonText: '确定',
      type: severity === 'critical' || severity === 'high' ? 'error' : 'warning',
      dangerouslyUseHTMLString: false
    })
  } catch {
    // 用户点击关闭或ESC，忽略
  }
}

/**
 * 显示右上角通知
 * @param classification 错误分类结果
 */
function showNotificationInternal(classification: ErrorClassification): void {
  if (!globalConfig.enableNotification) return

  const { userMessage, severity } = classification

  // 映射严重程度到Element Plus类型
  const typeMap: Record<string, 'info' | 'success' | 'warning' | 'error'> = {
    critical: 'error',
    high: 'error',
    medium: 'warning',
    low: 'info'
  }

  const options: NotificationParams = {
    title: severity === 'critical' || severity === 'high' ? '错误' : '提示',
    message: userMessage,
    type: typeMap[severity] || 'info',
    duration: severity === 'low' ? 3000 : 0, // 低级错误3秒自动关闭，其他需要手动关闭
    showClose: true
  }

  ElNotification(options)
}

/**
 * 显示顶部消息提示
 * @param classification 错误分类结果
 */
function showMessageInternal(classification: ErrorClassification): void {
  if (!globalConfig.enableMessage) return

  const { userMessage, severity } = classification

  // 映射严重程度到Element Plus类型
  const typeMap: Record<string, 'info' | 'success' | 'warning' | 'error'> = {
    critical: 'error',
    high: 'error',
    medium: 'warning',
    low: 'info'
  }

  const options: MessageParams = {
    message: userMessage,
    type: typeMap[severity] || 'info',
    duration: severity === 'low' ? 2000 : 3000,
    showClose: true
  }

  ElMessage(options)
}

// ==================== 主入口 ====================

/**
 * 显示错误通知（主入口）
 * 根据错误分类结果自动选择合适的通知方式
 * @param classification 错误分类结果
 */
export async function show(classification: ErrorClassification): Promise<void> {
  // 执行自定义处理函数（如果配置）
  if (globalConfig.customHandler) {
    await globalConfig.customHandler(classification)
  }

  // 记录日志
  logError(classification)

  // 根据通知类型显示通知
  switch (classification.notificationType) {
    case NotificationType.DIALOG:
      await showDialogInternal(classification)
      break

    case NotificationType.NOTIFICATION:
      showNotificationInternal(classification)
      break

    case NotificationType.MESSAGE:
      showMessageInternal(classification)
      break

    case NotificationType.SILENT:
      // 静默处理，仅记录日志
      logError(classification)
      break
  }
}

/**
 * 显示对话框通知
 * @param message 消息内容
 * @param title 标题
 * @param type 类型
 */
export async function showDialog(
  message: string,
  title = '提示',
  type: 'info' | 'success' | 'warning' | 'error' = 'info'
): Promise<void> {
  if (!globalConfig.enableDialog) return

  try {
    await ElMessageBox.alert(message, title, {
      confirmButtonText: '确定',
      type,
      dangerouslyUseHTMLString: false
    })
  } catch {
    // 用户点击关闭或ESC，忽略
  }
}

/**
 * 显示右上角通知
 * @param message 消息内容
 * @param title 标题
 * @param type 类型
 * @param duration 持续时间（毫秒），0表示不自动关闭
 */
export function showNotification(
  message: string,
  title = '通知',
  type: 'info' | 'success' | 'warning' | 'error' = 'info',
  duration = 3000
): void {
  if (!globalConfig.enableNotification) return

  ElNotification({
    title,
    message,
    type,
    duration,
    showClose: true
  })
}

/**
 * 显示顶部消息提示
 * @param message 消息内容
 * @param type 类型
 * @param duration 持续时间（毫秒）
 */
export function showMessage(
  message: string,
  type: 'info' | 'success' | 'warning' | 'error' = 'info',
  duration = 3000
): void {
  if (!globalConfig.enableMessage) return

  ElMessage({
    message,
    type,
    duration,
    showClose: true
  })
}

/**
 * 显示成功消息
 * @param message 消息内容
 */
export function showSuccess(message: string): void {
  showMessage(message, 'success', 2000)
}

/**
 * 显示错误消息
 * @param message 消息内容
 */
export function showError(message: string): void {
  showMessage(message, 'error', 3000)
}

/**
 * 显示警告消息
 * @param message 消息内容
 */
export function showWarning(message: string): void {
  showMessage(message, 'warning', 3000)
}

/**
 * 显示信息消息
 * @param message 消息内容
 */
export function showInfo(message: string): void {
  showMessage(message, 'info', 2000)
}

// ==================== 配置管理 ====================

/**
 * 配置错误通知服务
 * @param config 配置选项
 */
export function configure(config: NotificationConfig): void {
  Object.assign(globalConfig, config)
  globalConfig.initialized = true
}

/**
 * 获取当前配置
 * @returns 当前配置
 */
export function getConfig(): Readonly<GlobalConfig> {
  return globalConfig
}

/**
 * 重置配置为默认值
 */
export function resetConfig(): void {
  globalConfig.enableDialog = true
  globalConfig.enableNotification = true
  globalConfig.enableMessage = true
  globalConfig.enableLogging = true
  globalConfig.customHandler = undefined
}

/**
 * 初始化错误通知服务
 * 通常在应用启动时调用
 * @param config 初始配置（可选）
 */
export function initializeErrorNotification(config?: NotificationConfig): void {
  if (config) {
    configure(config)
  }
  globalConfig.initialized = true
}

// ==================== 导出默认实例 ====================

export default {
  show,
  showDialog,
  showNotification,
  showMessage,
  showSuccess,
  showError,
  showWarning,
  showInfo,
  configure,
  getConfig,
  resetConfig,
  initialize: initializeErrorNotification
}
