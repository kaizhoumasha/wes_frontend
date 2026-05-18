/**
 * 自动生成的权限常量导出入口
 *
 * ⚠️ 请勿手动编辑此文件
 * 此文件由 scripts/generate-permissions.ts 自动生成
 *
 * 后端目录: /Users/kaizhou/SynologyDrive/works/wes_backend
 */

import { API_CALLBACK_PERMISSION } from './app_api/api/callback'
import { API_TRY_PERMISSION } from './app_api/api/try'
import { ADMIN_MENU_PERMISSION } from './user_api/admin/menu'
import { ADMIN_PERMISSION } from './user_api/admin/permission'
import { ADMIN_ROLE_PERMISSION } from './user_api/admin/role'
import { ADMIN_USER_PERMISSION } from './user_api/admin/user'
import { API_AUTH_API_APPLICATION_PERMISSION } from './user_api/api-auth/api_application'
import { API_AUTH_APIACCESSLOG_PERMISSION } from './user_api/api-auth/apiaccesslog'
import { BIZ_DEVICE_PERMISSION } from './user_api/biz/device'
import { BIZ_WORKLINE_PERMISSION } from './user_api/biz/workline'
import { CALLBACK_CALLBACK_LOG_PERMISSION } from './user_api/callback/callback_log'
import { DEMO_DEMOPRODUCT_PERMISSION } from './user_api/demo/demoproduct'
import { RESOURCE_BIN_PERMISSION } from './user_api/resource/bin'
import { RESOURCE_BINCONTENTSNAPSHOT_PERMISSION } from './user_api/resource/bincontentsnapshot'
import { RESOURCE_BINCONTENTSNAPSHOTITEM_PERMISSION } from './user_api/resource/bincontentsnapshotitem'
import { RESOURCE_BINSLOTTEMPLATE_PERMISSION } from './user_api/resource/binslottemplate'
import { RESOURCE_BINTYPE_PERMISSION } from './user_api/resource/bintype'
import { RESOURCE_EXECUTIONLOCATION_PERMISSION } from './user_api/resource/executionlocation'
import { RESOURCE_EXECUTIONZONE_PERMISSION } from './user_api/resource/executionzone'
import { RESOURCE_FULLBOXEXCHANGETASK_PERMISSION } from './user_api/resource/fullboxexchangetask'
import { RESOURCE_RACK_PERMISSION } from './user_api/resource/rack'
import { RESOURCE_RACKBINMOUNT_PERMISSION } from './user_api/resource/rackbinmount'
import { RESOURCE_RACKMATERIALMOUNT_PERMISSION } from './user_api/resource/rackmaterialmount'
import { RESOURCE_RACKPLACEMENT_PERMISSION } from './user_api/resource/rackplacement'
import { RESOURCE_RACKRELEASE_PERMISSION } from './user_api/resource/rackrelease'
import { RESOURCE_RACKRELEASEBINSNAPSHOT_PERMISSION } from './user_api/resource/rackreleasebinsnapshot'
import { RESOURCE_RACKSLOTTEMPLATE_PERMISSION } from './user_api/resource/rackslottemplate'
import { RESOURCE_RACKTYPE_PERMISSION } from './user_api/resource/racktype'
import { RESOURCE_RESOURCESTATEEVENT_PERMISSION } from './user_api/resource/resourcestateevent'
import { RESOURCE_WMSWRITEBACKEVIDENCE_PERMISSION } from './user_api/resource/wmswritebackevidence'
import { SYS_AUDITLOG_PERMISSION } from './user_api/sys/auditlog'


