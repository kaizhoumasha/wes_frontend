import type { RouteRecordRaw } from 'vue-router'
import { BIZ_PERMISSIONS } from '@/api/generated/permissions'
import { env } from '@/config/env'

export const runtimeRoutes: RouteRecordRaw = {
  path: 'runtime',
  name: 'RuntimeRoot',
  component: () => import('@/views/runtime/RuntimeLayout.vue'),
  meta: {
    requiresAuth: true,
    title: '运行监控中心',
    menu: {
      name: 'runtime:system:menu',
      icon: 'ep:monitor',
      sortOrder: 30
    }
  },
  children: [
    {
      path: 'overview',
      name: 'RuntimeOverview',
      component: () => import('@/views/runtime/overview/RuntimeOverviewPage.vue'),
      meta: {
        requiresAuth: true,
        title: '运行总览',
        permission: BIZ_PERMISSIONS.workline.page,
        menu: {
          name: 'runtime:overview:menu',
          parentName: 'runtime:system:menu',
          icon: 'ep:data-board',
          sortOrder: 1
        }
      }
    },
    {
      path: 'monitor',
      name: 'RuntimeMonitor',
      component: () => import('@/views/runtime/worklines/WorklineMonitorPage.vue'),
      meta: {
        requiresAuth: true,
        title: '工作线监控',
        permission: BIZ_PERMISSIONS.workline.page,
        menu: {
          name: 'runtime:monitor:menu',
          parentName: 'runtime:system:menu',
          icon: 'ep:share',
          sortOrder: 2
        }
      }
    },
    {
      path: 'traces',
      name: 'RuntimeTraces',
      component: () => import('@/views/runtime/traces/TraceExplorerPage.vue'),
      meta: {
        requiresAuth: true,
        title: 'Trace 追溯',
        permission: BIZ_PERMISSIONS.workline.page,
        menu: {
          name: 'runtime:traces:menu',
          parentName: 'runtime:system:menu',
          icon: 'ep:search',
          sortOrder: 3
        }
      }
    },
    ...(env.isNonProd
      ? [
          {
            path: 'integration-debug',
            name: 'RuntimeIntegrationDebug',
            component: () => import('@/views/runtime/integration-debug/IntegrationDebugPage.vue'),
            meta: {
              requiresAuth: true,
              title: '集成调试',
              permission: BIZ_PERMISSIONS.workline.page,
              menu: {
                name: 'runtime:integration-debug:menu',
                parentName: 'runtime:system:menu',
                icon: 'ep:connection',
                sortOrder: 4
              }
            }
          }
        ]
      : []),
    {
      path: 'holds',
      name: 'RuntimeHolds',
      component: () => import('@/views/runtime/holds/HoldListPage.vue'),
      meta: {
        requiresAuth: true,
        title: 'Hold 处置',
        permission: BIZ_PERMISSIONS.workline.viewRuntimeHold,
        menu: {
          name: 'runtime:holds:menu',
          parentName: 'runtime:system:menu',
          icon: 'ep:warn-triangle-filled',
          sortOrder: 5
        }
      }
    },
    {
      path: 'holds/:holdId',
      name: 'RuntimeHoldDetail',
      component: () => import('@/views/runtime/holds/RuntimeHoldPage.vue'),
      meta: {
        requiresAuth: true,
        title: 'Hold 详情',
        permission: BIZ_PERMISSIONS.workline.viewRuntimeHold,
        menu: {
          name: 'runtime:hold:detail',
          hidden: true
        }
      }
    },
    {
      path: 'sandbox',
      name: 'RuntimeSandbox',
      component: () => import('@/views/runtime/sandbox/RuntimeSandboxPage.vue'),
      meta: {
        requiresAuth: true,
        title: '沙箱测试',
        permission: BIZ_PERMISSIONS.workline.update,
        menu: {
          name: 'runtime:sandbox:menu',
          parentName: 'runtime:system:menu',
          icon: 'ep:tools',
          sortOrder: 6
        }
      }
    },
    {
      path: 'sandbox/:worklineId',
      name: 'RuntimeSandboxWorkbench',
      component: () => import('@/views/runtime/sandbox/SandboxWorkbenchPage.vue'),
      meta: {
        requiresAuth: true,
        title: '沙箱工作台',
        permission: BIZ_PERMISSIONS.workline.update,
        menu: {
          name: 'runtime:sandbox:workbench',
          hidden: true
        }
      }
    },
    {
      path: 'devices',
      name: 'RuntimeDevices',
      component: () => import('@/views/runtime/devices/DeviceRuntimePage.vue'),
      meta: {
        requiresAuth: true,
        title: '设备运行时',
        permission: BIZ_PERMISSIONS.device.page,
        menu: {
          name: 'runtime:devices:menu',
          parentName: 'runtime:system:menu',
          icon: 'ep:cpu',
          sortOrder: 7
        }
      }
    }
  ]
}
