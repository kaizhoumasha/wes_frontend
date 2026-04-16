import type { RouteRecordRaw } from 'vue-router'
import { API_AUTH_PERMISSIONS, SYS_PERMISSIONS } from '@/api/generated/permissions'

export const logRoutes: RouteRecordRaw = {
  path: 'logs',
  name: 'LogCenterRoot',
  meta: {
    requiresAuth: true,
    title: '日志中心',
    menu: {
      name: 'logs:system:menu',
      icon: 'ep:document',
      sortOrder: 40
    }
  },
  children: [
    {
      path: 'audit',
      name: 'AuditLogList',
      component: () => import('@/views/logs/audit/AuditLogListPage.vue'),
      meta: {
        requiresAuth: true,
        title: '审计日志',
        permission: SYS_PERMISSIONS.auditlog.page,
        menu: {
          name: 'logs:audit:menu',
          parentName: 'logs:system:menu',
          icon: 'ep:document-checked',
          sortOrder: 1
        }
      }
    },
    {
      path: 'api-access',
      name: 'APIAccessLogList',
      component: () => import('@/views/logs/api-access/APIAccessLogListPage.vue'),
      meta: {
        requiresAuth: true,
        title: 'API 访问日志',
        permission: API_AUTH_PERMISSIONS.apiaccesslog.page,
        menu: {
          name: 'logs:api-access:menu',
          parentName: 'logs:system:menu',
          icon: 'ep:histogram',
          sortOrder: 2
        }
      }
    }
  ]
}
