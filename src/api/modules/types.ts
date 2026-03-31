/**
 * API 资源类型统一导出
 *
 * 为已删除的纯CRUD模块提供类型兼容层
 * 类型从生成的 OpenAPI types 中导出
 */

import type { components } from '@/api/generated/openapi-types'

// ========== WorkLine ==========
export type WorkLine = components['schemas']['WorkLineResponse']
export type CreateWorkLineInput = components['schemas']['WorkLineCreate']
export type UpdateWorkLineInput = components['schemas']['WorkLineUpdate']

// ========== Device ==========
export type Device = components['schemas']['DeviceResponse']
export type CreateDeviceInput = components['schemas']['DeviceCreate']
export type UpdateDeviceInput = components['schemas']['DeviceUpdate']
export type DeviceType = components['schemas']['DeviceType']
export type DeviceProtocol = components['schemas']['DeviceProtocol']
export type DeviceStatus = components['schemas']['DeviceStatus']

// ========== Role ==========
// 注意：Role类型在role.ts中定义，避免循环依赖
export type CreateRoleInput = components['schemas']['RoleCreate']
export type UpdateRoleInput = components['schemas']['RoleUpdate']

// ========== Permission ==========
// 注意：Permission类型在permission.ts中定义
export type CreatePermissionInput = components['schemas']['PermissionCreate']
export type UpdatePermissionInput = components['schemas']['PermissionUpdate']

// ========== AuditLog ==========
export type AuditLog = components['schemas']['AuditLogResponse']

// ========== Event ==========
// 注意：EventRequest 类型在后端不存在，设为 unknown
export type Event = unknown

// ========== Performance ==========
// 注意：PerformanceMetricResponse可能不存在，使用实际存在的类型
export type Performance = unknown

// ========== Callback ==========
export type CallbackLog = components['schemas']['CallbackLogResponse']

// ========== API Auth ==========
export type ApiAuthApplication = components['schemas']['APIApplicationResponse']

// ========== User ==========
export type ResetUserPasswordInput = components['schemas']['ResetPasswordRequest']
export type AssignRolesRequest = components['schemas']['AssignRolesRequest']
