import type { RouteRecordRaw } from 'vue-router'
import { API_AUTH_PERMISSIONS } from '@/api/generated/permissions'

export const apiAuthRoutes: RouteRecordRaw = {
  path: 'api-auth',
  name: 'ApiAuthRoot',
  meta: {
    requiresAuth: true,
    title: 'API 认证',
    menu: {
      name: 'api-auth:system:menu',
      icon: 'ep:key',
      sortOrder: 30
    }
  },
  children: [
    {
      path: 'applications',
      name: 'APIApplicationList',
      component: () => import('@/views/admin/api-applications/APIApplicationListPage.vue'),
      meta: {
        requiresAuth: true,
        title: 'API 应用管理',
        permission: API_AUTH_PERMISSIONS.apiApplication.page,
        menu: {
          name: 'api-auth:application:menu',
          parentName: 'api-auth:system:menu',
          icon: 'ep:lock',
          sortOrder: 1
        }
      }
    }
  ]
}
