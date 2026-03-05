/**
 * 错误分类器
 * 根据响应码和错误类型进行分类，确定处理策略
 */

import type { ApiError } from '../types/request'
import type { ResponseCodeMetadata } from '../constants/response-codes'
import {
  getResponseCodeMetadata,
  getResponseCodeRange,
  ResponseCodeRange,
  ClientErrorCode,
  ErrorSeverity,
  NotificationType,
  LogLevel
} from '../constants/response-codes'

// ==================== 错误类型枚举 ====================

/**
 * 错误类型枚举
 */
export enum ErrorType {
  /** 认证错误（未登录、Token过期等） */
  AUTH = 'auth',
  /** 权限错误（无权限访问） */
  PERMISSION = 'permission',
  /** 资源错误（资源不存在、冲突等） */
  RESOURCE = 'resource',
  /** 验证错误（参数验证失败） */
  VALIDATION = 'validation',
  /** 业务逻辑错误 */
  BUSINESS = 'business',
  /** 服务器错误 */
  SERVER = 'server',
  /** 网络错误（无网络、超时等） */
  NETWORK = 'network'
}

// ==================== 错误分类结果 ====================

/**
 * 错误分类结果
 */
export interface ErrorClassification {
  /** 错误类型 */
  type: ErrorType
  /** 错误严重程度 */
  severity: ErrorSeverity
  /** 用户可见的错误消息 */
  userMessage: string
  /** 日志消息 */
  logMessage: string
  /** 通知类型 */
  notificationType: NotificationType
  /** 是否可重试 */
  retryable: boolean
  /** 是否需要重新登录 */
  requiresAuth: boolean
  /** 响应码元数据 */
  metadata: ResponseCodeMetadata
}

// ==================== 错误分类器 ====================

/**
 * 根据响应码分类错误
 * @param code 响应码
 * @param message 后端返回的错误消息
 * @returns 错误分类结果
 */
export function classifyErrorByCode(code: string, message?: string): ErrorClassification {
  const metadata = getResponseCodeMetadata(code)
  const range = getResponseCodeRange(code)

  // 确定错误类型
  const type = getErrorType(code, range)

  // 确定是否需要重新登录
  const requiresAuth = isAuthError(code)

  // 用户消息优先使用后端返回的消息，否则使用默认消息
  const userMessage = message || metadata.defaultMessage

  // 日志消息包含响应码
  const logMessage = `[${code}] ${userMessage}`

  return {
    type,
    severity: metadata.severity,
    userMessage,
    logMessage,
    notificationType: metadata.notificationType,
    retryable: metadata.retryable,
    requiresAuth,
    metadata
  }
}

/**
 * 根据API错误对象分类错误
 * @param error API错误对象
 * @returns 错误分类结果
 */
export function classifyApiError(error: ApiError): ErrorClassification {
  // 如果有响应码，使用响应码分类
  if (error.code !== undefined) {
    return classifyErrorByCode(error.code, error.message)
  }

  // 如果有HTTP状态码，根据状态码分类
  if (error.statusCode !== undefined) {
    return classifyErrorByStatusCode(error.statusCode, error.message)
  }

  // 根据错误类型分类
  return classifyErrorByType(error.type, error.message)
}

/**
 * 根据HTTP状态码分类错误
 * @param statusCode HTTP状态码
 * @param message 错误消息
 * @returns 错误分类结果
 */
export function classifyErrorByStatusCode(statusCode: number, message?: string): ErrorClassification {
  // 映射HTTP状态码到响应码
  const codeMap: Record<number, string> = {
    400: '2000', // Bad Request
    401: '2010', // Unauthorized
    403: '2020', // Forbidden
    404: '3000', // Not Found
    409: '3012', // Conflict
    422: '2003', // Unprocessable Entity
    429: '9000', // Too Many Requests
    500: '5000', // Internal Server Error
    502: '5000', // Bad Gateway
    503: '5030', // Service Unavailable
    504: '5000'  // Gateway Timeout
  }

  const code = codeMap[statusCode] ?? '5000'
  return classifyErrorByCode(code, message)
}

/**
 * 根据错误类型分类错误
 * @param errorType 错误类型
 * @param message 错误消息
 * @returns 错误分类结果
 */
