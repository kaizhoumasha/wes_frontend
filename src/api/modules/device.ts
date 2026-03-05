/**
 * 设备管理 API
 *
 * 基于 CrudApi 的设备管理模块
 * 对应后端: src/app/device/v1/device.py
 */

import { createCrudApi, CrudApi, type QueryOptions, type PaginationData } from '../base/crud-api'
import { getApiPath } from '../client'

// ==================== 类型定义 ====================

/**
 * 设备类型枚举（与后端 DeviceType 对齐）
 */
export enum DeviceType {
  /** PDA */
  PDA = 'PDA',
  /** 工业电脑 */
  INDUSTRIAL_PC = 'INDUSTRIAL_PC',
  /** 打印机 */
  PRINTER = 'PRINTER',
  /** 电脑 */
  COMPUTER = 'COMPUTER',
  /** LCR测试仪 */
  LCR_TESTER = 'LCR_TESTER',
  /** 机械臂 */
  ROBOTIC_ARM = 'ROBOTIC_ARM',
  /** 视觉相机 */
  VISION_CAMERA = 'VISION_CAMERA',
  /** 输送线 */
  CONVEYOR = 'CONVEYOR',
  /** 贴标机 */
  LABELER = 'LABELER',
  /** X-Ray */
  XRAY = 'XRAY',
  /** 扫码器 */
  SCANNER = 'SCANNER',
}

/**
 * 设备通信协议枚举（与后端 DeviceProtocol 对齐）
 */
export enum DeviceProtocol {
  /** HTTP */
  HTTP = 'HTTP',
  /** HTTPS */
  HTTPS = 'HTTPS',
  /** TCP */
  TCP = 'TCP',
  /** MODBUS */
  MODBUS = 'MODBUS',
  /** MQTT */
  MQTT = 'MQTT',
}

/**
 * 设备状态枚举（与后端 DeviceStatus 对齐）
 */
export enum DeviceStatus {
  /** 空闲，可接收新任务 */
  IDLE = 'IDLE',
  /** 忙碌，正在执行任务 */
  RUNNING = 'RUNNING',
  /** 故障，需人工介入 */
  ERROR = 'ERROR',
  /** 离线（WES 判定） */
  OFFLINE = 'OFFLINE',
}

/**
 * 设备实体（与后端 DeviceResponse 对齐）
 */
export interface Device {
  /** 设备 ID */
  id: number
  /** 设备编码（业务主键） */
  device_code: string
  /** 设备名称 */
  device_name: string
  /** 设备类型 */
  device_type: DeviceType
  /** 所属作业线 ID */
  work_line_id?: number
  /** 设备用途说明 */
  description?: string
  /** 是否启用 */
  is_active: boolean
  /** 排序顺序 */
  sort_order: number

  // ===== 通信配置 =====
  /** 设备 IP 地址 */
  host?: string
  /** 服务端口 */
  port?: number
  /** 通信协议 */
  protocol: DeviceProtocol
  /** 认证 Token（Bearer Token） */
  auth_token?: string
  /** 请求超时时间（毫秒） */
  timeout: number

  // ===== 设备状态 =====
  /** 设备实时状态 */
  device_status: DeviceStatus
  /** 当前执行的指令 ID */
  current_command_id?: number
  /** 最后心跳时间 */
  last_heartbeat_at?: string
  /** 错误代码（status=ERROR 时） */
  error_code?: string

  // ===== 能力配置 =====
  /** 支持的指令类型 */
  supported_commands: string[]
  /** 最大并发任务数 */
  max_concurrent_tasks: number

  // ===== 幂等性配置 =====
  /** 指令去重缓存时间（秒） */
  idempotency_ttl: number

  // ===== 时间戳 =====
  /** 创建时间 */
  created_at: string
  /** 更新时间 */
  updated_at: string
}

/**
 * 创建设备输入（与后端 DeviceCreate 对齐）
 */
