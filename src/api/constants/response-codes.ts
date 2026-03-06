/**
 * 统一响应码定义
 * 与后端响应码体系对齐（字符串类型）
 *
 * 后端响应码体系（字符串类型）：
 * - "1xxx": 成功响应
 * - "2xxx": 客户端错误（参数、格式）
 * - "3xxx": 资源相关错误（不存在、冲突）
 * - "4xxx": 业务逻辑错误
 * - "5xxx": 服务器错误
 * - "8xxx": 第三方服务错误
 * - "9xxx": 其他错误
 */

// ==================== 响应码范围枚举 ====================

/** 响应码范围枚举 */
export enum ResponseCodeRange {
  /** 成功响应 (1xxx) */
  SUCCESS = '1xxx',
  /** 客户端错误 (2xxx) */
  CLIENT_ERROR = '2xxx',
  /** 资源相关错误 (3xxx) */
  RESOURCE_ERROR = '3xxx',
  /** 业务逻辑错误 (4xxx) */
  BUSINESS_ERROR = '4xxx',
  /** 服务器错误 (5xxx) */
  SERVER_ERROR = '5xxx',
  /** 第三方服务错误 (8xxx) */
  EXTERNAL_SERVICE_ERROR = '8xxx',
  /** 其他错误 (9xxx) */
  MISC_ERROR = '9xxx'
}

// ==================== 响应码枚举（字符串类型）====================

/** 成功响应码 (1xxx) */
export enum SuccessCode {
  /** 请求成功 */
  SUCCESS = '1000',
  /** 创建成功 */
  CREATED = '1001',
  /** 更新成功 */
  UPDATED = '1002',
  /** 删除成功 */
  DELETED = '1003',
  /** 异步任务已接受 */
  ACCEPTED = '1004'
}

/** 客户端错误码 (2xxx) */
export enum ClientErrorCode {
  /** 请求参数错误 */
  BAD_REQUEST = '2000',
  /** 无效的参数 */
  INVALID_PARAMETER = '2001',
  /** 缺少必需参数 */
  MISSING_PARAMETER = '2002',
  /** 数据格式错误 */
  INVALID_FORMAT = '2003',
  /** 数据验证失败 */
  VALIDATION_ERROR = '2004',
  /** 未授权，请先登录 */
  UNAUTHORIZED = '2010',
  /** 用户名或密码错误 */
  INVALID_CREDENTIALS = '2011',
  /** 无效的令牌 */
  INVALID_TOKEN = '2012',
  /** 令牌已过期 */
  TOKEN_EXPIRED = '2013',
  /** 缺少令牌 */
  TOKEN_MISSING = '2014',
  /** 无权访问 */
  FORBIDDEN = '2020',
  /** 权限不足 */
  PERMISSION_DENIED = '2022'
}

/** 资源错误码 (3xxx) */
export enum ResourceErrorCode {
  /** 资源不存在 */
  NOT_FOUND = '3000',
  /** 用户不存在 */
  USER_NOT_FOUND = '3001',
  /** 资源已存在 */
  ALREADY_EXISTS = '3010',
  /** 资源冲突 */
  CONFLICT = '3012',
  /** 资源已被锁定 */
  RESOURCE_LOCKED = '3020',
  /** 资源已被删除 */
  RESOURCE_GONE = '3021'
}

/** 业务逻辑错误码 (4xxx) */
export enum BusinessErrorCode {
  /** 操作失败 */
  OPERATION_FAILED = '4000',
  /** 无效的状态 */
  INVALID_STATE = '4001',
  /** 余额不足 */
  INSUFFICIENT_BALANCE = '4010',
  /** 配额已用尽 */
  QUOTA_EXCEEDED = '4011',
  /** 数据完整性错误 */
  DATA_INTEGRITY_ERROR = '4020'
}

/** 服务器错误码 (5xxx) */
export enum ServerErrorCode {
  /** 服务器内部错误 */
  INTERNAL_ERROR = '5000',
  /** 运行时错误 */
  RUNTIME_ERROR = '5001',
  /** 配置错误 */
  CONFIGURATION_ERROR = '5002',
  /** 数据库错误 */
  DATABASE_ERROR = '5010',
  /** 缓存错误 */
  CACHE_ERROR = '5020',
  /** 服务暂不可用 */
  SERVICE_UNAVAILABLE = '5030',
  /** 系统维护中 */
  MAINTENANCE_MODE = '5031'
}

/** 第三方服务错误码 (8xxx) */
export enum ExternalServiceErrorCode {
  /** 外部服务错误 */
  EXTERNAL_API_ERROR = '8000',
  /** 外部服务超时 */
  EXTERNAL_API_TIMEOUT = '8001',
  /** 外部服务不可用 */
  EXTERNAL_API_UNAVAILABLE = '8002'
}

