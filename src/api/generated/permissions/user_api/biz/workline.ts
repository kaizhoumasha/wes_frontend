/**
 * 自动生成的权限常量定义
 *
 * ⚠️ 请勿手动编辑此文件
 * 此文件由 scripts/generate-permissions.ts 自动生成
 *
 * 权限分组: user_api:biz:workline
 *
 * 更新权限: pnpm generate:permissions
 */

export const BIZ_WORKLINE_PERMISSION = {
  /** 页面访问权限 */
  page: 'biz:workline:list',
  /** 列表查询权限 */
  list: 'biz:workline:list',
  /** 详情查看权限 */
  detail: 'biz:workline:detail',
  /** 创建权限 */
  create: 'biz:workline:create',
  /** 更新权限 */
  update: 'biz:workline:update',
  /** 删除权限 */
  delete: 'biz:workline:delete',
  /** 恢复权限 */
  restore: 'biz:workline:restore',
  /** 回收站权限 */
  trash: 'biz:workline:trash',
  /** 批量恢复权限 */
  batchRestore: 'biz:workline:batch_restore',
  /** 批量永久删除权限 */
  batchPermanentDelete: 'biz:workline:batch_permanent_delete',
  /** 查询作业线当前 active objects */
  activeObjects: 'biz:workline:active-objects',
  /** 查询可装配业务插件 */
  availablePlugins: 'biz:workline:available-plugins',
  /** 人工确认 checklist 后清除工作线急停 */
  clearEstop: 'biz:workline:clear-estop',
  /** 查询作业线配置状态 */
  configurationStatus: 'biz:workline:configuration-status',
  /** 保存业务插件配置与设备全集 */
  configure: 'biz:workline:configure',
  /** 停用作业线 */
  deactivate: 'biz:workline:deactivate',
  /** 永久删除WorkLine */
  permanentDelete: 'biz:workline:permanent_delete',
  /** 启动 WorkLine 并激活运行代际 */
  start: 'biz:workline:start',
  /** 获取作业线平面静态场景 */
  viewPlaneScene: 'biz:workline:view-plane-scene',
  /** 获取作业线平面动态快照 */
  viewPlaneSnapshot: 'biz:workline:view-plane-snapshot',
} as const
