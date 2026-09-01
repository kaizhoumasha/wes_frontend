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
import { OPS_TRANSPORT_EVIDENCE_PERMISSION } from './user_api/ops/transport-evidence'
import { OPS_TRANSPORT_TASK_PERMISSION } from './user_api/ops/transport-task'
import { RESOURCE_BIN_PERMISSION } from './user_api/resource/bin'
import { RESOURCE_BINCELLOCCUPANCY_PERMISSION } from './user_api/resource/bincelloccupancy'
import { RESOURCE_BINCONTENTSNAPSHOT_PERMISSION } from './user_api/resource/bincontentsnapshot'
import { RESOURCE_BINCONTENTSNAPSHOTITEM_PERMISSION } from './user_api/resource/bincontentsnapshotitem'
import { RESOURCE_BINMATERIALMOUNT_PERMISSION } from './user_api/resource/binmaterialmount'
import { RESOURCE_BINSLOTTEMPLATE_PERMISSION } from './user_api/resource/binslottemplate'
import { RESOURCE_BINTYPE_PERMISSION } from './user_api/resource/bintype'
import { RESOURCE_RACK_PERMISSION } from './user_api/resource/rack'
import { RESOURCE_RACKBINMOUNT_PERMISSION } from './user_api/resource/rackbinmount'
import { RESOURCE_RACKPLACEMENT_PERMISSION } from './user_api/resource/rackplacement'
import { RESOURCE_RACKSLOTTEMPLATE_PERMISSION } from './user_api/resource/rackslottemplate'
import { RESOURCE_RACKTYPE_PERMISSION } from './user_api/resource/racktype'
import { RESOURCE_RESOURCESTATEEVENT_PERMISSION } from './user_api/resource/resourcestateevent'
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
export { OPS_TRANSPORT_EVIDENCE_PERMISSION }
export { OPS_TRANSPORT_TASK_PERMISSION }
export { RESOURCE_BIN_PERMISSION }
export { RESOURCE_BINCELLOCCUPANCY_PERMISSION }
export { RESOURCE_BINCONTENTSNAPSHOT_PERMISSION }
export { RESOURCE_BINCONTENTSNAPSHOTITEM_PERMISSION }
export { RESOURCE_BINMATERIALMOUNT_PERMISSION }
export { RESOURCE_BINSLOTTEMPLATE_PERMISSION }
export { RESOURCE_BINTYPE_PERMISSION }
export { RESOURCE_RACK_PERMISSION }
export { RESOURCE_RACKBINMOUNT_PERMISSION }
export { RESOURCE_RACKPLACEMENT_PERMISSION }
export { RESOURCE_RACKSLOTTEMPLATE_PERMISSION }
export { RESOURCE_RACKTYPE_PERMISSION }
export { RESOURCE_RESOURCESTATEEVENT_PERMISSION }
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
  transportEvidence: OPS_TRANSPORT_EVIDENCE_PERMISSION,
  transportTask: OPS_TRANSPORT_TASK_PERMISSION,
} as const

/**
 * resource 分类权限快捷导出
 */
export const RESOURCE_PERMISSIONS = {
  bin: RESOURCE_BIN_PERMISSION,
  bincelloccupancy: RESOURCE_BINCELLOCCUPANCY_PERMISSION,
  bincontentsnapshot: RESOURCE_BINCONTENTSNAPSHOT_PERMISSION,
  bincontentsnapshotitem: RESOURCE_BINCONTENTSNAPSHOTITEM_PERMISSION,
  binmaterialmount: RESOURCE_BINMATERIALMOUNT_PERMISSION,
  binslottemplate: RESOURCE_BINSLOTTEMPLATE_PERMISSION,
  bintype: RESOURCE_BINTYPE_PERMISSION,
  rack: RESOURCE_RACK_PERMISSION,
  rackbinmount: RESOURCE_RACKBINMOUNT_PERMISSION,
  rackplacement: RESOURCE_RACKPLACEMENT_PERMISSION,
  rackslottemplate: RESOURCE_RACKSLOTTEMPLATE_PERMISSION,
  racktype: RESOURCE_RACKTYPE_PERMISSION,
  resourcestateevent: RESOURCE_RESOURCESTATEEVENT_PERMISSION,
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
  resource: RESOURCE_PERMISSIONS,
  sys: SYS_PERMISSIONS,
} as const