/** 其他错误码 (9xxx) */
export enum MiscErrorCode {
  /** 请求过于频繁 */
  RATE_LIMIT_EXCEEDED = '9000',
  /** 请求次数过多 */
  TOO_MANY_REQUESTS = '9001',
  /** 未知错误 */
  UNKNOWN_ERROR = '9999'
}

// ==================== 响应码元数据 ====================

/** 日志级别 */
export enum LogLevel {
  /** 调试 */
  DEBUG = 'debug',
  /** 信息 */
  INFO = 'info',
  /** 警告 */
  WARN = 'warn',
  /** 错误 */
  ERROR = 'error',
  /** 致命错误 */
  FATAL = 'fatal'
}

/** 通知类型 */
export enum NotificationType {
  /** 对话框（需用户确认） */
  DIALOG = 'dialog',
  /** 通知组件（右上角） */
  NOTIFICATION = 'notification',
  /** 消息提示（顶部居中） */
  MESSAGE = 'message',
  /** 静默（不显示通知） */
  SILENT = 'silent'
}

/** 错误严重程度 */
export enum ErrorSeverity {
  /** 致命：系统级错误，需立即处理 */
  CRITICAL = 'critical',
  /** 高：影响核心功能 */
  HIGH = 'high',
  /** 中：影响部分功能 */
  MEDIUM = 'medium',
  /** 低：不影响功能 */
  LOW = 'low'
}

/** 响应码元数据 */
export interface ResponseCodeMetadata {
  /** 响应码（字符串） */
  code: string
  /** 响应码范围 */
  range: ResponseCodeRange
  /** 错误严重程度 */
  severity: ErrorSeverity
  /** 默认用户消息（可通过后端 message 覆盖） */
  defaultMessage: string
  /** 日志级别 */
  logLevel: LogLevel
  /** 是否可自动重试 */
  retryable: boolean
  /** 通知类型 */
  notificationType: NotificationType
}

