/**
 * 自动生成的权限常量导出入口
 *
 * ⚠️ 请勿手动编辑此文件
 * 此文件由 scripts/generate-permissions.ts 自动生成
 *
 */

import { API_TRY_PERMISSION } from './app_api/api/try'
import { ADMIN_PERMISSION } from './user_api/admin/permission'
import { ADMIN_ROLE_PERMISSION } from './user_api/admin/role'
import { ADMIN_USER_PERMISSION } from './user_api/admin/user'
import { API_AUTH_API_APPLICATION_PERMISSION } from './user_api/api-auth/api_application'
import { API_AUTH_APIACCESSLOG_PERMISSION } from './user_api/api-auth/apiaccesslog'
import { BIZ_DEVICE_PERMISSION } from './user_api/biz/device'
import { BIZ_WORKLINE_PERMISSION } from './user_api/biz/workline'
import { CALLBACK_CALLBACK_LOG_PERMISSION } from './user_api/callback/callback_log'
import { OPS_TRANSPORT_PERMISSION } from './user_api/ops/transport'
import { OPS_TRANSPORT_CALLBACK_RECEIPT_PERMISSION } from './user_api/ops/transport-callback-receipt'
import { OPS_TRANSPORT_DEBUG_RUN_PERMISSION } from './user_api/ops/transport-debug-run'
import { OPS_TRANSPORT_EVIDENCE_PERMISSION } from './user_api/ops/transport-evidence'
import { OPS_TRANSPORT_TASK_PERMISSION } from './user_api/ops/transport-task'
import { OPS_WMS_CONFIRMATION_PERMISSION } from './user_api/ops/wms-confirmation'
import { OPS_WMS_DIAGNOSTICS_PERMISSION } from './user_api/ops/wms-diagnostics'
import { OPS_WMS_EVIDENCE_PERMISSION } from './user_api/ops/wms-evidence'
import { SYS_AUDITLOG_PERMISSION } from './user_api/sys/auditlog'


export { API_TRY_PERMISSION }
export { ADMIN_PERMISSION }
export { ADMIN_ROLE_PERMISSION }
export { ADMIN_USER_PERMISSION }
export { API_AUTH_API_APPLICATION_PERMISSION }
export { API_AUTH_APIACCESSLOG_PERMISSION }
export { BIZ_DEVICE_PERMISSION }
export { BIZ_WORKLINE_PERMISSION }
export { CALLBACK_CALLBACK_LOG_PERMISSION }
export { OPS_TRANSPORT_PERMISSION }
export { OPS_TRANSPORT_CALLBACK_RECEIPT_PERMISSION }
export { OPS_TRANSPORT_DEBUG_RUN_PERMISSION }
export { OPS_TRANSPORT_EVIDENCE_PERMISSION }
export { OPS_TRANSPORT_TASK_PERMISSION }
export { OPS_WMS_CONFIRMATION_PERMISSION }
export { OPS_WMS_DIAGNOSTICS_PERMISSION }
export { OPS_WMS_EVIDENCE_PERMISSION }
export { SYS_AUDITLOG_PERMISSION }

/**
 * admin 分类权限快捷导出
 */
export const ADMIN_PERMISSIONS = {
  permission: ADMIN_PERMISSION,
  role: ADMIN_ROLE_PERMISSION,
  user: ADMIN_USER_PERMISSION,
} as const

/**
 * api 分类权限快捷导出
 */
export const API_PERMISSIONS = {
  try: API_TRY_PERMISSION,
} as const

/**
 * api-auth 分类权限快捷导出
 */
export const API_AUTH_PERMISSIONS = {
  apiApplication: API_AUTH_API_APPLICATION_PERMISSION,
  apiaccesslog: API_AUTH_APIACCESSLOG_PERMISSION,
} as const

/**
 * biz 分类权限快捷导出
 */
export const BIZ_PERMISSIONS = {
  device: BIZ_DEVICE_PERMISSION,
  workline: BIZ_WORKLINE_PERMISSION,
} as const

/**
 * callback 分类权限快捷导出
 */
export const CALLBACK_PERMISSIONS = {
  callbackLog: CALLBACK_CALLBACK_LOG_PERMISSION,
} as const

/**
 * ops 分类权限快捷导出
 */
export const OPS_PERMISSIONS = {
  transport: OPS_TRANSPORT_PERMISSION,
  transportCallbackReceipt: OPS_TRANSPORT_CALLBACK_RECEIPT_PERMISSION,
  transportDebugRun: OPS_TRANSPORT_DEBUG_RUN_PERMISSION,
  transportEvidence: OPS_TRANSPORT_EVIDENCE_PERMISSION,
  transportTask: OPS_TRANSPORT_TASK_PERMISSION,
  wmsConfirmation: OPS_WMS_CONFIRMATION_PERMISSION,
  wmsDiagnostics: OPS_WMS_DIAGNOSTICS_PERMISSION,
  wmsEvidence: OPS_WMS_EVIDENCE_PERMISSION,
} as const

/**
 * sys 分类权限快捷导出
 */
export const SYS_PERMISSIONS = {
  auditlog: SYS_AUDITLOG_PERMISSION,
} as const

/**
 * 全量权限快捷导出
 */
export const PERMISSIONS = {
  admin: ADMIN_PERMISSIONS,
  api: API_PERMISSIONS,
  apiAuth: API_AUTH_PERMISSIONS,
  biz: BIZ_PERMISSIONS,
  callback: CALLBACK_PERMISSIONS,
  ops: OPS_PERMISSIONS,
  sys: SYS_PERMISSIONS,
} as const
