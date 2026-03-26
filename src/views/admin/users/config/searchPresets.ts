import type { SearchFavorite, QuickSearchPreset } from '@/types/search'

export const USER_SEARCH_QUICK_PRESETS = [
  {
    id: 'superusers',
    label: '超级管理员',
    description: '快速筛出超级用户',
    conditions: [{ field: 'is_superuser', operator: 'equals', value: true }]
  },
  {
    id: 'multi-login-enabled',
    label: '可多端登录',
    description: '快速筛出允许多端登录的账号',
    conditions: [{ field: 'is_multi_login', operator: 'equals', value: true }]
  },
  {
    id: 'admin-accounts',
    label: '管理员账号',
    description: '快速定位常见管理员账号',
    conditions: [{ field: 'username', operator: 'contains', value: 'admin' }]
  }
] satisfies QuickSearchPreset[]

export const USER_SEARCH_FAVORITES = [
  {
    id: 'admin_accounts',
    name: '管理员账号',
    conditions: [{ field: 'username', operator: 'contains', value: 'admin' }],
    scope: 'user-management'
  },
  {
    id: 'superusers',
    name: '超级用户',
    conditions: [{ field: 'is_superuser', operator: 'equals', value: true }],
    scope: 'user-management'
  },
  {
    id: 'multi-login-users',
    name: '可多端登录用户',
    conditions: [{ field: 'is_multi_login', operator: 'equals', value: true }],
    scope: 'user-management'
  },
  {
    id: 'corporate-email-users',
    name: '企业邮箱用户',
    conditions: [{ field: 'email', operator: 'contains', value: '@' }],
    scope: 'user-management'
  }
] satisfies SearchFavorite[]