/** 响应码元数据映射表 */
const RESPONSE_CODE_METADATA: Record<string, ResponseCodeMetadata> = {
  // ==================== 成功响应 ====================
  [SuccessCode.SUCCESS]: {
    code: SuccessCode.SUCCESS,
    range: ResponseCodeRange.SUCCESS,
    severity: ErrorSeverity.LOW,
    defaultMessage: '操作成功',
    logLevel: LogLevel.INFO,
    retryable: false,
    notificationType: NotificationType.SILENT
  },
  [SuccessCode.CREATED]: {
    code: SuccessCode.CREATED,
    range: ResponseCodeRange.SUCCESS,
    severity: ErrorSeverity.LOW,
    defaultMessage: '创建成功',
    logLevel: LogLevel.INFO,
    retryable: false,
    notificationType: NotificationType.MESSAGE
  },
  [SuccessCode.UPDATED]: {
    code: SuccessCode.UPDATED,
    range: ResponseCodeRange.SUCCESS,
    severity: ErrorSeverity.LOW,
    defaultMessage: '更新成功',
    logLevel: LogLevel.INFO,
    retryable: false,
    notificationType: NotificationType.MESSAGE
  },
  [SuccessCode.DELETED]: {
    code: SuccessCode.DELETED,
    range: ResponseCodeRange.SUCCESS,
    severity: ErrorSeverity.LOW,
    defaultMessage: '删除成功',
    logLevel: LogLevel.INFO,
    retryable: false,
    notificationType: NotificationType.MESSAGE
  },
  [SuccessCode.ACCEPTED]: {
    code: SuccessCode.ACCEPTED,
    range: ResponseCodeRange.SUCCESS,
    severity: ErrorSeverity.LOW,
    defaultMessage: '请求已接受',
    logLevel: LogLevel.INFO,
    retryable: false,
    notificationType: NotificationType.MESSAGE
  },

  // ==================== 客户端错误 ====================
  [ClientErrorCode.BAD_REQUEST]: {
    code: ClientErrorCode.BAD_REQUEST,
    range: ResponseCodeRange.CLIENT_ERROR,
    severity: ErrorSeverity.MEDIUM,
    defaultMessage: '请求参数错误',
    logLevel: LogLevel.WARN,
    retryable: false,
    notificationType: NotificationType.MESSAGE
  },
  [ClientErrorCode.INVALID_PARAMETER]: {
    code: ClientErrorCode.INVALID_PARAMETER,
    range: ResponseCodeRange.CLIENT_ERROR,
    severity: ErrorSeverity.MEDIUM,
    defaultMessage: '无效的参数',
    logLevel: LogLevel.WARN,
    retryable: false,
    notificationType: NotificationType.MESSAGE
  },
  [ClientErrorCode.MISSING_PARAMETER]: {
    code: ClientErrorCode.MISSING_PARAMETER,
    range: ResponseCodeRange.CLIENT_ERROR,
    severity: ErrorSeverity.MEDIUM,
    defaultMessage: '缺少必需参数',
    logLevel: LogLevel.WARN,
    retryable: false,
    notificationType: NotificationType.MESSAGE
  },
  [ClientErrorCode.INVALID_FORMAT]: {
    code: ClientErrorCode.INVALID_FORMAT,
    range: ResponseCodeRange.CLIENT_ERROR,
    severity: ErrorSeverity.MEDIUM,
    defaultMessage: '数据格式错误',
    logLevel: LogLevel.WARN,
    retryable: false,
    notificationType: NotificationType.MESSAGE
  },
  [ClientErrorCode.VALIDATION_ERROR]: {
    code: ClientErrorCode.VALIDATION_ERROR,
    range: ResponseCodeRange.CLIENT_ERROR,
    severity: ErrorSeverity.MEDIUM,
    defaultMessage: '数据验证失败',
    logLevel: LogLevel.WARN,
    retryable: false,
    notificationType: NotificationType.MESSAGE
  },
  [ClientErrorCode.UNAUTHORIZED]: {
    code: ClientErrorCode.UNAUTHORIZED,
    range: ResponseCodeRange.CLIENT_ERROR,
    severity: ErrorSeverity.HIGH,
    defaultMessage: '未授权，请先登录',
    logLevel: LogLevel.WARN,
    retryable: false,
    notificationType: NotificationType.MESSAGE
  },
  [ClientErrorCode.INVALID_CREDENTIALS]: {
    code: ClientErrorCode.INVALID_CREDENTIALS,
    range: ResponseCodeRange.CLIENT_ERROR,
    severity: ErrorSeverity.MEDIUM,
    defaultMessage: '用户名或密码错误',
    logLevel: LogLevel.WARN,
    retryable: false,
    notificationType: NotificationType.MESSAGE
  },
  [ClientErrorCode.INVALID_TOKEN]: {
    code: ClientErrorCode.INVALID_TOKEN,
    range: ResponseCodeRange.CLIENT_ERROR,
    severity: ErrorSeverity.HIGH,
    defaultMessage: '无效的令牌',
    logLevel: LogLevel.WARN,
    retryable: false,
    notificationType: NotificationType.MESSAGE
  },
  [ClientErrorCode.TOKEN_EXPIRED]: {
    code: ClientErrorCode.TOKEN_EXPIRED,
    range: ResponseCodeRange.CLIENT_ERROR,
    severity: ErrorSeverity.HIGH,
    defaultMessage: '令牌已过期',
    logLevel: LogLevel.WARN,
    retryable: false,
    notificationType: NotificationType.SILENT
  },
  [ClientErrorCode.TOKEN_MISSING]: {
    code: ClientErrorCode.TOKEN_MISSING,
    range: ResponseCodeRange.CLIENT_ERROR,
    severity: ErrorSeverity.HIGH,
    defaultMessage: '缺少令牌',
    logLevel: LogLevel.WARN,
    retryable: false,
    notificationType: NotificationType.MESSAGE
  },
  [ClientErrorCode.FORBIDDEN]: {
    code: ClientErrorCode.FORBIDDEN,
    range: ResponseCodeRange.CLIENT_ERROR,
    severity: ErrorSeverity.HIGH,
    defaultMessage: '无权访问',
    logLevel: LogLevel.WARN,
    retryable: false,
    notificationType: NotificationType.NOTIFICATION
  },
  [ClientErrorCode.PERMISSION_DENIED]: {
    code: ClientErrorCode.PERMISSION_DENIED,
    range: ResponseCodeRange.CLIENT_ERROR,
    severity: ErrorSeverity.HIGH,
    defaultMessage: '权限不足',
    logLevel: LogLevel.WARN,
    retryable: false,
    notificationType: NotificationType.NOTIFICATION
  },

  // ==================== 资源错误 ====================
  [ResourceErrorCode.NOT_FOUND]: {
    code: ResourceErrorCode.NOT_FOUND,
    range: ResponseCodeRange.RESOURCE_ERROR,
    severity: ErrorSeverity.MEDIUM,
    defaultMessage: '资源不存在',
    logLevel: LogLevel.WARN,
    retryable: false,
    notificationType: NotificationType.MESSAGE
  },
  [ResourceErrorCode.ALREADY_EXISTS]: {
    code: ResourceErrorCode.ALREADY_EXISTS,
    range: ResponseCodeRange.RESOURCE_ERROR,
    severity: ErrorSeverity.MEDIUM,
    defaultMessage: '资源已存在',
    logLevel: LogLevel.WARN,
    retryable: false,
    notificationType: NotificationType.MESSAGE
  },
  [ResourceErrorCode.CONFLICT]: {
    code: ResourceErrorCode.CONFLICT,
    range: ResponseCodeRange.RESOURCE_ERROR,
    severity: ErrorSeverity.MEDIUM,
    defaultMessage: '资源冲突',
    logLevel: LogLevel.WARN,
    retryable: false,
    notificationType: NotificationType.MESSAGE
  },

  // ==================== 业务错误 ====================
  [BusinessErrorCode.OPERATION_FAILED]: {
    code: BusinessErrorCode.OPERATION_FAILED,
    range: ResponseCodeRange.BUSINESS_ERROR,
    severity: ErrorSeverity.MEDIUM,
    defaultMessage: '操作失败',
    logLevel: LogLevel.ERROR,
    retryable: false,
    notificationType: NotificationType.NOTIFICATION
  },
  [BusinessErrorCode.QUOTA_EXCEEDED]: {
    code: BusinessErrorCode.QUOTA_EXCEEDED,
    range: ResponseCodeRange.BUSINESS_ERROR,
    severity: ErrorSeverity.MEDIUM,
    defaultMessage: '配额已用尽',
    logLevel: LogLevel.WARN,
    retryable: false,
    notificationType: NotificationType.DIALOG
  },

  // ==================== 服务器错误 ====================
  [ServerErrorCode.INTERNAL_ERROR]: {
    code: ServerErrorCode.INTERNAL_ERROR,
    range: ResponseCodeRange.SERVER_ERROR,
    severity: ErrorSeverity.CRITICAL,
    defaultMessage: '服务器内部错误',
    logLevel: LogLevel.ERROR,
    retryable: true,
    notificationType: NotificationType.DIALOG
  },
  [ServerErrorCode.SERVICE_UNAVAILABLE]: {
    code: ServerErrorCode.SERVICE_UNAVAILABLE,
    range: ResponseCodeRange.SERVER_ERROR,
    severity: ErrorSeverity.CRITICAL,
    defaultMessage: '服务暂不可用',
    logLevel: LogLevel.ERROR,
    retryable: true,
    notificationType: NotificationType.DIALOG
  },
  [ServerErrorCode.DATABASE_ERROR]: {
    code: ServerErrorCode.DATABASE_ERROR,
    range: ResponseCodeRange.SERVER_ERROR,
    severity: ErrorSeverity.CRITICAL,
    defaultMessage: '数据库错误',
    logLevel: LogLevel.ERROR,
    retryable: true,
    notificationType: NotificationType.DIALOG
  }
}