export function classifyErrorByType(errorType: ApiError['type'], message?: string): ErrorClassification {
  // 默认元数据
  const defaultMetadata: ResponseCodeMetadata = {
    code: '5000',
    range: ResponseCodeRange.SERVER_ERROR,
    severity: ErrorSeverity.MEDIUM,
    defaultMessage: '未知错误',
    logLevel: LogLevel.ERROR,
    retryable: false,
    notificationType: NotificationType.MESSAGE
  }

  let type: ErrorType
  let severity: ErrorSeverity
  let userMessage = message || '请求失败，请稍后重试'

  switch (errorType) {
    case 'network':
      type = ErrorType.NETWORK
      severity = ErrorSeverity.HIGH
      userMessage = message || '网络连接失败，请检查网络设置'
      break

    case 'timeout':
      type = ErrorType.NETWORK
      severity = ErrorSeverity.MEDIUM
      userMessage = message || '请求超时，请稍后重试'
      break

    case 'auth':
      type = ErrorType.AUTH
      severity = ErrorSeverity.HIGH
      userMessage = message || '请先登录'
      break

    case 'permission':
      type = ErrorType.PERMISSION
      severity = ErrorSeverity.HIGH
      userMessage = message || '无权限访问'
      break

    case 'server':
      type = ErrorType.SERVER
      severity = ErrorSeverity.CRITICAL
      userMessage = message || '服务器错误，请稍后重试'
      break

    default:
      type = ErrorType.SERVER
      severity = ErrorSeverity.MEDIUM
  }

  return {
    type,
    severity,
    userMessage,
    logMessage: userMessage,
    notificationType: NotificationType.MESSAGE,
    retryable: type === ErrorType.NETWORK || type === ErrorType.SERVER,
    requiresAuth: type === ErrorType.AUTH,
    metadata: defaultMetadata
  }
}

/**
 * 根据响应码范围获取错误类型
 * @param code 响应码
 * @param range 响应码范围
 * @returns 错误类型
 */
function getErrorType(code: string, range: ResponseCodeRange): ErrorType {
  // 认证授权错误（2010-2099）
  const codeNum = Number.parseInt(code, 10)
  if (codeNum >= 2010 && codeNum < 2100) {
    return ErrorType.AUTH
  }

  // 根据范围分类
  switch (range) {
    case ResponseCodeRange.SUCCESS:
      // 成功响应不应产生错误
      return ErrorType.BUSINESS

    case ResponseCodeRange.CLIENT_ERROR:
      // 客户端错误可能是验证错误或认证错误
      if (codeNum >= 2000 && codeNum < 2010) {
        return ErrorType.VALIDATION
      }
      return ErrorType.AUTH

    case ResponseCodeRange.RESOURCE_ERROR:
      return ErrorType.RESOURCE

    case ResponseCodeRange.BUSINESS_ERROR:
      return ErrorType.BUSINESS

    case ResponseCodeRange.SERVER_ERROR:
      return ErrorType.SERVER

    default:
      return ErrorType.SERVER
  }
}

/**
 * 判断是否为认证错误
 * @param code 响应码
 * @returns 是否需要重新登录
 */
function isAuthError(code: string): boolean {
  return (
    code === ClientErrorCode.UNAUTHORIZED ||
    code === ClientErrorCode.INVALID_TOKEN ||
    code === ClientErrorCode.TOKEN_EXPIRED ||
    code === ClientErrorCode.TOKEN_MISSING
  )
}

/**
 * 判断错误是否需要显示对话框
 * @param classification 错误分类结果
 * @returns 是否需要显示对话框
 */
export function shouldShowDialog(classification: ErrorClassification): boolean {
  return classification.notificationType === NotificationType.DIALOG
}

/**
 * 判断错误是否需要显示通知
 * @param classification 错误分类结果
 * @returns 是否需要显示通知
 */
export function shouldShowNotification(classification: ErrorClassification): boolean {
  return classification.notificationType === NotificationType.NOTIFICATION
}

/**
 * 判断错误是否需要显示消息
 * @param classification 错误分类结果
 * @returns 是否需要显示消息
 */
export function shouldShowMessage(classification: ErrorClassification): boolean {
  return classification.notificationType === NotificationType.MESSAGE
}

/**
 * 判断错误是否应该静默处理
 * @param classification 错误分类结果
 * @returns 是否应该静默处理
 */
export function shouldSilent(classification: ErrorClassification): boolean {
  return classification.notificationType === NotificationType.SILENT
}
