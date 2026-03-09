/**
 * 用户管理页搜索配置
 *
 * 定义用户管理页面的搜索字段、收藏夹和快速预设。
 */

import type { SearchFavorite, SearchFieldDef, QuickSearchPreset } from '@/types/search'

// ==================== 搜索字段定义 ====================

/**
 * 用户管理页可搜索字段
 */
export const userSearchFields: SearchFieldDef[] = [
  {
    key: 'username',
    label: '用户名',
    dataType: 'text',
    searchable: true,
    defaultOperator: 'contains',
    quickOps: ['contains', 'equals', 'startsWith'],
    placeholder: '请输入用户名',
  },
  {
    key: 'email',
    label: '邮箱',
    dataType: 'text',
    searchable: true,
    defaultOperator: 'contains',
    quickOps: ['contains', 'equals', 'startsWith'],
    placeholder: '请输入邮箱地址',
  },
  {
    key: 'full_name',
    label: '姓名',
    dataType: 'text',
    searchable: true,
    defaultOperator: 'contains',
    quickOps: ['contains', 'equals'],
    placeholder: '请输入姓名',
  },
  {
    key: 'is_superuser',
    label: '超级用户',
    dataType: 'boolean',
    searchable: true,
    defaultOperator: 'equals',
    quickOps: ['equals'],
    options: [
      { label: '是', value: true },
      { label: '否', value: false },
    ],
  },
  {
    key: 'is_multi_login',
    label: '多端登录',
    dataType: 'boolean',
    searchable: true,
    defaultOperator: 'equals',
    quickOps: ['equals'],
    options: [
      { label: '是', value: true },
      { label: '否', value: false },
    ],
  },
]

// ==================== 快速搜索预设 ====================

/**
 * 用户管理页快速搜索预设
 *
 * 注意：conditions 使用纯模板格式（只包含 field、operator、value），
 * 运行时会自动生成 id、label 和 source。
 */
export const userQuickPresets: QuickSearchPreset[] = [
  {
    id: 'superusers',
    label: '超级管理员',
    description: '快速筛出超级用户',
    conditions: [
      { field: 'is_superuser', operator: 'equals', value: true },
    ],
  },
  {
    id: 'multi-login-enabled',
    label: '可多端登录',
    description: '快速筛出允许多端登录的账号',
    conditions: [
      { field: 'is_multi_login', operator: 'equals', value: true },
    ],
  },
  {
    id: 'admin-accounts',
    label: '管理员账号',
    description: '快速定位常见管理员账号',
    conditions: [
      { field: 'username', operator: 'contains', value: 'admin' },
    ],
  },
]

// ==================== 收藏夹定义 ====================

/**
 * 用户管理页收藏夹
 *
 * 注意：conditions 使用纯模板格式（只包含 field、operator、value），
 * 运行时会自动生成 id、label 和 source。
 */
export const userSearchFavorites: SearchFavorite[] = [
  {
    id: 'admin_accounts',
    name: '管理员账号',
    conditions: [
      {
        field: 'username',
        operator: 'contains',
        value: 'admin',
      },
    ],
    scope: 'user-management',
  },
  {
    id: 'superusers',
    name: '超级用户',
    conditions: [
      {
        field: 'is_superuser',
        operator: 'equals',
        value: true,
      },
    ],
    scope: 'user-management',
  },
  {
    id: 'multi-login-users',
    name: '可多端登录用户',
    conditions: [
      {
        field: 'is_multi_login',
        operator: 'equals',
        value: true,
      },
    ],
    scope: 'user-management',
  },
  {
    id: 'corporate-email-users',
    name: '企业邮箱用户',
    conditions: [
      {
        field: 'email',
        operator: 'contains',
        value: '@',
      },
    ],
    scope: 'user-management',
  },
]