export { API_CALLBACK_PERMISSION }
export { API_TRY_PERMISSION }
export { ADMIN_MENU_PERMISSION }
export { ADMIN_PERMISSION }
export { ADMIN_ROLE_PERMISSION }
export { ADMIN_USER_PERMISSION }
export { API_AUTH_API_APPLICATION_PERMISSION }
export { API_AUTH_APIACCESSLOG_PERMISSION }
export { BIZ_DEVICE_PERMISSION }
export { BIZ_WORKLINE_PERMISSION }
export { CALLBACK_CALLBACK_LOG_PERMISSION }
export { DEMO_DEMOPRODUCT_PERMISSION }
export { RESOURCE_BIN_PERMISSION }
export { RESOURCE_BINCONTENTSNAPSHOT_PERMISSION }
export { RESOURCE_BINCONTENTSNAPSHOTITEM_PERMISSION }
export { RESOURCE_BINSLOTTEMPLATE_PERMISSION }
export { RESOURCE_BINTYPE_PERMISSION }
export { RESOURCE_EXECUTIONLOCATION_PERMISSION }
export { RESOURCE_EXECUTIONZONE_PERMISSION }
export { RESOURCE_FULLBOXEXCHANGETASK_PERMISSION }
export { RESOURCE_RACK_PERMISSION }
export { RESOURCE_RACKBINMOUNT_PERMISSION }
export { RESOURCE_RACKMATERIALMOUNT_PERMISSION }
export { RESOURCE_RACKPLACEMENT_PERMISSION }
export { RESOURCE_RACKRELEASE_PERMISSION }
export { RESOURCE_RACKRELEASEBINSNAPSHOT_PERMISSION }
export { RESOURCE_RACKSLOTTEMPLATE_PERMISSION }
export { RESOURCE_RACKTYPE_PERMISSION }
export { RESOURCE_RESOURCESTATEEVENT_PERMISSION }
export { RESOURCE_WMSWRITEBACKEVIDENCE_PERMISSION }
export { SYS_AUDITLOG_PERMISSION }

/**
 * admin 分类权限快捷导出
 */
export const ADMIN_PERMISSIONS = {
  menu: ADMIN_MENU_PERMISSION,
  permission: ADMIN_PERMISSION,
  role: ADMIN_ROLE_PERMISSION,
  user: ADMIN_USER_PERMISSION,
} as const

/**
 * api 分类权限快捷导出
 */
export const API_PERMISSIONS = {
  callback: API_CALLBACK_PERMISSION,
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
 * demo 分类权限快捷导出
 */
export const DEMO_PERMISSIONS = {
  demoproduct: DEMO_DEMOPRODUCT_PERMISSION,
} as const

/**
 * resource 分类权限快捷导出
 */
export const RESOURCE_PERMISSIONS = {
  bin: RESOURCE_BIN_PERMISSION,
  bincontentsnapshot: RESOURCE_BINCONTENTSNAPSHOT_PERMISSION,
  bincontentsnapshotitem: RESOURCE_BINCONTENTSNAPSHOTITEM_PERMISSION,
  binslottemplate: RESOURCE_BINSLOTTEMPLATE_PERMISSION,
  bintype: RESOURCE_BINTYPE_PERMISSION,
  executionlocation: RESOURCE_EXECUTIONLOCATION_PERMISSION,
  executionzone: RESOURCE_EXECUTIONZONE_PERMISSION,
  fullboxexchangetask: RESOURCE_FULLBOXEXCHANGETASK_PERMISSION,
  rack: RESOURCE_RACK_PERMISSION,
  rackbinmount: RESOURCE_RACKBINMOUNT_PERMISSION,
  rackmaterialmount: RESOURCE_RACKMATERIALMOUNT_PERMISSION,
  rackplacement: RESOURCE_RACKPLACEMENT_PERMISSION,
  rackrelease: RESOURCE_RACKRELEASE_PERMISSION,
  rackreleasebinsnapshot: RESOURCE_RACKRELEASEBINSNAPSHOT_PERMISSION,
  rackslottemplate: RESOURCE_RACKSLOTTEMPLATE_PERMISSION,
  racktype: RESOURCE_RACKTYPE_PERMISSION,
  resourcestateevent: RESOURCE_RESOURCESTATEEVENT_PERMISSION,
  wmswritebackevidence: RESOURCE_WMSWRITEBACKEVIDENCE_PERMISSION,
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
  demo: DEMO_PERMISSIONS,
  resource: RESOURCE_PERMISSIONS,
  sys: SYS_PERMISSIONS,
} as const
