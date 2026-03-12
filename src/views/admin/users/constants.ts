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
  /** 删除用户 */
  delete: 'admin:user:delete',
} as const

// ==================== 表格列配置 ====================

/**
 * 表格列配置
 */
export interface TableColumn {
  /** 字段键名 */
  key: string
  /** 列标题 */
  label: string
  /** 列宽度 */
  width?: number
  /** 最小宽度 */
  minWidth?: number
  /** 对齐方式 */
  align?: 'left' | 'center' | 'right'
  /** 是否固定列 */
  fixed?: 'left' | 'right'
}

/**
 * 用户管理页表格列配置
 */
export const USER_TABLE_COLUMNS: TableColumn[] = [
  { key: 'username', label: '用户名', width: 150 },
  { key: 'email', label: '邮箱', width: 200 },
  { key: 'full_name', label: '姓名', width: 150 },
  { key: 'is_superuser', label: '超级用户', width: 100, align: 'center' },
  { key: 'is_multi_login', label: '多端登录', width: 100, align: 'center' },
  { key: 'roles', label: '角色', width: 200 },
  { key: 'updated_at', label: '更新时间', width: 180 },
  { key: 'actions', label: '操作', width: 150, align: 'center', fixed: 'right' },
]
