import type { RouteRecordRaw } from 'vue-router'
import { SUPERUSER_PERMISSION } from '@/composables/permission-state'

export const opsRoutes: RouteRecordRaw = {
  path: 'ops',
  name: 'OpsRoot',
  meta: {
    requiresAuth: true,
    title: '运维工具',
    permission: SUPERUSER_PERMISSION,
    menu: {
      name: 'ops:system:menu',
      icon: 'ep:monitor',
      sortOrder: 50
    }
  },
  children: [
    {
      path: 'device-diagnostics',
      name: 'DeviceDiagnostics',
      component: () => import('@/views/ops/device-diagnostics/DeviceDiagnosticsPage.vue'),
      meta: {
        requiresAuth: true,
        title: '设备接入诊断',
        permission: SUPERUSER_PERMISSION,
        menu: {
          name: 'ops:device-diagnostics:menu',
          parentName: 'ops:system:menu',
          icon: 'ep:data-analysis',
          sortOrder: 1
        }
      }
    }
  ]
}