// ==================== 辅助函数 ====================

/**
 * 判断是否为成功响应码
 * @param code 响应码（字符串）
 * @returns 是否成功
 */
export function isSuccessCode(code: string): boolean {
  return code.startsWith('1')
}

/**
 * 获取响应码元数据
 * @param code 响应码
 * @returns 响应码元数据（如果不存在则返回默认元数据）
 */
export function getResponseCodeMetadata(code: string): ResponseCodeMetadata {
  return (
    RESPONSE_CODE_METADATA[code] || {
      code,
      range: getResponseCodeRange(code),
      severity: ErrorSeverity.MEDIUM,
      defaultMessage: '未知错误',
      logLevel: LogLevel.WARN,
      retryable: false,
      notificationType: NotificationType.MESSAGE
    }
  )
}

/**
 * 根据响应码获取响应码范围
 * @param code 响应码
 * @returns 响应码范围
 */
export function getResponseCodeRange(code: string): ResponseCodeRange {
  const firstChar = code.charAt(0)
  switch (firstChar) {
    case '1':
      return ResponseCodeRange.SUCCESS
    case '2':
      return ResponseCodeRange.CLIENT_ERROR
    case '3':
      return ResponseCodeRange.RESOURCE_ERROR
    case '4':
      return ResponseCodeRange.BUSINESS_ERROR
    case '5':
      return ResponseCodeRange.SERVER_ERROR
    case '8':
      return ResponseCodeRange.EXTERNAL_SERVICE_ERROR
    case '9':
      return ResponseCodeRange.MISC_ERROR
    default:
      return ResponseCodeRange.SERVER_ERROR
  }
}