export interface CreateDeviceInput {
  /** 设备编码（业务主键，1-50字符） */
  device_code: string
  /** 设备名称（1-100字符） */
  device_name: string
  /** 设备类型 */
  device_type: DeviceType
  /** 所属作业线 ID */
  work_line_id?: number
  /** 设备用途说明（最大500字符） */
  description?: string
  /** 是否启用 */
  is_active?: boolean
  /** 排序顺序 */
  sort_order?: number

  // ===== 通信配置 =====
  /** 设备 IP 地址（最大100字符） */
  host?: string
  /** 服务端口（1-65535） */
  port?: number
  /** 通信协议 */
  protocol?: DeviceProtocol
  /** 认证 Token（最大500字符） */
  auth_token?: string
  /** 请求超时时间（毫秒，1000-300000） */
  timeout?: number

  // ===== 能力配置 =====
  /** 支持的指令类型 */
  supported_commands?: string[]
  /** 最大并发任务数（1-10） */
  max_concurrent_tasks?: number

  // ===== 幂等性配置 =====
  /** 指令去重缓存时间（秒，60-86400） */
  idempotency_ttl?: number
}

/**
 * 更新设备输入（与后端 DeviceUpdate 对齐）
 */
export interface UpdateDeviceInput {
  /** 设备名称 */
  device_name?: string
  /** 所属作业线 ID */
  work_line_id?: number
  /** 设备用途说明 */
  description?: string
  /** 是否启用 */
  is_active?: boolean
  /** 排序顺序 */
  sort_order?: number

  // ===== 通信配置 =====
  /** 设备 IP 地址 */
  host?: string
  /** 服务端口 */
  port?: number
  /** 通信协议 */
  protocol?: DeviceProtocol
  /** 认证 Token */
  auth_token?: string
  /** 请求超时时间（毫秒） */
  timeout?: number

  // ===== 能力配置 =====
  /** 支持的指令类型 */
  supported_commands?: string[]
  /** 最大并发任务数 */
  max_concurrent_tasks?: number

  // ===== 幂等性配置 =====
  /** 指令去重缓存时间（秒） */
  idempotency_ttl?: number
}

// ==================== API 实例 ====================

/**
 * 设备管理 API
 */
export const deviceApi = createCrudApi<Device, CreateDeviceInput, UpdateDeviceInput>({
  prefix: getApiPath('/devices'),
})

// ==================== 自定义查询方法 ====================

/**
 * 设备查询扩展
 */
export class DeviceQuery extends CrudApi<Device, CreateDeviceInput, UpdateDeviceInput> {
  /**
   * 按状态查询设备
   */
  async getByStatus(status: DeviceStatus, options: QueryOptions = {}): Promise<PaginationData<Device>> {
    return this.query({
      ...options,
      filters: { ...options.filters, device_status: status },
    })
  }

  /**
   * 按类型查询设备
   */
  async getByType(type: DeviceType, options: QueryOptions = {}): Promise<PaginationData<Device>> {
    return this.query({
      ...options,
      filters: { ...options.filters, device_type: type },
    })
  }

  /**
   * 按作业线查询设备
   */
  async getByWorkline(worklineId: number, options: QueryOptions = {}): Promise<PaginationData<Device>> {
    return this.query({
      ...options,
      filters: { ...options.filters, work_line_id: worklineId },
    })
  }

  /**
   * 获取空闲设备
   */
  async getIdleDevices(options: QueryOptions = {}): Promise<PaginationData<Device>> {
    return this.getByStatus(DeviceStatus.IDLE, options)
  }

  /**
   * 获取故障设备
   */
  async getErrorDevices(options: QueryOptions = {}): Promise<PaginationData<Device>> {
    return this.getByStatus(DeviceStatus.ERROR, options)
  }

  /**
   * 获取离线设备
   */
  async getOfflineDevices(options: QueryOptions = {}): Promise<PaginationData<Device>> {
    return this.getByStatus(DeviceStatus.OFFLINE, options)
  }
}

/**
 * 带扩展查询的设备 API
 */
export const deviceApiExtended = new DeviceQuery({
  prefix: getApiPath('/devices'),
})
