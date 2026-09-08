import type { RouteRecordRaw } from 'vue-router'
import { SUPERUSER_PERMISSION } from '@/composables/permission-state'
import { OPS_PERMISSIONS } from '@/api/generated/permissions'

export const opsRoutes: RouteRecordRaw = {
  path: 'ops',
  name: 'OpsRoot',
  meta: {
    requiresAuth: true,
    title: '运维工具',
    permissions: [
      SUPERUSER_PERMISSION,
      OPS_PERMISSIONS.transportTask.list,
      OPS_PERMISSIONS.transportDebugRun.list,
      OPS_PERMISSIONS.wmsDiagnostics.query,
      OPS_PERMISSIONS.wmsDiagnostics.stream
    ],
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
          icon: 'ep:data-analysis',
          sortOrder: 1
        }
      }
    },
    {
      path: 'transport-diagnostics',
      name: 'TransportDiagnostics',
      component: () => import('@/views/ops/transport-diagnostics/TransportDiagnosticsPage.vue'),
      meta: {
        requiresAuth: true,
        title: '运输接入诊断',
        permission: OPS_PERMISSIONS.transportTask.list,
        menu: {
          name: 'ops:transport-diagnostics:menu',
          icon: 'ep:van',
          sortOrder: 2
        }
      }
    },
    {
      path: 'transport-debug',
      name: 'TransportDebug',
      component: () => import('@/views/ops/transport-debug/TransportDebugRunPage.vue'),
      meta: {
        requiresAuth: true,
        title: '自动联调',
        permission: OPS_PERMISSIONS.transportDebugRun.list,
        menu: {
          name: 'ops:transport-debug:menu',
          icon: 'ep:video-play',
          sortOrder: 3
        }
      }
    },
    {
      path: 'wms-diagnostics',
      name: 'WmsDiagnostics',
      component: () => import('@/views/ops/wms-diagnostics/WmsDiagnosticsPage.vue'),
      meta: {
        requiresAuth: true,
        title: 'WMS 联调诊断',
        permissions: [OPS_PERMISSIONS.wmsDiagnostics.query, OPS_PERMISSIONS.wmsDiagnostics.stream],
        menu: { name: 'ops:wms-diagnostics:menu', icon: 'ep:connection', sortOrder: 4 }
      }
    }
  ]
}
