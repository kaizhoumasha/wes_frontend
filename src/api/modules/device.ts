/**
 * 设备管理 API
 *
 * 基于 CrudApi 的设备管理模块
 * 对应后端: src/app/device/v1/device.py
 */

import { z } from 'zod'
import { createCrudApi, CrudApi, appendAndFilter, type QueryOptions, type PaginationData } from '../base/crud-api'
import { getApiPath } from '../client'
import {
  DeviceCreateSchema,
  DeviceProtocolSchema,
  DeviceResponseSchema,
  DeviceStatusSchema,
  DeviceTypeSchema,
  DeviceUpdateSchema,
} from '../../types/zod-extensions'

// ==================== 类型定义 ====================

export type DeviceType = z.infer<typeof DeviceTypeSchema>

export type DeviceProtocol = z.infer<typeof DeviceProtocolSchema>

export type DeviceStatus = z.infer<typeof DeviceStatusSchema>

const DEVICE_STATUS = DeviceStatusSchema.enum

export type Device = z.infer<typeof DeviceResponseSchema>

export type CreateDeviceInput = z.input<typeof DeviceCreateSchema>

export type UpdateDeviceInput = z.input<typeof DeviceUpdateSchema>

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
      filters: appendAndFilter(options.filters, { field: 'device_status', op: 'eq', value: status }),
    })
  }

  /**
   * 按类型查询设备
   */
  async getByType(type: DeviceType, options: QueryOptions = {}): Promise<PaginationData<Device>> {
    return this.query({
      ...options,
      filters: appendAndFilter(options.filters, { field: 'device_type', op: 'eq', value: type }),
    })
  }

  /**
   * 按作业线查询设备
   */
  async getByWorkline(worklineId: number, options: QueryOptions = {}): Promise<PaginationData<Device>> {
    return this.query({
      ...options,
      filters: appendAndFilter(options.filters, { field: 'work_line_id', op: 'eq', value: worklineId }),
    })
  }

  /**
   * 获取空闲设备
   */
  async getIdleDevices(options: QueryOptions = {}): Promise<PaginationData<Device>> {
    return this.getByStatus(DEVICE_STATUS.IDLE, options)
  }

  /**
   * 获取故障设备
   */
  async getErrorDevices(options: QueryOptions = {}): Promise<PaginationData<Device>> {
    return this.getByStatus(DEVICE_STATUS.ERROR, options)
  }

  /**
   * 获取离线设备
   */
  async getOfflineDevices(options: QueryOptions = {}): Promise<PaginationData<Device>> {
    return this.getByStatus(DEVICE_STATUS.OFFLINE, options)
  }
}

/**
 * 带扩展查询的设备 API
 */
export const deviceApiExtended = new DeviceQuery({
  prefix: getApiPath('/devices'),
})
