/**
 * 用户管理模块常量配置
 *
 * 包含权限标识和表格列配置
 */

// ==================== 权限常量 ====================

/**
 * 用户管理模块权限标识
 */
export const USER_PERMISSION = {
  /** 页面访问权限 */
  page: 'admin:user:list',
  /** 创建用户 */
  create: 'admin:user:create',
  /** 更新用户 */
  update: 'admin:user:update',
  /** 重置密码 */
  resetPassword: 'admin:user:reset-password',
  /** 删除用户 */
  delete: 'admin:user:delete',
} as const
