/**
 * 设备管理 API
 *
 * 基于 CrudApi 的设备管理模块
 * 对应后端: src/app/device/v1/device.py
 */

import { createCrudApi, CrudApi, type QueryOptions, type PaginationData } from '../base/crud-api'

// ==================== 类型定义 ====================

/**
 * 设备状态枚举
 */
export enum DeviceStatus {
  /** 在线 */
  ONLINE = 'online',
  /** 离线 */
  OFFLINE = 'offline',
  /** 维护中 */
  MAINTENANCE = 'maintenance',
  /** 故障 */
  FAULT = 'fault',
}

/**
 * 设备类型枚举
 */
export enum DeviceType {
  /** 输送线 */
  CONVEYOR = 'conveyor',
  /** 机械臂 */
  ROBOT = 'robot',
  /** 分拣机 */
  SORTER = 'sorter',
  /** 扫描器 */
  SCANNER = 'scanner',
  /** 其他 */
  OTHER = 'other',
}

/**
 * 设备实体
 */
export interface Device {
  /** 设备ID */
  id: number
  /** 设备编号 */
  code: string
  /** 设备名称 */
  name: string
  /** 设备类型 */
  device_type: DeviceType
  /** 设备状态 */
  status: DeviceStatus
  /** 所属作业线ID */
  workline_id?: number
  /** IP地址 */
  ip_address?: string
  /** 端口 */
  port?: number
  /** 位置描述 */
  location?: string
  /** 设备配置（JSON） */
  config?: Record<string, unknown>
  /** 是否启用 */
  is_enabled: boolean
  /** 创建时间 */
  created_at: string
  /** 更新时间 */
  updated_at: string
}

/**
 * 创建设备输入
 */
export interface CreateDeviceInput {
  /** 设备编号 */
  code: string
  /** 设备名称 */
  name: string
  /** 设备类型 */
  device_type: DeviceType
  /** 所属作业线ID */
  workline_id?: number
  /** IP地址 */
  ip_address?: string
  /** 端口 */
  port?: number
  /** 位置描述 */
  location?: string
  /** 设备配置 */
  config?: Record<string, unknown>
}

/**
 * 更新设备输入
 */
export interface UpdateDeviceInput {
  /** 设备名称 */
  name?: string
  /** 设备状态 */
  status?: DeviceStatus
  /** 所属作业线ID */
  workline_id?: number
  /** IP地址 */
  ip_address?: string
  /** 端口 */
  port?: number
  /** 位置描述 */
  location?: string
  /** 设备配置 */
  config?: Record<string, unknown>
  /** 是否启用 */
  is_enabled?: boolean
}

// ==================== API 实例 ====================

/**
 * 设备管理 API
 *
 * @example
 * ```ts
 * import { deviceApi } from '@/api/modules/device'
 *
 * // 查询设备列表
 * const devices = await deviceApi.query({ page: 1, pageSize: 10 })
 *
 * // 获取单个设备
 * const device = await deviceApi.getById(1)
 *
 * // 创建设备
 * const newDevice = await deviceApi.create({
 *   code: 'DEV001',
 *   name: '输送线1号',
 *   device_type: DeviceType.CONVEYOR
 * })
 *
 * // 更新设备
 * await deviceApi.update(1, { status: DeviceStatus.ONLINE })
 *
 * // 删除设备
 * await deviceApi.delete(1)
 * ```
 */
export const deviceApi = createCrudApi<Device, CreateDeviceInput, UpdateDeviceInput>({
  prefix: '/api/v1/devices',
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
      filters: { ...options.filters, status },
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
      filters: { ...options.filters, workline_id: worklineId },
    })
  }

  /**
   * 获取在线设备
   */
  async getOnlineDevices(options: QueryOptions = {}): Promise<PaginationData<Device>> {
    return this.getByStatus(DeviceStatus.ONLINE, options)
  }
}

/**
 * 带扩展查询的设备 API
 */
export const deviceApiExtended = new DeviceQuery({
  prefix: '/api/v1/devices',
})
