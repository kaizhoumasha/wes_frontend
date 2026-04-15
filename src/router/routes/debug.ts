import type { RouteRecordRaw } from 'vue-router'

export function createDebugRoutes(): RouteRecordRaw[] {
  if (!import.meta.env.DEV) {
    return []
  }

  return [
    {
      path: 'debug/smart-search',
      name: 'SmartSearchDebug',
      component: () => import('@/views/debug/smart-search-debug.vue'),
      meta: { requiresAuth: false, title: '智能搜索调试' }
    },
    {
      path: 'debug/standard-dialog',
      name: 'StandardDialogDemo',
      component: () => import('@/views/components/StandardDialogDemo.vue'),
      meta: { requiresAuth: false, title: 'StandardDialog 组件演示' }
    }
  ]
}
